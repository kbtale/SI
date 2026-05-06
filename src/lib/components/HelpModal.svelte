<script>
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { navigationStore } from '../navigationStore.js';

    const dispatch = createEventDispatcher();
    export let email = "cbolivar.dev@openrise.tech";

    function close() {
        dispatch('close');
    }
</script>

<div 
    class="modal-overlay" 
    role="button"
    tabindex="-1"
    on:click|self={close} 
    on:keydown={(e) => e.key === 'Escape' && close()} 
    transition:fade={{ duration: 200 }}
>
    <div class="modal-card card" transition:fly={{ y: 20, duration: 300 }}>
        <div class="modal-header">
            <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </div>
            <h3>Centro de Ayuda</h3>
            <button class="close-btn" on:click={close}>&times;</button>
        </div>

        <div class="modal-body">
            <p>¿Tienes dudas o necesitas soporte técnico para el sistema de inventarios?</p>
            
            <div class="contact-card">
                <div class="contact-info">
                    <span class="label">Contacto Directo</span>
                    <a href="mailto:{email}" class="email-link">{email}</a>
                </div>
                <div class="support-status">
                    <span class="dot"></span>
                    Soporte Activo
                </div>
            </div>

            <div class="help-links">
                <button class="link-item" on:click={() => {
                    navigationStore.setView('manual');
                    close();
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>Manual de Usuario</span>
                </button>
                <button class="link-item" on:click={() => {
                    navigationStore.setView('manual');
                    sessionStorage.setItem('scroll-to-faq', 'true');
                    close();
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>Preguntas Frecuentes</span>
                </button>
            </div>
        </div>

        <div class="modal-footer">
            <button class="primary-btn" on:click={close}>Cerrar</button>
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }

    .modal-card {
        width: 100%;
        max-width: 450px;
        padding: 0;
        overflow: hidden;
        background: white;
    }

    .modal-header {
        padding: 2rem 2rem 1.5rem;
        text-align: center;
        position: relative;
    }

    .icon-circle {
        width: 56px;
        height: 56px;
        background: var(--bg-canvas);
        color: var(--color-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-main);
    }

    .close-btn {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        font-size: 1.5rem;
        color: var(--text-muted);
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .modal-body {
        padding: 0 2rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .modal-body p {
        color: var(--text-muted);
        font-size: 0.95rem;
        text-align: center;
        line-height: 1.5;
        margin: 0;
    }

    .contact-card {
        background: var(--bg-canvas);
        padding: 1.25rem;
        border-radius: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid var(--border-color);
    }

    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
    }

    .email-link {
        color: var(--color-primary);
        font-weight: 600;
        text-decoration: none;
        font-size: 1rem;
    }

    .email-link:hover {
        text-decoration: underline;
    }

    .support-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: #059669;
        background: #ecfdf5;
        padding: 4px 10px;
        border-radius: 99px;
    }

    .dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        box-shadow: 0 0 0 2px #d1fae5;
    }

    .help-links {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .link-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-main);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
    }

    .link-item:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: var(--bg-canvas);
    }

    .modal-footer {
        padding: 0 2rem 2rem;
    }

    .primary-btn {
        width: 100%;
        background: var(--color-primary);
        color: white;
        padding: 0.85rem;
        border-radius: var(--radius-pill);
        font-weight: 600;
        cursor: pointer;
    }
</style>
