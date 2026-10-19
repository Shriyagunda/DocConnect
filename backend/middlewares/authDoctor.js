import jwt from 'jsonwebtoken';
const authDoctor = async (req, res, next) => {
    const { dtoken } = req.headers;
    if (!dtoken) {
        return res.json({ success: false, message: 'Not Authorized. Login Again.' });
    }
    try {
        console.log("qweqwe");
        const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
        req.user = { userId: decoded.id }; // ✅ assign to req.user
        next();
        
    } catch (error) {
        console.log("dhjdfjgh1231")
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};  

export default authDoctor;  