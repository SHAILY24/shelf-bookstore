# Shelf: a bookstore app

Built by Shaily. [GitHub](https://github.com/SHAILY24)

A full-stack e-commerce bookstore: browse a catalog, add to cart, and check out with Stripe. It has user accounts, a REST API, and a responsive React frontend.

## Notes

A bookstore is enough surface area to hit the parts of e-commerce that actually matter, so that is what this builds out:

- **Payment processing**: Stripe handles the real checkout flow, in test mode here.
- **Security tooling**: secret scanning and static analysis run before code lands.
- **Deployment config**: set up to run on Railway/Render and Vercel/Netlify.
- **Split frontend and backend**: React app and FastAPI service are separate.
- **Current dependency versions**: stable releases across the stack.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for the dev server and build
- **Material UI** for the component library
- **Zustand** for state management
- **React Router v6** for client-side routing
- **Axios** for API calls
- **Stripe.js** for the payment widget

### Backend
- **FastAPI** for the Python API
- **SQLAlchemy** ORM, SQLite in development
- **Pydantic** for request/response validation
- **JWT** authentication
- **Passlib + bcrypt** for password hashing
- **Uvicorn** ASGI server
- **Stripe Python SDK** for the payment backend

### Security & DevOps
- **Gitleaks** blocks committed secrets
- **Bandit** scans the Python code
- **ESLint Security** checks the JavaScript
- **GitHub Actions** runs the scans on push
- **Pre-commit hooks** catch issues locally first

## Quick Demo

### Demo Account
A test account is seeded:
- Email: `test@example.com`
- Password: `password123`

### Testing Payments
Stripe runs in test mode, so the checkout flow is safe to try:
- Success Payment: `4242 4242 4242 4242`
- Card Decline: `4000 0000 0000 0002`
- 3D Secure Check: `4000 0025 0000 3155`

(Use any future date for expiry and any 3 digits for CVC)

## Getting Started

### Prerequisites

You will need:
- **Node.js** (v18 or higher) and **Yarn**
- **Python** (3.9 or higher) and **pip**
- **Git** for version control
- A **Stripe account** (free to create)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SHAILY24/shelf-bookstore.git
   cd shelf-bookstore
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Stripe keys:
   - Get your keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - You only need test keys for development

4. **Initialize the database**
   ```bash
   python init_db.py
   ```

5. **Set up the frontend**
   ```bash
   cd ../frontend
   yarn install
   cp .env.example .env
   ```
   Add your Stripe publishable key to the frontend `.env`

### Running the Application

Start both servers in separate terminals:

**Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 4242
```
The API will be available at http://localhost:4242/docs

**Frontend (Terminal 2):**
```bash
cd frontend
yarn dev
```
Open http://localhost:5173 in your browser

## Features

### For Customers
- **Browse Books**: Search and filter through a curated collection
- **User Accounts**: Register, login, and manage your profile
- **Shopping Cart**: Add books, update quantities, save for later
- **Wishlist**: Save books you want to read
- **Secure Checkout**: Complete purchases with Stripe
- **Order History**: Track all your past orders

### For Developers
- **REST API**: documented endpoints via FastAPI
- **Type checks**: TypeScript on the frontend, Pydantic on the backend
- **Authentication**: JWT with refresh tokens
- **Database migrations**: Alembic for schema changes
- **Error handling**: structured error responses
- **Logging**: structured logs
- **Tests**: unit and integration tests

## Project Structure

```
shelf-bookstore/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API integration
│   │   ├── store/        # Zustand state management
│   │   └── types/        # TypeScript definitions
│   └── package.json
│
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core functionality
│   │   ├── crud/         # Database operations
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   └── requirements.txt
│
└── .github/
    └── workflows/         # CI/CD pipelines
```

## Security

Each commit runs through a few checks:

1. **Pre-commit hooks**: scan for secrets before a commit lands
2. **CI pipeline**: security scans on every push
3. **Dependency scanning**: checks for vulnerable packages
4. **Code analysis**: static analysis for known issues

Read the full [Security Policy](SECURITY.md) for details.

## API Documentation

The backend provides interactive API documentation:
- **Swagger UI**: http://localhost:4242/docs
- **ReDoc**: http://localhost:4242/redoc

Key endpoints:
- `POST /api/v1/auth/register` creates an account
- `POST /api/v1/auth/login` authenticates a user
- `GET /api/v1/auth/me` returns the current user
- `POST /api/v1/stripe/create-checkout-session` starts a payment
- `GET /api/v1/orders/me` lists the user's orders

## Deployment

### Backend Deployment (Railway/Render)
1. Set environment variables in your platform
2. Update `DATABASE_URL` to use PostgreSQL
3. Run migrations on deployment
4. Set up Stripe webhooks

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `yarn build`
3. Set publish directory: `dist`
4. Add environment variables

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@host/db
SECRET_KEY=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-frontend.com
```

**Frontend (.env):**
```
VITE_API_BASE_URL=https://your-api.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Contributing

Contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run security checks (`./run-security-scan.sh`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please make sure to:
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Pass all security checks

## Testing

Run the test suites:

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
yarn test

# Security scan
./run-security-scan.sh
```

## Troubleshooting

### Common Issues

**CORS errors?**
- Make sure `FRONTEND_URL` is set correctly in backend `.env`

**Database errors?**
- Run `python reset_db.py` to reset the database
- Check that SQLite file has proper permissions

**Stripe webhooks not working locally?**
- Use Stripe CLI: `stripe listen --forward-to localhost:4242/api/v1/stripe/webhook`
- Or use ngrok to expose your local server

**Module not found errors?**
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## Performance

Rough numbers:
- Frontend bundle size: ~250KB gzipped
- API response time: <50ms average
- Database queries: indexed
- Caching: used where it helps

## Roadmap

Things I might add next:

- [ ] Add book recommendations based on purchase history
- [ ] Implement book reviews and ratings
- [ ] Add admin panel for inventory management
- [ ] Support for multiple payment methods
- [ ] Email notifications for orders
- [ ] Mobile app using React Native
- [ ] GraphQL API option
- [ ] Internationalization support

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

**Shaily**, [GitHub](https://github.com/SHAILY24)

Questions about the project are welcome.

## Acknowledgments

- The React and FastAPI docs
- Stripe for the payment APIs
- Open Library API for book data
- The open source tools this depends on