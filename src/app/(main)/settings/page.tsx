"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Save, ShieldCheck } from "lucide-react";
import Cookies from "js-cookie";

const SettingsPage = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newFullname, setNewFullname] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    useEffect(() => {
        setMounted(true);
        const storedFullname = Cookies.get("fullName");
        const storedUsername = Cookies.get("userName");
        if (storedFullname) setNewFullname(storedFullname);
        if (storedUsername) setNewUsername(storedUsername);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/user/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    new_fullname: newFullname,
                    new_username: newUsername,
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: "Profil berhasil diperbarui. Halaman akan dimuat ulang..." });

                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");

                // Update cookies for immediate effect before reload
                if (newFullname) Cookies.set("fullName", newFullname);
                if (newUsername) Cookies.set("userName", newUsername);

                setTimeout(() => {
                    fetch("/api/auth/logout", { method: "POST" }).then(() => {
                        window.location.href = "/login"; // Force full reload
                    });
                }, 2500);

            } else {
                setMessage({ type: "error", text: data.message || "Gagal memperbarui profil" });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Terjadi kesalahan koneksi ke server" });
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h1>
                <p className="text-muted-foreground mt-1">
                    Kelola informasi profil dan keamanan login Anda.
                </p>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-900 border-t-4 border-t-primary">
                <CardHeader className="pb-6 border-b dark:border-zinc-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Identitas Profil</CardTitle>
                            <CardDescription>Sesuaikan tampilan nama dan identitas Anda.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-8 pt-8">
                        {message && (
                            <div className={`p-4 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
                                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50'
                                } border`}>
                                {message.text}
                            </div>
                        )}

                        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 p-4 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-sm font-bold">
                                <ShieldCheck className="h-4 w-4" />
                                Verifikasi Keamanan
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Kata Sandi Saat Ini</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Wajib diisi untuk menyimpan perubahan"
                                    className="bg-white dark:bg-zinc-950 border-amber-200 dark:border-amber-800/50 focus-visible:ring-amber-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="new_fullname" className="font-bold">Nama Lengkap</Label>
                                    <Input
                                        id="new_fullname"
                                        type="text"
                                        value={newFullname}
                                        onChange={(e) => setNewFullname(e.target.value)}
                                        placeholder="Nama yang tampil di sistem"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_username" className="font-bold">Username / ID Login</Label>
                                    <Input
                                        id="new_username"
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder="ID unik untuk login"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t dark:border-zinc-800 space-y-6">
                                <div className="flex items-center gap-2 text-sm font-bold opacity-70 mb-2">
                                    Ganti Kata Sandi (Opsional)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="new_password">Kata Sandi Baru</Label>
                                        <Input
                                            id="new_password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min. 6 karakter"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password">Konfirmasi Kata Sandi</Label>
                                        <Input
                                            id="confirm_password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi kata sandi baru"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch gap-4 pb-8">
                        <Button type="submit" disabled={loading} className="w-full font-bold py-6 shadow-lg shadow-primary/20">
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan Perubahan...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan Profil</>
                            )}
                        </Button>
                        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                            Setelah disimpan, Anda akan diminta untuk login kembali secara otomatis.
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default SettingsPage;
