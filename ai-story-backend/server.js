require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
   
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const story = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No story generated.";
    res.json({ story });
    
  } catch (error) {
     
    console.error("Error generating story:", error.message);
    res.status(500).json({ error: "Failed to generate story." });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
