import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    console.log('🚀 Starting Tunisian construction types migration...');
    
    // Read and execute the first migration file
    const migration1Path = join(__dirname, 'migrations', '0003_tunisian_construction_types.sql');
    const migration1SQL = readFileSync(migration1Path, 'utf8');
    
    console.log('📄 Executing migration: 0003_tunisian_construction_types.sql');
    await pool.query(migration1SQL);
    console.log('✅ Successfully inserted Tunisian construction project types');
    
    // Read and execute the second migration file  
    const migration2Path = join(__dirname, 'migrations', '0004_add_tunisian_project_fields.sql');
    const migration2SQL = readFileSync(migration2Path, 'utf8');
    
    console.log('📄 Executing migration: 0004_add_tunisian_project_fields.sql');
    await pool.query(migration2SQL);
    console.log('✅ Successfully added Tunisian project fields');
    
    // Verify the data was inserted
    const result = await pool.query('SELECT COUNT(*) as count FROM project_categories');
    console.log(`✅ Total project categories in database: ${result.rows[0].count}`);
    
    // Show some sample Tunisian project types
    const sampleTypes = await pool.query(`
      SELECT name, project_type, base_price, complexity, duration 
      FROM project_categories 
      WHERE project_type IS NOT NULL 
      ORDER BY project_type, name 
      LIMIT 10
    `);
    
    console.log('\n📋 Sample Tunisian Project Types:');
    sampleTypes.rows.forEach(row => {
      console.log(`  • ${row.name} (${row.project_type}) - ${row.base_price}€/m² - ${row.complexity} - ${row.duration} days`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
