import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { SimpleSelectDropdown } from "@/components/app/SimpleSelectDropdown";
import {
    fetchProducts,
    fetchBrands,
    fetchCategories,
    type Product,
} from "@/api/ecommerce-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function ProductsPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchInput, setSearchInput] = useState(
        searchParams.get("searchKey") || ""
    );

    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const searchKey = searchParams.get("searchKey") || "";
    const sortBy = searchParams.get("sortBy") || "-createdAt";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;

    const sortByOptions = {
        "-createdAt": "Mới nhất",
        createdAt: "Cũ nhất",
        title: "Tên A-Z",
        "-title": "Tên Z-A",
        "-sold": "Bán chạy nhất",
    };

    useEffect(() => {
        if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
            navigate("/");
        }
    }, [auth, navigate]);

    const handleParamChange = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        if (key !== "page") {
            newParams.set("page", "1");
        }
        setSearchParams(newParams);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleParamChange("searchKey", searchInput);
    };

    const productsQuery = useQuery({
        queryKey: [
            "products",
            "dashboard",
            category,
            brand,
            searchKey,
            sortBy,
            page,
            pageSize,
        ],
        queryFn: () =>
            fetchProducts({
                sortBy,
                category: category || undefined,
                brand: brand || undefined,
                searchKey: searchKey || undefined,
                page,
                pageSize,
            }),
    });

    const brandsQuery = useQuery({
        queryKey: ["brands"],
        queryFn: fetchBrands,
    });

    const categoriesQuery = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
        return null;
    }

    const products = Array.isArray(productsQuery.data)
        ? productsQuery.data
        : productsQuery.data?.products || [];
    const total = productsQuery.data?.total || products.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const brands = Array.isArray(brandsQuery.data)
        ? brandsQuery.data
        : brandsQuery.data?.brands || [];

    const categories = Array.isArray(categoriesQuery.data)
        ? categoriesQuery.data
        : categoriesQuery.data?.categories || [];

    return (
        <div className="flex">
            <DashboardSidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
                    <Button
                        onClick={() => navigate("/dashboard/products/create")}
                    >
                        Thêm sản phẩm
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-64"
                        />
                        <Button type="submit" variant="outline" size="icon">
                            <Search className="w-4 h-4" />
                        </Button>
                    </form>
                    <SimpleSelectDropdown
                        placeholder="Danh mục"
                        selections={categories.map((cat: any) => ({
                            label: cat.title,
                            value: cat.title,
                        }))}
                        initValue={category}
                        onValueChange={(value) =>
                            handleParamChange("category", value)
                        }
                    />
                    <SimpleSelectDropdown
                        placeholder="Thương hiệu"
                        selections={brands.map((b: any) => ({
                            label: b.title,
                            value: b.title,
                        }))}
                        initValue={brand}
                        onValueChange={(value) =>
                            handleParamChange("brand", value)
                        }
                    />
                    <SimpleSelectDropdown
                        placeholder="Sắp xếp"
                        selections={Object.entries(sortByOptions).map(
                            ([value, label]) => ({
                                label,
                                value,
                            })
                        )}
                        initValue={sortBy}
                        onValueChange={(value) =>
                            handleParamChange("sortBy", value)
                        }
                    />
                </div>

                {/* Products Table */}
                {productsQuery.isLoading ? (
                    <p className="text-muted-foreground">Đang tải...</p>
                ) : productsQuery.isError ? (
                    <p className="text-red-500">Lỗi khi tải sản phẩm</p>
                ) : (
                    <>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-3 font-medium">
                                            Hình ảnh
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Tên sản phẩm
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Danh mục
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Thương hiệu
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Biến thể
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Ngày tạo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-8 text-center text-muted-foreground"
                                            >
                                                Không có sản phẩm nào
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product: Product) => (
                                            <tr
                                                key={product.id}
                                                className="border-t hover:bg-muted/30 cursor-pointer"
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/products/${product.slug}`
                                                    )
                                                }
                                            >
                                                <td className="p-3">
                                                    <img
                                                        src={product.imgUrls[0]}
                                                        alt={product.title}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                </td>
                                                <td className="p-3 font-medium">
                                                    {product.title}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {product.category}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {product.brand}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {product.variants.length}{" "}
                                                    biến thể
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {new Date(
                                                        product.createdAt
                                                    ).toLocaleDateString(
                                                        "vi-VN"
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Hiển thị {products.length} / {total} sản phẩm
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        handleParamChange(
                                            "page",
                                            String(page - 1)
                                        )
                                    }
                                >
                                    Trước
                                </Button>
                                <span className="flex items-center px-3 text-sm">
                                    Trang {page} / {totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        handleParamChange(
                                            "page",
                                            String(page + 1)
                                        )
                                    }
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
