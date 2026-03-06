import cartModel from "../models/cartModel.js";

export default class cartController {
    static async getCart(req, res) {
        try {
            const maUser = req.userId; 
            const cart = await cartModel.getByUserId(maUser);
            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async addCart(req, res){
        try{
            const maUser = req.userId;
            const {maCTSP, soLuong} = req.body;

            let maGioHang = await cartModel.getCartByUserId(maUser);

            if(!maGioHang){
                maGioHang = await cartModel.createCart(maUser);
            }

            await cartModel.addToCart(maGioHang, maCTSP, soLuong);
            res.status(200).json({ success: true, message: "Đã thêm vào giỏ!" });
        }catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateQuantity(req, res){
        try{
            const {maGH, maCTSP, soLuong} = req.body;
            const success = await cartModel.updateQuantity(maGH, maCTSP, soLuong);
            if (success) {
                res.status(200).json({ success: true, message: "Cập nhật thành công" });
            } else {
                res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm trong giỏ" });
            }
        }catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async deleteItem(req, res){
        try{
            const {maGH, maCTSP} = req.body;
            const success = await cartModel.deleteItem(maGH, maCTSP);
            if (success) {
                res.status(200).json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ" });
            } else {
                res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm để xóa" });
            }
        }catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}