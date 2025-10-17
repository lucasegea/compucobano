'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Upload, X, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function EditarProductoPage({ params }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    categoria_id: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    foto: []
  })
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [errors, setErrors] = useState({})

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar producto
      const { data: producto, error: productoError } = await supabase
        .from('productos')
        .select('*')
        .eq('id', params.id)
        .single()

      if (productoError) throw productoError

      // Cargar categorías
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre')

      if (categoriasError) throw categoriasError

      console.log('Producto cargado:', producto)
      console.log('Categorías cargadas:', categoriasData)

      setFormData({
        id: producto.id,
        nombre: producto.nombre || '',
        categoria_id: producto.categoria_id?.toString() || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio || 0,
        stock: producto.stock || 0,
        foto: producto.foto || []
      })
      setCategorias(categoriasData || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      setMessage({
        type: 'error',
        text: 'Error al cargar el producto'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'precio' ? parseFloat(value) || 0 : value
    }))
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedUrls = []

    try {
      for (const file of files) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          throw new Error(`El archivo ${file.name} no es una imagen válida`)
        }

        // Validar tamaño (50MB máximo para plan gratuito)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} es muy grande (máximo 50MB)`)
        }

        // Generar nombre único para el archivo
        const fileExt = file.name.split('.').pop().toLowerCase()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `products/${fileName}`

        console.log('Subiendo archivo:', fileName, 'Tamaño:', file.size)

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Error de Storage:', error)
          throw new Error(`Error subiendo ${file.name}: ${error.message}`)
        }

        console.log('Archivo subido exitosamente:', data)

        // Obtener URL pública del archivo
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        if (!publicUrl) {
          throw new Error(`No se pudo obtener URL pública para ${file.name}`)
        }

        uploadedUrls.push(publicUrl)
      }

      setFormData(prev => ({
        ...prev,
        foto: [...prev.foto, ...uploadedUrls]
      }))

      setMessage({
        type: 'success',
        text: `${files.length} imagen(es) subida(s) correctamente`
      })

    } catch (error) {
      console.error('Error completo:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Error al subir las imágenes'
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      foto: prev.foto.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio'
    }

    if (!formData.categoria_id || formData.categoria_id === '' || formData.categoria_id === '0') {
      newErrors.categoria_id = 'Debes seleccionar una categoría válida'
    }

    console.log('Validación edición:', {
      categoria_id: formData.categoria_id,
      categoria_id_tipo: typeof formData.categoria_id,
      categoria_id_parseado: parseInt(formData.categoria_id),
      es_valido: !(!formData.categoria_id || formData.categoria_id === '' || formData.categoria_id === '0'),
      errors: newErrors
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Por favor, completa todos los campos obligatorios'
      })
      return
    }

    setSaving(true)

    try {
      console.log('Form data antes de enviar:', formData)
      console.log('Categoria ID seleccionado:', formData.categoria_id)
      console.log('Categoria ID como entero:', parseInt(formData.categoria_id))
      
      console.log('Enviando datos para actualizar:', {
        action: 'update_product',
        data: {
          id: params.id,
          data: {
            nombre: formData.nombre.trim(),
            categoria_id: parseInt(formData.categoria_id),
            descripcion: formData.descripcion.trim(),
            precio: formData.precio,
            stock: formData.stock,
            foto: formData.foto
          }
        }
      })

      // Usar API de admin para actualizar
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_product',
          data: {
            id: params.id,
            data: {
              nombre: formData.nombre.trim(),
              categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
              descripcion: formData.descripcion.trim(),
              precio: formData.precio,
              stock: formData.stock,
              foto: formData.foto
            }
          }
        })
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)

      if (!response.ok) {
        console.error('Error response:', result)
        throw new Error(result.error || `Error ${response.status}: ${response.statusText}`)
      }

      setMessage({
        type: 'success',
        text: '¡Producto actualizado correctamente!'
      })

      // Recargar los datos del producto para ver los cambios
      await loadData()

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/admin/productos')
      }, 2000)

    } catch (error) {
      console.error('Error actualizando producto:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Error al actualizar el producto'
      })
    } finally {
      setSaving(false)
    }
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
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/admin/productos"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
          <p className="text-gray-600 mt-2">
            Modifica la información del producto: {formData.id}
          </p>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Producto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID del Producto (Solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Producto
              </label>
              <input
                type="text"
                value={formData.id}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">El ID no se puede modificar</p>
            </div>

            {/* Nombre del Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Laptop Dell Inspiron 15"
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.categoria_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {errors.categoria_id && <p className="text-red-500 text-sm mt-1">{errors.categoria_id}</p>}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (USD)
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Inicial
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe las características principales del producto..."
            />
          </div>
        </div>

        {/* Fotos del Producto */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotos del Producto</h2>
          
          {/* Área de subida */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="foto-upload"
              disabled={uploading}
            />
            <label
              htmlFor="foto-upload"
              className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Haz clic para subir imágenes
                </>
              )}
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Puedes subir múltiples imágenes. Formatos: JPG, PNG, GIF (máx. 50MB c/u)
            </p>
          </div>

          {/* Preview de imágenes */}
          {formData.foto.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Imágenes actuales:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.foto.map((foto, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={foto}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </button>
          
          <Link
            href="/admin/productos"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}