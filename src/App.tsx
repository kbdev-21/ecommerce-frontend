import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CatalogPage from "./pages/CatalogPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import CompleteOrderPage from "./pages/CompleteOrderPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/dashboard/ProductsPage";
import ProductAdminViewPage from "./pages/dashboard/ProductAdminViewPage";
import CreateProductPage from "./pages/dashboard/CreateProductPage";
import UsersPage from "./pages/dashboard/UsersPage";
import UserAdminViewPage from "./pages/dashboard/UserAdminViewPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import OrderDetailPage from "./pages/dashboard/OrderDetailPage";
import DiscountsPage from "./pages/dashboard/DiscountsPage";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <CartProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route element={<MainLayout />}>
                                <Route path="/" element={<LandingPage />} />
                                <Route
                                    path="/product/:slug"
                                    element={<ProductDetailPage />}
                                />
                                <Route
                                    path="/catalog"
                                    element={<CatalogPage />}
                                />
                                <Route path="/login" element={<LoginPage />} />
                                <Route
                                    path="/forgot-password"
                                    element={<ForgotPasswordPage />}
                                />
                                <Route
                                    path="/signup"
                                    element={<SignupPage />}
                                />
                                <Route
                                    path="/profile"
                                    element={<ProfilePage />}
                                />
                                <Route
                                    path="/checkout"
                                    element={<CheckoutPage />}
                                />
                                <Route
                                    path="/checkout/complete/:id"
                                    element={<CompleteOrderPage />}
                                />
                                <Route
                                    path="/dashboard"
                                    element={<DashboardPage />}
                                />
                                <Route
                                    path="/dashboard/products"
                                    element={<ProductsPage />}
                                />
                                <Route
                                    path="/dashboard/products/create"
                                    element={<CreateProductPage />}
                                />
                                <Route
                                    path="/dashboard/products/:slug"
                                    element={<ProductAdminViewPage />}
                                />
                                <Route
                                    path="/dashboard/users"
                                    element={<UsersPage />}
                                />
                                <Route
                                    path="/dashboard/users/:id"
                                    element={<UserAdminViewPage />}
                                />
                                <Route
                                    path="/dashboard/orders"
                                    element={<OrdersPage />}
                                />
                                <Route
                                    path="/dashboard/orders/:id"
                                    element={<OrderDetailPage />}
                                />
                                <Route
                                    path="/dashboard/discounts"
                                    element={<DiscountsPage />}
                                />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </CartProvider>
        </QueryClientProvider>
    );
}

export default App;
