# TransIP Domain Catcher (Private Key Authentication)

Automatically monitor domains and register them as soon as they become available through the TransIP API.

This fork adds support for the official **TransIP Key Pair authentication flow**, replacing manually managed access tokens with automatic token generation and management.

The application is designed to run continuously inside Docker without requiring manual token renewal.

---

## Features

* ✅ Automatic domain availability checks
* ✅ Automatic domain registration when a domain becomes available
* ✅ Docker support
* ✅ TransIP API v6 support
* ✅ Official TransIP Key Pair authentication
* ✅ Automatic RSA-SHA512 request signing
* ✅ Automatic short-lived access token generation
* ✅ Persistent access token caching
* ✅ Safe Docker restart support
* ✅ Configurable token labels
* ✅ Configurable check intervals
* ✅ Multiple domain monitoring
* ✅ Legacy access token support

---

## Why this fork?

The original project used manually generated TransIP access tokens:

```env
TRANSIP_ACCESS_TOKEN
```

These tokens have a limited lifetime and require manual renewal.

This fork implements the official TransIP authentication flow:

```
Private Key
    ↓
RSA-SHA512 signature
    ↓
TransIP Authentication API
    ↓
Temporary Access Token
    ↓
Local Token Cache
    ↓
TransIP API
```

The application automatically:

1. Uses your TransIP private key to authenticate.
2. Requests a temporary API access token.
3. Stores the token locally.
4. Reuses the token after Docker restarts.
5. Requests a new token only when needed.

This allows the container to run continuously without manual authentication maintenance.

---

## Requirements

You need:

* Docker
* A TransIP account
* A TransIP API Key Pair

---

## TransIP Key Pair Setup

1. Log in to the TransIP control panel.
2. Create an API Key Pair.
3. Download the generated private key.
4. Store the private key locally.

Example:

```
config/transip.key
```

⚠️ Never commit this file to Git.

The private key is used only to request temporary TransIP access tokens.

---

## Configuration

Create a local `.env` file:

```env
TRANSIP_USERNAME=your_transip_username
TRANSIP_TOKEN_LABEL=transip-domain-catcher-docker
```

The token label is used to identify the generated TransIP access token.

Configure your domains in `docker-compose.yml`:

```yaml
environment:
  - TRANSIP_USERNAME=${TRANSIP_USERNAME}
  - TRANSIP_PRIVATE_KEY_FILE=/usr/src/app/config/transip.key
  - TRANSIP_TOKEN_LABEL=${TRANSIP_TOKEN_LABEL}
  - CHECK_INTERVAL_SECONDS=15
  - DOMAINS=example.com,example.org
```

---

## Running with Docker Compose

Build and start:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up -d
```

View logs:

```bash
docker compose logs -f
```

Stop the application:

```bash
docker compose down
```

The generated token cache survives container restarts through the mounted `config` directory.

---

## Authentication

This version supports two authentication methods:

| Method                          | Status                                |
| ------------------------------- | ------------------------------------- |
| TransIP Key Pair authentication | Recommended                           |
| Manual access token             | Supported for backwards compatibility |

### Key Pair authentication

Recommended method:

```env
TRANSIP_USERNAME=your_username
TRANSIP_PRIVATE_KEY_FILE=/usr/src/app/config/transip.key
```

The application automatically handles token creation and renewal.

### Legacy access token

For backwards compatibility:

```env
TRANSIP_ACCESS_TOKEN=your_token_here
```

When this variable is present, it takes priority over Key Pair authentication.

---

## File Structure

```
.
├── config
│   ├── domains.json
│   ├── transip.key              (not committed)
│   └── transip-token.json       (generated, not committed)
│
├── logs                         (not committed)
│
├── src
│   ├── auth
│   │   └── tokenManager.js
│   ├── domainCatcher.js
│   ├── index.js
│   └── transipClient.js
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Security Notes

The following files should never be committed:

```
.env
config/transip.key
config/transip-token.json
logs/
```

The application runs inside Docker as a non-root user.

The TransIP private key remains local and is never sent directly to the TransIP API. It is only used to create signed authentication requests.

---

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Test authentication:

```bash
npm run test:credentials
```

---

## Credits

Original project:

Bjornftw/transip-domain-catcher

This fork continues development with additional TransIP Key Pair authentication support.

Created with the excellent help of ChatGPT.

---

## License

MIT License
