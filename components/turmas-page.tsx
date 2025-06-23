"use client"

import { useState, useEffect } from "react"
import api from "../src/services/api" // Adjust path to your API service
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const TurmasPage = () => {
  const [turmas, setTurmas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTurmas()
  }, [])

  const loadTurmas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/api/turmas")
      setTurmas(response.data)
    } catch (err: any) {
      console.error("Erro ao carregar turmas:", err)
      setError(err.response?.data?.message || "Falha ao carregar turmas. Tente novamente.");
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-2 text-lg text-gray-700">Carregando turmas...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {turmas.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <CardTitle>Nenhuma turma encontrada</CardTitle>
            <CardDescription>Não há turmas cadastradas no sistema.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead>Alunos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmas.map((turma) => (
                  <TableRow key={turma.id}>
                    <TableCell className="font-medium">{turma.numero}</TableCell>
                    <TableCell>{turma.disciplinaId ? `Disciplina ID: ${turma.disciplinaId}` : "N/A"}</TableCell>
                    <TableCell>{turma.semestre}</TableCell>
                    <TableCell>{turma.horario}</TableCell>
                    <TableCell>{turma.vagas}</TableCell>
                    <TableCell>{turma.alunos ? turma.alunos.length : 0} alunos</TableCell>
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

export default TurmasPage