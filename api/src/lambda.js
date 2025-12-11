'use strict';

const express = require('express');
const serverless = require('serverless-http');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Initialize express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize AWS Secrets Manager client
const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

/**
 * Loads secrets from AWS Secrets Manager
 * @returns {Promise<Object>} Parsed secrets object
 */
async function loadSecrets() {
  if (process.env.IS_OFFLINE === 'true') {
    console.log('Running offline, using .env file');
    require('dotenv').config();
    return process.env;
  }

  const secretId = process.env.Secrets_ID;
  if (!secretId) {
    console.warn('No Secrets_ID environment variable found');
    return {};
  }

  try {
    console.log(`Fetching secrets from AWS Secrets Manager: ${secretId}`);
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretId,
      })
    );

    if (!response.SecretString) {
      console.warn('No secret string found in the response');
      return {};
    }

    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error('Error fetching secrets:', error.message);
    return {}; // Return empty object to prevent cold start failures
  }
}

// Initialize secrets on cold start
let isColdStart = true;

const wrappedHandler = async (event, context) => {
  // Only load secrets on cold start
  if (isColdStart) {
    try {
      const secrets = await loadSecrets();
      // Merge secrets into process.env
      Object.entries(secrets).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          process.env[key] = String(value);
        }
      });
      console.log('Secrets loaded successfully');
    } catch (error) {
      console.error('Error in cold start initialization:', error.message);
      // Don't throw to allow the Lambda to continue
    } finally {
      isColdStart = false;
    }
  }

  // Wrap the Express app with serverless-http for each request
  const handler = serverless(app);
  return handler(event, context);
};

// For local development with serverless-offline
if (process.env.IS_OFFLINE === 'true') {
  console.log('Running in offline mode');
  const port = process.env.PORT || 4000;
  const server = app.listen(port, () => {
    console.log(`Serverless offline running on http://localhost:${port}`);
    console.log(`Health check at http://localhost:${port}/health`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please stop the other process or set a different PORT environment variable.`);
    } else {
      console.error('Server error:', error);
    }
    process.exit(1);
  });
}

// Export the handler for AWS Lambda
// Export both handler and wrappedHandler for compatibility
module.exports = { 
  handler: wrappedHandler,
  wrappedHandler 
};
