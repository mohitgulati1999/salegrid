const SaleSession = require('../models/SaleSession');
const Customer = require('../models/Customer');
const User = require('../models/User');

exports.createSession = async (req, res) => {
  try {
    const {
      salespersonId,
      customerName,
      customerPhone,
      transcript,
      duration,
      organizationId,
      zoneId,
      storeId
    } = req.body;

    if (!salespersonId || !customerName || !customerPhone || !transcript || !duration) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Salesperson ID, customer details, transcript, and duration are required'
      });
    }

    const salesperson = await User.findById(salespersonId);
    if (!salesperson) {
      return res.status(404).json({ error: 'Salesperson not found' });
    }

    let customer = await Customer.findOne({
      name: customerName,
      phone: customerPhone,
      organizationId: organizationId || salesperson.organizationId
    });

    if (!customer) {
      customer = new Customer({
        name: customerName,
        phone: customerPhone,
        organizationId: organizationId || salesperson.organizationId,
        zoneId: zoneId || salesperson.zoneId,
        storeId: storeId || salesperson.storeId,
        createdBy: salespersonId
      });
      await customer.save();
    }

    customer.totalSessions += 1;
    customer.lastContactDate = new Date();
    await customer.save();

    const session = new SaleSession({
      salesperson: salespersonId,
      customer: customer._id,
      customerName,
      customerPhone,
      transcript,
      duration,
      organizationId: organizationId || salesperson.organizationId,
      zoneId: zoneId || salesperson.zoneId,
      storeId: storeId || salesperson.storeId
    });

    await session.save();

    res.json({
      success: true,
      session: {
        id: session._id,
        customerName: session.customerName,
        customerPhone: session.customerPhone,
        duration: session.duration,
        sessionDate: session.sessionDate
      }
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: error.message
    });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const { salespersonId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const query = { salesperson: salespersonId };
    const sessions = await SaleSession.find(query)
      .sort({ sessionDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions', message: error.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await SaleSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session', message: error.message });
  }
};
