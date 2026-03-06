import { BASE_URL } from "../config/constants.js";
import { execute } from "../config/db.js";

export default class OrderModel{
    static async createOrder(data, connection){
       const {
            maUser, maVoucher, maPVC, maPT, tongTienCuoi,
            tenNguoiNhan, sdt, diaChi, tongGiamGia, giaShip
        } = data;

        const query = `
            INSERT INTO hoadon (
                MaUser, MaVoucher, MaPVC, MaPT, TongTienDH, 
                TenNguoiNhan, SDTNguoiNhan, DiaChiGiaHang, 
                GiaGiam, Status, PhiShip, CreatedAt
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())`;

        const [result] = await connection.execute(query, [
            maUser, 
            maVoucher || null, 
            maPVC, 
            maPT, 
            tongTienCuoi,
            tenNguoiNhan, 
            sdt, 
            diaChi, 
            tongGiamGia, 
            giaShip
        ]);
        return result.insertId;
    }
    // const{ maUser, maVoucher, maPVC, tongTienCuoi, 
    //         tenNguoiNhan, sdt, diaChi, tongGiamGia, giaShip
    //     } = data;
    static async createOrderItem(maHD, item, connection) {
        const query = `
            INSERT INTO chitiethoadon (MaHD, MaCTSP, SoLuong, Gia, GiaGiam, TongTien, Status) 
            VALUES (?, ?, ?, ?, 0, ?, 1)`;
        const thanhTien = item.soLuong * item.donGia;
        await connection.execute(query, [
            maHD, item.maCTSP, item.soLuong, item.donGia, thanhTien
        ]);
    }

    static async clearCart(maUser, items, connection) {
        const selectQuery = 'SELECT MaGH FROM giohang WHERE MaUser = ?';
        const [cart] = await connection.execute(selectQuery, [maUser]);
        if (cart.length > 0) {
            const maGH = cart[0].MaGH;
            for (const item of items) {
                const deleteQuery = 'DELETE FROM chitietgiohang WHERE MaGH = ? AND MaCTSP = ?';
                await connection.execute(deleteQuery, [maGH, item.maCTSP]);
            }
            console.log("Đã xóa các sản phẩm đã thanh toán khỏi giỏ hàng.");
        }
    }

    // static async getItemsByOrderId(maHD) {
    //     const query = `
    //     SELECT 
    //         cthd.MaCTSP, 
    //         cthd.SoLuong, 
    //         cthd.Gia,
    //         sp.TenSP, 
    //         sp.MaSP,
    //         s.TenSize, 
    //         m.MauSac,
    //         (
    //             SELECT CONCAT('${BASE_URL}', h.UrlHA)
    //             FROM hinhanh h 
    //             WHERE h.MaMau = ctsp.MaMau 
    //             AND EXISTS (
    //                 SELECT 1 FROM chitietsanpham sub_ctsp 
    //                 WHERE sub_ctsp.MaSP = sp.MaSP 
    //                 AND sub_ctsp.MaCTSP = h.MaCTSP
    //             )
    //             ORDER BY h.laAnhChinh DESC 
    //             LIMIT 1
    //         ) as HinhAnh
    //     FROM chitiethoadon cthd
    //     JOIN chitietsanpham ctsp ON cthd.MaCTSP = ctsp.MaCTSP
    //     JOIN sanpham sp ON ctsp.MaSP = sp.MaSP
    //     JOIN size s ON ctsp.MaSize = s.MaSize
    //     JOIN mausac m ON ctsp.MaMau = m.MaMau
    //     WHERE cthd.MaHD = ?`;

    //     const [rows] = await execute(query, [maHD]);
    //     return rows;
    // }
    static async getItemsByOrderId(maHD) {
        const query = `
        SELECT 
            cthd.MaCTSP, 
            cthd.SoLuong, 
            cthd.Gia,
            cthd.MaCTHD,
            sp.TenSP, 
            sp.MaSP,
            s.TenSize, 
            m.MauSac,
           (
                SELECT COUNT(*) 
                FROM danhgia dg 
                WHERE dg.MaCTHD = cthd.MaCTHD 
            ) > 0 AS DaDanhGia,
            (
                SELECT CONCAT('${BASE_URL}', h.UrlHA)
                FROM hinhanh h 
                WHERE h.MaMau = ctsp.MaMau 
                AND EXISTS (
                    SELECT 1 FROM chitietsanpham sub_ctsp 
                    WHERE sub_ctsp.MaSP = sp.MaSP 
                    AND sub_ctsp.MaCTSP = h.MaCTSP
                )
                ORDER BY h.laAnhChinh DESC 
                LIMIT 1
            ) as HinhAnh
        FROM chitiethoadon cthd
        JOIN chitietsanpham ctsp ON cthd.MaCTSP = ctsp.MaCTSP
        JOIN sanpham sp ON ctsp.MaSP = sp.MaSP
        JOIN size s ON ctsp.MaSize = s.MaSize
        JOIN mausac m ON ctsp.MaMau = m.MaMau
        WHERE cthd.MaHD = ?`;

        const [rows] = await execute(query, [maHD]);
        return rows.map(item => ({
            ...item,
            DaDanhGia: (item.DaDanhGia === 1) 
        }));
    }
    static async updateStock(maCTSP, soLuong, connection) {
        const query = `
            UPDATE chitietsanpham 
            SET SLT = SLT - ? 
            WHERE MaCTSP = ? AND SLT >= ?`;

        const [result] = await connection.execute(query, [soLuong, maCTSP, soLuong]);
        
        if (result.affectedRows === 0) {
            throw new Error(`Sản phẩm (Mã: ${maCTSP}) đã hết hàng hoặc không đủ số lượng tồn kho.`);
        }
    }


    static async restoreStock(maHD, connection) {
        const getItemsQuery = `SELECT MaCTSP, SoLuong FROM chitiethoadon WHERE MaHD = ?`;
        const [items] = await connection.execute(getItemsQuery, [maHD]);

        const updateStockQuery = `UPDATE chitietsanpham SET SLT = SLT + ? WHERE MaCTSP = ?`;
        for (const item of items) {
            await connection.execute(updateStockQuery, [item.SoLuong, item.MaCTSP]);
        }
    }

    static async updateStatus(maHD, newStatus, connection) {
        const query = `UPDATE hoadon SET Status = ? WHERE MaHD = ?`;
        await connection.execute(query, [newStatus, maHD]);
    }
}