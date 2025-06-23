import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/">Voltar ao Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
