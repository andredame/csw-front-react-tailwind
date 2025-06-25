"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ImprovedModal from "@/components/improved-modal"
import api from "../src/services/api"
import { useAuth } from "@/providers/auth-provider"
import Navbar from "./navbar"

const TurmasPage = () => {
  const [turmas, setTurmas] = useState<any[]>([])
  const [disciplinas, setDisciplinas] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showLinkAlunoModal, setShowLinkAlunoModal] = useState(false)
  const [showLinkProfessorModal, setShowLinkProfessorModal] = useState(false)
  const [editingTurma, setEditingTurma] = useState<any | null>(null)
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedTurmaId, setExpandedTurmaId] = useState<number | null>(null)

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

  const { user } = useAuth()
  const isCoordenador = user?.roles?.includes("COORDENADOR")
  const isAdmin = user?.roles?.includes("ADMIN")
  const isProfessor = user?.roles?.includes("PROFESSOR")
  const shouldShowProfessorColumn = isCoordenador || isAdmin || !isProfessor

  const toggleTurmaExpansion = (turmaId: number) => {
    setExpandedTurmaId(expandedTurmaId === turmaId ? null : turmaId)
  }

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      let turmasResponse
      if (user?.id && isProfessor) {
        turmasResponse = await api.get(`/api/turmas/professor/${user.id}`)
      } else {
        turmasResponse = await api.get("/api/turmas")
      }

      const [disciplinasResponse, usersResponse] = await Promise.all([
        api.get("/api/disciplinas"),
        api.get("/api/users"),
      ])

      setTurmas(turmasResponse.data)
      setDisciplinas(disciplinasResponse.data)
      const allUsers = usersResponse.data
      setProfessors(allUsers.filter((u: any) => 
        u.roles && u.roles.some((role: any) => role.name === "PROFESSOR")
      ))
      setAlunos(allUsers.filter((u: any) => u.roles && u.roles.some((role: any) => role.name === "ALUNO")))
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err)
      setError(err.response?.data?.message || "Falha ao carregar turmas. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const turmaData = {
        ...formData,
        disciplinaId: Number.parseInt(formData.disciplinaId),
        professorId: formData.professorId,
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
      setError(err.response?.data?.message || "Erro ao salvar turma. Verifique os dados e tente novamente.")
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
        setError(null)
        await api.delete(`/api/turmas/${id}`)
        loadData()
      } catch (err: any) {
        console.error("Erro ao excluir turma:", err)
        setError(err.response?.data?.message || "Erro ao excluir turma. Tente novamente mais tarde.")
      }
    }
  }

  const handleLinkAluno = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (!selectedTurmaId || !linkAlunoFormData.alunoId) {
        setError("Turma ou Aluno não selecionados.")
        return
      }
      await api.put(`/api/turmas/${selectedTurmaId}/alunos/${linkAlunoFormData.alunoId}`)
      setShowLinkAlunoModal(false)
      setLinkAlunoFormData({ alunoId: "" })
      loadData()
    } catch (err: any) {
      console.error("Erro ao vincular aluno:", err)
      setError(err.response?.data?.message || "Erro ao vincular aluno. Verifique o console para detalhes.")
    }
  }

  const handleLinkProfessor = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (!selectedTurmaId || !linkProfessorFormData.professorId) {
        setError("Turma ou Professor não selecionados.")
        return
      }
      await api.post(`/api/turmas/${selectedTurmaId}/professores/${linkProfessorFormData.professorId}`)
      setShowLinkProfessorModal(false)
      setLinkProfessorFormData({ professorId: "" })
      loadData()
    } catch (err: any) {
      console.error("Erro ao vincular professor:", err)
      setError(err.response?.data?.message || "Erro ao vincular professor. Tente novamente mais tarde.")
    }
  }

  const handleRemoveAluno = async (turmaId: number, alunoId: string) => {
    if (window.confirm("Tem certeza que deseja remover este aluno da turma?")) {
      try {
        setError(null)
        await api.delete(`/api/turmas/${turmaId}/alunos/${alunoId}`)
        loadData()
      } catch (err: any) {
        console.error("Erro ao remover aluno:", err)
        setError(err.response?.data?.message || "Erro ao remover aluno da turma.")
      }
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
    setError(null)
  }

  const openCreateModal = () => {
    setEditingTurma(null)
    resetForm()
    setShowModal(true)
  }

  const openLinkAlunoModal = (turmaId: number) => {
    setSelectedTurmaId(turmaId)
    setLinkAlunoFormData({ alunoId: "" })
    setError(null)
    setShowLinkAlunoModal(true)
  }

  const openLinkProfessorModal = (turmaId: number) => {
    setSelectedTurmaId(turmaId)
    setLinkProfessorFormData({ professorId: "" })
    setError(null)
    setShowLinkProfessorModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Carregando turmas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Turmas
            </h1>
            <p className="text-gray-600 text-lg">Gerencie as turmas, disciplinas e alunos</p>
          </div>
          {(isAdmin || isCoordenador) && (
            <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Nova Turma
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {turmas.length === 0 ? (
          <Card className="text-center p-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Nenhuma turma encontrada</CardTitle>
              <CardDescription className="text-gray-600 text-lg">Não há turmas cadastradas no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {(isAdmin || isCoordenador) && (
                <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Primeira Turma
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
                      <TableHead className="font-semibold text-gray-700"></TableHead>
                      <TableHead className="font-semibold text-gray-700">Número</TableHead>
                      <TableHead className="font-semibold text-gray-700">Disciplina</TableHead>
                      <TableHead className="font-semibold text-gray-700">Semestre</TableHead>
                      <TableHead className="font-semibold text-gray-700">Horário</TableHead>
                      <TableHead className="font-semibold text-gray-700">Vagas</TableHead>
                      <TableHead className="font-semibold text-gray-700">Alunos</TableHead>
                      {shouldShowProfessorColumn && <TableHead className="font-semibold text-gray-700">Professor</TableHead>}
                      {isCoordenador && <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {turmas.map((turma) => (
                      <React.Fragment key={turma.id}>
                        <TableRow 
                          onClick={() => toggleTurmaExpansion(turma.id)}
                          className={`${turmas.indexOf(turma) % 2 === 0 ? "bg-white" : "bg-gray-50/30"} cursor-pointer hover:bg-gray-100`}
                        >
                          <TableCell>
                            {expandedTurmaId === turma.id ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{turma.numero}</TableCell>
                          <TableCell className="text-gray-700">
                            <div>
                              <div className="font-medium">{turma.disciplina?.nome || "N/A"}</div>
                              <div className="text-xs text-gray-500">{turma.disciplina?.codigo}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {turma.semestre}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {turma.horario}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {turma.vagas} vagas
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {turma.alunos ? turma.alunos.length : 0} alunos
                            </Badge>
                          </TableCell>
                          {shouldShowProfessorColumn && (
                            <TableCell className="text-gray-700">
                              {turma.professor?.username || "N/A"}
                            </TableCell>
                          )}
                          {isCoordenador && (
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEdit(turma)
                                  }}
                                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(turma.id)
                                  }}
                                  className="hover:bg-red-600"
                                >
                                  Excluir
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openLinkAlunoModal(turma.id)
                                  }}
                                  className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                                >
                                  + Aluno
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openLinkProfessorModal(turma.id)
                                  }}
                                  className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                                >
                                  + Professor
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                        
                        {/* Linha expandida */}
                        {expandedTurmaId === turma.id && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={shouldShowProfessorColumn ? 9 : 8} className="p-0">
                              <div className="p-4 pl-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h3 className="font-semibold text-lg mb-3">Detalhes da Turma</h3>
                                    <div className="space-y-2">
                                      <p><span className="font-medium">Disciplina:</span> {turma.disciplina?.nome || "N/A"}</p>
                                      <p><span className="font-medium">Código:</span> {turma.disciplina?.codigo || "N/A"}</p>
                                      <p><span className="font-medium">Semestre:</span> {turma.semestre}</p>
                                      <p><span className="font-medium">Horário:</span> {turma.horario}</p>
                                      <p><span className="font-medium">Vagas:</span> {turma.vagas}</p>
                                      <p><span className="font-medium">Professor:</span> {turma.professor?.username || "N/A"}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between items-center mb-3">
                                      <h3 className="font-semibold text-lg">Alunos Matriculados</h3>
                                      {isCoordenador && (
                                        <Button 
                                          size="sm" 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openLinkAlunoModal(turma.id)
                                          }}
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Adicionar Aluno
                                        </Button>
                                      )}
                                    </div>
                                    
                                    {turma.alunos && turma.alunos.length > 0 ? (
                                      <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                          <TableHeader className="bg-gray-100">
                                            <TableRow>
                                              <TableHead>Nome</TableHead>
                                              <TableHead>Email</TableHead>
                                              {isCoordenador && <TableHead className="text-right">Ações</TableHead>}
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {turma.alunos.map((aluno: any) => (
                                              <TableRow key={aluno.id}>
                                                <TableCell>{aluno.username}</TableCell>
                                                <TableCell>{aluno.email}</TableCell>
                                                {isCoordenador && (
                                                  <TableCell className="text-right">
                                                    <Button
                                                      variant="destructive"
                                                      size="sm"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveAluno(turma.id, aluno.id)
                                                      }}
                                                    >
                                                      Remover
                                                    </Button>
                                                  </TableCell>
                                                )}
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-gray-500">
                                        Nenhum aluno matriculado nesta turma.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
       
        {/* Modais existentes (criar/editar turma, vincular aluno/professor) */}
        {/* Main CRUD Modal */}
        {(isAdmin || isCoordenador) && (
          <ImprovedModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingTurma ? "Editar Turma" : "Nova Turma"}
            size="lg"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && ( // Adicionado Alert para erros dentro do modal
                <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
                    Número *
                  </Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="Ex: T001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semestre" className="text-sm font-medium text-gray-700">
                    Semestre *
                  </Label>
                  <Input
                    id="semestre"
                    name="semestre"
                    value={formData.semestre}
                    onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                    placeholder="Ex: 2024.1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disciplinaId" className="text-sm font-medium text-gray-700">
                    Disciplina *
                  </Label>
                  <Select
                    value={formData.disciplinaId}
                    onValueChange={(value) => setFormData({ ...formData, disciplinaId: value })}
                    required
                  >
                    <SelectTrigger id="disciplinaId">
                      <SelectValue placeholder="Selecione uma disciplina" />
                    </SelectTrigger>
                    <SelectContent className="z-[100000]">
                      {disciplinas.map((disciplina) => (
                        <SelectItem key={disciplina.id} value={disciplina.id.toString()}>
                          {disciplina.nome} ({disciplina.codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professorId" className="text-sm font-medium text-gray-700">
                    Professor *
                  </Label>
                  <Select
                    value={formData.professorId}
                    onValueChange={(value) => setFormData({ ...formData, professorId: value })}
                    required
                  >
                    <SelectTrigger id="professorId">
                      <SelectValue placeholder="Selecione um professor" />
                    </SelectTrigger>
                    <SelectContent className="z-[100000]">
                      {professors.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.username} ({professor.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario" className="text-sm font-medium text-gray-700">
                    Horário *
                  </Label>
                  <Input
                    id="horario"
                    name="horario"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    placeholder="Ex: 08:00-10:00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vagas" className="text-sm font-medium text-gray-700">
                    Vagas *
                  </Label>
                  <Input
                    id="vagas"
                    name="vagas"
                    type="number"
                    value={formData.vagas}
                    onChange={(e) => setFormData({ ...formData, vagas: e.target.value })}
                    min="1"
                    placeholder="Ex: 30"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="px-6">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                  {editingTurma ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </ImprovedModal>
        )}

        {/* Link Student Modal */}
       {isCoordenador && (
        <ImprovedModal
          isOpen={showLinkAlunoModal}
          onClose={() => setShowLinkAlunoModal(false)}
          title="Vincular Aluno à Turma"
          size="md"
        >
          <form onSubmit={handleLinkAluno} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="alunoId" className="text-sm font-medium text-gray-700">
                Aluno *
              </Label>
              <Select
                value={linkAlunoFormData.alunoId}
                onValueChange={(value) => setLinkAlunoFormData({ ...linkAlunoFormData, alunoId: value })}
                required
              >
                <SelectTrigger id="alunoId">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent className="z-[100000]">
                  {alunos.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.username} ({aluno.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowLinkAlunoModal(false)} 
                className="px-6"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                Vincular
              </Button>
            </div>
          </form>
        </ImprovedModal>
      )}  
       
        {/* Link Professor Modal */}
        {isCoordenador && (
          <ImprovedModal
            isOpen={showLinkProfessorModal}
            onClose={() => setShowLinkProfessorModal(false)}
            title="Vincular Professor à Turma"
            size="md"
          >
            <form onSubmit={handleLinkProfessor} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="professorId" className="text-sm font-medium text-gray-700">
                  Professor *
                </Label>
                <Select
                  value={linkProfessorFormData.professorId}
                  onValueChange={(value) => setLinkProfessorFormData({ ...linkProfessorFormData, professorId: value })}
                  required
                >
                  <SelectTrigger id="professorId">
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                                  <SelectContent className="z-[100000]"> {/* Adicione esta classe */}

                    {professors.map((professor) => (
                      <SelectItem key={professor.id} value={professor.id}>
                        {professor.username} ({professor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLinkProfessorModal(false)}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                  Vincular
                </Button>
              </div>
            </form>
          </ImprovedModal>
        )}
        
      </div>
    </div>
  )
}

export default TurmasPage;