import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AvatarUploadModal from "@/components/AvatarUploadModal";
import {
  ArrowLeft,
  Camera,
  IdCard,
  Mail,
  Phone,
  Shield,
  User as UserIcon,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fullName =
    [user?.lastName, user?.firstName].filter(Boolean).join(" ") ||
    user?.firstName ||
    user?.email ||
    "Người dùng";
  const fallbackInitial = (user?.firstName || user?.email || "U")
    .charAt(0)
    .toUpperCase();
  const roleLabel =
    user?.role === "ADMIN"
      ? "Quản trị viên"
      : user?.role === "USER"
        ? "Người dùng"
        : user?.role || "Chưa cập nhật";

  const profileItems = [
    {
      label: "Họ và tên",
      value: fullName,
      icon: UserIcon,
    },
    {
      label: "Email",
      value: user?.email || "Chưa cập nhật",
      icon: Mail,
    },
    {
      label: "Số điện thoại",
      value: user?.phoneNumber || "Chưa cập nhật",
      icon: Phone,
    },
    {
      label: "Vai trò",
      value: roleLabel,
      icon: Shield,
    },
    {
      label: "Mã người dùng",
      value: user?.id ? String(user.id) : "Chưa cập nhật",
      icon: IdCard,
    },
  ];

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/update-avatar`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi tải ảnh lên");
      }

      // Reload the page or update the user context to show new avatar
      const result = await response.json();
      if (result.avatarUrl) {
        // Update the user in context if possible
        window.location.reload();
      }

      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-secondary/40">
      <section className="container mx-auto px-4 py-10">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-lg border bg-white p-6 shadow-soft">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatarUrl} alt={fullName} />
                  <AvatarFallback className="text-3xl text-primary">
                    {fallbackInitial}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setUploadDialogOpen(true)}
                  className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white hover:bg-primary/90 transition-colors"
                  title="Cập nhật ảnh đại diện"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <h1 className="mt-5 text-2xl font-bold text-foreground">
                {fullName}
              </h1>
              {user?.email && (
                <p className="mt-1 max-w-full truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
              <Badge className="mt-4">{roleLabel}</Badge>
            </div>
          </aside>

          <section className="rounded-lg border bg-white p-6 shadow-soft">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Hồ sơ cá nhân
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Thông tin tài khoản đang đăng nhập trên InternHiring.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {profileItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-lg border bg-background p-4"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-base font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <AvatarUploadModal
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleAvatarUpload}
        isLoading={isUploading}
      />
    </main>
  );
};

export default Profile;
