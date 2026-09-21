import React from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type Logo = {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div">;

export function LogoCloud({ className, ...props }: LogoCloudProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-2 py-3">
      <h2 className="mb-4 text-center font-medium text-xs sm:text-sm text-slate-300 tracking-tight">
        Our <span className="font-bold text-white">Products</span> & Workspaces
      </h2>

      <div
        className={cn(
          "relative grid grid-cols-2 sm:grid-cols-3 border border-slate-200 rounded-none overflow-hidden bg-white shadow-2xl",
          className
        )}
        {...props}
      >
        <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-full border-t border-slate-200" />

        {/* Cell 1: Workspace */}
        <LogoCard
          className="relative border-r border-b border-slate-200 bg-slate-100/90 hover:bg-slate-200/60 transition-colors"
          logo={{ alt: "Workspace Logo" }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
              </svg>
            </span>
            <span className="text-sm font-extrabold text-slate-900">Workspace</span>
          </div>
          <PlusIcon
            className="-right-[12px] -bottom-[12px] absolute z-10 size-5 text-slate-400"
            strokeWidth={1.5}
          />
        </LogoCard>

        {/* Cell 2: Employee Login */}
        <LogoCard
          className="relative border-b border-slate-200 sm:border-r bg-white hover:bg-slate-50 transition-colors"
          logo={{ alt: "Employee Login" }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-xs">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <span className="text-xs font-bold text-slate-900">Employee Login</span>
          </div>
        </LogoCard>

        {/* Cell 3: Marketing Head Login */}
        <LogoCard
          className="relative border-r border-b border-slate-200 bg-slate-100/90 hover:bg-slate-200/60 transition-colors"
          logo={{ alt: "Marketing Head" }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-200/80 shadow-xs">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <span className="text-xs font-bold text-slate-900">Marketing Head</span>
          </div>
          <PlusIcon
            className="-right-[12px] -bottom-[12px] absolute z-10 size-5 text-slate-400"
            strokeWidth={1.5}
          />
          <PlusIcon
            className="-bottom-[12px] -left-[12px] absolute z-10 hidden size-5 text-slate-400 sm:block"
            strokeWidth={1.5}
          />
        </LogoCard>

        {/* Cell 4: AgroFlow */}
        <LogoCard
          className="relative border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors sm:border-b-0 sm:border-r"
          logo={{ alt: "AgroFlow" }}
        >
          <div className="flex items-center gap-1 font-black text-base tracking-tight">
            <span className="text-amber-600">Agro</span>
            <span className="text-emerald-600">Flow</span>
          </div>
        </LogoCard>

        {/* Cell 5: RestoPilot */}
        <LogoCard
          className="relative border-r border-b border-slate-200 bg-slate-100/90 hover:bg-slate-200/60 transition-colors sm:border-b-0"
          logo={{ alt: "RestoPilot" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-slate-900">Resto</span>
            <span className="rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-cyan-800 uppercase border border-cyan-300">
              PILOT
            </span>
          </div>
          <PlusIcon
            className="-right-[12px] -bottom-[12px] absolute z-10 size-5 text-slate-400 sm:hidden"
            strokeWidth={1.5}
          />
        </LogoCard>

        {/* Cell 6: BluNet */}
        <LogoCard
          className="border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          logo={{ alt: "BluNet Workplace" }}
        >
          <div className="flex items-center gap-2 font-extrabold text-slate-900">
            <img src="/l.webp" alt="BluNet" className="h-6 w-auto object-contain" />
            <span className="text-sm font-extrabold text-slate-900">BluNet</span>
          </div>
        </LogoCard>

        <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-full border-b border-slate-200" />
      </div>
    </div>
  );
}

type LogoCardProps = React.ComponentProps<"div"> & {
  logo: Logo;
};

function LogoCard({ logo, className, children, ...props }: LogoCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center px-4 py-6 sm:p-7 transition-colors select-none",
        className
      )}
      {...props}
    >
      {logo.src ? (
        <img
          alt={logo.alt}
          className="pointer-events-none h-5 select-none"
          height={logo.height || "auto"}
          src={logo.src}
          width={logo.width || "auto"}
        />
      ) : null}
      {children}
    </div>
  );
}
