
export function Header() {
  return (
    <div className="flex items-center gap-3">
      <img 
        src="/logo.png" 
        alt="Vetline Logo" 
        className="h-10 w-auto object-contain"
      />
      <div className="border-l border-slate-200 pl-3">
        <p className="text-slate-600 font-bold text-sm tracking-tight uppercase">Sistema de Chamados</p>
      </div>
    </div>
  );
}
