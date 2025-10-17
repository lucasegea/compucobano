'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Package, Edit2, Trash2, Users } from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  const supabase = createClient()

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    try {
      setLoading(true)

      // Cargar categorías con conteo de productos
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select(`
          *,
          productos(count)
        `)
        .order('nombre')

      if (categoriasError) throw categoriasError

      console.log('Categorías cargadas:', categoriasData)
      setCategorias(categoriasData || [])
    } catch (error) {
      console.error('Error cargando categorías:', error)
      setMessage({
        type: 'error',
        text: 'Error al cargar las categorías'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      setMessage({
        type: 'error',
        text: 'El nombre de la categoría es obligatorio'
      })
      return
    }

    try {
      if (editingCategory) {
        // Actualizar categoría
        const response = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_category',
            data: {
              id: editingCategory.id,
              data: {
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim()
              }
            }
          })
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error)

        setMessage({
          type: 'success',
          text: 'Categoría actualizada correctamente'
        })
        setEditingCategory(null)
      } else {
        // Crear nueva categoría
        const response = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_category',
            data: {
              nombre: formData.nombre.trim(),
              descripcion: formData.descripcion.trim()
            }
          })
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error)

        setMessage({
          type: 'success',
          text: 'Categoría creada correctamente'
        })
        setShowAddForm(false)
      }

      setFormData({ nombre: '', descripcion: '' })
      loadCategorias()
    } catch (error) {
      console.error('Error:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Error al guardar la categoría'
      })
    }
  }

  const handleEdit = (categoria) => {
    setEditingCategory(categoria)
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (categoriaId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return
    }

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_category',
          data: { id: categoriaId }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      setMessage({
        type: 'success',
        text: 'Categoría eliminada correctamente'
      })
      loadCategorias()
    } catch (error) {
      console.error('Error eliminando categoría:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Error al eliminar la categoría'
      })
    }
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setShowAddForm(false)
    setFormData({ nombre: '', descripcion: '' })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p className="text-gray-600 mt-2">
            Organiza los productos de compuCobano por categorías
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Mensaje de estado */}
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulario de agregar/editar */}
      {showAddForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Laptops, Oficina, Escolar..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe el tipo de productos que incluye esta categoría..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCategory ? 'Actualizar' : 'Crear'} Categoría
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {categorias.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
            <p className="text-gray-600 mb-4">
              Comienza creando tu primera categoría para organizar los productos
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear Primera Categoría
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {categoria.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {categoria.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {categoria.productos?.[0]?.count || 0} productos
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {categoria.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(categoria)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar categoría"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(categoria.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar categoría"
                          disabled={categoria.productos?.[0]?.count > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categorías</p>
              <p className="text-2xl font-bold text-gray-900">{categorias.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">
                {categorias.reduce((total, cat) => total + (cat.productos?.[0]?.count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 text-orange-600 flex items-center justify-center">
              📊
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio por Categoría</p>
              <p className="text-2xl font-bold text-gray-900">
                {categorias.length > 0 
                  ? Math.round(categorias.reduce((total, cat) => total + (cat.productos?.[0]?.count || 0), 0) / categorias.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}