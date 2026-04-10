const newsService = require("../service/news.service");

exports.getAllNews = async (req, res) => {
    try {
        const newsList = await newsService.getAllNews();
        res.json({ success: true, data: newsList });
    } catch (error) {
        console.error("❌ Lỗi Controller News - getAllNews:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.getNewsDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await newsService.getNewsById(id);
        if (!news) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tin tức" });
        }
        res.json({ success: true, data: news });
    } catch (error) {
        console.error("❌ Lỗi Controller News - getNewsDetail:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.createNews = async (req, res) => {
    try {
        const newsData = req.body;
        if (!newsData?.title || !String(newsData.title).trim()) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập tiêu đề" });
        }

        const created = await newsService.createNews(newsData);
        res.status(201).json({ success: true, message: "Tạo tin tức thành công", data: created });
    } catch (error) {
        console.error("❌ Lỗi Controller News - createNews:", error);
        const statusCode = error?.statusCode || 500;
        res.status(statusCode).json({ success: false, message: error?.message || "Lỗi máy chủ" });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const newsData = req.body;
        if (!newsData?.title || !String(newsData.title).trim()) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập tiêu đề" });
        }

        const updated = await newsService.updateNews(id, newsData);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tin tức" });
        }

        res.json({ success: true, message: "Cập nhật tin tức thành công", data: updated });
    } catch (error) {
        console.error("❌ Lỗi Controller News - updateNews:", error);
        const statusCode = error?.statusCode || 500;
        res.status(statusCode).json({ success: false, message: error?.message || "Lỗi máy chủ" });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await newsService.deleteNews(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tin tức" });
        }
        res.json({ success: true, message: "Xóa tin tức thành công" });
    } catch (error) {
        console.error("❌ Lỗi Controller News - deleteNews:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

// Handle single image upload for news
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file được upload' });
        }

        // Multer saved file in public/images/products
        const filename = req.file.filename;
        const relativePath = `/public/images/products/${filename}`;

        res.json({ success: true, message: 'Upload thành công', url: relativePath });
    } catch (error) {
        console.error('❌ Lỗi Controller News - uploadImage:', error);
        res.status(500).json({ success: false, message: 'Lỗi upload' });
    }
};
