const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Groq API configuration
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a gentle, empathetic AI companion for ADHD and neurodivergent individuals. Respond with warmth, understanding, and practical support. Keep responses concise but meaningful.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed: ${response.status}`);
    }

    const data = await response.json();
    res.send({ answer: data.choices[0].message.content.trim() });
    
  } catch (error) {
    console.error('Error calling Groq API:', error);
    res.status(500).send({ 
      answer: "I'm having trouble connecting right now, but I'm still here with you. Your feelings are valid, and you're doing great." 
    });
  }
});

exports.api = functions.https.onRequest(app);