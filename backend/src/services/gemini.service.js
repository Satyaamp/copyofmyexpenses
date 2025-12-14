const Groq = require("groq-sdk");
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. THE ENGINEER (Generates MongoDB Code)
exports.generateMongoQuery = async (userQuery, userId) => {
  const currentYear = new Date().getFullYear();
  
  const prompt = `
  You are a MongoDB Expert. Convert the user's question into a MongoDB Aggregation Pipeline.
  
  DATABASE SCHEMA:
  Collection: 'expenses'
  - amount (Number)
  - category (String)
  - month (Number, 1-12)  <-- PREFER THIS for month filters
  - year (Number)         <-- PREFER THIS for year filters
  - date (Date Object)    <-- DO NOT USE for filtering
  
  CONTEXT:
  - User ID: "${userId}"
  - Current Year: ${currentYear}

  RULES:
  1. Return ONLY a valid JSON array.
  2. STRICTLY forbid 'ObjectId' syntax. Use strings.
  3. FILTERING:
     - For "December", usage: { "month": 12 } (Do NOT use date ranges).
     - For "above 500", usage: { "amount": { "$gt": 500 } }.
     - Unless the user says "last year", assume { "year": ${currentYear} }.
  4. Do NOT include a $match for 'userId' (I will add it manually).

  User Question: "${userQuery}"
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0, 
  });

  let cleanCode = completion.choices[0]?.message?.content;
  cleanCode = cleanCode.replace(/```json/g, "").replace(/```/g, "").trim();
  
  return JSON.parse(cleanCode);
};

// 2. THE ASSISTANT (Summarizes Data)
exports.askGemini = async (query, data, firstName) => {
  const prompt = `
  Role: Personal Finance Assistant for ${firstName}.
  User Question: "${query}"
  
  // ✅ RAW DATA (Found by Database):
  ${JSON.stringify(data, null, 2)}
  
  INSTRUCTIONS:
  1. If the user asks for a list (e.g., "Show expenses above 500"), you MUST list **EVERY SINGLE ITEM** found in the data.
  2. Do NOT summarize or skip items. If the database found 3 items, list 3 items.
  3. Format clearly: "• [Date] - [Category]: ₹[Amount]"
  4. If the data shows a "balance_sheet", simply state the Income, Expense, and Balance.

  Your Reply:
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.1-8b-instant",
    temperature: 0, // Keep logic strict
  });

  return completion.choices[0]?.message?.content;
};