import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth";

export const checkAdmin = (req: Request, res:Response, next:NextFunction) => {
    if ((req as any).user.usertype  !== "admin") {
        return res.status(500).json({
            message:"only admin can access this routes"
        })
    }
    next()
}