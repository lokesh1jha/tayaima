# Docker Setup for TaYaima

This guide will help you set up the TaYaima e-commerce application using Docker for the database and optionally the entire application.

## 🐳 Quick Start with Docker

### 1. Start the Database Only

```bash
# Start PostgreSQL database
npm run docker:db

# Check database logs
npm run docker:db:logs

# Stop the database
npm run docker:db:down
```

### 2. Start Database + pgAdmin

```bash
# Start both PostgreSQL and pgAdmin
npm run docker:full

# Access pgAdmin at http://localhost:5050
# Email: admin@tayaima.com
# Password: admin123
```

### 3. Environment Setup

Create a `.env.local` file with the Docker database connection:

```env
# Database (Docker)
DATABASE_URL="postgresql://kirana_user:kirana_password@localhost:5433/kiranastore"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

### 5. Start the Application

```bash
# Start the Next.js development server
npm run dev
```

## 🐳 Full Docker Setup (Optional)

### Build and Run the Entire Application

```bash
# Build the Docker image
npm run docker:build

# Run the application container
npm run docker:run
```

## 📊 Database Management

### pgAdmin Access

When you run `npm run docker:full`, you can access pgAdmin at:
- **URL**: http://localhost:5050
- **Email**: admin@tayaima.com
- **Password**: admin123

### Connect to Database in pgAdmin

1. Open pgAdmin
2. Right-click "Servers" → "Create" → "Server"
3. **General Tab**:
   - Name: `TaYaima DB`
4. **Connection Tab**:
   - Host: `postgres` (or `localhost` if connecting from outside Docker)
   - Port: `5432` (internal Docker port)
   - Database: `kiranastore`
   - Username: `kirana_user`
   - Password: `kirana_password`

## 🔧 Docker Commands Reference

### Database Commands

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Start PostgreSQL + pgAdmin
docker-compose up -d

# View database logs
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Restart database
docker-compose restart postgres
```

### Application Commands

```bash
# Build the application image
docker build -t kirana-store .

# Run the application
docker run -p 3000:3000 kirana-store

# Run with environment variables
docker run -p 3000:3000 -e DATABASE_URL="postgresql://..." kirana-store
```

## 🗂️ Docker Files Structure

```
├── docker-compose.yml      # Database and pgAdmin services
├── Dockerfile             # Application containerization
├── .dockerignore          # Files to ignore in Docker build
├── init.sql              # Database initialization script
└── DOCKER.md             # This documentation
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 5432
   lsof -i :5432
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Database Connection Failed**
   ```bash
   # Check if database is running
   docker-compose ps
   
   # Check database logs
   docker-compose logs postgres
   ```

3. **Permission Issues**
   ```bash
   # Fix volume permissions
   sudo chown -R $USER:$USER .
   ```

4. **Container Won't Start**
   ```bash
   # Remove all containers and volumes
   docker-compose down -v
   docker system prune -a
   
   # Start fresh
   npm run docker:db
   ```

### Database Reset

```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
npm run docker:db

# Run migrations and seed
npm run prisma:migrate
npm run prisma:seed
```

## 🚀 Production Considerations

### Environment Variables

For production, make sure to:

1. Change default passwords
2. Use strong secrets
3. Set up proper SSL certificates
4. Configure proper database backups

### Security

1. **Database Security**:
   - Change default passwords
   - Use strong passwords
   - Restrict network access
   - Enable SSL

2. **Application Security**:
   - Use environment variables for secrets
   - Enable HTTPS
   - Set up proper CORS policies
   - Use secure session secrets

### Monitoring

Consider adding monitoring services to your `docker-compose.yml`:

```yaml
services:
  # ... existing services ...
  
  # Optional: Add monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## 📝 Notes

- The database data persists in Docker volumes
- pgAdmin is optional but helpful for database management
- The application can run outside Docker while using the Docker database
- All database operations (migrations, seeding) are done from the host machine

## 🎉 You're Ready!

Your TaYaima store is now running with Docker! The database is containerized and ready for development.
