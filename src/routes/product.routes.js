import { Router } from "express";
import { getProducts, getProductById } from "../controllers/product.controller.js";

const router = Router();

// Public routes for product catalog
router.route("/").get(getProducts);
router.route("/:productId").get(getProductById);

export default router;
