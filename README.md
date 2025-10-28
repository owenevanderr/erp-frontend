# ERP Frontend

A modern Next.js frontend for the ERP system with TypeScript and Tailwind CSS.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Dashboard**: Overview of key metrics and recent activities
- **Inventory Management**: Product management with stock tracking
- **HRM**: Employee management, attendance tracking, and payroll
- **CRM**: Customer relationship management and transaction tracking
- **Accounting**: Financial transactions and reporting
- **Production**: Work order management and production scheduling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

## Default Login

You can register a new account or use the backend's seeded data.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **State Management**: React Context

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── inventory/         # Inventory management
│   ├── hrm/              # Human resource management
│   ├── crm/              # Customer relationship management
│   ├── accounting/       # Accounting and finance
│   ├── production/       # Production management
│   ├── login/            # Login page
│   └── register/         # Registration page
├── components/           # Reusable components
│   ├── auth/            # Authentication components
│   └── layout/          # Layout components
├── contexts/            # React contexts
└── lib/                 # Utility functions and API client
```