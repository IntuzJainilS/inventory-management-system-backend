import { Request, Response } from "express";
import { Products } from "../models/ProductModel";
import { Op } from "sequelize";
import { cacheDeletePattern, cacheGet, cacheSet } from '../utils/cache';
import { inventoryQueue } from "../queues/inventoryQueue";

export const getProducts = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 4,
            search,
        } = req.query;

        const cacheKey = `products:page=${page}:limit=${limit}:search=${search}`;

        // check cache first
        const cached = await cacheGet(cacheKey);
        if (cached) {
            return res.status(200).json(cached); // ← returns immediately, no DB call
        }

        // 2. cache miss — hit the database
        const offset = (Number(page) - 1) * Number(limit);

        const whereClause: any = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
            ];
        }
        const { count, rows } = await Products.findAndCountAll({ where: whereClause, limit: Number(limit), offset: offset, });
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
        const responseData = {
            success: true,
            message: 'Products fetched successfully',
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: Number(page),
            },
        };

        //  store in cache — 2 min TTL
        await cacheSet(cacheKey, responseData, 120);

        return res.status(200).json(responseData);
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

        const findproduct = await Products.findOne({ where: { name: name } })
        if (findproduct) {
            return res.status(400).json({
                success: false,
                message: "products with this name already exists"
            })
        }

        const Product = await Products.create(req.body)
        await cacheDeletePattern('products:*');
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

export const updateQuantity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { name, price, stock_quantity, reserved_quantity } = req.body
        const findproducts = await Products.findOne({ where: { id: id } })
        if (!findproducts) {
            return res.status(404).json({
                success: false,
                message: "product not found"
            })
        }
        await findproducts.update(req.body)
        await cacheDeletePattern('products:*');

        // ── Queue a low-stock alert job if stock drops below threshold ──
        // This runs AFTER res.json, so the client isn't waiting for it
        if (stock_quantity !== undefined && stock_quantity < 10) {
            await inventoryQueue.add('low-stock-alert', {
                productId: id,
                productName: findproducts.dataValues.name,  // grab name before update
                quantity: stock_quantity,
            });
            // no await on purpose here — fire and forget is fine, 
            // but we do await above to make sure the job was accepted by Redis
        }
        
        return res.status(201).json({
            success: true,
            message: "product updated successfully",
            data: findproducts,
        })
    } catch (error) {
        return res.status(404).json({
            succee: false,
            message: 'failed to update Products',
            error,
        })
    }

}

export const DeleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const findproducts = await Products.findOne({ where: { id: id } })
        if (!findproducts) {
            return res.status(404).json({
                success: false,
                message: "product not found"
            })
        }
        await findproducts.destroy();
        await cacheDeletePattern('products:*');
        return res.status(200).json({
            success: true,
            message: "product deleted successfully",
            data: findproducts,
        })
    } catch (error) {
        return res.status(404).json({
            succee: false,
            message: 'failed to delete Products',
            error,
        })
    }
}