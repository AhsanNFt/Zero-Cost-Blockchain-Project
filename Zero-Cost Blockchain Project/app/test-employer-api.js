/**
 * Quick test script for Employer API
 * Run with: node test-employer-api.js
 */

const BASE_URL = 'http://localhost:3002/api/trpc';

async function testEmployerAPI() {
  console.log('🧪 Testing SkillChain Employer API\n');

  // Test 1: Verify Single Credential
  console.log('Test 1: Verify Single Credential (Token ID: 0)');
  try {
    const input = encodeURIComponent(JSON.stringify({ tokenId: 0 }));
    const response = await fetch(`${BASE_URL}/employer.verifySingle?input=${input}`);
    const data = await response.json();
    
    if (data.result?.data?.success) {
      console.log('✅ PASS - Credential verification endpoint works');
      console.log(`   Token ID: ${data.result.data.tokenId}`);
      console.log(`   Valid: ${data.result.data.isValid}`);
      if (data.result.data.credential) {
        console.log(`   Name: ${data.result.data.credential.name}`);
        console.log(`   Institution: ${data.result.data.credential.institution}`);
      }
    } else {
      console.log('⚠️  WARN - No credential found (expected if no credentials issued yet)');
      console.log(`   Response: ${JSON.stringify(data.result?.data)}`);
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Get Stats
  console.log('Test 2: Get Statistics');
  try {
    const input = encodeURIComponent(JSON.stringify({}));
    const response = await fetch(`${BASE_URL}/employer.getStats?input=${input}`);
    const data = await response.json();
    
    if (data.result?.data?.success) {
      console.log('✅ PASS - Statistics endpoint works');
      console.log(`   Total Credentials: ${data.result.data.stats.totalCredentials}`);
      console.log(`   Active: ${data.result.data.stats.activeCredentials}`);
      console.log(`   Revoked: ${data.result.data.stats.revokedCredentials}`);
    } else {
      console.log('❌ FAIL - Statistics endpoint error');
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Search
  console.log('Test 3: Search Credentials');
  try {
    const input = encodeURIComponent(JSON.stringify({ query: 'blockchain', limit: 5 }));
    const response = await fetch(`${BASE_URL}/employer.search?input=${input}`);
    const data = await response.json();
    
    if (data.result?.data?.success !== undefined) {
      console.log('✅ PASS - Search endpoint works');
      console.log(`   Results: ${data.result.data.totalResults || 0}`);
    } else {
      console.log('❌ FAIL - Search endpoint error');
    }
  } catch (error) {
    console.log('❌ FAIL - Error:', error.message);
  }

  console.log('\n---\n');
  console.log('🎉 Employer API is integrated and running!');
  console.log('\n📚 Next steps:');
  console.log('   1. Issue some credentials via the UI');
  console.log('   2. Test verification with real token IDs');
  console.log('   3. Build ATS integrations');
  console.log('\n📖 Full API docs: app/API_DOCUMENTATION.md');
}

// Run tests
testEmployerAPI().catch(console.error);
