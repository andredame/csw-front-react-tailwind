"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../services/api"
import Modal from "../components/Modal"

const Salas = () => {
  const { predioId } = useParams()
  const [salas, setSalas] = useState([])
  const [predio, setPredio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSala, setEditingSala] = useState(null)
  const [formData, setFormData] = useState({
    nome: "",
    capacidade: "",
    andar: "",
  })

  useEffect(() => {
    loadData()
  }, [predioId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [predioResponse, salasResponse] = await Promise.all([
        api.get(`/api/predios/${predioId}`),
        api.get(`/api/predios/${predioId}/salas`),
      ])

      setPredio(predioResponse.data)
      setSalas(salasResponse.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
    } catch (error) {
      console.error("Erro ao salvar sala:", error)
    }
  }

  const handleEdit = (sala) => {
    setEditingSala(sala)
    setFormData({
      nome: sala.nome,
      capacidade: sala.capacidade.toString(),
      andar: sala.andar,
    })
    setShowModal(true)
  }

  const handleDelete = async (salaId) => {
    if (window.confirm("Tem certeza que deseja excluir esta sala?")) {
      try {
        await api.delete(`/api/predios/${predioId}/salas/${salaId}`)
        loadData()
      } catch (error) {
        console.error("Erro ao excluir sala:", error)
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
      <div className="container">
        <div className="loading">
          <h3>Carregando salas...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <nav style={{ marginBottom: "10px" }}>
            <Link to="/predios" className="nav-link">
              ← Voltar para Prédios
            </Link>
          </nav>
          <h1 className="page-title">Salas - {predio?.nome}</h1>
        </div>
        <div className="actions">
          <button onClick={openCreateModal} className="btn btn-primary">
            Nova Sala
          </button>
        </div>
      </div>

      {salas.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhuma sala encontrada</h3>
          <p>Clique em "Nova Sala" para adicionar a primeira sala.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Capacidade</th>
                <th>Andar</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {salas.map((sala) => (
                <tr key={sala.id}>
                  <td>{sala.nome}</td>
                  <td>{sala.capacidade} pessoas</td>
                  <td>{sala.andar}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => handleEdit(sala)} className="btn btn-secondary">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(sala.id)} className="btn btn-danger">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSala ? "Editar Sala" : "Nova Sala"}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Capacidade</label>
            <input
              type="number"
              className="form-control"
              value={formData.capacidade}
              onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Andar</label>
            <input
              type="text"
              className="form-control"
              value={formData.andar}
              onChange={(e) => setFormData({ ...formData, andar: e.target.value })}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSala ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Salas
