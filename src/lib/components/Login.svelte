<script>
  import { authStore } from "../authStore.js";
  import { fade } from "svelte/transition";

  let isLogin = true;
  let isReset = false;

  let email = "";
  let password = "";
  let name = "";
  let newPassword = "";
  
  let registrationSuccess = false;
  let resetSuccess = false;

  async function handleSubmit() {
    authStore.clearError();
    try {
      if ($authStore.recoveryMode) {
        await authStore.updatePassword(newPassword);
        alert("¡Contraseña actualizada! Ya puedes entrar.");
      } else if (isReset) {
        await authStore.resetPassword(email);
        resetSuccess = true;
      } else if (isLogin) {
        await authStore.signIn(email, password);
      } else {
        await authStore.signUp(email, password, name);
        registrationSuccess = true;
      }
    } catch (err) {
    }
  }

  function toggleMode() {
    authStore.clearError();
    isLogin = !isLogin;
    isReset = false;
    password = "";
  }

  function toggleReset() {
    authStore.clearError();
    isReset = !isReset;
    resetSuccess = false;
  }
</script>

<div class="auth-wrapper">
  <div class="auth-card card">
    {#if $authStore.error}
      <div class="error-banner">
        {$authStore.error}
      </div>
    {/if}

    {#if resetSuccess}
      <div class="success-banner" transition:fade>
        <div class="success-icon">✓</div>
        <div class="success-text">
          <strong>¡Correo enviado!</strong>
          <p>Revisa tu bandeja de entrada para restablecer tu contraseña.</p>
        </div>
        <button class="small-btn" on:click={() => { resetSuccess = false; isReset = false; isLogin = true; }}>Entendido</button>
      </div>
    {:else if registrationSuccess}
      <div class="success-banner" transition:fade>
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>
        </div>
        <div class="success-text">
          <strong>¡Registro exitoso!</strong>
          <p>Te hemos enviado un correo de confirmación. Por favor, <strong>revisa tu bandeja de entrada o la carpeta de Spam</strong> y haz clic en el enlace para verificar tu cuenta antes de iniciar sesión.</p>
        </div>
        <button class="small-btn" on:click={() => { registrationSuccess = false; isLogin = true; }}>Volver al Login</button>
      </div>
    {:else if $authStore.recoveryMode}
      <div class="brand">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3>Nueva Contraseña</h3>
        <p>Ingresa tu nueva clave de acceso</p>
      </div>
      
      <form class="auth-form" on:submit|preventDefault={handleSubmit}>
        <div class="input-group">
          <label for="new-pass">Contraseña Nueva</label>
          <input
            id="new-pass"
            type="password"
            bind:value={newPassword}
            placeholder="••••••••"
            required
            minlength="6"
          />
        </div>
        <button type="submit" class="submit-btn" disabled={$authStore.loading}>
          {$authStore.loading ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </form>
    {:else}
      {#if isReset}
        <div class="brand">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
          </div>
          <h3>Recuperar Acceso</h3>
          <p>Te enviaremos un link a tu correo</p>
        </div>
      {:else}
        <div class="brand">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
          </div>
          <h3>Acceso Seguro</h3>
          <p>Por favor, ingresa para continuar</p>
        </div>
      {/if}
      
      <form class="auth-form" on:submit|preventDefault={handleSubmit}>
        {#if !isLogin && !isReset}
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

        {#if !isReset}
          <div class="input-group">
            <div class="label-row">
              <label for="password">Contraseña</label>
              {#if isLogin}
                <button type="button" class="link-btn" on:click={toggleReset}>¿Olvidaste tu contraseña?</button>
              {/if}
            </div>
            <input
              id="password"
              type="password"
              bind:value={password}
              placeholder="••••••••"
              required
              minlength="6"
            />
          </div>
        {/if}

        <button type="submit" class="submit-btn" disabled={$authStore.loading}>
          {#if $authStore.loading}
            Cargando...
          {:else}
            {isReset ? "Enviar Instrucciones" : (isLogin ? "Iniciar Sesión" : "Crear Cuenta")}
          {/if}
        </button>

        {#if isReset}
          <button type="button" class="toggle-mode-btn" on:click={toggleReset}>
            Volver a Iniciar Sesión
          </button>
        {:else}
          <button type="button" class="toggle-mode-btn" on:click={toggleMode}>
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        {/if}
      </form>
    {/if}
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
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .toggle-mode-btn:hover {
    text-decoration: underline;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .link-btn {
    background: transparent;
    border: none;
    color: var(--color-primary);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
  }

  .link-btn:hover {
    text-decoration: underline;
  }

  .success-banner {
    background-color: #ecfdf5;
    color: #065f46;
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid #a7f3d0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    margin-bottom: 2rem;
  }

  .success-icon {
    width: 40px;
    height: 40px;
    background: #10b981;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: bold;
  }

  .success-text strong {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 1rem;
  }

  .success-text p {
    font-size: 0.85rem;
    margin: 0;
    opacity: 0.9;
  }

  .small-btn {
    background: #059669;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
  }
</style>
