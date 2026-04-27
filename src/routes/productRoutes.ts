import { Router } from "express";
import { createProduct, DeleteProduct, getProducts, updateQuantity } from "../controllers/productController";
import { verifyToken } from "../middleware/auth";
import { checkAdmin } from "../middleware/isAdmin";

const router = Router(); 

// routes to fetch all products
router.get('/products', getProducts)
router.post('/product', verifyToken, checkAdmin, createProduct) // routes to create products
router.put('/update-product/:id', verifyToken, checkAdmin, updateQuantity)
router.delete('/product/:id', verifyToken, checkAdmin, DeleteProduct);

export default router;