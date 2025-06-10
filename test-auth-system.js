/**
 * Test script for the authentication system
 * Tests all auth endpoints and functionality
 */

const baseUrl = 'http://localhost:9876';

// Test data
const testUser = {
  email: 'test@housy.tn',
  password: 'Test123!@#',
  fullName: 'Test User',
  role: 'client'
};

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Register new user
    console.log('1️⃣ Testing User Registration...');
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful:', registerData.message);
    } else {
      const error = await registerResponse.json();
      console.log('⚠️ Registration response:', error.message);
    }

    // Test 2: Login with credentials
    console.log('\n2️⃣ Testing User Login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    let accessToken = null;
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      accessToken = loginData.accessToken;
      console.log('✅ Login successful');
      console.log('👤 User role:', loginData.user.role);
      console.log('🔑 Token received:', accessToken ? 'Yes' : 'No');
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.message);
    }

    // Test 3: Access protected route
    if (accessToken) {
      console.log('\n3️⃣ Testing Protected Route Access...');
      const protectedResponse = await fetch(`${baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (protectedResponse.ok) {
        const profileData = await protectedResponse.json();
        console.log('✅ Protected route access successful');
        console.log('👤 Profile data:', profileData.user);
      } else {
        console.log('❌ Protected route access failed');
      }
    }

    // Test 4: Test token refresh
    console.log('\n4️⃣ Testing Token Refresh...');
    const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include HTTP-only cookies
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      console.log('✅ Token refresh successful');
      console.log('🔄 New token received:', refreshData.accessToken ? 'Yes' : 'No');
    } else {
      const error = await refreshResponse.json();
      console.log('⚠️ Token refresh response:', error.message);
    }

    // Test 5: Logout
    console.log('\n5️⃣ Testing Logout...');
    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (logoutResponse.ok) {
      console.log('✅ Logout successful');
    } else {
      console.log('❌ Logout failed');
    }

    console.log('\n🎉 Authentication system test completed!');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testAuth();
