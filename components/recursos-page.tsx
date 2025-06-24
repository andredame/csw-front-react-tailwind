// RecursosPage.tsx
"use client"

import { useState, useEffect } from "react"
import api from "../src/services/api" // Adjust path to your API service
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, PlusCircle } from "lucide-react" // Importe PlusCircle para o botão de criar
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "./navbar"
import { Button } from "@/components/ui/button" // Importe Button
import Modal from "../src/components/Modal" // Importe seu componente Modal
import { Input } from "@/components/ui/input" // Importe Input
import { Label } from "@/components/ui/label" // Importe Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Importe Select components
import { useAuth } from "@/providers/auth-provider" // Importe useAuth

const RecursosPage = () => {
  const [recursos, setRecursos] = useState<any[]>([])
  const [tiposRecurso, setTiposRecurso] = useState<any[]>([]) // Novo estado para tipos de recurso
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false) // Estado para controlar o modal
  const [editingRecurso, setEditingRecurso] = useState<any | null>(null) // Estado para recurso em edição

  const { user } = useAuth() // Obtém informações do usuário logado
  const isAdmin = user?.roles?.includes("ADMIN") // Verifica se o usuário é ADMIN

  const [formData, setFormData] = useState({
    tipoRecursoId: "",
    status: "",
  })

  useEffect(() => {
    loadRecursos()
    loadTiposRecurso() // Carrega os tipos de recurso ao montar o componente
  }, [])

  const loadRecursos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/api/recursos")
      setRecursos(response.data)
    } catch (err: any) {
      console.error("Erro ao carregar recursos:", err)
      setError(err.response?.data?.message || "Falha ao carregar recursos. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const loadTiposRecurso = async () => {
    try {
      const response = await api.get("/api/tipo-recursos") // Assumindo esta rota para tipos de recurso
      setTiposRecurso(response.data)
    } catch (err: any) {
      console.error("Erro ao carregar tipos de recurso:", err)
      // Não define erro na tela principal, pois é um carregamento auxiliar
    }
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
            ? "bg-green-100 text-green-800"
            : status === "EM_MANUTENCAO"
              ? "bg-yellow-100 text-yellow-800"
              : ""
        }
      >
        {text}
      </Badge>
    )
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const recursoData = {
        tipoRecursoId: Number.parseInt(formData.tipoRecursoId), // Converter para número
        status: formData.status,
      }

      if (editingRecurso) {
        await api.put(`/api/recursos/${editingRecurso.id}`, recursoData)
      } else {
        await api.post("/api/recursos", recursoData)
      }

      setShowModal(false)
      setEditingRecurso(null)
      resetForm()
      loadRecursos() // Recarrega a lista de recursos
    } catch (err: any) {
      console.error("Erro ao salvar recurso:", err)
      setError(err.response?.data?.message || "Erro ao salvar recurso. Verifique os dados e tente novamente.")
    }
  }

  const handleEdit = (recurso: any) => {
    setEditingRecurso(recurso)
    setFormData({
      tipoRecursoId: recurso.tipoRecurso?.id?.toString() || "", // Preenche o ID do tipo de recurso
      status: recurso.status || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este recurso?")) {
      try {
        setError(null)
        await api.delete(`/api/recursos/${id}`)
        loadRecursos() // Recarrega a lista
      } catch (err: any) {
        console.error("Erro ao excluir recurso:", err)
        setError(err.response?.data?.message || "Erro ao excluir recurso. Tente novamente mais tarde.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      tipoRecursoId: "",
      status: "",
    })
    setError(null)
  }

  const openCreateModal = () => {
    setEditingRecurso(null)
    resetForm()
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando recursos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 wave-container relative">
      {/* Background Wave Patterns */}
      <div className="wave-background">
        <div className="wave-pattern wave-pattern-1"></div>
        <div className="wave-pattern wave-pattern-2"></div>
        <div className="wave-pattern wave-pattern-3"></div>
      </div>

      <Navbar />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-2">
              Recursos
            </h1>
            <p className="text-gray-600">Visualize os recursos disponíveis</p>
          </div>
          {isAdmin && ( // Botão "Novo Recurso" visível apenas para ADMIN
            <Button onClick={openCreateModal} className="sarc-button-primary">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Recurso
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recursos.length === 0 ? (
          <Card className="text-center p-8">
            <CardHeader>
              <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <CardTitle>Nenhum recurso encontrado</CardTitle>
              <CardDescription>Não há recursos cadastrados no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isAdmin && ( // Botão "Criar Primeiro Recurso" visível apenas para ADMIN
                <Button onClick={openCreateModal} className="sarc-button-primary">
                  Criar Primeiro Recurso
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Ações</TableHead>} {/* Coluna Ações visível apenas para ADMIN */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recursos.map((recurso) => (
                    <TableRow key={recurso.id}>
                      <TableCell className="font-medium">{recurso.id}</TableCell>
                      <TableCell>{recurso.tipoRecurso?.nome || "Tipo não informado"}</TableCell>
                      <TableCell>{getStatusBadge(recurso.status)}</TableCell>
                      {isAdmin && ( // Célula de Ações visível apenas para ADMIN
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(recurso)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(recurso.id)}
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
            </CardContent>
          </Card>
        )}

        {/* Modal de Criação/Edição de Recurso (visível apenas para ADMIN) */}
        {isAdmin && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingRecurso ? "Editar Recurso" : "Novo Recurso"}
          >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <Label htmlFor="tipoRecursoId">Tipo de Recurso</Label>
                <Select
                  value={formData.tipoRecursoId}
                  onValueChange={(value) => handleSelectChange("tipoRecursoId", value)}
                  required
                >
                  <SelectTrigger id="tipoRecursoId">
                    <SelectValue placeholder="Selecione o tipo de recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposRecurso.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                    <SelectItem value="EM_MANUTENCAO">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingRecurso ? "Atualizar" : "Criar"}</Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  )
}

export default RecursosPage