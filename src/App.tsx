import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CatalogPage from "./pages/CatalogPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/dashboard/ProductsPage";
import ProductAdminViewPage from "./pages/dashboard/ProductAdminViewPage";
import CreateProductPage from "./pages/dashboard/CreateProductPage";
import UsersPage from "./pages/dashboard/UsersPage";
import UserAdminViewPage from "./pages/dashboard/UserAdminViewPage";

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
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </CartProvider>
        </QueryClientProvider>
    );
}

export default App;
