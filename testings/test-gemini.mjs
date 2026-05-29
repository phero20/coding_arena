import { GoogleGenerativeAI } from "@google/generative-ai";

// NEW KEY
const API_KEY = process.env.GEMINI_API_KEY; // Removed hardcoded key for security
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  try {
    console.log("Checking Gemini access...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say 'Gemini is working!'");
    console.log("✅ SUCCESS:", result.response.text());
  } catch (err) {
    console.error("❌ FAILED:", err.message);
    
    console.log("\nAttempting fallback to gemini-pro (1.0)...");
    try {
        const fallback = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await fallback.generateContent("Say 'Gemini 1.0 is working!'");
        console.log("✅ FALLBACK SUCCESS:", result.response.text());
    } catch (err2) {
        console.error("❌ FALLBACK FAILED:", err2.message);
    }
  }
}

test();
