import { Router } from "express";
import { order, orderCancelling, orderCreation, orderDetail, orderHistory, orderPlacing } from "../controllers/orderController";
import { verifyToken } from "../middleware/auth";
import { checkAdmin } from "../middleware/isAdmin";

const router = Router();

router.post('/create-order', verifyToken, checkAdmin, orderCreation); // creation of order

router.put('/place-order/:order_id', orderPlacing); //router to place order

router.put('/order-cancel/:order_id', verifyToken, checkAdmin, orderCancelling); // router to cancel order

// router.get('/order-detail/:id',) // router to fetch all allorders

router.get('/orders', order) // router to fetch all pending orders 

router.get('/order-detail/:order_id', verifyToken, checkAdmin, orderDetail);//eouter to get order detail

router.get('/order-history/:user_id',  orderHistory);// history of order of a particular user

export default router;