import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Predios from "./pages/Predios"
import Salas from "./pages/Salas"
import Turmas from "./pages/Turmas"
import Aulas from "./pages/Aulas"
import Reservas from "./pages/Reservas"
import Recursos from "./pages/Recursos"
import ProtectedRoute from "./components/ProtectedRoute"
import "./App.css"

function App() {
  return (
    <Router>
        <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predios"
                element={
                  <ProtectedRoute roles={["ADMIN", "COORDENADOR"]}>
                    <Predios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predios/:predioId/salas"
                element={
                  <ProtectedRoute roles={["ADMIN", "COORDENADOR"]}>
                    <Salas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/turmas"
                element={
                  <ProtectedRoute roles={["PROFESSOR", "COORDENADOR"]}>
                    <Turmas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/aulas"
                element={
                  <ProtectedRoute roles={["PROFESSOR"]}>
                    <Aulas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservas"
                element={
                  <ProtectedRoute roles={["PROFESSOR"]}>
                    <Reservas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recursos"
                element={
                  <ProtectedRoute roles={["ADMIN", "COORDENADOR"]}>
                    <Recursos />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
    </AuthProvider> 
      </Router>
  )
}

export default App
