import { BookOpen, Award } from 'lucide-react';

export default function DegreeCerts() {
  return (
    <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
      <div className="bg-emerald-500/5 backdrop-blur-md border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] p-4 rounded-xl shadow-lg border-l-4 border-l-emerald-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-400 font-mono tracking-widest text-sm">BIO-SCAN PASSED: CREDENTIALS VERIFIED</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">100% VALID MATCH</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-2">
        {/* Education Card */}
        <div className="bg-[#12121e]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-emerald-500/40 hover:bg-[#1a1a2e] transition-all duration-300 group shadow-lg shadow-emerald-900/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-400 group-hover:bg-emerald-900/50 group-hover:text-emerald-300 transition-colors">
                <BookOpen size={24} />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-widest">PRIMARY ACADEMICS</span>
                <h3 className="text-base font-bold text-white tracking-widest font-mono mt-1 group-hover:text-emerald-400 transition-colors">Farook College</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 text-xs text-slate-300 font-mono">
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px]">PROGRAM</span>
                <span className="text-white mt-0.5">BSc in Computer Science</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px]">TIMELINE</span>
                <span className="text-emerald-400 mt-0.5">June 2023 – March 2026</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px]">CORE STUDIES REDACTED</span>
                <span className="text-white mt-0.5">Data Structures & Algorithms · DBMS · OS · Distributed Systems</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-emerald-500/10 text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              STATUS: VALIDATED
            </div>
          </div>
        </div>

        {/* Certifications Card */}
        <a 
          href="https://www.coursera.org/account/accomplishments/specialization/1NT0M98IZUEU"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#12121e]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-blue-500/40 hover:bg-[#1a1a2e] transition-all duration-300 group shadow-lg shadow-blue-900/10 flex flex-col justify-between cursor-pointer block"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-blue-400 group-hover:bg-blue-900/50 group-hover:text-blue-300 transition-colors">
                <Award size={24} />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-widest">AUTHORIZED CERTIFICATE</span>
                <h3 className="text-base font-bold text-white tracking-widest font-mono mt-1 group-hover:text-blue-400 transition-colors">Meta Front-End</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 text-xs text-slate-300 font-mono">
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px]">CREDENTIAL</span>
                <span className="text-white mt-0.5">Meta Front-End Developer</span>
              </div>
               <div className="flex flex-col">
                <span className="text-gray-500 text-[10px]">ISSUER AUTHORIZED</span>
                <span className="text-white mt-0.5">Coursera x Meta Platforms</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-[10px]">REGISTRATION ID</span>
                <span className="text-[#38FEDE] mt-0.5 group-hover:underline underline-offset-4 decoration-blue-500">1NT0M98IZUEU ↗</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-blue-500/10 text-[10px] text-blue-400 font-bold tracking-widest uppercase flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              AUTHENTIC CREDENTIAL LOGGED
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
