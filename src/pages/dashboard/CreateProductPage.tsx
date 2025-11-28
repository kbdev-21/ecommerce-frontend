import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProduct, type UpdateVariantRequest } from "@/api/ecommerce-api";
import { Trash2, Plus } from "lucide-react";

export default function CreateProductPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [imgUrls, setImgUrls] = useState<string[]>([""]);
    const [variants, setVariants] = useState<UpdateVariantRequest[]>([
        { name: "", stock: 0, price: 0 },
    ]);

    useEffect(() => {
        if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
            navigate("/");
        }
    }, [auth, navigate]);

    const createMutation = useMutation({
        mutationFn: () =>
            createProduct(
                {
                    title,
                    description: description || undefined,
                    category,
                    brand,
                    imgUrls: imgUrls.filter((url) => url.trim() !== ""),
                    variants,
                },
                auth.token!
            ),
        onSuccess: (data) => {
            alert("Tạo sản phẩm thành công!");
            navigate(`/dashboard/products/${data.slug}`);
        },
        onError: () => {
            alert("Lỗi khi tạo sản phẩm");
        },
    });

    const addVariant = () => {
        setVariants([...variants, { name: "", stock: 0, price: 0 }]);
    };

    const removeVariant = (index: number) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
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
        if (imgUrls.length > 1) {
            setImgUrls(imgUrls.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category || !brand) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }
        createMutation.mutate();
    };

    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="flex">
            <DashboardSidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Thêm sản phẩm mới</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard/products")}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Đang tạo..." : "Tạo"}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            Thông tin cơ bản
                        </h2>
                        <div>
                            <label className="text-sm font-medium">
                                Tên sản phẩm *
                            </label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
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
                                    Danh mục *
                                </label>
                                <Input
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Thương hiệu *
                                </label>
                                <Input
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    required
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
                                {imgUrls.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeImgUrl(index)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                )}
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
                                    {variants.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeVariant(index)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    )}
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
                                            value={
                                                variant.price === 0
                                                    ? ""
                                                    : variant.price
                                            }
                                            onChange={(e) =>
                                                updateVariant(
                                                    index,
                                                    "price",
                                                    e.target.value === ""
                                                        ? 0
                                                        : parseInt(
                                                              e.target.value
                                                          ) || 0
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
                                            value={
                                                variant.stock === 0
                                                    ? ""
                                                    : variant.stock
                                            }
                                            onChange={(e) =>
                                                updateVariant(
                                                    index,
                                                    "stock",
                                                    e.target.value === ""
                                                        ? 0
                                                        : parseInt(
                                                              e.target.value
                                                          ) || 0
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
}
