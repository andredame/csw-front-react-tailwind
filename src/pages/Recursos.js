"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const Recursos = () => {
  const [recursos, setRecursos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecursos()
  }, [])

  const loadRecursos = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/recursos")
      setRecursos(response.data)
    } catch (error) {
      console.error("Erro ao carregar recursos:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      DISPONIVEL: { class: "badge-success", text: "Disponível" },
      EM_MANUTENCAO: { class: "badge-warning", text: "Em Manutenção" },
    }

    const statusInfo = statusMap[status] || { class: "badge-info", text: status }

    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h3>Carregando recursos...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Recursos</h1>
      </div>

      {recursos.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum recurso encontrado</h3>
          <p>Não há recursos cadastrados no sistema.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((recurso) => (
                <tr key={recurso.id}>
                  <td>{recurso.id}</td>
                  <td>{recurso.tipoRecurso?.nome || "Tipo não informado"}</td>
                  <td>{getStatusBadge(recurso.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Recursos
