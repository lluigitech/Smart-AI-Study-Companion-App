// routes/ai.js
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Get Groq API Key from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper: Clean JSON for quiz/deck parsing
const cleanAndParseJSON = (text) => {
    try {
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        const match = text.match(/\[.*\]/s) || text.match(/\{.*\}/s);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                return null;
            }
        }
        return null;
    }
};

// Helper: Call Groq API
const callGroqAPI = async (messages, temperature = 0.7, maxTokens = 1000) => {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY not configured in .env file");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Groq API request failed");
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

// -------------------------------------------
// 1. AI CHAT - General Q&A (Dashboard Chatbot & Document Viewer)
// -------------------------------------------
router.post("/chat", async (req, res) => {
    const { question, message, context } = req.body;
    
    // Support both 'question' and 'message' fields
    const userQuestion = question || message;

    if (!userQuestion) {
        return res.status(400).json({ error: "Question or message is required" });
    }

    try {
        const messages = [
            {
                role: "system",
                content: `You are SmartBuddy, a helpful and friendly study assistant. 
                         - Explain concepts clearly in English.
                         - Provide helpful examples and encourage students to learn.
                         - Keep responses concise but informative (2-3 sentences max for simple questions).
                         - Be warm, supportive, and motivating.
                         ${context ? `Context: ${context}` : ""}`
            },
            {
                role: "user",
                content: userQuestion
            }
        ];

        const answer = await callGroqAPI(messages, 0.7, 1000);

        // Support ALL response field names for compatibility
        res.json({
            success: true,
            answer: answer,
            response: answer,
            reply: answer,  // ← For DocumentViewer
            source: "groq"
        });

    } catch (error) {
        console.error("❌ AI Chat Error:", error.message);
        
        // Fallback responses
        const fallbackResponses = [
            "Hello! I'm SmartBuddy, your AI study assistant! 👋",
            "Great question! As your study buddy, I'm here to help you learn better.",
            "That's a great question! Let me help you with that.",
            "I can help you with studying! Try asking about study techniques or explanations.",
            "Ready to learn? I recommend the Pomodoro technique: 25min study, 5min break! 💪"
        ];
        
        const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        res.json({
            success: false,
            answer: randomFallback,
            response: randomFallback,
            reply: randomFallback,  // ← For DocumentViewer
            error: "AI temporarily unavailable, using fallback"
        });
    }
});

// -------------------------------------------
// 2. AI GENERATE - Create flashcards/quiz/summary from topic
// -------------------------------------------
router.post("/generate", async (req, res) => {
    const { topic, type, count = 5, difficulty = "Medium" } = req.body;

    if (!topic || !type) {
        return res.status(400).json({ error: "Topic and type are required" });
    }

    try {
        let prompt = "";
        
        if (type === "deck") {
            // Flashcards
            prompt = `Create ${count} flashcard pairs about "${topic}".

Return ONLY a JSON array with this exact format (no other text):
[
  {
    "front": "Question or term here",
    "back": "Answer or definition here in English"
  }
]

Difficulty: ${difficulty}`;
        } else if (type === "quiz") {
            // Quiz
            prompt = `Create ${count} multiple-choice quiz questions about "${topic}".

Return ONLY a JSON array with this exact format (no other text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Short explanation in English why this is correct..."
  }
]

Difficulty: ${difficulty}`;
        } else if (type === "summary") {
            // Summary
            const messages = [
                {
                    role: "system",
                    content: "You are a study assistant. Create clear summaries using bullet points in English."
                },
                {
                    role: "user",
                    content: `Create a ${count === "Short" ? "short" : "detailed"} summary about "${topic}".

Format: ${difficulty === "Bullets" ? "Use bullet points" : "Use paragraphs"}`
                }
            ];

            const summary = await callGroqAPI(messages, 0.6, 1500);
            return res.json({ 
                success: true,
                summary: summary,
                type: "summary"
            });
        }

        // For deck and quiz
        const messages = [
            {
                role: "system",
                content: "You generate educational content in JSON format only. No other text or markdown."
            },
            {
                role: "user",
                content: prompt
            }
        ];

        const aiResponse = await callGroqAPI(messages, 0.8, 2000);
        const parsedData = cleanAndParseJSON(aiResponse);

        if (!parsedData || !Array.isArray(parsedData)) {
            throw new Error("Failed to parse generated content");
        }

        res.json({
            success: true,
            data: parsedData,
            type: type
        });

    } catch (error) {
        console.error("❌ AI Generate Error:", error.message);
        res.status(500).json({ 
            error: "Failed to generate content",
            details: error.message
        });
    }
});

// -------------------------------------------
// 3. AI SUMMARIZE - Summarize study materials
// -------------------------------------------
router.post("/summarize", async (req, res) => {
    const { text, title } = req.body;

    if (!text || text.length < 10) {
        return res.status(400).json({ error: "Text is too short to summarize." });
    }

    try {
        const messages = [
            {
                role: "system",
                content: "You are an expert study assistant. Create clear, organized summaries of study materials using bullet points and key concepts in English."
            },
            {
                role: "user",
                content: `Summarize this document titled "${title || 'Study Material'}":

${text.substring(0, 12000)}

Format:
- Use bullet points
- Include "Key Concepts" section
- Write in clear English
- Make it organized and easy to scan`
            }
        ];

        const summary = await callGroqAPI(messages, 0.5, 1500);

        res.json({ 
            success: true,
            summary: summary 
        });

    } catch (error) {
        console.error("❌ Summarize Error:", error.message);
        res.status(500).json({ 
            error: "Failed to generate summary.",
            details: error.message
        });
    }
});

// -------------------------------------------
// 4. GENERATE QUIZ - Create practice questions
// -------------------------------------------
router.post("/generate-quiz", async (req, res) => {
    const { text, title, topic, numQuestions = 5 } = req.body;

    const hasContent = text && text.length >= 50;
    const hasTopic = topic && topic.length > 0;

    if (!hasContent && !hasTopic) {
        return res.status(400).json({ 
            error: "Please provide either 'text' content or a 'topic' for the quiz." 
        });
    }

    try {
        const prompt = hasContent 
            ? `Create a ${numQuestions}-question multiple-choice quiz based on this content:

Title: "${title}"
Content: ${text.substring(0, 10000)}

Return ONLY a JSON array with this exact format (no other text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Short explanation in English why this is correct..."
  }
]`
            : `Create a ${numQuestions}-question multiple-choice quiz about "${topic}".

Return ONLY a JSON array with this exact format (no other text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Short explanation in English..."
  }
]`;

        const messages = [
            {
                role: "system",
                content: "You are a quiz generator. Return ONLY valid JSON arrays, no other text or formatting."
            },
            {
                role: "user",
                content: prompt
            }
        ];

        const aiResponse = await callGroqAPI(messages, 0.8, 2000);
        const quizData = cleanAndParseJSON(aiResponse);

        if (!quizData || !Array.isArray(quizData)) {
            throw new Error("Failed to parse quiz JSON");
        }

        res.json({ 
            success: true,
            quiz: quizData,
            source: "groq"
        });

    } catch (error) {
        console.error("❌ Quiz Generation Error:", error.message);
        res.status(500).json({ 
            error: "Failed to generate quiz.",
            details: error.message
        });
    }
});

// -------------------------------------------
// 5. EXPLAIN CONCEPT - Detailed explanations
// -------------------------------------------
router.post("/explain", async (req, res) => {
    const { concept, level = "high school" } = req.body;

    if (!concept) {
        return res.status(400).json({ error: "Concept is required" });
    }

    try {
        const messages = [
            {
                role: "system",
                content: `You are an expert tutor. Explain concepts clearly in English for ${level} students.
                         Provide examples and break down complex ideas into simple parts.`
            },
            {
                role: "user",
                content: `Explain this concept in simple terms: ${concept}`
            }
        ];

        const explanation = await callGroqAPI(messages, 0.7, 1000);

        res.json({
            success: true,
            explanation: explanation,
            concept: concept,
            level: level
        });

    } catch (error) {
        console.error("❌ Explain Error:", error.message);
        res.status(500).json({ 
            error: "Failed to explain concept",
            details: error.message
        });
    }
});

// -------------------------------------------
// 6. PROGRESS INSIGHT - Personalized study advice (Progress Page)
// -------------------------------------------
router.post("/get-insight", async (req, res) => {
    const { stats, userName } = req.body;

    try {
        const messages = [
            {
                role: "system",
                content: `You are SmartBuddy, a friendly study coach. 
                         Give personalized, encouraging advice based on user's study stats in English.
                         Keep it to 2-3 sentences maximum.
                         Be specific about their performance and give actionable advice.`
            },
            {
                role: "user",
                content: `User: ${userName || 'Student'}

Study Stats:
- Streak: ${stats?.streak || 0} days
- Points: ${stats?.points || 0}
- Total Weekly Hours: ${stats?.total_weekly_hours || 0} hours
- Focus Areas: ${JSON.stringify(stats?.focus || [])}

Give encouraging personalized advice based on these stats. Mention specific achievements if they're doing well, or gentle motivation if they need improvement.`
            }
        ];

        const insight = await callGroqAPI(messages, 0.8, 200);

        res.json({ 
            success: true,
            insight: insight.trim() 
        });

    } catch (error) {
        console.error("❌ Insight Error:", error.message);
        
        // Fallback insights based on basic stats
        let fallbackInsight = "Keep pushing! Every minute of study matters. 💪";
        
        if (stats?.streak > 7) {
            fallbackInsight = `Amazing ${stats.streak}-day streak! You're building great study habits. Keep it up! 🔥`;
        } else if (stats?.points > 1000) {
            fallbackInsight = `Wow, ${stats.points} points! Your hard work is paying off. Continue the momentum! 🌟`;
        }
        
        res.json({ 
            success: false,
            insight: fallbackInsight,
            error: "Using fallback insight"
        });
    }
});

// -------------------------------------------
// HEALTH CHECK
// -------------------------------------------
router.get("/health", (req, res) => {
    const isConfigured = !!GROQ_API_KEY;
    
    res.json({
        status: "ok",
        service: "Groq AI System",
        model: "Llama 3.3 70B",
        apiConfigured: isConfigured,
        endpoints: {
            chat: "/api/ai/chat",
            generate: "/api/ai/generate",
            summarize: "/api/ai/summarize",
            quiz: "/api/ai/generate-quiz",
            explain: "/api/ai/explain",
            insight: "/api/ai/get-insight"
        },
        message: isConfigured 
            ? "✅ Groq API is ready!" 
            : "⚠️ GROQ_API_KEY not found in .env"
    });
});

export default router;