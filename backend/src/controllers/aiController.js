const Expense = require("../models/expense.model");
const Income = require("../models/income.model"); 
const User = require("../models/user.model");
const mongoose = require("mongoose");
const { generateMongoQuery, askGemini } = require("../services/gemini.service");

exports.handleAIQuery = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.body;

    if (!query) return res.status(400).json({ message: "Query required" });

    const user = await User.findById(userId);
    const firstName = user ? user.name.split(' ')[0] : "User";
    const lowerQuery = query.toLowerCase();

    // 🛑 1. GREETING GUARD
    if (["hi", "hello", "hey"].includes(lowerQuery.trim())) {
        return res.json({ reply: `Hi ${firstName}! 🚀 Ready to track expenses?` });
    }

    let resultData = {};

    // =========================================================
    // ⚖️ PATH A: BALANCE & INCOME (Manual Logic)
    // =========================================================
    // If user asks for "Balance", "Remaining", "Income", or "Savings"
    if (lowerQuery.includes("balance") || lowerQuery.includes("remaining") || lowerQuery.includes("income")) {
        console.log("⚖️ Detected Balance/Income Query");
        
        // Detect Month
        const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        let monthIndex = new Date().getMonth(); // Default to current
        const foundMonth = months.find(m => lowerQuery.includes(m));
        if (foundMonth) monthIndex = months.indexOf(foundMonth);
        
        const dbMonth = monthIndex + 1;

        // Fetch Income & Expense
        const incomeDocs = await Income.find({ userId, month: dbMonth });
        const expenseDocs = await Expense.find({ userId, month: dbMonth });

        const totalIncome = incomeDocs.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalExpense = expenseDocs.reduce((sum, item) => sum + Number(item.amount), 0);
        
        resultData = {
            type: "balance_sheet",
            month: months[monthIndex],
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        };
    
    // =========================================================
    // 🧠 PATH B: EXPENSE ANALYTICS (AI Generated Query)
    // =========================================================
    } else {
        console.log("🤔 Expense Query - Asking AI to write MongoDB code...");
        
        try {
            // 1. Get Pipeline from AI
            let pipeline = await generateMongoQuery(query, userId);

            // 2. Add userId Filter Manually (Safe & Correct)
            const userFilter = { $match: { userId: new mongoose.Types.ObjectId(userId) } };
            pipeline.unshift(userFilter);

            // 3. Run Query
            const results = await Expense.aggregate(pipeline);
            resultData = results;
            console.log(`✅ Database found ${results.length} results.`);

        } catch (mongoErr) {
            console.error("Query Gen Error:", mongoErr);
            return res.json({ reply: "I couldn't process that complex search. Try asking 'Total food expenses in December'." });
        }
    }

    // =========================================================
    // 🗣️ FINAL STEP: SUMMARIZE
    // =========================================================
    const finalReply = await askGemini(query, resultData, firstName);

    res.json({
        reply: finalReply.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    });

  } catch (err) {
    console.error("System Error:", err);
    res.status(500).json({ message: "AI failed" });
  }
};