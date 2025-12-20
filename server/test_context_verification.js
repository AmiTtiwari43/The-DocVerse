require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD7kzITRyaq_0Yg-RS5MCahopCThKntzyM';

async function verifyContext(symptoms) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Exact prompt from chatController.js
    const analysisPrompt = `
      Act as a medical assistant. The user has the following symptoms: "${symptoms}".
      
      Your goal is to identify the correct medical specialist for these symptoms. Use the following guide:
      - "heart", "chest pain", "palpitations" -> Cardiologist
      - "brain", "headache", "migraine", "seizure" -> Neurologist
      - "bone", "joint", "fracture", "ortho", "knee", "spine" -> Orthopedic
      - "skin", "rash", "acne", "hair" -> Dermatologist
      - "tooth", "gum", "mouth" -> Dentist
      - "eye", "vision" -> Ophthalmologist
      - "ear", "nose", "throat", "cold", "flu" -> ENT Specialist
      - "kidney", "urine" -> Nephrologist
      - "stomach", "digestion", "abdomen" -> Gastroenterologist
      - "cancer", "tumor" -> Oncologist
      - "lung", "breathing", "asthma" -> Pulmonologist
      - "child", "baby", "pediatric" -> Pediatrician
      - "women", "period", "pregnancy" -> Gynecologist
      - "mind", "depression", "anxiety" -> Psychiatrist

      If the symptoms are general (e.g., "fever", "weakness") or unclear, suggest "General Physician".

      Please analyze the input and provide the following in strictly valid JSON format (no markdown code blocks):
      {
        "specialization": "The most appropriate medical specialization (e.g., Cardiologist, Neurologist, etc.)",
        "advice": "Brief, professional medical advice (max 2 sentences)"
      }
    `;

    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(cleanJson);
    
    console.log(`Input: "${symptoms}" -> Output: ${aiData.specialization}`);
    return aiData.specialization;

  } catch (error) {
    console.error(`Error processing "${symptoms}":`, error);
  }
}

async function runTests() {
    console.log("Starting Verification...");
    await verifyContext("my heart hurts");
    await verifyContext("severe headache and brain fog");
    await verifyContext("broken bone in leg");
    await verifyContext("vision is blurry");
    await verifyContext("kidney stone pain");
    console.log("Verification Complete");
}

runTests();
