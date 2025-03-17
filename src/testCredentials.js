require('dotenv').config();
const transipClient = require('./transipClient');

/**
 * Tests TransIP API credentials by attempting to authenticate
 * and then checking the API access with a test endpoint
 */
async function testCredentials() {
  console.log('Testing TransIP API credentials...');
  
  try {
    console.log(`Step 1: Authenticating with TransIP API using access token...`);
    await transipClient.authenticate();
    console.log('✅ Authentication successful!');
    
    console.log('\nStep 2: Testing API access with the api-test endpoint...');
    const client = await transipClient.getAuthenticatedClient();
    const response = await client.get('/api-test');
    
    if (response.status === 200) {
      console.log('✅ API access successful!');
      console.log('\nYour TransIP credentials are working correctly.');
    } else {
      console.log('❌ API access failed with status: ' + response.status);
    }
  } catch (error) {
    console.error('❌ Credential test failed:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\nAuthentication failed. Please check your access token in the .env file:');
        console.error('Make sure TRANSIP_ACCESS_TOKEN is correct and active');
      }
    } else if (error.request) {
      console.error('No response received from the API. Check your internet connection.');
    } else {
      console.error('Error:', error.message);
    }
    
    console.error('\nPlease check your .env file configuration:');
    const accessToken = process.env.TRANSIP_ACCESS_TOKEN || '';
    if (!accessToken) {
      console.error('TRANSIP_ACCESS_TOKEN=not set');
    } else if (!accessToken.startsWith('eyJ')) {
      console.error('TRANSIP_ACCESS_TOKEN=*****');
      console.error('\nWarning: Your access token does not look like a JWT token (should start with "eyJ")');
      console.error('The proper format looks like: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1...');
      console.error('Make sure you have copied the FULL token without any extra spaces or quotes.');
    } else {
      const firstPart = accessToken.substring(0, 10);
      console.error(`TRANSIP_ACCESS_TOKEN=${firstPart}***** (Access token found with JWT format)`);
    }
  }
}

if (require.main === module) {
  testCredentials().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}

module.exports = testCredentials;