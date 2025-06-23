"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import Modal from "../components/Modal"

const Aulas = () => {
  const [aulas, setAulas] = useState([])
  const [turmas, setTurmas] = useState([])
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAula, setEditingAula] = useState(null)
  const [formData, setFormData] = useState({
    data: "",
    descricao: "",
    turmaId: "",
    salaId: "",
    disciplinaId: "",
    periodo: "JK",
  })

  const periodos = [
    { value: "AB", label: "AB (Manhã)" },
    { value: "CD", label: "CD (Manhã)" },
    { value: "JK", label: "JK (Tarde)" },
    { value: "LM", label: "LM (Tarde)" },
    { value: "NP", label: "NP (Noite)" },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [aulasResponse, turmasResponse] = await Promise.all([api.get("/api/aulas"), api.get("/api/turmas")])

      setAulas(aulasResponse.data)
      setTurmas(turmasResponse.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSalas = async () => {
    try {
      const response = await api.get("/api/predios")
      const predios = response.data

      const todasSalas = []
      for (const predio of predios) {
        try {
          const salasResponse = await api.get(`/api/predios/${predio.id}/salas`)
          todasSalas.push(...salasResponse.data)
        } catch (error) {
          console.error(`Erro ao carregar salas do prédio ${predio.id}:`, error)
        }
      }

      setSalas(todasSalas)
    } catch (error) {
      console.error("Erro ao carregar salas:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const aulaData = {
        ...formData,
        turmaId: Number.parseInt(formData.turmaId),
        salaId: Number.parseInt(formData.salaId),
        disciplinaId: Number.parseInt(formData.disciplinaId),
      }

      if (editingAula) {
        await api.put(`/api/aulas/${editingAula.id}`, aulaData)
      } else {
        await api.post("/api/aulas", aulaData)
      }

      setShowModal(false)
      setEditingAula(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Erro ao salvar aula:", error)
    }
  }

  const handleEdit = (aula) => {
    setEditingAula(aula)
    setFormData({
      data: aula.data,
      descricao: aula.descricao || "",
      turmaId: aula.turma?.id?.toString() || "",
      salaId: aula.sala?.id?.toString() || "",
      disciplinaId: aula.turma?.disciplina?.id?.toString() || "",
      periodo: aula.periodo || "JK",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
      try {
        await api.delete(`/api/aulas/${id}`)
        loadData()
      } catch (error) {
        console.error("Erro ao excluir aula:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      data: "",
      descricao: "",
      turmaId: "",
      salaId: "",
      disciplinaId: "",
      periodo: "JK",
    })
  }

  const openCreateModal = () => {
    setEditingAula(null)
    resetForm()
    loadSalas()
    setShowModal(true)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900">Carregando aulas...</h3>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Aulas</h1>
            <p className="text-gray-600">Gerencie suas aulas e horários</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-sm"
          >
            Nova Aula
          </button>
        </div>

        {aulas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma aula encontrada</h3>
            <p className="text-gray-600 mb-6">Clique em "Nova Aula" para agendar sua primeira aula.</p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              Criar Primeira Aula
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Turma</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sala</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Período</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Descrição</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {aulas.map((aula) => (
                    <tr key={aula.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(aula.data)}</td>
                      <td className="px-6 py-4">
                        {aula.turma ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{aula.turma.numero}</div>
                            {aula.turma.disciplina && (
                              <div className="text-xs text-gray-500">{aula.turma.disciplina.nome}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {aula.sala ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{aula.sala.nome}</div>
                            {aula.sala.predio && <div className="text-xs text-gray-500">{aula.sala.predio.nome}</div>}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {aula.periodo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{aula.descricao || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(aula)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(aula.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-150"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAula ? "Editar Aula" : "Nova Aula"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.turmaId}
                onChange={(e) => setFormData({ ...formData, turmaId: e.target.value })}
                required
              >
                <option value="">Selecione uma turma</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.numero} - {turma.disciplinaId ? `Disciplina ${turma.disciplinaId}` : "Sem disciplina"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sala</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.salaId}
                onChange={(e) => setFormData({ ...formData, salaId: e.target.value })}
                required
              >
                <option value="">Selecione uma sala</option>
                {salas.map((sala) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.nome} - {sala.predio?.nome || "Prédio não informado"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disciplina ID</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.disciplinaId}
                onChange={(e) => setFormData({ ...formData, disciplinaId: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.periodo}
                onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                required
              >
                {periodos.map((periodo) => (
                  <option key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                {editingAula ? "Atualizar" : "Criar"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default Aulas
