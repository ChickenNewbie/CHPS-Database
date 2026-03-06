import voucherModel from "../models/voucherModel.js";

export default class voucherController{
    static async all(req, res){
        try {
            const vouchers = await voucherModel.getAllVoucher();
            if (!vouchers || vouchers.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "Hiện không có voucher nào khả dụng",
                    data: []
                });
            }
            res.status(200).json({
                success: true,
                message: "Lấy danh sách voucher thành công",
                data: vouchers 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async detail(req, res){
        try {
            const { maVoucher } = req.params;
            if (!maVoucher) {
                return res.status(400).json({ success: false, message: "Thiếu mã Voucher" });
            }
            const voucherDetail = await voucherModel.getVoucherDetail(maVoucher);
            if (!voucherDetail) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Voucher không tồn tại hoặc đã hết hạn/hết số lượng" 
                });
            }
            res.status(200).json({
                success: true,
                message: "Lấy chi tiết voucher thành công",
                data: voucherDetail 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async useVoucher(req, res) {
    try {
        const { maVoucher } = req.body; 
        if (!maVoucher) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu mã Voucher để thực hiện trừ số lượng" 
            });
        }
        const result = await voucherModel.useVoucher(maVoucher);

        if (result.affectedRows === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Không thể sử dụng Voucher này (có thể đã hết số lượng hoặc sai mã)" 
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Sử dụng Voucher thành công, số lượng đã được trừ"
        });
    } catch (error) {
        console.error("Lỗi voucherController use:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}
}