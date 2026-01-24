"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Redirect ke halaman utama setelah login berhasil
        router.push("/");
        router.refresh(); // Memastikan server-side state diperbarui
      } else {
        const data = await res.json();
        setError(data.message || "Login gagal!");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server.");
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black overflow-hidden relative">
      {/* LEFT SIDE: FORM */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-10 py-10 relative z-20">
        <div className="w-full max-w-[320px] p-6 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-left space-y-1 mb-6">
            <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
              Login
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full h-10 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-10 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-semibold animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: IMAGE */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply z-10" />
        <img
          src="/images/avatars/login.png"
          alt="Login decoration"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 hover:scale-110"
        />
        {/* TOP BRANDING (OPTIONAL) */}
        <div className="absolute top-8 right-8 z-20 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src="/images/avatars/logo.png" className="w-full h-full object-cover" alt="Logo" />
          </div>
          <span className="text-white font-bold text-sm tracking-tighter">JASARAHARJA</span>
        </div>
      </div>

      {/* VERSION LABEL */}
      <div className="absolute bottom-8 right-8 z-30 pointer-events-none select-none">
        <span className="text-sm font-light italic tracking-[0.4em] text-white/75 font-mono">
          v2.0
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
