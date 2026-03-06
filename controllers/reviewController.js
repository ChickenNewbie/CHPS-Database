import DanhGiaModel from "../models/danhgiaModel.js";
import path from 'path';
import fs from 'fs'
export default class ReviewController{
    static async ReviewLimit(req, res){
        try {
            const {masp} = req.params;
            const reviews = await DanhGiaModel.getReviewByIdLimit(masp);
            res.status(200).json({
                success: true,
                data: reviews 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async all(req, res){
        try {
            const {masp} = req.params;
            const reviews = await DanhGiaModel.getReviewByI(masp);
            res.status(200).json({
                success: true,
                data: reviews 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async addReview(req, res) {
        try {
            const MaUser = req.userId;
            const { MaCTSP, SoSao, NoiDung, MaCTHD } = req.body;

            if (!MaUser || !MaCTSP || !SoSao || !MaCTHD) {
                return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
            }
            const isEligible = await DanhGiaModel.checkEligibility(MaUser, MaCTSP, MaCTHD);
            if (!isEligible) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Bạn chưa mua sản phẩm này hoặc đơn chưa hoàn thành." 
                });
            }

            let fileName = "";
            if (req.files && req.files.HinhAnhDG) {
                const reviewFile = req.files.HinhAnhDG;
                fileName = `${Date.now()}-${reviewFile.name}`;
                const uploadPath = path.join(process.cwd(), 'uploads', fileName);
                await reviewFile.mv(uploadPath);
            }
            const success = await DanhGiaModel.addReview({
                MaUser,
                MaCTSP, 
                SoSao,
                NoiDung: NoiDung || '',
                HinhAnhDG: fileName, 
                MaCTHD: MaCTHD
            });
            if (success) {
                res.status(200).json({ 
                    success: true, 
                    message: "Đánh giá thành công!",
                    image: fileName ? `${process.env.BASE_URL || ''}/uploads/${fileName}` : null
                });
            } else {
                res.status(500).json({ success: false, message: "Lỗi khi lưu vào Database" });
            }

        } catch (error) {
            console.error("Lỗi addReview:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // static async addReview(req, res) {
    //     try {
    //         const MaUser = req.userId;
    //         const { MaCTSP, SoSao, NoiDung, HinhAnhDG, MaCTHD } = req.body;

    //         if (!MaUser || !MaCTSP || !SoSao || !MaCTHD) {
    //             return res.status(400).json({ success: false, message: "Thiếu thông tin" });
    //         }

    //         const isEligible = await DanhGiaModel.checkEligibility(MaUser, MaCTSP, MaCTHD);

    //         if (!isEligible) {
    //             return res.status(403).json({ 
    //                 success: false, 
    //                 message: "Bạn chưa mua sản phẩm này (size/màu này) hoặc đơn chưa hoàn thành." 
    //             });
    //         }

    //         const success = await DanhGiaModel.addReview({
    //             MaUser,
    //             MaCTSP, 
    //             SoSao,
    //             NoiDung: NoiDung || '',
    //             HinhAnhDG: HinhAnhDG || '',
    //             MaCTHD: MaCTHD
    //         });

    //         if (success) {
    //             res.status(200).json({ success: true, message: "Đánh giá thành công!" });
    //         } else {
    //             res.status(500).json({ success: false, message: "Lỗi lưu database" });
    //         }

    //     } catch (error) {
    //         res.status(500).json({ success: false, message: error.message });
    //     }
    // }
}