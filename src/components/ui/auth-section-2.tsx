import React, { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, UserCheck } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ShapeWaves from "./ShapeWaves";

const images = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
];

const prompts = [
  "BluNet Enterprise Workplace — High performance internal employee management, task delegation, and IT operations portal.",
  "Sequential Marketing Lead Caller Engine — Production workflow, call response tracking, and target analytics.",
  "Secure Role-Based Access Control — RBAC policy enforcement for Employee, Marketing Head, Admin, and Founder.",
  "Executive Visibility Console — Real-time database metrics, revenue target achievement, and task completion analytics.",
];

export default function AuthSectionTwo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3200);

    const clockTimer = window.setInterval(() => {
      setNow(new Date());
      setShowColon((prev) => !prev);
    }, 1000);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(clockTimer);
    };
  }, []);

  const hours = now.toLocaleTimeString("en-US", { hour: "2-digit", hour12: true }).split(" ")[0];
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="min-h-screen bg-slate-950 p-3 text-white antialiased">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        
        {/* LEFT COLUMN: HERO WITH REACT BITS SHAPE WAVES */}
        <div className="relative flex min-h-[720px] flex-col justify-between overflow-hidden rounded-2xl bg-[#030712] border border-slate-800/80 p-8 text-white lg:min-h-0 lg:p-12">
          {/* Background Interactive ShapeWaves Canvas */}
          <div className="absolute inset-0 z-0 w-full h-full">
            <ShapeWaves
              text="BluNet"
              fontFamily='Inter, "Geist Sans", system-ui, sans-serif'
              fontWeight={900}
              textSize={0.5}
              shapes="mixed"
              cellSize={9}
              dotSize={0.75}
              color="#b0b8c8"
              hoverColor="#ffffff"
              backgroundColor="#0c0d12"
              speed={1}
              scale={1}
              contrast={1}
              brightness={0.4}
              flow={0}
              direction={0}
              fade={0.25}
              interactive={true}
              splashRadius={40}
              splashStrength={0.4}
              glow={0.35}
              intro={true}
              introDuration={1.6}
              paused={false}
            />
          </div>

          {/* Header Overlay Row with Logo on Left and Live Clock/Date on Right */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xl font-bold text-white tracking-wider bg-slate-950/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
              <img
                src="/l.webp"
                alt="BluNet Workplace Logo"
                className="h-8 w-auto object-contain shrink-0"
              />
              <span className="font-extrabold tracking-tight">BluNet Workplace</span>
            </div>

            {/* Live Clock & Date Stacked: Larger Time on Top, Date & Day Underneath */}
            <div className="flex flex-col items-end justify-center text-right pr-1 drop-shadow-md">
              <div className="flex items-center font-mono text-xl font-bold text-white tracking-wider">
                <span>{hours}</span>
                <span className={`transition-opacity duration-300 mx-0.5 font-bold ${showColon ? "opacity-100 text-blue-400" : "opacity-20 text-slate-400"}`}>:</span>
                <span>{minutes}</span>
                <span className={`transition-opacity duration-300 mx-0.5 font-bold ${showColon ? "opacity-100 text-blue-400" : "opacity-20 text-slate-400"}`}>:</span>
                <span>{seconds}</span>
                <span className="ml-2 text-xs font-sans font-extrabold text-slate-300 uppercase">{ampm}</span>
              </div>
              <div className="tracking-wide text-xs text-slate-300 font-medium mt-0.5">
                {dateString}
              </div>
            </div>
          </div>

          {/* Bottom Brands / Platform Grid Overlay matching reference UI */}
          <div className="relative z-10 mt-auto pt-6">
            <div className="mb-3 text-center">
              <p className="text-xs font-medium tracking-wide text-slate-400">
                Trusted by teams and companies around the world
              </p>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-800/90 bg-[#0b0d13]/90 shadow-2xl backdrop-blur-md max-w-[540px]">
              {/* Row 1: Workspace, Employee Login, Marketing Head Login */}
              <div className="grid grid-cols-3 divide-x divide-slate-800/80 border-b border-slate-800/80">
                <div className="flex h-20 items-center justify-center bg-[#12141d]/90 px-3 transition-colors hover:bg-[#181b27]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/></svg>
                    </span>
                    <span className="text-sm font-extrabold tracking-tight text-white">
                      Workspace
                    </span>
                  </div>
                </div>

                <div className="flex h-20 items-center justify-center bg-[#12141d]/90 px-3 transition-colors hover:bg-[#181b27]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </span>
                    <span className="text-xs font-bold text-emerald-400 tracking-tight">
                      Employee Login
                    </span>
                  </div>
                </div>

                <div className="flex h-20 items-center justify-center bg-[#12141d]/90 px-3 transition-colors hover:bg-[#181b27]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    </span>
                    <span className="text-xs font-bold text-purple-300 tracking-tight leading-tight text-left">
                      Marketing Head
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: AgroFlow, RestoPilot, BluNet Workplace */}
              <div className="grid grid-cols-3 divide-x divide-slate-800/80">
                <div className="flex h-20 items-center justify-center bg-[#12141d]/90 px-3 transition-colors hover:bg-[#181b27]">
                  <div className="flex items-center gap-1">
                    <span className="text-base font-black tracking-tight text-amber-500">Agro</span>
                    <span className="text-base font-black tracking-tight text-emerald-400">Flow</span>
                  </div>
                </div>

                <div className="flex h-20 items-center justify-center bg-[#12141d]/90 px-3 transition-colors hover:bg-[#181b27]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold tracking-tight text-cyan-400">Resto</span>
                    <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-cyan-300 uppercase">
                      PILOT
                    </span>
                  </div>
                </div>

                <div className="flex h-20 items-center justify-center bg-[#12141d]/90 px-3 transition-colors hover:bg-[#181b27]">
                  <div className="flex items-center gap-2">
                    <img src="/l.webp" alt="BluNet" className="h-5 w-auto object-contain" />
                    <span className="text-sm font-extrabold tracking-tight text-white">
                      BluNet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTH FORM MATCHING REFERENCE IMAGE */}
        <div className="flex min-h-[720px] items-center justify-center bg-white rounded-2xl px-6 py-12 sm:px-10 lg:min-h-0 lg:px-14 xl:px-20 text-slate-900 shadow-sm">
          <AuthForm />
        </div>

      </div>
    </section>
  );
}

function ImageTile({
  src,
  active,
  className,
}: {
  src: string;
  active: boolean;
  className: string;
}) {
  return (
    <div
      className={`${className} relative overflow-visible rounded-xl ${active ? "z-10" : "z-0"}`}
    >
      <img
        src={src}
        alt="BluNet Workplace Visual"
        className={`h-full w-full rounded-xl object-cover transition-opacity duration-700 ${active ? "opacity-100" : "opacity-35"}`}
      />
      <FocusCorners active={active} />
    </div>
  );
}

function FocusCorners({ active }: { active: boolean }) {
  const baseClass = `pointer-events-none absolute h-4 w-4 border-blue-400 transition-all duration-500 ease-out ${active ? "translate-x-0 translate-y-0 opacity-100" : "opacity-0"}`;

  return (
    <>
      <div
        className={`${baseClass} -left-2 -top-2 border-l-2 border-t-2 ${active ? "" : "-translate-x-2 -translate-y-2"}`}
      />
      <div
        className={`${baseClass} -right-2 -top-2 border-r-2 border-t-2 ${active ? "" : "translate-x-2 -translate-y-2"}`}
      />
      <div
        className={`${baseClass} -bottom-2 -left-2 border-b-2 border-l-2 ${active ? "" : "-translate-x-2 translate-y-2"}`}
      />
      <div
        className={`${baseClass} -bottom-2 -right-2 border-b-2 border-r-2 ${active ? "" : "translate-x-2 translate-y-2"}`}
      />
    </>
  );
}

function AuthForm() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { employeeId, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        const role = res.data.data.user.role;
        if (role === "ADMIN") navigate("/admin");
        else if (role === "MARKETING_HEAD") navigate("/marketing");
        else if (role === "FOUNDER") navigate("/founder");
        else navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Invalid Employee ID or password.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (id: string, pass: string) => {
    setEmployeeId(id);
    setPassword(pass);
  };

  return (
    <div className="mx-auto w-full max-w-[420px] text-left">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Don't have an account?{" "}
          <span className="font-semibold text-blue-600 cursor-pointer hover:underline">
            Contact Administrator
          </span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Fields matching reference UI */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            ID
          </label>
          <input
            type="text"
            required
            placeholder="Enter your ID (e.g. admin, EMP1022, MA1011)"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 pr-11 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Black Pill Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-3 bg-black hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-sm text-base transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-7 flex items-center gap-4 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="font-medium text-slate-500">Quick Test Sign In</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Quick Test Accounts styled as rounded outline cards */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <button
          type="button"
          onClick={() => fillDemo("admin", "admin123")}
          className="flex flex-col items-start p-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <span className="font-bold text-slate-900">Admin</span>
          <span className="text-[11px] text-slate-400 font-mono">admin</span>
        </button>

        <button
          type="button"
          onClick={() => fillDemo("MA1011", "Password#1234")}
          className="flex flex-col items-start p-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <span className="font-bold text-slate-900">Mkt Head 1</span>
          <span className="text-[11px] text-slate-400 font-mono">MA1011</span>
        </button>

        <button
          type="button"
          onClick={() => fillDemo("AN1012", "Password#4321")}
          className="flex flex-col items-start p-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <span className="font-bold text-slate-900">Mkt Head 2</span>
          <span className="text-[11px] text-slate-400 font-mono">AN1012</span>
        </button>

        <button
          type="button"
          onClick={() => fillDemo("EMP1022", "Punith#214")}
          className="flex flex-col items-start p-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <span className="font-bold text-slate-900">Employee</span>
          <span className="text-[11px] text-slate-400 font-mono">EMP1022</span>
        </button>
      </div>
    </div>
  );
}
