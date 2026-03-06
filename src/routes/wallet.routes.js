import { Router } from 'express';
import { getBalance, getTransactionHistory, addMoney } from '../controllers/wallet.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/balance', getBalance);
router.get('/transactions', getTransactionHistory);
router.post('/add-money', addMoney);

export default router;
