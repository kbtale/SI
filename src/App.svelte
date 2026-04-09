<script>
  import { onMount } from 'svelte';
  import { inventoryStore } from './lib/inventoryStore.js';
  import { authStore } from './lib/authStore.js';
  
  import DashboardLayout from './lib/components/DashboardLayout.svelte';
  import SummaryCards from './lib/components/SummaryCards.svelte';
  import DashboardCharts from './lib/components/DashboardCharts.svelte';
  import MovementsTable from './lib/components/MovementsTable.svelte';
  import Login from './lib/components/Login.svelte';

  // Watch for auth state directly so we can mount the dashboard data when logged in
  $: if ($authStore.session) {
      inventoryStore.fetchCompanySettings();
      inventoryStore.fetchProducts();
      inventoryStore.fetchMovements();
  }

  // Fetch initial auth session silently on mount
  onMount(() => {
    authStore.initialize();
  });
</script>

{#if $authStore.loading && $authStore.session === null}
    <!-- Initial verification state is fast, we just show blank or a loader -->
    <div style="height: 100vh; display: flex; align-items:center; justify-content:center; color:#9ca3af;">
      Cargando aplicación...
    </div>
{:else if !$authStore.session}
    <Login />
{:else}
    <DashboardLayout>
      <!-- Summary Cards Row -->
      <SummaryCards />

      <!-- Charts Row -->
      <DashboardCharts />

      <!-- Table Row -->
      <div class="bottom-section">
          <MovementsTable />
      </div>
    </DashboardLayout>
{/if}

<style>
  .bottom-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
  }
</style>
