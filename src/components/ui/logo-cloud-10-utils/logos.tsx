import React from "react";

export const Logo01 = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-bold tracking-tight text-white ${className}`}>
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
      </svg>
    </span>
    <span className="text-base font-extrabold text-white">Workspace</span>
  </div>
);

export const Logo02 = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </span>
    <span className="text-sm font-extrabold text-emerald-400">Employee Login</span>
  </div>
);

export const Logo03 = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </span>
    <span className="text-sm font-extrabold text-purple-300">Marketing Head</span>
  </div>
);

export const Logo04 = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-1 font-black text-lg tracking-tight ${className}`}>
    <span className="text-amber-500">Agro</span>
    <span className="text-emerald-400">Flow</span>
  </div>
);

export const Logo05 = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <span className="text-lg font-black tracking-tight text-cyan-400">Resto</span>
    <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-cyan-300 uppercase border border-cyan-500/30">
      PILOT
    </span>
  </div>
);

export const Logo06 = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-extrabold text-white ${className}`}>
    <img src="/l.webp" alt="BluNet" className="h-6 w-auto object-contain" />
    <span className="text-base font-extrabold text-white">BluNet</span>
  </div>
);
