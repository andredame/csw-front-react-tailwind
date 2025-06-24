// AulasPage.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ImprovedModal from "@/components/improved-modal"
import api from "../src/services/api" // IMPORTAÇÃO REAL
import { useAuth } from "@/providers/auth-provider" // IMPORTAÇÃO REAL
import Navbar from "./navbar" // Importa o componente Navbar

const AulasPage = () => {
  const [aulas, setAulas] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [salas, setSalas] = useState<any[]>([]) // Estado para armazenar as salas
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAula, setEditingAula] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    data: "",
    descricao: "",
    turmaId: "",
    salaId: "",
    periodo: "JK",
  })

  const { user } = useAuth()
  const isProfessor = user?.roles?.includes("PROFESSOR")
  const isAdminOrCoordenador = user?.roles?.includes("ADMIN") || user?.roles?.includes("COORDENADOR")

  const periodos = [
    { value: "AB", label: "AB (Manhã)", color: "bg-blue-100 text-blue-800" },
    { value: "CD", label: "CD (Manhã)", color: "bg-blue-100 text-blue-800" },
    { value: "JK", label: "JK (Tarde)", color: "bg-orange-100 text-orange-800" },
    { value: "LM", label: "LM (Tarde)", color: "bg-orange-100 text-orange-800" },
    { value: "NP", label: "NP (Noite)", color: "bg-purple-100 text-purple-800" },
  ]

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      let aulasResponse;
      if (user?.id && isProfessor) {
        aulasResponse = await api.get(`/api/aulas/professor/${user.id}`);
      } else if (isAdminOrCoordenador) {
        aulasResponse = await api.get("/api/aulas");
      } else {
        aulasResponse = await api.get("/api/aulas");
      }

      const [turmasResponse, salasResponse] = await Promise.all([
        api.get("/api/turmas"),
        api.get("/api/salas"), // Chamada para a API real de salas
      ]);

      setAulas(aulasResponse.data)
      setTurmas(turmasResponse.data)
      setSalas(salasResponse.data) // As salas devem ser populadas aqui
      console.log("Salas carregadas:", salasResponse.data); // ADICIONE ESTA LINHA PARA DEPURAR
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err)
      setError(err.response?.data?.message || "Falha ao carregar aulas. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!user?.id) {
        setError("ID do usuário não disponível. Por favor, faça login novamente.")
        return
      }

      const aulaData = {
        data: formData.data,
        descricao: formData.descricao,
        turmaId: Number.parseInt(formData.turmaId),
        salaId: Number.parseInt(formData.salaId),
        periodo: formData.periodo,
      }

      if (editingAula) {
        await api.put(`/api/aulas/${editingAula.id}`, aulaData)
      } else {
        await api.post("/api/aulas", aulaData)
      }

      setShowModal(false)
      setEditingAula(null)
      resetForm()
      loadData()
    } catch (err: any) {
      console.error("Erro ao salvar aula:", err)
      setError(err.response?.data?.message || "Erro ao salvar aula. Verifique os dados e tente novamente.")
    }
  }

  const handleEdit = (aula: any) => {
    setEditingAula(aula)
    setFormData({
      data: aula.data,
      descricao: aula.descricao || "",
      turmaId: aula.turma?.id?.toString() || "",
      salaId: aula.sala?.id?.toString() || "",
      periodo: aula.periodo || "JK",
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
      try {
        setError(null)
        await api.delete(`/api/aulas/${id}`)
        loadData()
      } catch (err: any) {
        console.error("Erro ao excluir aula:", err)
        setError(err.response?.data?.message || "Erro ao excluir aula. Tente novamente mais tarde.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      data: "",
      descricao: "",
      turmaId: "",
      salaId: "",
      periodo: "JK",
    })
    setError(null)
  }

  const openCreateModal = () => {
    setEditingAula(null)
    resetForm()
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  const getPeriodoBadge = (periodo: string) => {
    const periodoInfo = periodos.find((p) => p.value === periodo)
    return (
      <Badge variant="secondary" className={periodoInfo?.color || "bg-gray-100 text-gray-800"}>
        {periodoInfo?.label || periodo}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="ml-2 text-lg text-gray-700">Carregando aulas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
              Minhas Aulas
            </h1>
            <p className="text-gray-600 text-lg">Gerencie suas aulas e horários</p>
          </div>
          {(isProfessor || isAdminOrCoordenador) && (
            <Button onClick={openCreateModal} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Nova Aula
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {aulas.length === 0 ? (
          <Card className="text-center p-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Nenhuma aula encontrada</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Clique em "Nova Aula" para agendar sua primeira aula.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(isProfessor || isAdminOrCoordenador) && (
                <Button onClick={openCreateModal} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Criar Primeira Aula
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80">
                      <TableHead className="font-semibold text-gray-700">Data</TableHead>
                      <TableHead className="font-semibold text-gray-700">Turma</TableHead>
                      <TableHead className="font-semibold text-gray-700">Sala</TableHead>
                      <TableHead className="font-semibold text-gray-700">Período</TableHead>
                      <TableHead className="font-semibold text-gray-700">Descrição</TableHead>
                      {(isProfessor || isAdminOrCoordenador) && <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aulas.map((aula, index) => (
                      <TableRow key={aula.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(aula.data)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {aula.turma ? (
                            <div>
                              <div className="font-medium text-gray-900">{aula.turma.numero}</div>
                              {aula.turma.disciplina && (
                                <div className="text-sm text-gray-500">{aula.turma.disciplina.nome}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {aula.sala ? (
                            <div>
                              <div className="font-medium text-gray-900">{aula.sala.nome}</div>
                              {aula.sala.predio && <div className="text-sm text-gray-500">{aula.sala.predio.nome}</div>}
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{getPeriodoBadge(aula.periodo)}</TableCell>
                        <TableCell className="text-gray-700 max-w-xs truncate">{aula.descricao || "-"}</TableCell>
                        {(isProfessor || isAdminOrCoordenador) && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(aula)}
                                className="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300"
                              >
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(aula.id)}
                                className="hover:bg-red-600"
                              >
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <ImprovedModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingAula ? "Editar Aula" : "Nova Aula"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-sm font-medium text-gray-700">
                  Data *
                </Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodo" className="text-sm font-medium text-gray-700">
                  Período *
                </Label>
                <Select
                  value={formData.periodo}
                  onValueChange={(value) => setFormData({ ...formData, periodo: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um período" />
                  </SelectTrigger>
                  <SelectContent className="z-[100000]">
                    {periodos.map((periodo) => (
                      <SelectItem key={periodo.value} value={periodo.value}>
                        {periodo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="turmaId" className="text-sm font-medium text-gray-700">
                  Turma *
                </Label>
                <Select
                  value={formData.turmaId}
                  onValueChange={(value) => setFormData({ ...formData, turmaId: value })}
                  required
                >
                  <SelectTrigger id="turmaId">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent className="z-[100000]">
                    {turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id.toString()}>
                        {turma.numero} - {turma.disciplina?.nome || "Sem disciplina"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaId" className="text-sm font-medium text-gray-700">
                  Sala *
                </Label>
                <Select
                  value={formData.salaId}
                  onValueChange={(value) => setFormData({ ...formData, salaId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sala" />
                  </SelectTrigger>
                  <SelectContent className="z-[100000]">
                    {salas.map((sala) => (
                      <SelectItem key={sala.id} value={sala.id.toString()}>
                        {sala.nome} - {sala.predio?.nome || "Prédio não informado"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
                Descrição (Opcional)
              </Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                placeholder="Descreva o conteúdo da aula..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="px-6">
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6">
                {editingAula ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </ImprovedModal>
      </div>
    </div>
  )
}

export default AulasPage