"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const Turmas = () => {
  const [turmas, setTurmas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTurmas()
  }, [])

  const loadTurmas = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/turmas")
      setTurmas(response.data)
    } catch (error) {
      console.error("Erro ao carregar turmas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h3>Carregando turmas...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Turmas</h1>
      </div>

      {turmas.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhuma turma encontrada</h3>
          <p>Não há turmas cadastradas no sistema.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Disciplina</th>
                <th>Semestre</th>
                <th>Horário</th>
                <th>Vagas</th>
                <th>Alunos</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((turma) => (
                <tr key={turma.id}>
                  <td>{turma.numero}</td>
                  <td>{turma.disciplinaId ? <span>Disciplina ID: {turma.disciplinaId}</span> : "N/A"}</td>
                  <td>{turma.semestre}</td>
                  <td>{turma.horario}</td>
                  <td>{turma.vagas}</td>
                  <td>{turma.alunos ? turma.alunos.length : 0} alunos</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Turmas
