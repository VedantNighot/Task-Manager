require("dotenv").config();
const axios = require("axios");

const testOpenAI = async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: OPENAI_API_KEY is not defined in backend/.env!");
    return;
  }

  console.log("Using API Key from backend/.env:", apiKey.substring(0, 12) + "...");
  console.log("Sending test request to OpenAI completions API...");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: "Reply in one sentence: 'Hello! OpenAI is working perfectly!'" }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const answer = response.data?.choices?.[0]?.message?.content;
    if (answer) {
      console.log("\n✅ Success! OpenAI responded:");
      console.log("---------------------------------------");
      console.log(answer.trim());
      console.log("---------------------------------------");
    } else {
      console.log("❌ Response received, but no text was generated.");
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ OpenAI API Error (Status " + error.response.status + "):");
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("❌ Network/Request Error:", error.message);
    }
  }
};

testOpenAI();
