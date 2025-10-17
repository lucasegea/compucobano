import { supabase } from './supabase.js'

// Fetch all categories with product counts
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select(`
        id, 
        nombre,
        productos(count)
      `)
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    // Mapear los datos de Supabase al formato esperado
    const categories = (data || []).map(category => ({
      id: category.id,
      name: category.nombre,
      product_count: category.productos?.[0]?.count || 0
    }))

    return categories
  } catch (error) {
    console.error('Error in getCategories:', error)
    return []
  }
}

// Fetch categories and return parent tree and map in one request
export async function getCategoryTree() {
  const { data, error } = await supabase
    .from('categorias')
    .select(`
      id, 
      nombre,
      productos(count)
    `)
    .order('nombre')

  if (error) {
    console.error('Error fetching category tree:', error)
    return { parents: [], byParent: new Map(), totalGlobal: 0 }
  }

  const rows = data || []
  // Como no tenemos parent_id, tratamos todas las categorías como padres
  const parents = rows.map(r => ({
    id: r.id,
    name: r.nombre,
    parentId: null,
    productCount: r.productos?.[0]?.count || 0
  }))
  
  const totalGlobal = parents.reduce((sum, r) => sum + Number(r.productCount || 0), 0)

  return { parents, byParent: new Map(), totalGlobal }
}

// Fetch products that belong to any of the provided category IDs
export async function getProductsByCategoryIds(ids = [], options = {}) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { products: [], totalCount: 0 }
  }

  const {
    searchTerm = '',
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 24
  } = options

  let query = supabase
    .from('productos')
    .select(`
      id,
      categoria_id,
      nombre,
      descripcion,
      precio,
      stock,
      foto
    `, { count: 'exact' })
    .in('categoria_id', ids)

  if (searchTerm) {
    query = query.ilike('nombre', `%${searchTerm}%`)
  }

  if (sortBy === 'price') {
    query = query.order('precio', { ascending: sortOrder === 'asc', nullsLast: true })
  } else if (sortBy === 'date') {
    query = query.order('id', { ascending: sortOrder === 'asc' })
  } else {
    query = query.order('nombre', { ascending: sortOrder === 'asc' })
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) {
    console.error('Error fetching products by category ids:', error)
    return { products: [], totalCount: 0 }
  }

  // Mapear los datos al formato esperado por el frontend
  const mappedProducts = (data || []).map(product => ({
    id: product.id,
    name: product.nombre,
    description: product.descripcion,
    category_id: product.categoria_id,
    stock: product.stock,
    image_url: product.foto,
    image_file_url: product.foto,
    final_price: product.precio || 0,
    price_raw: product.precio || 0,
    currency: 'USD'
  }))

  return { products: mappedProducts, totalCount: count || 0 }
}

// Get all products with pagination and filters
export async function getProducts(options = {}) {
  try {
    const { 
      categoryId = null, 
      searchTerm = '', 
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1, 
      limit = 24 
    } = options

    // Base query for fetching records with count
    let query = supabase
      .from('productos')
      .select(`
        id,
        categoria_id,
        nombre,
        descripcion,
        precio,
        stock,
        foto
      `, { count: 'exact' })

    // Category filter
    if (categoryId) {
      query = query.eq('categoria_id', categoryId)
    }

    // Search filter
    if (searchTerm) {
      query = query.ilike('nombre', `%${searchTerm}%`)
    }

    // Sorting
    if (sortBy === 'price') {
      query = query.order('precio', { ascending: sortOrder === 'asc', nullsLast: true })
    } else if (sortBy === 'date') {
      // Como no hay fecha, ordenamos por id
      query = query.order('id', { ascending: sortOrder === 'asc' })
    } else {
      query = query.order('nombre', { ascending: sortOrder === 'asc' })
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    // Apply pagination to query
    query = query.range(from, to)
    
    // Execute query
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching products:', error)
      return { products: [], totalCount: 0 }
    }

    // Mapear los datos al formato esperado por el frontend
    const mappedProducts = (data || []).map(product => ({
      id: product.id,
      name: product.nombre,
      description: product.descripcion,
      category_id: product.categoria_id,
      stock: product.stock,
      image_url: product.foto,
      image_file_url: product.foto,
      final_price: product.precio || 0,
      price_raw: product.precio || 0,
      currency: 'USD'
    }))

    return { 
      products: mappedProducts, 
      totalCount: count || 0 
    }
  } catch (error) {
    console.error('Error in getProducts:', error)
    return { products: [], totalCount: 0 }
  }
}

// Dummy functions to maintain compatibility
export async function getCuratedAllProductsMix() {
  return { products: [], totalCount: 0 }
}

export async function getCuratedAllProductsOrder() {
  return { products: [], totalCount: 0 }
}