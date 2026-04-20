<script>
  import { createEventDispatcher } from "svelte";
  import { inventoryStore } from "../inventoryStore.js";

  const dispatch = createEventDispatcher();

  let productId = "";
  let movementType = "Entrada";
  let quantity = 1;
  let notes = "";

  let loading = false;
  let error = null;

  $: selectedProduct = $inventoryStore.products.find(
    (p) => p.id === parseInt(productId),
  );

  async function handleSubmit() {
    loading = true;
    error = null;
    try {
      await inventoryStore.addMovement({
        productId: parseInt(productId),
        type: movementType,
        quantity: quantity,
        notes: notes,
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
    movementType = "Entrada";
    quantity = 1;
    notes = "";
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
      <label for="product">Seleccionar Producto</label>
      <select id="product" bind:value={productId} required>
        <option value="" disabled>-- Seleccione un producto --</option>
        {#each $inventoryStore.products as product}
          <option value={product.id}>
            [{product.sku}] {product.name} (Stock: {product.current_stock})
          </option>
        {/each}
      </select>
    </div>

    <div class="row">
      <div class="field">
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
        </div>
      </div>
      <div class="field">
        <label for="qty">Cantidad</label>
        <input id="qty" type="number" min="1" bind:value={quantity} required />
        {#if selectedProduct}
          <span class="unit-hint">{selectedProduct.unit}</span>
        {/if}
      </div>
    </div>

    <div class="field">
      <label for="notes">Notas / Observaciones</label>
      <textarea
        id="notes"
        bind:value={notes}
        placeholder="Ej: Recepción de pedido #45 ..."
      ></textarea>
    </div>

    <button type="submit" class="submit-btn" disabled={loading || !productId}>
      {loading ? "Procesando..." : "Registrar Movimiento"}
    </button>
  </form>
</div>

<style>
  .form-container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .header h3 {
    margin: 0;
    color: var(--text-main);
    font-size: 1.125rem;
  }

  .header p {
    margin: 0.25rem 0 0 0;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .movement-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .row {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 1.5rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    position: relative;
  }

  label,
  .field-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-main);
  }

  select,
  input,
  textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-canvas);
    font-size: 0.9rem;
    color: var(--text-main);
  }

  textarea {
    height: 80px;
    resize: none;
  }

  .unit-hint {
    position: absolute;
    right: 1rem;
    bottom: 0.75rem;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .toggle-group {
    display: flex;
    background-color: var(--bg-canvas);
    padding: 4px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-color);
  }

  .toggle-btn {
    flex: 1;
    padding: 0.5rem;
    border-radius: var(--radius-pill);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    transition: all 0.2s ease;
  }

  .toggle-btn.active.in {
    background-color: #d1fae5;
    color: #065f46;
  }

  .toggle-btn.active.out {
    background-color: #fee2e2;
    color: #b91c1c;
  }

  .submit-btn {
    background-color: var(--color-primary);
    color: white;
    padding: 0.85rem;
    border-radius: var(--radius-pill);
    font-weight: 600;
    margin-top: 0.5rem;
    cursor: pointer;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-box {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 0.75rem;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  @media (max-width: 600px) {
    .form-container {
      padding: 1.25rem;
      gap: 1rem;
    }

    .row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .toggle-btn {
      padding: 0.65rem;
      font-size: 0.9rem;
    }

    .submit-btn {
      padding: 1rem;
    }
  }
</style>
