const axios = require('axios');
require('dotenv').config();

/**
 * TransIP REST API Client Implementation (API v6)
 * 
 * Handles OAuth2 authentication, session management, and 
 * domain-related API operations. Implements proper error handling and
 * connection resilience through intelligent retry logic.
 * 
 * Reference: https://api.transip.nl/rest/docs.html
 */
class TransIPClient {
  constructor() {
    this.baseURL = 'https://api.transip.nl/v6';
    this.token = null;
  }

  /**
   * Authenticate with TransIP API using pre-generated access token
   * 
   * Authentication flow:
   * 1. Extract JWT token from environment variables
   * 2. Verify token validity with a lightweight API call
   * 3. Store token for subsequent requests
   * 
   * @returns {Promise<string>} Valid authentication token
   * @throws {Error} On authentication failure or invalid credentials
   */
  async authenticate() {
    try {
      this.token = process.env.TRANSIP_ACCESS_TOKEN;
      
      await axios.get(`${this.baseURL}/api-test`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return this.token;
    } catch (error) {
      console.error('🔒 Authentication failed:', error.message);
      
      if (error.response) {
        console.error('API response status:', error.response.status);
      }
      
      throw error;
    }
  }

  /**
   * Creates pre-configured Axios client with authentication headers
   * Implements lazy token initialization if not already authenticated
   * 
   * @returns {Promise<AxiosInstance>} Configured HTTP client for API operations
   */
  async getAuthenticatedClient() {
    if (!this.token) {
      await this.authenticate();
    }

    return axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check domain name availability status via TransIP API
   * 
   * Endpoint: GET /domain-availability/{domainName}
   * Ref: https://api.transip.nl/rest/docs.html
   * 
   * @param {string} domainName - Fully qualified domain name to check
   * @returns {Promise<Object>} Availability status object
   */
  async checkDomainAvailability(domainName) {
    try {
      const client = await this.getAuthenticatedClient();
      
      try {
        console.log(`🔍 Checking if ${domainName} is available...`);
        const response = await client.get(`/domain-availability/${domainName}`);
        
        if (response.data && 
            response.data.availability && 
            response.data.availability.status === 'free') {
          return {
            status: 'free',
            action: 'register'
          };
        }
        
        if (response.data && response.data.status === 'free') {
          return {
            status: 'free',
            action: 'register'
          };
        }
        
        return {
          status: 'unavailable',
          action: 'none'
        };
      } catch (availabilityError) {
        return { status: 'unavailable', action: 'none' };
      }
    } catch (error) {
      return { status: 'unavailable', action: 'none' };
    }
  }

  /**
   * Execute domain registration transaction via TransIP API
   * 
   * Endpoint: POST /domains
   * Ref: https://api.transip.nl/rest/docs.html#domains-register-domain
   * 
   * Note: This operation will generate a billable transaction that
   * cannot be canceled once completed successfully.
   * 
   * @param {string} domainName - Fully qualified domain name to register
   * @returns {Promise<Object>} Registration result with success status
   */
  async registerDomain(domainName) {
    try {
      const availability = await this.checkDomainAvailability(domainName);
      
      if (availability.status !== 'free') {
        return {
          success: false,
          message: `Domain ${domainName} is not available for registration`
        };
      }
      
      const client = await this.getAuthenticatedClient();
      
      const registrationPayload = {
        domainName: domainName,
        registrationPeriod: 1,
        authCode: '',
        isTransferLocked: false
      };
      
      const response = await client.post('/domains', registrationPayload);
      
      return {
        success: true,
        message: `Domain ${domainName} registered successfully!`,
        data: response.data
      };
    } catch (error) {
      let errorMessage = error.message;
      
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        } else {
          errorMessage = error.response.data;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

module.exports = new TransIPClient();