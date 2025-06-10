import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Housy Tunisia Database...\n');
    
    // Check database connection
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL environment variable is not set');
      console.log('📖 Please create a .env file with your database connection string');
      console.log('\nExample .env file:');
      console.log('DATABASE_URL=postgresql://username:password@localhost:5432/housy_tunisia');
      return;
    }
    
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');
    
    // Check if tables exist
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('project_categories', 'projects', 'users')
    `);
    
    console.log(`📋 Found ${tableCheck.rows.length} existing tables`);
    
    if (tableCheck.rows.length === 0) {
      console.log('⚠️  No tables found. Please run the schema migration first:');
      console.log('   npm run db:push');
      return;
    }
    
    // Check if project_categories table has the new columns
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'project_categories' 
      AND column_name IN ('project_type', 'tunisian_specifics')
    `);
    
    console.log(`🔧 Found ${columnCheck.rows.length}/2 Tunisian-specific columns`);
    
    if (columnCheck.rows.length < 2) {
      console.log('🔨 Adding Tunisian-specific columns...');
      
      // Add missing columns
      try {
        await pool.query(`
          DO $$ 
          BEGIN
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_categories' AND column_name = 'project_type') THEN
                  ALTER TABLE project_categories ADD COLUMN project_type TEXT DEFAULT 'construction_neuve';
              END IF;
              
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_categories' AND column_name = 'tunisian_specifics') THEN
                  ALTER TABLE project_categories ADD COLUMN tunisian_specifics JSONB;
              END IF;
          END $$;
        `);
        console.log('✅ Columns added successfully');
      } catch (columnError) {
        console.log('⚠️  Column addition failed:', columnError.message);
      }
    }
    
    // Check if Tunisian project types already exist
    const existingTypesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM project_categories 
      WHERE name ILIKE '%villa%' OR name ILIKE '%rénovation%' OR name ILIKE '%extension%'
    `);
    
    const existingCount = existingTypesResult.rows[0].count;
    console.log(`🏗️  Found ${existingCount} existing Tunisian-style projects`);
    
    if (existingCount < 20) {
      console.log('📥 Inserting Tunisian construction project types...');
      
      // Read and execute the migration file
      const migrationPath = join(__dirname, 'tunisian-construction-types-migration.sql');
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      
      await pool.query(migrationSQL);
      console.log('✅ Tunisian project types inserted successfully');
    } else {
      console.log('✅ Tunisian project types already exist');
    }
    
    // Final verification
    const finalCountResult = await pool.query('SELECT COUNT(*) as count FROM project_categories');
    const finalCount = finalCountResult.rows[0].count;
    
    const typesCountResult = await pool.query(`
      SELECT project_type, COUNT(*) as count 
      FROM project_categories 
      WHERE project_type IS NOT NULL 
      GROUP BY project_type
    `);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log(`📊 Total project categories: ${finalCount}`);
    console.log('📋 Project types:');
    typesCountResult.rows.forEach(row => {
      console.log(`   • ${row.project_type}: ${row.count} projects`);
    });
    
    console.log('\n✅ Your Housy Tunisia database is ready!');
    console.log('🚀 You can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('does not support SSL')) {
      console.log('\n💡 SSL Connection Issue:');
      console.log('   For local PostgreSQL, ensure SSL is properly configured or disabled');
      console.log('   For cloud databases (Neon), ensure your connection string includes SSL parameters');
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 Database Does Not Exist:');
      console.log('   Create the database first: createdb housy_tunisia');
      console.log('   Or use your database provider\'s interface to create it');
    }
    
  } finally {
    await pool.end();
  }
}

// Only run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}
