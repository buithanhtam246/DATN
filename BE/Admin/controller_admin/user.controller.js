const userService = require("../service/user.service");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("❌ Lỗi Controller User - getAllUsers:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("❌ Lỗi Controller User - getUserDetail:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        
        const updatedUser = await userService.updateUser(id, userData);
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        
        res.json({
            success: true,
            message: "Cập nhật người dùng thành công",
            data: updatedUser
        });
    } catch (error) {
        console.error("❌ Lỗi Controller User - updateUser:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await userService.deleteUser(id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        
        res.json({
            success: true,
            message: "Xóa người dùng thành công"
        });
    } catch (error) {
        console.error("❌ Lỗi Controller User - deleteUser:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
