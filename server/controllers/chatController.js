// Mock AI health assistant responses with specialization routing
const getMockAIResponse = (symptoms) => {
  const symptomMap = {
    // Neurological
    headache: {
      response: "For a headache, try resting in a quiet, dark room. Stay hydrated and consider over-the-counter pain relievers if needed. Consult a doctor if it persists.",
      specialization: "Neurologist",
    },
    migraine: {
      response: "Migraines can be debilitating. Rest in a dark room, stay hydrated, and consult a neurologist for proper treatment and prevention strategies.",
      specialization: "Neurologist",
    },
    dizziness: {
      response: "Dizziness can have various causes. Rest and avoid sudden movements. If it persists or is severe, consult a neurologist.",
      specialization: "Neurologist",
    },
    seizure: {
      response: "Seizures require immediate medical attention. Consult a neurologist for proper diagnosis and treatment.",
      specialization: "Neurologist",
    },
    // General Physician
    fever: {
      response: "If you have a fever, rest and keep yourself hydrated. Monitor your temperature and consult a doctor if it exceeds 103°F or lasts more than 3 days.",
      specialization: "General Physician",
    },
    cough: {
      response: "For a persistent cough, drink warm liquids and use honey-based lozenges. If the cough lasts more than 2 weeks or worsens, consult a healthcare professional.",
      specialization: "General Physician",
    },
    cold: {
      response: "Common cold symptoms usually improve with rest and fluids. Use a humidifier and consider vitamin C. Most colds resolve within 7-10 days.",
      specialization: "General Physician",
    },
    flu: {
      response: "The flu requires rest, hydration, and possibly antiviral medications. Consult a doctor for professional advice, especially if symptoms are severe.",
      specialization: "General Physician",
    },
    fatigue: {
      response: "Fatigue could be due to sleep deprivation, stress, or underlying conditions. Ensure adequate rest and consult a doctor if it persists.",
      specialization: "General Physician",
    },
    bodyache: {
      response: "Body aches can be relieved with rest, warm baths, and gentle stretching. If accompanied by fever, consult a doctor.",
      specialization: "General Physician",
    },
    nausea: {
      response: "Nausea can be caused by various factors. Stay hydrated and avoid heavy meals. If it persists, consult a doctor.",
      specialization: "General Physician",
    },
    vomiting: {
      response: "Vomiting with dehydration requires medical attention. Stay hydrated with small sips of water and consult a doctor if it continues.",
      specialization: "General Physician",
    },
    diarrhea: {
      response: "Stay hydrated and avoid solid foods initially. If diarrhea persists for more than 2 days or is accompanied by blood, see a doctor immediately.",
      specialization: "General Physician",
    },
    // Eye Specialist
    eye: {
      response: "Eye pain or vision issues should be evaluated by an eye specialist. Avoid rubbing your eyes and seek professional care if symptoms persist.",
      specialization: "Ophthalmologist",
    },
    vision: {
      response: "Vision changes or problems require professional evaluation. Schedule an appointment with an ophthalmologist for proper diagnosis.",
      specialization: "Ophthalmologist",
    },
    // Dermatologist
    skin: {
      response: "Skin issues can range from minor irritations to serious conditions. A dermatologist can provide proper diagnosis and treatment.",
      specialization: "Dermatologist",
    },
    rash: {
      response: "Skin rashes can have multiple causes. Keep the area clean and avoid irritants. Consult a dermatologist for proper evaluation.",
      specialization: "Dermatologist",
    },
    acne: {
      response: "Acne can be effectively treated. Maintain good skin hygiene and consult a dermatologist for personalized treatment options.",
      specialization: "Dermatologist",
    },
    eczema: {
      response: "Eczema requires specialized care. Keep skin moisturized and consult a dermatologist for appropriate treatment.",
      specialization: "Dermatologist",
    },
    // Cardiologist
    heart: {
      response: "Heart-related symptoms require immediate medical attention. Consult a cardiologist for proper evaluation and care.",
      specialization: "Cardiologist",
    },
    chest: {
      response: "Chest pain should never be ignored. Seek immediate medical attention and consult a cardiologist for thorough evaluation.",
      specialization: "Cardiologist",
    },
    palpitation: {
      response: "Heart palpitations can be concerning. Monitor your symptoms and consult a cardiologist for proper assessment.",
      specialization: "Cardiologist",
    },
    // Orthopedic
    bone: {
      response: "Bone and joint issues should be evaluated by an orthopedic specialist for proper diagnosis and treatment.",
      specialization: "Orthopedic",
    },
    joint: {
      response: "Joint pain or stiffness requires orthopedic consultation. Rest the affected area and avoid overexertion.",
      specialization: "Orthopedic",
    },
    fracture: {
      response: "Suspected fractures need immediate medical attention. Immobilize the area and see an orthopedic specialist right away.",
      specialization: "Orthopedic",
    },
    back: {
      response: "Back pain can have various causes. Maintain good posture and consult an orthopedic specialist if pain persists.",
      specialization: "Orthopedic",
    },
    // Dentist
    tooth: {
      response: "Dental pain or oral health issues should be addressed by a dentist. Regular check-ups help prevent serious problems.",
      specialization: "Dentist",
    },
    teeth: {
      response: "Teeth problems should be evaluated by a dentist. Maintain good oral hygiene and schedule regular dental check-ups.",
      specialization: "Dentist",
    },
    dental: {
      response: "Dental issues require professional care. Visit a dentist for proper examination and treatment.",
      specialization: "Dentist",
    },
    gum: {
      response: "Gum problems can lead to serious issues. Maintain good oral hygiene and consult a dentist promptly.",
      specialization: "Dentist",
    },
    // Pediatrician
    child: {
      response: "Children's health concerns are best handled by pediatricians who specialize in child development and care.",
      specialization: "Pediatrician",
    },
    baby: {
      response: "Infant health concerns should be addressed by a pediatrician who specializes in newborn and child care.",
      specialization: "Pediatrician",
    },
    infant: {
      response: "For infant health concerns, consult a pediatrician who can provide specialized care for your baby.",
      specialization: "Pediatrician",
    },
    // Psychiatrist
    mental: {
      response: "Mental health is as important as physical health. A psychiatrist or psychologist can provide appropriate support and treatment.",
      specialization: "Psychiatrist",
    },
    anxiety: {
      response: "Anxiety is treatable. Consider speaking with a psychiatrist or psychologist who can help you develop coping strategies.",
      specialization: "Psychiatrist",
    },
    depression: {
      response: "Depression is a serious condition that requires professional help. Consult a psychiatrist for proper diagnosis and treatment.",
      specialization: "Psychiatrist",
    },
    stress: {
      response: "Chronic stress can affect your health. Consider consulting a psychiatrist or counselor for stress management techniques.",
      specialization: "Psychiatrist",
    },
    // Gynecologist
    pregnancy: {
      response: "Pregnancy-related concerns should be discussed with a gynecologist for proper prenatal care and guidance.",
      specialization: "Gynecologist",
    },
    period: {
      response: "Menstrual concerns should be evaluated by a gynecologist for proper diagnosis and treatment.",
      specialization: "Gynecologist",
    },
    menstrual: {
      response: "Menstrual issues require gynecological consultation for appropriate care and treatment.",
      specialization: "Gynecologist",
    },
    // ENT Specialist
    ear: {
      response: "Ear problems should be evaluated by an ENT specialist for proper diagnosis and treatment.",
      specialization: "ENT Specialist",
    },
    throat: {
      response: "Persistent throat issues should be examined by an ENT specialist. Stay hydrated and avoid irritants.",
      specialization: "ENT Specialist",
    },
    nose: {
      response: "Nose and sinus problems should be evaluated by an ENT specialist for proper care.",
      specialization: "ENT Specialist",
    },
    sinus: {
      response: "Sinus issues can be chronic. An ENT specialist can provide proper diagnosis and treatment options.",
      specialization: "ENT Specialist",
    },
    // Urologist
    kidney: {
      response: "Kidney problems require specialized care. Consult a urologist for proper evaluation and treatment.",
      specialization: "Urologist",
    },
    urinary: {
      response: "Urinary tract issues should be evaluated by a urologist for proper diagnosis and treatment.",
      specialization: "Urologist",
    },
  };

  const lowerSymptoms = symptoms.toLowerCase();
  let matched = null;

  for (const key in symptomMap) {
    if (lowerSymptoms.includes(key)) {
      matched = symptomMap[key];
      break;
    }
  }

  if (!matched) {
    return {
      response: "Please consult a healthcare professional for a proper diagnosis. Our AI assistant provides general information only and is not a substitute for medical advice.",
      specialization: "General Physician",
    };
  }

  return matched;
};

exports.getMockAIResponse = async (req, res) => {
  try {
    const { symptoms, city } = req.body;

    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Symptoms are required' });
    }

    const result = getMockAIResponse(symptoms);

    res.status(200).json({
      success: true,
      data: { 
        response: result.response, 
        symptoms,
        suggestedSpecialization: result.specialization,
        city: city || null,
      },
      message: 'AI response generated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

