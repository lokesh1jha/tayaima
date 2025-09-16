# TaYaima - E-commerce Kirana Store 🏪

A modern, full-featured e-commerce platform built for kirana (neighborhood grocery) stores. Built with Next.js 14, TypeScript, and PostgreSQL.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse products with search and filtering
- **Product Variants**: Multiple sizes, units, and pricing options
- **Shopping Cart**: Add/remove items with persistent cart
- **Checkout Process**: Seamless order placement with multiple payment options
- **Order Tracking**: Real-time order status updates
- **User Dashboard**: Order history and profile management
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode**: Toggle between light and dark themes

### Admin Features
- **Admin Dashboard**: Comprehensive analytics and overview
- **Product Management**: Full CRUD operations for products and variants
- **Order Management**: Process orders, update status, handle cancellations
- **Customer Management**: View and manage customer accounts
- **Category Management**: Organize products into categories
- **Image Management**: Upload and manage product images
- **Analytics**: Sales reports and business insights
- **Settings**: Configure store settings and preferences

### Technical Features
- **Next.js 14**: Latest App Router with server components
- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **NextAuth.js**: Secure authentication with multiple providers
- **Role-based Access**: Admin and customer role separation
- **AWS S3**: Cloud image storage and management
- **Docker Support**: Containerized development and deployment
- **SEO Optimized**: Structured data, meta tags, and sitemap

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with dark mode
- **UI Components**: Custom components with Radix UI primitives
- **Image Storage**: AWS S3 with presigned URLs
- **Payment**: PhonePe integration (configurable)
- **Deployment**: Docker with Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- PostgreSQL (if not using Docker)

### Option 1: Docker Setup (Recommended)

1. **Clone and Install**
```bash
git clone <repository-url>
cd e-commerce-kirana
npm install
```

2. **Start Database**
```bash
# Start PostgreSQL with Docker
npm run docker:db

# Or start database + pgAdmin for management
npm run docker:full
```

3. **Environment Setup**
Create `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://kirana_user:kirana_password@localhost:5433/kiranastore"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3 (for image storage)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET_NAME="your-s3-bucket"

# PhonePe Payment (optional)
PHONEPE_API_KEY="your-phonepe-api-key"
PHONEPE_MERCHANT_ID="your-phonepe-merchant-id"
```

4. **Database Setup**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

### Option 2: Traditional Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions without Docker.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   ├── customers/     # Customer management
│   │   ├── analytics/     # Analytics dashboard
│   │   └── settings/      # Admin settings
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   ├── auth/          # Authentication
│   │   ├── products/      # Product APIs
│   │   ├── orders/        # Order APIs
│   │   ├── cart/          # Cart management
│   │   └── payments/      # Payment processing
│   ├── dashboard/         # User dashboard
│   ├── products/          # Product catalog
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   └── orders/            # Order tracking
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── admin/            # Admin-specific components
│   ├── dashboard/        # Dashboard components
│   ├── Navbar.tsx        # Main navigation
│   ├── Footer.tsx        # Site footer
│   └── ProductCard.tsx   # Product display
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Database client
│   ├── s3.ts            # AWS S3 utilities
│   ├── guards.ts        # Route protection
│   └── validations.ts   # Form validations
├── context/              # React Context providers
│   └── CartContext.tsx   # Shopping cart state
└── types/               # TypeScript definitions
```

## 🗄️ Database Schema

The application uses a comprehensive e-commerce schema:

- **Users**: Customer and admin accounts with role-based access
- **Products**: Flexible product system with variants (size, unit, pricing)
- **Categories**: Product categorization and organization
- **Cart**: Persistent shopping cart with session support
- **Orders**: Complete order lifecycle with status tracking
- **Addresses**: Customer delivery addresses
- **Sessions**: NextAuth session management

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data

### Docker
- `npm run docker:db` - Start PostgreSQL database
- `npm run docker:full` - Start database + pgAdmin
- `npm run docker:build` - Build application Docker image

## 🚀 Deployment

The application is Docker-ready for easy deployment:

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run
```

For production deployment, see [DOCKER.md](./DOCKER.md) for detailed instructions.

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Docker Guide](./DOCKER.md) - Docker deployment guide
- [S3 Setup](./S3_SETUP.md) - AWS S3 configuration
- [Image Storage](./IMAGE_STORAGE_SUMMARY.md) - Image management system
- [Storage Refactor](./STORAGE_REFACTOR_SUMMARY.md) - Storage architecture

## 🔒 Security

- **Authentication**: Secure session-based auth with NextAuth.js
- **Authorization**: Role-based access control (RBAC)
- **Data Validation**: Zod schema validation on all inputs
- **SQL Injection**: Protected by Prisma ORM
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Environment Variables**: Secure configuration management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [troubleshooting section](./SETUP.md#troubleshooting) in SETUP.md
2. Review existing documentation
3. Create an issue with detailed information

---

**TaYaima** - Bringing your neighborhood kirana store online! 🏪✨
