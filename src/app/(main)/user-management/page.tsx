"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Users, Calendar, Trash2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import Cookies from "js-cookie";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: number;
  username: string;
  fullname: string;
  role: string;
  created_at: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<string | null>(null);

  // State untuk Hapus User
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    password: "",
    role: "user",
  });

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const result = await res.json();
        setUsers(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setCurrentAdmin(Cookies.get("userName") || null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess("User berhasil ditambahkan!");
        setFormData({ username: "", fullname: "", password: "", role: "user" });
        fetchUsers(); // Refresh list
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menambahkan user");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deletingUser.id,
          username: deletingUser.username
        }),
      });

      if (res.ok) {
        setSuccess(`User ${deletingUser.fullname} berhasil dihapus.`);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menghapus user");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat menghapus");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    }
  };

  return (
    <div className="flex-1 p-8 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Kelola akun pengguna dan hak akses sistem Monitoring CICO.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
            <Users className="h-4 w-4" />
            <span className="text-sm font-bold">{users.length} Total User</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Create User */}
          <div className="lg:col-span-4">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 sticky top-8">
              <CardHeader className="pb-4 border-b dark:border-zinc-800 mb-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Tambah User
                </CardTitle>
                <CardDescription>
                  Daftarkan personel baru.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-3 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-3 text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {success}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="fullname">Nama Lengkap</Label>
                    <Input
                      id="fullname"
                      placeholder="Nama Lengkap"
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="ID Login"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Hak Akses</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(val) => setFormData({ ...formData, role: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User Biasa</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Daftarkan User"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* User List Table */}
          <div className="lg:col-span-8">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 h-full overflow-hidden">
              <CardHeader className="pb-4 border-b dark:border-zinc-800">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Daftar Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {fetchingUsers ? (
                  <div className="p-20 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm">Mengambil data...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-20 text-center text-muted-foreground">
                    <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    <p>Hanya ada akun sistem.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                        <TableRow>
                          <TableHead className="font-bold">Identitas</TableHead>
                          <TableHead className="font-bold">Role</TableHead>
                          <TableHead className="font-bold">Terdaftar</TableHead>
                          <TableHead className="font-bold text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                                  {(u.fullname || u.username).substring(0, 1)}
                                </div>
                                <div className="grid">
                                  <span className="font-bold text-sm">{u.fullname || u.username}</span>
                                  <span className="text-[10px] text-muted-foreground">ID: {u.username}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${u.role === "admin"
                                  ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                                }`}>
                                {u.role === "admin" ? "Admin" : "User"}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {format(new Date(u.created_at), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell className="text-center">
                              {u.username !== currentAdmin ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  onClick={() => handleDeleteClick(u)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <span className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase tracking-tighter">
                                  Sesi Aktif
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md border-t-4 border-t-destructive">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <ShieldAlert className="h-6 w-6" />
              <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-zinc-600 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-zinc-950 dark:text-white underline">{deletingUser?.fullname}</span>?
              Tindakan ini tidak dapat dibatalkan dan akses user tersebut akan segera dihentikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-zinc-100 dark:bg-zinc-800">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
