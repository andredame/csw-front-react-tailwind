// aulas-page.tsx
"use client"

import { useState, useEffect } from "react"
import api from "../src/services/api" // Adjust path to your API service
import Modal from "../src/components/Modal" // Adjust path to your Modal component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, Clock, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/providers/auth-provider" // Import useAuth to get user info

const AulasPage = () => {
  const [aulas, setAulas] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [salas, setSalas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAula, setEditingAula] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    data: "",
    descricao: "",
    turmaId: "",
    salaId: "",
    // REMOVIDO: disciplinaId não é mais necessário aqui
    periodo: "JK",
  })

  const { user } = useAuth() // Get user from auth context

  const periodos = [
    { value: "AB", label: "AB (Manhã)" },
    { value: "CD", label: "CD (Manhã)" },
    { value: "JK", label: "JK (Tarde)" },
    { value: "LM", label: "LM (Tarde)" },
    { value: "NP", label: "NP (Noite)" },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null); // Limpa erros anteriores
      let aulasResponse;
      // Se o usuário logado for um PROFESSOR e tiver um ID, busca apenas as aulas dele
      if (user?.id && user?.roles?.includes('PROFESSOR')) {
        
        aulasResponse = await api.get(`/api/aulas/professor/${user.id}`); // Busca aulas específicas do professor
      } else {
        // Para ADMIN, COORDENADOR ou ALUNO, busca todas as aulas (ou aulas relevantes, dependendo da lógica do backend para /api/aulas geral)
          aulasResponse = await api.get("/api/aulas");
      }
      
      const turmasResponse = await api.get("/api/turmas"); // Busca todas as turmas para o dropdown
      
      setAulas(aulasResponse.data);
      setTurmas(turmasResponse.data);
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setError(err.response?.data?.message || "Falha ao carregar aulas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const loadSalas = async () => {
    try {
      setError(null); // Clear previous errors
      const response = await api.get("/api/predios");
      const predios = response.data;

      const todasSalas: any[] = [];
      for (const predio of predios) {
        try {
          const salasResponse = await api.get(`/api/predios/${predio.id}/salas`);
          todasSalas.push(...salasResponse.data.map((sala: any) => ({ ...sala, predioNome: predio.nome })));
        } catch (err: any) {
          console.warn(`Erro ao carregar salas do prédio ${predio.id}:`, err.response?.data?.message || err.message);
          // Não lança erro aqui, apenas loga para falhas de prédio individual
        }
      }
      setSalas(todasSalas);
    } catch (err: any) {
      console.error("Erro ao carregar salas:", err);
      setError(err.response?.data?.message || "Falha ao carregar salas disponíveis.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores

    try {
      if (!user?.id) {
        setError("ID do usuário não disponível. Por favor, faça login novamente.");
        return;
      }

      // Backend espera AulaRequestDTO com turmaId, salaId, data, periodo, descricao.
      // disciplinaId é inferido da turma no backend.
      const aulaData = {
        data: formData.data, // YYYY-MM-DD string do input type="date"
        descricao: formData.descricao,
        turmaId: Number.parseInt(formData.turmaId),
        salaId: Number.parseInt(formData.salaId),
        periodo: formData.periodo,
      };

      if (editingAula) {
        await api.put(`/api/aulas/${editingAula.id}`, aulaData);
      } else {
        await api.post("/api/aulas", aulaData); // Controller lida com a passagem de professorId do contexto
      }

      setShowModal(false);
      setEditingAula(null);
      resetForm();
      loadData(); // Recarrega dados após operação bem-sucedida
    } catch (err: any) {
      console.error("Erro ao salvar aula:", err);
      setError(err.response?.data?.message || "Erro ao salvar aula. Verifique os dados e tente novamente.");
    }
  };

  const handleEdit = (aula: any) => {
    setEditingAula(aula);
    setFormData({
      data: aula.data, // LocalDate vem como string YYYY-MM-DD
      descricao: aula.descricao || "",
      turmaId: aula.turma?.id?.toString() || "",
      salaId: aula.sala?.id?.toString() || "",
      // REMOVIDO: disciplinaId não é mais necessário aqui
      periodo: aula.periodo || "JK",
    });
    loadSalas(); // Carrega salas ao abrir modal de edição
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
      try {
        setError(null); // Limpa erros anteriores
        await api.delete(`/api/aulas/${id}`);
        loadData();
      } catch (err: any) {
        console.error("Erro ao excluir aula:", err);
        setError(err.response?.data?.message || "Erro ao excluir aula. Tente novamente mais tarde.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      data: "",
      descricao: "",
      turmaId: "",
      salaId: "",
      // REMOVIDO: disciplinaId não é mais necessário aqui
      periodo: "JK",
    });
    setError(null); // Limpa erro ao resetar formulário
  };

  const openCreateModal = () => {
    setEditingAula(null);
    resetForm();
    loadSalas(); // Carrega salas ao abrir modal de criação
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando aulas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Aulas</h1>
        <Button onClick={openCreateModal}>
          Nova Aula
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {aulas.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <CardTitle>Nenhuma aula encontrada</CardTitle>
            <CardDescription>Clique em "Nova Aula" para agendar sua primeira aula.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openCreateModal}>
              Criar Primeira Aula
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aulas.map((aula) => (
                  <TableRow key={aula.id}>
                    <TableCell>{formatDate(aula.data)}</TableCell>
                    <TableCell>
                      {aula.turma ? (
                        <>
                          <div className="font-medium">{aula.turma.numero}</div>
                          {aula.turma.disciplina && (
                            <div className="text-xs text-muted-foreground">{aula.turma.disciplina.nome}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {aula.sala ? (
                        <>
                          <div className="font-medium">{aula.sala.nome}</div>
                          {aula.sala.predio && <div className="text-xs text-muted-foreground">{aula.sala.predio.nome}</div>}
                        </>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {periodos.find(p => p.value === aula.periodo)?.label || aula.periodo}
                      </Badge>
                    </TableCell>
                    <TableCell>{aula.descricao || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(aula)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(aula.id)}>
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAula ? "Editar Aula" : "Nova Aula"}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              name="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="turmaId">Turma</Label>
            <Select
              value={formData.turmaId}
              onValueChange={(value) => setFormData({ ...formData, turmaId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id.toString()}>
                    {turma.numero} - {turma.disciplina?.nome || "Sem disciplina"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="salaId">Sala</Label>
            <Select
              value={formData.salaId}
              onValueChange={(value) => setFormData({ ...formData, salaId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sala" />
              </SelectTrigger>
              <SelectContent>
                {salas.map((sala) => (
                  <SelectItem key={sala.id} value={sala.id.toString()}>
                    {sala.nome} - {sala.predio?.nome || sala.predioNome || "Prédio não informado"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* REMOVIDO: Campo de Disciplina ID */}
          {/* <div>
            <Label htmlFor="disciplinaId">Disciplina ID (Opcional)</Label>
            <Input
              id="disciplinaId"
              name="disciplinaId"
              type="number"
              value={formData.disciplinaId}
              onChange={(e) => setFormData({ ...formData, disciplinaId: e.target.value })}
              placeholder="Ex: 123"
            />
          </div> */}

          <div>
            <Label htmlFor="periodo">Período</Label>
            <Select
              value={formData.periodo}
              onValueChange={(value) => setFormData({ ...formData, periodo: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                {periodos.map((periodo) => (
                  <SelectItem key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição (Opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingAula ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AulasPage