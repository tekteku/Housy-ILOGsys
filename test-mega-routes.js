/**
 * Test script for mega routes integration
 * Tests basic functionality and endpoint availability
 */

const baseUrl = 'http://localhost:9876/api/mega';

// Test endpoints with simple GET requests
const testEndpoints = [
  { 
    path: '/health', 
    description: 'Health check endpoint',
    expectAuth: false 
  },
  { 
    path: '/info', 
    description: 'API information endpoint',
    expectAuth: false 
  },
  { 
    path: '/users', 
    description: 'Get all users',
    expectAuth: false 
  },
  { 
    path: '/projects', 
    description: 'Get all projects',
    expectAuth: false 
  },
  { 
    path: '/materials', 
    description: 'Get all materials',
    expectAuth: false 
  }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Testing ${endpoint.description}...`);
    console.log(`   URL: ${baseUrl}${endpoint.path}`);
    
    const response = await fetch(`${baseUrl}${endpoint.path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`   📊 Response preview:`, 
        typeof data === 'object' ? JSON.stringify(data).substring(0, 100) + '...' : data.substring(0, 100)
      );
      
      // Check for expected response structure
      if (typeof data === 'object' && data.success !== undefined) {
        console.log(`   🎯 API Response Format: ${data.success ? 'SUCCESS' : 'ERROR'}`);
        if (data.data) {
          console.log(`   📈 Data Count: ${Array.isArray(data.data) ? data.data.length : 'Object'}`);
        }
      }
    } else {
      console.log(`   ❌ Error Response:`, data);
    }
    
    return { endpoint: endpoint.path, status: response.status, success: response.ok, data };
    
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    return { endpoint: endpoint.path, status: 'ERROR', success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Mega Routes Integration Tests...');
  console.log('=' * 60);
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n' + '=' * 60);
  console.log('📊 TEST SUMMARY');
  console.log('=' * 60);
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 All tests passed! Mega routes integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  // Detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint} - Status: ${result.status}`);
  });
}

// Wait for server to be ready before running tests
setTimeout(() => {
  runTests().catch(console.error);
}, 3000); // Wait 3 seconds for server startup
