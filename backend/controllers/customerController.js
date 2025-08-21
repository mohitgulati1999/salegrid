const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try {
    const { organizationId, salespersonId } = req.query;
  let query = {};
  if (organizationId) query.organizationId = organizationId;
  if (salespersonId) query.createdBy = salespersonId;
  // Strict filtering by name and phone if provided
  if (req.query.name) query.name = req.query.name;
  if (req.query.phone) query.phone = req.query.phone;
  const customers = await Customer.find(query).sort({ lastContactDate: -1 });
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers', message: error.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer', message: error.message });
  }
};

exports.updateCustomerNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      { $set: { notes } },
      { new: true }
    );
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notes', message: error.message });
  }
};
