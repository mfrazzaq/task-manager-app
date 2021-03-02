const jwt = require("jsonwebtoken");
const User = require('../model/user');

const auth = async (req, res, next) => {
    try{
        const token = req.headers.authorization.replace('Bearer ', '');
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded.id);
        const user = await User.User.findOne({_id: decoded.id, tokens: token});
        if(!user){
            throw new Error("No user found");
        }
        req.token = token;
        req.user = user;
        next();
    }catch(e){  
        res.status(401).send({error: "Please authenticate"});
    }
}

module.exports = auth;