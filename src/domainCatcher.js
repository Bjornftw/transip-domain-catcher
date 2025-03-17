const fs = require('fs').promises;
const path = require('path');
const transipClient = require('./transipClient');

/**
 * Domain acquisition and monitoring orchestration system
 * 
 * Implements a stateful FSM (Finite State Machine) that:
 * 1. Loads domain targets from env vars or config file
 * 2. Polls DNS registries for availability status
 * 3. Executes immediate registration when domains become available
 * 4. Maintains persistent state to prevent duplicate registration
 * 5. Provides detailed logging for audit and debugging
 */
class DomainCatcher {
  constructor() {
    this.domainConfigPath = path.join(__dirname, '../config/domains.json');
    this.logPath = path.join(__dirname, '../logs');
    this.domains = [];
    this.registeredDomains = [];
  }

  /**
   * Parse domain acquisition targets from configuration sources
   * Implements a multi-source fallback strategy with env var priority
   * @returns {Promise<void>} Resolves when domain list is loaded
   * @throws {Error} On I/O or parsing failures
   */
  async loadDomains() {
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      cyan: '\x1b[36m',
      blue: '\x1b[34m'
    };
    
    try {
      const envDomains = process.env.DOMAINS;
      
      if (envDomains) {
        this.domains = envDomains.split(',').map(domain => domain.trim()).filter(Boolean);
        console.log(`\n${colors.green}✅ Loaded ${colors.bright}${this.domains.length} domain(s)${colors.reset} from environment variables`);
      } else {
        const data = await fs.readFile(this.domainConfigPath, 'utf8');
        this.domains = JSON.parse(data);
        console.log(`\n${colors.green}✅ Loaded ${colors.bright}${this.domains.length} domain(s)${colors.reset} from config file`);
      }
      
      console.log(`${colors.blue}📋 Domains to monitor:${colors.reset}`);
      this.domains.forEach(domain => {
        console.log(`  ${colors.yellow}→ ${domain}${colors.reset}`);
      });
      console.log('');
    } catch (error) {
      console.error(`${colors.red}❌ Failed to load domains: ${error.message}${colors.reset}`);
      throw new Error(`Could not load domain list: ${error.message}`);
    }
  }

  /**
   * Persist domain status events to filesystem for audit and forensics
   * Implements atomic append operations with proper error handling
   * 
   * @param {string} domain - The domain name that generated the event
   * @param {string} status - Normalized status code (uppercase)
   * @param {string} message - Human-readable event description
   * @returns {Promise<void>} Resolves when log entry is persisted
   */
  async logEvent(domain, status, message) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp} - Domain: ${domain} - Status: ${status} - ${message}\n`;
      
      await fs.mkdir(this.logPath, { recursive: true }).catch(err => {});
      
      const logFile = path.join(this.logPath, `domain-catcher-${new Date().toISOString().split('T')[0]}.log`);
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  /**
   * Primary domain monitoring and acquisition routine
   * Implements the core business logic of domain registration
   * 
   * Process flow:
   * 1. Load target domains from configuration sources
   * 2. For each domain, check availability status via TransIP API
   * 3. If domain becomes available, execute registration sequence
   * 4. Track successful registrations to prevent duplicates
   * 5. Log all events for audit trail
   * 
   * @returns {Promise<void>} Resolves when all domains have been processed
   */
  async checkAndRegisterDomains() {
    await this.loadDomains();
    
    for (const domain of this.domains) {
      if (this.registeredDomains.includes(domain)) {
        console.log(`⏭️ Domain ${domain} already registered in this session, skipping`);
        continue;
      }

      const availability = await transipClient.checkDomainAvailability(domain);
      
      if (availability.status === 'free') {
        console.log(`🎯 Domain ${domain} is available! Attempting to register...`);
        await this.logEvent(domain, 'FREE', 'Domain is available for registration');
        
        const result = await transipClient.registerDomain(domain);
        
        if (result.success) {
          console.log(`🎉 Successfully registered ${domain}!`);
          await this.logEvent(domain, 'REGISTERED', 'Domain registration successful');
          this.registeredDomains.push(domain);
        } else {
          console.error(`❌ Failed to register ${domain}: ${result.message}`);
          await this.logEvent(domain, 'REGISTRATION_FAILED', result.message);
        }
      } else {
        console.log(`ℹ️ ${domain} is not available for registration`);
        await this.logEvent(domain, 'UNAVAILABLE', 'Domain not available for registration');
      }
    }
  }
}

module.exports = new DomainCatcher();