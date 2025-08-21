// Get all analytics for a customer (history)
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.find({ customer: req.params.customerId })
      .populate('salesperson', 'name organizationName')
      .populate('customer', 'name phone')
      .populate('sessionId', 'sessionDate duration transcript');
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer analytics', message: error.message });
  }
};
const Analytics = require('../models/Analytics');

exports.getSessionAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.findOne({ sessionId: req.params.sessionId })
      .populate('salesperson', 'name organizationName')
      .populate('customer', 'name phone')
      .populate('sessionId', 'sessionDate duration transcript');
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
  }
};

exports.getSalespersonStats = async (req, res) => {
  try {
    const { salespersonId } = req.params;
    const { period = '30' } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));
    const analytics = await Analytics.find({
      salesperson: salespersonId,
      analysisDate: { $gte: dateFrom }
    });
    if (analytics.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalAnalyzed: 0,
          averagePitchScore: 0,
          averageBuyerIntent: 0,
          bestPerformance: 0,
          worstPerformance: 0,
          topObjections: [],
          commonMistakes: []
        }
      });
    }
    const pitchScores = analytics.map(a => a.pitchScore);
    const buyerIntents = analytics.map(a => a.buyerIntent);
    const objectionCounts = {};
    const mistakeCounts = {};
    analytics.forEach(a => {
      a.objections.forEach(obj => {
        objectionCounts[obj] = (objectionCounts[obj] || 0) + 1;
      });
      a.mistakes.forEach(mistake => {
        mistakeCounts[mistake.statement] = (mistakeCounts[mistake.statement] || 0) + 1;
      });
    });
    const topObjections = Object.entries(objectionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([objection, count]) => ({ objection, count }));
    const commonMistakes = Object.entries(mistakeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([mistake, count]) => ({ mistake, count }));
    res.json({
      success: true,
      stats: {
        totalAnalyzed: analytics.length,
        averagePitchScore: Math.round(pitchScores.reduce((a, b) => a + b, 0) / pitchScores.length),
        averageBuyerIntent: Math.round(buyerIntents.reduce((a, b) => a + b, 0) / buyerIntents.length),
        bestPerformance: Math.max(...pitchScores),
        worstPerformance: Math.min(...pitchScores),
        topObjections,
        commonMistakes
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics stats', message: error.message });
  }
};
