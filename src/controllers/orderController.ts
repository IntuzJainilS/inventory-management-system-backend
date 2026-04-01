import { Request, Response } from "express";
import { orders } from "../models/OrderModel";
import { Products } from "../models/ProductModel";
import { ProductAttributes } from "../interface/ProductInterface";
import { Model, where } from "sequelize";
import { sequelize } from "../config/db";
import { orderInterface } from "../interface/OrderInterface";
import { orderItems } from "../models/OrderItems";

// controller for order creation 
export const orderCreation = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const { items } = req.body; // this should have array of items with product ID and quantity  

        console.log("items:", items)

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No items received "
            });
        }

        let calculatedTotalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Products.findByPk(item.product_id) as (Model<ProductAttributes> & ProductAttributes) | null;

            const available_stock = (product?.stock_quantity ?? 0) - (product?.reserved_quantity ?? 0);
            console.log("available stock:", available_stock)

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.id} not found`
                });
            }

            if (available_stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name}`
                });
            }

            // increase reserved quantity
            product.reserved_quantity += item.quantity;
            await product.save();

            // Multiply price by user-requested quantity
            calculatedTotalAmount += product.price * item.quantity;

            processedItems.push({
                id: product.id,
                quantity: item.quantity,
                price_at_purchase: product.price
            });
        }

        //  Create the order with the calculated total
        const createorder = await orders.create({
            user_id: user_id,
            total_amount: calculatedTotalAmount,
        }) as any;

        const itemsToInsert = processedItems.map((item) => ({
            order_id: createorder.id, // Use the ID from the order just created
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase
        }));
        const createOrderItems = await orderItems.bulkCreate(itemsToInsert as any)

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: { order: createorder, orderItems: createOrderItems }
        });

    } catch (error) {
        console.error("Order creation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create order"
        });
    }
}

// controller to place order
export const orderPlacing = async (req: Request, res: Response) => {
    try {
        const { order_id } = req.params;
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No items received"
            });
        }

        const order = await orders.findByPk(order_id as string) as (Model<orderInterface, orderInterface> & orderInterface) | null;
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot place order. Order status is currently '${order.status}'`
            });
        }

        for (const item of items) {
            const product = await Products.findByPk(item.product_id) as (Model<ProductAttributes> & ProductAttributes) | null;

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.product_id} not found`
                });
            }

            // Decrease stockQuantity by the ordered quantity
            product.stock_quantity -= item.quantity;

            // Decrease reservedQuantity by the ordered quantity
            product.reserved_quantity -= item.quantity;

            // Save the updated quantities for this specific product
            await product.save();
        }

        // Update status to placed
        order.status = 'placed';
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            data: order
        });

    } catch (error) {
        console.error("Order placing error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to place order"
        });
    }
}

//controller to cancell order  
export const orderCancelling = async (req: Request, res: Response) => {
    try {
        const { order_id } = req.params;
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No items received"
            });
        }

        const order = await orders.findByPk(order_id as string) as (Model<orderInterface, orderInterface> & orderInterface) | null;

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Validate that the order is actually pending before cancelling it- because after placing stock_quantity changed
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order. Order status is currently '${order.status}'`
            });
        }

        //  Loop through the items and release the reserved stock
        for (const item of items) {
            const product = await Products.findByPk(item.product_id) as (Model<ProductAttributes> & ProductAttributes) | null;

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.product_id} not found`
                });
            }

            // Decrease reservedQuantity by the ordered quantity
            product.reserved_quantity -= item.quantity;

            await product.save();
        }

        // 4. Update status to cancelled
        order.status = 'cancelled';
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully and stock unreserved",
            data: order
        });

    } catch (error) {
        console.error("Order cancelling error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel order"
        });
    }
}

// controller to create orderItems 
// export const orderItem = async (req: Request, res: Response) => {
//     try {
//         const { order_id } = req.params;
//         const { processedItems } = req.body;

//         const itemsToInsert = processedItems.map((item: any) => ({
//             order_id: order_id,
//             product_id: item.product_id,
//             quantity: item.quantity,
//             price_at_purchase: item.price_at_purchase
//         }));

//         const orderItemsInsert = await orderItems.bulkCreate(itemsToInsert)

//         return res.status(201).json({
//             success: true,
//             message: "Order and items created successfully",
//             data: orderItemsInsert
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Failed to insert into order items"
//         });
//     }
// }

// controller to get order history
export const orderHistory = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 9,
            sort_by = 'status',
            order = 'DESC'
        } = req.query;

        const columnsAllowedForSorting = ['status'];

        const safeSortBy = columnsAllowedForSorting.includes(sort_by as string)
            ? sort_by
            : 'createdAt'; // Default if invalid

        const safeOrder = ['ASC', 'DESC'].includes((order as string).toUpperCase())
            ? (order as string).toUpperCase()
            : 'DESC';
        
        const offset = (Number(page) - 1) * Number(limit);


        const { user_id } = req.params; // this should be user id 

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const orderHistory = await orders.findAll({
            where: { user_id: user_id },
            limit: Number(limit),
            offset: offset,
            attributes: ['id', 'total_amount', 'createdAt'],
            include: [
                {
                    model: orderItems,
                    include: [
                        {
                            model: Products,
                            attributes: ['id', 'name', 'price']
                        }
                    ]
                }
            ],
            // Order by most recent orders first
            order: [['createdAt', 'DESC']]
        });

        if (!orderHistory || orderHistory.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No order history found for this user",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order history fetched successfully",
            count: orderHistory.length,
            data: orderHistory
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to insert into order items"
        });
    }
}