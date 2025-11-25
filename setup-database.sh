#!/bin/bash

# Housy Tunisia Database Setup Script
# This script sets up the PostgreSQL database for the Housy application

set -e

echo "🏠 Setting up Housy Tunisia Database..."

# Database configuration
DB_NAME="housy_tunisia"
DB_USER="postgres"
DB_PASSWORD="0000"
DB_HOST="localhost"
DB_PORT="5433"  # Development port

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is running
check_postgres() {
    print_status "Checking PostgreSQL connection..."
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed or not in PATH"
        exit 1
    fi
    
    # Try to connect to PostgreSQL
    if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" &> /dev/null; then
        print_error "Cannot connect to PostgreSQL. Make sure the database is running and accessible."
        print_warning "If using Docker, run: docker-compose -f docker-compose.dev.yml up -d postgres-dev"
        exit 1
    fi
    
    print_success "PostgreSQL connection established"
}

# Create database if it doesn't exist
create_database() {
    print_status "Creating database '$DB_NAME' if it doesn't exist..."
    
    # Check if database exists
    DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
    
    if [ "$DB_EXISTS" != "1" ]; then
        print_status "Database '$DB_NAME' does not exist. Creating..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
        print_success "Database '$DB_NAME' created successfully"
    else
        print_warning "Database '$DB_NAME' already exists"
    fi
}

# Run database schema initialization
initialize_schema() {
    print_status "Initializing database schema..."
    
    if [ -f "migrations/init_housy_tunisia.sql" ]; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/init_housy_tunisia.sql
        print_success "Database schema initialized successfully"
    else
        print_error "Schema file 'migrations/init_housy_tunisia.sql' not found"
        exit 1
    fi
}

# Run any additional migration files
run_migrations() {
    print_status "Running additional migrations..."
    
    # Run numbered migration files in order
    for migration_file in migrations/0*.sql; do
        if [ -f "$migration_file" ] && [ "$migration_file" != "migrations/init_housy_tunisia.sql" ]; then
            print_status "Running migration: $(basename $migration_file)"
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_file"
            print_success "Migration $(basename $migration_file) completed"
        fi
    done
}

# Verify database setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Check if tables exist
    TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
    
    if [ "$TABLE_COUNT" -gt "0" ]; then
        print_success "Database setup verified. Found $TABLE_COUNT tables."
        
        # List some key tables
        print_status "Key tables found:"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'projects', 'client_requests', 'quotations', 'active_projects') ORDER BY tablename;"
    else
        print_error "Database setup verification failed. No tables found."
        exit 1
    fi
}

# Check admin user
check_admin_user() {
    print_status "Checking admin user..."
    
    ADMIN_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM users WHERE username = 'admin';")
    
    if [ "$ADMIN_COUNT" = "1" ]; then
        print_success "Admin user exists"
        print_status "Default admin credentials:"
        echo "  Username: admin"
        echo "  Password: admin (please change this after first login)"
    else
        print_warning "Admin user not found or multiple admin users exist"
    fi
}

# Main execution
main() {
    echo -e "\n🏠 ${BLUE}Housy Tunisia Database Setup${NC}\n"
    
    check_postgres
    create_database
    initialize_schema
    run_migrations
    verify_setup
    check_admin_user
    
    echo -e "\n${GREEN}✅ Database setup completed successfully!${NC}"
    echo -e "\n📋 ${BLUE}Next steps:${NC}"
    echo "   1. Update your .env file with the database URL:"
    echo "      DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo "   2. Start the application with: npm run dev"
    echo "   3. Access the admin panel and change the default password"
    echo -e "\n🚀 ${GREEN}Happy coding!${NC}\n"
}

# Run main function
main "$@"
