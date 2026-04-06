const express = require('express');
const router = express.Router();

const addressController = require('../controller/address.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateAddress } = require('../middleware/validate.middleware');

// All endpoints require authentication
router.use(authMiddleware);

// list all addresses for the logged-in user
router.get('/', addressController.list.bind(addressController));

// add a new address
router.post('/', validateAddress, addressController.create.bind(addressController));

// update existing address
router.put('/:id', validateAddress, addressController.update.bind(addressController));

// delete address
router.delete('/:id', addressController.remove.bind(addressController));

// mark an address as default
router.post('/:id/default', addressController.setDefault.bind(addressController));

module.exports = router;