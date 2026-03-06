import { BASE_URL } from '../config/constants.js';
import { execute } from '../config/db.js';


const STATUS_MAP = {
    1: 'pending', 2: 'confirmed', 3: 'shipping', 4: 'completed', 5: 'cancelled'
};
const STATUS_MAP_REVERSE = {
    'pending': 1, 'confirmed': 2, 'shipping': 3, 'completed': 4, 'cancelled': 5
};

export default class AdminOrderController {
    static async getAllOrders(req, res) {
        try {
            const { status } = req.query;
            let query = `SELECT * FROM hoadon`;
            let params = [];
            if (status && status !== 'all' && STATUS_MAP_REVERSE[status] !== undefined) {
                query += ` WHERE Status = ?`;
                params.push(STATUS_MAP_REVERSE[status]);
            }
            query += ` ORDER BY CreatedAt DESC`;
            
            const [orders] = await execute(query, params);

            const fullOrders = await Promise.all(orders.map(async (order) => {
                
                const queryItems = `
                    SELECT 
                        cthd.SoLuong, 
                        cthd.Gia,
                        sp.TenSP, 
                        s.TenSize, 
                        m.MauSac,
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
                    LEFT JOIN size s ON ctsp.MaSize = s.MaSize
                    LEFT JOIN mausac m ON ctsp.MaMau = m.MaMau
                    WHERE cthd.MaHD = ?
                `;

                const [items] = await execute(queryItems, [order.MaHD]);

                return {
                    id: order.MaHD.toString(),
                    customerName: order.TenNguoiNhan || 'Khách vãng lai',
                    customerPhone: order.SDTNguoiNhan || '',
                    address: order.DiaChiGiaHang || '',
                    orderDate: order.CreatedAt,
                    totalAmount: order.TongTienDH,
                    shippingFee: order.PhiShip || 0,
                    voucherCode: order.MaVoucher, 
                    discount: order.GiaGiam || 0,
                    status: STATUS_MAP[order.Status] || 'unknown', 
                    
                    items: items.map(item => ({
                        productName: item.TenSP,
                        quantity: item.SoLuong,
                        price: item.Gia,
                    
                        size: item.TenSize || '',   
                        color: item.MauSac || '',   
                        image: item.HinhAnh || ''   
                    })),
                };
            }));
            res.status(200).json({ success: true, orders: fullOrders });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    }


    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const statusInt = STATUS_MAP_REVERSE[status];
            if (statusInt === undefined) return res.status(400).json({ success: false, message: 'Status lỗi' });
            await execute(`UPDATE HoaDon SET Status = ?, UpdatedAt = NOW() WHERE MaHD = ?`, [statusInt, id]);
            res.status(200).json({ success: true, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getOrderStats(req, res) {
        try {
            const [rows] = await execute(`SELECT Status, COUNT(*) as count FROM HoaDon GROUP BY Status`);
            const stats = { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
            
            rows.forEach(row => {
                const str = STATUS_MAP[row.Status];
                if (str) stats[str] = row.count;
            });
            res.status(200).json({ success: true, stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}