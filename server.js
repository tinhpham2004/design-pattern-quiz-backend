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
  "https://build-aqaycn8ew-tinhs-projects.vercel.app", // Previous Vercel URL
  "https://build-aqaycn8ew-tinhs-projects.vercel.app/", // Previous Vercel URL with trailing slash
  "https://build-ospfw1o9q-tinhs-projects.vercel.app", // Current Vercel URL
  "https://build-ospfw1o9q-tinhs-projects.vercel.app/", // Current Vercel URL with trailing slash
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
      const originNoSlash = origin.endsWith("/") ? origin.slice(0, -1) : origin;
      const originWithSlash = origin.endsWith("/") ? origin : `${origin}/`;

      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(originNoSlash) ||
        allowedOrigins.includes(originWithSlash) ||
        origin.includes("vercel.app") // Allow all vercel.app subdomains which might change on deployment
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

// Check if API key is available and use a fallback mechanism for development/testing
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("WARNING: GEMINI_API_KEY is not set in environment variables!");
  console.error("API calls to Gemini will fail. Please set this in Render dashboard.");
}

const genAI = new GoogleGenerativeAI(apiKey);

console.log(
  "API key status:",
  apiKey ? `Present (first 4 chars: ${apiKey.substring(0, 4)}...)` : "MISSING"
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
    res.json({ recommendation: responseText });  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    console.error("Error details:", error.message);

    // Check if the error is related to missing API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("API KEY IS MISSING - This is causing the error");
    }

    // Provide a more helpful error message based on the problem
    let errorMessage = "Lỗi khi tạo đề xuất từ AI.";
    if (!process.env.GEMINI_API_KEY) {
      errorMessage = "Chưa cấu hình API key cho Google Gemini AI. Vui lòng liên hệ quản trị viên.";
    } else if (error.message?.includes("quota")) {
      errorMessage = "Đã vượt quá giới hạn quota của Google AI API. Vui lòng thử lại sau.";
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message,
      status: error.status || "unknown",
      missingKey: !process.env.GEMINI_API_KEY
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
