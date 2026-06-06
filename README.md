# Premium Card Betting Game

A complete, secure, production-grade real-money card betting application.

## Game Rules
- **Objective**: Bet on the card you think will have the **lowest total bet amount** in a given hour.
- **Cycle**: Bets are accepted from HH:00 to HH:50.
- **Winning**: The card with the lowest cumulative bets wins.
- **Payout**: Winners receive **50x** their original stake.
- **Tie-Breaker**: If multiple cards have the same lowest amount, the winner is picked based on the system setting (Random or Rank/Suit Order).
- **Admin Override**: Admins can manually declare a winner within 10 minutes of the hour closing (HH:00 to HH:10).

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Vite, Socket.IO Client, Framer Motion.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, node-cron.
- **Payments**: Razorpay integration.
- **Security**: JWT, bcrypt, Rate Limiting, Atomic Wallet operations.

## Setup Instructions

### 1. Environment Configuration
Create `.env` files in both `backend/` and `frontend/` based on the `.env.example` files provided.

### 2. Installation
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Database Seeding
```bash
cd ../backend
npm run seed
```
This creates:
- Admin user: `admin@example.com` / `Admin@123`
- Demo user: `user@example.com` / `User@123`
- Default game settings.

### 4. Running the Application
**Development Mode:**
```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

**Using Docker:**
```bash
docker-compose up --build
```

## Testing Scenarios
1. **Bet Placement**: Verify that bets are rejected after HH:50.
2. **Result Processing**: Check that the winner is correctly identified as the card with the lowest total bet.
3. **Wallet Security**: Attempt to place a bet larger than the current balance (should be rejected).
4. **Admin Override**: Log in as admin and override a result within the HH:10 window.

## License
MIT
