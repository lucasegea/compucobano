import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const supabase = getSupabaseAdmin()
  
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured' },
      { status: 500 }
    )
  }

  try {
    // Obtener estadísticas del dashboard
    const [productos, categorias, stockStats] = await Promise.all([
      supabase.from('productos').select('id', { count: 'exact', head: true }),
      supabase.from('categorias').select('id', { count: 'exact', head: true }),
      supabase.from('productos').select('stock')
    ])

    if (productos.error) throw productos.error
    if (categorias.error) throw categorias.error
    if (stockStats.error) throw stockStats.error

    const totalStock = stockStats.data?.reduce((sum, item) => sum + (item.stock || 0), 0) || 0
    const sinStock = stockStats.data?.filter(item => (item.stock || 0) === 0).length || 0

    return NextResponse.json({
      totalProductos: productos.count || 0,
      totalCategorias: categorias.count || 0,
      totalStock,
      sinStock
    })

  } catch (error) {
    console.error('Error en dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const supabase = getSupabaseAdmin()
  
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_product':
        const { data: newProduct, error: createError } = await supabase
          .from('productos')
          .insert([data])
          .select()

        if (createError) throw createError

        return NextResponse.json({
          success: true,
          data: newProduct[0]
        })

      case 'create_category':
        const { data: newCategory, error: categoryError } = await supabase
          .from('categorias')
          .insert([data])
          .select()

        if (categoryError) throw categoryError

        return NextResponse.json({
          success: true,
          data: newCategory[0]
        })

      case 'update_product':
        console.log('Datos recibidos para actualizar:', data)
        const { id: productId, data: updateData } = data
        console.log('ID del producto:', productId)
        console.log('Datos a actualizar:', updateData)
        
        const { data: updatedProduct, error: updateError } = await supabase
          .from('productos')
          .update(updateData)
          .eq('id', productId)
          .select()

        if (updateError) {
          console.error('Error al actualizar producto:', updateError)
          throw updateError
        }

        console.log('Producto actualizado exitosamente:', updatedProduct)
        return NextResponse.json({
          success: true,
          data: updatedProduct[0]
        })

      case 'update_category':
        const { id: categoryId, data: categoryUpdateData } = data
        const { data: updatedCategory, error: categoryUpdateError } = await supabase
          .from('categorias')
          .update(categoryUpdateData)
          .eq('id', categoryId)
          .select()

        if (categoryUpdateError) throw categoryUpdateError

        return NextResponse.json({
          success: true,
          data: updatedCategory[0]
        })

      case 'delete_category':
        const { id: deleteCategoryId } = data
        const { error: deleteCategoryError } = await supabase
          .from('categorias')
          .delete()
          .eq('id', deleteCategoryId)

        if (deleteCategoryError) throw deleteCategoryError

        return NextResponse.json({
          success: true,
          message: 'Categoría eliminada correctamente'
        })

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error completo en admin API:', error)
    console.error('Stack trace:', error.stack)
    
    let errorMessage = 'Error interno del servidor'
    let statusCode = 500

    if (error.code === '23505') {
      errorMessage = 'Ya existe un registro con ese identificador'
      statusCode = 409
    } else if (error.code === '23503') {
      errorMessage = 'Referencia inválida a otra tabla'
      statusCode = 400
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    )
  }
}