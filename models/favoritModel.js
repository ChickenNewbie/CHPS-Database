import { execute } from "../config/db.js";
import { BASE_URL } from "../config/constants.js";

export default class FavoriteModel {
    static async fetchFavoriteProduct(maUser, maSP) {
        try {
            const query = `SELECT * FROM yeuthich WHERE MaUser = ? AND MaSP = ?`;
            const [rows] = await execute(query, [maUser, maSP]);
            return rows;
        } catch (error) {
            throw new Error('Lỗi fetchFavoriteProduct: ' + error.message);
        }
    }

    static async add(maUser, maSP) {
        try {
            const query = `INSERT INTO yeuthich (MaUser, MaSP) VALUES (?, ?)`;
            return await execute(query, [maUser, maSP]);
        } catch (error) {
            throw new Error('Lỗi thêm yêu thích: ' + error.message);
        }
    }

    static async remove(maUser, maSP) {
        try {
            const query = `DELETE FROM yeuthich WHERE MaUser = ? AND MaSP = ?`;
            return await execute(query, [maUser, maSP]);
        } catch (error) {
            throw new Error('Lỗi xóa yêu thích: ' + error.message);
        }
    }

    static async getAllByUser(maUser) {
        try {
            const query = `
                SELECT 
                s.MaSP, s.TenSP, s.MaLoai,
                (SELECT MIN(ct.Dongia) FROM chitietsanpham ct WHERE ct.MaSP = s.MaSP) AS GiaBan,
                IFNULL((
                    SELECT AVG(dg.SoSao) FROM danhgia dg
                    JOIN chitietsanpham ct_dg ON dg.MaCTSP = ct_dg.MaCTSP
                    WHERE ct_dg.MaSP = s.MaSP
                ), 0) AS DiemDanhGia,
                IFNULL((
                    SELECT SUM(cthd_sub.SoLuong) 
                    FROM CHITIETHOADON cthd_sub
                    JOIN HOADON hd ON cthd_sub.MaHD = hd.MaHD
                    JOIN CHITIETSANPHAM ct_sub ON cthd_sub.MaCTSP = ct_sub.MaCTSP
                    WHERE ct_sub.MaSP = s.MaSP 
                    AND hd.Status = 4 
                ), 0) AS LuotBan,
                (SELECT h.UrlHA FROM hinhanh h 
                 JOIN chitietsanpham ct_h ON h.MaCTSP = ct_h.MaCTSP 
                 WHERE ct_h.MaSP = s.MaSP AND h.laAnhChinh = 1 LIMIT 1) AS AnhDaiDien,
                1 AS isFavorite 
                FROM yeuthich yt
                JOIN sanpham s ON yt.MaSP = s.MaSP
                WHERE yt.MaUser = ?
            `;
            const [rows] = await execute(query, [maUser]);
            return rows.map(row => ({
                ...row,
                DiemDanhGia: parseFloat(row.DiemDanhGia),
                GiaBan: parseFloat(row.GiaBan),
                LuotBan: parseInt(row.LuotBan),
                AnhDaiDien: row.AnhDaiDien ? `${BASE_URL}${row.AnhDaiDien}` : null,
                isYeuThich: true 
            }));
        } catch (error) {
            throw new Error('Lỗi lấy danh sách yêu thích: ' + error.message);
        }
    }
}