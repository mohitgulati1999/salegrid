const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getCustomers);
router.get('/:customerId', customerController.getCustomer);
router.patch('/:customerId/notes', customerController.updateCustomerNotes);

module.exports = router;