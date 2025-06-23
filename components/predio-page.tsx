"use client"

import { useState, useEffect } from "react"
import Link from "next/link" // Use Next.js Link for navigation
import api from "../src/services/api" // Adjust path to your API service if needed
import Modal from "../src/components/Modal" // Adjust path to your Modal component if needed
import { Button } from "@/components/ui/button" // Import Button from shadcn/ui
import { Input } from "@/components/ui/input" // Import Input from shadcn/ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Import Card components from shadcn/ui
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // Import Table components from shadcn/ui
import { Label } from "@/components/ui/label" // Import Label from shadcn/ui
import { Loader2 } from "lucide-react" // Import Loader2 icon for loading state
import { Alert, AlertDescription } from "@/components/ui/alert" // Import Alert for error display

const PrediosPage = () => {
  const [predios, setPredios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPredio, setEditingPredio] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null); // State to handle API errors
  const [formData, setFormData] = useState({
    nome: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  })

  useEffect(() => {
    loadPredios()
  }, [])

  const loadPredios = async () => {
    try {
      setLoading(true)
      setError(null); // Clear any previous errors
      const response = await api.get("/api/predios")
      setPredios(response.data)
    } catch (err: any) {
      console.error("Erro ao carregar prédios:", err)
      setError(err.response?.data?.message || "Falha ao carregar prédios. Tente novamente.");
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); // Clear any previous errors
    try {
      const predioData = {
        ...formData,
        // Assuming numero and cep might need to be numbers if your API expects them as such
        // If they are strings, remove the Number() conversion
        numero: formData.numero,
        cep: formData.cep,
      };

      if (editingPredio) {
        await api.put(`/api/predios/${editingPredio.id}`, predioData)
      } else {
        await api.post("/api/predios", predioData)
      }

      setShowModal(false)
      setEditingPredio(null)
      resetForm()
      loadPredios()
    } catch (err: any) {
      console.error("Erro ao salvar prédio:", err)
      setError(err.response?.data?.message || "Falha ao salvar prédio. Verifique os dados.");
    }
  }

  const handleEdit = (predio: any) => {
    setEditingPredio(predio)
    setFormData({
      nome: predio.nome,
      rua: predio.rua,
      numero: predio.numero,
      complemento: predio.complemento || "",
      bairro: predio.bairro,
      cidade: predio.cidade,
      uf: predio.uf,
      cep: predio.cep,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este prédio?")) {
      setError(null); // Clear any previous errors
      try {
        await api.delete(`/api/predios/${id}`)
        loadPredios()
      } catch (err: any) {
        console.error("Erro ao excluir prédio:", err)
        setError(err.response?.data?.message || "Falha ao excluir prédio. Pode haver salas associadas.");
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
    })
  }

  const openCreateModal = () => {
    setEditingPredio(null)
    resetForm()
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando prédios...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Prédios</h1>
        <Button onClick={openCreateModal}>
          Novo Prédio
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {predios.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Nenhum prédio encontrado</CardTitle>
            <CardDescription>Clique em "Novo Prédio" para adicionar o primeiro prédio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openCreateModal}>
              Adicionar Primeiro Prédio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predios.map((predio) => (
                  <TableRow key={predio.id}>
                    <TableCell className="font-medium">{predio.nome}</TableCell>
                    <TableCell>
                      {predio.rua}, {predio.numero}
                      {predio.complemento && ` - ${predio.complemento}`}
                    </TableCell>
                    <TableCell>{predio.cidade}</TableCell>
                    <TableCell>{predio.uf}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Assuming /predios/[predioId]/salas is the correct path for rooms */}
                        <Link href={`/predios/${predio.id}/salas`} passHref>
                          <Button variant="outline" size="sm">Salas</Button>
                        </Link>
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(predio)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(predio.id)}>
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPredio ? "Editar Prédio" : "Novo Prédio"}
      >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rua">Rua</Label>
              <Input
                id="rua"
                name="rua"
                value={formData.rua}
                onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                required
              />
            </div>
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
          </div>

          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              name="complemento"
              value={formData.complemento}
              onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="uf">UF</Label>
              <Input
                id="uf"
                name="uf"
                value={formData.uf}
                onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                maxLength={2}
                required
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingPredio ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PrediosPage;