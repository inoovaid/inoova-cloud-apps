'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClients, formatBRL, formatDateBR } from '@/lib/hooks';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Search, Tag, ArrowUpDown, Plus, Pencil, Trash2 } from 'lucide-react';

type SortField = 'name' | 'totalSpent' | 'lastVisitAt' | 'totalVisits';
type SortDir = 'asc' | 'desc';

export function ClientList() {
  const { data, isLoading } = useClients();
  const { setSelectedClientId, setClientDialogOpen, setEditingClientId } = useAppStore();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('totalSpent');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const allTags = useMemo(() => {
    if (!data) return [];
    const tags = new Set<string>();
    data.forEach((c) => c.tags.forEach((t) => tags.add(t.name)));
    return Array.from(tags);
  }, [data]);

  const filteredClients = useMemo(() => {
    if (!data) return [];
    let result = [...data];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (tagFilter !== 'all') {
      result = result.filter((c) => c.tags.some((t) => t.name === tagFilter));
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [data, search, tagFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleNewClient = () => {
    setEditingClientId(null);
    setClientDialogOpen(true);
  };

  const handleEditClient = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    setEditingClientId(clientId);
    setClientDialogOpen(true);
  };

  const handleDeleteClient = async (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      const res = await fetch(`/api/clients?id=${clientId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-96 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">Clientes</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone..."
                  className="pl-8 h-9 w-full sm:w-[250px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[160px]">
                  <Tag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Filtrar tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-9" onClick={handleNewClient}>
                <Plus className="w-4 h-4 mr-1" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-7 px-1 text-xs font-medium" onClick={() => handleSort('name')}>
                      Nome <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-7 px-1 text-xs font-medium" onClick={() => handleSort('totalSpent')}>
                      Total Gasto <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <Button variant="ghost" size="sm" className="h-7 px-1 text-xs font-medium" onClick={() => handleSort('totalVisits')}>
                      Visitas <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Ticket Médio</TableHead>
                  <TableHead className="hidden md:table-cell">Última Visita</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <TableCell className="font-medium text-sm">{client.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{client.phone}</TableCell>
                    <TableCell className="text-sm font-medium">{formatBRL(client.totalSpent)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{client.totalVisits}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatBRL(client.avgTicket)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDateBR(client.lastVisitAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {client.tags.map((tag) => (
                          <Badge
                            key={tag.name}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleEditClient(e, client.id)}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => handleDeleteClient(e, client.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum cliente encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
