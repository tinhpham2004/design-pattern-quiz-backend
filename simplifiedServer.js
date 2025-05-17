const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 5001; // Using a different port
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log(
  "API key (first 4 chars):",
  process.env.GEMINI_API_KEY?.substring(0, 4) + "..."
);

// Simplified generation configuration
const generationConfig = {
  temperature: 0.7,
  maxOutputTokens: 1024,
};

console.log("Creating Gemini model instance...");

app.get("/test", (req, res) => {
  res.json({ status: "Server is running!" });
});

app.post("/api/simple-test", async (req, res) => {
  const { prompt } = req.body;
  console.log("Received prompt:", prompt);

  try {
    // Create a fresh model instance for each request
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig,
    });

    console.log("Model created, sending prompt to API...");
    const result = await model.generateContent(prompt);
    console.log("Response received from API");

    try {
      const responseText = result.response.text();
      console.log("Response parsed successfully");
      res.json({ success: true, text: responseText });
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      res.status(500).json({
        error: "Error parsing API response",
        details: parseError.message,
      });
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.error(
      "Error details:",
      JSON.stringify({
        message: error.message,
        status: error.status,
        details: error.errorDetails,
      })
    );

    res.status(500).json({
      error: "API Error",
      details: error.message,
      status: error.status || "unknown",
    });
  }
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
