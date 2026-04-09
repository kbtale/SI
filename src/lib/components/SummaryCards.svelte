<script>
    import { inventoryStore } from '../inventoryStore.js';
    import { navigationStore } from '../navigationStore.js';

    let totalProducts = 0;
    let productsNeedsReorder = 0;
    let totalStockValue = 0;

    $: {
        if ($inventoryStore.products && $inventoryStore.products.length > 0) {
            totalProducts = $inventoryStore.products.length;
            productsNeedsReorder = $inventoryStore.products.filter(p => p.current_stock <= p.reorder_point).length;
            totalStockValue = $inventoryStore.products.reduce((acc, current) => acc + (current.current_stock * current.unit_cost), 0);
        }
    }
</script>

<div class="summary-grid">
    <button class="card summary-card interactive" on:click={() => navigationStore.setView('inventario')}>
        <div class="icon-wrapper primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><line x1="16.5" x2="7.5" y1="9.4" y2="4.2"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><polyline points="12 22 12 12"/></svg>
        </div>
        <div class="data">
            <span class="label">Productos Disponibles</span>
            <span class="value">{totalProducts}</span>
        </div>
    </button>

    <button class="card summary-card interactive" on:click={() => navigationStore.setView('inventario')}>
        <div class="icon-wrapper alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <div class="data">
            <span class="label">Requieren Pedido</span>
            <span class="value">{productsNeedsReorder} <span class="pill-badge bad">Crítico</span></span>
        </div>
    </button>

    <div class="card summary-card" style="cursor: default;">
        <div class="icon-wrapper secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
        </div>
        <div class="data">
            <span class="label">Valor de Inventario</span>
            <span class="value">${totalStockValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
    </div>
</div>

<style>
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .summary-card {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        background-color: var(--bg-card);
        border: none;
        text-align: left;
        width: 100%;
        font-family: inherit;
    }

    .summary-card.interactive {
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .summary-card.interactive:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(30, 58, 138, 0.1);
    }

    .icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-pill);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .icon-wrapper.primary {
        background-color: var(--color-primary);
    }

    .icon-wrapper.secondary {
        background-color: var(--color-secondary);
    }

    .icon-wrapper.alert {
        background-color: #ef4444; /* red */
    }

    .data {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .label {
        font-size: 0.875rem;
        color: var(--text-muted);
        font-weight: 500;
    }

    .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-main);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .pill-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.6rem;
    }

    .pill-badge.bad {
        background-color: #fee2e2;
        color: #b91c1c;
    }
</style>
