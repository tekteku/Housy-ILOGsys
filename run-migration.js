import { readFileSync } from 'fs';
import { pool } from './server/db.ts';

async function runMigration() {
  try {
    console.log('🚀 Running Tunisian Construction Types Migration...');
    
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
  } finally {
    await pool.end();
  }
}

runMigration();
