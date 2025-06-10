import pkg from 'pg';
const { Client } = pkg;

async function checkPostgresDefault() {
  const passwords = ['', 'postgres', 'admin', 'password', '123456', 'root'];
  
  for (const password of passwords) {
    const client = new Client({
      user: 'postgres',
      password: password,
      host: 'localhost',
      port: 5432,
      database: 'postgres', // Connect to default postgres database
      ssl: false
    });
    
    try {
      console.log(`\n🔗 Trying postgres database with password: ${password || '(empty)'}`);
      await client.connect();
      
      console.log('✅ Connected to default postgres database!');
      
      // List all databases
      const dbResult = await client.query(`
        SELECT datname, datowner, encoding 
        FROM pg_database 
        WHERE datistemplate = false
        ORDER BY datname;
      `);
      
      console.log('\n📊 Available databases:');
      dbResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.datname} (owner: ${row.datowner})`);
      });
      
      // Check if Housy database exists
      const housyExists = dbResult.rows.some(row => 
        row.datname.toLowerCase() === 'housy' || row.datname === 'Housy'
      );
      
      if (!housyExists) {
        console.log('\n🏗️ Creating "Housy" database...');
        await client.query('CREATE DATABASE "Housy"');
        console.log('✅ "Housy" database created successfully!');
      } else {
        console.log('\n✅ "Housy" database already exists');
      }
      
      await client.end();
      
      // Now try to connect to Housy database
      console.log('\n🔗 Now connecting to Housy database...');
      const housyClient = new Client({
        user: 'postgres',
        password: password,
        host: 'localhost',
        port: 5432,
        database: 'Housy',
        ssl: false
      });
      
      await housyClient.connect();
      console.log('✅ Connected to Housy database!');
      
      // Check tables in Housy database
      const tablesResult = await housyClient.query(`
        SELECT table_name, table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      console.log(`\n📋 Tables in Housy database (${tablesResult.rows.length} found):`);
      if (tablesResult.rows.length === 0) {
        console.log('  (No tables found - database is empty)');
      } else {
        tablesResult.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ${row.table_name} (${row.table_type})`);
        });
        
        // Count records in each table
        console.log('\n📊 Record counts:');
        for (const row of tablesResult.rows) {
          try {
            const countResult = await housyClient.query(`SELECT COUNT(*) as count FROM "${row.table_name}"`);
            console.log(`  ${row.table_name}: ${countResult.rows[0].count} records`);
          } catch (error) {
            console.log(`  ${row.table_name}: Error counting (${error.message})`);
          }
        }
      }
      
      await housyClient.end();
      
      // Update .env with working credentials
      const envContent = `# Working Database Configuration for Housy Tunisia
DATABASE_URL=postgresql://postgres:${password}@localhost:5432/Housy?sslmode=disable
NODE_ENV=development

# Successfully connected with:
# User: postgres
# Password: ${password || '(empty)'}
# Database: Housy`;
      
      const fs = await import('fs');
      fs.writeFileSync('.env', envContent);
      console.log('\n✅ .env file updated with working credentials!');
      
      return;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
  
  console.log('\n❌ Could not connect with any password.');
  console.log('💡 You may need to:');
  console.log('   1. Check PostgreSQL installation');
  console.log('   2. Reset postgres user password');
  console.log('   3. Check pg_hba.conf authentication settings');
}

checkPostgresDefault().catch(console.error);
