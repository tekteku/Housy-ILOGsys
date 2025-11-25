import redis from 'redis';

async function testRedis() {
  console.log('🔍 Testing Redis Connection for Housy Tunisia...\n');
  
  // Test configurations
  const redisConfigs = [
    { port: 6380, description: 'Docker Redis (Development)' },
    { port: 6379, description: 'Local Redis (Standard)' }
  ];
  
  for (const config of redisConfigs) {
    console.log(`Testing: ${config.description}`);
    console.log(`Connection: redis://localhost:${config.port}`);
    
    let client;
    try {
      // Create Redis client
      client = redis.createClient({
        url: `redis://localhost:${config.port}`,
        socket: {
          connectTimeout: 3000,
          lazyConnect: true
        }
      });
      
      // Handle connection errors
      client.on('error', (err) => {
        console.log(`❌ Redis Client Error: ${err.message}`);
      });
      
      // Connect to Redis
      await client.connect();
      console.log('✅ Successfully connected to Redis!');
      
      // Test basic operations
      console.log('\n🔧 Testing Redis Operations:');
      
      // 1. Set a test value
      await client.set('housy:test:key', 'Hello Housy Tunisia!');
      console.log('   ✅ SET operation successful');
      
      // 2. Get the test value
      const value = await client.get('housy:test:key');
      console.log(`   ✅ GET operation successful: "${value}"`);
      
      // 3. Test with expiration
      await client.setEx('housy:test:temp', 10, 'Temporary value');
      console.log('   ✅ SETEX operation successful (10s expiry)');
      
      // 4. Test Redis info
      const info = await client.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      if (memoryMatch) {
        console.log(`   📊 Redis Memory Usage: ${memoryMatch[1].trim()}`);
      }
      
      // 5. Test Redis version
      const serverInfo = await client.info('server');
      const versionMatch = serverInfo.match(/redis_version:([^\r\n]+)/);
      if (versionMatch) {
        console.log(`   📊 Redis Version: ${versionMatch[1].trim()}`);
      }
      
      // 6. Test list operations (useful for queues)
      await client.lPush('housy:test:queue', 'task1', 'task2', 'task3');
      const queueLength = await client.lLen('housy:test:queue');
      console.log(`   ✅ LIST operations successful (queue length: ${queueLength})`);
      
      // 7. Test hash operations (useful for caching objects)
      await client.hSet('housy:test:user', {
        id: '1',
        name: 'Test User',
        role: 'admin',
        lastLogin: new Date().toISOString()
      });
      const userData = await client.hGetAll('housy:test:user');
      console.log(`   ✅ HASH operations successful (user: ${userData.name})`);
      
      // 8. Test key expiration
      await client.expire('housy:test:user', 300); // 5 minutes
      const ttl = await client.ttl('housy:test:user');
      console.log(`   ✅ TTL operations successful (expires in ${ttl}s)`);
      
      // 9. Clean up test data
      await client.del('housy:test:key', 'housy:test:temp', 'housy:test:queue', 'housy:test:user');
      console.log('   ✅ Cleanup successful');
      
      console.log('\n🎉 Redis is working perfectly!');
      console.log('\n📋 Redis Configuration for Housy:');
      console.log(`   URL: redis://localhost:${config.port}`);
      console.log('   Status: ✅ Ready for caching and sessions');
      console.log('   Use cases: User sessions, API caching, task queues');
      
      await client.disconnect();
      return true;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Cannot connect - Redis not running on port ${config.port}`);
      } else {
        console.log(`❌ Redis test failed: ${error.message}`);
      }
      
      if (client) {
        try {
          await client.disconnect();
        } catch (disconnectError) {
          // Ignore disconnect errors
        }
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🔍 Redis testing completed!');
  return false;
}

// Test Redis with application-like scenarios
async function testRedisForHousy() {
  console.log('\n🏗️ Testing Redis for Housy Application Use Cases...\n');
  
  try {
    const client = redis.createClient({
      url: 'redis://localhost:6380'
    });
    
    await client.connect();
    console.log('✅ Connected to Redis for application testing');
    
    // Test 1: User session caching
    console.log('\n1. Testing User Session Caching:');
    const sessionData = {
      userId: '1',
      username: 'admin',
      role: 'admin',
      loginTime: new Date().toISOString(),
      permissions: ['read', 'write', 'admin']
    };
    
    await client.setEx(
      'housy:session:user1', 
      3600, // 1 hour
      JSON.stringify(sessionData)
    );
    
    const retrievedSession = await client.get('housy:session:user1');
    const parsedSession = JSON.parse(retrievedSession);
    console.log(`   ✅ Session stored and retrieved for user: ${parsedSession.username}`);
    
    // Test 2: API response caching
    console.log('\n2. Testing API Response Caching:');
    const projectsData = {
      projects: [
        { id: 1, name: 'Villa Moderne', status: 'active' },
        { id: 2, name: 'Immeuble Tunis', status: 'planning' }
      ],
      count: 2,
      cached_at: new Date().toISOString()
    };
    
    await client.setEx(
      'housy:cache:projects:list', 
      300, // 5 minutes
      JSON.stringify(projectsData)
    );
    
    const cachedProjects = await client.get('housy:cache:projects:list');
    const parsedProjects = JSON.parse(cachedProjects);
    console.log(`   ✅ Cached ${parsedProjects.count} projects, expires in ${await client.ttl('housy:cache:projects:list')}s`);
    
    // Test 3: Task queue for background jobs
    console.log('\n3. Testing Background Task Queue:');
    const backgroundTasks = [
      { type: 'email', data: { to: 'client@example.com', subject: 'Project Update' }},
      { type: 'pdf_generation', data: { quotation_id: 123 }},
      { type: 'backup', data: { table: 'projects' }}
    ];
    
    for (const task of backgroundTasks) {
      await client.lPush('housy:queue:background', JSON.stringify(task));
    }
    
    const queueSize = await client.lLen('housy:queue:background');
    console.log(`   ✅ Added ${backgroundTasks.length} tasks to queue (current size: ${queueSize})`);
    
    // Process one task (simulation)
    const nextTask = await client.rPop('housy:queue:background');
    if (nextTask) {
      const taskData = JSON.parse(nextTask);
      console.log(`   ✅ Processed task: ${taskData.type}`);
    }
    
    // Test 4: Real-time notifications
    console.log('\n4. Testing Real-time Notifications:');
    const notifications = [
      { user_id: 1, message: 'Project "Villa Moderne" status updated', type: 'info' },
      { user_id: 1, message: 'New quotation requires approval', type: 'warning' }
    ];
    
    for (const notification of notifications) {
      await client.lPush(
        `housy:notifications:user:${notification.user_id}`, 
        JSON.stringify({
          ...notification,
          timestamp: new Date().toISOString(),
          read: false
        })
      );
    }
    
    const userNotifications = await client.lRange('housy:notifications:user:1', 0, -1);
    console.log(`   ✅ Stored ${userNotifications.length} notifications for user`);
    
    // Test 5: Rate limiting
    console.log('\n5. Testing Rate Limiting:');
    const rateLimitKey = 'housy:ratelimit:api:user1';
    const currentCount = await client.incr(rateLimitKey);
    if (currentCount === 1) {
      await client.expire(rateLimitKey, 60); // Reset every minute
    }
    console.log(`   ✅ API calls this minute: ${currentCount}/100`);
    
    // Cleanup
    await client.del(
      'housy:session:user1',
      'housy:cache:projects:list',
      'housy:queue:background',
      'housy:notifications:user:1',
      rateLimitKey
    );
    
    console.log('\n🎉 All Housy Redis use cases working perfectly!');
    console.log('\n📊 Redis Ready for:');
    console.log('   ✅ User session management');
    console.log('   ✅ API response caching');
    console.log('   ✅ Background task processing');
    console.log('   ✅ Real-time notifications');
    console.log('   ✅ Rate limiting');
    console.log('   ✅ Data caching and performance optimization');
    
    await client.disconnect();
    
  } catch (error) {
    console.log(`❌ Housy Redis testing failed: ${error.message}`);
  }
}

// Run tests
testRedis().then(async (redisWorking) => {
  if (redisWorking) {
    await testRedisForHousy();
  } else {
    console.log('\n💡 To start Redis:');
    console.log('   Option 1: Start Docker Redis container');
    console.log('   Option 2: Install Redis locally');
    console.log('   Option 3: Use Redis Cloud service');
  }
}).catch(console.error);
