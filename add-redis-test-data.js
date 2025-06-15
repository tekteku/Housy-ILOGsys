import redis from 'redis';

async function addTestDataToRedis() {
  console.log('🔄 Adding test data to Redis for web interface demo...\n');
  
  try {
    const client = redis.createClient({
      url: 'redis://localhost:6380'
    });
    
    await client.connect();
    console.log('✅ Connected to Redis');
    
    // Add sample Housy data
    console.log('📊 Adding Housy Tunisia sample data...');
    
    // 1. User session
    await client.setEx('housy:session:admin', 3600, JSON.stringify({
      userId: 1,
      username: 'admin',
      email: 'admin@housy.tn',
      role: 'admin',
      loginTime: new Date().toISOString(),
      permissions: ['read', 'write', 'admin']
    }));
    console.log('✅ Added admin session');
    
    // 2. Project cache
    await client.setEx('housy:cache:projects:list', 300, JSON.stringify({
      projects: [
        { id: 1, name: 'Villa Moderne Tunis', status: 'active', budget: 150000 },
        { id: 2, name: 'Immeuble Sousse', status: 'planning', budget: 300000 },
        { id: 3, name: 'Bureau Commercial', status: 'completed', budget: 80000 }
      ],
      totalCount: 3,
      cachedAt: new Date().toISOString()
    }));
    console.log('✅ Added projects cache');
    
    // 3. User notifications
    const notifications = [
      { message: 'Project "Villa Moderne" status updated to active', type: 'info', timestamp: new Date().toISOString() },
      { message: 'New quotation requires approval', type: 'warning', timestamp: new Date().toISOString() },
      { message: 'Payment received for project #123', type: 'success', timestamp: new Date().toISOString() }
    ];
    
    for (const notification of notifications) {
      await client.lPush('housy:notifications:user:1', JSON.stringify(notification));
    }
    console.log('✅ Added user notifications');
    
    // 4. Background tasks queue
    const tasks = [
      { type: 'email', data: { to: 'client@example.tn', subject: 'Project Update', projectId: 1 }},
      { type: 'pdf_generation', data: { quotationId: 123, clientName: 'Ahmed Ben Ali' }},
      { type: 'backup', data: { table: 'projects', timestamp: new Date().toISOString() }}
    ];
    
    for (const task of tasks) {
      await client.lPush('housy:queue:background', JSON.stringify(task));
    }
    console.log('✅ Added background tasks');
    
    // 5. Material prices cache
    await client.hSet('housy:cache:materials:prices', {
      'cement': '12.50',
      'brick': '0.85', 
      'steel': '1.20',
      'concrete': '45.00',
      'tile': '25.00'
    });
    console.log('✅ Added material prices');
    
    // 6. System statistics
    await client.setEx('housy:stats:daily', 86400, JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      activeProjects: 15,
      completedToday: 2,
      newQuotations: 5,
      totalRevenue: 125000,
      activeUsers: 8
    }));
    console.log('✅ Added daily statistics');
    
    // 7. Rate limiting counters
    await client.incr('housy:ratelimit:api:user:1');
    await client.expire('housy:ratelimit:api:user:1', 60);
    console.log('✅ Added rate limiting data');
    
    // 8. Search cache
    await client.setEx('housy:search:projects:villa', 600, JSON.stringify({
      query: 'villa',
      results: [
        { id: 1, name: 'Villa Moderne Tunis', score: 0.95 },
        { id: 4, name: 'Villa Luxe Hammamet', score: 0.87 }
      ],
      count: 2,
      searchTime: '15ms'
    }));
    console.log('✅ Added search cache');
    
    await client.disconnect();
    
    console.log('\n🎉 Sample data added successfully!');
    console.log('\n🌐 Now you can view Redis data in your browser:');
    console.log('   URL: http://localhost:8081');
    console.log('\n📋 You should see these keys:');
    console.log('   • housy:session:admin (User session)');
    console.log('   • housy:cache:projects:list (Project cache)');
    console.log('   • housy:notifications:user:1 (Notifications list)');
    console.log('   • housy:queue:background (Task queue)');
    console.log('   • housy:cache:materials:prices (Material prices hash)');
    console.log('   • housy:stats:daily (Daily statistics)');
    console.log('   • housy:ratelimit:api:user:1 (Rate limiting)');
    console.log('   • housy:search:projects:villa (Search cache)');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

addTestDataToRedis();
