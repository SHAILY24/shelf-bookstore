import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, List, ListItem, 
  Divider, Card, CardContent, Chip, CircularProgress,
  Alert
} from '@mui/material';
import { formatInTimeZone } from 'date-fns-tz';
import { getUserOrders, Order } from '../services/api';

// Define a type for items in the order details
interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  author?: string;
  description?: string;
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getUserOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatOrderDetails = (orderDetailsJson: string): OrderItem[] => {
    try {
      const items = JSON.parse(orderDetailsJson);
      return items;
    } catch (e) {
      console.error('Error parsing order details:', e);
      return [];
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Order History
      </Typography>
      
      {orders.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="body1">
            You haven't placed any orders yet.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {orders.map((order) => {
            const orderItems = formatOrderDetails(order.order_details);
            const timeZone = 'America/New_York';
            const orderDateUTC = new Date(order.created_at);
            
            return (
              <Card key={order.id} sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  {/* Header Section: Order Info & Status/Amount */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 2 }}> 
                    <Box> {/* Left Side: Order ID & Date */}
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Order #{order.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatInTimeZone(orderDateUTC, timeZone, 'PPpp')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}> {/* Right Side: Amount & Status */}
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        ${order.amount.toFixed(2)}
                      </Typography>
                      <Chip 
                        label={order.status}
                        color={order.status === 'completed' ? 'success' : 
                               order.status === 'pending' ? 'warning' : 
                               order.status === 'failed' ? 'error' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Divider />

                  <List disablePadding sx={{ mt: 2 }}>
                    {orderItems.map((item: OrderItem, index: number) => (
                      <React.Fragment key={index}>
                        <ListItem disableGutters sx={{ py: 1 }}>
                          {/* Item Row: Image, Details, Price */}
                          <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 40, height: 50, flexShrink: 0 }}> {/* Image */}
                              <Box
                                component="img"
                                sx={{ width: '100%', height: '100%', objectFit: 'contain' }} // Use contain to see whole image
                                src={item.imageUrl || 'https://via.placeholder.com/40x50?text=Book'}
                                alt={item.title}
                              />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}> {/* Title & Quantity */}
                              <Typography variant="body2">
                                {item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', width: 'auto', flexShrink: 0 }}> {/* Total Price */}
                              <Typography variant="body2">
                                ${(item.quantity * item.price).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < orderItems.length - 1 && <Divider component="li" variant="inset" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default OrderHistoryPage; 