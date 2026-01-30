import { useState } from 'react';
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
import { useSupabaseProfiles, Profile } from '@/hooks/useSupabaseProfiles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, User, Hammer } from 'lucide-react';

export function UserManagement() {
  const { profiles, isLoading, updateRole } = useSupabaseProfiles();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: Profile['role']) => {
    setUpdatingId(userId);
    try {
      await updateRole(userId, newRole);
      toast.success('Permissão atualizada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar permissão: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-primary" />;
      case 'analista': return <Hammer className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge>Admin</Badge>;
      case 'analista': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 italic">Analista</Badge>;
      default: return <Badge variant="outline">Usuário</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Carregando usuários...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          Gerenciamento de Usuários
        </CardTitle>
        <CardDescription>
          Controle as permissões de acesso de todos os colaboradores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(profile.role)}
                    {getRoleBadge(profile.role)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    disabled={updatingId === profile.id}
                    value={profile.role}
                    onValueChange={(value: Profile['role']) => handleRoleChange(profile.id, value)}
                  >
                    <SelectTrigger className="w-[140px] ml-auto">
                      <SelectValue placeholder="Mudar Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="analista">Analista</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
