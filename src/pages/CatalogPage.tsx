import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/api/ecommerce-api";
import ProductCard from "@/components/app/ProductCard";

export default function CatalogPage() {
    const [searchParams] = useSearchParams();
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const searchKey = searchParams.get("searchKey") || "";
    const sortBy = searchParams.get("sortBy") || "-createdAt";

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

    if (productsQuery.isLoading) return <div>Loading...</div>;
    if (productsQuery.error) return <div>Error loading products</div>;

    const products = Array.isArray(productsQuery.data)
        ? productsQuery.data
        : productsQuery.data?.products || [];

    return (
        <div className="flex flex-col gap-4 pt-8">
            <div className="text-2xl font-[600]">Danh sách sản phẩm</div>
            <div className="text-muted-foreground">
                Category: {category || "All"} | Brand: {brand || "All"} |
                Search: {searchKey || "None"} | Sort: {sortBy}
            </div>
            <div className="grid grid-cols-5 w-full gap-4">
                {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
