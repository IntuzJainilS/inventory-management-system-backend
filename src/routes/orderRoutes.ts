import { Router } from "express";
import { orderCancelling, orderCreation, orderDetail, orderHistory, orderPlacing } from "../controllers/orderController";

const router = Router();

router.post('/order/:user_id', orderCreation); // creation of order

router.put('/place-order/:order_id', orderPlacing); //router to place order

router.put('/order-cancel/:order_id', orderCancelling); // router to cancel order

// router.get('/order-detail/:id',) // router to get order detail 

router.get('/order-detail/:order_id', orderDetail);//eouter to get order detail

router.get('/order-history/:user_id',orderHistory);// history of order of a particular user

export default router;