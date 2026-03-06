import { BASE_URL } from "../config/constants.js";
import { execute } from "../config/db.js";
import categoryModel from "./categoryModel.js";

export default class productModel{
  

    static async findByCategory(category_id, includeCategory = false, maUser = null) {
        try {
            const placeHolders = category_id.map(() => '?').join(',');
            const query = `
            SELECT 
                s.MaSP, s.TenSP, s.MaLoai,
                MIN(ct.Dongia) AS GiaBan, 
                IFNULL((
                    SELECT AVG(dg.SoSao) 
                    FROM DANHGIA dg
                    JOIN CHITIETSANPHAM ct_dg ON dg.MaCTSP = ct_dg.MaCTSP
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
                (SELECT h.UrlHA FROM HINHANH h 
                WHERE h.MaCTSP = (
                    SELECT MaCTSP FROM CHITIETSANPHAM 
                    WHERE MaSP = s.MaSP LIMIT 1
                ) AND h.laAnhChinh = 1 LIMIT 1) AS AnhDaiDien,
                IF(yt.MaYT IS NULL, 0, 1) AS isFavorite 
            FROM SANPHAM s
            LEFT JOIN CHITIETSANPHAM ct ON s.MaSP = ct.MaSP
            LEFT JOIN yeuthich yt ON s.MaSP = yt.MaSP AND yt.MaUser = ? 
            WHERE s.Status = 1 AND s.MaLoai IN (${placeHolders})
            GROUP BY s.MaSP
        `;
            const [rows] = await execute(query, [maUser, ...category_id]);

            if (includeCategory) {
                await productModel.getCategory(rows);
            }

            return rows.map(row => ({
                ...row,
                DiemDanhGia: parseFloat(row.DiemDanhGia),
                LuotBan: parseInt(row.LuotBan),
                GiaBan: parseFloat(row.GiaBan),
                AnhDaiDien: row.AnhDaiDien ? `${BASE_URL}${row.AnhDaiDien}` : null,
                isYeuThich: row.isFavorite === 1 
            }));

        } catch (errors) {
            throw new Error('Database query failed: ' + errors.message);
        }
    }

    static async getCategory(rows){
        if(rows.length > 0){
            const danhMucIds = Array.from(new Set(rows.map(sp => sp.MaLoai)));
            const danhMuc = await categoryModel.findById(danhMucIds, false);
            rows.forEach(sp => {
                sp.danh_muc = danhMuc.find(dm => dm.MaLoai === sp.MaLoai);
            });
        }
    }

    static async all(maUser = null) {
        try {
        const query = `
            SELECT 
                s.MaSP, s.TenSP, s.MaLoai,
                ct.Dongia AS GiaBan, 
                IFNULL((
                    SELECT AVG(dg.SoSao) 
                    FROM DANHGIA dg
                    JOIN CHITIETSANPHAM ct ON dg.MaCTSP = ct.MaCTSP
                    WHERE ct.MaSP = s.MaSP
                ), 0) as DiemDanhGia,
               IFNULL((
                    SELECT SUM(cthd_sub.SoLuong) 
                    FROM CHITIETHOADON cthd_sub
                    JOIN HOADON hd ON cthd_sub.MaHD = hd.MaHD 
                    JOIN CHITIETSANPHAM ct_sub ON cthd_sub.MaCTSP = ct_sub.MaCTSP
                    WHERE ct_sub.MaSP = s.MaSP 
                    AND hd.Status = 4 
                ), 0) AS LuotBan, 
                (SELECT h.UrlHA FROM HINHANH h 
                WHERE h.MaCTSP = ct.MaCTSP AND h.laAnhChinh = 1 LIMIT 1) AS AnhDaiDien,
                IF(yt.MaYT IS NULL, 0, 1) AS isFavorite
            FROM SANPHAM s
            LEFT JOIN CHITIETSANPHAM ct ON s.MaSP = ct.MaSP
            LEFT JOIN yeuthich yt ON s.MaSP = yt.MaSP AND yt.MaUser = ?
            WHERE s.Status = 1
            GROUP BY s.MaSP
        `;
            
            const [rows] = await execute(query, [maUser]);

            
            await productModel.getCategory(rows);

            return rows.map(row => ({
                ...row,
                DiemDanhGia: parseFloat(row.DiemDanhGia), 
                LuotBan: parseInt(row.LuotBan),           
                GiaBan: parseFloat(row.GiaBan),
                AnhDaiDien: row.AnhDaiDien ? `${BASE_URL}${row.AnhDaiDien}` : null ,          
                isYeuThich: row.isFavorite === 1
            }));
        } catch (errors) {
            throw new Error('Lỗi lấy danh sách sản phẩm: ' + errors.message);
        }
    }

    static async bestSellingProduct(maUser) {
        try {
        const query = `
            SELECT 
                s.MaSP, s.TenSP, s.MaLoai,
                ct.Dongia AS GiaBan, 
                IFNULL((
                    SELECT AVG(dg.SoSao) 
                    FROM DANHGIA dg
                    JOIN CHITIETSANPHAM ct ON dg.MaCTSP = ct.MaCTSP
                    WHERE ct.MaSP = s.MaSP
                ), 0) as DiemDanhGia,
                IFNULL((
                    SELECT SUM(cthd_sub.SoLuong) 
                    FROM CHITIETHOADON cthd_sub
                    JOIN HOADON hd ON cthd_sub.MaHD = hd.MaHD 
                    JOIN CHITIETSANPHAM ct_sub ON cthd_sub.MaCTSP = ct_sub.MaCTSP
                    WHERE ct_sub.MaSP = s.MaSP 
                    AND hd.Status = 4 
                ), 0) AS LuotBan, 
                (SELECT h.UrlHA FROM HINHANH h 
                WHERE h.MaCTSP = ct.MaCTSP AND h.laAnhChinh = 1 LIMIT 1) AS AnhDaiDien,
                IF(yt.MaYT IS NULL, 0, 1) AS isFavorite
            FROM SANPHAM s
            LEFT JOIN CHITIETSANPHAM ct ON s.MaSP = ct.MaSP
            LEFT JOIN yeuthich yt ON s.MaSP = yt.MaSP AND yt.MaUser = ?
            WHERE s.Status = 1
            GROUP BY s.MaSP
            ORDER BY LuotBan DESC 
            LIMIT 10;
        `;
            
            const [rows] = await execute(query, [maUser]);

            await productModel.getCategory(rows);

            return rows.map(row => ({
                ...row,
                DiemDanhGia: parseFloat(row.DiemDanhGia), 
                LuotBan: parseInt(row.LuotBan),           
                GiaBan: parseFloat(row.GiaBan),
                AnhDaiDien: row.AnhDaiDien ? `${BASE_URL}${row.AnhDaiDien}` : null ,          
                isYeuThich: row.isFavorite === 1
            }));
        } catch (errors) {
            throw new Error('Lỗi lấy danh sách sản phẩm: ' + errors.message);
        }
    }
    
    static async getProductDetail(MaSP){
        try{
            const [products] = await execute(`
            SELECT 
                s.*, 
                IFNULL((
                    SELECT AVG(dg.SoSao) 
                    FROM DANHGIA dg
                    JOIN CHITIETSANPHAM ct ON dg.MaCTSP = ct.MaCTSP
                    WHERE ct.MaSP = s.MaSP
                ), 0) as DiemDanhGia,
                (
                    SELECT COUNT(dg.MaDG) 
                    FROM DANHGIA dg
                    JOIN CHITIETSANPHAM ct ON dg.MaCTSP = ct.MaCTSP
                    WHERE ct.MaSP = s.MaSP
                ) as TongSoDanhGia,
                 IFNULL((
                    SELECT SUM(cthd_sub.SoLuong) 
                    FROM CHITIETHOADON cthd_sub
                    JOIN HOADON hd ON cthd_sub.MaHD = hd.MaHD 
                    JOIN CHITIETSANPHAM ct_sub ON cthd_sub.MaCTSP = ct_sub.MaCTSP
                    WHERE ct_sub.MaSP = s.MaSP 
                    AND hd.Status = 4 
                ), 0) AS LuotBan
            FROM SANPHAM s
            WHERE s.MaSP = ? AND s.Status = 1
            `, [MaSP]);
            if(products.length === 0) return null;
            const product = products[0];

            const [rows] = await execute(`
                    SELECT ct.MaCTSP, ct.Dongia, ct.SLT, s.TenSize, m.MauSac
                    FROM CHITIETSANPHAM ct
                    JOIN SIZE s ON ct.MaSize = s.MaSize
                    JOIN MAUSAC m ON ct.MaMau = m.MaMau
                    WHERE ct.MaSP = ? AND ct.Status = 1
                `, [MaSP]
            );
           const [images] = await execute(`
            SELECT DISTINCT h.UrlHA, h.MaMau, m.MauSac
            FROM HINHANH h
            JOIN CHITIETSANPHAM ct ON h.MaCTSP = ct.MaCTSP 
            LEFT JOIN MAUSAC m ON h.MaMau = m.MaMau
            WHERE ct.MaSP = ?
        `, [MaSP]);

            const sizes = [...new Set(rows.map(item => item.TenSize))];
            const colors = [...new Set(rows.map(item => item.MauSac))];
            const urlImages = images.map(img => ({
                url: `${BASE_URL}${img.UrlHA}`,
                maMau: img.MaMau,
                mauSac: img.MauSac
            }));
           return {
                ...product,
                DiemDanhGia: parseFloat(product.DiemDanhGia).toFixed(1), // Ví dụ: 4.5
                LuotBan: parseInt(product.LuotBan),
                images: urlImages,
                sizes: sizes,
                colors: colors,
                variants: rows
            };
            
            
        }catch (error) {
            throw new Error('Lỗi lấy sản phẩm chi tiết: ' + error.message);
        }
    }
}