import pg from 'pg';
const { Pool } = pg;

// Test different potential database locations
const testConfigs = [
  { database: 'housy_tunisia', port: 5432, description: 'Main Housy Database (Local PostgreSQL)' },
  { database: 'housy_tunisia', port: 5433, description: 'Docker PostgreSQL (if running)' },
  { database: 'postgres', port: 5432, description: 'Default PostgreSQL Database' },
  { database: 'Housy', port: 5432, description: 'Alternative Database Name' }
];

async function findTables() {
  console.log('🔍 SEARCHING FOR YOUR TABLES...\n');
  
  for (const config of testConfigs) {
    console.log(`Testing: ${config.description}`);
    console.log(`Connection: postgresql://postgres:0000@localhost:${config.port}/${config.database}`);
    
    const pool = new Pool({
      user: 'postgres',
      password: '0000',
      host: 'localhost',
      port: config.port,
      database: config.database,
      connectionTimeoutMillis: 3000
    });
    
    try {
      const client = await pool.connect();
      
      // Check if database exists and get table count
      const result = await client.query(`
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableCount = result.rows[0].table_count;
      
      if (tableCount > 0) {
        console.log(`✅ FOUND ${tableCount} TABLES!`);
        
        // List all tables if this is the main database
        if (config.database === 'housy_tunisia' && tableCount >= 40) {
          console.log('\n📋 All tables found:');
          const tablesResult = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
          `);
          
          tablesResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.tablename}`);
          });
          
          // Check for admin user
          try {
            const adminResult = await client.query(`
              SELECT username, email, role 
              FROM users 
              WHERE role = 'admin'
            `);
            
            if (adminResult.rows.length > 0) {
              console.log('\n👑 Admin user found:');
              adminResult.rows.forEach(user => {
                console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
              });
            }
          } catch (userError) {
            console.log('   (Could not check users table)');
          }
          
          console.log('\n🎯 THIS IS YOUR MAIN DATABASE!');
          console.log('\nFor pgAdmin, use:');
          console.log(`   Host: localhost`);
          console.log(`   Port: ${config.port}`);
          console.log(`   Database: ${config.database}`);
          console.log(`   Username: postgres`);
          console.log(`   Password: 0000`);
        }
      } else {
        console.log(`⚠️  Database exists but no tables found (${tableCount} tables)`);
      }
      
      client.release();
      await pool.end();
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Cannot connect - PostgreSQL not running on port ${config.port}`);
      } else if (error.code === '3D000') {
        console.log(`❌ Database "${config.database}" does not exist`);
      } else {
        console.log(`❌ Connection failed: ${error.message}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🔍 Search completed!');
  console.log('\n📞 If you found tables above, use those exact connection settings in pgAdmin.');
  console.log('📞 If no tables found, your database might need to be recreated.');
}

findTables().catch(console.error);
