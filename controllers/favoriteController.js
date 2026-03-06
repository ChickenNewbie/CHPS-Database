import FavoriteModel from "../models/favoritModel.js";

export default class FavoriteController {
    static async ThemXoaFavorite(req, res) {
        try {
            const { maSP } = req.body;
            const maUser = req.userId; 

            if (!maSP) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Thiếu mã sản phẩm (maSP)" 
                });
            }

            const existing = await FavoriteModel.fetchFavoriteProduct(maUser, maSP);

            if (existing.length > 0) {
                await FavoriteModel.remove(maUser, maSP);
                return res.status(200).json({ 
                    success: true, 
                    isFavorite: false, 
                    message: "Đã xóa khỏi danh sách yêu thích" 
                });
            } else {
                await FavoriteModel.add(maUser, maSP);
                return res.status(200).json({ 
                    success: true, 
                    isFavorite: true, 
                    message: "Đã thêm vào danh sách yêu thích" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: "Lỗi Server: " + error.message 
            });
        }
    }

    static async getMyFavorites(req, res) {
        try {
            const maUser = req.userId; 
            const data = await FavoriteModel.getAllByUser(maUser);

            return res.status(200).json({ 
                success: true, 
                data: data 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: "Lỗi khi lấy danh sách yêu thích: " + error.message 
            });
        }
    }
}