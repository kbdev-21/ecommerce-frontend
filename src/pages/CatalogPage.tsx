import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    fetchProducts,
    fetchBrands,
    fetchCategories,
} from "@/api/ecommerce-api";
import ProductCard from "@/components/app/ProductCard";
import { SimpleSelectDropdown } from "@/components/app/SimpleSelectDropdown";

export default function CatalogPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const searchKey = searchParams.get("searchKey") || "";
    const sortBy = searchParams.get("sortBy") || "";

    const sortByOptions = {
        "-createdAt": "Mới nhất",
        "-sold": "Bán chạy nhất",
        price: "Giá tăng dần",
        "-price": "Giá giảm dần",
    };

    const handleCategoryChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set("category", value);
        } else {
            newParams.delete("category");
        }
        setSearchParams(newParams);
    };

    const handleBrandChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set("brand", value);
        } else {
            newParams.delete("brand");
        }
        setSearchParams(newParams);
    };

    const handleSortByChange = (value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set("sortBy", value);
        } else {
            newParams.delete("sortBy");
        }
        setSearchParams(newParams);
    };

    const productsQuery = useQuery({
        queryKey: ["products", "catalog", category, brand, searchKey, sortBy],
        queryFn: () =>
            fetchProducts({
                sortBy: sortBy,
                category: category || undefined,
                brand: brand || undefined,
                searchKey: searchKey || undefined,
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

    if (productsQuery.isLoading) return <div>Loading...</div>;
    if (productsQuery.error) return <div>Error loading products</div>;

    const products = Array.isArray(productsQuery.data)
        ? productsQuery.data
        : productsQuery.data?.products || [];

    const brands = Array.isArray(brandsQuery.data)
        ? brandsQuery.data
        : brandsQuery.data?.brands || [];

    const categories = Array.isArray(categoriesQuery.data)
        ? categoriesQuery.data
        : categoriesQuery.data?.categories || [];

    return (
        <div className="flex flex-col gap-4 pt-8">
            <div className="text-2xl font-[600]">{searchKey ? `Kết quả tìm kiếm cho "${searchKey}"` : "Danh sách sản phẩm"}</div>
            <div className="flex gap-4">
                <SimpleSelectDropdown
                    placeholder="Chọn danh mục"
                    selections={categories.map((category: any) => ({
                        label: category.title,
                        value: category.title,
                    }))}
                    initValue={category}
                    onValueChange={handleCategoryChange}
                />
                <SimpleSelectDropdown
                    placeholder="Chọn thương hiệu"
                    selections={brands.map((brand: any) => ({
                        label: brand.title,
                        value: brand.title,
                    }))}
                    initValue={brand}
                    onValueChange={handleBrandChange}
                />
                <SimpleSelectDropdown
                    placeholder="Sắp xếp theo"
                    selections={Object.entries(sortByOptions).map(
                        ([value, label]) => ({
                            label,
                            value,
                        })
                    )}
                    initValue={sortBy}
                    onValueChange={handleSortByChange}
                />
            </div>
            <div className="grid grid-cols-5 w-full gap-4">
                {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
