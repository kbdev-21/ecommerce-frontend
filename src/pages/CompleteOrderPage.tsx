import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

export default function CompleteOrderPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const cart = useCart();

    // Just in case user comes here with items still in cart
    useEffect(() => {
        if (cart.items.length > 0) {
            cart.clearCart();
        }
    }, [cart]);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-3xl">✓</span>
                    </div>
                    <h1 className="text-2xl font-bold">
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Cảm ơn bạn đã mua hàng. Chúng tôi đã nhận được đơn hàng
                        và sẽ xử lý trong thời gian sớm nhất.
                    </p>
                </div>

                {id && (
                    <div className="p-4 rounded-lg border bg-muted/40 text-left">
                        <p className="text-sm text-muted-foreground">
                            Mã đơn hàng của bạn:
                        </p>
                        <p className="font-mono font-semibold text-lg mt-1 break-all">
                            {id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Bạn có thể theo dõi đơn hàng trong trang{" "}
                            <span className="font-medium">Hồ sơ</span> của bạn.
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/profile")}
                    >
                        Xem đơn hàng của tôi
                    </Button>
                    <Button onClick={() => navigate("/")}>
                        Tiếp tục mua sắm
                    </Button>
                </div>
            </div>
        </div>
    );
}


