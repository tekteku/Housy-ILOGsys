import { pool } from './server/db.ts';

async function inspectDatabase() {
  try {
    console.log('🔍 Inspecting your "Housy" database...\n');
    
    // Test connection
    console.log('📡 Testing database connection...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Connected successfully!');
    console.log(`   Time: ${connectionTest.rows[0].current_time}`);
    console.log(`   Version: ${connectionTest.rows[0].version.split(' ')[0]}\n`);
    
    // List all tables
    console.log('📋 Database Tables:');
    const tablesResult = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('   ❌ No tables found in the database\n');
    } else {
      tablesResult.rows.forEach(table => {
        console.log(`   📊 ${table.table_name} (${table.table_type})`);
      });
      console.log('');
    }
    
    // Check for project_categories specifically
    console.log('🏗️ Checking project_categories table:');
    try {
      const categoriesCheck = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'project_categories'
        ORDER BY ordinal_position
      `);
      
      if (categoriesCheck.rows.length === 0) {
        console.log('   ❌ project_categories table does not exist\n');
      } else {
        console.log('   ✅ project_categories table structure:');
        categoriesCheck.rows.forEach(col => {
          console.log(`      ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });
        
        // Check data in project_categories
        const dataCheck = await pool.query('SELECT COUNT(*) as count FROM project_categories');
        console.log(`   📊 Rows in project_categories: ${dataCheck.rows[0].count}`);
        
        if (dataCheck.rows[0].count > 0) {
          const sampleData = await pool.query('SELECT * FROM project_categories LIMIT 5');
          console.log('   📋 Sample data:');
          sampleData.rows.forEach((row, index) => {
            console.log(`      ${index + 1}. ${row.name || 'Unnamed'} - ${row.project_type || 'No type'}`);
          });
        }
        console.log('');
      }
    } catch (error) {
      console.log(`   ❌ Error checking project_categories: ${error.message}\n`);
    }
    
    // Check for other important tables
    const importantTables = ['projects', 'users', 'financial_transactions', 'project_budgets'];
    
    for (const tableName of importantTables) {
      try {
        const tableCheck = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`📊 ${tableName}: ${tableCheck.rows[0].count} rows`);
      } catch (error) {
        console.log(`❌ ${tableName}: Table does not exist or error - ${error.message}`);
      }
    }
    
    console.log('\n🎯 Database inspection complete!');
    
  } catch (error) {
    console.error('❌ Database inspection failed:', error.message);
    console.error('💡 Common issues:');
    console.error('   - Wrong database name (should be "Housy")');
    console.error('   - Wrong username/password');
    console.error('   - PostgreSQL service not running');
    console.error('   - SSL configuration issue');
  } finally {
    await pool.end();
  }
}

inspectDatabase();
