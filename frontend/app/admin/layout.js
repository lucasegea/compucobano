import { Suspense } from 'react'
import Link from 'next/link'
import { Shield, Package, Plus, List, Settings, Home } from 'lucide-react'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Panel Administrativo - compuCobano
              </h1>
            </div>
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-4 w-4" />
              Volver al sitio
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <Link 
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors mb-4"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Gestión de Productos
              </div>
              
              <Link 
                href="/admin/productos"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <List className="h-4 w-4" />
                Lista de Productos
              </Link>
              
              <Link 
                href="/admin/agregar-producto"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Link>
              
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6">
                Configuración
              </div>
              
              <Link 
                href="/admin/categorias"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Package className="h-4 w-4" />
                Categorías
              </Link>
              
              <Link 
                href="/admin/configuracion"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}