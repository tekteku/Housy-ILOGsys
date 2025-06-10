import { readFileSync } from 'fs';
import pg from 'pg';

async function runMigration() {
  // Create a direct pool connection
  const pool = new pg.Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'Housy',
    ssl: false // Explicitly disable SSL
  });

  try {
    console.log('🚀 Running Tunisian Construction Types Migration...');
    
    // Test connection first
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Read the migration file
    const migrationSQL = readFileSync('./tunisian-construction-types-migration.sql', 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the results
    const result = await pool.query('SELECT COUNT(*) as count FROM project_categories');
    console.log(`📊 Total project categories: ${result.rows[0].count}`);
    
    // Show some examples
    const examples = await pool.query(`
      SELECT name, project_type, base_cost_per_unit, unit 
      FROM project_categories 
      ORDER BY project_type, base_cost_per_unit 
      LIMIT 10
    `);
    
    console.log('\n📋 Sample project categories:');
    examples.rows.forEach(row => {
      console.log(`  ${row.name} (${row.project_type}) - ${row.base_cost_per_unit}€/${row.unit}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Details:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
