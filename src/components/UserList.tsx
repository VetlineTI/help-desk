import { useState, useMemo } from 'react';
import { useSupabaseProfiles, Profile } from '@/hooks/useSupabaseProfiles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export function UserList() {
  const { profiles, isLoading, updateRole } = useSupabaseProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleRoleChange = async (userId: string, newRole: Profile['role']) => {
    try {
      await updateRole(userId, newRole);
      toast.success('Cargo atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar cargo: ' + error.message);
    }
  };

  const getRoleBadge = (role: Profile['role']) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-700 border-red-200 uppercase text-[10px]">Administrador</Badge>;
      case 'analista':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 uppercase text-[10px]">Analista</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[10px]">Usuário</Badge>;
    }
  };

  // Filtragem
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesEmail = profile.email.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
      return matchesEmail && matchesRole;
    });
  }, [profiles, searchTerm, roleFilter]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / pageSize));
  
  // Garantir que a página atual esteja no intervalo correto
  const validPage = Math.min(currentPage, totalPages);

  const paginatedProfiles = useMemo(() => {
    const startIndex = (validPage - 1) * pageSize;
    return filteredProfiles.slice(startIndex, startIndex + pageSize);
  }, [filteredProfiles, validPage, pageSize]);

  // Resetar página quando filtros mudarem
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const startRecord = filteredProfiles.length === 0 ? 0 : (validPage - 1) * pageSize + 1;
  const endRecord = Math.min(validPage * pageSize, filteredProfiles.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
              <Users className="h-5 w-5 text-primary" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription className="mt-1">
              Total de {profiles.length} usuário{profiles.length !== 1 ? 's' : ''} cadastrado{profiles.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Campo de Busca por Email */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filtrar por e-mail..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  title="Limpar filtro"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtro por Cargo */}
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs bg-white">
                <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Cargos</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
                <SelectItem value="analista">Analistas</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/30">
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo Atual</TableHead>
              <TableHead className="w-[200px]">Alterar Cargo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProfiles.length > 0 ? (
              paginatedProfiles.map((profile) => (
                <TableRow key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-700">{profile.email}</TableCell>
                  <TableCell>{getRoleBadge(profile.role)}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={profile.role}
                      onValueChange={(val) => handleRoleChange(profile.id, val as Profile['role'])}
                    >
                      <SelectTrigger className="w-full h-8 text-xs bg-white">
                        <SelectValue placeholder="Selecionar cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="analista">Analista</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">
                  {searchTerm || roleFilter !== 'all'
                    ? 'Nenhum usuário encontrado para os filtros aplicados.'
                    : 'Nenhum usuário cadastrado.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Barra de Paginação */}
        {filteredProfiles.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-slate-50/30 text-xs text-muted-foreground">
            {/* Informações e Itens por página */}
            <div className="flex items-center gap-3">
              <span>
                Mostrando <strong className="text-slate-700">{startRecord}</strong> a{' '}
                <strong className="text-slate-700">{endRecord}</strong> de{' '}
                <strong className="text-slate-700">{filteredProfiles.length}</strong> usuário{filteredProfiles.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-1.5 pl-2 border-l">
                <span>Por página:</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-7 w-16 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Controles de Navegação */}
            <div className="flex items-center gap-1.5">
              <span className="mr-2">
                Página <strong className="text-slate-700">{validPage}</strong> de{' '}
                <strong className="text-slate-700">{totalPages}</strong>
              </span>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-white"
                onClick={() => setCurrentPage(1)}
                disabled={validPage <= 1}
                title="Primeira página"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-white"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={validPage <= 1}
                title="Página anterior"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-white"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={validPage >= totalPages}
                title="Próxima página"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-white"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validPage >= totalPages}
                title="Última página"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
