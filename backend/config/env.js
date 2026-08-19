const requiredEnvVars = [
  "MONGO_URL",
  "JWT_SECRET",
  "SALT",
  "STRIPE_SECRET_KEY",
  "FRONTEND_URL",
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
};
