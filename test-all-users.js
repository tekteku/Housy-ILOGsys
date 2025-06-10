import pkg from 'pg';
const { Client } = pkg;

async function tryDifferentUsers() {
  // Try different user/password combinations
  const userConfigs = [
    // Try with your Windows username
    { user: 'TaherCh', password: '' },
    { user: 'TaherCh', password: 'postgres' },
    { user: 'TaherCh', password: 'admin' },
    
    // Try default postgres user with various passwords
    { user: 'postgres', password: '' },
    { user: 'postgres', password: 'postgres' },
    { user: 'postgres', password: 'admin' },
    { user: 'postgres', password: '123456' },
    { user: 'postgres', password: 'password' },
    
    // Try without specifying password (Windows authentication)
    { user: process.env.USERNAME || 'TaherCh' }
  ];

  for (const userConfig of userConfigs) {
    const config = {
      ...userConfig,
      host: 'localhost',
      port: 5432,
      database: 'Housy',
      ssl: false
    };
    
    const client = new Client(config);
    
    try {
      console.log(`\n🔗 Trying user: ${config.user}, password: ${config.password || '(none/system auth)'}`);
      await client.connect();
      
      console.log('✅ SUCCESS! Connected to database');
      
      // Get database info
      const dbInfo = await client.query('SELECT version(), current_database(), current_user');
      console.log(`📊 Database: ${dbInfo.rows[0].current_database}`);
      console.log(`👤 Connected as: ${dbInfo.rows[0].current_user}`);
      console.log(`🔧 PostgreSQL version: ${dbInfo.rows[0].version.split(' ')[0]} ${dbInfo.rows[0].version.split(' ')[1]}`);
      
      // List all tables
      const tablesResult = await client.query(`
        SELECT schemaname, tablename, tableowner, tablespace
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `);
      
      console.log(`\n📋 Found ${tablesResult.rows.length} tables in public schema:`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.tablename} (owner: ${row.tableowner})`);
      });
      
      // Check specific tables we're interested in
      const importantTables = ['users', 'projects', 'project_categories', 'projectCategories', 'materials', 'resources'];
      console.log('\n🔍 Checking for important tables:');
      
      for (const tableName of importantTables) {
        try {
          const exists = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name = $1
            );
          `, [tableName]);
          
          if (exists.rows[0].exists) {
            const count = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`  ✅ ${tableName}: ${count.rows[0].count} records`);
          } else {
            console.log(`  ❌ ${tableName}: not found`);
          }
        } catch (error) {
          console.log(`  ⚠️ ${tableName}: error checking (${error.message})`);
        }
      }
      
      await client.end();
      
      // Update .env file with working credentials
      console.log('\n🔧 Updating .env file with working credentials...');
      const envContent = `# Working Database Configuration for Housy Tunisia
DATABASE_URL=postgresql://${config.user}:${config.password || ''}@localhost:5432/Housy?sslmode=disable
NODE_ENV=development

# Database "Housy" - Working credentials found!
# User: ${config.user}
# Password: ${config.password || '(system authentication)'}`;
      
      const fs = await import('fs');
      fs.writeFileSync('.env', envContent);
      console.log('✅ .env file updated with working credentials');
      
      return; // Exit on first successful connection
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
  
  console.log('\n❌ All user/password combinations failed.');
  console.log('\n💡 Try these solutions:');
  console.log('1. Reset postgres password: ALTER USER postgres PASSWORD \'newpassword\';');
  console.log('2. Check pg_hba.conf for authentication method');
  console.log('3. Create database: CREATE DATABASE "Housy";');
}

tryDifferentUsers().catch(console.error);
