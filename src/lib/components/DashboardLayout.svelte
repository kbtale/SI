<script>
    import { inventoryStore } from '../inventoryStore.js';
    export let userRole = 'admin'; // Mock passing down
</script>

<div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar card">
        <div class="logo">
            <div class="logo-icon">{$inventoryStore.companySettings.logo_icon}</div>
            <h2>{$inventoryStore.companySettings.company_name}<br><span>{$inventoryStore.companySettings.company_subtitle}</span></h2>
        </div>

        <nav class="nav-links">
            <a href="#inicio" class="nav-item active">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Inicio
            </a>
            <a href="#inventario" class="nav-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><polyline points="12 22 12 12"/></svg>
                Inventario
            </a>
            <a href="#movimientos" class="nav-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/></svg>
                Movimientos
            </a>
            <a href="#reportes" class="nav-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                Reportes
            </a>
            <a href="#configuracion" class="nav-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                Configuración
            </a>
        </nav>
        
        <div class="sidebar-footer">
            <button class="help-btn pill-badge">Centro de Ayuda</button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Top Navigation -->
        <header class="top-nav">
            <div class="search-bar">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" placeholder="Buscar productos, movimientos...">
            </div>

            <div class="top-nav-actions">
                <button class="icon-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    <span class="notification-dot"></span>
                </button>
                <button class="icon-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
                <div class="user-profile">
                    <img src="https://ui-avatars.com/api/?name=Admin+Reyes&background=1e3a8a&color=fff" alt="User Avatar" class="avatar" />
                </div>
            </div>
        </header>

        <!-- Dynamic Content Slot -->
        <div class="content-wrapper">
            <slot />
        </div>
    </main>
</div>

<style>
    .dashboard-layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        min-height: 100vh;
        background-color: var(--bg-canvas);
        padding: 1.5rem;
        gap: 1.5rem;
    }

    /* Sidebar */
    .sidebar {
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        position: sticky;
        top: 1.5rem;
        height: calc(100vh - 3rem);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 2.5rem;
    }

    .logo-icon {
        background-color: var(--color-primary);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
    }

    .logo h2 {
        font-size: 1.1rem;
        color: var(--text-main);
        line-height: 1.2;
    }

    .logo span {
        font-size: 0.75rem;
        color: var(--color-secondary);
        font-weight: 500;
    }

    .nav-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        border-radius: var(--radius-pill);
        color: var(--text-muted);
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .nav-item:hover {
        background-color: var(--bg-canvas);
        color: var(--color-primary);
    }

    .nav-item.active {
        background-color: var(--color-primary);
        color: white;
        box-shadow: 0 4px 14px rgba(30, 58, 138, 0.25);
    }

    .sidebar-footer {
        margin-top: auto;
    }

    .help-btn {
        width: 100%;
        background-color: var(--bg-canvas);
        color: var(--text-main);
        padding: 0.75rem;
    }

    /* Main Content */
    .main-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--bg-card);
        padding: 1rem 1.5rem;
        border-radius: var(--radius-pill);
        box-shadow: var(--shadow-soft);
    }

    .search-bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background-color: var(--bg-canvas);
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-pill);
        flex: 1;
        max-width: 400px;
    }

    .search-icon {
        color: var(--text-muted);
    }

    .search-bar input {
        border: none;
        background: transparent;
        width: 100%;
        font-size: 0.9rem;
        color: var(--text-main);
    }

    .search-bar input::placeholder {
        color: var(--text-light);
    }

    .top-nav-actions {
        display: flex;
        align-items: center;
        gap: 1.25rem;
    }

    .icon-btn {
        position: relative;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: transparent;
    }

    .icon-btn:hover {
        background-color: var(--bg-canvas);
    }

    .notification-dot {
        position: absolute;
        top: 6px;
        right: 8px;
        width: 8px;
        height: 8px;
        background-color: #ef4444; /* red */
        border-radius: 50%;
        border: 2px solid var(--bg-card);
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-left: 0.5rem;
        border-left: 1px solid var(--border-color);
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    .content-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
</style>
