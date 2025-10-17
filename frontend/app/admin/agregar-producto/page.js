'use client'

import { useState, useEffect } from 'react'
import { Upload, Save, X, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AgregarProducto() {
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
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [errors, setErrors] = useState({})

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      
      console.log('Categorías cargadas:', data)
      setCategorias(data || [])
    } catch (error) {
      console.error('Error cargando categorías:', error)
      setMessage({
        type: 'error',
        text: 'Error al cargar las categorías. Verifica la conexión con la base de datos.'
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log('Campo cambiado:', name, 'Valor:', value, 'Tipo:', typeof value)
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'precio' ? parseFloat(value) || 0 : value
    }))
    
    if (name === 'categoria_id') {
      console.log('Categoría seleccionada:', value, 'Como entero:', parseInt(value))
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
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

    if (!formData.id.trim()) {
      newErrors.id = 'El ID del producto es obligatorio'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio'
    }

    if (!formData.categoria_id || formData.categoria_id === '' || formData.categoria_id === '0') {
      newErrors.categoria_id = 'Debes seleccionar una categoría válida'
    }

    console.log('Validación completa:', {
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

    setLoading(true)

    try {
      console.log('FormData completo antes de enviar:', formData)
      console.log('categoria_id en formData:', formData.categoria_id)
      console.log('categoria_id parseado:', parseInt(formData.categoria_id))
      
      // Validar que categoria_id sea un número válido
      const categoriaId = formData.categoria_id ? parseInt(formData.categoria_id) : null
      if (formData.categoria_id && (isNaN(categoriaId) || categoriaId <= 0)) {
        throw new Error('ID de categoría inválido')
      }
      
      const dataToSend = {
        id: formData.id.trim(),
        nombre: formData.nombre.trim(),
        categoria_id: categoriaId,
        descripcion: formData.descripcion.trim(),
        precio: formData.precio,
        stock: formData.stock,
        foto: formData.foto
      }
      
      console.log('Datos que se van a enviar:', dataToSend)
      
      // Usar API de admin en lugar de cliente directo
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_product',
          data: dataToSend
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el producto')
      }

      setMessage({
        type: 'success',
        text: '¡Producto agregado correctamente!'
      })

      // Limpiar formulario
      setFormData({
        id: '',
        nombre: '',
        categoria_id: '',
        descripcion: '',
        stock: 0,
        foto: []
      })
      setErrors({})

    } catch (error) {
      console.error('Error creando producto:', error)
      let errorMessage = 'Error al crear el producto'
      
      if (error.code === '23505') {
        errorMessage = 'Ya existe un producto con ese ID'
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agregar Producto</h1>
        <p className="text-gray-600 mt-2">
          Crea un nuevo producto para el catálogo de compuCobano
        </p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border p-6 space-y-6">
        {/* ID del Producto */}
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
            ID del Producto *
          </label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            placeholder="Ej: PROD-001"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.id ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.id && <p className="text-red-600 text-sm mt-1">{errors.id}</p>}
        </div>

        {/* Nombre del Producto */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Laptop Dell Inspiron 15"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.nombre ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            id="categoria_id"
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.categoria_id ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => {
              console.log('Renderizando categoría:', categoria.id, categoria.nombre)
              return (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              )
            })}
          </select>
          {errors.categoria_id && <p className="text-red-600 text-sm mt-1">{errors.categoria_id}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe las características del producto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Precio */}
        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
            Precio (USD)
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Stock */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
            Stock Inicial
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotos del Producto
          </label>
          
          {/* Input de archivo */}
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="foto-upload"
              disabled={uploading}
            />
            <label
              htmlFor="foto-upload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploading 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {uploading ? 'Subiendo...' : 'Haz clic para subir imágenes'}
              </span>
            </label>
          </div>

          {/* Preview de imágenes */}
          {formData.foto.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.foto.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
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
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                id: '',
                nombre: '',
                categoria_id: '',
                descripcion: '',
                stock: 0,
                foto: []
              })
              setErrors({})
              setMessage(null)
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  )
}