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
    disciplinaId: "", // This might be redundant if turma.disciplina.id exists
    periodo: "JK",
  })

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
      setError(null)
      const [aulasResponse, turmasResponse] = await Promise.all([
        api.get("/api/aulas"),
        api.get("/api/turmas")
      ])

      setAulas(aulasResponse.data)
      setTurmas(turmasResponse.data)
      // Salas are loaded when the modal opens
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err)
      setError(err.response?.data?.message || "Falha ao carregar aulas e turmas.");
    } finally {
      setLoading(false)
    }
  }

  const loadSalas = async () => {
    try {
      setError(null)
      const response = await api.get("/api/predios")
      const predios = response.data

      const todasSalas: any[] = []
      for (const predio of predios) {
        try {
          const salasResponse = await api.get(`/api/predios/${predio.id}/salas`)
          todasSalas.push(...salasResponse.data.map((sala: any) => ({ ...sala, predioNome: predio.nome })))
        } catch (error) {
          console.error(`Erro ao carregar salas do prédio ${predio.id}:`, error)
        }
      }
      setSalas(todasSalas)
    } catch (err: any) {
      console.error("Erro ao carregar salas:", err)
      setError(err.response?.data?.message || "Falha ao carregar salas disponíveis.");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const aulaData = {
        ...formData,
        turmaId: Number.parseInt(formData.turmaId),
        salaId: Number.parseInt(formData.salaId),
        disciplinaId: formData.disciplinaId ? Number.parseInt(formData.disciplinaId) : null, // Handle optional disciplinaId
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
      setError(err.response?.data?.message || "Falha ao salvar aula. Verifique os dados.");
    }
  }

  const handleEdit = (aula: any) => {
    setEditingAula(aula)
    setFormData({
      data: aula.data,
      descricao: aula.descricao || "",
      turmaId: aula.turma?.id?.toString() || "",
      salaId: aula.sala?.id?.toString() || "",
      disciplinaId: aula.turma?.disciplina?.id?.toString() || "",
      periodo: aula.periodo || "JK",
    })
    loadSalas(); // Load salas when editing an aula
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
      setError(null)
      try {
        await api.delete(`/api/aulas/${id}`)
        loadData()
      } catch (err: any) {
        console.error("Erro ao excluir aula:", err)
        setError(err.response?.data?.message || "Falha ao excluir aula.");
      }
    }
  }

  const resetForm = () => {
    setFormData({
      data: "",
      descricao: "",
      turmaId: "",
      salaId: "",
      disciplinaId: "",
      periodo: "JK",
    })
  }

  const openCreateModal = () => {
    setEditingAula(null)
    resetForm()
    loadSalas() // Load salas when opening create modal
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString + "T00:00:00") // Assume YYYY-MM-DD format
    return date.toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando aulas...</p>
      </div>
    )
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
                    {turma.numero} - {turma.disciplina?.nome || `Disciplina ID: ${turma.disciplinaId}`}
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

          <div>
            <Label htmlFor="disciplinaId">Disciplina ID (Opcional)</Label>
            <Input
              id="disciplinaId"
              name="disciplinaId"
              type="number"
              value={formData.disciplinaId}
              onChange={(e) => setFormData({ ...formData, disciplinaId: e.target.value })}
              placeholder="Ex: 123"
            />
          </div>

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