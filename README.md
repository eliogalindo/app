# Full-Stack Admin Dashboard

A modern, multi-language admin dashboard built with **Next.js 16** and **HeroUI 2.8.9**. This application features role-based access control, user management, real-time notifications, and comprehensive audit logging.

## ✨ Features

- **Authentication & Authorization**
  - Sign-in, sign-up, and password reset flows
  - Email verification with code-based validation
  - Role-based access control (RBAC)
  - Secure session management

- **Admin Panel**
  - User management (create, edit, view, delete)
  - Role management with permission assignment
  - Activity tracing and audit logs
  - Real-time notifications

- **Internationalization (i18n)**
  - Multi-language support (English, Spanish)
  - Dynamic locale switching
  - Server-side and client-side rendering

- **User Interface**
  - Responsive design with Tailwind CSS
  - HeroUI component library
  - Dark/light theme support
  - Custom icons with Tabler Icons
  - Loading states and skeletons

- **Real-time Communication**
  - SignalR WebSocket support for notifications
  - Live notification streaming

## 🛠️ Tech Stack

### Frontend Framework

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### UI & Styling

- **HeroUI 2.8** - Modern component library
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion** - Animations
- **Tabler Icons** - Icon library

### State Management & Forms

- **Zustand** - Lightweight state management
- **Formik** - Form management
- **Yup** - Schema validation

### Internationalization

- **next-intl** - i18n for Next.js
- **intl-messageformat** - Message formatting

### Other Libraries

- **next-themes** - Theme management
- **Microsoft SignalR** - Real-time communication
- **dayjs** - Date manipulation
- **crypto-js** - Encryption utilities
- **country-flag-icons** - Country flags

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
├── app/                      # Next.js App Router
│   └── [locale]/            # i18n locale routes
│       ├── (auth)/          # Authentication pages
│       ├── admin/           # Admin dashboard
│       │   ├── users/       # User management
│       │   ├── roles/       # Role management
│       │   ├── traces/      # Activity logs
│       │   └── notifications/ # Notifications
│       └── providers.tsx    # Client providers
├── components/              # React components
│   ├── auth/               # Auth forms
│   ├── admin/              # Admin components
│   └── ui/                 # Shared UI components
├── config/                 # Configuration
├── constants/              # Constants
├── enums/                  # TypeScript enums
├── helpers/                # Utility functions
├── hooks/                  # Custom React hooks
├── i18n/                   # i18n configuration
├── interfaces/             # TypeScript interfaces
├── messages/               # Translation files
├── schemas/                # Validation schemas
├── services/               # API services
├── stores/                 # Zustand stores
├── styles/                 # Global styles
├── types/                  # Type definitions
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (or compatible version)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Configure the following variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SIGNALR_URL` - SignalR server URL
- Other API credentials and endpoints

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## 🌐 Supported Languages

- 🇺🇸 English (en-US)
- 🇪🇸 Spanish (es-ES)

Language files are located in the `messages/` directory.

## 🔒 Authentication Flow

1. **Sign Up** - User registration with email verification
2. **Verify Email** - Email verification code validation
3. **Sign In** - Login with credentials
4. **Reset Password** - Password recovery flow
5. **Account Verification** - Additional account verification if needed

## 👥 Role-Based Access Control

Users can be assigned different roles with specific permissions:

- View roles and their permissions in the admin panel
- Add, edit, or delete roles
- Assign permissions to roles
- View user roles and permissions

## 📊 Admin Features

### User Management

- View all users with search and filtering
- Add new users
- Edit user information
- View detailed user profiles
- Manage user status

### Role Management

- Create and edit roles
- Assign permissions to roles
- View role permissions
- Delete roles

### Activity Tracking

- View user activity traces
- Filter and search through logs
- Monitor system actions

### Notifications

- Real-time notification updates
- Notification history
- Mark as read functionality

## 🧪 Testing

> Testing setup to be configured

## 📝 License

See [LICENCE](./LICENCE) file for details.

---

**Last Updated:** February 24, 2026

## Getting Started

First, run npm install,

```bash
npm install
```

and then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
