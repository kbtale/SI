-- Supabase SQL Schema for Reyes Estrategias Eléctricas C.A.

-- 1. Create tables

-- Company Settings
CREATE TABLE company_settings (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    company_subtitle TEXT,
    logo_icon TEXT DEFAULT '🏢',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users/Profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('admin', 'warehouse_staff')) DEFAULT 'warehouse_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    unit TEXT,
    photo_url TEXT,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_stock INTEGER NOT NULL DEFAULT 0,
    safety_stock INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 0,
    abc_class TEXT CHECK (abc_class IN ('A', 'B', 'C')) DEFAULT 'C',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Movements
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    movement_type TEXT CHECK (movement_type IN ('Entrada', 'Salida')) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 2. Triggers and Functions

-- Update current_stock automatically on movement
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'Entrada' THEN
        UPDATE products SET current_stock = current_stock + NEW.quantity WHERE id = NEW.product_id;
    ELSIF NEW.movement_type = 'Salida' THEN
        UPDATE products SET current_stock = current_stock - NEW.quantity WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock
AFTER INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Calculate ABC Class based on Pareto Principle (Total Inventory Value)
-- Class A = Top 70-80% value, Class B = Next 15-20%, Class C = Bottom 5-10%
CREATE OR REPLACE FUNCTION calculate_abc_class()
RETURNS void AS $$
DECLARE
    total_value DECIMAL(12,2);
    accumulated_value DECIMAL(12,2) := 0;
    prod RECORD;
    cumulative_percentage DECIMAL(5,2);
BEGIN
    -- Calculate total inventory value
    SELECT COALESCE(SUM(current_stock * unit_cost), 0) INTO total_value FROM products WHERE current_stock > 0;
    
    IF total_value = 0 THEN
        UPDATE products SET abc_class = 'C';
        RETURN;
    END IF;

    -- Iterate through products sorted by value descending
    FOR prod IN (SELECT id, (current_stock * unit_cost) as value FROM products ORDER BY (current_stock * unit_cost) DESC)
    LOOP
        accumulated_value := accumulated_value + prod.value;
        cumulative_percentage := (accumulated_value / total_value) * 100;
        
        IF cumulative_percentage <= 80 THEN
            UPDATE products SET abc_class = 'A' WHERE id = prod.id;
        ELSIF cumulative_percentage <= 95 THEN
            UPDATE products SET abc_class = 'B' WHERE id = prod.id;
        ELSE
            UPDATE products SET abc_class = 'C' WHERE id = prod.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Row Level Security

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Basic Policies: Authenticated users can read products/movements. Admins can do anything.
CREATE POLICY "Allow authenticated read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert movements" ON inventory_movements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated read movements" ON inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read settings" ON company_settings FOR SELECT TO authenticated USING (true);

-- Insert Demo Company
INSERT INTO company_settings (company_name, company_subtitle, logo_icon) VALUES ('Empresa Base', 'Sistema de Gestión', '🏢');
