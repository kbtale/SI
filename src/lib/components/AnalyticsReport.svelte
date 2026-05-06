<script>
    import { inventoryStore } from '../inventoryStore.js';
    import { downloadCSV } from '../utils/exportUtils.js';
    
    let stats = {
        classA: { count: 0, value: 0 },
        classB: { count: 0, value: 0 },
        classC: { count: 0, value: 0 },
        totalValue: 0
    };

    let topProducts = [];
    let categoryBreakdown = [];

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

            // Calculate Top 5 Products by Investment Value
            topProducts = [...products]
                .map(p => ({
                    ...p,
                    totalValue: p.current_stock * p.unit_cost
                }))
                .sort((a, b) => b.totalValue - a.totalValue)
                .slice(0, 5);

            // Calculate Category Investment Breakdown
            const catMap = {};
            products.forEach(p => {
                const cat = p.category || 'Sin Cat.';
                const val = p.current_stock * p.unit_cost;
                catMap[cat] = (catMap[cat] || 0) + val;
            });
            categoryBreakdown = Object.entries(catMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
        }
    }

    function formatCurrency(val) {
        return val.toLocaleString('es-VE', { style: 'currency', currency: 'USD' });
    }

    function handleExportCSV() {
        const productsToExport = ($inventoryStore.products || []).map(p => ({
            sku: p.sku || 'N/A',
            name: p.name,
            category: p.category || 'N/A',
            current_stock: p.current_stock,
            unit: p.unit,
            unit_cost: p.unit_cost,
            total_value: p.current_stock * p.unit_cost,
            abc_class: p.abc_class || 'C',
            safety_stock: p.safety_stock,
            reorder_point: p.reorder_point
        }));

        const columns = {
            sku: "SKU",
            name: "Producto",
            category: "Categoría",
            current_stock: "Existencias",
            unit: "Unidad",
            unit_cost: "Costo Unitario ($)",
            total_value: "Valor de Inversión ($)",
            abc_class: "Clase ABC"
        };

        downloadCSV(productsToExport, "informe_valoracion_abc.csv", columns);
    }

    function handlePrint() {
        window.print();
    }
</script>

<div class="report-container">
    <div class="view-header hide-print">
        <div class="header-actions">
            <button class="pill-badge secondary-btn" on:click={handleExportCSV}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Exportar CSV
            </button>
            <button class="pill-badge action-btn" on:click={handlePrint}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Imprimir Reporte
            </button>
        </div>
    </div>

    <div class="grid">
        <div class="card analysis-card">
            <h3>Distribución de Inversión por Prioridad (ABC)</h3>
            <div class="chart-mock">
                <div class="bar-group">
                    <div class="bar-label">Inversión Alta · Prioridad Máxima (Clase A · {stats.classA.count} prod.)</div>
                    <div class="progress-track">
                        <div class="progress-fill a" style="width: {stats.totalValue > 0 ? (stats.classA.value / stats.totalValue * 100) : 0}%"></div>
                    </div>
                    <div class="bar-value">{formatCurrency(stats.classA.value)}</div>
                </div>
                <div class="bar-group">
                    <div class="bar-label">Inversión Media · Prioridad Moderada (Clase B · {stats.classB.count} prod.)</div>
                    <div class="progress-track">
                        <div class="progress-fill b" style="width: {stats.totalValue > 0 ? (stats.classB.value / stats.totalValue * 100) : 0}%"></div>
                    </div>
                    <div class="bar-value">{formatCurrency(stats.classB.value)}</div>
                </div>
                <div class="bar-group">
                    <div class="bar-label">Inversión Baja · Prioridad Habitual (Clase C · {stats.classC.count} prod.)</div>
                    <div class="progress-track">
                        <div class="progress-fill c" style="width: {stats.totalValue > 0 ? (stats.classC.value / stats.totalValue * 100) : 0}%"></div>
                    </div>
                    <div class="bar-value">{formatCurrency(stats.classC.value)}</div>
                </div>
            </div>
            <p class="chart-desc">Los artículos de <strong>Prioridad Máxima (Clase A)</strong> concentran la mayor parte de tu capital de trabajo invertido. Se aconseja supervisar con especial detalle sus niveles de stock para evitar roturas.</p>
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

    <!-- Bottom Breakdown Row -->
    <div class="reports-grid-bottom">
        <div class="card sub-card">
            <h3>Categorías de Mayor Inversión</h3>
            <div class="category-bars">
                {#each categoryBreakdown.slice(0, 3) as cat}
                    <div class="bar-group-alt">
                        <div class="bar-header-info">
                            <span class="cat-name">{cat.name}</span>
                            <span class="cat-pct">{stats.totalValue > 0 ? Math.round(cat.value / stats.totalValue * 100) : 0}%</span>
                        </div>
                        <div class="progress-track-alt">
                            <div class="progress-fill-alt" style="width: {stats.totalValue > 0 ? (cat.value / stats.totalValue * 100) : 0}%"></div>
                        </div>
                        <span class="cat-val">{formatCurrency(cat.value)}</span>
                    </div>
                {/each}
            </div>
        </div>

        <div class="card sub-card">
            <h3>Top 5 Productos de Mayor Valor</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Stock</th>
                        <th>Inversión</th>
                    </tr>
                </thead>
                <tbody>
                    {#each topProducts as prod}
                        <tr>
                            <td>
                                <div class="prod-cell">
                                    <span class="prod-name">{prod.name}</span>
                                    <span class="prod-sku">{prod.sku || 'N/A'}</span>
                                </div>
                            </td>
                            <td>{prod.current_stock} <span class="unit">{prod.unit || 'und'}</span></td>
                            <td class="prod-value">{formatCurrency(prod.totalValue)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
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

    /* Additional Reports styling */
    .reports-grid-bottom {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-top: 1.5rem;
    }

    .sub-card {
        padding: 2rem;
    }

    .sub-card h3 {
        margin: 0 0 1.5rem 0;
        font-size: 1.1rem;
        color: var(--text-main);
    }

    .category-bars {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .bar-group-alt {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .bar-header-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
    }

    .cat-pct {
        color: var(--color-primary);
        font-weight: 700;
    }

    .progress-track-alt {
        height: 10px;
        background-color: var(--bg-canvas);
        border-radius: 5px;
        overflow: hidden;
    }

    .progress-fill-alt {
        height: 100%;
        background-color: var(--color-secondary);
        border-radius: 5px;
        transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cat-val {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-align: right;
        display: block;
    }

    .report-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    .report-table th {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color);
    }

    .report-table td {
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.85rem;
    }

    .report-table tr:last-child td {
        border-bottom: none;
    }

    .prod-cell {
        display: flex;
        flex-direction: column;
    }

    .prod-name {
        font-weight: 600;
        color: var(--text-main);
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .prod-sku {
        font-size: 0.7rem;
        color: var(--text-muted);
        font-family: monospace;
    }

    .prod-value {
        font-weight: 700;
        color: var(--text-main);
        text-align: right;
    }

    .report-table th:last-child, .report-table td:last-child {
        text-align: right;
    }

    .unit {
        color: var(--text-muted);
        font-size: 0.75rem;
    }

    @media (max-width: 900px) {
        .reports-grid-bottom {
            grid-template-columns: 1fr;
        }
    }

    /* Header Actions and Button Styling */
    .view-header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .header-actions {
        display: flex;
        gap: 0.75rem;
    }

    .pill-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.25rem;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.85rem;
        border-radius: var(--radius-pill);
        transition: all 0.2s ease;
    }

    .secondary-btn {
        background-color: var(--bg-canvas);
        color: var(--text-main);
        border: 1px solid var(--border-color);
    }

    .secondary-btn:hover {
        background-color: var(--bg-card);
        border-color: var(--color-primary);
        color: var(--color-primary);
    }

    .action-btn {
        background-color: var(--bg-canvas);
        color: var(--color-primary);
        border: 1px solid var(--color-primary);
    }

    .action-btn:hover {
        background-color: var(--color-primary);
        color: white;
    }
</style>
