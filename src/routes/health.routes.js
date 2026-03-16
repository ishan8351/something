import { Router } from 'express';

const router = Router();

router.route('/').get((req, res) => {
    return res.status(200).json({
        success: true,
        message: 'E-commerce Backend Service is running optimally and healthy!',
    });
});

export default router;
