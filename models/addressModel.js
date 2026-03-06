import { execute } from "../config/db.js";
export default class addressModel{
    static async addAddress(maUser, data){
         const { TenNguoiNhan, SDT, DiaChi, LaMacDinh } = data;
        try{
            if(LaMacDinh == 1 || LaMacDinh == true){
                const updateQuery = 'UPDATE DIACHI SET LaMacDinh = 0 WHERE MaUser = ?';
                await execute(updateQuery, [maUser]);
            }
            const query = `
                INSERT INTO DIACHI (MaUser, TenNguoiNhan, SDT, DiaChiChiTiet, LaMacDinh, Status) 
                VALUES (?, ?, ?, ?, ?, 1)
            `;
            const [result] = await execute(
                query,
                [
                    maUser, TenNguoiNhan, SDT, DiaChi, LaMacDinh ? 1 : 0
                ]
            );
            return {
                MaDC: result.insertId, 
                TenNguoiNhan: TenNguoiNhan,
                SDT: SDT,
                DiaChiChiTiet: DiaChi,
                LaMacDinh: LaMacDinh ? 1 : 0
            };
        }catch (error) {
            throw new Error('Database query failed in addressModel: ' + error.message);
        }
    }

    static async getAllAddress(maUser){
        try{
            const query = `
                SELECT * FROM DIACHI 
                WHERE MaUser = ? AND Status = 1 
                ORDER BY LaMacDinh DESC, MaDC DESC
            `;
            const [rows] = await execute(query, [maUser]);
            return rows;
        }catch (error) {
            throw new Error('Database query failed in getAllAddress: ' + error.message);
        }
    }

    static async updateAddress(maDiaChi, maUser, data) { 
        const { TenNguoiNhan, SDT, DiaChi, LaMacDinh } = data;

        try {
            if (LaMacDinh == 1 || LaMacDinh === true) {
                const updateDefaultQuery = 'UPDATE diachi SET LaMacDinh = 0 WHERE MaUser = ?';
                await execute(updateDefaultQuery, [maUser]);
            }

            const query = `
                UPDATE diachi 
                SET TenNguoiNhan = ?, SDT = ?, DiaChiChiTiet = ?, LaMacDinh = ? 
                WHERE MaDC = ? AND MaUser = ?
            `;

            const [result] = await execute(query, [
                TenNguoiNhan,
                SDT,
                DiaChi,   
                LaMacDinh ? 1 : 0,
                maDiaChi,         
                maUser           
            ]);

            if (result.affectedRows === 0) {
                return null;
            }

            return {
                MaDC: maDiaChi, 
                TenNguoiNhan: TenNguoiNhan,
                SDT: SDT,
                DiaChiChiTiet: DiaChi,
                LaMacDinh: LaMacDinh ? 1 : 0,
            };

        } catch (error) {
            throw new Error('Lỗi cập nhật địa chỉ: ' + error.message);
        }
    }

    static async deleteAddress(maDiaChi, maUser) {
        try {
            const query = 'DELETE FROM diachi WHERE MaDC = ? AND MaUser = ?';
            
            const [result] = await execute(query, [maDiaChi, maUser]);
            return result.affectedRows > 0;

        } catch (error) {
            throw new Error('Lỗi xóa địa chỉ: ' + error.message);
        }
    }
}