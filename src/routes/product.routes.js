import { Router } from "express";
import { getProducts, getProductById, getBestDeals, getAdminProducts, updateAdminProduct } from "../controllers/product.controller.js";

const router = Router();

router.get("/deals", getBestDeals);
router.get("/", getProducts);

// Admin Routes MUST go above /:productId, otherwise Express gets confused!
router.get("/admin/all", getAdminProducts);
router.put("/admin/:id", updateAdminProduct);

router.get("/:productId", getProductById);

export default router;