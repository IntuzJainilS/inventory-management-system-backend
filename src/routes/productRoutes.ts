import { Router } from "express";
import { createProduct, getProducts } from "../controllers/productController";
import { verifyToken } from "../middleware/auth";

const router = Router(); 

// routes to fetch all products
router.get('/products', getProducts)
router.post('/product', verifyToken, createProduct) // routes to create products
// router.put('/product/:id',)
// router.delete('/product/:id')

export default router;