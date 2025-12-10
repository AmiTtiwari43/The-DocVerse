const https = require('https');

const API_KEY = 'AIzaSyD7kzITRyaq_0Yg-RS5MCahopCThKntzyM';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("Querying models from:", url.replace(API_KEY, "HIDDEN_KEY"));

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("HTTP Status:", res.statusCode);
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("Available Models:");
        json.models.forEach(m => {
             // Only show generateContent models
             if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                 console.log(`- ${m.name}`);
             }
        });
      } else {
        console.log("Full Response:", JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.log("Raw Response:", data);
    }
  });
}).on('error', (e) => {
  console.error("Request Error:", e.message);
});
