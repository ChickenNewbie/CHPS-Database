import shippingModel from "../models/shippingModel.js";

export default class shippingController{
    static async getPrice(req, res){
        const {diachi} = req.body;
        if (!diachi) {
            return res.status(400).json({
                success: false,
                message: "Thiếu địa chỉ"
            });
            }
        try{
            const shipData = await shippingModel.getPriceByAddress(diachi);
            
           res.status(200).json({
                success: true,
                message: "Lấy phí ship thành công!",
                maPVC: shipData.MaPVC,      
                phivanchuyen: shipData.PhiShip 
            });
        }catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    
}