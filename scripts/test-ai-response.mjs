import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Test OpenAI connection
async function testOpenAI() {
  console.log("Testing OpenAI connection...\n");

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is not set in .env.local");
    return false;
  }

  console.log("✓ OpenAI API Key found");

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, can you hear me?" },
      ],
      max_tokens: 50,
    });

    console.log("✅ OpenAI connection successful!");
    console.log("\nTest Response:", completion.choices[0]?.message?.content);
    return true;
  } catch (error) {
    console.error("❌ OpenAI test failed:", error.message);
    if (error.code === 'insufficient_quota') {
      console.log("\nNote: You may need to add a payment method to your OpenAI account");
    }
    return false;
  }
}

testOpenAI().then((success) => {
  process.exit(success ? 0 : 1);
});
