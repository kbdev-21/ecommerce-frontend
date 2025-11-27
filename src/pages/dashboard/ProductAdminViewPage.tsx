import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    fetchProductBySlug,
    updateProduct,
    deleteProduct,
    type UpdateVariantRequest,
} from "@/api/ecommerce-api";
import { Trash2, Plus } from "lucide-react";

export default function ProductAdminViewPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { slug } = useParams<{ slug: string }>();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [imgUrls, setImgUrls] = useState<string[]>([]);
    const [variants, setVariants] = useState<UpdateVariantRequest[]>([]);

    useEffect(() => {
        if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
            navigate("/");
        }
    }, [auth, navigate]);

    const productQuery = useQuery({
        queryKey: ["product", "admin", slug],
        queryFn: () => fetchProductBySlug(slug!),
        enabled: !!slug,
    });

    const productId = productQuery.data?.id;

    useEffect(() => {
        if (productQuery.data) {
            const product = productQuery.data;
            setTitle(product.title);
            setDescription(product.description || "");
            setCategory(product.category);
            setBrand(product.brand);
            setImgUrls(product.imgUrls);
            setVariants(
                product.variants.map((v) => ({
                    id: v.id,
                    name: v.name,
                    stock: v.stock,
                    price: v.price,
                }))
            );
        }
    }, [productQuery.data]);

    const updateMutation = useMutation({
        mutationFn: () =>
            updateProduct(productId!, {
                title,
                description,
                category,
                brand,
                imgUrls,
                variants,
            }),
        onSuccess: () => {
            alert("Cập nhật sản phẩm thành công!");
            queryClient.invalidateQueries({
                queryKey: ["product", "admin", slug],
            });
        },
        onError: () => {
            alert("Lỗi khi cập nhật sản phẩm");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteProduct(productId!),
        onSuccess: () => {
            alert("Xóa sản phẩm thành công!");
            navigate("/dashboard/products");
        },
        onError: () => {
            alert("Lỗi khi xóa sản phẩm");
        },
    });

    const handleDelete = () => {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            deleteMutation.mutate();
        }
    };

    const addVariant = () => {
        setVariants([...variants, { name: "", stock: 0, price: 0 }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (
        index: number,
        field: keyof UpdateVariantRequest,
        value: string | number
    ) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const addImgUrl = () => {
        setImgUrls([...imgUrls, ""]);
    };

    const removeImgUrl = (index: number) => {
        setImgUrls(imgUrls.filter((_, i) => i !== index));
    };

    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
        return null;
    }

    if (productQuery.isLoading) {
        return (
            <div className="flex">
                <DashboardSidebar />
                <div className="flex-1 p-8">
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (productQuery.isError) {
        return (
            <div className="flex">
                <DashboardSidebar />
                <div className="flex-1 p-8">
                    <p className="text-red-500">Lỗi khi tải sản phẩm</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <DashboardSidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Chi tiết sản phẩm</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard/products")}
                        >
                            Quay lại
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                        </Button>
                        <Button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            Thông tin cơ bản
                        </h2>
                        <div>
                            <label className="text-sm font-medium">
                                Tên sản phẩm
                            </label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Mô tả</label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    Danh mục
                                </label>
                                <Input
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Thương hiệu
                                </label>
                                <Input
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Hình ảnh</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addImgUrl}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Thêm
                            </Button>
                        </div>
                        {imgUrls.map((url, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={url}
                                    onChange={(e) => {
                                        const newUrls = [...imgUrls];
                                        newUrls[index] = e.target.value;
                                        setImgUrls(newUrls);
                                    }}
                                    placeholder="URL hình ảnh"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeImgUrl(index)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Variants */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Biến thể</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addVariant}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Thêm
                            </Button>
                        </div>
                        {variants.map((variant, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg space-y-3"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        Biến thể {index + 1}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeVariant(index)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Tên
                                        </label>
                                        <Input
                                            value={variant.name}
                                            onChange={(e) =>
                                                updateVariant(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Giá
                                        </label>
                                        <Input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) =>
                                                updateVariant(
                                                    index,
                                                    "price",
                                                    parseInt(e.target.value) ||
                                                        0
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Tồn kho
                                        </label>
                                        <Input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) =>
                                                updateVariant(
                                                    index,
                                                    "stock",
                                                    parseInt(e.target.value) ||
                                                        0
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
