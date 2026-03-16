import { Router } from 'express';
import {
    getProducts,
    getProductById,
    getBestDeals,
    getAdminProducts,
    updateAdminProduct,
    bulkUploadProducts,
    generateSampleTemplate,
    createProduct,
} from '../controllers/product.controller.js';
import { upload, uploadImages } from '../middlewares/multer.middleware.js';
import { verifyJWT, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { productValidation } from '../validations/product.validation.js';

const router = Router();

// 1. PUBLIC ROUTES (Specific paths first)
router.get('/deals', getBestDeals);
router.get('/', validate(productValidation.getProducts), getProducts); // Kept the validated one!

// 2. SECURED ADMIN ROUTES
// Apply both JWT verification AND Admin role authorization to all /admin routes
router.use('/admin', verifyJWT, authorize('ADMIN'));

router.get('/admin/all', getAdminProducts);
router.get('/admin/template', generateSampleTemplate);
router.post('/admin/bulk-upload', upload.single('file'), bulkUploadProducts);
router.post('/admin/create', uploadImages.array('images', 8), createProduct);
router.put('/admin/:id', updateAdminProduct);

// 3. DYNAMIC PUBLIC ROUTES (Must be absolutely last!)
// If this is at the top, a request to /deals would be interpreted as a productId of "deals"
router.get('/:productId', validate(productValidation.getProductById), getProductById);

export default router;
