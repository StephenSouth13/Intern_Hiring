import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ResetPasswordDialog({ open, onOpenChange }: Props) {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSend = async () => {
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            toast.error(t("resetPasswordDialog.invalidEmail"));
            return;
        }
        setIsSubmitting(true);
        try {
            const redirectTo = window.location.origin + "/reset-password"; // redirect to reset-password page after user clicks email link
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
            if (error) throw error;
            toast.success(t("resetPasswordDialog.success"));
            onOpenChange(false);
            setEmail("");
        } catch (err: unknown) {
            console.error("Reset password error:", err);
            toast.error(err instanceof Error ? err.message : t("resetPasswordDialog.sendError"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("resetPasswordDialog.title")}</DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    <Label>{t("resetPasswordDialog.emailLabel")}</Label>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ten@example.com"
                        className="mt-2"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t("resetPasswordDialog.description")}
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSend} disabled={isSubmitting}>
                        {t("common.send")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
