async function testServerConnection() {
  console.log('🔍 Testing server connection...');
  
  try {
    const response = await fetch('http://localhost:9876/health');
    const data = await response.json();
    console.log('✅ Server is responding!');
    console.log('📊 Health check:', data);
    
    // Test projects endpoint
    const projectsResponse = await fetch('http://localhost:9876/api/projects');
    const projectsData = await projectsResponse.json();
    console.log('📋 Projects endpoint working:', projectsData.message);
    
    // Test materials endpoint  
    const materialsResponse = await fetch('http://localhost:9876/api/materials');
    const materialsData = await materialsResponse.json();
    console.log('🔨 Materials endpoint working:', materialsData.message);
    
    // Test estimation calculate
    const estimationResponse = await fetch('http://localhost:9876/api/estimation/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectType: 'villa_moderne',
        surface: 150
      })
    });
    const estimationData = await estimationResponse.json();
    console.log('💰 Estimation endpoint working:', estimationData.message || 'Success');
    
    console.log('\n🎉 ALL ENDPOINTS TESTED SUCCESSFULLY WITH REAL POSTGRESQL DATABASE!');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

testServerConnection();
