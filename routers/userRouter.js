import {Router} from 'express';
import userController from '../controllers/userController.js';
import auth, { verifyAdmin } from '../middleware/auth.js'
import productController from '../controllers/productController.js';
import CategoryController from '../controllers/categoryController.js';
import cartController from '../controllers/cartController.js';
import OrderController from '../controllers/orderController.js';
import BannerController from '../controllers/bannerController.js';
import ReviewController from '../controllers/reviewController.js';
import addressController from '../controllers/addressController.js';
import voucherController from '../controllers/voucherController.js';
import shippingController from '../controllers/shippingController.js';
import paymentController from '../controllers/paymentController.js';
import FavoriteController from '../controllers/favoriteController.js';
import AdminOrderController from '../controllers/adminController.js';
const authRouter = Router();
const userRouter = Router();
const adminRouter = Router();

userRouter.post('/verify-otp', userController.verifyOtp);
userRouter.post('/reset-password', userController.resetPassword);
userRouter.post('/forgot-password', userController.forgotPassword);
userRouter.post('/login', userController.login);
userRouter.post('/login-social', userController.socialLogin);
userRouter.post('/register', userController.register);
userRouter.get('/products', productController.getAll);
userRouter.get('/best-products', productController.getBestSelling);
userRouter.get('/products/:id', productController.getById);
userRouter.get('/products/category/:id', productController.getByCategory);
userRouter.get('/category', CategoryController.getAllCategoty);
userRouter.get('/banner', BannerController.all);
userRouter.get('/products/review/all/:masp', ReviewController.all);
userRouter.get('/products/review/limit/:masp', ReviewController.ReviewLimit);

authRouter.use(auth);// use middleware
authRouter.post('/logout', userController.logout);
authRouter.get('/view-cart', cartController.getCart);
authRouter.post('/add-cart', cartController.addCart);
authRouter.delete('/delete-item', cartController.deleteItem);
authRouter.put('/update-item', cartController.updateQuantity);
authRouter.post('/checkout', OrderController.checkout);
authRouter.get('/get-address', addressController.all);
authRouter.post('/add-address', addressController.add);
authRouter.put('/update-address/:id', addressController.updateAddress);
authRouter.delete('/delete-address/:id', addressController.deleteAddress);

authRouter.get('/vouchers', voucherController.all);
authRouter.get('/voucher-detail/:maVoucher', voucherController.detail);
authRouter.post('/voucher-use', voucherController.useVoucher);
authRouter.post('/ship', shippingController.getPrice);
authRouter.get('/payments', paymentController.all);
authRouter.get('/my-order', OrderController.getMyOrders);
authRouter.put('/cancel-order', OrderController.cancelOrder);
authRouter.get('/favorites', FavoriteController.getMyFavorites);
authRouter.post('/favorites/add-delete', FavoriteController.ThemXoaFavorite);
authRouter.post('/update-profile', userController.updateProfile);
authRouter.post('/upload-image-avatar', userController.uploadAvatar);
authRouter.post('/changePassword', userController.changePassword);
authRouter.post('/rating/add', ReviewController.addReview);


adminRouter.use(auth); 
adminRouter.use(verifyAdmin); 
adminRouter.get('/orders', AdminOrderController.getAllOrders);
adminRouter.get('/orders/stats', AdminOrderController.getOrderStats);
adminRouter.put('/orders/:id/status', AdminOrderController.updateOrderStatus);

authRouter.get('/profile',userController.profile);
userRouter.use('/', authRouter);
userRouter.use('/admin', adminRouter);
export default userRouter;