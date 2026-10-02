
export function Header() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex items-center">
        <img 
          src="/logo.png" 
          alt="Vetline" 
          className="h-9 w-auto object-contain transition-transform hover:scale-[1.02]"
        />
      </div>
      <div className="h-6 w-px bg-slate-200/80 hidden sm:block" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-slate-900 font-extrabold text-sm tracking-tight">Central de Ajuda</span>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-vetline-gradient-soft text-[#1f6a89] border border-[#82c341]/30">
            TI & Suporte
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium hidden sm:block">Vetline Brasil</span>
      </div>
    </div>
  );
}
