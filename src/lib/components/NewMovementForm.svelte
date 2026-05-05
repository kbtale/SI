<script>
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { inventoryStore } from "../inventoryStore.js";

  const dispatch = createEventDispatcher();

  let productId = "";
  let productSearch = "";
  let showDropdown = false;
  let movementType = "Entrada";
  let quantity = 1;
  let notes = "";
  let invoiceNumber = "";

  let loading = false;
  let error = null;

  $: filteredProducts = $inventoryStore.products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  ).slice(0, 5);

  $: selectedProduct = $inventoryStore.products.find(
    (p) => p.id === parseInt(productId),
  );

  function selectProduct(p) {
    productId = p.id.toString();
    productSearch = `[${p.sku || 'S/SKU'}] ${p.name}`;
    showDropdown = false;
  }

  async function handleSubmit() {
    loading = true;
    error = null;
    try {
      let finalNotes = notes;
      if (movementType === "Entrada" && invoiceNumber.trim() !== "") {
        finalNotes = `[Factura: ${invoiceNumber}] ${notes}`.trim();
      }

      await inventoryStore.addMovement({
        productId: parseInt(productId),
        type: movementType,
        quantity: quantity,
        notes: finalNotes,
      });
      dispatch("success");
      reset();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function reset() {
    productId = "";
    productSearch = "";
    movementType = "Entrada";
    quantity = 1;
    notes = "";
    invoiceNumber = "";
  }
</script>

<div class="card form-container">
  <div class="header">
    <h3>Registrar Movimiento</h3>
    <p>Entrada o salida de mercancía física</p>
  </div>

  {#if error}
    <div class="error-box">{error}</div>
  {/if}

  <form class="movement-form" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="product-search">Seleccionar Producto</label>
      <div class="search-container">
        <input 
          id="product-search"
          type="text" 
          bind:value={productSearch} 
          placeholder="Buscar por nombre o SKU..."
          on:focus={() => showDropdown = true}
          autocomplete="off"
        />
        {#if showDropdown && productSearch.length > 0}
          <div class="search-dropdown" transition:fade={{ duration: 150 }}>
            {#each filteredProducts as p}
              <button type="button" class="dropdown-item" on:click={() => selectProduct(p)}>
                <span class="item-sku">{p.sku || 'N/A'}</span>
                <span class="item-name">{p.name}</span>
              </button>
            {:else}
              <div class="dropdown-empty">No se encontraron productos</div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="form-row">
      <div class="field flex-grow">
        <span class="field-label">Tipo de Movimiento</span>
        <div class="toggle-group">
          <button
            type="button"
            class="toggle-btn {movementType === 'Entrada' ? 'active in' : ''}"
            on:click={() => (movementType = "Entrada")}
          >
            Entrada
          </button>
          <button
            type="button"
            class="toggle-btn {movementType === 'Salida' ? 'active out' : ''}"
            on:click={() => (movementType = "Salida")}
          >
            Salida
          </button>
          <button
            type="button"
            class="toggle-btn {movementType === 'Ajuste' ? 'active adjust' : ''}"
            on:click={() => (movementType = "Ajuste")}
          >
            Ajuste
          </button>
        </div>
      </div>

      <div class="field qty-field">
        <label for="qty">Cantidad</label>
        <div class="qty-input-wrapper">
          <input id="qty" type="number" min={movementType === 'Ajuste' ? '' : '1'} step="1" bind:value={quantity} required />
          {#if selectedProduct}
            <span class="unit-badge">{selectedProduct.unit}</span>
          {/if}
        </div>
      </div>
    </div>

    {#if movementType === "Entrada"}
      <div class="field" transition:fade={{ duration: 200 }}>
        <label for="invoice">Número de Factura / Proveedor</label>
        <input
          id="invoice"
          type="text"
          bind:value={invoiceNumber}
          placeholder="Ej: FAC-2026-001"
          required
        />
      </div>
    {/if}

    <div class="field">
      <label for="notes">Notas / Observaciones</label>
      <textarea
        id="notes"
        bind:value={notes}
        placeholder="Ej: Recepción de pedido #45 ..."
      ></textarea>
    </div>

    {#if movementType === 'Salida' || movementType === 'Ajuste'}
      <div class="warning-box">
        <strong>Aviso:</strong> Requiere autorización administrativa.
      </div>
    {/if}

    <button type="submit" class="submit-btn" disabled={loading || !productId}>
      {loading ? "Procesando..." : "Registrar Movimiento"}
    </button>
  </form>
</div>

<style>
  .form-container {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .header h3 {
    margin: 0;
    color: var(--text-main);
    font-size: 1.25rem;
    font-weight: 700;
  }

  .header p {
    margin: 0.25rem 0 0 0;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .movement-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
  }

  .flex-grow { flex: 1; }
  .qty-field { width: 90px; }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
  }

  label, .field-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-main);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background-color: #f8fafc;
    font-size: 0.9rem;
    color: var(--text-main);
    transition: all 0.2s;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    background-color: white;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.05);
  }

  /* Dropdown Search */
  .search-container { position: relative; }
  .search-dropdown {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    right: 0;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 50;
    overflow: hidden;
  }

  .dropdown-item {
    width: 100%;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.2s;
  }

  .dropdown-item:hover { background: #f8fafc; }
  .item-sku { font-size: 0.7rem; font-weight: 700; color: var(--color-primary); }
  .item-name { font-size: 0.85rem; color: var(--text-main); }
  .dropdown-empty { padding: 1rem; font-size: 0.85rem; color: var(--text-muted); text-align: center; }

  .toggle-group {
    display: flex;
    background-color: #f1f5f9;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .toggle-btn {
    flex: 1;
    padding: 0.5rem 0.25rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .toggle-btn.active.in { background: white; color: #059669; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
  .toggle-btn.active.out { background: white; color: #dc2626; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
  .toggle-btn.active.adjust { background: white; color: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

  .qty-input-wrapper { position: relative; }
  .unit-badge {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.65rem;
    font-weight: 700;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .submit-btn {
    background-color: var(--color-primary);
    color: white;
    padding: 0.85rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.9rem;
    transition: transform 0.2s, background 0.2s;
    margin-top: 0.5rem;
  }

  .submit-btn:hover:not(:disabled) { background-color: #1e40af; transform: translateY(-1px); }
  .submit-btn:active { transform: translateY(0); }

  .warning-box {
    background-color: #fffbeb;
    color: #92400e;
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    font-size: 0.75rem;
    border-left: 4px solid #f59e0b;
  }

  textarea { height: 70px; resize: none; }
</style>
