const orderService = require("../service/order.service");

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Order - getAllOrders:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Order - getOrderDetail:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updatedOrder = await orderService.updateOrderStatus(id, status);
        
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        
        res.json({
            success: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            data: updatedOrder
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Order - updateOrderStatus:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await orderService.deleteOrder(id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }
        
        res.json({
            success: true,
            message: "Xóa đơn hàng thành công"
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Order - deleteOrder:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
