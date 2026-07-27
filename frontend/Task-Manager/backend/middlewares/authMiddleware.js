const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async(req,res,next) => {
    try{
        let token = req.headers.authorization;
        if(token && token.startsWith("Bearer ")){
            token = token.split(" ")[1];//Extract token
            const secret = process.env.JWT_SECRET || "a8dfd37e112107e0e42b040e845af42af9079ee79eed08d9572c6b27cea5b2a7f44a31e939b2afcf390aa4a94cf63bf4a3570b4b7480db428fb2b37262efea94";
            const decoded = jwt.verify(token, secret);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        }else{
            res.status(401).json({message:"Not authorized,no token"});
        }
    }catch(error){
        res.status(401).json({message:"Token failed", error:error.message});
    }
}

// Middleware for admin-Only access
const adminOnly = (req,res,next) =>{
    if(req.user && req.user.role == "admin"){
        next();
    }else{
        res.status(403).json({message:"Access denied, admin Only"});
    }
};

module.exports = {protect,adminOnly};