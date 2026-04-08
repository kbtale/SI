<script>
  import { onMount } from 'svelte';
  import { inventoryStore } from './lib/inventoryStore.js';
  
  import DashboardLayout from './lib/components/DashboardLayout.svelte';
  import SummaryCards from './lib/components/SummaryCards.svelte';
  import DashboardCharts from './lib/components/DashboardCharts.svelte';
  import MovementsTable from './lib/components/MovementsTable.svelte';

  // Fetch initial data
  onMount(async () => {
    await inventoryStore.fetchCompanySettings();
    await inventoryStore.fetchProducts();
    await inventoryStore.fetchMovements();
  });
</script>

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

<style>
  .bottom-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
  }
</style>
