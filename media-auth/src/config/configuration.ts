import { config as dotenv_config } from 'dotenv';

dotenv_config();

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

const config = {
  port: parseInt(process.env.PORT,10) || 3000,
  database: {
    url: getEnvOrThrow('DATABASE_URL'),
    host: getEnvOrThrow('DATABASE_HOST'),
    port: parseInt(process.env.DATABASE_PORT,10) || 5432,
    username: getEnvOrThrow('DATABASE_USERNAME'),
    password: getEnvOrThrow('DATABASE_PASSWORD'),
    database: getEnvOrThrow('DATABASE_NAME'),
  },
  rabbitMq:{
    url: getEnvOrThrow('RABBITMQ_URL'),
    host: getEnvOrThrow('RABBITMQ_HOST'),
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
  },
  jwt: {
    secret: getEnvOrThrow('JWT_SECRET'),
    expiresIn: getEnvOrThrow('JWT_EXPIRES_IN'),
  }
};

export default config;