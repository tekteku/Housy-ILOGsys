# Environment Setup for Housy Tunisia

## Database Configuration

You need to set the `DATABASE_URL` environment variable to connect to your database.

### Option 1: Local PostgreSQL
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/housy_tunisia
```

### Option 2: Neon Database (Recommended for production)
```bash
DATABASE_URL=postgresql://your_neon_user:your_password@your_endpoint.neon.tech/neondb?sslmode=require
```

## Quick Setup Steps

1. **Create a `.env` file** in the root directory:
```env
DATABASE_URL=postgresql://your_connection_string_here
NODE_ENV=development
```

2. **For local PostgreSQL setup**:
```bash
# Install PostgreSQL locally
# Create database
createdb housy_tunisia

# Set environment variable
DATABASE_URL=postgresql://postgres:password@localhost:5432/housy_tunisia
```

3. **For Neon Database setup**:
   - Go to https://neon.tech
   - Create a new project
   - Copy the connection string
   - Set it as DATABASE_URL

4. **Run migrations**:
```bash
npm run db:push
```

5. **Insert Tunisian construction types**:
```bash
# Run the SQL migration manually in your database client
# Or use our verification script after setting up the database
```

## Testing Database Connection

Run this to test your database connection:
```bash
npx tsx verify-tunisian-types.js
```
