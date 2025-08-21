const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const Analytics = require('../models/Analytics');
const SaleSession = require('../models/SaleSession');
const Customer = require('../models/Customer');
const User = require('../models/User');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Get all analytics for a customer (history)
router.get('/customer/:customerId', analyticsController.getCustomerAnalytics);

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Analyze sale session using Gemini AI
router.post('/analyze/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session details
    const session = await SaleSession.findById(sessionId)
      .populate('salesperson', 'name organizationName')
      .populate('customer', 'name phone');

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Check if already analyzed
    let analytics = await Analytics.findOne({ sessionId });
    if (analytics) {
      return res.json({
        success: true,
        analytics
      });
    }

    // Prepare prompt for Gemini
    const prompt = `
${process.env.GEMINI_PROMPT}

Conversation Details:
- Salesperson: ${session.salesperson.name}
- Customer: ${session.customer.name}
- Duration: ${Math.floor(session.duration / 60)}m ${session.duration % 60}s
- Date: ${session.sessionDate}

Conversation Transcript:
${session.transcript}

Instructions:
- Do not use asterisks (*) or any symbols in your output.
- All output fields must be present and non-empty. If a field cannot be filled, use a relevant message like "No data available".
- Do not make up any false comments, statements, or conversation. Only use the real transcript and details provided.
- Stick strictly to the actual conversation and facts.

Please analyze this conversation and return a JSON response with the exact structure:
{
  "pitchScore": number (0-100),
  "buyerIntent": number (0-100),
  "objections": ["string1", "string2", ...] (1-5 items),
  "mistakes": [{"statement": "exact quote", "comment": "improvement suggestion"}, ...] (1-5 items),
  "insights": ["string1", "string2", ...] (1-5 items),
  "followupMessage": "personalized message for the customer"
}`;

    try {
      // Use Gemini AI for analysis (new API)
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const text = response.text;

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const analysisData = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (typeof analysisData.pitchScore !== 'number' || 
          typeof analysisData.buyerIntent !== 'number' ||
          !Array.isArray(analysisData.objections) ||
          !Array.isArray(analysisData.mistakes) ||
          !Array.isArray(analysisData.insights) ||
          typeof analysisData.followupMessage !== 'string') {
        throw new Error('Invalid analysis data structure');
      }

      // Save analytics to database
      analytics = new Analytics({
        sessionId,
        salesperson: session.salesperson._id,
        customer: session.customer._id,
        pitchScore: Math.max(0, Math.min(100, analysisData.pitchScore)),
        buyerIntent: Math.max(0, Math.min(100, analysisData.buyerIntent)),
        objections: analysisData.objections.slice(0, 5),
        mistakes: analysisData.mistakes.slice(0, 5),
        insights: analysisData.insights.slice(0, 5),
        followupMessage: analysisData.followupMessage,
        organizationId: session.organizationId,
        zoneId: session.zoneId,
        storeId: session.storeId
      });

      await analytics.save();

      // Mark session as analyzed
      session.isAnalyzed = true;
      await session.save();

      res.json({
        success: true,
        analytics
      });

    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      return res.status(500).json({
        error: 'Gemini AI analysis failed',
        message: aiError.message
      });
    }

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to analyze session',
      message: error.message
    });
  }
});

// Get analytics by session ID
router.get('/session/:sessionId', analyticsController.getSessionAnalytics);

// Generate personalized follow-up message
router.post('/followup/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { customerReply } = req.body;

    const analytics = await Analytics.findOne({ sessionId })
      .populate('sessionId', 'transcript customerName')
      .populate('customer', 'name');

    if (!analytics) {
      return res.status(404).json({
        error: 'Analytics not found'
      });
    }

  const prompt = `Based on the previous sales conversation and the customer's recent response, generate a personalized follow-up message.

Original conversation insights:
- Pitch Score: ${analytics.pitchScore}/100
- Buyer Intent: ${analytics.buyerIntent}%
- Key Objections: ${analytics.objections.join(', ')}
- Customer Name: ${analytics.customer.name}

Customer's Recent Response:
"${customerReply}"

Instructions:
- Do not use asterisks (*) or any symbols in your output.
- All output fields must be present and non-empty. If a field cannot be filled, use a relevant message like "No data available".
- Do not make up any false comments, statements, or conversation. Only use the real transcript and details provided.
- Stick strictly to the actual conversation and facts.

Generate a professional, personalized follow-up message that addresses their specific concerns and moves the conversation forward. The message should be concise, empathetic, and action-oriented.`;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const followupMessage = response.text;

      // Update analytics with new follow-up message
      analytics.followupMessage = followupMessage;
      await analytics.save();

      res.json({
        success: true,
        followupMessage
      });

    } catch (aiError) {
      console.error('Follow-up generation error:', aiError);
      
      // Fallback message
      const fallbackMessage = `Thank you for your response! Based on your feedback: "${customerReply}", I'd like to address your concerns in our next conversation. Let me prepare a customized proposal that takes your specific requirements into account. When would be a good time for a follow-up call this week?`;

      analytics.followupMessage = fallbackMessage;
      await analytics.save();

      res.json({
        success: true,
        followupMessage: fallbackMessage,
        note: 'Follow-up generated using fallback system'
      });
    }

  } catch (error) {
    console.error('Follow-up error:', error);
    res.status(500).json({
      error: 'Failed to generate follow-up',
      message: error.message
    });
  }
});

// Get analytics for salesperson (dashboard stats)
router.get('/salesperson/:salespersonId/stats', analyticsController.getSalespersonStats);

module.exports = router;