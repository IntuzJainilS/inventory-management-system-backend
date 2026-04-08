import { Request, Response } from "express";
import { Products } from "../models/ProductModel";
import { Op } from "sequelize";

export const getProducts = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 4,
            search,
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        const whereClause: any = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
            ];
        }
        const {count, rows} = await Products.findAndCountAll({where: whereClause, limit: Number(limit), offset: offset,});
        if (count === 0) {
            return res.status(404).json({
                success: false,
                message: "No user found",
            });
        }
        // if (products.length == 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "No products found"
        //     })
        // }
        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: Number(page)
            }
        })
    } catch (error) {
        return res.status(404).json({
            succee: false,
            message: 'failed to fetch Products',
            error,
        })
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, stock_quantity, reserved_quantity } = req.body
        if (!name || !price || !stock_quantity) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }
        const Product = await Products.create(req.body)
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: Product,
        })
    } catch (error) {
        return res.status(404).json({
            succee: false,
            message: 'failed to create Products',
            error,
        })
    }
}

// export const checkProductavailibility = async (req: Request, res: Response) => {
//     try {
//         const { productId } = req.params
//         const checkQuantity = await Products.findOne({ where: { id: productId, deleted_at: null } } as any)
//         if (!checkQuantity && checkQuantity.stock_quantity < 1) {
//             return res.status(400).json({
//                 success: false,
//                 message: "there is not enough quantity",
//             })
//         }
//     } catch (error) {
//         return res.status(404).json({
//             success: false,
//             message:"failed to fetch quantity",
//             error
//         })
//     }
// }