import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { userApi } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Camera,
  Save,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Lock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!user || !token) {
    navigate("/auth");
    return null;
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({ title: "Lỗi", description: "Chỉ chấp nhận file ảnh", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Lỗi", description: "File không được vượt quá 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      if (!supaUser) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const filePath = `${supaUser.id}/avatar.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache buster
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      // Update backend
      await userApi.updateProfile(token, { avatarUrl });

      await refreshUser();
      toast({ title: "Thành công", description: "Đã cập nhật ảnh đại diện" });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      toast({
        title: "Lỗi",
        description: err.message || "Không thể tải ảnh lên",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userApi.updateProfile(token, formData);

      await refreshUser();
      setIsEditing(false);
      toast({ title: "Thành công", description: "Đã cập nhật thông tin cá nhân" });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể cập nhật",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Lỗi", description: "Mật khẩu phải có ít nhất 6 ký tự", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordData({ newPassword: "", confirmPassword: "" });
      toast({ title: "Thành công", description: "Đã đổi mật khẩu" });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể đổi mật khẩu",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        {/* Avatar card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/80 to-primary" />
          <div className="relative px-6 pb-6">
            <div className="relative -mt-16 mb-4 w-fit">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                <AvatarImage src={user.avatarUrl} alt={user.firstName} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  {user.firstName?.charAt(0) || <UserIcon className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-110 disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <h2 className="text-2xl font-bold">
              {user.lastName} {user.firstName}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="h-3 w-3" />
              {user.role}
            </div>
          </div>
        </Card>

        {/* Info card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: user.firstName || "",
                      lastName: user.lastName || "",
                      phoneNumber: user.phoneNumber || "",
                    });
                  }}
                >
                  Hủy
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Lưu
                </Button>
              </div>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="space-y-6 pt-6">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input value={user.email} disabled className="bg-muted/50" />
            </div>

            {/* Last name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="h-4 w-4" /> Họ
              </Label>
              {isEditing ? (
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Nhập họ"
                />
              ) : (
                <Input value={user.lastName || "—"} disabled className="bg-muted/50" />
              )}
            </div>

            {/* First name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="h-4 w-4" /> Tên
              </Label>
              {isEditing ? (
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Nhập tên"
                />
              ) : (
                <Input value={user.firstName || "—"} disabled className="bg-muted/50" />
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" /> Số điện thoại
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <Input value={user.phoneNumber || "—"} disabled className="bg-muted/50" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password change card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Mật khẩu mới</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Xác nhận mật khẩu mới</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordData.newPassword}
              className="w-full sm:w-auto"
            >
              {isChangingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              Đổi mật khẩu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
