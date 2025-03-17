const domainCatcher = require('./domainCatcher');
const transipClient = require('./transipClient');
require('dotenv').config();

const checkIntervalSeconds = parseInt(process.env.CHECK_INTERVAL_SECONDS || 15);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`\n${colors.bright}${colors.cyan}🚀 TransIP Domain Catcher v0.1.0${colors.reset} starting...`);
console.log(`⏱️  Checking domains every ${colors.yellow}${checkIntervalSeconds} seconds${colors.reset}`);

/**
 * OAuth2 token verification and API access validation 
 * Establishes a secure session with the TransIP API endpoint
 * @returns {Promise<boolean>} Authentication state (true = valid session)
 */
async function verifyCredentials() {
  console.log(`\n${colors.yellow}🔑 Connecting to TransIP API...${colors.reset}`);
  
  try {
    await transipClient.authenticate();
    console.log(`${colors.green}✅ Connection successful${colors.reset}`);
    console.log(`${colors.green}✅ Connected successfully${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Connection to TransIP failed${colors.reset}`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    
    if (error.response) {
      console.error(`${colors.red}Status: ${error.response.status}${colors.reset}`);
      console.error(`${colors.red}Details: ${JSON.stringify(error.response.data)}${colors.reset}`);
    }
    
    console.error(`\n${colors.bright}Please check your credentials in the .env file${colors.reset}`);
    console.error(`Tip: Run ${colors.yellow}npm run test:credentials${colors.reset} for more details\n`);
    return false;
  }
}

/**
 * Primary domain availability scanner with async I/O operations
 * Implements non-blocking event loop for concurrent domain processing
 * Uses deterministic timing for precise interval control
 */
async function runDomainCheck() {
  const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
  console.log(`${colors.cyan}🔄 Starting domain checks [${timestamp}]${colors.reset}`);
  try {
    await domainCatcher.checkAndRegisterDomains();
    console.log(`${colors.green}✅ Finished checking all domains${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error checking domains: ${error.message}${colors.reset}`);
  }
  
  setTimeout(runDomainCheck, checkIntervalSeconds * 1000);
}

/**
 * Application entry point and orchestration controller
 * Initializes authentication, monitoring and signal handlers
 * Manages the primary event loop and lifecycle operations
 */
async function start() {
  const credentialsValid = await verifyCredentials();
  
  if (credentialsValid) {
    console.log(`${colors.bright}🔍 Starting domain monitoring...${colors.reset}`);
    runDomainCheck();
  } else {
    console.error(`${colors.red}${colors.bright}🛑 Stopping: Could not connect to TransIP${colors.reset}`);
    process.exit(1);
  }
}

start();

process.on('SIGINT', () => {
  console.log('💤 Received shutdown signal, stopping...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('💤 Received termination signal, stopping...');
  process.exit(0);
});