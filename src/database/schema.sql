-- Supabase SQL Schema for Reyes Estrategias Eléctricas C.A.

-- 1. Create tables

-- Company Settings
CREATE TABLE company_settings (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    company_subtitle TEXT,
    logo_icon TEXT DEFAULT 'REE',
    logo_url TEXT,
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
    sku TEXT, -- Made optional for batch imports
    description TEXT,
    category TEXT,
    unit TEXT,
    photo_url TEXT,
    unit_cost DECIMAL(12,2) DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 5,
    abc_class TEXT DEFAULT 'C',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT products_sku_key UNIQUE (sku)
);

-- Inventory Movements
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    movement_type TEXT CHECK (movement_type IN ('Entrada', 'Salida', 'Ajuste')) NOT NULL,
    quantity INTEGER NOT NULL, -- Quantity can be negative for Adjustments
    status TEXT CHECK (status IN ('Pendiente', 'Aprobado', 'Rechazado')) DEFAULT 'Aprobado',
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 2. Triggers and Functions

-- Update current_stock automatically on movement
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- If it's a new approved movement
    IF TG_OP = 'INSERT' AND NEW.status = 'Aprobado' THEN
        IF NEW.movement_type = 'Entrada' OR NEW.movement_type = 'Ajuste' THEN
            UPDATE products SET current_stock = current_stock + NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.movement_type = 'Salida' THEN
            UPDATE products SET current_stock = current_stock - NEW.quantity WHERE id = NEW.product_id;
        END IF;
    END IF;

    -- If a movement was updated from Pendiente to Aprobado
    IF TG_OP = 'UPDATE' AND OLD.status = 'Pendiente' AND NEW.status = 'Aprobado' THEN
        IF NEW.movement_type = 'Entrada' OR NEW.movement_type = 'Ajuste' THEN
            UPDATE products SET current_stock = current_stock + NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.movement_type = 'Salida' THEN
            UPDATE products SET current_stock = current_stock - NEW.quantity WHERE id = NEW.product_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock
AFTER INSERT OR UPDATE ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Calculate ABC Class based on Pareto Principle (Total Inventory Value)
-- Class A = Top 80% value, Class B = Next 15%, Class C = Bottom 5%
-- Optimized: uses a single set-based UPDATE instead of a per-row loop
CREATE OR REPLACE FUNCTION calculate_abc_class()
RETURNS void AS $$
BEGIN
    WITH product_values AS (
        SELECT id, COALESCE(current_stock * unit_cost, 0) as val
        FROM products
    ),
    total AS (
        SELECT COALESCE(NULLIF(SUM(val), 0), 1) as total_val FROM product_values
    ),
    ranked AS (
        SELECT
            id,
            val,
            SUM(val) OVER (ORDER BY val DESC, id ASC) as accumulated_val
        FROM product_values
    )
    UPDATE products p
    SET abc_class = CASE
        WHEN t.total_val <= 1 THEN 'C'
        WHEN (r.accumulated_val - r.val) / t.total_val < 0.80 THEN 'A'
        WHEN (r.accumulated_val - r.val) / t.total_val < 0.95 THEN 'B'
        ELSE 'C'
    END
    FROM ranked r, total t
    WHERE p.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- 3. Row Level Security

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Basic Policies: Authenticated users can read products/movements. Admins can do anything.
-- Basic Policies: Authenticated users can read products/movements.
CREATE POLICY "Allow authenticated read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read movements" ON inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read settings" ON company_settings FOR SELECT TO authenticated USING (true);

-- Admins can manage everything
CREATE POLICY "Admins can manage products" ON products FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage movements" ON inventory_movements FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage suppliers" ON suppliers FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can update settings" ON company_settings FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Profile Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Warehouse staff can only add movements (not delete or edit)
CREATE POLICY "Staff can insert movements" ON inventory_movements FOR INSERT TO authenticated 
WITH CHECK (true);
