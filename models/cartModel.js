import { execute } from "../config/db.js";
import cartItemModel from "./cartItemModel.js";

export default class cartModel {
    static async getCartDetails(rows) {
        if (rows.length > 0) {
            const ids = rows.map(cart => cart.MaGH);
            const items = await cartItemModel.findByCartIds(ids);

            rows.forEach(cart => {
                cart.items = items.filter(item => item.MaGH === cart.MaGH);
            });
        }
    }

    static async getByUserId(maUser) {
        const [rows] = await execute(`SELECT * FROM giohang WHERE MaUser = ?`, [maUser]);
        await this.getCartDetails(rows); 
        return rows[0];
    }

    static async getCartByUserId(maUser){
        const [rows] = await execute('SELECT MaGH FROM giohang WHERE MaUser = ?', [maUser]);
        return rows.length > 0 ? rows[0].MaGH : null;
    }

    static async createCart(maUser){
        const [result] = await execute('INSERT INTO giohang (MaUser, CreatedAt, Status) VALUES (?, NOW(),?)', [maUser,1]);
        return result.insertId;
    }

    static async addToCart(maGioHang, maCTSP, soLuong){
        const [existing] = await execute(
            'SELECT SoLuong FROM chitietgiohang WHERE MaGH = ? AND MaCTSP = ?',
            [maGioHang, maCTSP]
        );
        if(existing.length >0){
            const slMoi = existing[0].SoLuong + soLuong;
            return await execute(
                'UPDATE chitietgiohang SET SoLuong = ? WHERE MaGH = ? AND MaCTSP = ?',
                [slMoi, maGioHang, maCTSP]
            );
        }else{
            return await execute(
                'INSERT INTO chitietgiohang (MaGH, MaCTSP, SoLuong, Status) VALUES (?, ?, ?,?)',
                [maGioHang, maCTSP, soLuong,1]
            );
        }
    }

    static async updateQuantity(maGH, maCTSP, soLuongMoi){
        const query = 'UPDATE chitietgiohang SET SoLuong = ? WHERE MaGH = ? AND MaCTSP = ?';
        const [result] = await execute(query, [soLuongMoi, maGH, maCTSP]);
        return result.affectedRows > 0;
    }
    
   static async deleteItem(maGH, maCTSP) { 
        const query = 'DELETE FROM chitietgiohang WHERE MaGH = ? AND MaCTSP = ?';
        const [result] = await execute(query, [maGH, maCTSP]);
        return result.affectedRows > 0;
    }
}