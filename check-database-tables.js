import pkg from 'pg';
const { Client } = pkg;

async function checkDatabaseTables() {
  // Try different connection configurations
  const connectionConfigs = [
    {
      user: 'postgres',
      password: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'Housy',
      ssl: false
    },
    {
      user: 'postgres',
      password: '',
      host: 'localhost', 
      port: 5432,
      database: 'Housy',
      ssl: false
    },
    {
      user: 'postgres',
      password: 'admin',
      host: 'localhost',
      port: 5432,
      database: 'Housy',
      ssl: false
    },
    {
      user: 'postgres',
      password: 'password',
      host: 'localhost',
      port: 5432,
      database: 'Housy',
      ssl: false
    }
  ];

  for (const config of connectionConfigs) {
    const client = new Client(config);
    
    try {
      console.log(`\n🔗 Trying connection with password: ${config.password || '(empty)'}`);
      await client.connect();
      
      console.log('✅ Connected successfully!');
      console.log(`📊 Database: ${config.database}`);
      
      // List all tables
      const tablesResult = await client.query(`
        SELECT table_name, table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      console.log(`\n📋 Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name} (${row.table_type})`);
      });
      
      // Count records in each table
      console.log('\n📊 Record counts:');
      for (const row of tablesResult.rows) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
          console.log(`  ${row.table_name}: ${countResult.rows[0].count} records`);
        } catch (error) {
          console.log(`  ${row.table_name}: Error counting (${error.message})`);
        }
      }
      
      // Check if project_categories table exists and show structure
      const projectCategoriesExists = tablesResult.rows.some(row => 
        row.table_name === 'project_categories' || row.table_name === 'projectCategories'
      );
      
      if (projectCategoriesExists) {
        console.log('\n🏗️ Project Categories table structure:');
        const structureResult = await client.query(`
          SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
          FROM information_schema.columns
          WHERE table_name IN ('project_categories', 'projectCategories')
          ORDER BY ordinal_position;
        `);
        
        structureResult.rows.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      }
      
      await client.end();
      return; // Exit on first successful connection
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('💡 Please check:');
  console.log('   - PostgreSQL service is running');
  console.log('   - Database "Housy" exists');
  console.log('   - Correct username/password');
}

checkDatabaseTables().catch(console.error);
