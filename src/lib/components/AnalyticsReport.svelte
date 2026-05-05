<script>
    import { inventoryStore } from '../inventoryStore.js';
    
    let stats = {
        classA: { count: 0, value: 0 },
        classB: { count: 0, value: 0 },
        classC: { count: 0, value: 0 },
        totalValue: 0
    };

    $: {
        if ($inventoryStore.products) {
            const products = $inventoryStore.products;
            let a = { count: 0, value: 0 };
            let b = { count: 0, value: 0 };
            let c = { count: 0, value: 0 };
            let total = 0;

            products.forEach(p => {
                const val = p.current_stock * p.unit_cost;
                total += val;
                if (p.abc_class === 'A') { a.count++; a.value += val; }
                else if (p.abc_class === 'B') { b.count++; b.value += val; }
                else { c.count++; c.value += val; }
            });

            stats = { classA: a, classB: b, classC: c, totalValue: total };
        }
    }

    function formatCurrency(val) {
        return val.toLocaleString('es-VE', { style: 'currency', currency: 'USD' });
    }
</script>

<div class="report-container">
    <div class="view-header">
    </div>

    <div class="grid">
        <div class="card analysis-card">
            <h3>Distribución Pareto (ABC)</h3>
            <div class="chart-mock">
                <div class="bar-group">
                    <div class="bar-label">Clase A ({stats.classA.count})</div>
                    <div class="progress-track">
                        <div class="progress-fill a" style="width: {stats.totalValue > 0 ? (stats.classA.value / stats.totalValue * 100) : 0}%"></div>
                    </div>
                    <div class="bar-value">{formatCurrency(stats.classA.value)}</div>
                </div>
                <div class="bar-group">
                    <div class="bar-label">Clase B ({stats.classB.count})</div>
                    <div class="progress-track">
                        <div class="progress-fill b" style="width: {stats.totalValue > 0 ? (stats.classB.value / stats.totalValue * 100) : 0}%"></div>
                    </div>
                    <div class="bar-value">{formatCurrency(stats.classB.value)}</div>
                </div>
                <div class="bar-group">
                    <div class="bar-label">Clase C ({stats.classC.count})</div>
                    <div class="progress-track">
                        <div class="progress-fill c" style="width: {stats.totalValue > 0 ? (stats.classC.value / stats.totalValue * 100) : 0}%"></div>
                    </div>
                    <div class="bar-value">{formatCurrency(stats.classC.value)}</div>
                </div>
            </div>
            <p class="chart-desc">La Clase A representa los productos que concentran el mayor valor de inversión del almacén.</p>
        </div>

        <div class="card summary-box">
            <div class="metric">
                <span class="m-label">Inversión Total</span>
                <span class="m-valueHighlight">{formatCurrency(stats.totalValue)}</span>
            </div>
            <div class="metric-list">
                <div class="m-item">
                    <span>Rotación de Inventario</span>
                    <span class="m-badge">Óptima</span>
                </div>
                <div class="m-item">
                    <span>Productos en Riesgo</span>
                    <span class="m-badge-err">{$inventoryStore.products.filter(p => p.current_stock <= p.safety_stock).length}</span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .report-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 1.5rem;
    }

    .analysis-card {
        padding: 2rem;
    }

    .analysis-card h3 {
        margin: 0 0 2rem 0;
        font-size: 1.1rem;
        color: var(--text-main);
    }

    .chart-mock {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .bar-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .bar-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
    }

    .progress-track {
        height: 12px;
        background-color: var(--bg-canvas);
        border-radius: 6px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .progress-fill.a { background-color: var(--color-primary); }
    .progress-fill.b { background-color: var(--color-secondary); }
    .progress-fill.c { background-color: #94a3b8; }

    .bar-value {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-align: right;
    }

    .chart-desc {
        margin-top: 2rem;
        font-size: 0.8rem;
        color: var(--text-muted);
        border-left: 3px solid var(--color-primary);
        padding-left: 1rem;
    }

    .summary-box {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .metric {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .m-label {
        font-size: 0.9rem;
        color: var(--text-muted);
        font-weight: 500;
    }

    .m-valueHighlight {
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--color-primary);
    }

    .metric-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .m-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: var(--bg-canvas);
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
    }

    .m-badge {
        color: #059669;
        background-color: #d1fae5;
        padding: 0.2rem 0.6rem;
        border-radius: 99px;
        font-size: 0.7rem;
    }

    .m-badge-err {
        color: #b91c1c;
        background-color: #fee2e2;
        padding: 0.2rem 0.6rem;
        border-radius: 99px;
        font-size: 0.7rem;
    }

    @media (max-width: 768px) {
        .grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 600px) {
        .grid {
            gap: 0.75rem;
        }

        .analysis-card {
            padding: 1.25rem;
        }

        .summary-box {
            padding: 1.25rem;
            gap: 1.5rem;
        }

        .m-valueHighlight {
            font-size: 1.5rem;
        }

        .m-item {
            padding: 0.75rem;
            font-size: 0.8rem;
        }
    }
</style>
