require("dotenv").config();
const axios = require("axios");

const testGemini = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY is not defined in backend/.env!");
    return;
  }

  console.log("Using API Key from backend/.env:", apiKey.substring(0, 8) + "...");
  console.log("Sending test request to Gemini API...");

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: "Reply in one sentence: 'Hello! Gemini is working perfectly!'" }
            ]
          }
        ]
      }
    );

    const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (answer) {
      console.log("\n✅ Success! Gemini responded:");
      console.log("---------------------------------------");
      console.log(answer.trim());
      console.log("---------------------------------------");
    } else {
      console.log("❌ Response received, but no text was generated.");
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Gemini API Error (Status " + error.response.status + "):");
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ Network/Request Error:", error.message);
    }
  }
};

testGemini();
