'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Plus, BarChart3, Users } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalCategorias: 0,
    totalStock: 0,
    sinStock: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('/api/admin')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">
          Gestiona los productos y categorías de compuCobano
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalProductos}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categorías</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalCategorias}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalStock}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Plus className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sin Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.sinStock}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/admin/agregar-producto"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Agregar Producto</p>
              <p className="text-sm text-gray-600">Crear un nuevo producto</p>
            </div>
          </Link>

          <Link 
            href="/admin/categorias"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Gestionar Categorías</p>
              <p className="text-sm text-gray-600">Administrar categorías</p>
            </div>
          </Link>

          <Link 
            href="/admin/productos"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Ver Productos</p>
              <p className="text-sm text-gray-600">Lista completa</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Instrucciones de configuración */}
      {!loading && stats.totalCategorias === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-semibold text-amber-800 mb-2">¡Configuración inicial requerida!</h3>
          <p className="text-amber-700 mb-4">
            Para empezar a usar el panel administrativo, necesitas crear las tablas en Supabase:
          </p>
          <ol className="list-decimal list-inside text-amber-700 space-y-1 mb-4">
            <li>Ve al SQL Editor en tu proyecto de Supabase</li>
            <li>Ejecuta el contenido del archivo `supabase-init.sql`</li>
            <li>Crea el bucket "products" en Storage</li>
            <li>Recarga esta página</li>
          </ol>
          <Link 
            href="/admin/categorias"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            <Package className="h-4 w-4" />
            Crear primera categoría
          </Link>
        </div>
      )}
    </div>
  )
}