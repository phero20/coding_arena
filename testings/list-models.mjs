import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDRudUFqh2Z39VfOWsmARPLzErOW2I-xU0";
const genAI = new GoogleGenerativeAI(API_KEY);

async function list() {
  try {
    console.log("Listing all available models for this key (v1beta)...");
    // We use v1beta instead of v1
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await res.json();
    
    if (data.models) {
      console.log("✅ Models found:");
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("❌ No models found in the response.");
      console.log("Full response:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("🔥 Error:", err.message);
  }
}

list();
