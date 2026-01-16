import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function checkModels() {
    console.log("🔍 Checking available Gemini models for your API Key...");
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error.message);
        } else {
            console.log("✅ AVAILABLE MODELS:");
            // Filter only 'generateContent' supported models
            const validModels = data.models.filter(m => 
                m.supportedGenerationMethods.includes("generateContent")
            );
            
            validModels.forEach(m => {
                console.log(`   👉 ${m.name.replace("models/", "")}`);
            });
            console.log("\n💡 Piliin ang isa sa mga nasa taas para ilagay sa ai.js");
        }
    } catch (error) {
        console.error("❌ Connection Error:", error.message);
    }
}

checkModels();