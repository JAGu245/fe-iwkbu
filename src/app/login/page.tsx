"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Login gagal!");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server.");
    }
  };

  return (
    <div className="flex relative min-h-screen overflow-hidden font-sans" style={{ background: 'linear-gradient(to top right, #88B6F6, #226CA7, #002F55)' }}>
      
      {/* LEFT COLUMN: FORM */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center px-6 lg:px-16 xl:px-24 py-10 relative z-20">
        <div className="w-full max-w-[420px] p-9 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 ring-1 ring-white/10">
          <div className="text-left mb-6">
            <h2 className="text-white font-bold text-lg mb-1 text-center tracking-wide">Welcome to</h2>
            <div className="flex justify-center items-center gap-2 mb-1">
              <span className="text-5xl font-black text-[#0a5e8a]" style={{ WebkitTextStroke: '6px #ffffff', paintOrder: 'stroke fill', letterSpacing: '-0.04em', textShadow: '2px 2px 6px rgba(0,0,0,0.3)' }}>
                CICO
              </span>
              <span className="text-[2rem] font-bold text-white drop-shadow-sm">Monitoring</span>
            </div>
            <h3 className="text-white font-light text-2xl text-right mr-4 tracking-wide">Dashboard</h3>
            
            <div className="mt-4 flex justify-center">
               <div className="border-t border-dashed border-white/40 w-3/4"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-white/90 ml-1"
              >
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 border-none rounded bg-white text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white/90 ml-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 border-none rounded bg-white text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                required
              />
            </div>

            {/* Removed Remember Me & Forgot Password */}

            {error && (
              <div className="p-3 rounded bg-rose-500/80 border border-rose-500/50 text-white text-[12px] font-semibold text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 flex items-center justify-center rounded bg-[#2883ED] hover:bg-[#1a6fd4] text-white font-bold text-sm transition-all mt-4 shadow-lg tracking-wider"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: CURVED WHITE CONTAINER */}
      <div className="hidden lg:flex lg:w-[45%] bg-white rounded-tl-[100px] rounded-bl-[300px] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex-col pl-6 pt-6 pb-8 pr-0 relative z-30">
        
        {/* Logos */}
        <div className="flex justify-between items-center w-full mt-1 pr-6 pl-4">
          <Image
            src="/images/avatars/login aset/Danantara Indonesia.png"
            alt="Danantara Indonesia"
            width={120}
            height={40}
            className="object-contain"
          />
          <Image
            src="/images/avatars/login aset/logo-jr.png"
            alt="Jasa Raharja"
            width={75}
            height={40}
            className="object-contain"
          />
        </div>

        {/* The Image (lebih lebar ke kanan, top position, naik dari ujung kanan bawah) */}
        <div className="relative w-full flex-1 mt-8 mb-0 rounded-tl-[40px] rounded-bl-[220px] overflow-hidden shadow-[-5px_10px_30px_rgba(0,0,0,0.1)] border-y-4 border-l-4 border-r-0 border-white/50">
          <Image
            src="/images/avatars/login aset/gambar kanan.png"
            alt="Background Collage"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
        
      </div>
      
      {/* Footer centered on the entire page */}
      <div className="absolute bottom-6 left-0 w-full text-center z-50 pointer-events-none select-none">
        <span className="text-sm font-medium text-white/90 drop-shadow-md">
          © 2026 CICO System. All rights reserved.
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
