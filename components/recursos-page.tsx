// RecursosPage.tsx
"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, PlusCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "./navbar" // Adicionei Navbar
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImprovedModal from "@/components/improved-modal"
import api from "../src/services/api" // IMPORTAÇÃO REAL
import { useAuth } from "@/providers/auth-provider" // IMPORTAÇÃO REAL

const RecursosPage = () => {
  const [recursos, setRecursos] = useState<any[]>([])
  const [tiposRecurso, setTiposRecurso] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingRecurso, setEditingRecurso] = useState<any | null>(null)

  const { user } = useAuth()
  const isAdmin = user?.roles?.includes("ADMIN") // Verifica se o usuário é ADMIN

  const [formData, setFormData] = useState({
    tipoRecursoId: "",
    status: "",
  })

  useEffect(() => {
    loadRecursos()
    loadTiposRecurso()
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
      const response = await api.get("/api/tipo-recursos") // Rota real para tipos de recurso
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const recursoData = {
        tipoRecursoId: Number.parseInt(formData.tipoRecursoId),
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
      loadRecursos()
    } catch (err: any) {
      console.error("Erro ao salvar recurso:", err)
      setError(err.response?.data?.message || "Erro ao salvar recurso. Verifique os dados e tente novamente.")
    }
  }

  const handleEdit = (recurso: any) => {
    setEditingRecurso(recurso)
    setFormData({
      tipoRecursoId: recurso.tipoRecurso?.id?.toString() || "",
      status: recurso.status || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este recurso?")) {
      try {
        setError(null)
        await api.delete(`/api/recursos/${id}`)
        loadRecursos()
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="ml-2 text-lg text-gray-700">Carregando recursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar /> {/* Adicionando Navbar */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Recursos
            </h1>
            <p className="text-gray-600 text-lg">Visualize e gerencie os recursos disponíveis</p>
          </div>
          {isAdmin && (
            <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Novo Recurso
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {recursos.length === 0 ? (
          <Card className="text-center p-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Nenhum recurso encontrado</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Não há recursos cadastrados no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isAdmin && (
                <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Criar Primeiro Recurso
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
                      <TableHead className="font-semibold text-gray-700">ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      {isAdmin && <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recursos.map((recurso, index) => (
                      <TableRow key={recurso.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                        <TableCell className="font-medium text-gray-900">{recurso.id}</TableCell>
                        <TableCell className="text-gray-700">
                          {recurso.tipoRecurso?.nome || "Tipo não informado"}
                        </TableCell>
                        <TableCell>{getStatusBadge(recurso.status)}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(recurso)}
                                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                              >
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(recurso.id)}
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

        {isAdmin && (
          <ImprovedModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingRecurso ? "Editar Recurso" : "Novo Recurso"}
            size="md"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tipoRecursoId" className="text-sm font-medium text-gray-700">
                  Tipo de Recurso *
                </Label>
                <Select
                  value={formData.tipoRecursoId}
                  onValueChange={(value) => setFormData({ ...formData, tipoRecursoId: value })}
                  required
                >
                  <SelectTrigger id="tipoRecursoId" className="w-full">
                    <SelectValue placeholder="Selecione o tipo de recurso" />
                  </SelectTrigger>
                                  <SelectContent className="z-[100000]"> {/* Adicione esta classe */}

                    {tiposRecurso.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status *
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                                  <SelectContent className="z-[100000]"> {/* Adicione esta classe */}

                    <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                    <SelectItem value="EM_MANUTENCAO">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="px-6">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  {editingRecurso ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </ImprovedModal>
        )}
      </div>
    </div>
  )
}

export default RecursosPage