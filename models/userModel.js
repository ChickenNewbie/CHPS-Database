import {execute} from '../config/db.js';

export default class userModel{
    static async findMaUser(id){
         try{
            const quey = 'SELECT * FROM user WHERE MaUser = ? AND Status = 1';
            const [rows] = await execute(quey, [id]);
            return rows[0] ?? null;
        }catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }

    static async findByEmail(email) {
        const [rows] = await execute(
            `SELECT * FROM user WHERE Email = ? AND Status = 1`, 
            [email]
        );
        return rows[0]??null;
    }

    static async updateInfo(id, { username, email, address, password, sdt, avatar }) {
        try {
            const query = `
                UPDATE user 
                SET Username = ?, Email = ?, DiaChi = ?, Password = ?, SDT = ?, Avatar = ?
                WHERE MaUser = ?
            `;
            const [result] = await execute(query, [username, email, address, password, sdt, avatar, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Lỗi cập nhật database: ' + error.message);
        }
    }
    static async create({username = '', hashedPassword, email, 
    address = '', phone = '', is_admin = false, avatar = 'avatar_default.jpg'}) 
    {
        try {
            const [result] = await execute(
                'INSERT INTO user (Username, Password, Email, DiaChi, SDT, LaAdmin, Status, Avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    username, 
                    hashedPassword, 
                    email, 
                    address, 
                    phone, 
                    is_admin ? 1 : 0, 
                    1,
                    avatar
                ]
            );
            return result.affectedRows > 0 ? result.insertId : null;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async removeToken(token, expiresAt){
        try {
            const [result] = await execute('INSERT INTO revoked_tokens(token, expires_at) VALUES(?, ?)',[token, expiresAt])
            return result.affectedRows > 0;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }

    static async isTokenRevoked(token){
        try {
            const [rows] = await execute('SELECT id FROM revoked_tokens WHERE token = ? LIMIT 1', [token])
            return rows.length > 0;
        } catch (error) {
             throw new Error('Database query failed: ' + error.message);
        }
    }


    static async updateAvatar(userId, fileName) {
        const sql = "UPDATE user SET Avatar = ? WHERE MaUser = ?";
        const [result] = await execute(sql, [fileName, userId]);
        return result.affectedRows > 0;
    }

    static async updatePassword(id, hashedPassword) {
        try {
            const query = `UPDATE user SET Password = ? WHERE MaUser = ?`;
            const [result] = await execute(query, [hashedPassword, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Lỗi cập nhật mật khẩu: ' + error.message);
        }
    }
    static async updateOtp(email, otp, expiresAt) {
        try {
            const query = 'UPDATE user SET Otp = ?, Otp_expires = ? WHERE Email = ?';
            const [result] = await execute(query, [otp, expiresAt, email]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
    static async updatePasswordAndClearOtp(email, newHashedPassword) {
        try {
            const query = 'UPDATE user SET Password = ?, Otp = NULL, Otp_expires = NULL WHERE Email = ?';
            const [result] = await execute(query, [newHashedPassword, email]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Database query failed: ' + error.message);
        }
    }
}