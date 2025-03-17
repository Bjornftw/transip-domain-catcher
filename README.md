# TransIP Domain Catcher

[![GitHub Stars](https://img.shields.io/github/stars/Bjornftw/transip-domain-catcher?style=flat-square)](https://github.com/Bjornftw/transip-domain-catcher/stargazers)
[![Docker Pulls](https://img.shields.io/docker/pulls/bjornftw/transip-domain-catcher?style=flat-square)](https://hub.docker.com/r/bjornftw/transip-domain-catcher)
[![Docker Image Size](https://img.shields.io/docker/image-size/bjornftw/transip-domain-catcher?style=flat-square)](https://hub.docker.com/r/bjornftw/transip-domain-catcher)

A tool to automatically monitor and register domains coming out of quarantine or becoming available for registration. This tool uses the TransIP API v6 to check domain availability and register domains when they become available.

> ⚠️ **IMPORTANT FINANCIAL WARNING**: When this tool successfully registers a domain, TransIP will **automatically generate an invoice** that you are obligated to pay. Domain registrations **cannot be canceled** once completed. Please ensure you only monitor domains you genuinely intend to purchase.

## Features

- Monitor multiple domains simultaneously
- Automatic domain registration when domains become available
- Configurable check frequency
- Detailed logging
- Simple Docker or Node.js deployment

## Prerequisites

- Node.js 14.x or higher (for Node.js approach)
- Docker and docker-compose (for Docker approach, recommended)
- TransIP account with API v6 access enabled

## Getting Started

### Obtaining a TransIP Access Token

1. Log in to your TransIP control panel
2. Go to "My Account" > "API"
3. Generate an Access Token
4. Copy the displayed access token immediately (it's only shown once)

**Important Notes on Access Token:**
- The access token is am Acces Token that looks like a long string of random 
  characters.
- Example format: `eyJ0e...`
- Copy the entire token without any extra spaces or quotes

### Required Configuration

The application needs these configuration values:

- `TRANSIP_ACCESS_TOKEN`: Your TransIP access token (from steps above)
- `DOMAINS`: Comma-separated list of domains to monitor (e.g., `example.com,example.org`)
- `CHECK_INTERVAL_SECONDS`: How often to check domain availability (in seconds)

> **⚠️ Rate Limit Warning**: TransIP API has rate limits. Setting too low a check interval may result in your requests being rate-limited. Consider using 15-30 seconds as a reasonable interval.

## Quick Start

The fastest way to get started is with Docker:

```bash
docker run -d \
  --name transip-domain-catcher \
  --restart unless-stopped \
  -e TRANSIP_ACCESS_TOKEN=your_access_token_here \
  -e CHECK_INTERVAL_SECONDS=15 \
  -e DOMAINS=example.com,example.org \
  -v "$(pwd)/logs:/usr/src/app/logs" \
  -v "$(pwd)/config:/usr/src/app/config" \
  bjornftw/transip-domain-catcher:latest
```

Just replace `your_access_token` with your TransIP API token and the domains with the ones you want to monitor!

## Installation

### Option 1: Docker (Recommended)

```bash
docker pull bjornftw/transip-domain-catcher
```

### Option 2: Clone from GitHub

```bash
git clone https://github.com/Bjornftw/transip-domain-catcher.git
cd transip-domain-catcher
```

## Usage

There are two ways to run this application:

<table>
<tr>
<td width="50%" align="center">
<h3>🐳 Docker (Recommended)</h3>
</td>
<td width="50%" align="center">
<h3>⚙️ Node.js</h3>
</td>
</tr>
</table>

### 🐳 Docker Approach (Recommended)

Easy deployment with built-in restart and isolation.

> ⚠️ **Reminder**: Only include domains you truly intend to purchase in the DOMAINS variable, as successful registrations will incur non-cancellable charges.

#### Setup with docker-compose

1. Edit your environment in `docker-compose.yml`:
   ```yaml
   environment:
     - TRANSIP_ACCESS_TOKEN=your_access_token
     - DOMAINS=example.com,example.org
     - CHECK_INTERVAL_SECONDS=15
   ```

2. Start the container:
   ```bash
   docker-compose up -d
   ```

3. View logs:
   ```bash
   docker-compose logs -f
   ```

#### Test TransIP Credentials in Docker

```bash
docker run --rm \
  -e TRANSIP_ACCESS_TOKEN=your_access_token \
  bjornftw/transip-domain-catcher npm run test:credentials
```
### ⚙️ Node.js Approach

Direct installation on your system.

> ⚠️ **Reminder**: Only include domains you truly intend to purchase, as successful registrations will incur non-cancellable charges.

#### Setup with Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your `.env` file:
   ```
   TRANSIP_ACCESS_TOKEN=your_access_token
   DOMAINS=example.com,example.org
   CHECK_INTERVAL_SECONDS=15
   ```

3. Start the application:
   ```bash
   npm start
   ```

   > **Note**: For production use, consider a process manager like [PM2](https://pm2.keymetrics.io/) to keep the application running.

#### Test TransIP Credentials with Node.js

```bash
npm run test:credentials
```

## Logs

Logs are stored in the `logs` directory with daily rotation.

## Development

### Running Tests

```
npm test
```

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License

[MIT](LICENSE)

## Disclaimer

This tool is provided as-is. Please use responsibly and in accordance with all applicable terms of service for domain registrars.

## Support the Project

If you find this tool useful, consider:

- ⭐ Starring the repository on GitHub
- 🐳 Leaving a star on Docker Hub 
- 🐞 Reporting bugs by creating issues
- 🛠️ Submitting pull requests for features or fixes