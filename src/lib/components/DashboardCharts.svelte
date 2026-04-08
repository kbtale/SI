<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let doughnutCanvas;
    let barCanvas;

    onMount(() => {
        // 1. Half-Doughnut Chart
        const doughnutCtx = doughnutCanvas.getContext('2d');
        new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Vendido', 'En Inventario'],
                datasets: [{
                    data: [67.2, 32.8],
                    backgroundColor: [
                        '#1e3a8a', // primary blue
                        '#e5e7eb'  // light gray track
                    ],
                    borderWidth: 0,
                    borderRadius: 10,
                    cutout: '75%'
                }]
            },
            options: {
                rotation: -90,
                circumference: 180,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                maintainAspectRatio: false
            }
        });

        // 2. Bar Chart
        const barCtx = barCanvas.getContext('2d');
        // Example mock data per the design
        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'];
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: [12, 19, 15, 25, 20, 30, 28],
                        backgroundColor: '#3b82f6', // Light blue fill wrapper pattern
                        borderRadius: { topLeft: 999, topRight: 999 },
                        barPercentage: 0.6
                    },
                    {
                        label: 'Egresos',
                        data: [8, 12, 10, 18, 15, 20, 18],
                        backgroundColor: '#047857', // Semi-dark green
                        borderRadius: { topLeft: 999, topRight: 999 },
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: { boxWidth: 10, usePointStyle: true, pointStyle: 'circle' }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    },
                    y: {
                        grid: {
                            color: '#e5e7eb',
                            tickLength: 0,
                            drawBorder: false,
                        },
                        border: { display: false, dash: [5, 5] },
                        ticks: {
                            callback: function(value) { return '$' + value + 'K'; }
                        }
                    }
                }
            }
        });
    });
</script>

<div class="charts-wrapper">
    <!-- Doughnut Chart Card -->
    <div class="card chart-card doughnut-card">
        <div class="chart-header">
            <h3>Estado de Ventas/Inventario</h3>
            <button class="menu-dots">&vellip;</button>
        </div>
        <div class="doughnut-container">
            <canvas bind:this={doughnutCanvas}></canvas>
            <!-- Center Text absolute setup -->
            <div class="center-text">
                <h2>67.2%</h2>
                <p>Meta Completada</p>
            </div>
        </div>
        <p class="chart-footer-text">El volumen de productos ha incrementado <span class="pill-badge bg-blue">+10%</span></p>
    </div>

    <!-- Bar Chart Card -->
    <div class="card chart-card bar-card">
        <div class="chart-header">
            <h3>Análisis de Productos</h3>
            <div class="filters">
                <span class="pill-badge active">Mensual</span>
                <span class="pill-badge">Anual</span>
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
