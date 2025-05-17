// This script helps to set up environment variables for different environments
const fs = require("fs");
const path = require("path");

// Get environment variables from CLI arguments or .env file
// Priority: CLI args > process.env > .env file
const getEnvVars = () => {
  // Create backend directory if it doesn't exist
  const backendDir = path.join(__dirname, "..");
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }

  // Default values (don't include real API keys here)
  const defaultValues = {
    NODE_ENV: "production",
    PORT: process.env.PORT || "5000",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  };

  // Add sensitive variables from environment
  if (process.env.GEMINI_API_KEY) {
    defaultValues.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  }

  return defaultValues;
};

// Write environment variables to a file for build process
const writeEnvFile = (envVars) => {
  const envFilePath = path.join(__dirname, "..", ".env");
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(envFilePath, envContent);
  console.log(`Environment variables written to ${envFilePath}`);

  // Print first few characters of sensitive info for verification
  if (envVars.GEMINI_API_KEY) {
    console.log(
      "API key (first 4 chars):",
      envVars.GEMINI_API_KEY.substring(0, 4) + "..."
    );
  }
};

// Main process
const envVars = getEnvVars();

// Check if we have all required variables
if (!envVars.GEMINI_API_KEY) {
  console.error(
    "Warning: GEMINI_API_KEY is not set. Please set it in your environment variables."
  );
  process.exit(1);
}

writeEnvFile(envVars);
console.log("Environment setup complete!");
