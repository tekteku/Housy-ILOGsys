const testAI = async () => {
  try {
    console.log('Testing AI Chat endpoint...');
    const chatResponse = await fetch('http://localhost:9876/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What are the most common construction materials used in Tunisia?',
        userId: 'test-user-123'
      })
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ AI Chat endpoint working:', JSON.stringify(chatData, null, 2));
    } else {
      console.log('❌ AI Chat endpoint failed:', chatResponse.status, await chatResponse.text());
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('Testing AI CSV Analysis endpoint...');
    const csvResponse = await fetch('http://localhost:9876/api/ai/analyze-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csvData: 'Material,Price,Availability\nCement,120,High\nBricks,50,Medium\nSteel,300,Low',
        query: 'Analyze these construction material prices and availability in Tunisia'
      })
    });
    
    if (csvResponse.ok) {
      const csvData = await csvResponse.json();
      console.log('✅ AI CSV Analysis endpoint working:', JSON.stringify(csvData, null, 2));
    } else {
      console.log('❌ AI CSV Analysis endpoint failed:', csvResponse.status, await csvResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testAI();
