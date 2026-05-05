<script>
    import { inventoryStore } from '../inventoryStore.js';
    import { navigationStore } from '../navigationStore.js';
    import { downloadCSV } from '../utils/exportUtils.js';

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-VE', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute:'2-digit'
        });
    }

    function handleExport() {
        const columns = {
            'movement_date': 'Fecha',
            'products.sku': 'SKU',
            'products.name': 'Producto',
            'movement_type': 'Tipo',
            'status': 'Estado',
            'quantity': 'Cantidad',
            'notes': 'Notas'
        };
        downloadCSV($inventoryStore.movements, 'historial_movimientos.csv', columns);
    }

    async function handleApprove(id) {
        if(confirm("¿Estás seguro de aprobar este movimiento? Se actualizará el inventario físico.")) {
            await inventoryStore.approveMovement(id);
        }
    }

    async function handleReject(id) {
        if(confirm("¿Rechazar esta solicitud? No afectará el inventario.")) {
            await inventoryStore.rejectMovement(id);
        }
    }
</script>

<div class="card table-container">
    <div class="table-header">
        <h3>Movimientos Recientes</h3>
        <div class="header-actions">
            <button class="pill-badge secondary-btn" on:click={handleExport} style="margin-right: 0.5rem; font-size: 0.8rem; padding: 0.4rem 0.8rem; cursor: pointer;">
                Exportar CSV
            </button>
            <button class="pill-badge action-btn" on:click={() => navigationStore.setView('movimientos')}>
                Ver Todos &rsaquo;
            </button>
        </div>
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
                        <th>Estado</th>
                        <th>Cantidad</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
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
                                <span class="pill-badge {item.movement_type === 'Entrada' ? 'bg-green' : item.movement_type === 'Ajuste' ? 'bg-indigo' : 'bg-red'}">
                                    {item.movement_type}
                                </span>
                            </td>
                            <td>
                                <span class="status-badge {item.status === 'Aprobado' ? 'status-approved' : item.status === 'Pendiente' ? 'status-pending' : 'status-rejected'}">
                                    {item.status || 'Aprobado'}
                                </span>
                            </td>
                            <td class="font-medium">
                                {item.quantity} {item.products?.unit || 'unds.'}
                            </td>
                            <td class="text-light">
                                {formatDate(item.movement_date)}
                            </td>
                            <td>
                                {#if item.status === 'Pendiente'}
                                    <div class="action-buttons">
                                        <button class="btn-icon approve" on:click={() => handleApprove(item.id)} title="Aprobar">✓</button>
                                        <button class="btn-icon reject" on:click={() => handleReject(item.id)} title="Rechazar">✗</button>
                                    </div>
                                {/if}
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

    .bg-indigo {
        background-color: #e0e7ff;
        color: #4f46e5;
    }

    .status-badge {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-pill);
        font-weight: 600;
    }

    .status-approved {
        background-color: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
    }

    .status-pending {
        background-color: #fffbeb;
        color: #d97706;
        border: 1px solid #fde68a;
    }

    .status-rejected {
        background-color: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .btn-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        font-weight: bold;
        transition: transform 0.2s;
    }
    
    .btn-icon:hover {
        transform: scale(1.1);
    }

    .btn-icon.approve {
        background-color: #10b981;
        color: white;
    }

    .btn-icon.reject {
        background-color: #ef4444;
        color: white;
    }

    .loading {
        padding: 2rem 0;
        text-align: center;
        color: var(--text-muted);
    }

    @media (max-width: 600px) {
        .table-container {
            padding: 1.25rem;
        }

        .table-header {
            margin-bottom: 1rem;
        }

        .table-header h3 {
            font-size: 0.95rem;
        }

        .melt-table th {
            padding: 0.75rem 0.25rem;
            font-size: 0.75rem;
        }

        .melt-table td {
            padding: 0.75rem 0.25rem;
            font-size: 0.8rem;
        }

        .product-name {
            font-size: 0.7rem;
        }
    }
</style>
