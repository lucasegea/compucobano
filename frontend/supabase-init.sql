-- Script SQL para inicializar las tablas de compuCobano en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear tabla categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    descripcion TEXT,
    stock INTEGER DEFAULT 0,
    foto TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria_id ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_categorias_nombre ON categorias(nombre);

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion) VALUES 
    ('Laptops', 'Computadoras portátiles para trabajo y estudio'),
    ('Oficina', 'Suministros y equipo de oficina'),
    ('Escolar', 'Materiales y útiles escolares'),
    ('Tecnología', 'Dispositivos y accesorios tecnológicos'),
    ('Mobiliario', 'Muebles para oficina y estudio')
ON CONFLICT (nombre) DO NOTHING;

-- Crear bucket de storage para productos (ejecutar en Storage)
-- insert into storage.buckets (id, name, public) values ('products', 'products', true);

-- Política de storage para permitir subida de archivos (ajustar según necesidades de seguridad)
-- create policy "Allow public uploads" on storage.objects for insert with check (bucket_id = 'products');
-- create policy "Allow public access" on storage.objects for select using (bucket_id = 'products');

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a las tablas
DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
CREATE TRIGGER update_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) - opcional, ajustar según necesidades
-- ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo (ajustar según necesidades de seguridad)
-- create policy "Allow read access" on categorias for select using (true);
-- create policy "Allow read access" on productos for select using (true);