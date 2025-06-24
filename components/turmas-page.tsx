// turmas-page.tsx
"use client"

import { useState, useEffect } from "react"
import api from "../src/services/api" // Adjust path to your API service
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Modal from "../src/components/Modal" // Assuming Modal component is available
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/providers/auth-provider" // Import useAuth to get user info
import Navbar from "./navbar" // ADICIONADO: Importe o componente Navbar

const TurmasPage = () => {
  const [turmas, setTurmas] = useState<any[]>([])
  const [disciplinas, setDisciplinas] = useState<any[]>([]) // New state for disciplines
  const [professors, setProfessors] = useState<any[]>([]) // New state for professors
  const [alunos, setAlunos] = useState<any[]>([]) // New state for students (for linking)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false) // For main CRUD modal
  const [showLinkAlunoModal, setShowLinkAlunoModal] = useState(false) // For linking student modal
  const [showLinkProfessorModal, setShowLinkProfessorModal] = useState(false) // For linking professor modal
  const [editingTurma, setEditingTurma] = useState<any | null>(null)
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null) // For linking operations
  const [error, setError] = useState<string | null>(null); // State to handle API errors

  const [formData, setFormData] = useState({
    numero: "",
    disciplinaId: "",
    semestre: "",
    professorId: "",
    horario: "",
    vagas: "",
  })

  const [linkAlunoFormData, setLinkAlunoFormData] = useState({
    alunoId: "",
  })

  const [linkProfessorFormData, setLinkProfessorFormData] = useState({
    professorId: "",
  })

  const { user } = useAuth(); // Obter informações do usuário logado

  useEffect(() => {
    loadData()
  }, [user]) // Adicionar 'user' como dependência para recarregar quando o usuário mudar

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null) // Limpa erros anteriores
      
      let turmasResponse;
      // Se o usuário logado for um PROFESSOR, busca apenas as turmas dele
      if (user?.id && user?.roles?.includes('PROFESSOR') ) {
        console.log("Carregando turmas para o professor:", user.id);
        turmasResponse = await api.get(`/api/turmas/professor/${user.id}`); // Rota específica do professor
      } else {
        // Para ADMIN, COORDENADOR, ou outros, busca todas as turmas
        turmasResponse = await api.get("/api/turmas"); // Rota geral
      }

      const [disciplinasResponse, usersResponse] = await Promise.all([
        api.get("/api/disciplinas"),
        api.get("/api/users"),
      ])
      
      setTurmas(turmasResponse.data)
      setDisciplinas(disciplinasResponse.data)
      const allUsers = usersResponse.data;
      setProfessors(allUsers.filter((user: any) => user.roles && user.roles.includes('PROFESSOR')));
      setAlunos(allUsers.filter((user: any) => user.roles && user.roles.includes('ALUNO')));
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err)
      setError(err.response?.data?.message || "Falha ao carregar turmas. Tente novamente.");
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear previous errors
    try {
      const turmaData = {
        ...formData,
        disciplina: { id: Number.parseInt(formData.disciplinaId) }, // Send nested object
        professor: { id: formData.professorId }, // Send nested object
        vagas: Number.parseInt(formData.vagas),
      }

      if (editingTurma) {
        await api.put(`/api/turmas/${editingTurma.id}`, turmaData)
      } else {
        await api.post("/api/turmas", turmaData)
      }

      setShowModal(false)
      setEditingTurma(null)
      resetForm()
      loadData()
    } catch (err: any) {
      console.error("Erro ao salvar turma:", err)
      setError(err.response?.data?.message || "Erro ao salvar turma. Verifique os dados e tente novamente.");
    }
  }

  const handleEdit = (turma: any) => {
    setEditingTurma(turma)
    setFormData({
      numero: turma.numero,
      disciplinaId: turma.disciplina?.id?.toString() || "",
      semestre: turma.semestre,
      professorId: turma.professor?.id || "",
      horario: turma.horario,
      vagas: turma.vagas?.toString(),
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta turma?")) {
      try {
        setError(null) // Clear previous errors
        await api.delete(`/api/turmas/${id}`)
        loadData()
      } catch (err: any) {
        console.error("Erro ao excluir turma:", err)
        setError(err.response?.data?.message || "Erro ao excluir turma. Tente novamente mais tarde.");
      }
    }
  }

  const handleLinkAluno = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear previous errors
    try {
      if (!selectedTurmaId || !linkAlunoFormData.alunoId) {
        setError("Turma ou Aluno não selecionados.");
        return;
      }
      await api.post(`/api/turmas/${selectedTurmaId}/alunos/${linkAlunoFormData.alunoId}`)
      setShowLinkAlunoModal(false)
      setLinkAlunoFormData({ alunoId: "" })
      loadData()
    } catch (err: any) {
      console.error("Erro ao vincular aluno:", err)
      setError(err.response?.data?.message || "Erro ao vincular aluno. Tente novamente mais tarde.");
    }
  }

  const handleLinkProfessor = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear previous errors
    try {
      if (!selectedTurmaId || !linkProfessorFormData.professorId) {
        setError("Turma ou Professor não selecionados.");
        return;
      }
      await api.post(`/api/turmas/${selectedTurmaId}/professores/${linkProfessorFormData.professorId}`)
      setShowLinkProfessorModal(false)
      setLinkProfessorFormData({ professorId: "" })
      loadData()
    } catch (err: any) {
      console.error("Erro ao vincular professor:", err)
      setError(err.response?.data?.message || "Erro ao vincular professor. Tente novamente mais tarde.");
    }
  }

  const resetForm = () => {
    setFormData({
      numero: "",
      disciplinaId: "",
      semestre: "",
      professorId: "",
      horario: "",
      vagas: "",
    })
    setError(null); // Clear error on form reset
  }

  const openCreateModal = () => {
    setEditingTurma(null)
    resetForm()
    setShowModal(true)
  }

  const openLinkAlunoModal = (turmaId: number) => {
    setSelectedTurmaId(turmaId)
    setLinkAlunoFormData({ alunoId: "" })
    setError(null); // Clear error for this modal
    setShowLinkAlunoModal(true)
  }

  const openLinkProfessorModal = (turmaId: number) => {
    setSelectedTurmaId(turmaId)
    setLinkProfessorFormData({ professorId: "" })
    setError(null); // Clear error for this modal
    setShowLinkProfessorModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando turmas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6"> {/* Adicionado min-h-screen e bg-gray-50 p-6 para espaçamento e fundo */}
      <Navbar /> {/* ADICIONADO: Renderiza a Navbar aqui */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Turmas</h1>
            <p className="text-gray-600">Gerencie as turmas, disciplinas e alunos.</p>
          </div>
          <Button onClick={openCreateModal}>Nova Turma</Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {turmas.length === 0 ? (
          <Card className="text-center p-8">
            <CardHeader>
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <CardTitle>Nenhuma turma encontrada</CardTitle>
              <CardDescription>Não há turmas cadastradas no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button onClick={openCreateModal}>Criar Primeira Turma</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Disciplina</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Alunos</TableHead>
                    <TableHead>Professor</TableHead> {/* Added Professor column */}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turmas.map((turma) => (
                    <TableRow key={turma.id}>
                      <TableCell className="font-medium">{turma.numero}</TableCell>
                      <TableCell>{turma.disciplina?.nome || "N/A"}</TableCell> {/* Display discipline name */}
                      <TableCell>{turma.semestre}</TableCell>
                      <TableCell>{turma.horario}</TableCell>
                      <TableCell>{turma.vagas}</TableCell>
                      <TableCell>{turma.alunos ? turma.alunos.length : 0} alunos</TableCell>
                      <TableCell>{turma.professor?.username || "N/A"}</TableCell> {/* Display professor username */}
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(turma)}>
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(turma.id)}>
                            Excluir
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openLinkAlunoModal(turma.id)}>
                            Vincular Aluno
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openLinkProfessorModal(turma.id)}>
                            Vincular Professor
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

        {/* Main CRUD Modal for Turma */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTurma ? "Editar Turma" : "Nova Turma"}>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="disciplinaId">Disciplina</Label>
              <Select
                value={formData.disciplinaId}
                onValueChange={(value) => setFormData({ ...formData, disciplinaId: value })}
                required
              >
                <SelectTrigger id="disciplinaId">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((disciplina) => (
                    <SelectItem key={disciplina.id} value={disciplina.id.toString()}>
                      {disciplina.nome} ({disciplina.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="semestre">Semestre</Label>
              <Input
                id="semestre"
                name="semestre"
                value={formData.semestre}
                onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="professorId">Professor</Label>
              <Select
                value={formData.professorId}
                onValueChange={(value) => setFormData({ ...formData, professorId: value })}
                required
              >
                <SelectTrigger id="professorId">
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professors.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.username} ({professor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                name="horario"
                value={formData.horario}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="vagas">Vagas</Label>
              <Input
                id="vagas"
                name="vagas"
                type="number"
                value={formData.vagas}
                onChange={(e) => setFormData({ ...formData, vagas: e.target.value })}
                min="0"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTurma ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal for Linking Aluno */}
        <Modal isOpen={showLinkAlunoModal} onClose={() => setShowLinkAlunoModal(false)} title="Vincular Aluno à Turma">
          <form onSubmit={handleLinkAluno} className="p-4 space-y-4">
            <div>
              <Label htmlFor="alunoId">Aluno</Label>
              <Select
                value={linkAlunoFormData.alunoId}
                onValueChange={(value) => setLinkAlunoFormData({ ...linkAlunoFormData, alunoId: value })}
                required
              >
                <SelectTrigger id="alunoId">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.username} ({aluno.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setShowLinkAlunoModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Vincular
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal for Linking Professor */}
        <Modal isOpen={showLinkProfessorModal} onClose={() => setShowLinkProfessorModal(false)} title="Vincular Professor à Turma">
          <form onSubmit={handleLinkProfessor} className="p-4 space-y-4">
            <div>
              <Label htmlFor="professorId">Professor</Label>
              <Select
                value={linkProfessorFormData.professorId}
                onValueChange={(value) => setLinkProfessorFormData({ ...linkProfessorFormData, professorId: value })}
                required
              >
                <SelectTrigger id="professorId">
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professors.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.username} ({professor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setShowLinkProfessorModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Vincular
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}


export default TurmasPage;