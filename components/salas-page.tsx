// SalasPage.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Building, ArrowLeft, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import ImprovedModal from "@/components/improved-modal"
import api from "../src/services/api" // IMPORTAÇÃO REAL
import { useAuth } from "@/providers/auth-provider" // IMPORTAÇÃO REAL
import Navbar from "./navbar" // Adicionei Navbar

interface SalasPageProps {
  predioId: string
}

const SalasPage = ({ predioId }: SalasPageProps) => {
  const [salas, setSalas] = useState<any[]>([])
  const [predio, setPredio] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSala, setEditingSala] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    capacidade: "",
    andar: "",
  })

  const { user } = useAuth()
  const isAdminOrCoordenador = user?.roles?.includes("ADMIN") || user?.roles?.includes("COORDENADOR") // Ações de CRUD para admin/coordenador

  useEffect(() => {
    if (predioId) {
      loadData()
    }
  }, [predioId]) // Use predioId como dependência

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [predioResponse, salasResponse] = await Promise.all([
        api.get(`/api/predios/${predioId}`), // API real para detalhes do prédio
        api.get(`/api/predios/${predioId}/salas`), // API real para salas do prédio
      ])

      setPredio(predioResponse.data)
      setSalas(salasResponse.data)
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err)
      setError(err.response?.data?.message || "Falha ao carregar dados de salas.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const salaData = {
        ...formData,
        capacidade: Number.parseInt(formData.capacidade),
        predioId: Number.parseInt(predioId), // Envia o ID do prédio ao criar/editar uma sala
      }

      if (editingSala) {
        await api.put(`/api/salas/${editingSala.id}`, salaData) // Rota corrigida para PUT de sala
      } else {
        await api.post("/api/salas", salaData) // Rota corrigida para POST de sala
      }

      setShowModal(false)
      setEditingSala(null)
      resetForm()
      loadData()
    } catch (err: any) {
      console.error("Erro ao salvar sala:", err)
      setError(err.response?.data?.message || "Falha ao salvar sala. Verifique os dados.")
    }
  }

  const handleEdit = (sala: any) => {
    setEditingSala(sala)
    setFormData({
      nome: sala.nome,
      capacidade: sala.capacidade.toString(),
      andar: sala.andar,
    })
    setShowModal(true)
  }

  const handleDelete = async (salaId: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta sala?")) {
      setError(null)
      try {
        await api.delete(`/api/salas/${salaId}`) // Rota corrigida para DELETE de sala
        loadData()
      } catch (err: any) {
        console.error("Erro ao excluir sala:", err)
        setError(err.response?.data?.message || "Falha ao excluir sala.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      capacidade: "",
      andar: "",
    })
  }

  const openCreateModal = () => {
    setEditingSala(null)
    resetForm()
    setShowModal(true)
  }

  const getCapacidadeBadge = (capacidade: number) => {
    let color = "bg-gray-100 text-gray-800"
    if (capacidade >= 40) {
      color = "bg-green-100 text-green-800"
    } else if (capacidade >= 25) {
      color = "bg-blue-100 text-blue-800"
    } else {
      color = "bg-orange-100 text-orange-800"
    }

    return (
      <Badge variant="secondary" className={color}>
        <Users className="w-3 h-3 mr-1" />
        {capacidade} pessoas
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Carregando salas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar /> {/* Adicionando Navbar */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <nav className="mb-4">
              <Link
                href="/predios"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Prédios
              </Link>
            </nav>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Salas - {predio?.nome || "Carregando..."}
            </h1>
            <p className="text-gray-600 text-lg">Gerencie as salas do prédio</p>
          </div>
          {isAdminOrCoordenador && ( // Botão "Nova Sala" visível apenas para ADMIN/COORDENADOR
            <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
              <Building className="mr-2 h-5 w-5" />
              Nova Sala
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {salas.length === 0 ? (
          <Card className="text-center p-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Nenhuma sala encontrada</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Clique em "Nova Sala" para adicionar a primeira sala.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAdminOrCoordenador && ( // Botão "Adicionar Primeira Sala" visível apenas para ADMIN/COORDENADOR
                <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                  <Building className="mr-2 h-5 w-5" />
                  Adicionar Primeira Sala
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
                      <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                      <TableHead className="font-semibold text-gray-700">Capacidade</TableHead>
                      <TableHead className="font-semibold text-gray-700">Andar</TableHead>
                      {isAdminOrCoordenador && <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salas.map((sala, index) => (
                      <TableRow key={sala.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                        <TableCell className="font-medium text-gray-900">{sala.nome}</TableCell>
                        <TableCell>{getCapacidadeBadge(sala.capacidade)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {sala.andar}
                          </Badge>
                        </TableCell>
                        {isAdminOrCoordenador && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(sala)}
                                className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
                              >
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(sala.id)}
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
          title={editingSala ? "Editar Sala" : "Nova Sala"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                Nome *
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Sala 101"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidade" className="text-sm font-medium text-gray-700">
                Capacidade *
              </Label>
              <Input
                id="capacidade"
                name="capacidade"
                type="number"
                value={formData.capacidade}
                onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                min="1"
                placeholder="Ex: 30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="andar" className="text-sm font-medium text-gray-700">
                Andar *
              </Label>
              <Input
                id="andar"
                name="andar"
                value={formData.andar}
                onChange={(e) => setFormData({ ...formData, andar: e.target.value })}
                placeholder="Ex: 1º andar"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="px-6">
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                {editingSala ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </ImprovedModal>
      </div>
    </div>
  )
}

export default SalasPage