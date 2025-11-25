#!/usr/bin/env node
/**
 * Test de performance Redis avec données Housy
 */

import redis from 'redis';

const client = redis.createClient({ url: 'redis://localhost:6379' });

async function performanceTest() {
  try {
    await client.connect();
    console.log('🔥 TEST DE PERFORMANCE REDIS - HOUSY TUNISIA');
    
    // Test 1: Vitesse de lecture multiple
    console.log('\n⚡ Test 1: Lecture multiple simultanée');
    const start1 = Date.now();
    
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(client.get('housy:stats:summary'));
    }
    
    await Promise.all(promises);
    const time1 = Date.now() - start1;
    console.log(`✅ 100 lectures simultanées: ${time1}ms (${(time1/100).toFixed(2)}ms par lecture)`);
    
    // Test 2: Recherche pattern
    console.log('\n🔍 Test 2: Recherche par pattern');
    const start2 = Date.now();
    const keys = await client.keys('housy:*');
    const time2 = Date.now() - start2;
    console.log(`✅ Recherche pattern "housy:*": ${time2}ms - ${keys.length} clés trouvées`);
    
    // Test 3: Ping latence
    console.log('\n📡 Test 3: Latence ping (10 tests)');
    const pings = [];
    for (let i = 0; i < 10; i++) {
      const pingStart = Date.now();
      await client.ping();
      pings.push(Date.now() - pingStart);
    }
    const avgPing = pings.reduce((a, b) => a + b) / pings.length;
    console.log(`✅ Latence moyenne: ${avgPing.toFixed(2)}ms`);
    console.log(`   Min: ${Math.min(...pings)}ms, Max: ${Math.max(...pings)}ms`);
    
    // Test 4: Mémoire utilisée
    console.log('\n💾 Test 4: Utilisation mémoire');
    const info = await client.info('memory');
    const memoryLines = info.split('\r\n').filter(line => 
      line.startsWith('used_memory_human:') || 
      line.startsWith('used_memory_peak_human:')
    );
    memoryLines.forEach(line => console.log(`   ${line}`));
    
    await client.quit();
    console.log('\n🎉 Tests de performance terminés!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

performanceTest();
