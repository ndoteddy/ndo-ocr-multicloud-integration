require('dotenv').config();

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8000,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  apiKey: requireEnv('API_KEY', process.env.NODE_ENV === 'test' ? 'test-api-key' : undefined),
  mongo: {
    uri: requireEnv('MONGODB_URI', process.env.NODE_ENV === 'test' ? 'mongodb://test' : undefined),
    dbName: process.env.MONGODB_DB_NAME || 'dbnando_demo',
    collection: process.env.MONGODB_COLLECTION || 'image_analysis_with_rekognition',
  },
  kafka: {
    producerUrl: requireEnv('KAFKA_PRODUCER_URL', process.env.NODE_ENV === 'test' ? 'http://test' : undefined),
    producerAuth: requireEnv('KAFKA_PRODUCER_AUTH', process.env.NODE_ENV === 'test' ? 'test-auth' : undefined),
  },
};

module.exports = env;
