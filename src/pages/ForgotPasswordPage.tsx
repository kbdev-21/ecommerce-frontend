import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { forgetPasswordInit, forgetPasswordConfirm } from "@/api/auth-api";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [requestId, setRequestId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const sendOTPMutation = useMutation({
        mutationFn: () => {
            return forgetPasswordInit({ email });
        },
        onSuccess: (data) => {
            setRequestId(data.requestId);
            alert(data.message || "OTP đã được gửi vào email!");
        },
        onError: () => {
            alert("Lỗi khi gửi OTP. Vui lòng kiểm tra lại email.");
        },
    });

    const confirmPasswordMutation = useMutation({
        mutationFn: () => {
            if (!requestId) {
                throw new Error("Vui lòng gửi OTP trước");
            }
            if (newPassword !== confirmPassword) {
                throw new Error("Mật khẩu xác nhận không khớp");
            }
            return forgetPasswordConfirm({
                requestId,
                otp,
                newPassword,
            });
        },
        onSuccess: () => {
            alert("Đặt lại mật khẩu thành công!");
            navigate("/login");
        },
        onError: (error: any) => {
            alert(
                error?.message ||
                    "Lỗi khi đặt lại mật khẩu. Vui lòng kiểm tra lại OTP."
            );
        },
    });

    const handleSendOTP = () => {
        if (!email) {
            alert("Vui lòng nhập email");
            return;
        }
        sendOTPMutation.mutate();
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                confirmPasswordMutation.mutate();
            }}
            className="flex flex-col items-center gap-4 pt-10"
        >
            <h1 className="text-2xl font-semibold">Quên mật khẩu</h1>
            <Input
                placeholder="Email của bạn"
                type="email"
                className="w-full max-w-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-2 w-full max-w-md">
                <Input
                    placeholder="Mã OTP"
                    type="text"
                    className="flex-1"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOTP}
                    disabled={sendOTPMutation.isPending}
                >
                    {sendOTPMutation.isPending
                        ? "Đang gửi..."
                        : "Gửi vào email"}
                </Button>
            </div>
            <Input
                placeholder="Mật khẩu mới"
                type="password"
                className="w-full max-w-md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
                placeholder="Xác nhận mật khẩu mới"
                type="password"
                className="w-full max-w-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
                type="submit"
                className="w-full max-w-md"
                disabled={confirmPasswordMutation.isPending || !requestId}
            >
                {confirmPasswordMutation.isPending
                    ? "Đang xử lý..."
                    : "Đặt lại mật khẩu"}
            </Button>
        </form>
    );
}
