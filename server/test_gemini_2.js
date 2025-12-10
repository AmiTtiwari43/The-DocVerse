const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = 'AIzaSyD7kzITRyaq_0Yg-RS5MCahopCThKntzyM';

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Trying the model name exactly as it was in the controller
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

    const symptoms = "headache and fever";
    const prompt = `
      Act as a medical assistant. The user has the following symptoms: "${symptoms}".
      
      Please analyze these symptoms and provide the following in strictly valid JSON format (no markdown code blocks):
      {
        "specialization": "The most appropriate medical specialization for these symptoms (e.g., General Physician, Cardiologist, Dermatologist, etc.)",
        "advice": "Brief, professional medical advice (max 2 sentences)",
        "foodTips": ["Food tip 1", "Food tip 2", "Food tip 3"]
      }
    `;

    console.log("Sending prompt to gemini-2.0-flash...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log("Raw Response:", responseText);
    
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(cleanJson);
    console.log("Parsed JSON:", aiData);
    
  } catch (error) {
    console.error("Test Failed:", error);
  }
}

testGemini();
