import { Router } from "express";
import { createProduct, DeleteProduct, getProducts, updateQuantity } from "../controllers/productController";
import { verifyToken } from "../middleware/auth";
import { checkAdmin } from "../middleware/isAdmin";
import { rateLimiter } from "../middleware/rateLimiter";
import { deduplicateRequest } from "../middleware/deduplication";

const router = Router(); 

// routes to fetch all products
router.get('/products', rateLimiter, getProducts)
router.post('/product', verifyToken, checkAdmin, rateLimiter, deduplicateRequest, createProduct) // routes to create products
router.put('/update-product/:id', verifyToken, checkAdmin, rateLimiter, updateQuantity)
router.delete('/product/:id', verifyToken, checkAdmin, rateLimiter, DeleteProduct);

export default router;