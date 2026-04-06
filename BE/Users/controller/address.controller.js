const addressService = require('../service/address.service');

class AddressController {
  async list(req, res) {
    try {
      const userId = req.user.id;
      const addresses = await addressService.listForUser(userId);
      res.json({ success: true, data: addresses });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const userId = req.user.id;
      const { receiver_name, receiver_phone, full_address, is_default } = req.body;
      const address = await addressService.create(userId, {
        receiver_name,
        receiver_phone,
        full_address,
        is_default: !!is_default
      });
      res.status(201).json({ success: true, data: address });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      const { receiver_name, receiver_phone, full_address, is_default } = req.body;
      const updated = await addressService.update(userId, addressId, {
        receiver_name,
        receiver_phone,
        full_address,
        is_default: !!is_default
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async remove(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      await addressService.remove(userId, addressId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async setDefault(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      const address = await addressService.setDefault(userId, addressId);
      res.json({ success: true, data: address });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AddressController();