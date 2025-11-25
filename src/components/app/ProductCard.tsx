import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }: { product: any }) {
    const imageUrl = product.imgUrls?.[0];
    const variants = product.variants || [];
    const lowestPrice =
        variants.length > 0
            ? Math.min(...variants.map((v: any) => v.price))
            : null;

    const ratings = product.ratings || [];
    const avgRating =
        ratings.length > 0
            ? ratings.reduce((sum: number, r: any) => sum + r.score, 0) /
              ratings.length
            : 0;
    const ratingCount = ratings.length;

    return (
        <Link
            to={`/product/${product.slug}`}
            className="flex flex-col gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
            <div className="w-full aspect-square bg-gray-200 rounded-md overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.title || "Product"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <div className="font-[500] text-sm line-clamp-2">
                    {product.title || "Product Name"}
                </div>

                <div className="font-[600] text-primary">
                    {lowestPrice
                        ? `${lowestPrice.toLocaleString("vi-VN")}đ`
                        : "N/A"}
                </div>
                {ratingCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-[500]">
                            {avgRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            ({ratingCount})
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
}
