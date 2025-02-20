import os
import stripe
import math
import logging
import json

from fastapi import APIRouter, Request, Depends, HTTPException, status
from pydantic import BaseModel, Field, HttpUrl, field_validator, conint, confloat
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.api import deps
from app.models import User
from app import crud, schemas

router = APIRouter()

stripe.api_key = settings.STRIPE_SECRET_KEY

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for request validation
class CartItem(BaseModel):
    id: str
    quantity: conint(gt=0) # Quantity must be positive integer
    title: str
    price: confloat(ge=0.01) # Price must be positive
    description: Optional[str] = None
    imageUrl: Optional[HttpUrl] = None

class CheckoutRequest(BaseModel):
    items: List[CartItem]

class CheckoutResponse(BaseModel):
    sessionId: str

@router.post("/create-checkout-session", 
             response_model=CheckoutResponse,
             summary="Create a Stripe Checkout Session",
             description="Accepts a list of cart items and creates a Stripe Checkout Session. Returns the session ID, which the frontend uses to redirect the user to Stripe. Creates a corresponding Order in the database with 'pending' status.")
async def create_checkout_session(
    checkout_request: CheckoutRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db)
) -> dict:
    """
    Creates a Stripe Checkout session based on the provided cart items.
    """
    cart_items = checkout_request.items
    logger.info(f"Received cart items for checkout: {[item.model_dump() for item in cart_items]}")

    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )

    line_items = []
    total_amount = 0
    
    for item in cart_items:
        try:
            # Stripe requires price in cents (integer)
            # Use ceil to avoid issues with floating point inaccuracies and ensure minimum price
            price_in_cents = math.ceil(item.price * 100)
            if price_in_cents < 50: # Stripe minimum is usually $0.50 USD
                logger.warning(f"Item price for {item.title} ({price_in_cents} cents) is below Stripe minimum, adjusting to 50 cents.")
                price_in_cents = 50 

            product_data = {
                'name': item.title,
                'description': item.description or 'No description provided',
            }
            if item.imageUrl:
                product_data['images'] = [str(item.imageUrl)]

            # Add to total amount (in dollars)
            total_amount += (price_in_cents / 100) * item.quantity

            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': product_data,
                    'unit_amount': price_in_cents,
                },
                'quantity': item.quantity,
            })
        except Exception as e:
            logger.error(f"Error processing item {item.id} ({item.title}): {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error processing item: {item.title}"
            )

    logger.info(f"Prepared line_items for Stripe: {line_items}")

    frontend_url = settings.FRONTEND_URL
    success_url = f"{frontend_url}/order/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{frontend_url}/order/cancel"

    logger.info(f"Creating session with Success URL: {success_url} and Cancel URL: {cancel_url}")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            # Associate checkout with the current user
            client_reference_id=str(current_user.id),
            customer_email=current_user.email,
        )
        logger.info(f"Successfully created Stripe session: {checkout_session.id}")
        
        # Save initial order in database
        order_details = json.dumps([item.model_dump(mode='json') for item in cart_items])
        order_in = schemas.OrderCreate(
            user_id=current_user.id,
            amount=total_amount,
            stripe_session_id=checkout_session.id,
            order_details=order_details
        )
        
        # Create the order
        crud.order.create(db, obj_in=order_in)
        logger.info(f"Created order for user {current_user.id} with session {checkout_session.id}")
        
        return {'sessionId': checkout_session.id}

    except stripe.error.StripeError as e:
        logger.error(f"Stripe API error: {e}")
        user_message = getattr(e, 'user_message', str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Stripe error: {user_message}"
        )
    except Exception as e:
        logger.error(f"Error creating checkout session: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred creating the checkout session."
        )

# Stripe requires a webhook secret for verification
# Add STRIPE_WEBHOOK_SECRET to your .env file
stripe_webhook_secret = settings.STRIPE_WEBHOOK_SECRET

@router.post("/webhook", 
             include_in_schema=False, # Keep hidden from user-facing docs
             summary="Stripe Webhook Handler (Internal)",
             description="Receives events from Stripe (e.g., checkout completed, payment failed) and updates the corresponding order status in the database. This endpoint is called by Stripe, not directly by the frontend.")
async def stripe_webhook(
    request: Request, 
    db: Session = Depends(deps.get_db)
): 
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, stripe_webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        logger.error(f"Webhook error: Invalid payload - {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        logger.error(f"Webhook error: Invalid signature - {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        stripe_session_id = session.get('id')
        logger.info(f"Webhook received: checkout.session.completed for {stripe_session_id}")

        # Find the order associated with this session
        order = crud.order.get_by_stripe_session_id(db, stripe_session_id=stripe_session_id)
        if order:
            if order.status == 'pending': # Only update if it's still pending
                logger.info(f"Updating order {order.id} status to completed")
                crud.order.update(db, db_obj=order, obj_in=schemas.OrderUpdate(status="completed"))
            else:
                logger.warning(f"Order {order.id} already has status {order.status}, ignoring webhook.")
        else:
            logger.error(f"Order not found for session ID: {stripe_session_id}")
    
    elif event['type'] == 'checkout.session.async_payment_failed':
        session = event['data']['object']
        stripe_session_id = session.get('id')
        logger.info(f"Webhook received: checkout.session.async_payment_failed for {stripe_session_id}")
        order = crud.order.get_by_stripe_session_id(db, stripe_session_id=stripe_session_id)
        if order and order.status == 'pending':
            logger.info(f"Updating order {order.id} status to failed")
            crud.order.update(db, db_obj=order, obj_in=schemas.OrderUpdate(status="failed"))
        # Handle other potential failure/cancellation events if needed
    
    # ... handle other event types as needed ...

    else:
        logger.info(f"Unhandled event type {event['type']}")

    return {"status": "success"} 