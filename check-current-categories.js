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

async function checkCurrentCategories() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');
      // Check current project categories
    console.log('\n📋 Current Project Categories:');
    const categoriesResult = await client.query(`
      SELECT id, name, project_type, base_price, unit, complexity, 
             tunisian_specifics->>'climate' as climate
      FROM project_categories 
      ORDER BY project_type, name;
    `);
    
    categoriesResult.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.name} (${row.project_type || 'N/A'}) - ${row.base_price}€/${row.unit} [${row.complexity}] ${row.climate ? '- Climate: ' + row.climate : ''}`);
    });
    
    // Check if we have all Tunisian construction types
    const projectTypes = await client.query(`
      SELECT project_type, COUNT(*) as count 
      FROM project_categories 
      WHERE project_type IS NOT NULL
      GROUP BY project_type 
      ORDER BY project_type;
    `);
    
    console.log('\n📊 Categories by Project Type:');
    projectTypes.rows.forEach(row => {
      console.log(`  ${row.project_type}: ${row.count} categories`);
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCurrentCategories();
