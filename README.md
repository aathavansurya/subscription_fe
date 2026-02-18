# SubTrack - Subscription Management App

A modern, mobile-first subscription management application built with React, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Secure JWT-based authentication
- **Dashboard**: Overview with statistics and overdue alerts
- **Product Management**: Create and manage subscription products
- **Customer Management**: Manage customers and link to products
- **Payment Tracking**: Track monthly payments with status
- **Overdue Detection**: Automatic highlighting of overdue payments
- **Statistics**: Visual charts and analytics
- **Mobile-First**: Responsive design with bottom navigation
- **Smooth Animations**: Framer Motion powered transitions

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Recharts
- Axios
- React Router DOM

## Project Structure

```
src/
├── components/      # Reusable UI components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API services
├── types/           # TypeScript types
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Pages

- **Login** - Authentication page with login/register tabs
- **Dashboard** - Overview with stats, overdue alerts, and quick actions
- **Products** - Manage subscription products
- **Customers** - Manage customers and link to products
- **Payments** - Track and manage monthly payments
- **Statistics** - Charts and analytics

## Key Features

### Mobile-First Design
- Responsive layout that works on all devices
- Bottom navigation for mobile users
- Touch-friendly interactions

### Smooth Animations
- Page transitions with Framer Motion
- Animated number counters
- Card hover effects
- Loading skeletons

### Data Visualization
- Monthly revenue comparison charts
- Paid vs Unpaid pie charts
- Product-wise revenue bars
- Animated statistics cards

### Overdue Detection
- Automatic detection of unpaid previous month payments
- Highlighted alert section on dashboard
- Quick actions to mark payments as paid

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:5000/api |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
