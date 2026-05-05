import { writable, get } from 'svelte/store';
import { supabase } from './supabaseClient.js';

function createInventoryStore() {
    const { subscribe, set, update } = writable({
        products: [],
        movements: [],
        companySettings: { company_name: 'Cargando...', company_subtitle: '', logo_icon: '⏳', logo_url: '' },
        loading: false,
        error: null
    });

    return {
        subscribe,
        
        async fetchCompanySettings() {
            try {
                const { data, error } = await supabase
                    .from('company_settings')
                    .select('*')
                    .limit(1)
                    .single();
                
                if (error && error.code !== 'PGRST116') throw error;
                if (data) update(state => ({ ...state, companySettings: data }));
            } catch (err) {
                console.error("Configuración no disponible:", err.message);
            }
        },

        // Fetch all products
        async fetchProducts() {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                // Products query
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('category', { ascending: true });
                
                if (error) throw error;

                // Add needs_reorder calculated boolean
                const enrichedProducts = data.map(product => ({
                    ...product,
                    needs_reorder: product.current_stock <= product.reorder_point
                }));

                update(state => ({ ...state, products: enrichedProducts, loading: false }));
            } catch (err) {
                update(state => ({ ...state, error: err.message, loading: false }));
            }
        },

        // Fetch recent movements
        async fetchMovements() {
             update(state => ({ ...state, loading: true, error: null }));
             try {
                 const { data, error } = await supabase
                     .from('inventory_movements')
                     .select('*, products(name, sku)')
                     .order('movement_date', { ascending: false })
                     .limit(50);
                 
                 if (error) throw error;
                 update(state => ({ ...state, movements: data, loading: false }));
             } catch (err) {
                 update(state => ({ ...state, error: err.message, loading: false }));
             }
        },

        // Add a new movement (Entrada / Salida / Ajuste)
        async addMovement({ productId, type, quantity, notes }) {
            try {
                if (type !== 'Ajuste' && quantity <= 0) {
                    throw new Error("La cantidad debe ser mayor a cero para Entradas y Salidas.");
                }

                // Determinar el status inicial
                let status = 'Aprobado';
                if (type === 'Salida' || type === 'Ajuste') {
                    status = 'Pendiente';
                }

                // Insert movement
                const { data, error } = await supabase
                    .from('inventory_movements')
                    .insert([{
                        product_id: productId,
                        movement_type: type,
                        quantity: quantity,
                        status: status,
                        notes: notes
                    }]);

                if (error) throw error;
                
                await this.fetchProducts();
                await this.fetchMovements();
                return true;
            } catch (err) {
                update(state => ({ ...state, error: err.message }));
                throw err;
            }
        },

        // Aprobar un movimiento pendiente
        async approveMovement(movementId) {
            try {
                const state = get(this);
                const movement = state.movements.find(m => m.id === movementId);
                if (!movement) throw new Error("Movimiento no encontrado.");
                
                const product = state.products.find(p => p.id === movement.product_id);
                
                // Validar stock antes de aprobar una Salida
                if (movement.movement_type === 'Salida' && movement.quantity > product.current_stock) {
                    throw new Error(`Error: Inventario insuficiente. Solo quedan ${product.current_stock} unidades.`);
                }

                const { error } = await supabase
                    .from('inventory_movements')
                    .update({ status: 'Aprobado' })
                    .eq('id', movementId);

                if (error) throw error;
                
                await this.fetchProducts();
                await this.fetchMovements();
                return true;
            } catch (err) {
                update(state => ({ ...state, error: err.message }));
                throw err;
            }
        },

        // Rechazar un movimiento pendiente
        async rejectMovement(movementId) {
            try {
                const { error } = await supabase
                    .from('inventory_movements')
                    .update({ status: 'Rechazado' })
                    .eq('id', movementId);

                if (error) throw error;
                
                await this.fetchMovements();
                return true;
            } catch (err) {
                update(state => ({ ...state, error: err.message }));
                throw err;
            }
        },

        async addProduct(productData) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const { data, error } = await supabase
                    .from('products')
                    .insert([productData])
                    .select();

                if (error) throw error;
                
                await this.fetchProducts();
                return data[0];
            } catch (err) {
                update(state => ({ ...state, error: err.message, loading: false }));
                throw err;
            }
        },

        // Update company settings
        async updateCompanySettings(settings) {
            try {
                const { data, error } = await supabase
                    .from('company_settings')
                    .update(settings)
                    .eq('id', get(this).companySettings.id)
                    .select();

                if (error) throw error;
                if (data) update(state => ({ ...state, companySettings: data[0] }));
                return true;
            } catch (err) {
                update(state => ({ ...state, error: err.message }));
                throw err;
            }
        },

        async batchAddProducts(products) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const formatted = products.map(p => ({
                    ...p,
                    unit_cost: parseFloat(p.unit_cost) || 0,
                    current_stock: parseInt(p.current_stock) || 0,
                    reorder_point: parseInt(p.reorder_point) || 5,
                    sku: p.sku && p.sku !== '' && p.sku !== '-' ? p.sku : null
                }));

                const withSku = formatted.filter(p => p.sku !== null);
                const withoutSku = formatted.filter(p => p.sku === null);

                let results = [];

                if (withSku.length > 0) {
                    const { data, error } = await supabase
                        .from('products')
                        .upsert(withSku, { onConflict: 'sku' })
                        .select();
                    if (error) throw error;
                    results = [...results, ...(data || [])];
                }

                if (withoutSku.length > 0) {
                    const { data, error } = await supabase
                        .from('products')
                        .insert(withoutSku)
                        .select();
                    if (error) throw error;
                    results = [...results, ...(data || [])];
                }
                
                await this.fetchProducts();
                return results;
            } catch (err) {
                update(state => ({ ...state, error: err.message, loading: false }));
                throw err;
            }
        },
        // Calculate ABC Classification (80-15-5 rule)
        async calculateABC() {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const state = get(this);
                let products = [...state.products];
                
                products = products.map(p => ({
                    ...p,
                    totalValue: (p.current_stock || 0) * (p.unit_cost || 0)
                }));
                
                products.sort((a, b) => b.totalValue - a.totalValue);
                const grandTotal = products.reduce((sum, p) => sum + p.totalValue, 0);
                
                if (grandTotal === 0) {
                    update(state => ({ ...state, loading: false }));
                    return false;
                }
                
                let cumulativeValue = 0;
                const updates = [];
                
                for (let p of products) {
                    cumulativeValue += p.totalValue;
                    const cumulativePercentage = cumulativeValue / grandTotal;
                    
                    let newClass = 'C';
                    if (cumulativePercentage <= 0.80) {
                        newClass = 'A';
                    } else if (cumulativePercentage <= 0.95) {
                        newClass = 'B';
                    }
                    
                    if (p.abc_class !== newClass) {
                        updates.push({ id: p.id, abc_class: newClass });
                    }
                }
                
                if (updates.length > 0) {
                    await Promise.all(updates.map(u => 
                        supabase.from('products').update({ abc_class: u.abc_class }).eq('id', u.id)
                    ));
                    await this.fetchProducts();
                }
                
                update(state => ({ ...state, loading: false }));
                return true;
            } catch (err) {
                update(state => ({ ...state, error: err.message, loading: false }));
                throw err;
            }
        }
    };
}

export const inventoryStore = createInventoryStore();
