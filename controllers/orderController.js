import OrderModel from "../models/orderModel.js";
import voucherModel from "../models/voucherModel.js";
import { execute } from "../config/db.js";
import { beginTransaction, commitTransaction, rollbackTransaction } from "../config/db.js";
export default class OrderController{
    static async checkout(req, res){
        const connection = await beginTransaction();
        try{
           const { items, maVoucher, maPVC, maPT, diaChi, sdt, tenNguoiNhan, giaShip, tongGiamGia, tongTienCuoi } = req.body;
            const maHD = await OrderModel.createOrder({
                maUser: req.userId,
                maVoucher,
                maPVC,
                maPT,
                tongTienCuoi,
                tenNguoiNhan,
                sdt,
                diaChi,
                tongGiamGia,
                giaShip
            }, connection);

            for (const item of items) {
                await OrderModel.createOrderItem(maHD, item, connection);
                await OrderModel.updateStock(item.maCTSP, item.soLuong, connection);
            }
            await OrderModel.clearCart(req.userId, items, connection);
            if (maVoucher) {
                await voucherModel.useVoucher(maVoucher, connection);
            }
            await commitTransaction(connection);
            res.status(200).json({
                success: true,
                message: "Đặt hàng thành công!",
                maHD: maHD
            });
        }catch (error) {
            await rollbackTransaction(connection);
            console.error("Lỗi đặt hàng:", error);
            res.status(500).json({ 
                success: false, 
                message: "Đặt hàng thất bại: " + error.message 
            });
        }
    
    }

    static async getMyOrders(req, res) {
        try {
            const maUser = req.userId; 
            const { status } = req.query; 
            const statusId = parseInt(status);
            let query;
            let param;
            if(statusId != 0){
                query = `
                SELECT 
                    MaHD, 
                    TongTienDH, 
                    Status, 
                    PhiShip, 
                    GiaGiam,
                    TenNguoiNhan,  
                    SDTNguoiNhan,   
                    DiaChiGiaHang,   
                    CreatedAt 
                FROM hoadon 
                WHERE MaUser = ? AND Status = ? 
                ORDER BY CreatedAt DESC`;
                param = [maUser, statusId];
            }else{
                query = `
                SELECT 
                    MaHD, 
                    TongTienDH, 
                    Status, 
                    PhiShip, 
                    GiaGiam,
                    TenNguoiNhan,  
                    SDTNguoiNhan,   
                    DiaChiGiaHang,   
                    CreatedAt 
                FROM hoadon 
                WHERE MaUser = ?  
                ORDER BY CreatedAt DESC`;
                param = [maUser];
            }
             
            const [orders] = await execute(query, param);
            for (let order of orders) {
               const items = await OrderModel.getItemsByOrderId(order.MaHD);
                order.items = items; 
            }

            res.status(200).json({
                success: true,
                data: orders
            });

        } catch (error) {
            console.error("Lỗi getMyOrders:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    

    static async cancelOrder(req, res) {
        const { maHD } = req.body;
        const connection = await beginTransaction();
        try {
            const checkQuery = `SELECT Status FROM hoadon WHERE MaHD = ?`;
            const [rows] = await connection.execute(checkQuery, [maHD]);
            if (rows.length === 0) throw new Error("Đơn hàng không tồn tại.");
            if (rows[0].Status !== 1) throw new Error("Đơn hàng đã được xử lý, không thể hủy.");

            await OrderModel.updateStatus(maHD, 5, connection);

            await OrderModel.restoreStock(maHD, connection);

            await commitTransaction(connection);
            res.status(200).json({ 
                success: true, 
                message: "Hủy đơn hàng thành công, sản phẩm đã được hoàn lại vào kho." 
            });
        } catch (error) {
            await rollbackTransaction(connection);
            console.error("Lỗi hủy đơn:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
}