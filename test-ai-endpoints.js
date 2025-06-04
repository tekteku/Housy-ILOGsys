// Simple test script for AI endpoints
const testAIEndpoints = async () => {
  const baseUrl = 'http://localhost:9876/api/ai';
  
  console.log('Testing AI endpoints...');
  
  // Test the GET /test endpoint
  try {
    const testResponse = await fetch(`${baseUrl}/test`);
    const testData = await testResponse.json();
    console.log('✅ AI Test endpoint:', testData);
  } catch (error) {
    console.error('❌ AI Test endpoint failed:', error);
  }
  
  // Test the POST /chat endpoint
  try {
    const chatResponse = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        context: {},
        conversationId: 'test-conversation-123'
      })
    });
    const chatData = await chatResponse.json();
    console.log('✅ AI Chat endpoint:', chatData);
  } catch (error) {
    console.error('❌ AI Chat endpoint failed:', error);
  }
  
  // Test the POST /analyze-csv endpoint
  try {
    const csvData = [
      { name: 'Project A', cost: 1000, duration: 30 },
      { name: 'Project B', cost: 2000, duration: 45 },
      { name: 'Project C', cost: 1500, duration: 60 }
    ];
    
    const analyzeResponse = await fetch(`${baseUrl}/analyze-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: csvData,
        analysisType: 'general'
      })
    });
    const analyzeData = await analyzeResponse.json();
    console.log('✅ AI Analyze CSV endpoint:', analyzeData);
  } catch (error) {
    console.error('❌ AI Analyze CSV endpoint failed:', error);
  }
};

// Run the tests
testAIEndpoints();
