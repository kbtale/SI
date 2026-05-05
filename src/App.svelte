<script>
  import { onMount } from 'svelte';
  import { inventoryStore } from './lib/inventoryStore.js';
  import { authStore } from './lib/authStore.js';
  import { navigationStore } from './lib/navigationStore.js';
  import DashboardLayout from './lib/components/DashboardLayout.svelte';
  import SummaryCards from './lib/components/SummaryCards.svelte';
  import DashboardCharts from './lib/components/DashboardCharts.svelte';
  import MovementsTable from './lib/components/MovementsTable.svelte';
  import NewMovementForm from './lib/components/NewMovementForm.svelte';
  import ProductsTable from './lib/components/ProductsTable.svelte';
  import ProductForm from './lib/components/ProductForm.svelte';
  import AnalyticsReport from './lib/components/AnalyticsReport.svelte';
  import CompanySettingsForm from './lib/components/CompanySettingsForm.svelte';
  import Login from './lib/components/Login.svelte';

  let showProductForm = false;

  $: if ($authStore.session) {
      inventoryStore.fetchCompanySettings();
      inventoryStore.fetchProducts();
      inventoryStore.fetchMovements();
  }

  $: if ($navigationStore.currentView === 'configuracion' && $authStore.role !== 'admin') {
    navigationStore.setView('inicio');
  }

  onMount(() => {
    authStore.initialize();
  });
</script>

{#if $authStore.initializing}
    <!-- Initial verification state is fast, we just show blank or a loader -->
    <div style="height: 100vh; display: flex; align-items:center; justify-content:center; color:#9ca3af;">
      Cargando aplicación...
    </div>
{:else if !$authStore.session}
    <Login />
{:else}
    <DashboardLayout>
      {#if $navigationStore.currentView === 'inicio'}
        <SummaryCards />
        <DashboardCharts />
        <div class="bottom-section">
            <MovementsTable />
        </div>
      {:else if $navigationStore.currentView === 'inventario'}
        <div class="inventory-view">
          {#if showProductForm}
            <div class="modal-overlay">
              <ProductForm 
                on:close={() => showProductForm = false} 
                on:success={() => showProductForm = false} 
              />
            </div>
          {/if}

          <ProductsTable on:showAddForm={() => showProductForm = true} />
        </div>
      {:else if $navigationStore.currentView === 'movimientos'}
        <div class="movements-view-grid">
            <div class="col-main">
                <MovementsTable />
            </div>
            <div class="col-side">
                <NewMovementForm />
            </div>
        </div>
      {:else if $navigationStore.currentView === 'reportes'}
        <AnalyticsReport />
      {:else if $navigationStore.currentView === 'configuracion'}
        <CompanySettingsForm />
      {/if}
    </DashboardLayout>
{/if}

<style>
  .bottom-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
  }

  .view-header {
      margin-bottom: 1rem;
  }

  .view-header h2 {
      font-size: 1.75rem;
      color: var(--text-main);
      margin: 0;
  }

  .view-header p {
      color: var(--text-muted);
      margin: 0.25rem 0 0 0;
  }

  /* Grid for movements view */
  .movements-view-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
      align-items: stretch;
      margin-top: 1rem;
  }

  .col-main {
      display: flex;
      flex-direction: column;
      gap: 1rem;
  }

  .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(30, 58, 138, 0.4);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
  }

  .col-side {
      position: sticky;
      top: 1.5rem;
      align-self: start;
  }

  @media (max-width: 1200px) {
      .movements-view-grid {
          grid-template-columns: 1fr 340px;
      }
  }

  @media (max-width: 1024px) {
      .movements-view-grid {
          grid-template-columns: 1fr;
      }
      .col-side {
          position: static;
          order: -1;
      }
  }
</style>
