import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { USER_ROLES } from "@/lib/roles";
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
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, Phone, User } from "lucide-react";

type RegisterFormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

const Register = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/, t("validation.emailInvalid")),
        password: z.string().min(6, t("validation.passwordMin")),
        firstName: z.string().min(2, t("validation.firstNameShort")),
        lastName: z.string().min(2, t("validation.lastNameShort")),
        phoneNumber: z.string().optional(),
      }),
    [t],
  );

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone_number: values.phoneNumber,
            role: USER_ROLES.CANDIDATE,
          },
        },
      });

      if (error) throw error;

      toast.success(t("register.success"));
      form.reset();
      navigate("/login");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("auth.systemConnectionError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-[calc(100dvh-4rem)] overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto flex h-full items-center justify-center px-4 py-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid w-full max-w-5xl overflow-hidden rounded-xl border bg-white shadow-strong md:grid-cols-[0.78fr_1fr]"
        >
          <section className="hidden bg-secondary/70 p-6 md:flex md:flex-col md:justify-between">
            <div>
              <Badge className="mb-4 bg-primary text-primary-foreground">
                {t("register.badge")}
              </Badge>
              <h1 className="text-3xl font-bold leading-tight text-foreground">
                {t("register.heroTitle")}
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {t("register.heroDescription")}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4 shadow-soft">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {t("register.defaultRole")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("register.recruiterHint")}
              </p>
            </div>
          </section>

          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1 px-5 pb-3 pt-5 sm:px-7">
              <div className="md:hidden">
                <Badge className="mb-2 bg-primary text-primary-foreground">
                  {t("register.badge")}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {t("register.title")}
              </CardTitle>
              <CardDescription>
                {t("register.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-3 sm:px-7">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.last_name")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Nguyen" className="h-9 pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.first_name")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="An" className="h-9 pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="ten@example.com"
                              className="h-9 pl-10"
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
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.phone")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="0901234567" className="h-9 pl-10" {...field} />
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
                        <FormLabel>{t("common.password")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t("register.passwordPlaceholder")}
                              className="h-9 pl-10 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
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
                    {t("register.submit")}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center border-t bg-secondary/40 px-5 py-3 sm:px-7">
              <p className="text-sm text-muted-foreground">
                {t("register.haveAccount")}{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  {t("register.login")}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default Register;
