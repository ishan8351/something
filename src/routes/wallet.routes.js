import { Router } from 'express';
import {
    getBalance,
    getTransactionHistory,
    addMoney,
    createWithdrawalRequest,
    getMyWithdrawals,
    getAllWithdrawals,
    updateWithdrawalStatus
} from '../controllers/wallet.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/balance', getBalance);
router.get('/transactions', getTransactionHistory);
router.post('/add-money', addMoney);

router.post('/withdraw', createWithdrawalRequest);
router.get('/withdrawals', getMyWithdrawals);

router.get('/admin/withdrawals', authorizeRoles('ADMIN'), getAllWithdrawals);
router.patch('/admin/withdrawals/:id', authorizeRoles('ADMIN'), updateWithdrawalStatus);

export default router;
