import pg from 'pg';

async function testDatabaseCredentials() {
  console.log('🔐 Testing different database credential combinations...\n');
  
  const testConfigs = [
    {
      name: 'Current .env config',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'Housy',
        user: 'postgres',
        password: 'postgres',
        ssl: false
      }
    },
    {
      name: 'No password',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'Housy',
        user: 'postgres',
        password: '',
        ssl: false
      }
    },
    {
      name: 'Different database name (lowercase)',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'housy',
        user: 'postgres',
        password: 'postgres',
        ssl: false
      }
    },
    {
      name: 'Default PostgreSQL (postgres db)',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'postgres',
        ssl: false
      }
    }
  ];
  
  for (const testConfig of testConfigs) {
    console.log(`🧪 Testing: ${testConfig.name}`);
    console.log(`   Connection: postgresql://${testConfig.config.user}:***@${testConfig.config.host}:${testConfig.config.port}/${testConfig.config.database}`);
    
    const client = new pg.Client(testConfig.config);
    
    try {
      await client.connect();
      console.log('   ✅ Connection successful!');
      
      // Test basic query
      const result = await client.query('SELECT version(), current_database()');
      console.log(`   📊 Database: ${result.rows[0].current_database}`);
      console.log(`   🔧 Version: ${result.rows[0].version.split(' ')[0]}`);
      
      // List databases
      const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
      console.log('   📋 Available databases:');
      dbResult.rows.forEach(row => {
        console.log(`      - ${row.datname}`);
      });
      
      await client.end();
      console.log('   🎯 This configuration works!\n');
      
      // If this works, update .env
      if (testConfig.config.database !== 'postgres') {
        console.log('💡 Updating .env file with working configuration...');
        return testConfig.config;
      }
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
      await client.end().catch(() => {});
    }
  }
  
  return null;
}

testDatabaseCredentials().then(workingConfig => {
  if (!workingConfig) {
    console.log('❌ None of the configurations worked.');
    console.log('💡 Please check:');
    console.log('   1. PostgreSQL service is running');
    console.log('   2. Database "Housy" exists');
    console.log('   3. User "postgres" has correct password');
    console.log('   4. PostgreSQL is listening on port 5432');
  }
}).catch(console.error);
