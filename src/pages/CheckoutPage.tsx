import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { SimpleSelectDropdown } from "@/components/app/SimpleSelectDropdown";
import { calculateOrder, createOrder } from "@/api/ecommerce-api";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const cart = useCart();
  const auth = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(auth.user?.name || "");
  const [email, setEmail] = useState(auth.user?.email || "");
  const [phoneNum, setPhoneNum] = useState(auth.user?.phoneNum || "");
  const [address, setAddress] = useState(
    auth.user?.addresses[0]?.detail || ""
  );
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [discountText, setDiscountText] = useState("");

  const calculateOrderMutation = useMutation({
    mutationFn: () =>
      calculateOrder({
        items: cart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        discountCode: discountCode === "" ? undefined : discountCode,
      }),
    onSuccess: (data) => {
      setTotalPrice(data.totalPrice);
      if (data.discountCode) {
        // Calculate discount amount: totalPrice - sum of individual item prices
        const itemsTotal = cart.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const discountAmount = itemsTotal - data.totalPrice;
        setDiscountText(
          `Bạn được giảm ${discountAmount.toLocaleString("vi-VN")}đ !`
        );
      } else {
        setDiscountText("");
      }
      // Update cart items if server returns updated data
      if (data.items && Array.isArray(data.items)) {
        // Clear current cart and add updated items
        cart.clearCart();
        data.items.forEach((item: any) => {
          cart.addItem({
            variantId: item.variantId,
            title: item.title || "",
            imgUrl: item.displayName || "",
            quantity: item.quantity,
            price: item.price || 0,
          });
        });
      }
    },
    onError: () => {
      alert("Lỗi khi tính toán đơn hàng");
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: () =>
      createOrder({
        fullName,
        email,
        phoneNum,
        addressDetail: address,
        items: cart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        discountCode: discountCode === "" ? undefined : discountCode,
      }),
    onSuccess: (data) => {
      cart.clearCart();
      alert(`Đặt hàng thành công! Mã đơn hàng: ${data.id}`);
      navigate("/");
    },
    onError: () => {
      alert("Thông tin không đầy đủ hoặc mã giảm giá không hợp lệ");
    },
  });

  useEffect(() => {
    if (cart.items.length > 0) {
      calculateOrderMutation.mutate();
    }
  }, [cart.items]);

  return (
    <div className="flex flex-col items-center pt-8 gap-6 w-full">
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="col-span-1">
          <div className="mb-4 text-lg font-semibold">
            Thông tin giao hàng
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Họ và Tên
              </label>
              <Input
                placeholder="Nhập họ và tên của bạn"
                disabled={auth.user !== null}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="Nhập email của bạn"
                type="email"
                disabled={auth.user !== null}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Số điện thoại
              </label>
              <Input
                placeholder="Nhập số điện thoại"
                type="tel"
                disabled={auth.user !== null}
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Địa chỉ
              </label>
              {auth.user ? (
                <SimpleSelectDropdown
                  placeholder="Chọn địa chỉ giao hàng"
                  selections={auth.user.addresses.map(
                    (addr) => ({
                      label: `${addr.name}: ${addr.detail}`,
                      value: addr.detail,
                    })
                  )}
                  initValue={address}
                  onValueChange={setAddress}
                  className="w-full"
                />
              ) : (
                <Input
                  placeholder="Nhập địa chỉ giao hàng"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Phương thức thanh toán
              </label>
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    defaultChecked
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="text-lg font-semibold mb-4">Giỏ hàng</div>
          {cart.items.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              Giỏ hàng trống
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center space-x-3 p-3 border border-muted-foreground rounded-lg"
                >
                  <img
                    src={item.imgUrl}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              // Decrease quantity
                              cart.updateItem(
                                item.variantId,
                                {
                                  quantity:
                                    item.quantity -
                                    1,
                                }
                              );
                            } else {
                              // Remove item if quantity is 1
                              cart.removeItem(
                                item.variantId
                              );
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
                        >
                          -
                        </button>
                        <span className="text-sm text-gray-600 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            cart.updateItem(
                              item.variantId,
                              {
                                quantity:
                                  item.quantity +
                                  1,
                              }
                            );
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
                        >
                          +
                        </button>
                        <Button
                          variant="link"
                          onClick={() =>
                            cart.removeItem(
                              item.variantId
                            )
                          }
                        >
                          Xóa
                        </Button>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {(
                          item.price * item.quantity
                        ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="pb-4">
                  <label className="text-sm font-medium mb-2 block">
                    Mã giảm giá
                  </label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      calculateOrderMutation.mutate();
                    }}
                    className="flex space-x-2"
                  >
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={(e) =>
                        setDiscountCode(e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button type="submit" variant={"link"}>
                      Áp dụng
                    </Button>
                  </form>
                  {discountText && (
                    <div className="mt-2 text-sm text-primary">
                      {discountText}
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span>
                    {(totalPrice || 0).toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </span>
                </div>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => placeOrderMutation.mutate()}
                  disabled={placeOrderMutation.isPending}
                >
                  {placeOrderMutation.isPending
                    ? "Đang xử lý..."
                    : "Đặt hàng"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
