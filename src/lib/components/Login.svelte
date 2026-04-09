<script>
  import { authStore } from "../authStore.js";

  let isLogin = true;

  // Form fields
  let email = "";
  let password = "";
  let name = "";

  // Handle Auth Process
  async function handleSubmit() {
    authStore.clearError();
    try {
      if (isLogin) {
        await authStore.signIn(email, password);
      } else {
        await authStore.signUp(email, password, name);
      }
    } catch (err) {
      // Error mapped automatically to the Svelte store
    }
  }

  // Toggle Modes
  function toggleMode() {
    authStore.clearError();
    isLogin = !isLogin;
    password = ""; // specific security wipe
  }
</script>

<div class="auth-wrapper">
  <div class="auth-card card">
    <div class="brand">
      <div class="logo-icon">⚡</div>
      <h3>Acceso Seguro</h3>
      <p>Por favor, ingresa para continuar</p>
    </div>

    {#if $authStore.error}
      <div class="error-banner">
        {$authStore.error}
      </div>
    {/if}

    <form class="auth-form" on:submit|preventDefault={handleSubmit}>
      {#if !isLogin}
        <div class="input-group">
          <label for="name">Nombre</label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="María Pérez"
            required
          />
        </div>
      {/if}

      <div class="input-group">
        <label for="email">Correo Electrónico</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div class="input-group">
        <label for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
          minlength="6"
        />
      </div>

      <button type="submit" class="submit-btn" disabled={$authStore.loading}>
        {#if $authStore.loading}
          Cargando...
        {:else}
          {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        {/if}
      </button>

      <button type="button" class="toggle-mode-btn" on:click={toggleMode}>
        {isLogin
          ? "¿No tienes cuenta? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </form>
  </div>
</div>

<style>
  .auth-wrapper {
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-canvas);
    padding: 1rem;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    padding: 3rem 2.5rem;
    border-radius: var(--radius-card); /* 24px */
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .logo-icon {
    background-color: var(--color-primary);
    color: white;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .brand h3 {
    color: var(--text-main);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .brand p {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .error-banner {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.85rem;
    text-align: center;
    border: 1px solid #fecaca;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .input-group input {
    padding: 0.85rem 1rem;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-canvas);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    font-size: 0.95rem;
  }

  .input-group input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }

  .submit-btn {
    background-color: var(--color-primary);
    color: white;
    padding: 1rem;
    border-radius: var(--radius-pill);
    font-weight: 600;
    font-size: 1rem;
    margin-top: 0.5rem;
  }

  .submit-btn:hover:not(:disabled) {
    background-color: #1e3a8a;
    transform: translateY(-1px);
    box-shadow: var(--shadow-soft);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .toggle-mode-btn {
    color: var(--color-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }

  .toggle-mode-btn:hover {
    text-decoration: underline;
  }
</style>
