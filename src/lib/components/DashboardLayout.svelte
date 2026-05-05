<script>
  import { onMount } from "svelte";
  import { inventoryStore } from "../inventoryStore.js";
  import { authStore } from "../authStore.js";
  import { navigationStore } from "../navigationStore.js";
  import { fade } from "svelte/transition";
  import HelpModal from "./HelpModal.svelte";

  let showNotifications = false;
  let showHelpModal = false;
  let topSearch = "";
  let isSidebarOpen = false;

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function closeSidebar() {
    isSidebarOpen = false;
  }

  $: notifications = $inventoryStore.products
    .filter((p) => p.current_stock <= p.reorder_point)
    .map((p) => ({
      id: p.id,
      title: "Stock Crítico",
      message: `${p.name} tiene solo ${p.current_stock} ${p.unit}`,
      sku: p.sku,
    }));

  function handleSearchEnter(e) {
    if (e.key === "Enter") {
      navigationStore.setSearchQuery(topSearch);
      navigationStore.setView("inventario");
    }
  }

  onMount(() => {
    const handleHashChange = () => {
      navigationStore.syncWithHash();
      isSidebarOpen = false; // Close on navigation
    };
    window.addEventListener("hashchange", handleHashChange);

    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest(".notifications-wrapper")) {
        showNotifications = false;
      }
      if (isSidebarOpen && e.target.closest(".main-content")) {
        isSidebarOpen = false;
      }
    };
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<div class="dashboard-layout">
  <!-- Sidebar Backdrop -->
  {#if isSidebarOpen}
    <button
      type="button"
      class="sidebar-backdrop"
      on:click={closeSidebar}
      on:keydown={(e) => e.key === "Escape" && closeSidebar()}
      aria-label="Cerrar menú lateral"
      transition:fade={{ duration: 200 }}
    ></button>
  {/if}

  <!-- Sidebar -->
  <aside class="sidebar card {isSidebarOpen ? 'open' : ''}">
    <div class="logo">
      <div class="logo-icon">
        {#if $inventoryStore.companySettings.logo_url}
          <img
            src={$inventoryStore.companySettings.logo_url}
            alt="Logo"
            class="logo-img"
          />
        {:else}
          {$inventoryStore.companySettings.logo_icon}
        {/if}
      </div>
      <h2>
        {$inventoryStore.companySettings.company_name}<br /><span>
          {$inventoryStore.companySettings.company_subtitle}</span
        >
      </h2>
      <button class="close-sidebar-btn" on:click={closeSidebar} aria-label="Cerrar menú lateral">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><line x1="18" y1="6" x2="6" y2="18" /><line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
          /></svg
        >
      </button>
    </div>

    <nav class="nav-links">
      <a
        href="#inicio"
        class="nav-item {$navigationStore.currentView === 'inicio'
          ? 'active'
          : ''}"
        on:click={() => navigationStore.setView("inicio")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline
            points="9 22 9 12 15 12 15 22"
          /></svg
        >
        Inicio
      </a>
      <a
        href="#inventario"
        class="nav-item {$navigationStore.currentView === 'inventario'
          ? 'active'
          : ''}"
        on:click={() => navigationStore.setView("inventario")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          /><polyline points="3.29 7 12 12 20.71 7" /><polyline
            points="12 22 12 12"
          /></svg
        >
        Inventario
      </a>
      <a
        href="#movimientos"
        class="nav-item {$navigationStore.currentView === 'movimientos'
          ? 'active'
          : ''}"
        on:click={() => navigationStore.setView("movimientos")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M12 2v20" /><path d="m17 5-5-3-5 3" /><path
            d="m17 19-5 3-5-3"
          /></svg
        >
        Movimientos
      </a>
      <a
        href="#reportes"
        class="nav-item {$navigationStore.currentView === 'reportes'
          ? 'active'
          : ''}"
        on:click={() => navigationStore.setView("reportes")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg
        >
        Reportes
      </a>
      {#if $authStore.role === "admin"}
        <a
          href="#configuracion"
          class="nav-item {$navigationStore.currentView === 'configuracion'
            ? 'active'
            : ''}"
          on:click={() => navigationStore.setView("configuracion")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            /><circle cx="12" cy="12" r="3" /></svg
          >
          Configuración
        </a>
      {/if}
    </nav>

    <div class="sidebar-footer">
      <button
        class="help-btn pill-badge"
        on:click|stopPropagation={() => {
          showHelpModal = true;
          closeSidebar();
        }}>Centro de Ayuda</button
      >
      <button
        class="logout-sidebar-btn pill-badge mt-2"
        on:click={() => authStore.signOut()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Cerrar sesión
      </button>
    </div>
  </aside>

  {#if showHelpModal}
    <HelpModal on:close={() => (showHelpModal = false)} />
  {/if}

  <!-- Main Content -->
  <main class="main-content">
    <!-- Top Navigation -->
    <header class="top-nav">
        <div class="top-nav-left-group">
          <button
            class="hamburger-btn"
            on:click|stopPropagation={toggleSidebar}
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><line x1="3" y1="12" x2="21" y2="12" /><line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
              /><line x1="3" y1="18" x2="21" y2="18" /></svg
            >
          </button>
          
          <div class="view-title-context">
            <h2>
              {#if $navigationStore.currentView === 'inicio'}Inicio
              {:else if $navigationStore.currentView === 'inventario'}Inventario
              {:else if $navigationStore.currentView === 'movimientos'}Movimientos
              {:else if $navigationStore.currentView === 'reportes'}Reportes
              {:else if $navigationStore.currentView === 'configuracion'}Configuración
              {/if}
            </h2>
          </div>

          <div class="search-bar">
            <svg
              class="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
            >
            <input
              type="text"
              placeholder="Buscar..."
              bind:value={topSearch}
              on:keydown={handleSearchEnter}
            />
          </div>
        </div>

      <div class="top-nav-actions">
        <div class="notifications-wrapper">
          <button
            class="icon-btn"
            aria-label="Notificaciones"
            on:click|stopPropagation={() =>
              (showNotifications = !showNotifications)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path
                d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
              /></svg
            >
            {#if notifications.length > 0}
              <span class="notification-dot"></span>
            {/if}
          </button>

          {#if showNotifications}
            <div class="notifications-dropdown card">
              <div class="dropdown-header">
                <h4>Notificaciones</h4>
                <span class="badge">{notifications.length}</span>
              </div>
              <div class="dropdown-content">
                {#if notifications.length === 0}
                  <div class="empty-state">No hay alertas pendientes</div>
                {:else}
                  {#each notifications.slice(0, 5) as note}
                    <button
                      class="note-item"
                      on:click={() => {
                        navigationStore.setView("inventario");
                        showNotifications = false;
                      }}
                    >
                      <div class="note-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                      </div>
                      <div class="note-info">
                        <span class="note-title">{note.title}</span>
                        <span class="note-msg">{note.message}</span>
                      </div>
                    </button>
                  {/each}
                {/if}
              </div>
            </div>
          {/if}
        </div>
        {#if $authStore.role === "admin"}
          <button
            class="icon-btn"
            aria-label="Configuración"
            on:click={() => navigationStore.setView("configuracion")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><circle cx="12" cy="12" r="3" /><path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              /></svg
            >
          </button>
        {/if}
        <div class="user-profile">
          <div class="user-info">
            <span class="user-name"
              >{$authStore.user?.user_metadata?.displayName ||
                $authStore.user?.email ||
                "Usuario"}</span
            >
            <button class="logout-link" on:click={() => authStore.signOut()}
              >Cerrar sesión</button
            >
          </div>
          <img
            src="https://ui-avatars.com/api/?name={$authStore.user
              ?.user_metadata?.displayName || 'U'}&background=1e3a8a&color=fff"
            alt="User Avatar"
            class="avatar"
          />
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
    background-color: white;
    color: var(--color-primary);
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid var(--border-color);
  }

  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 2px;
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

  .mt-2 {
    margin-top: 0.5rem;
  }

  .logout-sidebar-btn {
    width: 100%;
    background-color: #fee2e2;
    color: #ef4444;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .logout-sidebar-btn:hover {
    background-color: #fecACA;
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
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-soft);
  }

  .top-nav-left-group {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
  }

  .view-title-context h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
    white-space: nowrap;
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
    background-color: #ef4444;
    border-radius: 50%;
    border: 2px solid var(--bg-card);
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-left: 1rem;
    border: none;
    border-left: 1px solid var(--border-color);
    background: transparent;
    cursor: pointer;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .user-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .logout-link {
    font-size: 0.75rem;
    color: #ef4444;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .logout-link:hover {
    text-decoration: underline;
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

  /* Notifications Dropdown */
  .notifications-wrapper {
    position: relative;
    display: flex;
  }

  .notifications-dropdown {
    position: absolute;
    top: 55px;
    right: 0;
    width: 320px;
    background-color: white;
    z-index: 1000;
    padding: 0;
    overflow: hidden;
    animation: slideDown 0.2s ease-out;
    border: 1px solid var(--border-color);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-header {
    padding: 1rem 1.5rem;
    background-color: var(--bg-canvas);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dropdown-header h4 {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-main);
  }

  .dropdown-header .badge {
    background-color: #ef4444;
    color: white;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 99px;
  }

  .dropdown-content {
    max-height: 350px;
    overflow-y: auto;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .note-item {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border: none;
    border-bottom: 1px solid var(--border-color);
    background-color: transparent;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .note-item:hover {
    background-color: var(--bg-canvas);
  }

  .note-icon {
    font-size: 1.25rem;
  }

  .note-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .note-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .note-msg {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .top-nav-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .close-sidebar-btn {
    display: none;
  }

  .hamburger-btn {
    display: none;
  }

  /* Responsive Queries */
  @media (max-width: 1024px) {
    .dashboard-layout {
      grid-template-columns: 1fr;
      padding: 1rem;
    }

    .sidebar {
      position: fixed;
      left: -280px;
      top: 0;
      height: 100vh;
      width: 260px;
      z-index: 1000;
      border-radius: 0;
      transition: left 0.3s ease;
      box-shadow: 10px 0 30px rgba(0, 0, 0, 0.1);
    }

    .sidebar.open {
      left: 0;
    }

    .sidebar-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(2px);
      z-index: 999;
      border: none;
      padding: 0;
    }

    .close-sidebar-btn {
      display: flex;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }

    .hamburger-btn {
      display: flex;
      background: transparent;
      border: none;
      color: var(--text-main);
      cursor: pointer;
      margin-right: 0.5rem;
    }

    .main-content {
      gap: 1rem;
    }
  }

  @media (max-width: 650px) {
    .search-bar {
      display: none;
    }

    .user-info {
      display: none;
    }

    .top-nav {
      padding: 0.5rem 0.75rem;
      border-radius: 16px;
    }

    .dashboard-layout {
      padding: 0.5rem;
      gap: 0.75rem;
    }

    .content-wrapper {
      gap: 0.75rem;
    }

    .notifications-dropdown {
      width: calc(100vw - 2rem);
      right: -1rem;
    }
  }

  @media (max-width: 360px) {
    .dashboard-layout {
      padding: 0.25rem;
    }

    .top-nav {
      padding: 0.4rem 0.5rem;
    }
  }
</style>
