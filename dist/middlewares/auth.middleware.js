"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const uuid_1 = require("uuid");
const user_service_1 = require("../modules/user/user.service");
const authMiddleware = async (req, res, next) => {
    try {
        
        let userId = req.cookies?.user_id;
        
        if (!userId) {
            userId = (0, uuid_1.v4)();
            
            await user_service_1.userService.createUser(userId, 'USD');
           
            res.cookie('user_id', userId, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 365 * 24 * 60 * 60 * 1000, 
                sameSite: 'lax',
            });
        }
        
        req.userId = userId;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
