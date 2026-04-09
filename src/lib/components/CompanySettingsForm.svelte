<script>
    import { inventoryStore } from '../inventoryStore.js';
    
    let companyName = $inventoryStore.companySettings.company_name;
    let subtitle = $inventoryStore.companySettings.company_subtitle;
    let logoIcon = $inventoryStore.companySettings.logo_icon;

    let loading = false;
    let success = false;
    let error = null;

    async function handleUpdate() {
        loading = true;
        error = null;
        success = false;
        try {
            await inventoryStore.updateCompanySettings({
                company_name: companyName,
                company_subtitle: subtitle,
                logo_icon: logoIcon
            });
            success = true;
            setTimeout(() => success = false, 3000);
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="settings-container">
    <div class="view-header">
        <h2>Configuración del Sistema</h2>
        <p>Gestiona la identidad visual y parámetros generales de la empresa.</p>
    </div>

    <div class="card settings-card">
        <h3>Identidad de la Empresa</h3>
        
        {#if success}
            <div class="success-banner">¡Configuración actualizada con éxito!</div>
        {/if}
        
        {#if error}
            <div class="error-banner">{error}</div>
        {/if}

        <form on:submit|preventDefault={handleUpdate} class="settings-form">
            <div class="row">
                <div class="field">
                    <label for="comp-name">Nombre de la Empresa</label>
                    <input id="comp-name" type="text" bind:value={companyName} required />
                </div>
                <div class="field">
                    <label for="comp-icon">Icono / Emoji</label>
                    <input id="comp-icon" type="text" bind:value={logoIcon} maxlength="2" style="width: 80px; text-align: center; font-size: 1.5rem;" />
                </div>
            </div>

            <div class="field">
                <label for="subtitle">Slogan o Subtítulo</label>
                <input id="subtitle" type="text" bind:value={subtitle} placeholder="Ej: Soluciones Eléctricas Integrales" />
            </div>

            <div class="actions">
                <button type="submit" class="save-btn" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    </div>

    <div class="card settings-card secondary">
        <h3>Seguridad y Usuarios</h3>
        <p class="desc">La gestión de roles y permisos está restringida a administradores del sistema.</p>
        <div class="info-list">
            <div class="info-item">
                <span>Estado de Supabase</span>
                <span class="status-pill">Conectado</span>
            </div>
            <div class="info-item">
                <span>Versión del Sistema</span>
                <span>v1.0.2-beta</span>
            </div>
        </div>
    </div>
</div>

<style>
    .settings-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .settings-card {
        padding: 2.5rem;
    }

    .settings-card h3 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        color: var(--text-main);
    }

    .settings-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .row {
        display: flex;
        gap: 1.5rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
    }

    label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
    }

    input {
        padding: 0.8rem 1rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        background-color: var(--bg-canvas);
        font-size: 0.95rem;
        color: var(--text-main);
    }

    .save-btn {
        background-color: var(--color-primary);
        color: white;
        padding: 0.85rem 2rem;
        border-radius: var(--radius-pill);
        font-weight: 600;
        margin-top: 1rem;
        cursor: pointer;
    }

    .success-banner {
        background-color: #d1fae5;
        color: #065f46;
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        text-align: center;
        border: 1px solid #10b981;
    }

    .error-banner {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
    }

    .secondary {
        border: 1px dashed var(--border-color);
        background-color: transparent;
    }

    .desc {
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .info-list {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: var(--text-muted);
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    .status-pill {
        color: #059669;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.7rem;
    }
</style>
