"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import Modal from "../components/Modal"

const Predios = () => {
  const [predios, setPredios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPredio, setEditingPredio] = useState(null)
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
      const response = await api.get("/api/predios")
      setPredios(response.data)
    } catch (error) {
      console.error("Erro ao carregar prédios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPredio) {
        await api.put(`/api/predios/${editingPredio.id}`, formData)
      } else {
        await api.post("/api/predios", formData)
      }

      setShowModal(false)
      setEditingPredio(null)
      resetForm()
      loadPredios()
    } catch (error) {
      console.error("Erro ao salvar prédio:", error)
    }
  }

  const handleEdit = (predio) => {
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

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este prédio?")) {
      try {
        await api.delete(`/api/predios/${id}`)
        loadPredios()
      } catch (error) {
        console.error("Erro ao excluir prédio:", error)
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
      <div className="container">
        <div className="loading">
          <h3>Carregando prédios...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Prédios</h1>
        <div className="actions">
          <button onClick={openCreateModal} className="btn btn-primary">
            Novo Prédio
          </button>
        </div>
      </div>

      {predios.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum prédio encontrado</h3>
          <p>Clique em "Novo Prédio" para adicionar o primeiro prédio.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Endereço</th>
                <th>Cidade</th>
                <th>UF</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {predios.map((predio) => (
                <tr key={predio.id}>
                  <td>{predio.nome}</td>
                  <td>
                    {predio.rua}, {predio.numero}
                    {predio.complemento && ` - ${predio.complemento}`}
                  </td>
                  <td>{predio.cidade}</td>
                  <td>{predio.uf}</td>
                  <td>
                    <div className="actions">
                      <Link to={`/predios/${predio.id}/salas`} className="btn btn-secondary">
                        Salas
                      </Link>
                      <button onClick={() => handleEdit(predio)} className="btn btn-secondary">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(predio.id)} className="btn btn-danger">
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPredio ? "Editar Prédio" : "Novo Prédio"}
      >
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Rua</label>
              <input
                type="text"
                className="form-control"
                value={formData.rua}
                onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Número</label>
              <input
                type="text"
                className="form-control"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Complemento</label>
            <input
              type="text"
              className="form-control"
              value={formData.complemento}
              onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input
                type="text"
                className="form-control"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input
                type="text"
                className="form-control"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">UF</label>
              <input
                type="text"
                className="form-control"
                value={formData.uf}
                onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                maxLength="2"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">CEP</label>
              <input
                type="text"
                className="form-control"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPredio ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Predios
