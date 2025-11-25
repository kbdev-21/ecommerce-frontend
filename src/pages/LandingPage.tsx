import { useQuery, useQueries } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "@/api/ecommerce-api";
import ProductCard from "@/components/app/ProductCard";

export default function LandingPage() {
    const newestProductsQuery = useQuery({
        queryKey: ["products"],
        queryFn: () => fetchProducts({ sortBy: "-createdAt" }),
    });

    const bestSellingProductsQuery = useQuery({
        queryKey: ["best-selling-products"],
        queryFn: () => fetchProducts({ sortBy: "-sold" }),
    });

    const categoriesQuery = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    const first3Categories = Array.isArray(categoriesQuery.data)
        ? categoriesQuery.data.slice(0, 3)
        : categoriesQuery.data?.categories?.slice(0, 3) || [];

    const categoryProductsQueries = useQueries({
        queries: first3Categories.map((category: any) => ({
            queryKey: ["products", "category", category.title],
            queryFn: () =>
                fetchProducts({
                    sortBy: "-createdAt",
                    category: category.title,
                }),
            enabled: !!category.title,
        })),
    });

    if (newestProductsQuery.isLoading) return <div>Loading...</div>;
    if (newestProductsQuery.error) return <div>Error loading products</div>;

    const newestProducts = Array.isArray(newestProductsQuery.data)
        ? newestProductsQuery.data
        : newestProductsQuery.data?.products || [];

    const bestSellingProducts = Array.isArray(bestSellingProductsQuery.data)
        ? bestSellingProductsQuery.data
        : bestSellingProductsQuery.data?.products || [];

    return (
        <div className="flex flex-col gap-16 pt-4">
            <img
                className="w-full rounded-md"
                src="https://pchero.co.za/wp-content/uploads/2024/04/Msi-Banner.jpg"
                alt="hero-banner"
            />
            <ProductSection products={newestProducts} title="Hàng mới về" />
            <ProductSection
                products={bestSellingProducts}
                title="Bán chạy nhất"
            />
            {first3Categories.map((category: any, index: number) => {
                const productsQuery = categoryProductsQueries[index];
                const products = productsQuery.data
                    ? Array.isArray(productsQuery.data)
                        ? productsQuery.data
                        : (productsQuery.data as any)?.products || []
                    : [];

                return (
                    <ProductSection
                        key={category.id}
                        products={products}
                        title={category.title}
                    />
                );
            })}
        </div>
    );
}

function ProductSection({
    products,
    title,
}: {
    products: any[];
    title: string;
}) {
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-[500]">{title}</div>
                <div className="text-sm font-[400]">Xem tất cả</div>
            </div>
            <div className="grid grid-cols-5 w-full gap-4">
                {products.slice(0, 5).map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
