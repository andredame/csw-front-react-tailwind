import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4 wave-container relative">
      {/* Background Wave Patterns */}
      <div className="wave-background">
        <div className="wave-pattern wave-pattern-1"></div>
        <div className="wave-pattern wave-pattern-2"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Coat of Arms */}
        <div className="text-center mb-6">
          <div className="heraldic-emblem mx-auto floating">
            <Image
              src="/images/coat-of-arms.png"
              alt="SARC Coat of Arms"
              width={80}
              height={80}
              className="coat-of-arms"
            />
          </div>
        </div>

        <Card className="sarc-card backdrop-blur-sm bg-white/95 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Você não tem permissão para acessar esta página. Entre em contato com o administrador se acredita que isso
              é um erro.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="hover:bg-gray-50">
                <Link href="/">Voltar ao Dashboard</Link>
              </Button>
              <Button asChild className="sarc-button-primary">
                <Link href="/login">Fazer Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
