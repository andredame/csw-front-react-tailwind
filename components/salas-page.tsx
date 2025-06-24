"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link" // Use Next.js Link
import api from "../src/services/api" // Adjust path to your API service
import Modal from "../src/components/Modal" // Adjust path to your Modal component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "./navbar"

interface SalasPageProps {
  predioId: string // predioId will be passed as a prop from the dynamic route
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

  useEffect(() => {
    if (predioId) {
      loadData()
    }
  }, [predioId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [predioResponse, salasResponse] = await Promise.all([
        api.get(`/api/predios/${predioId}`),
        api.get(`/api/predios/${predioId}/salas`),
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
      }

      if (editingSala) {
        await api.put(`/api/predios/${predioId}/salas/${editingSala.id}`, salaData)
      } else {
        await api.post(`/api/predios/${predioId}/salas`, salaData)
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
        await api.delete(`/api/predios/${predioId}/salas/${salaId}`)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando salas...</p>
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
            <nav className="mb-2 text-sm text-muted-foreground">
              <Link href="/predios" className="hover:underline text-blue-600">
                ← Voltar para Prédios
              </Link>
            </nav>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-2">
              Salas - {predio?.nome || "Carregando..."}
            </h1>
            <p className="text-gray-600">Gerencie as salas do prédio</p>
          </div>
          <Button onClick={openCreateModal} className="sarc-button-primary">
            Nova Sala
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {salas.length === 0 ? (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>Nenhuma sala encontrada</CardTitle>
              <CardDescription>Clique em "Nova Sala" para adicionar a primeira sala.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={openCreateModal}>Adicionar Primeira Sala</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Andar</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salas.map((sala) => (
                    <TableRow key={sala.id}>
                      <TableCell className="font-medium">{sala.nome}</TableCell>
                      <TableCell>{sala.capacidade} pessoas</TableCell>
                      <TableCell>{sala.andar}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="secondary" size="sm" onClick={() => handleEdit(sala)}>
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(sala.id)}>
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

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSala ? "Editar Sala" : "Nova Sala"}>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="capacidade">Capacidade</Label>
              <Input
                id="capacidade"
                name="capacidade"
                type="number"
                value={formData.capacidade}
                onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="andar">Andar</Label>
              <Input
                id="andar"
                name="andar"
                value={formData.andar}
                onChange={(e) => setFormData({ ...formData, andar: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingSala ? "Atualizar" : "Criar"}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default SalasPage
