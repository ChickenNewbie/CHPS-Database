import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import crypto from 'crypto';
import { BASE_URL } from '../config/constants.js';
import path from 'path';
import fs from 'fs'
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const PASSWORD_HASH_ROUNDS = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
});

export default class userController {
    static async generateToken(user) {
        return jwt.sign(
            { MaUser: user.MaUser, isAdmin: user.LaAdmin}, 
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    static async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập Email và Mật khẩu' });
        }

        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Email không tồn tại trong hệ thống' });
        }


        const isMatch = await compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác' });
        }

        const token = await userController.generateToken(user);
        return res.status(200).json({
            success: true,
            token: token,
            user: {
                username: user.Username,
                email: user.Email,
                address : user.DiaChi,
                sdt: user.SDT,
                laAdmin : user.LaAdmin,
                avatar :  `${BASE_URL}${user.Avatar}`
            }
        });
    }




    static async updateProfile(req, res) {
        try {
            const id = req.userId; 
            const { username, email, address, password, sdt, avatar } = req.body;

            if (!id) return res.status(401).json({ success: false, message: "Unauthorized" });

            const currentUser = await userModel.findMaUser(id);
            if (!currentUser) return res.status(404).json({ success: false, message: "User not found" });

 
            let finalPassword = currentUser.Password; 
            if (password && password.trim() !== "") {
                if (!await userController.validatePassword(password)) {
                    return res.status(400).json({ success: false, message: 'Mật khẩu mới không đủ mạnh' });
                }
                finalPassword = await hash(password, PASSWORD_HASH_ROUNDS);
            }

            const isUpdated = await userModel.updateInfo(id, {
                username: username || currentUser.Username,
                email: email || currentUser.Email,
                address: address || currentUser.DiaChi,
                password: finalPassword,
                sdt: sdt || currentUser.SDT,
                avatar: avatar || currentUser.Avatar
            });

            if (isUpdated) {
                const updatedUser = await userModel.findMaUser(id);
                res.status(200).json({
                    success: true,
                    message: "Cập nhật thành công",
                    user: {
                        username: updatedUser.Username,
                        email: updatedUser.Email,
                        address: updatedUser.DiaChi,
                        sdt: updatedUser.SDT,
                        avatar :  `${BASE_URL}/${updatedUser.Avatar}`
                    }
                });
            } else {
                res.status(400).json({ success: false, message: "Không có thay đổi nào" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async register(req, res) {
        const { username, email, password } = req.body; 
        
        if (!email || !password || !username) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Username, Email và Password' });
        }

        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
        }


        if (!await userController.validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu quá yếu (Yêu cầu 8-100 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt)'
            });
        }

        const hashedPassword = await hash(password, PASSWORD_HASH_ROUNDS);
        
        const newId = await userModel.create({
            username,
            hashedPassword,
            email,
        });

        if (!newId) return res.status(500).json({ success: false, message: 'Đăng ký thất bại' });

        res.status(200).json({
            success: true,
            user: { id: newId, username: username }
        });
    }


    static async validatePassword(password) {
        const passwordRule = {
            minLength: 8,
            maxLength: 100,
            requiredUpperCase: true,
            requiredLowerCase: true,
            requiredNumber: true,
            requiredSpecial: true
        };
        if (password.length < passwordRule.minLength || password.length > passwordRule.maxLength) return false;
        if (passwordRule.requiredUpperCase && !/[A-Z]/.test(password)) return false;
        if (passwordRule.requiredLowerCase && !/[a-z]/.test(password)) return false;
        if (passwordRule.requiredNumber && !/[0-9]/.test(password)) return false;
        if (passwordRule.requiredSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
        return true;
    }


    static async logout(req, res){
        const token = req.token;
        if(!token){
            return res.status(400).json({
                success : false,
                message : 'Not token provider'
        });
        }

        const decode = jwt.decode(token);
        const exp= decode && decode.exp ? new Date(decode.exp*1000):null;
        if(!exp){
            return res.status(400).json({
                success : false,
                message : 'Invalid token'
        });
        }

        const result = await userModel.removeToken(token, exp);
        if(!result){
             return res.status(400).json({
                success : false,
                message : 'Token revocation failed'
        });
        }

        res.status(200).json({
            success : true,
            message : 'Logged out'
        })
    }

    static async profile(req, res) {
        const id = req.userId;
        if(!id){
            return res.status(401).json({
                success : false,
                message : "Unauthourized"
            });
        }
        const user = await userModel.findId(id);
        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }
        res.status(200).json({
            success : true,
            user : {...user, password : ''}
        });
    }

    static async socialLogin(req, res) {
        try {
            const { email, username } = req.body; 
            let user = await userModel.findByEmail(email);

            if (!user) {
                const newId = await userModel.create({
                    username: username,
                    hashedPassword: 'SOCIAL_LOGIN_USER', // Mật khẩu giả định
                    email: email,
                    address: 'Cập nhật sau',
                    phone: 'Cập nhật sau'
                });
                user = await userModel.findMaUser(newId);
            }

            const token = await userController.generateToken(user);

            res.status(200).json({
                success: true,
                token: token,
                user: {
                    MaUser: user.MaUser,
                    Email: user.Email,
                    Username: user.Username
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async uploadAvatar(req, res){
        try{
            console.log("Đã nhận được request upload avatar");
            if (!req.files || !req.files.avatar) {
                console.log("Lỗi: Không tìm thấy req.files.avatar");
                return res.status(400).json(
                    { success: false, message: 'Không tìm thấy file gửi lên' });
            }
            const id = req.userId; 
            const currentUser = await userModel.findMaUser(id);
            const oldAvatar = currentUser ? currentUser.Avatar : null;

            const avatarFile = req.files.avatar;
            const fileName = `${Date.now()}-${avatarFile.name}`;
           const uploadPath = path.join(process.cwd(), 'uploads', fileName);
            console.log("Đường dẫn lưu file:", uploadPath);
            avatarFile.mv(uploadPath, async (err) => {
          if (err){
            console.log("Lưu file vật lý thành công. Đang cập nhật Database...");
            return res.status(500).json({ success: false, message: err.message });
          } 
          console.log("Lưu file vật lý thành công. Đang cập nhật Database...");
          console.log("Đang update cho User ID:", id);
          const isUpdated = await userModel.updateAvatar(id, fileName);

          if (isUpdated) {
            if(oldAvatar && oldAvatar !== 'avatar_default.jpg'){
                const oldPath = path.join(process.cwd(), 'uploads', oldAvatar);
                if (fs.existsSync(oldPath)) {
                        fs.unlink(oldPath, (err) => {
                            if (err) console.error("Lỗi khi xóa ảnh cũ:", err);
                            else console.log("Đã xóa ảnh cũ thành công:", oldAvatar);
                        });
                    }
            }
            return res.status(200).json({
              success: true,
              message: "Cập nhật ảnh thành công",
              user: {
                avatar: `${BASE_URL}${fileName}`
              }
            });
          }
          console.log("Thất bại: userModel.updateAvatar không thành công");
          res.status(400).json({ success: false, message: "Cập nhật DB thất bại" });
            });
        }catch (error) {
            console.error("Lỗi Catch trong controller:", error);
            res.status(500).json({ success: false, message: error.message });
        }
            
    }
    
    static async changePassword(req, res){
        try{
            const { oldPassword, newPassword } = req.body;
            const id = req.userId;
            const user = await userModel.findMaUser(id);
            if (!user) return res.status(404).json({ success: false, message: "User không tồn tại" });

            
            const isMatch = await compare(oldPassword, user.Password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
            }

             if (!await userController.validatePassword(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu quá yếu (Yêu cầu 8-100 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt)'
                });
            }
            const hashedPassword = await hash(newPassword, PASSWORD_HASH_ROUNDS);
            const isUpdated = await userModel.updatePassword(id, hashedPassword);
            if (isUpdated) {
                return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công!' });
            }
            res.status(400).json({ success: false, message: 'Đổi mật khẩu thất bại' });
        }catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const user = await userModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ success: false, message: "Email không tồn tại." });
            }
            if (user.Otp !== otp) {
                return res.status(400).json({ success: false, message: "Mã OTP không chính xác." });
            }
            const currentTime = new Date();
            const expiresTime = new Date(user.Otp_expires); 
            
            if (currentTime > expiresTime) {
                return res.status(400).json({ success: false, message: "Mã OTP đã hết hạn." });
            }
            const resetToken = jwt.sign(
                { email: user.Email, purpose: 'reset-password' }, 
                JWT_SECRET, 
                { expiresIn: '15m' }
            );

            res.status(200).json({ 
                success: true, 
                message: "Xác thực thành công.", 
                token: resetToken 
            });

        } catch (error) {
            console.error('Verify OTP Error:', error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await userModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ success: false, message: "Email này chưa đăng ký tài khoản nào." });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

            await userModel.updateOtp(email, otp, otpExpires);

            const mailOptions = {
                from: `"App Support" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Mã xác thực (OTP)',
                text: `Mã OTP của bạn là: ${otp}`,
                html: `<h3>Xin chào ${user.Username || 'Bạn'},</h3><p>Mã OTP khôi phục mật khẩu của bạn là:</p><h2>${otp}</h2><p>Mã này sẽ hết hạn sau 5 phút.</p>`
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ success: true, message: "Đã gửi mã OTP thành công!" });

        } catch (error) {
            console.error('Forgot Password Error:', error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống, không gửi được mail." });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { password } = req.body; 
            const authHeader = req.headers['authorization'];

            if (!authHeader) {
                return res.status(401).json({ success: false, message: "Thiếu Token xác thực." });
            }
            const token = authHeader.split(' ')[1];

            const decoded = jwt.verify(token, JWT_SECRET);
            const email = decoded.email;

            const user = await userModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ success: false, message: "User không tồn tại." });
            }
            if (!await userController.validatePassword(password)) {
                return res.status(400).json({
                    success: false,
                    message: 'Mật khẩu quá yếu (Yêu cầu 8-100 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt)'
                });
            }
            const hashedPassword = await hash(password, PASSWORD_HASH_ROUNDS);
            await userModel.updatePasswordAndClearOtp(email, hashedPassword);
            res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });

        } catch (error) {
            console.error('Reset Password Error:', error);
            if (error.name === 'TokenExpiredError') {
                 return res.status(403).json({ success: false, message: "Token đã hết hạn, vui lòng thực hiện lại từ đầu." });
            }
            res.status(500).json({ success: false, message: "Lỗi đổi mật khẩu." });
        }
    }
    
}