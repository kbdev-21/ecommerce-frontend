import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductBySlug,
  fetchProducts,
  createRating,
} from "@/api/ecommerce-api";
import { Star, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/app/ProductCard";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";

export default function ProductDetailPage() {
  const cart = useCart();
  const auth = useAuth();
  const queryClient = useQueryClient();

  const { slug } = useParams<{ slug: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  const ratingMutation = useMutation({
    mutationFn: () =>
      createRating(productQuery.data!.id, {
        userName: auth.user?.name || "",
        userId: auth.user?.id || "",
        score: ratingScore,
        comment: ratingComment,
      }),
    onSuccess: () => {
      alert("Đánh giá thành công!");
      setRatingScore(5);
      setRatingComment("");
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
    },
    onError: () => {
      alert("Lỗi khi gửi đánh giá");
    },
  });

  const product = productQuery.data;
  const variants = product?.variants || [];

  const relatedProductsQuery = useQuery({
    queryKey: ["products", "category", product?.category],
    queryFn: () =>
      fetchProducts({
        sortBy: "-createdAt",
        category: product?.category || "",
      }),
    enabled: !!product?.category,
  });

  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stock) {
      setQuantity(selectedVariant.stock);
    }
  }, [selectedVariant, quantity]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (productQuery.isLoading) return <div>Loading...</div>;
  if (productQuery.error) return <div>Error loading product</div>;
  if (!product) return <div>Product not found</div>;

  const ratings = product.ratings || [];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.score, 0) /
      ratings.length
      : 0;
  const ratingCount = ratings.length;
  const imgUrls = product.imgUrls || [];
  const lowestPrice =
    variants.length > 0
      ? Math.min(...variants.map((v: any) => v.price))
      : null;

  const displayPrice = selectedVariant?.price || lowestPrice;

  return (
    <div className="flex flex-col gap-16 pt-4">
      <div className="grid grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {imgUrls[selectedImageIndex] ? (
              <img
                src={imgUrls[selectedImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          {imgUrls.length > 1 && (
            <div className="flex gap-2">
              {imgUrls.map((url: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent"
                    }`}
                >
                  <img
                    src={url}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (
                        e.target as HTMLImageElement
                      ).style.display = "none";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          {product.category && (
            <div className="text-sm text-muted-foreground">
              {product.category}
            </div>
          )}
          <h1 className="text-3xl font-[600]">{product.title}</h1>
          {product.brand && (
            <div className="text-lg text-muted-foreground">
              Thương hiệu: {product.brand}
            </div>
          )}

          {ratingCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-[600]">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-muted-foreground">
                ({ratingCount} đánh giá)
              </span>
            </div>
          )}

          <div className="text-3xl font-[700] text-primary">
            {displayPrice
              ? `${displayPrice.toLocaleString("vi-VN")}đ`
              : "N/A"}
          </div>

          {product.description && (
            <div className="flex flex-col gap-2">
              <div className="font-[600]">Mô tả sản phẩm</div>
              <div className="text-muted-foreground">
                {product.description}
              </div>
            </div>
          )}

          {variants.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="font-[600]">Biến thể</div>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() =>
                      setSelectedVariant(variant)
                    }
                    className={`px-4 py-2 border-2 rounded-md flex flex-col gap-1 cursor-pointer transition-colors ${selectedVariant?.id === variant.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 hover:border-primary/50"
                      }`}
                  >
                    <div className="font-[500]">
                      {variant.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {variant.price.toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Còn {variant.stock} sản phẩm
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="font-[600]">Số lượng:</div>
              <div className="flex items-center gap-2 border rounded-md">
                <button
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center font-[500]">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        selectedVariant?.stock || 999,
                        quantity + 1
                      )
                    )
                  }
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={
                    quantity >=
                    (selectedVariant?.stock || 999)
                  }
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Button
              onClick={() => {
                cart.addItem({
                  variantId: selectedVariant?.id,
                  quantity: quantity,
                  title:
                    product.title +
                    " - " +
                    selectedVariant?.name,
                  imgUrl: imgUrls[0],
                  price: selectedVariant?.price,
                });
                alert("Đã thêm vào giỏ hàng");
              }}
              className="w-full"
              size="lg"
            >
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-[600]">Đánh giá sản phẩm</div>

        {/* Rating Form - Only show if logged in */}
        {auth.isLoggedIn() && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ratingMutation.mutate();
            }}
            className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/30"
          >
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Đánh giá</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setRatingScore(score)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${score <= ratingScore
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="comment"
                className="text-sm font-medium"
              >
                Nhận xét
              </label>
              <Input
                id="comment"
                placeholder="Nhập nhận xét của bạn..."
                value={ratingComment}
                onChange={(e) =>
                  setRatingComment(e.target.value)
                }
              />
            </div>
            <Button
              type="submit"
              className="w-fit"
              disabled={ratingMutation.isPending}
            >
              {ratingMutation.isPending
                ? "Đang gửi..."
                : "Gửi đánh giá"}
            </Button>
          </form>
        )}

        {/* Existing Ratings */}
        {ratings.length > 0 ? (
          <div className="flex flex-col gap-4">
            {ratings.map((rating: any) => (
              <div
                key={rating.id}
                className="flex flex-col gap-2 p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="font-[500]">
                    {rating.userName}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating.score
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>
                {rating.comment && (
                  <div className="text-muted-foreground">
                    {rating.comment}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {new Date(
                    rating.createdAt
                  ).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Chưa có đánh giá nào
          </p>
        )}
      </div>

      {/* Related Products Section */}
      {product && (
        <div className="flex flex-col gap-4">
          <div className="text-2xl font-[600]">
            Sản phẩm liên quan
          </div>
          {relatedProductsQuery.data && (
            <div className="grid grid-cols-5 w-full gap-4">
              {(Array.isArray(relatedProductsQuery.data)
                ? relatedProductsQuery.data
                : relatedProductsQuery.data?.products || []
              )
                .filter((p: any) => p.id !== product.id)
                .slice(0, 5)
                .map((relatedProduct: any) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
