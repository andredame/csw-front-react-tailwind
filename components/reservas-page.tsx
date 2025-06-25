// ReservasPage.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock } from "lucide-react"
import { useAuth } from "@/providers/auth-provider" // 👈 Adicione isso no topo

import { Alert, AlertDescription } from "@/components/ui/alert"
import ImprovedModal from "@/components/improved-modal"
import api from "../src/services/api" // IMPORTAÇÃO REAL
import Navbar from "./navbar" // Adicionei Navbar

const ReservasPage = () => {
  const [reservas, setReservas] = useState<any[]>([])
  const [aulas, setAulas] = useState<any[]>([])
  const [recursos, setRecursos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    aulaId: "",
    recursoId: "",
  })
  // REMOVIDO: const reservaData = { ... } aqui, pois é redundante
  // Periodos de aula (copiados do dashboard ou AulasPage para consistência)
  const periodosInfo: { [key: string]: { label: string; color: string } } = {
    AB: { label: "AB (Manhã)", color: "bg-blue-100 text-blue-800" },
    CD: { label: "CD (Manhã)", color: "bg-blue-100 text-blue-800" },
    JK: { label: "JK (Tarde)", color: "bg-orange-100 text-orange-800" },
    LM: { label: "LM (Tarde)", color: "bg-orange-100 text-orange-800" },
    NP: { label: "NP (Noite)", color: "bg-purple-100 text-purple-800" },
  }

const { user } = useAuth()
const isProfessor = user?.roles?.includes("PROFESSOR")

useEffect(() => {
  if (user) {
    loadData()
  }
}, [user])

const loadData = async () => {
  try {
    setLoading(true)
    setError(null)

    let reservasResponse
    if (user?.id && isProfessor) {
      reservasResponse = await api.get(`/api/reservas/professor/${user.id}`) // 👈 Rota específica
    } else {
      reservasResponse = await api.get("/api/reservas") // 👈 Rota geral
    }

    const [aulasResponse, recursosResponse] = await Promise.all([
      api.get("/api/aulas"),
      api.get("/api/recursos"),
    ])

    console.log("reservasResponse.data:", reservasResponse.data)


    setReservas(reservasResponse.data)
    setAulas(aulasResponse.data)
    setRecursos(recursosResponse.data)
  } catch (err: any) {
    console.error("Erro ao carregar dados:", err)
    setError(err.response?.data?.message || "Falha ao carregar reservas.")
  } finally {
    setLoading(false)
  }
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const reservaData = {
        aulaId: Number.parseInt(formData.aulaId),
        recursoId: Number.parseInt(formData.recursoId),
      }
      console.log("Dados do formulário:", formData); // Adicione esta linha
      console.log("Dados da reserva a enviar:", reservaData); // Adicione esta linha
      await api.post("/api/reservas", reservaData)

      setShowModal(false)
      resetForm()
      loadData()
    } catch (err: any) {
      console.error("Erro ao criar reserva:", err)
      // Ajuste a mensagem de erro para ser mais amigável com as exceções do backend
      setError(err.response?.data?.message || "Erro ao criar reserva. Verifique a disponibilidade ou dados.")
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja cancelar esta reserva?")) {
      setError(null)
      try {
        console.log("Cancelando reserva com ID:", id) // Adicione esta linha para depuração
        await api.delete(`/api/reservas/${id}`)
        loadData()
      } catch (err: any) {
        console.error("Erro ao cancelar reserva:", err)
        setError(err.response?.data?.message || "Falha ao cancelar reserva.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      aulaId: "",
      recursoId: "",
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    // Assumindo que o dateString vem no formato "YYYY-MM-DD" do backend (LocalDate.toString())
    // e queremos exibir como "DD/MM/YYYY"
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
    let text = status

    switch (status) {
      case "DISPONIVEL":
        variant = "default"
        text = "Disponível"
        break
      case "EM_MANUTENCAO":
        variant = "destructive"
        text = "Em Manutenção"
        break
      default:
        variant = "outline"
        break
    }

    return (
      <Badge
        variant={variant}
        className={
          status === "DISPONIVEL"
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : status === "EM_MANUTENCAO"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : ""
        }
      >
        {text}
      </Badge>
    )
  }

  const getPeriodoBadge = (periodo: string) => {
    const periodoInfo = periodosInfo[periodo] || { label: periodo, color: "bg-gray-100 text-gray-800" }

    return (
      <Badge variant="secondary" className={periodoInfo.color}>
        {periodoInfo.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Carregando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      <Navbar /> {/* Adicionando Navbar */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Minhas Reservas
            </h1>
            <p className="text-gray-600 text-lg">Gerencie suas reservas de recursos</p>
          </div>
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Nova Reserva
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {reservas.length === 0 ? (
          <Card className="text-center p-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Nenhuma reserva encontrada</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Clique em "Nova Reserva" para fazer sua primeira reserva de recurso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Criar Primeira Reserva
              </Button>
            </CardContent>
          </Card>
        ) : (

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80">
                      <TableHead className="font-semibold text-gray-700">Aula</TableHead>
                      <TableHead className="font-semibold text-gray-700">Data</TableHead>
                      <TableHead className="font-semibold text-gray-700">Período</TableHead>
                      <TableHead className="font-semibold text-gray-700">Recurso</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {reservas.map((reserva, index) => {
                    console.log("Renderizando reserva:", reserva) // 🔍 Verifique o que tem em cada reserva
                    return (
                      <TableRow key={reserva.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                        <TableCell>
                              {reserva.aula ? (
                                <div>
                                  <div className="font-medium text-gray-900">{reserva.aula.turma?.numero || "N/A"} - {reserva.aula.turma?.disciplina?.nome}</div>
                                  <div className="text-sm text-gray-500">
                                    {reserva.aula.sala?.nome || "Sala não informada"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </TableCell>
                          <TableCell className="text-gray-700">
                            {reserva.aula ? formatDate(reserva.aula.data) : "N/A"}
                          </TableCell>
                          <TableCell>{reserva.aula?.periodo && getPeriodoBadge(reserva.aula.periodo)}</TableCell>
                          <TableCell>
                            {reserva.recurso ? ( // Verifica se o objeto recurso está presente
                              <div>
                                <div className="font-medium text-gray-900">
                                  {reserva.recurso.tipoRecurso?.nome || "Recurso"}
                                </div>
                                <div className="text-sm text-gray-500">ID: {reserva.recurso.id}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{reserva.recurso?.status && getStatusBadge(reserva.recurso.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(reserva.id)}
                            className="hover:bg-red-600"
                          >
                            Cancelar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <ImprovedModal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Reserva" size="md">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="aulaId" className="text-sm font-medium text-gray-700">
                Aula *
              </Label>
              <Select
                value={formData.aulaId}
                onValueChange={(value) => setFormData({ ...formData, aulaId: value })}
                required
              >
                <SelectTrigger id="aulaId">
                  <SelectValue placeholder="Selecione uma aula" />
                </SelectTrigger>
                <SelectContent className="z-[100000]">
                  {aulas.map((aula) => (
                    <SelectItem key={aula.id} value={aula.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatDate(aula.data)} - {aula.turma?.numero || "Turma N/A"} - {aula.periodo} -{" "}
                          {aula.sala?.nome || "Sala N/A"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recursoId" className="text-sm font-medium text-gray-700">
                Recurso *
              </Label>
              <Select
                value={formData.recursoId}
                onValueChange={(value) => setFormData({ ...formData, recursoId: value })}
                required
              >
                <SelectTrigger id="recursoId">
                  <SelectValue placeholder="Selecione um recurso" />
                </SelectTrigger>
                <SelectContent className="z-[100000]">
                  {recursos
                    .filter((recurso) => recurso.status === "DISPONIVEL") // Filtra apenas recursos disponíveis
                    .map((recurso) => (
                      <SelectItem key={recurso.id} value={recurso.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>
                            {recurso.tipoRecurso?.nome || "Recurso"} (ID: {recurso.id})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="px-6">
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6">
                Criar Reserva
              </Button>
            </div>
          </form>
        </ImprovedModal>
      </div>
    </div>
  )
}

export default ReservasPage;