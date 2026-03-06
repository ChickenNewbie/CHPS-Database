import productModel from "../models/productModel.js";

export default class productController {

    static async getAll(req, res) {
        try {
            const products = await productModel.all(); 
            if(products.length == 0){
                res.status(200).json({
                    success: false,
                    message: 'Products is empty'
                });
            }
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách sản phẩm: " + error.message
            });
        }
    }

    static async getByCategory(req, res) {
        try {
            const { id } = req.params; 
            const products = await productModel.findByCategory([id], true);
            
            if(products.length == 0){
                res.status(200).json({
                    success: false,
                    message: 'Products is empty'
                });
            }
            
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi khi lọc sản phẩm theo loại: " + error.message
            });
        }
    }

    static async getById(req, res){
        try{
            const {id} = req.params;
            const prodcutDetail = await productModel.getProductDetail(id);
            if(!prodcutDetail){
                res.status(200).json({
                    success: false,
                    message: 'Product detail not found'
                });
            }
             res.status(200).json({
                success: true,
                data: prodcutDetail
            });
        }catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi chi tiết sản phẩm: " + error.message
            });
        }
    }

    static async getBestSelling(req, res) {
        try {
            const maUser = req.userId ? req.userId : null;
            const products = await productModel.bestSellingProduct(maUser); 
            if(products.length == 0){
                res.status(200).json({
                    success: false,
                    message: 'Products is empty'
                });
            }
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách sản phẩm: " + error.message
            });
        }
    }
}
/**
 * chương 1lý chọn đề tài
 * chương 2: phân tích và thiết kế hệ thống(vẽ sever đám mây)
 * thiết kế usecasse, dìgram và mô tả bảng db,
 * chọn 5 -6 màn hình thiét kế si quan diagram, activity diagram
 * chương 3 hiện thực ( chụp hình ứng dụng va web api, công nghệ, mô tả hướng đãn sử dụng và các ràng buọc)
 * chương 4 Tổng kết đnahs giá, những thuận lợi và khó khăn và hướng phát triển(app admin chưa hoành hảo)
 * phụ lục ( chứa các file phân công, chi tiết và từng buổi, tham khảo các app hoặc trang web)
 */