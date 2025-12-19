const { GoogleGenerativeAI } = require("@google/generative-ai");
const Doctor = require('../models/Doctor');
const Chat = require('../models/Chat');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyD7kzITRyaq_0Yg-RS5MCahopCThKntzyM');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Get chat history for a user
exports.getChatHistory = async (req, res) => {
  try {
    const history = await Chat.find({ userId: req.user.id })
      .sort({ createdAt: 1 }) // Oldest first
      .limit(50); // Limit to last 50 messages
    
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat history" });
  }
};

// Process new user message
exports.processChat = async (req, res) => {
  try {
    const { symptoms, city } = req.body;
    const userId = req.user.id;

    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // 1. Save User Message
    const userChat = await Chat.create({
      userId,
      role: 'user',
      content: symptoms,
    });

    // 2. Ask AI to analyze symptoms and suggest specialization
    const analysisPrompt = `
      Act as a medical assistant. The user has the following symptoms: "${symptoms}".
      
      Your goal is to identify the correct medical specialist for these symptoms. Use the following guide:
      - "heart", "chest pain", "palpitations", "pulse", "pressure", "attack", "cardiac" -> Cardiologist
      - "brain", "headache", "migraine", "seizure", "dizzy", "vertigo", "stroke", "paralysis", "nerve" -> Neurologist
      - "bone", "joint", "fracture", "ortho", "knee", "spine", "back", "muscle", "ligament", "arthritis" -> Orthopedic
      - "skin", "rash", "acne", "hair", "itch", "mole", "eczema", "psoriasis" -> Dermatologist
      - "tooth", "gum", "mouth" -> Dentist
      - "eye", "vision" -> Ophthalmologist
      - "ear", "nose", "throat", "cold", "flu", "sinus", "voice", "swallow", "hearing" -> ENT Specialist
      - "kidney", "urine" -> Nephrologist
      - "stomach", "digestion", "abdomen", "gas", "acidity", "vomit", "nausea", "diarrhea", "bowel", "gut", "heartburn", "bloat" -> Gastroenterologist
      - "cancer", "tumor" -> Oncologist
      - "lung", "breathing", "asthma", "cough", "wheeze", "pneumonia", "bronchitis" -> Pulmonologist
      - "child", "baby", "pediatric" -> Pediatrician
      - "women", "period", "pregnancy", "menstruation", "fertility", "menopause" -> Gynecologist
      - "mind", "depression", "anxiety", "stress", "panic", "sleep", "insomnia" -> Psychiatrist

      If the symptoms are general (e.g., "fever", "weakness") or unclear, suggest "General Physician".

      Please analyze the input and provide the following in strictly valid JSON format (no markdown code blocks):
      {
        "specialization": "The most appropriate medical specialization (e.g., Cardiologist, Neurologist, etc.)",
        "advice": "Brief, professional medical advice (max 2 sentences)"
      }
    `;

    let aiData = {
        specialization: "General Physician",
        advice: "Please consult a doctor."
    };

    try {
        const result = await model.generateContent(analysisPrompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        aiData = JSON.parse(cleanJson);
    } catch (aiError) {
        console.error("AI Analysis Failed:", aiError);
        // Fallback Logic
        // Simple keyword matching for common symptoms
        const s = symptoms.toLowerCase();
        if (s.includes('heart') || s.includes('chest') || s.includes('bp') || s.includes('pulse') || s.includes('cardiac')) aiData.specialization = "Cardiologist";
        else if (s.includes('skin') || s.includes('rash') || s.includes('acne') || s.includes('itch') || s.includes('eczema')) aiData.specialization = "Dermatologist";
        else if (s.includes('tooth') || s.includes('dental')) aiData.specialization = "Dentist";
        else if (s.includes('head') || s.includes('migraine') || s.includes('brain') || s.includes('dizzy') || s.includes('nerve')) aiData.specialization = "Neurologist";
        else if (s.includes('stomach') || s.includes('digestion') || s.includes('abdomen') || s.includes('gas') || s.includes('acidity') || s.includes('vomit') || s.includes('nausea')) aiData.specialization = "Gastroenterologist";
        else if (s.includes('bone') || s.includes('joint') || s.includes('fracture') || s.includes('knee') || s.includes('spine') || s.includes('back')) aiData.specialization = "Orthopedic";
        else if (s.includes('eye') || s.includes('vision')) aiData.specialization = "Ophthalmologist";
        else if (s.includes('ear') || s.includes('nose') || s.includes('throat') || s.includes('sinus')) aiData.specialization = "ENT Specialist";
        else if (s.includes('kidney') || s.includes('urine')) aiData.specialization = "Nephrologist";
        else if (s.includes('cancer') || s.includes('tumor')) aiData.specialization = "Oncologist";
        else if (s.includes('child') || s.includes('baby')) aiData.specialization = "Pediatrician";
        else if (s.includes('women') || s.includes('period') || s.includes('pregnancy')) aiData.specialization = "Gynecologist";
        else if (s.includes('mind') || s.includes('anxiety') || s.includes('depression') || s.includes('stress')) aiData.specialization = "Psychiatrist";
        else if (s.includes('lung') || s.includes('breath') || s.includes('cough')) aiData.specialization = "Pulmonologist";

        // aiData.advice = "Since I am currently experiencing high traffic, I have based this recommendation on your keywords. Please consult the suggested specialist.";
    }

    // 3. Query Database for Doctors
    let doctorQuery = { 
      specialization: { $regex: aiData.specialization, $options: 'i' },
      status: 'verified'
    };
    if (city) {
      doctorQuery.city = { $regex: city, $options: 'i' };
    }

    // Fetch top 3 doctors
    const doctors = await Doctor.find(doctorQuery).select('name specialization city experience fees').limit(3);
    
    // Fallback if no specific doctors found in city
    let additionalDoctors = [];
    if (doctors.length === 0 && city) {
        additionalDoctors = await Doctor.find({ 
            specialization: { $regex: aiData.specialization, $options: 'i' },
            status: 'verified' 
        }).select('name specialization city experience fees').limit(3);
    }

    // 4. Formulate Final Response
    let finalContent = `${aiData.advice}\n\n`;
    
    // Helper to format doctor list
    const formatDocs = (docs) => docs.map(d => `- **Dr. ${d.name}** (${d.experience}y exp) in ${d.city}`).join('\n');

    let relatedDoctorsIds = [];
    if (doctors.length > 0) {
        finalContent += `I recommend these ${aiData.specialization}s in ${city}:\n${formatDocs(doctors)}`;
        relatedDoctorsIds = doctors.map(d => d._id);
    } else if (additionalDoctors.length > 0) {
        finalContent += `I didn't find ${aiData.specialization}s in ${city}, but here are some top experts:\n${formatDocs(additionalDoctors)}`;
        relatedDoctorsIds = additionalDoctors.map(d => d._id);
    } else {
        finalContent += `I recommend seeing a ${aiData.specialization}. You can search for one on our platform.`;
    }

    // 5. Save AI Response
    const aiChat = await Chat.create({
      userId,
      role: 'ai',
      content: finalContent,
      specialization: aiData.specialization,
      relatedDoctors: relatedDoctorsIds
    });

    res.status(200).json({
      success: true,
      data: { 
        response: finalContent, 
        suggestedSpecialization: aiData.specialization,
        relatedDoctors: doctors.concat(additionalDoctors),
        history: [userChat, aiChat] // Return the new messages to append
      }
    });

  } catch (error) {
    console.error("Chat Process Error:", error);
    res.status(500).json({ success: false, message: "Failed to process chat" });
  }
};

