"use client"

import { useState, useEffect } from "react"
import api from "../src/services/api" // Adjust path to your API service
import Modal from "../src/components/Modal" // Adjust path to your Modal component
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ReservasPage = () => {
  const [reservas, setReservas] = useState<any[]>([])
  const [aulas, setAulas] = useState<any[]>([])
  const [recursos, setRecursos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id_aula: "",
    id_recurso: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [reservasResponse, aulasResponse, recursosResponse] = await Promise.all([
        api.get("/api/reservas"),
        api.get("/api/aulas"),
        api.get("/api/recursos"),
      ])

      setReservas(reservasResponse.data)
      setAulas(aulasResponse.data)
      setRecursos(recursosResponse.data)
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err)
      setError(err.response?.data?.message || "Falha ao carregar reservas e dados relacionados.");
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const reservaData = {
        id_aula: Number.parseInt(formData.id_aula),
        id_recurso: Number.parseInt(formData.id_recurso),
      }

      await api.post("/api/reservas", reservaData)

      setShowModal(false)
      resetForm()
      loadData()
    } catch (err: any) {
      console.error("Erro ao criar reserva:", err)
      setError(err.response?.data?.message || "Erro ao criar reserva. Verifique se o recurso está disponível para este horário.");
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja cancelar esta reserva?")) {
      setError(null)
      try {
        await api.delete(`/api/reservas/${id}`)
        loadData()
      } catch (err: any) {
        console.error("Erro ao cancelar reserva:", err)
        setError(err.response?.data?.message || "Falha ao cancelar reserva.");
      }
    }
  }

  const resetForm = () => {
    setFormData({
      id_aula: "",
      id_recurso: "",
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let text = status;

    switch (status) {
      case "DISPONIVEL":
        variant = "default";
        text = "Disponível";
        break;
      case "EM_MANUTENCAO":
        variant = "destructive";
        text = "Em Manutenção";
        break;
      default:
        variant = "outline";
        break;
    }

    return (
      <Badge variant={variant} className={
        status === "DISPONIVEL" ? "bg-green-100 text-green-800" :
        status === "EM_MANUTENCAO" ? "bg-yellow-100 text-yellow-800" : ""
      }>
        {text}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando reservas...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Reservas</h1>
        <Button onClick={openCreateModal}>
          Nova Reserva
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {reservas.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <CardTitle>Nenhuma reserva encontrada</CardTitle>
            <CardDescription>Clique em "Nova Reserva" para fazer sua primeira reserva de recurso.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openCreateModal}>
              Criar Primeira Reserva
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aula</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Status Recurso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservas.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell>
                      {reserva.aula ? (
                        <>
                          <div className="font-medium">{reserva.aula.turma?.numero || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">
                            {reserva.aula.sala?.nome || "Sala não informada"}
                          </div>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{reserva.aula ? formatDate(reserva.aula.data) : "N/A"}</TableCell>
                    <TableCell>
                      {reserva.aula?.periodo && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {reserva.aula.periodo}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {reserva.recurso ? (
                        <>
                          <div className="font-medium">{reserva.recurso.tipoRecurso?.nome || "Recurso"}</div>
                          <div className="text-xs text-muted-foreground">ID: {reserva.recurso.id}</div>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{reserva.recurso?.status && getStatusBadge(reserva.recurso.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(reserva.id)}>
                        Cancelar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Reserva">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="id_aula">Aula</Label>
            <Select
              value={formData.id_aula}
              onValueChange={(value) => setFormData({ ...formData, id_aula: value })}
              required
            >
              <SelectTrigger id="id_aula">
                <SelectValue placeholder="Selecione uma aula" />
              </SelectTrigger>
              <SelectContent>
                {aulas.map((aula) => (
                  <SelectItem key={aula.id} value={aula.id.toString()}>
                    {formatDate(aula.data)} - {aula.turma?.numero || "Turma N/A"} - {aula.periodo} - {aula.sala?.nome || "Sala N/A"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="id_recurso">Recurso</Label>
            <Select
              value={formData.id_recurso}
              onValueChange={(value) => setFormData({ ...formData, id_recurso: value })}
              required
            >
              <SelectTrigger id="id_recurso">
                <SelectValue placeholder="Selecione um recurso" />
              </SelectTrigger>
              <SelectContent>
                {recursos
                  .filter((recurso) => recurso.status === "DISPONIVEL")
                  .map((recurso) => (
                    <SelectItem key={recurso.id} value={recurso.id.toString()}>
                      {recurso.tipoRecurso?.nome || "Recurso"} (ID: {recurso.id})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Reserva
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ReservasPage