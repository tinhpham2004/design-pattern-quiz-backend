const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

// Define allowed origins based on environment
const allowedOrigins = [
  "http://localhost:3000", // Local development
  "https://SE401-Design-Pattern.onrender.com", // Render frontend
  process.env.FRONTEND_URL, // Environment variable (for flexibility)
  "https://build-aqaycn8ew-tinhs-projects.vercel.app", // Your current Vercel URL (as a backup)
  "https://build-aqaycn8ew-tinhs-projects.vercel.app/" // Your current Vercel URL with trailing slash
]
  .filter(Boolean)
  .map((url) => url); // Keep all URLs as is, including with/without trailing slashes

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      // Try to match with or without trailing slash
      const originNoSlash = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      const originWithSlash = origin.endsWith('/') ? origin : `${origin}/`;
      
      if (
        allowedOrigins.includes(origin) || 
        allowedOrigins.includes(originNoSlash) || 
        allowedOrigins.includes(originWithSlash) ||
        origin.includes('vercel.app') // Allow all vercel.app subdomains which might change on deployment
      ) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// We don't need to serve static files since the frontend is hosted separately on Vercel
// Just keeping API endpoints

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log(
  "API key (first 4 chars):",
  process.env.GEMINI_API_KEY?.substring(0, 4) + "..."
);

// Using the generation configuration explicitly to address API requirements
const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 1024, // Reducing token count to avoid quota issues
};

console.log(
  "Setting up model with generationConfig:",
  JSON.stringify(generationConfig)
);

// For @google/generative-ai version 0.24.1, using gemini-1.5-flash as suggested
let model;
try {
  model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig,
  });
  console.log("Model created successfully");
} catch (err) {
  console.error("Error creating model:", err);
}

app.post("/api/get-recommendation", async (req, res) => {
  const { prompt } = req.body;
  console.log("Received prompt:", prompt);
  try {
    console.log(
      "Calling Gemini API with model:",
      model?.modelName || "gemini-1.5-flash"
    );
    const result = await model.generateContent(prompt);
    console.log("API response received");

    // Based on our tests, we know that result.response.text is a function
    // and is the most reliable way to get the response text
    const responseText = result.response.text();
    console.log("Response text:", responseText);
    res.json({ recommendation: responseText });
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    console.error("Error details:", error.message);

    res.status(500).json({
      error: "Lỗi khi tạo đề xuất từ AI.",
      details: error.message,
      status: error.status || "unknown",
    });
  }
});

// No need to serve React app routes since frontend is on Vercel
// If you want to add a health check endpoint:
app.get("/health", (req, res) => {
  res.status(200).send("Server is running");
});

app.listen(port, () => {
  console.log(`Server đang chạy trên port ${port}`);
});
