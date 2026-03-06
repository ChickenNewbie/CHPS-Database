import { BASE_URL } from "../config/constants.js";
import { execute } from "../config/db.js";
import productModel from "./productModel.js";

export default class categoryModel{


    static async findById(ids, includeProducts = false, maUser = null) { 
        try {
            const placeHolders = ids.map(() => '?').join(',');
            const query = `SELECT * FROM LOAISANPHAM WHERE MaLoai IN (${placeHolders})`;
            const [rows] = await execute(query, ids);
            
            if (includeProducts) {
                await categoryModel.getProducts(rows, maUser); 
            }
            return rows;
        } catch (errors) {
            throw new Error('Database query failed: ' + errors.message);
        }
    }


    static async getProducts(rows, maUser = null) {
        if (rows.length > 0) {
            const ids = rows.map(cate => cate.MaLoai);
            const products = await productModel.findByCategory(ids, false, maUser);
            
            rows.forEach(dm => {
                dm.san_pham = products.filter(p => p.MaLoai === dm.MaLoai);
            });
        }
    }

    
    static async all(){
        try{
            const query = 'SELECT * FROM LOAISANPHAM';
            const [rows] =await execute(query);
            return rows.map(row =>({
                ...row,
                Icon : row.Icon ? `${BASE_URL}${row.Icon}` : null
            }));
        }catch(error){
            throw new Error('Lỗi lấy danh mục: ' + error.message);
        }
    }
    
}