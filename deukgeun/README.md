<div align="center">

# Deukgeun

> **Enterprise-grade Fitness Community Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

**A comprehensive fitness platform designed for gym enthusiasts**  
Providing machine guides, workout goal management, community features, and location-based services.

[Documentation](#-documentation) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Contributing](#-contributing)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Deukgeun** is a full-stack fitness community platform built with modern web technologies. The platform enables users to discover gym equipment, manage workout goals, track progress, and engage with a community of fitness enthusiasts.

### Project Statistics

```
📦 Repository Size: ~500+ files
🔧 Technology Stack: TypeScript, React, Node.js, Express, MySQL
📚 Documentation: Comprehensive guides and API documentation
🚀 Deployment: AWS EC2 with PM2 process management
🔒 Security: JWT authentication, bcrypt hashing, multi-factor recovery
```

### Core Capabilities

- **Machine Guide System**: Comprehensive database of gym equipment with detailed usage instructions
- **Workout Management**: Goal-based workout planning with automatic section generation
- **Progress Tracking**: Real-time statistics and analytics with visual charts
- **Community Platform**: User-generated content sharing and Q&A system
- **Location Services**: Integrated gym finder with Kakao Map API
- **Gamification**: Level system with XP, achievements, and streak tracking

---

## ✨ Key Features

### 🏋️ Workout Management

| Feature | Description |
|---------|-------------|
| **Machine Guide** | Detailed equipment usage instructions with video tutorials |
| **Goal Management** | Personalized workout plans with progress tracking |
| **Workout Journal** | Comprehensive exercise logging with statistical analysis |
| **Auto Section Generation** | AI-powered workout section creation based on user goals |

### 🌐 Community

| Feature | Description |
|---------|-------------|
| **Tip Sharing** | User-generated fitness tips and experiences |
| **Q&A Board** | Community-driven question and answer system |
| **Categorized Forums** | Topic-based discussions (routines, tips, diet) |
| **Social Interaction** | Like, comment, and share functionality |

### 📍 Location Services

| Feature | Description |
|---------|-------------|
| **Gym Finder** | Nearby gym search with filtering options |
| **Kakao Map Integration** | Accurate location data with navigation |
| **Gym Information** | Operating hours, facilities, and detailed info |
| **Real-time Updates** | Automated data synchronization |

### 🏆 Gamification System

| Feature | Description |
|---------|-------------|
| **XP System** | Experience points earned through activities |
| **Level Progression** | Level-up system with rewards |
| **Achievements** | Unlockable badges and milestones |
| **Streak Tracking** | Consecutive activity monitoring |
| **Season System** | Periodic resets for sustained engagement |

### 🔐 Security & Authentication

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure token-based authentication |
| **Multi-factor Recovery** | Step-by-step account recovery (name, phone, email) |
| **Security Tokens** | Time-limited OTP for account recovery |
| **Email Notifications** | Automated security code delivery |
| **Password Hashing** | bcrypt encryption for user credentials |

---

## 🛠️ Technology Stack

### Frontend

<div align="center">

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 18.2.0 | UI Framework |
| **Language** | TypeScript | 5.2.2 | Type Safety |
| **Build Tool** | Vite | 5.0.0 | Build System |
| **Styling** | Tailwind CSS | 3.4.0 | Utility-first CSS |
| **State Management** | Zustand | 4.4.7 | Lightweight State |
| **State Management** | Redux Toolkit | 2.9.1 | Global State |
| **Routing** | React Router | 6.20.1 | Client-side Routing |
| **Charts** | Recharts | 3.3.0 | Data Visualization |
| **Icons** | Lucide React | 0.294.0 | Icon Library |

</div>

### Backend

<div align="center">

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript Runtime |
| **Framework** | Express | 5.1.0 | Web Framework |
| **ORM** | TypeORM | 0.3.26 | Object-Relational Mapping |
| **Database** | MySQL | 8.0+ | Relational Database |
| **Authentication** | JWT | 9.0.2 | Token-based Auth |
| **Security** | bcrypt | 6.0.0 | Password Hashing |
| **Email** | Nodemailer | 6.9.7 | Email Service |
| **Validation** | Zod | 3.25.76 | Schema Validation |

</div>

### DevOps & Infrastructure

```
🔄 Process Management: PM2
🌐 Web Server: Nginx (Reverse Proxy)
🐳 Containerization: Docker (In Progress)
📊 Monitoring: Winston Logger
🔍 Code Quality: ESLint + Prettier
🧪 Testing: Jest + Vitest
☁️  Cloud: AWS EC2
```

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   React SPA  │  │  Tailwind UI │  │  State Mgmt  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Express    │  │  TypeORM     │  │  Middleware  │    │
│  │   Server     │  │  ORM         │  │  (Auth/CORS) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    MySQL     │  │  File System │  │  External    │    │
│  │  Database    │  │  (Static)    │  │  APIs        │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Application Flow

```
User Request
    │
    ├─► Authentication Middleware (JWT)
    │
    ├─► Route Handler
    │
    ├─► Controller Layer
    │
    ├─► Service Layer (Business Logic)
    │
    ├─► Repository Layer (TypeORM)
    │
    └─► Database (MySQL)
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.0.0
- **MySQL** >= 8.0
- **Git** >= 2.0
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/LeeJaeHyekk/deukgeun_ReactProject.git
cd deukgeun_ReactProject/deukgeun

# Install dependencies
npm install
cd src/backend && npm install && cd ../..

# Configure environment variables
cp env.example .env
cp env.example src/backend/.env

# Edit .env files with your configuration
# Required variables:
# - Database connection (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
# - JWT secret (JWT_SECRET)
# - Email service (SMTP configuration)
# - CORS origins (CORS_ORIGIN)
```

### Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE deukgeun_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Sync database schema
npm run db:sync

# Seed initial data
npm run db:seed
```

### Running the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run dev:frontend  # Frontend only (http://localhost:5173)
npm run dev:backend   # Backend only (http://localhost:5000)
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs (if available)

### Test Credentials

```
Email: user1@test.com
Password: user123!
```

---

## 📁 Project Structure

```
deukgeun/
│
├── src/
│   ├── frontend/                 # React frontend application
│   │   ├── features/            # Feature-based modules
│   │   │   ├── workout/        # Workout management
│   │   │   ├── machine-guide/  # Equipment guide
│   │   │   ├── community/      # Community features
│   │   │   └── admin/          # Admin dashboard
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage/       # Landing page
│   │   │   ├── login/          # Authentication pages
│   │   │   ├── MyPage/         # User profile
│   │   │   └── location/       # Gym finder
│   │   ├── shared/             # Shared components & utilities
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── store/          # State management
│   │   │   ├── utils/          # Utility functions
│   │   │   └── types/          # TypeScript types
│   │   └── App.tsx             # Main application component
│   │
│   ├── backend/                 # Express backend application
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic layer
│   │   ├── routes/             # API route definitions
│   │   ├── middlewares/        # Express middlewares
│   │   │   ├── auth.ts         # Authentication middleware
│   │   │   ├── errorHandler.ts # Error handling
│   │   │   └── validator.ts    # Request validation
│   │   ├── entities/           # TypeORM entities
│   │   ├── repositories/       # Data access layer
│   │   ├── config/             # Configuration files
│   │   ├── utils/              # Utility functions
│   │   └── app.ts              # Express app setup
│   │
│   └── shared/                 # Shared code between frontend/backend
│       ├── types/              # Shared TypeScript types
│       ├── constants/          # Shared constants
│       └── utils/              # Shared utilities
│
├── docs/                       # Project documentation
│   ├── 00_database/           # Database documentation
│   ├── 00_deployment/          # Deployment guides
│   ├── 01_getting-started/    # Getting started guides
│   └── ...
│
├── scripts/                    # Build and deployment scripts
│   ├── build-optimized.ts     # Production build script
│   └── ...
│
├── public/                     # Static assets
│   ├── img/                   # Images
│   ├── video/                 # Video files
│   └── fonts/                 # Font files
│
├── dist/                       # Build output directory
│
├── .env                        # Environment variables (not in git)
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

---

## 💻 Development

### Available Scripts

#### Development

```bash
npm run dev                    # Run frontend + backend concurrently
npm run dev:frontend           # Run frontend only (Vite dev server)
npm run dev:backend            # Run backend only (Express server)
```

#### Building

```bash
npm run build                  # Build frontend for production
npm run build:backend          # Build backend TypeScript
npm run build:full             # Build both frontend and backend
npm run build:production       # Production build with optimizations
```

#### Database

```bash
npm run db:sync                # Sync database schema
npm run db:seed                # Seed database with initial data
npm run db:reset               # Reset and reseed database
npm run db:check               # Check database connection
```

#### Code Quality

```bash
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint errors
npm run type-check             # TypeScript type checking
npm run format                 # Format code with Prettier
npm run format:check           # Check code formatting
```

#### Deployment

```bash
npm run pm2:start              # Start application with PM2
npm run pm2:stop               # Stop PM2 processes
npm run pm2:restart            # Restart PM2 processes
npm run deploy:ec2             # Deploy to AWS EC2
```

### Development Guidelines

1. **TypeScript**: All code must be properly typed
2. **Code Style**: Follow ESLint and Prettier configurations
3. **Commits**: Use conventional commit messages
4. **Testing**: Write tests for new features
5. **Documentation**: Update docs when adding features

### Environment Variables

Key environment variables required:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=deukgeun_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5000

# Email (for account recovery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

---

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Getting Started](docs/01_getting-started/01_PROJECT_OVERVIEW.md)**: Project overview and setup guide
- **[Database Guide](docs/00_database/DATABASE_COMPLETE_GUIDE.md)**: Database schema and migration guide
- **[Deployment Guide](docs/00_deployment/DEPLOYMENT_CHECKLIST.md)**: Production deployment instructions
- **[Security](docs/00_security/)**: Security best practices and configuration
- **[Testing](docs/05_testing/)**: Testing strategies and examples
- **[API Documentation](docs/)**: API endpoint documentation

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Contribution Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- ✅ Use TypeScript for type safety
- ✅ Follow ESLint and Prettier configurations
- ✅ Write tests for new features
- ✅ Update documentation as needed
- ✅ Use conventional commit messages

### Reporting Issues

If you find a bug or have a feature request, please [open an issue](https://github.com/LeeJaeHyekk/deukgeun_ReactProject/issues) with:

- Clear description of the problem
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

- **GitHub Issues**: [Report an issue](https://github.com/LeeJaeHyekk/deukgeun_ReactProject/issues)
- **Repository**: [deukgeun_ReactProject](https://github.com/LeeJaeHyekk/deukgeun_ReactProject)

---

<div align="center">

**Built with ❤️ by [LeeJaeHyekk](https://github.com/LeeJaeHyekk)**

[⬆ Back to Top](#deukgeun)

</div>
