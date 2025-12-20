function getFallbackSpecialization(symptoms) {
    let specialization = "General Physician";
    const s = symptoms.toLowerCase();
    
    // Updated Fallback Logic Mirror
    if (s.includes('heart') || s.includes('chest') || s.includes('bp') || s.includes('pulse') || s.includes('cardiac')) specialization = "Cardiologist";
    else if (s.includes('skin') || s.includes('rash') || s.includes('acne') || s.includes('itch') || s.includes('eczema')) specialization = "Dermatologist";
    else if (s.includes('tooth') || s.includes('dental')) specialization = "Dentist";
    else if (s.includes('head') || s.includes('migraine') || s.includes('brain') || s.includes('dizzy') || s.includes('nerve')) specialization = "Neurologist";
    else if (s.includes('stomach') || s.includes('digestion') || s.includes('abdomen') || s.includes('gas') || s.includes('acidity') || s.includes('vomit') || s.includes('nausea')) specialization = "Gastroenterologist";
    else if (s.includes('bone') || s.includes('joint') || s.includes('fracture') || s.includes('knee') || s.includes('spine') || s.includes('back')) specialization = "Orthopedic";
    else if (s.includes('eye') || s.includes('vision')) specialization = "Ophthalmologist";
    else if (s.includes('ear') || s.includes('nose') || s.includes('throat') || s.includes('sinus')) specialization = "ENT Specialist";
    else if (s.includes('kidney') || s.includes('urine')) specialization = "Nephrologist";
    else if (s.includes('cancer') || s.includes('tumor')) specialization = "Oncologist";
    else if (s.includes('child') || s.includes('baby')) specialization = "Pediatrician";
    else if (s.includes('women') || s.includes('period') || s.includes('pregnancy')) specialization = "Gynecologist";
    else if (s.includes('mind') || s.includes('anxiety') || s.includes('depression') || s.includes('stress')) specialization = "Psychiatrist";
    else if (s.includes('lung') || s.includes('breath') || s.includes('cough')) specialization = "Pulmonologist";

    return specialization;
}

function runTests() {
    const cases = [
        { input: "I have heart pain", expected: "Cardiologist" },
        { input: "my pulse is racing", expected: "Cardiologist" },
        { input: "my brain hurts", expected: "Neurologist" },
        { input: "dizzy spells", expected: "Neurologist" },
        { input: "broken bone", expected: "Orthopedic" },
        { input: "my back hurts", expected: "Orthopedic" },
        { input: "vision is blurry", expected: "Ophthalmologist" },
        { input: "kidney stone", expected: "Nephrologist" },
        { input: "itchy rash on skin", expected: "Dermatologist" },
        { input: "eczema flare up", expected: "Dermatologist" },
        { input: "tooth ache", expected: "Dentist" },
        { input: "I am vomiting", expected: "Gastroenterologist" },
        { input: "sinus pressure", expected: "ENT Specialist" },
        { input: "high stress", expected: "Psychiatrist" },
        { input: "bad cough", expected: "Pulmonologist" },
        { input: "feeling pain and sweeling in in face", expected: "General Physician" }
    ];

    let passed = 0;
    cases.forEach(c => {
        const result = getFallbackSpecialization(c.input);
        if (result === c.expected) {
            console.log(`PASS: "${c.input}" -> ${result}`);
            passed++;
        } else {
            console.error(`FAIL: "${c.input}" -> Expected ${c.expected}, got ${result}`);
        }
    });

    console.log(`\n${passed}/${cases.length} passed.`);
}

runTests();
