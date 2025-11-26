import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { signIn } from "@/api/auth-api";

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => signIn({ email, password }),
    onSuccess: (data) => {
      auth.setTokenAndUser(data.token, data.user);
      navigate("/");
    },
    onError: () => {
      alert("Thông tin đăng nhập không chính xác");
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        loginMutation.mutate();
      }}
      className="flex flex-col items-center gap-4 pt-10"
    >
      <h1 className="text-2xl font-semibold">Đăng nhập</h1>
      <Input
        placeholder="Email"
        type="email"
        className="w-full max-w-md"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Mật khẩu"
        type="password"
        className="w-full max-w-md"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" className="w-full max-w-md">
        Đăng nhập
      </Button>
      <p className="text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link to="/signup" className="text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
