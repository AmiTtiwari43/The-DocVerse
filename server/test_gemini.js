const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = 'AIzaSyD7kzITRyaq_0Yg-RS5MCahopCThKntzyM';

async function testGemini() {
  try {
    console.log("Initializing Gemini with key ending in...", API_KEY.slice(-4));
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Say 'Hello, Doctor!' if you can hear me.";
    console.log("Sending prompt:", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Response received:", text);
    console.log("Gemini API Test: SUCCESS");
  } catch (error) {
    console.error("Gemini API Test: FAILED");
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.error(error);
  }
}

testGemini();
