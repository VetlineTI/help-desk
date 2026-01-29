import { Stethoscope } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
      <div className="container mx-auto flex items-center gap-3">
        <div className="bg-primary-foreground/10 p-2 rounded-lg">
          <Stethoscope className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VetLine Brasil</h1>
          <p className="text-primary-foreground/80 text-sm">Sistema de Chamados</p>
        </div>
      </div>
    </header>
  );
}
