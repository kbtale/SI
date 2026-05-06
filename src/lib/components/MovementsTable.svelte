<script>
  import { inventoryStore } from "../inventoryStore.js";
  import { navigationStore } from "../navigationStore.js";
  import { downloadCSV } from "../utils/exportUtils.js";

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleExport() {
    const columns = {
      movement_date: "Fecha",
      "products.sku": "SKU",
      "products.name": "Producto",
      movement_type: "Tipo",
      status: "Estado",
      quantity: "Cantidad",
      notes: "Notas",
    };
    downloadCSV(
      $inventoryStore.movements,
      "historial_movimientos.csv",
      columns,
    );
  }

  async function handleApprove(id) {
    if (
      confirm(
        "¿Estás seguro de aprobar este movimiento? Se actualizará el inventario físico.",
      )
    ) {
      await inventoryStore.approveMovement(id);
    }
  }

  async function handleReject(id) {
    if (confirm("¿Rechazar esta solicitud? No afectará el inventario.")) {
      await inventoryStore.rejectMovement(id);
    }
  }

  // Search and Filtering
  let searchQuery = "";
  $: {
    if ($navigationStore.searchQuery !== undefined) {
      searchQuery = $navigationStore.searchQuery;
    }
  }

  // Reset page when search query changes
  $: if (searchQuery !== undefined) currentPage = 1;

  $: filteredMovements = ($inventoryStore.movements || []).filter(m => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const prodName = m.products?.name?.toLowerCase() || "";
    const prodSku = m.products?.sku?.toLowerCase() || "";
    const type = m.movement_type?.toLowerCase() || "";
    const status = m.status?.toLowerCase() || "";
    return prodName.includes(search) || prodSku.includes(search) || type.includes(search) || status.includes(search);
  });

  // Pagination logic
  let currentPage = 1;
  const itemsPerPage = 10;

  $: totalPages = Math.max(1, Math.ceil(filteredMovements.length / itemsPerPage));
  $: paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function prevPage() { if (currentPage > 1) currentPage--; }
  function nextPage() { if (currentPage < totalPages) currentPage++; }
  function goToPage(page) { currentPage = Math.max(1, Math.min(page, totalPages)); }
</script>

<div class="card table-container">
  <div class="table-header">
    <h3>Movimientos Recientes</h3>
    <div class="header-actions">
      <button
        class="pill-badge secondary-btn"
        on:click={handleExport}
      >
        Exportar CSV
      </button>
      {#if $navigationStore.currentView !== 'movimientos'}
        <a
          href="#movimientos"
          class="pill-badge action-btn"
          on:click={() => navigationStore.setView("movimientos")}
          style="cursor: pointer; text-decoration: none; display: inline-flex; align-items: center;"
        >
          Ver Todos &rsaquo;
        </a>
      {/if}
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
          {#each $navigationStore.currentView === 'movimientos' ? paginatedMovements : filteredMovements.slice(0, 5) as item (item.id)}
            <tr>
              <td>
                <div class="product-info">
                  <span class="product-sku">{item.products?.sku}</span>
                  <span class="product-name">{item.products?.name}</span>
                </div>
              </td>
              <td>
                <span
                  class="pill-badge {item.movement_type === 'Entrada'
                    ? 'bg-green'
                    : item.movement_type === 'Ajuste'
                      ? 'bg-indigo'
                      : 'bg-red'}"
                >
                  {item.movement_type}
                </span>
              </td>
              <td>
                <span
                  class="status-badge {item.status === 'Aprobado'
                    ? 'status-approved'
                    : item.status === 'Pendiente'
                      ? 'status-pending'
                      : 'status-rejected'}"
                >
                  {item.status || "Aprobado"}
                </span>
              </td>
              <td class="font-medium">
                {item.quantity}
                {item.products?.unit || "unds."}
              </td>
              <td class="text-light">
                {formatDate(item.movement_date)}
              </td>
              <td>
                {#if item.status === "Pendiente"}
                  <div class="action-buttons">
                    <button
                      class="btn-icon approve"
                      on:click={() => handleApprove(item.id)}
                      title="Aprobar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><path d="M20 6 9 17l-5-5" /></svg
                      >
                    </button>
                    <button
                      class="btn-icon reject"
                      on:click={() => handleReject(item.id)}
                      title="Rechazar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
                      >
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if $navigationStore.currentView === 'movimientos' && totalPages > 1}
    <div class="pagination">
      <div class="page-info">
        Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMovements.length)} de {filteredMovements.length}
      </div>
      <div class="page-controls">
        <button class="page-btn" on:click={prevPage} disabled={currentPage === 1} aria-label="Anterior">
          &lsaquo;
        </button>
        
        {#each Array(totalPages) as _, i}
          {#if totalPages <= 7 || i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage)}
            <button 
              class="page-btn {currentPage === i + 1 ? 'active' : ''}" 
              on:click={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          {:else if (i === 1 && currentPage > 3) || (i === totalPages - 2 && currentPage < totalPages - 2)}
            <span class="page-ellipsis">...</span>
          {/if}
        {/each}

        <button class="page-btn" on:click={nextPage} disabled={currentPage === totalPages} aria-label="Siguiente">
          &rsaquo;
        </button>
      </div>
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

  .action-btn, .secondary-btn, .primary-btn {
    padding: 0.6rem 1.25rem;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-pill);
    transition: all 0.2s ease;
  }

  .primary-btn {
    background-color: var(--color-primary);
    color: white;
    border: none;
  }

  .secondary-btn {
    background-color: var(--bg-canvas);
    color: var(--text-main);
    border: 1px solid var(--border-color);
  }

  .secondary-btn:hover {
    background-color: var(--bg-card);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .action-btn {
    background-color: var(--bg-canvas);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
  }

  .action-btn:hover {
    background-color: var(--color-primary);
    color: white;
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

  /* Pagination */
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.5rem;
    margin-top: 1rem;
    border-top: 1px solid var(--border-color);
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .page-info {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .page-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .page-btn {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .page-btn:hover:not(:disabled) {
    background-color: var(--bg-canvas);
    color: var(--text-main);
  }

  .page-btn.active {
    background-color: var(--color-primary);
    color: white;
    box-shadow: 0 2px 8px rgba(30, 58, 138, 0.2);
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-ellipsis {
    width: 24px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>
