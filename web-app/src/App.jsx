import { Suspense, lazy, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './AuthContext';
import { ROUTES } from './utils/routes';
import LoadingScreen from './components/LoadingScreen';
import AdminRoute from './components/AdminRoute';
import ResellerRoute from './components/ResellerRoute';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout'; // <-- Import new layout
import ErrorBoundary from './ErrorBoundary';

// Lazy loaded components
const LandingPage = lazy(() => import('./components/LandingPage'));
const ProductPage = lazy(() => import('./components/ProductPage'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const MyAccount = lazy(() => import('./components/MyAccount'));
const AccountSettings = lazy(() => import('./components/AccountSettings'));
const Invoices = lazy(() => import('./components/Invoices'));
const QuickOrder = lazy(() => import('./components/QuickOrder'));
const Checkout = lazy(() => import('./components/Checkout'));
const Orders = lazy(() => import('./components/Orders'));
const OrderTracking = lazy(() => import('./components/OrderTracking'));
const Wallet = lazy(() => import('./components/Wallet'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SearchResults = lazy(() => import('./components/SearchResults'));
const Terms = lazy(() => import('./components/Terms'));
const KycSubmit = lazy(() => import('./components/KycSubmit'));

// Placeholder for the new marketing page we will build next
const MarketingLandingPage = () => (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 md:text-6xl">
            Source Smarter. Scale Faster.
        </h1>
        <p className="mt-4 text-lg font-medium text-slate-500">
            Welcome to the new B2B experience. (Marketing Page Coming Soon)
        </p>
    </div>
);

// 404 Component
const NotFound = () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-black text-slate-200">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-800">Page not found</h2>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
    </div>
);

// Smart Router for the root path
const HomeRouter = () => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <LoadingScreen />;
    // If logged in, skip marketing and go straight to the catalog/dashboard
    if (user) return <Navigate to={ROUTES.CATALOG} replace />;
    // If logged out, show the marketing page
    return <MarketingLandingPage />;
};

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { user, loading } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;

    return children;
};

function App() {
    return (
        <ErrorBoundary>
            <Toaster position="bottom-right" />

            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    {/* --- PUBLIC MARKETING LAYOUT --- */}
                    <Route element={<PublicLayout />}>
                        <Route path={ROUTES.HOME} element={<HomeRouter />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Terms />} />
                    </Route>

                    {/* --- B2B PORTAL LAYOUT (Logged in or browsing catalog) --- */}
                    <Route element={<MainLayout />}>
                        {/* We moved the old LandingPage here so your current catalog doesn't break */}
                        <Route path={ROUTES.CATALOG} element={<LandingPage />} />
                        <Route path="/product/:productId" element={<ProductPage />} />
                        <Route path={ROUTES.SEARCH} element={<SearchResults />} />

                        {/* --- PROTECTED ROUTES --- */}
                        <Route
                            path={ROUTES.CHECKOUT}
                            element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path={ROUTES.ORDERS}
                            element={
                                <ProtectedRoute>
                                    <Orders />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orders/:id/track"
                            element={
                                <ProtectedRoute>
                                    <OrderTracking />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path={ROUTES.WALLET}
                            element={
                                <ProtectedRoute>
                                    <Wallet />
                                </ProtectedRoute>
                            }
                        />

                        {/* --- RESELLER HUB --- */}
                        <Route element={<ResellerRoute />}>
                            <Route path={ROUTES.MY_ACCOUNT} element={<MyAccount />} />
                            <Route path={ROUTES.ACCOUNT_SETTINGS} element={<AccountSettings />} />
                            <Route path={ROUTES.INVOICES} element={<Invoices />} />
                            <Route path={ROUTES.QUICK_ORDER} element={<QuickOrder />} />
                        </Route>

                        <Route path="/kyc" element={<KycSubmit />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>

                    {/* --- AUTHENTICATION (No Nav/Footer wrappers usually) --- */}
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.SIGNUP} element={<Signup />} />
                    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

                    {/* --- ADMIN ROUTING --- */}
                    <Route
                        path="/admin/*"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
