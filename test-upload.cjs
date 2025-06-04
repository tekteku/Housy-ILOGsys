/**
 * Test file upload functionality for mega routes
 */

const fs = require('fs');
const FormData = require('form-data');

async function testFileUpload() {
  try {
    console.log('🧪 Testing document upload functionality...');
    
    // Create form data
    const form = new FormData();
    form.append('documents', fs.createReadStream('./test-document.txt'));
    form.append('projectId', '1');
    form.append('category', 'test');
    form.append('description', 'Test document upload via mega routes');
    
    // Send request
    const response = await fetch('http://localhost:9876/api/mega/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        ...form.getHeaders()
      },
      body: form
    });
    
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ File upload test passed!');
      console.log(`📄 Uploaded ${result.count} document(s)`);
    } else {
      console.log('❌ File upload test failed!');
    }
    
  } catch (error) {
    console.error('💥 Upload test error:', error.message);
  }
}

// Add delay to ensure server is ready
setTimeout(testFileUpload, 1000);
