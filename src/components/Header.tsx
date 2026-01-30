
export function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
      <div className="container mx-auto flex items-center gap-3">
        <img 
          src="/logo.png" 
          alt="Vetline Logo" 
          className="h-16 w-auto object-contain"
        />
        <div className="border-l border-primary-foreground/20 pl-3">
          <p className="text-primary-foreground/80 text-sm">Sistema de Chamados</p>
        </div>
      </div>
    </header>
  );
}
