<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { inventoryStore } from "../inventoryStore.js";
  import { navigationStore } from "../navigationStore.js";

  const dispatch = createEventDispatcher();

  let searchQuery = $navigationStore.searchQuery || "";

  $: {
    if ($navigationStore.searchQuery !== undefined) {
      searchQuery = $navigationStore.searchQuery;
    }
  }

  $: filteredProducts = $inventoryStore.products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  );

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
        class="pill-badge primary-btn"
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
          <th style="width: 120px;">SKU / ID</th>
          <th style="min-width: 200px;">Producto</th>
          <th class="hide-mobile">Categoría</th>
          <th>Stock</th>
          <th class="hide-mobile">ABC</th>
          <th class="hide-xs">Valor</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredProducts as product (product.id)}
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
            <td class="font-bold">{product.current_stock}</td>
            <td class="hide-mobile"
              ><span class="abc-badge {getAbcClass(product.abc_class)}"
                >{product.abc_class}</span
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
    table-layout: auto;
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
</style>
