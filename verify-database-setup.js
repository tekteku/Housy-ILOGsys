import { pool } from './server/db.ts';

async function verifyTunisianProjectTypes() {
  try {
    console.log('🔍 Verifying Tunisian Construction Project Types...\n');
    
    // Check database connection first
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL environment variable is not set');
      console.log('📖 Please check DATABASE_SETUP.md for configuration instructions');
      console.log('\n🚀 Quick setup:');
      console.log('1. Create a .env file with DATABASE_URL');
      console.log('2. Set up PostgreSQL or Neon database');
      console.log('3. Run: npm run db:push');
      console.log('4. Execute the migration SQL file in your database');
      return;
    }
    
    // Test database connection
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connection successful\n');
    } catch (connError) {
      console.log('❌ Database connection failed:', connError.message);
      console.log('📖 Please check your DATABASE_URL and ensure the database is running');
      return;
    }
    
    // Check if project_categories table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'project_categories'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ project_categories table does not exist');
      console.log('🚀 Run: npm run db:push');
      return;
    }
    
    // Count total project categories
    const totalCountResult = await pool.query('SELECT COUNT(*) as count FROM project_categories');
    const totalCount = totalCountResult.rows[0].count;
    console.log(`📊 Total Project Categories: ${totalCount}`);
    
    // Check if Tunisian project types exist
    const tunisianTypesResult = await pool.query(`
      SELECT project_type, COUNT(*) as count 
      FROM project_categories 
      WHERE is_active = true AND project_type IS NOT NULL
      GROUP BY project_type 
      ORDER BY project_type
    `);
    
    if (tunisianTypesResult.rows.length === 0) {
      console.log('\n❌ No Tunisian project types found');
      console.log('🚀 Execute the migration SQL file:');
      console.log('   - Open your database client (pgAdmin, DBeaver, etc.)');
      console.log('   - Run the contents of "tunisian-construction-types-migration.sql"');
      return;
    }
    
    console.log('\n📋 Project Types Distribution:');
    tunisianTypesResult.rows.forEach(row => {
      console.log(`  • ${row.project_type}: ${row.count} projects`);
    });
    
    // Show sample Tunisian projects
    const sampleProjectsResult = await pool.query(`
      SELECT name, project_type, base_price, complexity, duration, unit
      FROM project_categories 
      WHERE is_active = true AND project_type IS NOT NULL
      ORDER BY project_type, name 
      LIMIT 15
    `);
    
    console.log('\n🏗️ Sample Tunisian Construction Projects:');
    let currentType = '';
    sampleProjectsResult.rows.forEach(project => {
      if (project.project_type !== currentType) {
        currentType = project.project_type;
        console.log(`\n  ${currentType.toUpperCase()}:`);
      }
      console.log(`    • ${project.name}`);
      console.log(`      Price: ${project.base_price}€/${project.unit} | Complexity: ${project.complexity} | Duration: ${project.duration} days`);
    });
    
    // Check for Tunisian specifics
    const withSpecificsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM project_categories 
      WHERE tunisian_specifics IS NOT NULL
    `);
    
    console.log(`\n🇹🇳 Projects with Tunisian Specifics: ${withSpecificsResult.rows[0].count}`);
    
    // Show pricing summary by type
    const pricingSummaryResult = await pool.query(`
      SELECT 
        project_type,
        COUNT(*) as project_count,
        AVG(base_price::numeric) as avg_price,
        MIN(base_price::numeric) as min_price,
        MAX(base_price::numeric) as max_price
      FROM project_categories 
      WHERE is_active = true AND project_type IS NOT NULL AND base_price IS NOT NULL
      GROUP BY project_type 
      ORDER BY avg_price DESC
    `);
    
    console.log('\n💰 Pricing Summary by Project Type:');
    pricingSummaryResult.rows.forEach(row => {
      console.log(`  • ${row.project_type}:`);
      console.log(`    Projects: ${row.project_count} | Avg: ${Math.round(row.avg_price)}€ | Range: ${Math.round(row.min_price)}€-${Math.round(row.max_price)}€`);
    });
    
    console.log('\n✅ Verification completed successfully!');
    console.log('\n🎉 Tunisian construction project types are properly integrated!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    if (error.message.includes('does not support SSL')) {
      console.log('\n💡 Tip: This looks like a local PostgreSQL connection issue.');
      console.log('   Try setting up a local PostgreSQL database or use Neon cloud database.');
    }
  } finally {
    await pool.end();
  }
}

// Only run verification if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyTunisianProjectTypes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { verifyTunisianProjectTypes };
