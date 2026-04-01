import { Router } from "express";
import { createProduct, getProducts } from "../controllers/productController";

const router = Router(); 

// routes to fetch all products
router.get('/products',getProducts)
router.post('/product', createProduct) // routes to create products
// router.put('/product/:id',)
// router.delete('/product/:id')

export default router;