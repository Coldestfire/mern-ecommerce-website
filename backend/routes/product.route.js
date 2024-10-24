import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/auth.middleware.js';
import { getAllProducts } from '../controllers/product.controller.js';
import { getFeaturedProducts } from '../controllers/product.controller.js';
import { createProduct } from '../controllers/product.controller.js';
import { deleteProduct } from '../controllers/product.controller.js';
import { getProductsByCategory } from '../controllers/product.controller.js';
import { getRecommendedProducts } from '../controllers/product.controller.js';
import { toggleFeaturedProduct } from '../controllers/product.controller.js';

const router = express.Router();

router.get("/",protectedRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendation", getRecommendedProducts);
router.post("/",protectedRoute,adminRoute, createProduct);
router.patch("/:id", toggleFeaturedProduct);
router.delete("/:id",protectedRoute,adminRoute, deleteProduct);

export default router;