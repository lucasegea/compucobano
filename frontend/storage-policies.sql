-- Políticas de Storage para el bucket 'products'
-- Ejecutar en el SQL Editor de Supabase

-- 1. Permitir que cualquiera pueda leer archivos del bucket products
CREATE POLICY "Allow public read access on products bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- 2. Permitir que cualquiera pueda subir archivos al bucket products
CREATE POLICY "Allow public upload to products bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

-- 3. Permitir que cualquiera pueda actualizar archivos en el bucket products
CREATE POLICY "Allow public update on products bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products');

-- 4. Permitir que cualquiera pueda eliminar archivos del bucket products
CREATE POLICY "Allow public delete on products bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');

-- ALTERNATIVA: Política más permisiva (para desarrollo)
-- Si las anteriores no funcionan, usar esta:
CREATE POLICY "Allow all operations on products bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'products');