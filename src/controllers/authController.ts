import { Request, Response } from "express";
import { User } from "../models/Usermodel";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const userRegister = async (req: Request, res: Response) => {
    // console.log("----------------------", req);
    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "provide every field",
            })
        }

        const findUser = await User.findOne({ where: { email: email } });
        if (findUser) {
            return res.status(400).json({
                message: "user already exist"
            })
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const createUser = await User.create({
            full_name,
            email,
            password: hashedpassword
        })
        return res.status(201).json({
            success: true,
            message: "user created successfully",
            data: { full_name, email },
        })
    } catch (error) {
        return res.status(501).json({
            succee: false,
            message: 'failed to create user',
            error,
        })
        // errorHandler(res,error,501,"failed to create user")
    }
}

export const userLogin = async (req: Request, res: Response) => {
   try {
    console.log("request incoming")
     const { email, password } = req.body;
 
     if (!password || !email) {
         return res.status(400).json({
             success: false,
             message: "input required fields"
         })
     }
 
     const searchUser = await User.findOne({
         where: { email: email }
     }) as any
 
     if (!searchUser) {
         return res.status(404).json({ message: "User not found" });
     }
     // console.log("password", password)
     // console.log(searchUser.password)
 
     const isMatch = await bcrypt.compare(password, searchUser.password);
     // console.log("hased password", isMatch)
 
     if (!isMatch) {
         return res.status(400).json({ message: "Invalid credentials" });
     }
 
     const token = jwt.sign(
         { id: searchUser.id, email: searchUser.email, usertype: searchUser.usertype },
         process.env.JWT_SECRET as string,
         { expiresIn: "1d" }
     );
     res.json({ success: true, token, email: searchUser.email, full_name:searchUser.full_name, usertype: searchUser.usertype });
   } catch (error) {
    console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error - login failed " });
   }
}