import { Link, useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { ShoppingCart, User, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/api/ecommerce-api";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

export default function Navbar() {
  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();

  const [searchKey, setSearchKey] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : categoriesQuery.data?.categories || [];

  return (
    <div className="flex flex-col items-center bg-primary px-4 sticky top-0 z-50">
      <div className="flex flex-nowrap items-center gap-8 w-full max-w-[1280px] h-14 text-primary-foreground">
        <Link
          to="/"
          className="font-[600] text-2xl shrink-0 cursor-pointer"
        >
          TDT GEAR
        </Link>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/catalog?searchKey=${searchKey}`);
          }}
          className="flex-1 relative min-w-0"
        >
          <Input
            placeholder="Tìm sản phẩm..."
            className="!bg-white rounded-lg pr-10 text-foreground"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <button
            type="submit"
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Search className="w-5 h-5 text-foreground" />
          </button>
        </form>
        <div className="flex justify-end items-center gap-6 shrink-0">
          <Link to={auth.isLoggedIn() ? "/profile" : "/login"}>
            {auth.isLoggedIn() ? (
              <div className="h-8 w-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-lg font-[400]">
                {auth.user?.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User />
            )}
          </Link>
          <Link to="/checkout" className="relative">
            <ShoppingCart />
            {cart.items.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
            )}
          </Link>
        </div>
      </div>
      <div className="flex pt-2 pb-4 gap-8 text-sm font-[500] text-primary-foreground bg-primary w-full max-w-[1280px]">
        {categories.map((category: any) => (
          <Link
            key={category.id}
            to={`/catalog?category=${category.title}`}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {category.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
