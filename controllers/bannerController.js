import BannerModel from "../models/bannerModel.js";

export default class BannerController{
    static async all(req, res){
        try {
            const banners = await BannerModel.fetchBanner();
            res.status(200).json({
                success: true,
                data: banners 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}