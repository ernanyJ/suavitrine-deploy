'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400" style={{ fontWeight: 900, letterSpacing: '-0.05em' }}>
            404
          </h1>
        </div>

        {/* Image */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <img
              src="/assets/not_found.png"
              alt="Loja não encontrada"
              className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl relative z-10"
            />
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse -z-0" style={{ transform: 'scale(1.5)' }} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Loja não encontrada
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          A loja que você está procurando não existe ou foi removida. 
          Verifique o endereço e tente novamente.
        </p>

        {/* Actions */}
        <div className="flex justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 dark:bg-purple-400 hover:bg-purple-700 dark:hover:bg-purple-500 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Voltar para o início
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

