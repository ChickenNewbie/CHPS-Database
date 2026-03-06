import userModel from '../models/userModel.js';
import jsonwebToken from 'jsonwebtoken';

const {verify} = jsonwebToken;
const JWT_SECRET = process.env.JWT_SECRET;
export default async function auth(req, res, next) {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({
                message : "Authorization required"
            })
        }

        const token = authHeader.split(' ')[1];
        if(await userModel.isTokenRevoked(token)){
            return res.status(401).json({
                message : "Invalid or expried token1"
            })
        }

        const {MaUser} = verify(token, JWT_SECRET);
        if(!MaUser){
            return res.status(401).json({
                message : "Invalid or expried token"
            })
        }

        const user = await userModel.findMaUser(MaUser);
        if(!user){
            return res.status(401).json({
                message : "User not found"
            })
        }

        req.userId = MaUser;
        req.username = user.username;
        req.is_admin = user.LaAdmin;
        req.token = token;
        next();
    }catch (error) {
        return res.status(401).json({ message: "Auth Failed: " + error.message });
    }
}

export const verifyAdmin = (req, res, next) => {
    if (req.is_admin === 1 || req.is_admin === true) {
        next(); 
    }else{
        return res.status(403).json({ 
            message: "Truy cập bị từ chối. Bạn không phải là Admin." 
        });
    }
};