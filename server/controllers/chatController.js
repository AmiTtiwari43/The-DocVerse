// Mock AI health assistant responses with specialization routing
const getMockAIResponse = (symptoms) => {
  const symptomMap = {
    headache: {
      response: "For a headache, try resting in a quiet, dark room. Stay hydrated and consider over-the-counter pain relievers if needed. Consult a doctor if it persists.",
      specialization: "Neurologist",
    },
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
    eye: {
      response: "Eye pain or vision issues should be evaluated by an eye specialist. Avoid rubbing your eyes and seek professional care if symptoms persist.",
      specialization: "Ophthalmologist",
    },
    skin: {
      response: "Skin issues can range from minor irritations to serious conditions. A dermatologist can provide proper diagnosis and treatment.",
      specialization: "Dermatologist",
    },
    heart: {
      response: "Heart-related symptoms require immediate medical attention. Consult a cardiologist for proper evaluation and care.",
      specialization: "Cardiologist",
    },
    tooth: {
      response: "Dental pain or oral health issues should be addressed by a dentist. Regular check-ups help prevent serious problems.",
      specialization: "Dentist",
    },
    child: {
      response: "Children's health concerns are best handled by pediatricians who specialize in child development and care.",
      specialization: "Pediatrician",
    },
    mental: {
      response: "Mental health is as important as physical health. A psychiatrist or psychologist can provide appropriate support and treatment.",
      specialization: "Psychiatrist",
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

