"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import Modal from "../components/Modal"

const Reservas = () => {
  const [reservas, setReservas] = useState([])
  const [aulas, setAulas] = useState([])
  const [recursos, setRecursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
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
      const [reservasResponse, aulasResponse, recursosResponse] = await Promise.all([
        api.get("/api/reservas"),
        api.get("/api/aulas"),
        api.get("/api/recursos"),
      ])

      setReservas(reservasResponse.data)
      setAulas(aulasResponse.data)
      setRecursos(recursosResponse.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const reservaData = {
        id_aula: Number.parseInt(formData.id_aula),
        id_recurso: Number.parseInt(formData.id_recurso),
      }

      await api.post("/api/reservas", reservaData)

      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Erro ao criar reserva:", error)
      alert("Erro ao criar reserva. Verifique se o recurso está disponível para este horário.")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja cancelar esta reserva?")) {
      try {
        await api.delete(`/api/reservas/${id}`)
        loadData()
      } catch (error) {
        console.error("Erro ao cancelar reserva:", error)
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

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("pt-BR")
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
          <h3>Carregando reservas...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Minhas Reservas</h1>
        <div className="actions">
          <button onClick={openCreateModal} className="btn btn-primary">
            Nova Reserva
          </button>
        </div>
      </div>

      {reservas.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhuma reserva encontrada</h3>
          <p>Clique em "Nova Reserva" para fazer sua primeira reserva de recurso.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Aula</th>
                <th>Data</th>
                <th>Período</th>
                <th>Recurso</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>
                    {reserva.aula ? (
                      <div>
                        <strong>{reserva.aula.turma?.numero || "N/A"}</strong>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {reserva.aula.sala?.nome || "Sala não informada"}
                        </div>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{reserva.aula ? formatDate(reserva.aula.data) : "N/A"}</td>
                  <td>{reserva.aula?.periodo && <span className="badge badge-info">{reserva.aula.periodo}</span>}</td>
                  <td>
                    {reserva.recurso ? (
                      <div>
                        <strong>{reserva.recurso.tipoRecurso?.nome || "Recurso"}</strong>
                        <div style={{ fontSize: "12px", color: "#666" }}>ID: {reserva.recurso.id}</div>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{reserva.recurso?.status && getStatusBadge(reserva.recurso.status)}</td>
                  <td>
                    <button onClick={() => handleDelete(reserva.id)} className="btn btn-danger">
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Reserva">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Aula</label>
            <select
              className="form-control"
              value={formData.id_aula}
              onChange={(e) => setFormData({ ...formData, id_aula: e.target.value })}
              required
            >
              <option value="">Selecione uma aula</option>
              {aulas.map((aula) => (
                <option key={aula.id} value={aula.id}>
                  {formatDate(aula.data)} - {aula.turma?.numero || "Turma N/A"} - {aula.periodo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Recurso</label>
            <select
              className="form-control"
              value={formData.id_recurso}
              onChange={(e) => setFormData({ ...formData, id_recurso: e.target.value })}
              required
            >
              <option value="">Selecione um recurso</option>
              {recursos
                .filter((recurso) => recurso.status === "DISPONIVEL")
                .map((recurso) => (
                  <option key={recurso.id} value={recurso.id}>
                    {recurso.tipoRecurso?.nome || "Recurso"} (ID: {recurso.id})
                  </option>
                ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Criar Reserva
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Reservas
