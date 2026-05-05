<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { inventoryStore } from "../inventoryStore.js";
  import { navigationStore } from "../navigationStore.js";
  import { downloadCSV } from "../utils/exportUtils.js";

  const dispatch = createEventDispatcher();

  let searchQuery = $navigationStore.searchQuery || "";

  $: {
    if ($navigationStore.searchQuery !== undefined) {
      searchQuery = $navigationStore.searchQuery;
    }
  }

  let sortKey = "name";
  let sortDirection = 0; // 0: off, 1: asc, -1: desc

  function toggleSort(key) {
    if (sortKey !== key) {
      sortKey = key;
      sortDirection = 1;
    } else {
      if (sortDirection === 1) sortDirection = -1;
      else if (sortDirection === -1) sortDirection = 0;
      else sortDirection = 1;
    }
  }

  // Toast system
  let toasts = [];
  function addToast(message, type = 'info') {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4000);
  }

  $: filteredProducts = $inventoryStore.products
    .filter((p) => {
      const search = searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(search);
      const skuMatch = p.sku?.toLowerCase().includes(search) ?? false;
      const status = p.current_stock <= p.reorder_point ? "alerta" : "ok";
      const statusMatch = status.includes(search);
      return nameMatch || skuMatch || statusMatch;
    })
    .sort((a, b) => {
      if (sortDirection === 0) return 0;
      
      let aVal, bVal;
      
      if (sortKey === "value") {
        aVal = a.current_stock * a.unit_cost;
        bVal = b.current_stock * b.unit_cost;
      } else if (sortKey === "status") {
        // Alerta (stock <= reorder) should come first in desc
        aVal = a.current_stock <= a.reorder_point ? 1 : 0;
        bVal = b.current_stock <= b.reorder_point ? 1 : 0;
      } else {
        aVal = a[sortKey];
        bVal = b[sortKey];
      }

      if (typeof aVal === "string") {
        return (aVal || "").localeCompare(bVal || "") * sortDirection;
      }
      return ((aVal || 0) - (bVal || 0)) * sortDirection;
    });

  // Pagination
  let currentPage = 1;
  const itemsPerPage = 12;

  // Reset page when search query changes
  $: if (searchQuery !== undefined) currentPage = 1;

  $: totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  $: paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function prevPage() { if (currentPage > 1) currentPage--; }
  function nextPage() { if (currentPage < totalPages) currentPage++; }
  function goToPage(page) { currentPage = Math.max(1, Math.min(page, totalPages)); }

  function getAbcClass(abc) {
    switch (abc) {
      case "A":
        return "badge-a";
      case "B":
        return "badge-b";
      case "C":
        return "badge-c";
      default:
        return "";
    }
  }

  let fileInput;
  let importing = false;

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    importing = true;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      if (typeof text !== "string") return;

      try {
        const rows = text.split("\n").filter((row) => row.trim() !== "");
        const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());

        const parsedProducts = rows.slice(1).map((line) => {
          const values = [];
          let current = "";
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && line[i + 1] === '"') {
              current += '"';
              i++;
            } else if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              values.push(current);
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current);

          const obj = {};
          headers.forEach((h, i) => {
            let val = values[i]?.trim() || "";
            if (val === "-" || val === '""') val = "";
            obj[h] = val;
          });
          return obj;
        });

        const uniqueBySku = new Map();
        const productsWithoutSku = [];

        parsedProducts.forEach((p) => {
          const sku = p.sku?.trim();
          if (sku && sku !== "") {
            uniqueBySku.set(sku, p);
          } else {
            productsWithoutSku.push(p);
          }
        });

        const finalProducts = [...uniqueBySku.values(), ...productsWithoutSku];
        // ------------------------------------------------------------------

        await inventoryStore.batchAddProducts(finalProducts);
        alert(`¡Éxito! Se han importado ${finalProducts.length} productos.`);
      } catch (err) {
        console.error(err);
        alert(`Error en importación: ${err.message}`);
      } finally {
        importing = false;
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  }
  function handleExport() {
    const columns = {
      sku: "SKU",
      name: "Nombre",
      category: "Categoría",
      current_stock: "Stock Actual",
      reorder_point: "Punto de Reorden",
      unit_cost: "Costo Unitario",
      abc_class: "Clase ABC",
    };
    downloadCSV($inventoryStore.products, "inventario_total.csv", columns);
  }

  async function handleCalculateABC() {
    try {
      const updated = await inventoryStore.calculateABC();
      if (updated) {
        addToast("Clasificación ABC actualizada exitosamente.", "success");
      } else {
        addToast("No hay cambios necesarios en la clasificación.", "info");
      }
    } catch (err) {
      addToast("Error calculando ABC: " + err.message, "error");
    }
  }

  function handlePrintAudit() {
    window.print();
  }
</script>

<div class="card products-container">
  <div class="view-actions">
    <div class="search-input">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
      >
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Filtrar por nombre o SKU..."
      />
    </div>
    <div class="action-buttons">
      <input
        type="file"
        accept=".csv"
        bind:this={fileInput}
        on:change={handleImport}
        style="display: none;"
      />
      <button
        class="pill-badge secondary-btn"
        on:click={() => fileInput.click()}
        disabled={importing}
      >
        {importing ? "Importando..." : "Importar CSV"}
      </button>
      
      <button
        class="pill-badge secondary-btn"
        on:click={handleExport}
      >
        Exportar CSV
      </button>

      <button class="pill-badge secondary-btn hide-print" on:click={handleCalculateABC} title="Asignar Categoría A,B,C">
        Análisis ABC
      </button>

      <button class="pill-badge secondary-btn hide-print" on:click={handlePrintAudit}>
        Lista de Auditoría
      </button>

      <button
        class="pill-badge primary-btn hide-print"
        on:click={() => dispatch("showAddForm")}
      >
        + Nuevo Producto
      </button>
    </div>
  </div>

  <div class="table-scroll">
    <table class="melt-table">
      <thead>
        <tr>
          <th style="width: 120px; cursor: pointer;" on:click={() => toggleSort('sku')}>
            SKU {sortKey === 'sku' && sortDirection !== 0 ? (sortDirection === 1 ? ' ↑' : ' ↓') : ''}
          </th>
          <th style="width: auto; min-width: 200px; cursor: pointer;" on:click={() => toggleSort('name')}>
            Producto {sortKey === 'name' && sortDirection !== 0 ? (sortDirection === 1 ? ' ↑' : ' ↓') : ''}
          </th>
          <th class="hide-mobile" style="width: 140px; cursor: pointer;" on:click={() => toggleSort('category')}>
            Categoría {sortKey === 'category' && sortDirection !== 0 ? (sortDirection === 1 ? ' ↑' : ' ↓') : ''}
          </th>
          <th style="width: 120px; cursor: pointer;" on:click={() => toggleSort('current_stock')}>
            Stock {sortKey === 'current_stock' && sortDirection !== 0 ? (sortDirection === 1 ? ' ↑' : ' ↓') : ''}
          </th>
          <th class="hide-mobile" style="width: 80px; cursor: pointer;" on:click={() => toggleSort('abc_class')}>
            ABC {sortKey === 'abc_class' && sortDirection !== 0 ? (sortDirection === 1 ? ' ↑' : ' ↓') : ''}
          </th>
          <th class="hide-xs" style="width: 110px; cursor: pointer;" on:click={() => toggleSort('value')}>
            Valor {sortKey === 'value' && sortDirection !== 0 ? (sortDirection === 1 ? ' ↑' : ' ↓') : ''}
          </th>
          <th style="width: 100px; cursor: pointer;" on:click={() => toggleSort('status')}>
            Estado {sortKey === 'status' && sortDirection !== 0 ? (sortDirection === 1 ? ' ↑' : ' ↓') : ''}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedProducts as product (product.id)}
          <tr>
            <td>
              <span class="sku-cell">
                {product.sku && product.sku !== "-"
                  ? product.sku
                  : `#${product.id}`}
              </span>
            </td>
            <td>
              <div class="product-cell">
                <span class="name">{product.name}</span>
                <span class="unit hide-mobile">{product.unit || "unidad"}</span>
              </div>
            </td>
            <td class="hide-mobile"
              ><span class="category-tag">{product.category || "Sin Cat."}</span
              ></td
            >
            <td class="font-medium {product.current_stock <= product.reorder_point ? 'text-red' : ''}">
              {product.current_stock}
              <span class="text-light">{product.unit || "unds"}</span>
              {#if product.current_stock <= product.reorder_point}
                 <span class="pill-badge bad" title="Punto de reorden alcanzado" style="margin-left:4px; font-size:0.65rem;">Alerta</span>
              {/if}
            </td>
            <td class="hide-mobile"
              ><span class="abc-badge {getAbcClass(product.abc_class)}"
                >{product.abc_class || "C"}</span
              ></td
            >
            <td class="hide-xs"
              ><strong
                >${(
                  product.current_stock * product.unit_cost
                ).toLocaleString()}</strong
              ></td
            >
            <td>
              {#if product.current_stock <= product.reorder_point}
                <span class="status-dot alert" title="Reorden"></span>
              {:else}
                <span class="status-dot success" title="OK"></span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Pagination Controls -->
  {#if totalPages > 1}
    <div class="pagination">
      <span class="page-info">{filteredProducts.length} productos · Página {currentPage} de {totalPages}</span>
      <div class="page-controls">
        <button class="page-btn" on:click={prevPage} disabled={currentPage <= 1} aria-label="Página anterior">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {#each Array(totalPages) as _, i}
          {#if totalPages <= 7 || i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage)}
            <button
              class="page-btn {currentPage === i + 1 ? 'active' : ''}"
              on:click={() => goToPage(i + 1)}
            >{i + 1}</button>
          {:else if i === 1 || i === totalPages - 2}
            <span class="page-ellipsis">…</span>
          {/if}
        {/each}
        <button class="page-btn" on:click={nextPage} disabled={currentPage >= totalPages} aria-label="Página siguiente">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  {/if}
</div>

<div class="audit-print-area">
  <h2>Lista de Verificación Física (Conteo Cíclico)</h2>
  <p>Fecha de auditoría: {new Date().toLocaleDateString()}</p>
  <table class="print-table">
    <thead>
      <tr>
        <th>SKU</th>
        <th>Producto</th>
        <th>Categoría</th>
        <th>Cant. Sistema</th>
        <th>Cant. Física (Auditoría)</th>
        <th>Observaciones / Ajustes</th>
      </tr>
    </thead>
    <tbody>
      {#each $inventoryStore.products as product}
        <tr>
          <td>{product.sku || 'N/A'}</td>
          <td>{product.name}</td>
          <td>{product.category || 'N/A'}</td>
          <td>{product.current_stock} {product.unit || 'unds'}</td>
          <td class="blank-cell"></td>
          <td class="blank-cell"></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<!-- Toast Container -->
<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div class="toast {toast.type}" transition:fade>
      <div class="toast-content">
        {#if toast.type === 'success'}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        {:else if toast.type === 'error'}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {/if}
        <span>{toast.message}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .products-container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (max-width: 600px) {
    .products-container {
      padding: 1rem;
      gap: 1rem;
    }
  }

  .view-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .search-input {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background-color: var(--bg-canvas);
    padding: 0.6rem 1rem;
    border-radius: var(--radius-pill);
    flex: 1;
    min-width: 250px;
    max-width: 350px;
  }

  .search-input input {
    border: none;
    background: transparent;
    font-size: 0.85rem;
    width: 100%;
    color: var(--text-main);
  }

  .primary-btn {
    background-color: var(--color-primary);
    color: white;
    padding: 0.6rem 1.25rem;
    font-weight: 600;
    cursor: pointer;
  }

  .secondary-btn {
    background-color: var(--bg-canvas);
    color: var(--text-main);
    border: 1px solid var(--border-color);
    padding: 0.6rem 1.25rem;
    font-weight: 600;
    cursor: pointer;
  }

  .table-scroll {
    overflow-x: auto; /* Reverted to auto to ensure data accessibility if viewport is too small */
    width: 100%;
    -webkit-overflow-scrolling: touch;
  }

  .melt-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .melt-table th {
    text-align: left;
    padding: 1rem 0.5rem;
    color: var(--text-muted);
    font-weight: 500;
    font-size: 0.85rem;
    border-bottom: 2px solid var(--border-color);
  }

  .melt-table td {
    padding: 1.25rem 0.5rem;
    font-size: 0.9rem;
    border-bottom: 1px solid var(--border-color);
  }

  .sku-cell {
    font-family: monospace;
    font-weight: 600;
    color: var(--color-primary);
    background-color: #f0f4ff;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 110px;
  }

  .product-cell {
    display: flex;
    flex-direction: column;
  }

  .product-cell .name {
    font-weight: 600;
    color: var(--text-main);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-cell .unit {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .status-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .status-dot.alert {
    background-color: #ef4444;
    box-shadow: 0 0 0 3px #fee2e2;
  }
  .status-dot.success {
    background-color: #10b981;
    box-shadow: 0 0 0 3px #d1fae5;
  }

  @media (max-width: 900px) {
    .hide-mobile {
      display: none !important;
    }
  }

  @media (max-width: 600px) {
    .hide-xs {
      display: none !important;
    }
    
    .view-actions {
        flex-direction: column;
        align-items: stretch;
    }
    
    .action-buttons {
        order: -1;
        justify-content: space-between;
    }

    .melt-table th, .melt-table td {
        padding: 0.75rem 0.25rem;
        font-size: 0.8rem;
    }
  }

  .category-tag {
    font-size: 0.8rem;
    color: var(--color-secondary);
    font-weight: 500;
  }

  .abc-badge {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: 800;
    font-size: 0.75rem;
  }

  .badge-a {
    background-color: #dcfce7;
    color: #166534;
  }
  .badge-b {
    background-color: #fef9c3;
    color: #854d0e;
  }
  .badge-c {
    background-color: #f3f4f6;
    color: #374151;
  }

  .font-bold {
    font-weight: 700;
    color: var(--text-main);
  }

  /* Pagination */
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .page-info {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .page-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .page-btn {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .page-btn:hover:not(:disabled) {
    background-color: var(--bg-canvas);
    color: var(--text-main);
  }

  .page-btn.active {
    background-color: var(--color-primary);
    color: white;
    box-shadow: 0 2px 8px rgba(30, 58, 138, 0.25);
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-ellipsis {
    width: 28px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  @media (max-width: 600px) {
    .pagination {
      justify-content: center;
      flex-direction: column;
      align-items: center;
    }
  }

  td.font-medium.text-red {
    color: #ef4444;
  }
  
  .bad {
    background-color: #fee2e2;
    color: #b91c1c;
  }

  /* Toasts */
  .toast-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 9999;
  }

  .toast {
    padding: 1rem 1.5rem;
    background-color: var(--bg-card);
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    border-left: 4px solid var(--color-primary);
    min-width: 300px;
    animation: slideIn 0.3s ease-out;
  }

  .toast.success { border-left-color: #10b981; }
  .toast.error { border-left-color: #ef4444; }
  .toast.info { border-left-color: var(--color-primary); }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-main);
  }

  .toast.success svg { color: #10b981; }
  .toast.error svg { color: #ef4444; }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* ------------------- PRINT VIEW ------------------- */
  .audit-print-area {
    display: none;
  }

  @media print {
    :global(html), :global(body) {
      background: white;
      color: black;
      margin: 0;
      padding: 0;
      overflow: visible;
      overflow-x: visible;
      overflow-y: visible;
    }

    :global(::-webkit-scrollbar) {
      display: none;
    }

    :global(body > *:not(#app)) {
      display: none;
    }

    :global(body #app), 
    :global(body .dashboard-layout), 
    :global(body .main-content), 
    :global(body .content-wrapper), 
    :global(body .inventory-view) {
      display: block;
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
      margin: 0;
      width: 100%;
    }
    
    :global(body #app .sidebar), 
    :global(body #app .top-nav), 
    :global(body #app .hide-print) {
      display: none;
    }

    .view-actions, 
    .pagination, 
    .toast-container,
    .products-container {
      display: none;
    }

    .audit-print-area {
      display: block;
      width: 100%;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .audit-print-area h2 {
      margin-bottom: 5px;
      color: #000;
    }
    
    .audit-print-area p {
      margin-bottom: 20px;
      color: #333;
    }

    .print-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .print-table th, .print-table td {
      border: 1px solid #000;
      padding: 8px 10px;
      text-align: left;
    }

    .print-table th {
      background-color: #f0f0f0;
      font-weight: bold;
    }

    .blank-cell {
      min-width: 120px;
    }
  }
</style>
