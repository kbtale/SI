<script>
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';
    import { inventoryStore } from '../inventoryStore.js';

    let doughnutCanvas;
    let barCanvas;
    
    let doughnutChart;
    let barChart;

    let entradasTotales = 0;
    let salidasTotales = 0;
    let porcentajeEntradas = 0;

    // Reactivity
    $: if ($inventoryStore.movements && (doughnutChart || barChart)) {
        updateCharts($inventoryStore.movements);
    }

    function updateCharts(movements) {
        if (!movements) return;

        // --- Aggregations for Doughnut ---
        entradasTotales = movements.filter(m => m.movement_type === 'Entrada').reduce((acc, current) => acc + current.quantity, 0);
        salidasTotales = movements.filter(m => m.movement_type === 'Salida').reduce((acc, current) => acc + current.quantity, 0);
        
        let totalMovimientos = entradasTotales + salidasTotales;
        porcentajeEntradas = totalMovimientos > 0 ? ((entradasTotales / totalMovimientos) * 100).toFixed(1) : 0;

        if (doughnutChart) {
            doughnutChart.data.datasets[0].data = totalMovimientos > 0 ? [entradasTotales, salidasTotales] : [1, 1];
            doughnutChart.update();
        }

        // --- Aggregations for Bar Chart ---
        const entradasPorMes = new Array(12).fill(0);
        const salidasPorMes = new Array(12).fill(0);

        movements.forEach(m => {
            const month = new Date(m.movement_date).getMonth();
            if (m.movement_type === 'Entrada') entradasPorMes[month] += m.quantity;
            if (m.movement_type === 'Salida') salidasPorMes[month] += m.quantity;
        });

        if (barChart) {
            barChart.data.datasets[0].data = entradasPorMes;
            barChart.data.datasets[1].data = salidasPorMes;
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
                    borderRadius: 10,
                    cutout: '75%'
                }]
            },
            options: {
                rotation: -90,
                circumference: 180,
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                maintainAspectRatio: false
            }
        });

        // Initialize Bar Chart
        const barCtx = barCanvas.getContext('2d');
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Entradas',
                        data: new Array(12).fill(0),
                        backgroundColor: '#3b82f6',
                        borderRadius: { topLeft: 999, topRight: 999 },
                        barPercentage: 0.6
                    },
                    {
                        label: 'Salidas',
                        data: new Array(12).fill(0),
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
                        grid: { color: '#e5e7eb', tickLength: 0, drawBorder: false },
                        border: { display: false, dash: [5, 5] },
                        ticks: { callback: function(value) { return value + ' unds'; } }
                    }
                }
            }
        });
        
        // Initial populate if data is already there
        if ($inventoryStore.movements) {
            updateCharts($inventoryStore.movements);
        }
    });
</script>

<div class="charts-wrapper">
    <!-- Doughnut Chart Card -->
    <div class="card chart-card doughnut-card">
        <div class="chart-header">
            <h3>Flujo de Movimientos</h3>
            <button class="menu-dots">&vellip;</button>
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
                <span class="pill-badge active">Mensual</span>
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

    .menu-dots {
        color: var(--text-muted);
        font-size: 1.25rem;
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
</style>
