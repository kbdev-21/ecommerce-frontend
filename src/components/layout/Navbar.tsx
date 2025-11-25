import { Link } from "react-router-dom";
import { Input } from "../ui/input";
import { ShoppingCart, User, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/api/ecommerce-api";

export default function Navbar() {
    const categoriesQuery = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    const categories = Array.isArray(categoriesQuery.data)
        ? categoriesQuery.data
        : categoriesQuery.data?.categories || [];

    return (
        <div className="flex flex-col items-center bg-primary px-4">
            <div className="flex flex-nowrap items-center gap-8 w-full max-w-[1280px] h-14 text-primary-foreground">
                <Link
                    to="/"
                    className="font-[600] text-2xl shrink-0 cursor-pointer"
                >
                    TDT GEAR
                </Link>
                <div className="flex-1 relative min-w-0">
                    <Input
                        placeholder="Tìm sản phẩm..."
                        className="!bg-white rounded-lg pr-10"
                    />
                    <button className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                        <Search className="w-5 h-5 text-foreground" />
                    </button>
                </div>
                <div className="flex justify-end gap-6 shrink-0">
                    <div>
                        <User />
                    </div>
                    <div>
                        <ShoppingCart />
                    </div>
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
