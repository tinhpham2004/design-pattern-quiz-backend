const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

async function testGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };
  const modelNames = [
    "gemini-1.5-flash", // As suggested in the error message
  ];

  for (const modelName of modelNames) {
    console.log(`\nTesting model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
      });

      const prompt = "Tell me a short joke about programming";
      console.log("Sending prompt:", prompt);
      const result = await model.generateContent(prompt);
      console.log("Test successful!");
      console.log("Full response object:", JSON.stringify(result, null, 2));
      console.log("Response properties:", Object.keys(result));
      console.log(
        "Response.response properties:",
        Object.keys(result.response)
      );

      if (typeof result.response.text === "function") {
        console.log("Response text (from function):", result.response.text());
      } else {
        console.log("Direct text property does not exist or is not a function");
      }

      if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(
          "Response text (from candidates):",
          result.response.candidates[0].content.parts[0].text
        );
      } else {
        console.log("No text found in candidates structure");
      }
      return; // Stop after first successful test
    } catch (error) {
      console.error(`Error with ${modelName}:`, error.message);
    }
  }
}

testGemini().catch(console.error);
