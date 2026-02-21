-- SQL para configurar la base de datos en Supabase
-- Ejecuta esto en el SQL Editor de tu proyecto de Supabase

-- 1. Crear tabla de perfiles/configuraciones
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  logo_url TEXT,
  settings JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para que los usuarios solo puedan ver/editar su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su propio perfil"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON profiles FOR UPDATE
USING (auth.uid() = id);
