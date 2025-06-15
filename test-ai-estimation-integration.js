// Test AI Estimation Integration with Configured API Keys
// This script tests the LLM integration with JSON data

import fetch from 'node-fetch';

const testAIEstimation = async () => {
  console.log('🤖 Testing AI Estimation with Configured API Keys...');
  console.log('================================================');

  // Test OpenAI API
  console.log('\n1. Testing OpenAI GPT-4 Integration...');
  try {
    const openAIResponse = await fetch('http://localhost:3000/api/ai/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectDescription: 'Construction d\'une villa de 150m² avec 3 chambres, 2 salles de bain, cuisine ouverte sur salon, en Tunisie',
        location: 'Tunis',
        model: 'openai'
      })
    });
    
    if (openAIResponse.ok) {
      const result = await openAIResponse.json();
      console.log('✅ OpenAI Integration: SUCCESS');
      console.log('📊 Estimation Preview:', result.estimation?.substring(0, 200) + '...');
    } else {
      console.log('❌ OpenAI Integration: FAILED', await openAIResponse.text());
    }
  } catch (error) {
    console.log('❌ OpenAI Integration Error:', error.message);
  }

  // Test Claude API
  console.log('\n2. Testing Claude Integration...');
  try {
    const claudeResponse = await fetch('http://localhost:3000/api/ai/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectDescription: 'Rénovation d\'un appartement de 80m² avec nouvelle cuisine et salle de bain',
        location: 'Sfax',
        model: 'claude'
      })
    });
    
    if (claudeResponse.ok) {
      const result = await claudeResponse.json();
      console.log('✅ Claude Integration: SUCCESS');
      console.log('📊 Estimation Preview:', result.estimation?.substring(0, 200) + '...');
    } else {
      console.log('❌ Claude Integration: FAILED', await claudeResponse.text());
    }
  } catch (error) {
    console.log('❌ Claude Integration Error:', error.message);
  }

  // Test DeepSeek API
  console.log('\n3. Testing DeepSeek Integration...');
  try {
    const deepSeekResponse = await fetch('http://localhost:3000/api/ai/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectDescription: 'Construction d\'un garage de 40m² avec accès électrique',
        location: 'Sousse',
        model: 'deepseek'
      })
    });
    
    if (deepSeekResponse.ok) {
      const result = await deepSeekResponse.json();
      console.log('✅ DeepSeek Integration: SUCCESS');
      console.log('📊 Estimation Preview:', result.estimation?.substring(0, 200) + '...');
    } else {
      console.log('❌ DeepSeek Integration: FAILED', await deepSeekResponse.text());
    }
  } catch (error) {
    console.log('❌ DeepSeek Integration Error:', error.message);
  }

  // Test JSON Data Integration
  console.log('\n4. Testing JSON Material Data Integration...');
  try {
    const materialsResponse = await fetch('http://localhost:3000/api/materials');
    
    if (materialsResponse.ok) {
      const materials = await materialsResponse.json();
      console.log('✅ Material Database: SUCCESS');
      console.log('📦 Total Materials Available:', materials.length);
      console.log('🏗️ Sample Materials:', materials.slice(0, 3).map(m => m.nom).join(', '));
    } else {
      console.log('❌ Material Database: FAILED');
    }
  } catch (error) {
    console.log('❌ Material Database Error:', error.message);
  }

  console.log('\n🎉 AI Estimation Test Complete!');
  console.log('💡 Visit http://localhost:3000 to use the interface');
};

// Run the test
testAIEstimation().catch(console.error);
