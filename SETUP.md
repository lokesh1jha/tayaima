# Kirana Store - E-commerce Setup Guide

## 🚀 Quick Start

### Option 1: With Docker (Recommended)

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Start Database with Docker
```bash
# Start PostgreSQL database
npm run docker:db

# Or start database + pgAdmin for management
npm run docker:full
```

#### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database (Docker)
DATABASE_URL="postgresql://kirana_user:kirana_password@localhost:5433/kiranastore"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# PhonePe Payment (Optional)
PHONEPE_API_KEY="your-phonepe-api-key"
PHONEPE_MERCHANT_ID="your-phonepe-merchant-id"
```

#### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

#### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your e-commerce store!

### Option 2: Traditional Setup (Without Docker)

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Install PostgreSQL
Install PostgreSQL on your system and create a database named `kiranastore`.

#### 3. Environment Setup
Create a `.env.local` file with your PostgreSQL connection:

```env
# Database (Local PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/kiranastore"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# PhonePe Payment (Optional)
PHONEPE_API_KEY="your-phonepe-api-key"
PHONEPE_MERCHANT_ID="your-phonepe-merchant-id"
```

#### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

#### 5. Start Development Server
```bash
npm run dev
```


## 🔑 Default Admin Account

After seeding the database, you can login with:
- **Email:** admin@kiranastore.com
- **Password:** admin123

## 📱 Features Implemented

### Customer Features
- ✅ Product catalog with search and filtering
- ✅ Product detail pages with variants
- ✅ Shopping cart functionality
- ✅ Checkout process with order placement
- ✅ Order tracking and history
- ✅ User dashboard
- ✅ Responsive design

### Admin Features
- ✅ Admin dashboard with analytics
- ✅ Product management (CRUD)
- ✅ Order management with status updates
- ✅ Customer management
- ✅ Analytics and reporting
- ✅ Settings configuration

### Technical Features
- ✅ Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Prisma ORM with PostgreSQL
- ✅ NextAuth.js authentication
- ✅ Role-based access control
- ✅ Responsive UI with Tailwind CSS
- ✅ Dark mode support

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
- `npm run docker:db:down` - Stop database
- `npm run docker:db:logs` - View database logs
- `npm run docker:pgadmin` - Start pgAdmin
- `npm run docker:full` - Start database + pgAdmin
- `npm run docker:build` - Build application Docker image
- `npm run docker:run` - Run application in Docker

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   └── orders/            # Order pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── AdminSidebar.tsx  # Admin navigation
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   └── guards.ts        # Auth guards
└── types/               # TypeScript type definitions
```

## 🎯 Next Steps

### Phase 2: Enhanced Features
- [ ] Real-time analytics with charts
- [ ] Email notifications
- [ ] Inventory management
- [ ] Coupon/discount system
- [ ] Product categories
- [ ] Image upload functionality

### Phase 3: Advanced Features
- [ ] Complete PhonePe integration
- [ ] Push notifications
- [ ] Customer support system
- [ ] Advanced search and filters
- [ ] Wishlist functionality
- [ ] Product reviews and ratings

### Phase 4: Production Ready
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Error monitoring
- [ ] Backup strategies
- [ ] Security hardening
- [ ] Load testing

## 🚨 Important Notes

1. **Database**: Make sure PostgreSQL is running and accessible
2. **Environment Variables**: All required environment variables must be set
3. **Admin Access**: Use the seeded admin account to access admin features
4. **Payment Integration**: PhonePe integration is placeholder - implement real payment processing
5. **Image Storage**: Currently using placeholder images - implement proper image storage

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in .env.local
   - Run `npm run prisma:migrate`

2. **Authentication Issues**
   - Check NEXTAUTH_SECRET is set
   - Verify NEXTAUTH_URL matches your domain
   - Clear browser cookies and try again

3. **Build Errors**
   - Run `npm run prisma:generate`
   - Check for TypeScript errors
   - Verify all dependencies are installed

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the code comments and documentation
3. Check the GitHub issues (if applicable)

## 🎉 You're Ready!

Your e-commerce store is now set up and ready for development. Start by exploring the admin panel and adding your products!
