import { execute } from "../config/db.js";

export default class voucherModel {
    static async getAllVoucher() {
        const query = `
            SELECT * 
            FROM voucher 
            WHERE Status = 1
        `;

        const [rows] = await execute(query);
        return rows ?? null;
    }
    static async getVoucherDetail(maVoucher) {
        const query = `
            SELECT GiaTriGiam, DonHangToiThieu, GiamToiDa 
            FROM voucher 
            WHERE MaVoucher = ? 
              AND SoLuongTong > 0 
              AND NgayBatDau <= NOW() 
              AND NgayKetThuc >= NOW() 
              AND Status = 1
        `;

        const [rows] = await execute(query, [maVoucher]);
        
    
        return rows.length > 0 ? rows[0] : null;
    }

    
    static async useVoucher(maVoucher, connection) {
        const query = `UPDATE voucher SET SoLuongTong = SoLuongTong - 1 WHERE MaVoucher = ? AND SoLuongTong > 0`;
        return await connection.execute(query, [maVoucher]);
    }
}