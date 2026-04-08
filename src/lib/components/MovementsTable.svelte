<script>
    import { inventoryStore } from '../inventoryStore.js';

    // Format date properly
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-VE', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute:'2-digit'
        });
    }
</script>

<div class="card table-container">
    <div class="table-header">
        <h3>Movimientos Recientes</h3>
        <button class="pill-badge action-btn">Ver Todos &rsaquo;</button>
    </div>

    {#if $inventoryStore.loading && (!$inventoryStore.movements || $inventoryStore.movements.length === 0)}
        <div class="loading">Cargando datos...</div>
    {:else}
        <div class="table-scroll">
            <table class="melt-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {#each ($inventoryStore.movements || []).slice(0,5) as item (item.id)}
                        <tr>
                            <td>
                                <div class="product-info">
                                    <span class="product-sku">{item.products?.sku}</span>
                                    <span class="product-name">{item.products?.name}</span>
                                </div>
                            </td>
                            <td>
                                <span class="pill-badge {item.movement_type === 'Entrada' ? 'bg-green' : 'bg-red'}">
                                    {item.movement_type}
                                </span>
                            </td>
                            <td class="font-medium">
                                {item.quantity} {item.products?.unit || 'unds.'}
                            </td>
                            <td class="text-light">
                                {formatDate(item.movement_date)}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<style>
    .table-container {
        padding: 2rem;
        flex: 1;
    }

    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .table-header h3 {
        font-size: 1.125rem;
        color: var(--text-main);
        font-weight: 600;
    }

    .action-btn {
        background-color: var(--bg-canvas);
        color: var(--color-primary);
        padding: 0.5rem 1rem;
        font-weight: 500;
    }

    .table-scroll {
        width: 100%;
        overflow-x: auto;
    }

    .melt-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    /* Melt UI structural constraints combined with aesthetics */
    .melt-table th {
        padding: 1rem 0;
        font-weight: 500;
        color: var(--text-muted);
        font-size: 0.875rem;
        border-bottom: 2px solid var(--border-color);
    }

    .melt-table td {
        padding: 1.25rem 0;
        font-size: 0.9rem;
        border-bottom: 1px solid var(--border-color);
        color: var(--text-main);
    }

    .melt-table tbody tr:last-child td {
        border-bottom: none;
    }
    
    .melt-table tbody tr:hover td {
        background-color: rgba(244, 247, 251, 0.5); /* subtle hover */
    }

    .product-info {
        display: flex;
        flex-direction: column;
    }

    .product-sku {
        font-weight: 600;
        color: var(--text-main);
    }

    .product-name {
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .font-medium {
        font-weight: 500;
    }

    .text-light {
        color: var(--text-muted);
    }

    .bg-green {
        background-color: #d1fae5;
        color: #065f46;
    }

    .bg-red {
        background-color: #fee2e2;
        color: #b91c1c;
    }

    .loading {
        padding: 2rem 0;
        text-align: center;
        color: var(--text-muted);
    }
</style>
