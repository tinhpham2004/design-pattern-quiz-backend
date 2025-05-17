const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
console.log(`API key first 4 chars: ${API_KEY.substring(0, 4)}...`);

async function runTest() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log("Created generative AI instance");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    console.log("Got model", model.modelName);

    const prompt =
      "What are the top 3 design patterns in software engineering?";
    console.log("Sending prompt:", prompt);

    try {
      const result = await model.generateContent(prompt);
      console.log("Got result");

      if (typeof result.response.text === "function") {
        console.log("Success! Response:", result.response.text());
      } else {
        console.log(
          "Success but no text function. Raw response:",
          JSON.stringify(result.response, null, 2)
        );
      }
    } catch (error) {
      console.error("Error calling generateContent:", error.message);
      console.error("Full error:", error);
    }
  } catch (outerError) {
    console.error("Error setting up API:", outerError);
  }
}

runTest();
