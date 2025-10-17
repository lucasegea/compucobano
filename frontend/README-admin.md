# Panel Administrativo compuCobano

## Configuración inicial de Supabase

### 1. Crear las tablas necesarias

Ejecuta el siguiente script SQL en el **SQL Editor** de tu proyecto Supabase:

```sql
-- Copiar y pegar el contenido completo del archivo supabase-init.sql
```

### 2. Configurar Storage

1. Ve a **Storage** en tu panel de Supabase
2. Crea un nuevo bucket llamado `products`
3. Configúralo como público
4. Añade las siguientes políticas:

```sql
-- Permitir subida de archivos
create policy "Allow public uploads" on storage.objects 
for insert with check (bucket_id = 'products');

-- Permitir acceso de lectura
create policy "Allow public access" on storage.objects 
for select using (bucket_id = 'products');
```

### 3. Variables de entorno

Asegúrate de que tu archivo `.env.local` contiene:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qgwlndzjclagwdmgprwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
```

## Funcionalidades del Panel

### Dashboard Principal (`/admin`)
- Estadísticas en tiempo real de productos y categorías
- Enlaces rápidos a las funciones principales
- Indicadores de stock

### Gestión de Categorías (`/admin/categorias`)
- Crear nuevas categorías
- Editar categorías existentes
- Eliminar categorías
- Validación de datos

### Agregar Productos (`/admin/agregar-producto`)
- Formulario completo para nuevos productos
- Subida de múltiples imágenes
- Selección de categoría dinámica
- Validación de campos obligatorios
- Gestión de stock

## Estructura de las tablas

### Tabla `categorias`
- `id`: Serial primary key
- `nombre`: Varchar(255) unique, not null
- `descripcion`: Text opcional
- `created_at`, `updated_at`: Timestamps automáticos

### Tabla `productos`
- `id`: Varchar(50) primary key (ej: PROD-001)
- `nombre`: Varchar(255) not null
- `categoria_id`: Foreign key a categorias
- `descripcion`: Text opcional
- `stock`: Integer, default 0
- `foto`: Array de text (URLs de imágenes)
- `created_at`, `updated_at`: Timestamps automáticos

## Uso del Panel

1. **Acceder al panel**: Navega a `/admin`
2. **Crear categorías**: Ve a `/admin/categorias` y crea al menos una categoría
3. **Agregar productos**: Usa `/admin/agregar-producto` para crear productos
4. **Subir imágenes**: Las imágenes se suben automáticamente a Supabase Storage

## Validaciones implementadas

- ✅ ID de producto obligatorio y único
- ✅ Nombre de producto obligatorio
- ✅ Categoría obligatoria
- ✅ Validación de archivos de imagen
- ✅ Manejo de errores de base de datos
- ✅ Confirmaciones visuales

## Próximas funcionalidades

- [ ] Lista completa de productos con filtros
- [ ] Edición de productos existentes
- [ ] Eliminación de productos
- [ ] Gestión de inventario
- [ ] Reportes y analytics
- [ ] Bulk operations

## Troubleshooting

### Error: "Supabase client not configured"
- Verifica que las variables de entorno estén correctamente configuradas
- Reinicia el servidor de desarrollo después de cambiar `.env.local`

### Error al subir imágenes
- Asegúrate de que el bucket `products` existe en Supabase Storage
- Verifica que las políticas de Storage estén configuradas correctamente

### Error: "relation does not exist"
- Ejecuta el script `supabase-init.sql` en el SQL Editor de Supabase
- Verifica que las tablas se crearon correctamente