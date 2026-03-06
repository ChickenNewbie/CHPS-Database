import { BASE_URL } from "../config/constants.js";
import { execute } from "../config/db.js";

export default class cartItemModel {
    static async findByCartIds(ids) {
        try {
            const placeHolders = ids.map(() => '?').join(',');
            const query = `
                SELECT 
                ctgh.*, 
                sp.MaSp,
                sp.TenSP, 
                s.TenSize, 
                m.MauSac, 
                ctsp.Dongia,
                (
                    SELECT CONCAT('${BASE_URL}', h.UrlHA)
                    FROM hinhanh h 
                    WHERE h.MaMau = ctsp.MaMau 
                    AND EXISTS (
                        SELECT 1 FROM chitietsanpham sub_ctsp 
                        WHERE sub_ctsp.MaSP = sp.MaSP AND sub_ctsp.MaCTSP = h.MaCTSP
                    )
                    LIMIT 1
                ) as HinhAnh
            FROM chitietgiohang ctgh
            JOIN chitietsanpham ctsp ON ctgh.MaCTSP = ctsp.MaCTSP
            JOIN sanpham sp ON ctsp.MaSP = sp.MaSP
            JOIN size s ON ctsp.MaSize = s.MaSize
            JOIN mausac m ON ctsp.MaMau = m.MaMau
            WHERE ctgh.MaGH IN (${placeHolders})`;

            const [rows] = await execute(query, ids);
            return rows;
        } catch (error) {
            throw new Error('Database query failed in cartItemModel: ' + error.message);
        }
    }
}