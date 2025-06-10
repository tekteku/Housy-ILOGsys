import pg from 'pg';

async function testCredentials() {
  const credentials = [
    { user: 'postgres', password: '0000', host: 'localhost', port: 5432, database: 'Housy' },
    { user: 'postgres', password: '', host: 'localhost', port: 5432, database: 'Housy' },
    { user: 'postgres', password: null, host: 'localhost', port: 5432, database: 'Housy' },
    { user: 'postgres', password: 'admin', host: 'localhost', port: 5432, database: 'Housy' },
    { user: 'postgres', password: '123456', host: 'localhost', port: 5432, database: 'Housy' },
    { user: 'postgres', host: 'localhost', port: 5432, database: 'Housy' } // No password
  ];
  
  for (let i = 0; i < credentials.length; i++) {
    const config = { ...credentials[i], ssl: false };
    console.log(`\n🔍 Testing credentials ${i + 1}: ${config.user}${config.password ? '/***' : '/no-password'}`);
    
    const pool = new pg.Pool(config);
    
    try {
      const result = await pool.query('SELECT NOW(), current_database()');
      console.log(`✅ SUCCESS! Connected to database: ${result.rows[0].current_database}`);
      console.log(`📝 Working credentials: user="${config.user}", password="${config.password || 'none'}"`);
      await pool.end();
      return config;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      await pool.end();
    }
  }
  
  console.log('\n🚫 None of the credential combinations worked.');
  return null;
}

testCredentials();
