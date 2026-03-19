import { Router } from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
} from '../controllers/cart.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All cart routes require a logged-in reseller
router.use(verifyJWT);

router.route('/').get(getCart).post(addToCart);

router.route('/:productId').put(updateCartItem).delete(removeFromCart);

export default router;
