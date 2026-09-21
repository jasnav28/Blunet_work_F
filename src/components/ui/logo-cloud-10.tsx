import {
  Logo01,
  Logo02,
  Logo03,
  Logo04,
  Logo05,
  Logo06,
} from "./logo-cloud-10-utils/logos";
import { cn } from "../../lib/utils";

const LogoCloud = () => {
  return (
    <div className="px-2 py-4">
      <p className="text-balance text-center font-medium text-slate-400 text-xs sm:text-sm">
        Trusted by teams and companies around the world
      </p>
      <div className="relative mx-auto mt-6 max-w-4xl">
        <div
          className={cn(
            "grid grid-cols-2 place-items-center border border-slate-800 bg-[#0c0e15]/90 rounded-xl shadow-2xl backdrop-blur-md sm:grid-cols-3",
            "*:border-e *:border-b *:border-slate-800/80 *:nth-last-[2]:border-b-0 *:last:border-b-0 *:odd:bg-slate-900/40 max-sm:*:nth-[2n]:border-e-0 sm:*:nth-[3n]:border-e-0 sm:*:nth-last-[3]:border-b-0",
          )}
        >
          <div className="flex w-full items-center justify-center px-3 py-6 hover:bg-slate-800/30 transition-colors">
            <Logo01 className="h-7 sm:h-8" />
          </div>
          <div className="flex w-full items-center justify-center px-3 py-6 hover:bg-slate-800/30 transition-colors">
            <Logo02 className="h-7 sm:h-8" />
          </div>
          <div className="flex w-full items-center justify-center px-3 py-6 hover:bg-slate-800/30 transition-colors">
            <Logo03 className="h-7 sm:h-8" />
          </div>
          <div className="flex w-full items-center justify-center px-3 py-6 hover:bg-slate-800/30 transition-colors">
            <Logo04 className="h-7 sm:h-8" />
          </div>
          <div className="flex w-full items-center justify-center px-3 py-6 hover:bg-slate-800/30 transition-colors">
            <Logo05 className="h-7 sm:h-8" />
          </div>
          <div className="flex w-full items-center justify-center px-3 py-6 hover:bg-slate-800/30 transition-colors">
            <Logo06 className="h-7 sm:h-8" />
          </div>
        </div>

        <div className="mask-l-from-0 absolute top-0 left-0 w-6 -translate-x-full border-b border-dashed border-slate-700/60 sm:w-10" />
        <div className="mask-r-from-0 absolute top-0 right-0 w-6 translate-x-full border-b border-dashed border-slate-700/60 sm:w-10" />
        <div className="mask-l-from-0 absolute bottom-0 left-0 w-6 -translate-x-full border-b border-dashed border-slate-700/60 sm:w-10" />
        <div className="mask-r-from-0 absolute right-0 bottom-0 w-6 translate-x-full border-b border-dashed border-slate-700/60 sm:w-10" />
        <div className="mask-t-from-0 absolute top-0 left-0 h-6 -translate-y-full border-s border-dashed border-slate-700/60 sm:h-10" />
        <div className="mask-t-from-0 absolute top-0 right-0 h-6 -translate-y-full border-s border-dashed border-slate-700/60 sm:h-10" />
        <div className="mask-b-from-0 absolute bottom-0 left-0 h-6 translate-y-full border-s border-dashed border-slate-700/60 sm:h-10" />
        <div className="mask-b-from-0 absolute right-0 bottom-0 h-6 translate-y-full border-s border-dashed border-slate-700/60 sm:h-10" />
      </div>
    </div>
  );
};

export default LogoCloud;
