"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Search,
  Plus,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import Navbar from "./navbar"

interface Class {
  id: number
  numero: string
  semestre: string
  horario: string
  vagas: number
  disciplina: {
    id: number
    nome: string
    codigo: string
    cargaHoraria: number
  }
  professor: {
    id: string
    username: string
    email: string
  }
  alunos: Student[]
  aulas: Lesson[]
}

interface Student {
  id: string
  username: string
  email: string
  matricula?: string
}

interface Lesson {
  id: number
  data: string
  periodo: string
  sala: {
    id: number
    nome: string
    predio: {
      nome: string
    }
  }
  turma: {
    numero: string
  }
}

export default function ClassManagement() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState("")

  const isCoordinator = user?.roles?.includes("COORDENADOR") || user?.roles?.includes("ADMIN")

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load classes based on user role
      let classesResponse
      if (user?.roles?.includes("PROFESSOR")) {
        classesResponse = await fetch(`/api/turmas/professor/${user.id}`)
      } else {
        classesResponse = await fetch("/api/turmas")
      }

      if (!classesResponse.ok) {
        throw new Error("Failed to load classes")
      }

      const classesData = await classesResponse.json()
      setClasses(classesData)

      // Load all students for coordinators
      if (isCoordinator) {
        const studentsResponse = await fetch("/api/users?role=ALUNO")
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json()
          setStudents(studentsData)
        }
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load class information. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudentToClass = async () => {
    if (!selectedClass || !selectedStudentId) return

    try {
      const response = await fetch(`/api/turmas/${selectedClass.id}/alunos/${selectedStudentId}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to add student to class")
      }

      // Refresh data
      await loadData()

      // Update selected class
      const updatedClass = classes.find((c) => c.id === selectedClass.id)
      if (updatedClass) {
        setSelectedClass(updatedClass)
      }

      setShowAddStudentDialog(false)
      setSelectedStudentId("")
    } catch (err) {
      console.error("Error adding student:", err)
      setError("Failed to add student to class. Please try again.")
    }
  }

  const handleRemoveStudentFromClass = async (studentId: string) => {
    if (!selectedClass) return

    if (!confirm("Are you sure you want to remove this student from the class?")) return

    try {
      const response = await fetch(`/api/turmas/${selectedClass.id}/alunos/${studentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove student from class")
      }

      // Refresh data
      await loadData()

      // Update selected class
      const updatedClass = classes.find((c) => c.id === selectedClass.id)
      if (updatedClass) {
        setSelectedClass(updatedClass)
      }
    } catch (err) {
      console.error("Error removing student:", err)
      setError("Failed to remove student from class. Please try again.")
    }
  }

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.disciplina.codigo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSemester = selectedSemester === "all" || cls.semestre === selectedSemester

    return matchesSearch && matchesSemester
  })

  const availableStudents = students.filter(
    (student) => !selectedClass?.alunos.some((enrolled) => enrolled.id === student.id),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-700">Loading class information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            Class Management
          </h1>
          <p className="text-gray-600">View and manage class information, lessons, and enrolled students</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes List */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Classes
                </CardTitle>
                <CardDescription>Select a class to view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search classes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by semester" />
                    </SelectTrigger>
                                    <SelectContent className="z-[100000]"> {/* Adicione esta classe */}

                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="2024.1">2024.1</SelectItem>
                      <SelectItem value="2024.2">2024.2</SelectItem>
                      <SelectItem value="2025.1">2025.1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Classes List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredClasses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No classes found</p>
                    </div>
                  ) : (
                    filteredClasses.map((cls) => (
                      <Card
                        key={cls.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedClass?.id === cls.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedClass(cls)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{cls.numero}</h3>
                            <Badge variant="outline">{cls.semestre}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{cls.disciplina.nome}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {cls.alunos?.length || 0}/{cls.vagas}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cls.horario}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class Details */}
          <div className="lg:col-span-2">
            {selectedClass ? (
              <div className="space-y-6">
                {/* Class Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{selectedClass.numero}</CardTitle>
                        <CardDescription className="text-lg mt-1">{selectedClass.disciplina.nome}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {selectedClass.semestre}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Course Code:</span>
                          <span className="text-sm">{selectedClass.disciplina.codigo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Schedule:</span>
                          <span className="text-sm">{selectedClass.horario}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Workload:</span>
                          <span className="text-sm">{selectedClass.disciplina.cargaHoraria}h</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">Professor:</span>
                          <span className="text-sm">{selectedClass.professor?.username || "Not assigned"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium">Enrollment:</span>
                          <span className="text-sm">
                            {selectedClass.alunos?.length || 0} / {selectedClass.vagas} students
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs for Lessons and Students */}
                <Tabs defaultValue="lessons" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lessons">Lessons</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                  </TabsList>

                  {/* Lessons Tab */}
                  <TabsContent value="lessons">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Scheduled Lessons
                        </CardTitle>
                        <CardDescription>All lessons scheduled for this class</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedClass.aulas && selectedClass.aulas.length > 0 ? (
                          <div className="space-y-3">
                            {selectedClass.aulas
                              .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                              .map((lesson) => (
                                <Card key={lesson.id} className="border-l-4 border-l-blue-500">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-blue-600" />
                                          <span className="font-medium">
                                            {new Date(lesson.data + "T00:00:00").toLocaleDateString("en-US", {
                                              weekday: "long",
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-4 h-4 text-green-600" />
                                          <span className="text-sm">{lesson.periodo}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <MapPin className="w-4 h-4 text-red-600" />
                                          <span className="text-sm">
                                            {lesson.sala?.nome} - {lesson.sala?.predio?.nome}
                                          </span>
                                        </div>
                                      </div>
                                      <Badge variant="outline">{lesson.periodo}</Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No lessons scheduled</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Students Tab */}
                  <TabsContent value="students">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Enrolled Students
                            </CardTitle>
                            <CardDescription>Students enrolled in this class</CardDescription>
                          </div>
                          {isCoordinator && (
                            <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Student
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Student to Class</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="student-select">Select Student</Label>
                                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Choose a student" />
                                      </SelectTrigger>
                                                      <SelectContent className="z-[100000]"> {/* Adicione esta classe */}

                                        {availableStudents.map((student) => (
                                          <SelectItem key={student.id} value={student.id}>
                                            {student.username} ({student.email})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleAddStudentToClass} disabled={!selectedStudentId}>
                                      Add Student
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {selectedClass.alunos && selectedClass.alunos.length > 0 ? (
                          <div className="space-y-3">
                            {selectedClass.alunos.map((student) => (
                              <Card key={student.id} className="border-l-4 border-l-green-500">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium">{student.username}</h4>
                                      <p className="text-sm text-gray-600">{student.email}</p>
                                      {student.matricula && (
                                        <p className="text-xs text-gray-500">ID: {student.matricula}</p>
                                      )}
                                    </div>
                                    {isCoordinator && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveStudentFromClass(student.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No students enrolled</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Class</h3>
                  <p>Choose a class from the list to view detailed information</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
