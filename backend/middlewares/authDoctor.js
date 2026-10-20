import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwt.js';
const authDoctor = async (req, res, next) => {
    const { dtoken } = req.headers;
    if (!dtoken) {
        return res.json({ success: false, message: 'Not Authorized. Login Again.' });
    }
    try {
        const decoded = jwt.verify(dtoken, getJwtSecret());
        req.user = { userId: decoded.id }; // ✅ assign to req.user
        next();
        
    } catch (error) {
        console.error("Doctor auth error:", error.message);
        res.json({ success: false, message: error.message });
    }
};  

export default authDoctor;  