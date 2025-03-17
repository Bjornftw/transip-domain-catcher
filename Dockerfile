FROM node:18-alpine

# Link to GitHub repository
LABEL org.opencontainers.image.source=https://github.com/Bjornftw/transip-domain-catcher

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create logs directory with proper permissions for node user
RUN mkdir -p logs && \
    chmod -R 777 logs && \
    chmod -R 777 /usr/src/app/config

# Set default environment variables
ENV TRANSIP_ACCESS_TOKEN=""
ENV CHECK_INTERVAL_SECONDS="15"
ENV DOMAINS="example.com,example.org"

# Run as non-root user for better security
USER node

CMD [ "node", "src/index.js" ]