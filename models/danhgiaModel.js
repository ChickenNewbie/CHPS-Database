import { BASE_URL } from "../config/constants.js";
import { execute } from "../config/db.js";
export default class DanhGiaModel{
    static async getReviewByIdLimit(MaSP){
        try{
            const [reviews] = await execute(`
                        SELECT dg.MaDG, dg.SoSao, dg.NoiDung, dg.HinhAnhDG, dg.NgayDanhGia,
                        u.Username, s.TenSize, m.MauSac
                        FROM DANHGIA dg
                        JOIN USER u ON dg.MaUser = u.MaUser
                        JOIN CHITIETSANPHAM ct ON dg.MaCTSP = ct.MaCTSP
                        JOIN SIZE s ON ct.MaSize = s.MaSize
                        JOIN MAUSAC m ON ct.MaMau = m.MaMau
                        WHERE ct.MaSP = ? AND dg.Status = 1
                        ORDER BY dg.NgayDanhGia DESC
                        LIMIT 2
                        `, [MaSP]);
            return reviews.map(review => ({
            ...review,
            HinhAnhDG: review.HinhAnhDG 
                ? `${BASE_URL}${review.HinhAnhDG}` 
                : ''
        }));

        }catch (error) {
            throw new Error('Lỗi lấy sản phẩm chi tiết: ' + error.message);
        }
    }

    static async getReviewByI(MaSP){
        try{
            const [reviews] = await execute(`
                        SELECT dg.MaDG, dg.SoSao, dg.NoiDung, dg.HinhAnhDG, dg.NgayDanhGia, 
                        u.Username, s.TenSize, m.MauSac
                        FROM DANHGIA dg
                        JOIN USER u ON dg.MaUser = u.MaUser
                        JOIN CHITIETSANPHAM ct ON dg.MaCTSP = ct.MaCTSP
                        JOIN SIZE s ON ct.MaSize = s.MaSize
                        JOIN MAUSAC m ON ct.MaMau = m.MaMau
                        WHERE ct.MaSP = ? AND dg.Status = 1
                        ORDER BY dg.NgayDanhGia DESC
                        `, [MaSP]);
            return reviews.map(review => ({
            ...review,
            HinhAnhDG: review.HinhAnhDG 
                ? `${BASE_URL}${review.HinhAnhDG}` 
                : ''
        }));

        }catch (error) {
            throw new Error('Lỗi lấy sản phẩm chi tiết: ' + error.message);
        }
    }

    // static async checkEligibility(MaUser, MaCTSP) {
    //     try {
    //         const query = `
    //             SELECT 1
    //             FROM HOADON hd
    //             JOIN CHITIETHOADON cthd ON hd.MaHD = cthd.MaHD
    //             WHERE hd.MaUser = ? 
    //             AND cthd.MaCTSP = ?  
    //             AND hd.Status = 4   
    //             LIMIT 1
    //         `;
    //         const [rows] = await execute(query, [MaUser, MaCTSP]);
    //         return rows.length > 0; 
    //     } catch (error) {
    //         throw new Error('Lỗi check điều kiện: ' + error.message);
    //     }
    // }
    static async checkEligibility(MaUser, MaCTSP, MaCTHD) { 
        try {
            const query = `
                SELECT 1
                FROM HOADON hd
                JOIN CHITIETHOADON cthd ON hd.MaHD = cthd.MaHD
                WHERE hd.MaUser = ? 
                AND cthd.MaCTSP = ?  
                AND cthd.MaCTHD = ? 
                AND hd.Status = 4    
                AND cthd.MaCTHD NOT IN (SELECT MaCTHD FROM DANHGIA WHERE MaCTHD IS NOT NULL)
                LIMIT 1
            `;
            
            const [rows] = await execute(query, [MaUser, MaCTSP, MaCTHD]);
            return rows.length > 0; 
        } catch (error) {
            throw new Error('Lỗi check điều kiện: ' + error.message);
        }
    }
  
    static async addReview({ MaUser, MaCTSP, SoSao, NoiDung, HinhAnhDG, MaCTHD}) {
        try {
            const query = `
                INSERT INTO DANHGIA (MaUser, MaCTSP, MaCTHD, SoSao, NoiDung, HinhAnhDG, ThoiGian, Status, NgayDanhGia)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), 1, NOW())
            `;
            const [result] = await execute(query, [MaUser, MaCTSP, MaCTHD, SoSao, NoiDung, HinhAnhDG]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Lỗi thêm review: ' + error.message);
        }
    }
}