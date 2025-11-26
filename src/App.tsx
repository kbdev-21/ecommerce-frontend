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
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
