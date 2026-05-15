import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { authApi } from "@/lib/api";
import { isAdminRole, isRestrictedAccount } from "@/lib/roles";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/, "Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      let redirectTo = "/";
      const accessToken = data.session?.access_token;

      if (accessToken) {
        const profile = await authApi.getMe(accessToken);

        if (isRestrictedAccount(profile)) {
          await supabase.auth.signOut();
          toast.error("Tài khoản của bạn đang bị hạn chế và không thể đăng nhập vào hệ thống.");
          return;
        }

        if (isAdminRole(profile.role)) {
          redirectTo = "/admin";
        }
      }

      toast.success("Đăng nhập thành công!");
      navigate(redirectTo);
    } catch (error: any) {
      toast.error(error.message || "Không thể kết nối đến hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-[calc(100dvh-4rem)] overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto flex h-full items-center justify-center px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid w-full max-w-5xl overflow-hidden rounded-xl border bg-white shadow-strong md:grid-cols-[1fr_0.85fr]"
        >
          <section className="hidden hero-gradient p-8 text-white md:flex md:flex-col md:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight">
                Chào mừng bạn quay lại InternHiring
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/85">
                Tiếp tục kết nối với chương trình thực tập, doanh nghiệp đối tác và các cơ hội phát triển nghề nghiệp.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
              <ShieldCheck className="h-6 w-6 text-yellow-300" />
              <p className="text-sm text-white/90">
                Tài khoản được xác thực qua Supabase Auth và đồng bộ với hồ sơ ứng viên.
              </p>
            </div>
          </section>

          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-2 px-6 pb-4 pt-6 sm:px-8">
              <CardTitle className="text-2xl font-bold text-foreground">
                Đăng nhập
              </CardTitle>
              <CardDescription>
                Nhập email và mật khẩu để truy cập tài khoản của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-4 sm:px-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="ten@example.com"
                              className="h-10 pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Nhập mật khẩu"
                              className="h-10 pl-10 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                              onClick={() => setShowPassword((current) => !current)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end -mt-1 -mb-2">
                    <button
                      type="button"
                      onClick={() => setIsResetOpen(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="cta"
                    className="h-10 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Đăng nhập
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center border-t bg-secondary/40 px-6 py-4 sm:px-8">
              <p className="text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      <ResetPasswordDialog open={isResetOpen} onOpenChange={setIsResetOpen} />

    </main>
  );
};

export default Login;
