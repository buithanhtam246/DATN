const voucherService = require("../service/voucher.service");

exports.getAllVouchers = async (req, res) => {
    try {
        const vouchers = await voucherService.getAllVouchers();
        res.json({
            success: true,
            data: vouchers
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Voucher - getAllVouchers:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.getVoucherDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const voucher = await voucherService.getVoucherById(id);
        
        if (!voucher) {
            return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
        }
        
        res.json({
            success: true,
            data: voucher
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Voucher - getVoucherDetail:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.createVoucher = async (req, res) => {
    try {
        const voucherData = req.body;
        const newVoucher = await voucherService.createVoucher(voucherData);
        
        res.status(201).json({
            success: true,
            message: "Tạo voucher thành công",
            data: newVoucher
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Voucher - createVoucher:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const voucherData = req.body;
        const updatedVoucher = await voucherService.updateVoucher(id, voucherData);
        
        if (!updatedVoucher) {
            return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
        }
        
        res.json({
            success: true,
            message: "Cập nhật voucher thành công",
            data: updatedVoucher
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Voucher - updateVoucher:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

exports.deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await voucherService.deleteVoucher(id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
        }
        
        res.json({
            success: true,
            message: "Xóa voucher thành công"
        });
    } catch (error) {
        console.error("❌ Lỗi Controller Voucher - deleteVoucher:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
