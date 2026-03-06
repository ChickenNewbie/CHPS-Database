import addressModel from "../models/addressModel.js";

export default class addressController{
    static async add(req, res){
        const maUser = req.userId;
        const { TenNguoiNhan, SDT, DiaChi, LaMacDinh } = req.body;
        try{
            const address = await addressModel.addAddress(maUser, req.body
            );
            if (!TenNguoiNhan || !SDT || !DiaChi) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ thông tin bắt buộc"
                });
            }
            res.status(200).json({
                success: true,
                message: "Thêm địa chỉ mới thành công!",
                data: address
            });
        }catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async all(req, res){
        const maUser = req.userId;
        console.log("Đang lấy địa chỉ cho User ID:", maUser);
        try{
            const address = await addressModel.getAllAddress(maUser);
            res.status(200).json({
                success: true,
                message: "Lấy địa chỉ thành công!",
                data: address
            });
        }catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }


    static async updateAddress(req, res) {
        try {
            const maDiaChi = req.params.id; 
            const maUser = req.userId; 
            const data = req.body; 
            if (!maDiaChi) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Thiếu mã địa chỉ cần sửa" 
                });
            }
            const updatedAddress = await addressModel.updateAddress(maDiaChi, maUser, data);

            if (!updatedAddress) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Không tìm thấy địa chỉ hoặc bạn không có quyền sửa địa chỉ này" 
                });
            }

            return res.status(200).json({
                success: true,
                message: "Cập nhật địa chỉ thành công",
                data: updatedAddress
            });

        } catch (error) {
            console.error("Lỗi Controller:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Lỗi Server: " + error.message 
            });
        }
    }


    static async deleteAddress(req, res) {
        try {
            const { id } = req.params; 
            const userId = req.userId; 

            if (!id) {
                return res.status(400).json({ success: false, message: "Thiếu mã địa chỉ" });
            }

            const isDeleted = await addressModel.deleteAddress(id, userId);

            if (isDeleted) {
                return res.status(200).json({ 
                    success: true, 
                    message: "Xóa địa chỉ thành công" 
                });
            } else {
                return res.status(404).json({ 
                    success: false, 
                    message: "Không tìm thấy địa chỉ hoặc bạn không có quyền xóa" 
                });
            }

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}