<script>
    import { createEventDispatcher } from 'svelte';
    import { inventoryStore } from '../inventoryStore.js';

    const dispatch = createEventDispatcher();

    let name = '';
    let sku = '';
    let category = '';
    let unit = 'unds.';
    let unit_cost = 0;
    let initial_stock = 0;
    let reorder_point = 5;

    let loading = false;
    let error = null;

    async function handleSave() {
        loading = true;
        error = null;
        try {
            await inventoryStore.addProduct({
                name,
                sku,
                category,
                unit,
                unit_cost,
                current_stock: initial_stock,
                reorder_point
            });
            dispatch('success');
            reset();
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    function reset() {
        name = ''; sku = ''; category = ''; unit = 'unds.';
        unit_cost = 0; initial_stock = 0; reorder_point = 5;
    }
</script>

<div class="form-card card">
    <div class="form-header">
        <h3>Añadir Nuevo Producto</h3>
        <button class="close-btn" on:click={() => dispatch('close')}>&times;</button>
    </div>

    {#if error}
        <div class="error-msg">{error}</div>
    {/if}

    <form class="product-form" on:submit|preventDefault={handleSave}>
        <div class="form-row">
            <div class="field">
                <label for="name">Nombre del Producto</label>
                <input id="name" type="text" bind:value={name} placeholder="Cable THW #12 Azul" required />
            </div>
            <div class="field">
                <label for="sku">SKU / Código</label>
                <input id="sku" type="text" bind:value={sku} placeholder="CAB-THW-12-AZ" required />
            </div>
        </div>

        <div class="form-row">
            <div class="field">
                <label for="category">Categoría</label>
                <input id="category" type="text" bind:value={category} placeholder="Cables y Conductores" />
            </div>
            <div class="field">
                <label for="unit">Unidad de Medida</label>
                <select id="unit" bind:value={unit}>
                    <option value="unds.">Unidades (unds.)</option>
                    <option value="mts.">Metros (mts.)</option>
                    <option value="rollos">Rollos</option>
                    <option value="kgs.">Kilogramos (kgs.)</option>
                </select>
            </div>
        </div>

        <div class="form-row">
            <div class="field">
                <label for="cost">Costo Unitario ($)</label>
                <input id="cost" type="number" step="0.01" bind:value={unit_cost} required />
            </div>
            <div class="field">
                <label for="stock">Stock Inicial</label>
                <input id="stock" type="number" bind:value={initial_stock} required />
            </div>
            <div class="field">
                <label for="reorder">Punto de Reorden</label>
                <input id="reorder" type="number" bind:value={reorder_point} required />
            </div>
        </div>

        <div class="form-actions">
            <button type="button" class="cancel-btn" on:click={() => dispatch('close')}>Cancelar</button>
            <button type="submit" class="submit-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Crear Producto'}
            </button>
        </div>
    </form>
</div>

<style>
    .form-card {
        padding: 2.5rem;
        background-color: white;
        border: 1px solid var(--border-color);
    }

    .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .form-header h3 {
        margin: 0;
        color: var(--text-main);
        font-size: 1.25rem;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-muted);
        cursor: pointer;
    }

    .product-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-row {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
    }

    .field {
        flex: 1;
        min-width: 200px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
    }

    input, select {
        padding: 0.75rem 1rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        background-color: var(--bg-canvas);
        font-size: 0.95rem;
        color: var(--text-main);
    }

    input:focus, select:focus {
        border-color: var(--color-primary);
        outline: none;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
    }

    .submit-btn {
        background-color: var(--color-primary);
        color: white;
        padding: 0.85rem 2rem;
        border-radius: var(--radius-pill);
        font-weight: 600;
        cursor: pointer;
    }

    .cancel-btn {
        background-color: transparent;
        color: var(--text-muted);
        padding: 0.85rem 2rem;
        border-radius: var(--radius-pill);
        font-weight: 500;
        cursor: pointer;
    }

    .error-msg {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        font-size: 0.85rem;
    }
</style>
