<script>
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import { inventoryStore } from '../inventoryStore.js';
    import { navigationStore } from '../navigationStore.js';
    import { downloadCSV } from '../utils/exportUtils.js';

    let doughnutCanvas;
    let barCanvas;
    
    let doughnutChart;
    let barChart;

    let entradasTotales = 0;
    let salidasTotales = 0;
    let porcentajeEntradas = 0;

    let selectedView = 'mensual';

    // Reactivity
    $: if ($inventoryStore.movements && (doughnutChart || barChart) && selectedView) {
        updateCharts($inventoryStore.movements);
    }

    function updateCharts(movements) {
        if (!movements) return;

        // --- Aggregations for Doughnut ---
        entradasTotales = movements.filter(m => m.movement_type === 'Entrada').reduce((acc, current) => acc + current.quantity, 0);
        salidasTotales = movements.filter(m => m.movement_type === 'Salida').reduce((acc, current) => acc + current.quantity, 0);
        
        let totalMovimientos = entradasTotales + salidasTotales;
        porcentajeEntradas = totalMovimientos > 0 ? parseFloat(((entradasTotales / totalMovimientos) * 100).toFixed(1)) : 0;

        if (doughnutChart) {
            doughnutChart.data.datasets[0].data = totalMovimientos > 0 ? [entradasTotales, salidasTotales] : [1, 1];
            doughnutChart.update();
        }

        // --- Aggregations for Bar Chart ---
        let labels = [];
        let entradasData = [];
        let salidasData = [];

        if (selectedView === 'diario') {
            const days = 30;
            const entries = new Map();
            const exits = new Map();
            
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                entries.set(key, 0);
                exits.set(key, 0);
                labels.push(new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short' }).format(d));
            }

            movements.forEach(m => {
                const key = new Date(m.movement_date).toISOString().split('T')[0];
                if (entries.has(key)) {
                    if (m.movement_type === 'Entrada') entries.set(key, entries.get(key) + m.quantity);
                    if (m.movement_type === 'Salida') exits.set(key, exits.get(key) + m.quantity);
                }
            });

            entradasData = Array.from(entries.values());
            salidasData = Array.from(exits.values());

        } else if (selectedView === 'semanal') {
            const weeks = 10;
            const entries = new Array(weeks).fill(0);
            const exits = new Array(weeks).fill(0);
            
            // Generate labels for the last 10 weeks
            for (let i = weeks - 1; i >= 0; i--) {
                const d = new Date();
                // Get the start of the current week (Sunday) and subtract i weeks
                d.setDate(d.getDate() - d.getDay() - (i * 7));
                labels.push(new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short' }).format(d));
            }

            movements.forEach(m => {
                const moveDate = new Date(m.movement_date);
                const diffTime = new Date().getTime() - moveDate.getTime();
                const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
                
                if (diffWeeks < weeks) {
                    const index = (weeks - 1) - diffWeeks;
                    if (m.movement_type === 'Entrada') entries[index] += m.quantity;
                    if (m.movement_type === 'Salida') exits[index] += m.quantity;
                }
            });

            entradasData = entries;
            salidasData = exits;

        } else {
            // Mensual (Current Year)
            const currentMonthIndex = new Date().getMonth();
            const entries = new Array(currentMonthIndex + 1).fill(0);
            const exits = new Array(currentMonthIndex + 1).fill(0);
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            labels = monthNames.slice(0, currentMonthIndex + 1);

            movements.forEach(m => {
                const movementDate = new Date(m.movement_date);
                const moveYear = movementDate.getFullYear();
                const currentYear = new Date().getFullYear();
                
                if (moveYear === currentYear) {
                    const month = movementDate.getMonth();
                    if (month <= currentMonthIndex) {
                        if (m.movement_type === 'Entrada') entries[month] += m.quantity;
                        if (m.movement_type === 'Salida') exits[month] += m.quantity;
                    }
                }
            });

            entradasData = entries;
            salidasData = exits;
        }

        if (barChart) {
            barChart.data.labels = labels;
            barChart.data.datasets[0].data = entradasData;
            barChart.data.datasets[1].data = salidasData;
            barChart.update();
        }
    }

    onMount(() => {
        // Initialize Doughnut Chart
        const doughnutCtx = doughnutCanvas.getContext('2d');
        doughnutChart = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Entradas', 'Salidas'],
                datasets: [{
                    data: [1, 1],
                    backgroundColor: ['#1e3a8a', '#e5e7eb'],
                    borderWidth: 0,
                    borderRadius: 10
                }]
            },
            options: {
                rotation: -90,
                circumference: 180,
                cutout: '75%',
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                maintainAspectRatio: false
            }
        });

        // Initialize Bar Chart (with empty data, updateCharts will populate)
        const barCtx = barCanvas.getContext('2d');
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Entradas',
                        data: [],
                        backgroundColor: '#3b82f6',
                        borderRadius: { topLeft: 999, topRight: 999 },
                        barPercentage: 0.6
                    },
                    {
                        label: 'Salidas',
                        data: [],
                        backgroundColor: '#047857',
                        borderRadius: { topLeft: 999, topRight: 999 },
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', align: 'end', labels: { boxWidth: 10, usePointStyle: true, pointStyle: 'circle' } }
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: {
                        grid: { color: '#e5e7eb', tickLength: 0 },
                        border: { display: false, dash: [5, 5] },
                        ticks: { callback: function(value) { return value + ' unds'; } }
                    }
                }
            }
        });
        
        if ($inventoryStore.movements) {
            updateCharts($inventoryStore.movements);
        }
    });

    function setView(view) {
        selectedView = view;
    }
    let showMenu = false;

    function toggleMenu() {
        showMenu = !showMenu;
    }

    function handleMenuAction(action) {
        showMenu = false;
        if (action === 'reporte') {
            navigationStore.setView('reportes');
        } else if (action === 'refresh') {
            inventoryStore.fetchAll();
        } else if (action === 'export') {
            const columns = {
                'movement_date': 'Fecha',
                'products.name': 'Producto',
                'movement_type': 'Tipo',
                'quantity': 'Cantidad',
                'notes': 'Notas'
            };
            downloadCSV($inventoryStore.movements, 'historial_movimientos.csv', columns);
        }
    }

    // Close menu on outside click
    function handleOutsideClick(e) {
        if (showMenu) showMenu = false;
    }
</script>

<svelte:window on:click={handleOutsideClick} />

<div class="charts-wrapper">
    <!-- Doughnut Chart Card -->
    <div class="card chart-card doughnut-card">
        <div class="chart-header">
            <h3>Flujo de Movimientos</h3>
            <div class="menu-container">
                <button class="menu-dots" on:click|stopPropagation={toggleMenu}>&vellip;</button>
                {#if showMenu}
                    <div class="dropdown-menu">
                        <button on:click={() => handleMenuAction('reporte')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                            Ver Análisis ABC
                        </button>
                        <button on:click={() => handleMenuAction('export')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                            Exportar Resumen
                        </button>
                        <hr />
                        <button on:click={() => handleMenuAction('refresh')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                            Sincronizar
                        </button>
                    </div>
                {/if}
            </div>
        </div>
        <div class="doughnut-container">
            <canvas bind:this={doughnutCanvas}></canvas>
            <div class="center-text">
                <h2>{porcentajeEntradas}%</h2>
                <p>Entradas</p>
            </div>
        </div>
        <p class="chart-footer-text">Entradas totales: <span class="pill-badge bg-blue">{entradasTotales}</span></p>
    </div>

    <!-- Bar Chart Card -->
    <div class="card chart-card bar-card">
        <div class="chart-header">
            <h3>Histórico de Movimientos</h3>
            <div class="filters">
                <button 
                  class="pill-badge {selectedView === 'diario' ? 'active' : ''}" 
                  on:click={() => setView('diario')}
                >Día</button>
                <button 
                  class="pill-badge {selectedView === 'semanal' ? 'active' : ''}" 
                  on:click={() => setView('semanal')}
                >Semana</button>
                <button 
                  class="pill-badge {selectedView === 'mensual' ? 'active' : ''}" 
                  on:click={() => setView('mensual')}
                >Mes</button>
            </div>
        </div>
        <div class="bar-container">
            <canvas bind:this={barCanvas}></canvas>
        </div>
    </div>
</div>

<style>
    .charts-wrapper {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .chart-card {
        display: flex;
        flex-direction: column;
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .chart-header h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-main);
    }

    .menu-container {
        position: relative;
    }

    .menu-dots {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.25rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-pill);
        transition: background 0.2s;
    }

    .menu-dots:hover {
        background: var(--bg-canvas);
        color: var(--text-main);
    }

    .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        width: 180px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-menu button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0.75rem;
        border: none;
        background: transparent;
        color: var(--text-main);
        font-size: 0.85rem;
        text-align: left;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        width: 100%;
    }

    .dropdown-menu button:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #1d4ed8;
    }

    .dropdown-menu hr {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 0.25rem 0;
    }

    .doughnut-container {
        position: relative;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .center-text {
        position: absolute;
        top: 55%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
    }

    .center-text h2 {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-main);
        line-height: 1;
    }

    .center-text p {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.25rem;
    }

    .chart-footer-text {
        text-align: center;
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-top: auto;
        padding-top: 1rem;
    }

    .bg-blue {
        background-color: #dbeafe;
        color: #1d4ed8;
        font-size: 0.7rem;
    }

    .bar-container {
        height: 250px;
        width: 100%;
        position: relative;
    }

    .filters {
        display: flex;
        gap: 0.5rem;
        background-color: var(--bg-canvas);
        border-radius: var(--radius-pill);
        padding: 0.25rem;
    }

    .filters .pill-badge {
        padding: 0.4rem 1rem;
        cursor: pointer;
        color: var(--text-muted);
    }

    .filters .pill-badge.active {
        background-color: var(--bg-card);
        color: var(--text-main);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    @media (max-width: 1024px) {
        .charts-wrapper {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 600px) {
        .charts-wrapper {
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .chart-card {
            padding: 1.25rem;
        }

        .chart-header {
            margin-bottom: 1rem;
        }

        .chart-header h3 {
            font-size: 0.95rem;
        }

        .doughnut-container {
            height: 160px;
        }

        .center-text h2 {
            font-size: 1.75rem;
        }

        .bar-container {
            height: 200px;
        }

        .filters .pill-badge {
            padding: 0.3rem 0.75rem;
            font-size: 0.7rem;
        }
    }
</style>
