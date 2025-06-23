"use client"

import { useState, useEffect } from "react"
import api from "../src/services/api" // Adjust path to your API service
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const RecursosPage = () => {
  const [recursos, setRecursos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecursos()
  }, [])

  const loadRecursos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/api/recursos")
      setRecursos(response.data)
    } catch (err: any) {
      console.error("Erro ao carregar recursos:", err)
      setError(err.response?.data?.message || "Falha ao carregar recursos. Tente novamente.");
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let text = status;

    switch (status) {
      case "DISPONIVEL":
        variant = "default"; // or 'success' if you define a custom one
        text = "Disponível";
        break;
      case "EM_MANUTENCAO":
        variant = "destructive"; // or 'warning' if you define a custom one
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
        <p className="ml-2 text-lg text-gray-700">Carregando recursos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Recursos</h1>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {recursos.map((recurso) => (
                  <TableRow key={recurso.id}>
                    <TableCell className="font-medium">{recurso.id}</TableCell>
                    <TableCell>{recurso.tipoRecurso?.nome || "Tipo não informado"}</TableCell>
                    <TableCell>{getStatusBadge(recurso.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RecursosPage