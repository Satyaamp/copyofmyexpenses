const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listMyModels() {
  console.log("Checking your API Key...");
  try {
    // This is a special request to get the system configuration
    // We try to verify the key by running a tiny valid request on the ONE model we knew existed (even if rate limited)
    // to prove the key works, then we print the error if it fails.
    
    // Actually, let's brute-force check the most common names to see which one returns "SUCCESS"
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-8b",
        "gemini-pro",
        "gemini-1.0-pro",
        "gemini-flash-latest" 
    ];

    console.log(`\nTesting ${candidates.length} model names with your NEW key...`);
    console.log("---------------------------------------------------");

    for (const modelName of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            await model.generateContent("Test");
            console.log(`✅ WORKS:      ${modelName}`);
        } catch (error) {
            if (error.message.includes("404")) {
                console.log(`❌ NOT FOUND:  ${modelName}`);
            } else if (error.message.includes("429")) {
                console.log(`⚠️ LIMIT HIT:  ${modelName} (Exists! But busy)`);
            } else {
                console.log(`❌ ERROR:      ${modelName} (${error.message.split('[')[0]})`);
            }
        }
    }
    console.log("---------------------------------------------------");

  } catch (err) {
    console.error("Critical Error:", err);
  }
}

listMyModels();