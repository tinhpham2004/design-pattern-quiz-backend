// Check if node_modules/backend exists and remove it
const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "..", "node_modules", "backend");

if (fs.existsSync(backendDir)) {
  console.log(
    `Found problematic backend directory at ${backendDir}, removing it...`
  );
  try {
    fs.rmSync(backendDir, { recursive: true, force: true });
    console.log("Successfully removed backend directory");
  } catch (err) {
    console.error("Error removing backend directory:", err);
  }
} else {
  console.log("No problematic backend directory found, continuing...");
}
