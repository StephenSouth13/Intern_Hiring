import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "@/lib/admin-auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/customize";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const ok = loginAdmin(username.trim(), password);
    if (!ok) {
      setError("Sai tài khoản hoặc mật khẩu admin.");
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <CardTitle>Đăng nhập admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" variant="cta" type="submit">
              Đăng nhập
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/">Quay lại website</Link>
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo admin: <span className="font-semibold">admin</span> / <span className="font-semibold">admin123</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
