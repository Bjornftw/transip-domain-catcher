const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

class TokenManager {
  constructor() {
    this.baseURL = 'https://api.transip.nl/v6';
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Returns a valid TransIP access token.
   * Uses existing token when available, otherwise creates one.
   */
  async getToken() {
    // Backwards compatibility
    if (process.env.TRANSIP_ACCESS_TOKEN) {
      return process.env.TRANSIP_ACCESS_TOKEN;
    }

    // Return cached token if still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    return await this.createToken();
  }

  /**
   * Creates a new TransIP access token using a Key Pair.
   */
  async createToken() {
    const username = process.env.TRANSIP_USERNAME;
    const keyFile = process.env.TRANSIP_PRIVATE_KEY_FILE;

    if (!username) {
      throw new Error('TRANSIP_USERNAME is missing');
    }

    if (!keyFile) {
      throw new Error('TRANSIP_PRIVATE_KEY_FILE is missing');
    }

    const privateKey = fs.readFileSync(keyFile, 'utf8');

    const body = {
      login: username,
      nonce: crypto.randomBytes(16).toString('hex'),
      read_only: false,
      expiration_time: '30 minutes',
      label: process.env.TRANSIP_TOKEN_LABEL || 'transip-domain-catcher',
      global_key: true
    };

    const bodyString = JSON.stringify(body);

    const signer = crypto.createSign('RSA-SHA512');
    signer.update(bodyString);
    signer.end();

    const signature = signer
      .sign(privateKey)
      .toString('base64');

    const response = await axios.post(
      `${this.baseURL}/auth`,
      body,
      {
        headers: {
          Signature: signature,
          'Content-Type': 'application/json'
        }
      }
    );

    this.token = response.data.token;

    // TransIP tokens are short lived.
    // Refresh a little before expiry.
    this.tokenExpiry = new Date(Date.now() + (25 * 60 * 1000));

    return this.token;
  }
}

module.exports = new TokenManager();
