import categoryModel from "../models/categoryModel.js";

export default class CategoryController{
    static async getAllCategoty(req, res){
        try {
            const categories = await categoryModel.all(); 
            if(categories.length == 0){
                res.status(200).json({
                    success: false,
                    message: 'Category is empty'
                });
            }
            res.status(200).json({
                success: true,
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách danh mục: " + error.message
            });
        }
    }
    
    
}