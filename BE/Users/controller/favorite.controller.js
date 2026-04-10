const favoriteService = require('../service/favorite.service');

class FavoriteController {
  async create(req, res) {
    try {
      const userId = req.user && req.user.id;
      const { product_id } = req.body;
      if (!userId) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      if (!product_id) return res.status(400).json({ success: false, message: 'Thiếu product_id' });

      const result = await favoriteService.addFavorite(userId, product_id);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async remove(req, res) {
    try {
      const userId = req.user && req.user.id;
      const { product_id } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      if (!product_id) return res.status(400).json({ success: false, message: 'Thiếu product_id' });

      const result = await favoriteService.removeFavorite(userId, product_id);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async list(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });

      const result = await favoriteService.listFavorites(userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new FavoriteController();
