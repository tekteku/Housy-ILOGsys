import { readFileSync } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  password: '0000',
  host: 'localhost',
  port: 5432,
  database: 'Housy',
  ssl: false
});

async function runTunisianMigration() {
  try {
    console.log('🚀 Running Tunisian Construction Types Migration...');
    
    const client = await pool.connect();
    
    // Read the migration file
    const migrationSQL = readFileSync('./tunisian-construction-types-migration.sql', 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the results
    const result = await client.query('SELECT COUNT(*) as count FROM project_categories');
    console.log(`📊 Total project categories: ${result.rows[0].count}`);
    
    // Show categories by type
    const typeResult = await client.query(`
      SELECT project_type, COUNT(*) as count 
      FROM project_categories 
      WHERE project_type IS NOT NULL
      GROUP BY project_type 
      ORDER BY project_type;
    `);
    
    console.log('\n📋 Categories by Project Type:');
    typeResult.rows.forEach(row => {
      console.log(`  ${row.project_type}: ${row.count} categories`);
    });
    
    // Show some examples
    const examples = await client.query(`
      SELECT name, project_type, base_price, unit, complexity,
             tunisian_specifics->>'climate' as climate
      FROM project_categories 
      WHERE project_type != 'construction_neuve' OR tunisian_specifics IS NOT NULL
      ORDER BY project_type, base_price 
      LIMIT 15
    `);
    
    console.log('\n📋 Sample Tunisian construction categories:');
    examples.rows.forEach(row => {
      console.log(`  ${row.name} (${row.project_type}) - ${row.base_price}€/${row.unit} [${row.complexity}]${row.climate ? ' - ' + row.climate : ''}`);
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await pool.end();
  }
}

runTunisianMigration();
