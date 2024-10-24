import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware';
import { getCartProducts, addToCart, removeAllFromCart, updateQuantity } from '../controllers/cart.controller';

const router = express.Router()

router.get("/",protectedRoute, getCartProducts);
router.post("/",protectedRoute, addToCart)
router.delete("/",protectedRoute, removeAllFromCart);
router.put("/:id",protectedRoute, updateQuantity)


export default router;