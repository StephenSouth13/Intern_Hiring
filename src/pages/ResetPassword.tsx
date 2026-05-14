import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPasswordPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [sessionActive, setSessionActive] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setErrorMsg(null);
            try {
                // Try to extract session from URL using Supabase helper if available
                let session = null as any;

                if (typeof (supabase.auth as any).getSessionFromUrl === "function") {
                    // @ts-ignore
                    const res = await (supabase.auth as any).getSessionFromUrl();
                    session = res?.data?.session ?? res?.session ?? res?.data ?? null;
                }

                if (!session) {
                    // Fallback: parse URL hash for access_token/refresh_token and set session
                    const hash = window.location.hash;
                    if (hash?.includes("access_token")) {
                        const params = new URLSearchParams(hash.replace(/^#/, ""));
                        const access_token = params.get("access_token");
                        const refresh_token = params.get("refresh_token");
                        if (access_token && typeof (supabase.auth as any).setSession === "function") {
                            // @ts-ignore
                            const setRes = await (supabase.auth as any).setSession({ access_token, refresh_token });
                            session = setRes?.data?.session ?? setRes?.session ?? null;
                        }
                    }
                }

                if (session) {
                    setSessionActive(true);
                } else {
                    setSessionActive(false);
                    setErrorMsg("Không tìm thấy phiên đăng nhập từ liên kết. Vui lòng mở lại liên kết trong email hoặc gửi lại yêu cầu đặt lại mật khẩu.");
                }
            } catch (err: any) {
                console.error("Error getting session from URL:", err);
                setErrorMsg(err?.message || String(err));
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const handleSubmit = async () => {
        if (password.length < 6) {
            toast({ title: "Lỗi", description: "Mật khẩu phải có ít nhất 6 ký tự", variant: "destructive" });
            return;
        }
        if (password !== confirmPassword) {
            toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            toast({ title: "Thành công", description: "Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại." });
            // After resetting password, redirect to login
            navigate("/login");
        } catch (err: any) {
            console.error("Update password error:", err);
            toast({ title: "Lỗi", description: err.message || "Không thể cập nhật mật khẩu", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="h-[calc(100dvh-4rem)] overflow-hidden bg-gradient-subtle">
            <div className="container mx-auto flex h-full items-center justify-center px-4 py-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <CardTitle>Đặt lại mật khẩu</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : errorMsg ? (
                            <div className="space-y-4">
                                <p className="text-sm text-destructive">{errorMsg}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => navigate("/login")}>
                                        Trở về đăng nhập
                                    </Button>
                                    <Button onClick={() => navigate("/login")}>Gửi lại yêu cầu</Button>
                                </div>
                            </div>
                        ) : sessionActive ? (
                            <div className="space-y-4">
                                <div>
                                    <Label>Mật khẩu mới</Label>
                                    <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu mới" className="mt-2" />
                                </div>
                                <div>
                                    <Label>Xác nhận mật khẩu</Label>
                                    <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu" className="mt-2" />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cập nhật mật khẩu"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p>Không có phiên hợp lệ để đặt lại mật khẩu.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
};

export default ResetPasswordPage;
