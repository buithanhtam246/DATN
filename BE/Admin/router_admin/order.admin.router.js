const express = require('express');
const router = express.Router();
const orderAdminController = require('../controller_admin/order.admin.controller');

// Middlewares for admin auth could be added here
// router.use(adminAuthMiddleware);

router.get('/orders', orderAdminController.list);
router.patch('/orders/:id/status', orderAdminController.updateStatus);

module.exports = router;