<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { inventoryStore } from '../inventoryStore.js';

  let searchQuery = '';
  let activeSection = 'sec-entry';
  let isSticky = false;
  let openFaqIndex = null;

  function toggleFaq(index) {
    openFaqIndex = openFaqIndex === index ? null : index;
  }

  const sections = [
    {
      id: 'sec-entry',
      title: 'Proceso de Registro y Entrada de Suministros',
      icon: 'package-plus',
      summary: 'Garantiza la correcta incorporación física y digital de nuevos materiales e insumos al stock del almacén.',
      steps: [
        {
          role: 'Encargado de Almacén',
          title: 'Autenticación y Recepción',
          desc: 'El usuario ingresa al sistema con sus credenciales de seguridad asignadas y accede al módulo de recepción. Verifica minuciosamente que la factura comercial del proveedor coincida en renglones, descripción y cantidades con la mercancía física recibida.'
        },
        {
          role: 'Sistema / Interfaz',
          title: 'Formato de Registro',
          desc: 'Utiliza la interfaz de entrada digital del sistema para asentar todos los detalles logísticos necesarios: códigos SKU del producto, descripciones técnicas detalladas, cantidades exactas ingresadas y el costo de adquisición.'
        },
        {
          role: 'Sistema Automático',
          title: 'Validación y Actualización de Stock',
          desc: 'Confirma el estado físico y operativo de los materiales e insumos. Una vez validada formalmente la entrada, el software actualiza de forma inmediata y automática el saldo general disponible y los costos promedio en el inventario.'
        }
      ]
    },
    {
      id: 'sec-abc',
      title: 'Proceso de Clasificación y Asignación por Método ABC',
      icon: 'layers',
      summary: 'Jerarquiza los suministros según su valor de inversión y volumen para optimizar el resguardo y control del inventario.',
      steps: [
        {
          role: 'Algoritmo de Inventario',
          title: 'Categorización Automática',
          desc: 'El sistema evalúa el valor monetario de adquisición y el volumen de consumo de los suministros. Asigna automáticamente la "Categoría A" a los materiales de mayor impacto logístico y financiero, requiriendo controles rigurosos de resguardo.'
        },
        {
          role: 'Monitoreo Estándar',
          title: 'Identificación de Materiales B y C',
          desc: 'Detecta los productos de rotación media (Categoría B) y rotación baja (Categoría C) para aplicar un seguimiento operativo estándar, simplificando el esfuerzo administrativo en artículos no críticos.'
        },
        {
          role: 'Gerencia y Base de Datos',
          title: 'Registro, Control e Historial',
          desc: 'Mantiene un registro histórico permanente que permite a la gerencia auditar el comportamiento de las tres categorías en el tiempo, facilitando el ajuste y optimización de los niveles de stock de seguridad en la base de datos.'
        }
      ]
    },
    {
      id: 'sec-dispatch',
      title: 'Proceso de Autorización y Salida de Mercancía',
      icon: 'clipboard-check',
      summary: 'Establece la cadena de custodia y control requerida para el despacho seguro de materiales a los departamentos solicitantes.',
      steps: [
        {
          role: 'Personal Solicitante',
          title: 'Generación de Solicitud',
          desc: 'El usuario u operario que requiere materiales genera una solicitud digital detallada en la plataforma, indicando con precisión los insumos y componentes necesarios para las operaciones de la organización.'
        },
        {
          role: 'Supervisor / Administrador',
          title: 'Aprobación de Salida',
          desc: 'El usuario con rol de Administrador o Supervisor evalúa la disponibilidad del material, valida la justificación y autoriza formalmente el despacho del pedido en tránsito a través del sistema informático.'
        },
        {
          role: 'Encargado de Almacén',
          title: 'Registro de Despacho y Trazabilidad',
          desc: 'Al momento de entregar la mercancía, el encargado descuenta las unidades en el software de forma inmediata. El sistema registra automáticamente la fecha, hora exacta y el usuario responsable para mantener una trazabilidad impecable.'
        }
      ]
    },
    {
      id: 'sec-monitoring',
      title: 'Proceso de Monitoreo y Alertas de Stock',
      icon: 'bell',
      summary: 'Supervisa de forma proactiva las existencias de materiales para evitar roturas de stock y desabastecimiento.',
      steps: [
        {
          role: 'Plataforma Digital',
          title: 'Generación de Reportes',
          desc: 'Emite informes y cuadros de mando periódicos directamente desde la plataforma web, detallando cronológicamente todos los movimientos de ingresos, salidas de materiales y los saldos reales remanentes.'
        },
        {
          role: 'Sistema de Notificación',
          title: 'Alertas de Punto de Reorden',
          desc: 'El sistema monitoriza las existencias y notifica de forma automatizada (alertas visuales y del sistema) cuando un artículo alcanza su nivel mínimo establecido, permitiendo gestionar el proceso de compra de manera preventiva.'
        },
        {
          role: 'Personal Administrativo',
          title: 'Acceso Rápido para Consulta',
          desc: 'Facilita búsquedas rápidas, filtros por categorías y auditorías de transacciones directamente en la interfaz del sistema, optimizando tiempos de respuesta del departamento de compras.'
        }
      ]
    },
    {
      id: 'sec-counting',
      title: 'Proceso de Conteo Cíclico y Verificación Física',
      icon: 'refresh-cw',
      summary: 'Valida de forma periódica que los saldos virtuales del software coincidan con los activos físicos del almacén.',
      steps: [
        {
          role: 'Comisión Auditora',
          title: 'Encargados del Proceso',
          desc: 'El personal de operaciones de almacén en conjunto directo con delegados del departamento de administración ejecutan periódicamente las verificaciones cruzadas en el almacén.'
        },
        {
          role: 'Generación en el Sistema',
          title: 'Planificación y Preparación',
          desc: 'Genera desde la plataforma una hoja de conteo físico actualizada, que agrupa los materiales a verificar por zonas e incluye sus códigos SKU y las cantidades teóricas registradas en la base de datos.'
        },
        {
          role: 'Trabajo de Campo',
          title: 'Ejecución del Conteo',
          desc: 'Compara de forma presencial y manual la cantidad física real de suministros e insumos ubicados en las estanterías con las cantidades que dicta el sistema informático.'
        },
        {
          role: 'Administración y Sistema',
          title: 'Verificación y Ajustes',
          desc: 'Documenta formalmente cualquier discrepancia encontrada e ingresa los ajustes correspondientes en la plataforma para reflejar un inventario real, exacto y transparente en los estados logísticos.'
        }
      ]
    }
  ];

  // Filter sections based on search query
  $: filteredSections = sections.filter(sec => {
    const query = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(query) ||
      sec.summary.toLowerCase().includes(query) ||
      sec.steps.some(step => 
        step.title.toLowerCase().includes(query) || 
        step.desc.toLowerCase().includes(query) || 
        step.role.toLowerCase().includes(query)
      )
    );
  });

  function handleScroll() {
    const scrollPosition = window.scrollY + 180;
    
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          activeSection = section.id;
          break;
        }
      }
    }

    const concEl = document.getElementById('sec-conclusions');
    if (concEl && scrollPosition >= concEl.offsetTop) {
      activeSection = 'sec-conclusions';
    }
    const recEl = document.getElementById('sec-recommendations');
    if (recEl && scrollPosition >= recEl.offsetTop) {
      activeSection = 'sec-recommendations';
    }

    isSticky = window.scrollY > 80;
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      const offset = 140; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      activeSection = id;
    }
  }

  function handlePrint() {
    window.print();
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    
    // Check if we came from HelpModal clicking "Preguntas Frecuentes"
    if (sessionStorage.getItem('scroll-to-faq') === 'true') {
      sessionStorage.removeItem('scroll-to-faq');
      setTimeout(() => {
        scrollToSection('sec-conclusions');
      }, 150);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="manual-container">
  <!-- PRINT ONLY HEADER -->
  <div class="print-only-header">
    <div class="print-brand-header">
      <div class="print-logo-circle">
        {#if $inventoryStore.companySettings.logo_url}
          <img src={$inventoryStore.companySettings.logo_url} alt="Logo" class="print-logo-img" />
        {:else}
          <span class="print-logo-text">⚡</span>
        {/if}
      </div>
      <div class="print-brand-text">
        <h1>{$inventoryStore.companySettings.company_name || 'MANUAL GENERAL DE PROCESOS'}</h1>
        <p class="print-subtitle">{$inventoryStore.companySettings.company_subtitle || 'Control de Inventarios y Logística Administrativa'}</p>
      </div>
    </div>
    <div class="print-doc-meta">
      <h2>MANUAL DE USUARIO OFICIAL</h2>
      <p><strong>Documento:</strong> Guía de Procedimientos Operativos para el Control de Almacén</p>
      <p><strong>Fecha de Generación:</strong> {new Date().toLocaleDateString('es-VE')} · <strong>Estado:</strong> Vigente</p>
    </div>
  </div>

  <!-- INTERACTIVE HEADER -->
  <div class="manual-topbar card hide-print" class:sticky={isSticky}>
    <div class="topbar-content">
      <div class="topbar-left">
        <div class="manual-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Soporte Operativo
        </div>
        <h1>Manual del Sistema</h1>
      </div>
      
      <div class="topbar-actions">
        <div class="manual-search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Buscar procesos o roles..." 
            bind:value={searchQuery}
          />
          {#if searchQuery}
            <button class="clear-btn" on:click={() => searchQuery = ''}>&times;</button>
          {/if}
        </div>

        <button class="pill-badge print-trigger-btn" on:click={handlePrint}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir Manual
        </button>
      </div>
    </div>
  </div>

  <!-- WORKSPACE BODY -->
  <div class="manual-layout">
    <!-- LEFT PANEL: TABLE OF CONTENTS (INDEX) -->
    <aside class="manual-sidebar card hide-print">
      <div class="sidebar-sticky-inner">
        <div class="sidebar-header">
          <h3>Tabla de Contenidos</h3>
          <span class="count-badge">{filteredSections.length + 2} Secciones</span>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section-title">Procesos del Sistema</div>
          {#each filteredSections as sec}
            <button 
              class="sidebar-nav-item" 
              class:active={activeSection === sec.id}
              on:click={() => scrollToSection(sec.id)}
            >
              <span class="num-prefix">
                {#if sec.icon === 'package-plus'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/><path d="M16 11.37V16a4 4 0 0 1-8 0v-4.63"/></svg>
                {:else if sec.icon === 'layers'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/></svg>
                {:else if sec.icon === 'clipboard-check'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/></svg>
                {:else if sec.icon === 'bell'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                {:else if sec.icon === 'refresh-cw'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.72 2.78L21 8"/><polyline points="15 3 21 3 21 9"/></svg>
                {/if}
              </span>
              <span class="text-truncate">{sec.title.replace('Proceso de ', '')}</span>
            </button>
          {/each}

          <div class="nav-section-divider"></div>
          
          <button 
            class="sidebar-nav-item static-nav" 
            class:active={activeSection === 'sec-conclusions'}
            on:click={() => scrollToSection('sec-conclusions')}
          >
            <span class="num-prefix">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span>
            <span>Preguntas Frecuentes</span>
          </button>
          
          <button 
            class="sidebar-nav-item static-nav" 
            class:active={activeSection === 'sec-recommendations'}
            on:click={() => scrollToSection('sec-recommendations')}
          >
            <span class="num-prefix">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            </span>
            <span>Recomendaciones</span>
          </button>
        </nav>
        
        <div class="sidebar-footer-info">
          <p>Para soporte adicional o consultas:</p>
          <span class="support-email">cbolivar.dev@openrise.tech</span>
        </div>
      </div>
    </aside>

    <!-- RIGHT PANEL: CONTENT SHEETS -->
    <main class="manual-content-pane">
      
      <!-- INTRO CARD -->
      {#if !searchQuery}
        <div class="intro-card card hide-print" in:fade>
          <div class="intro-glow"></div>
          <div class="intro-content">
            <span class="intro-subtitle">SISTEMA GENERAL DE CONTROL DE INVENTARIO</span>
            <h2>Garantizando el Control Interno y la Trazabilidad Operativa</h2>
            <p>Este manual describe los procedimientos operativos estandarizados del sistema informático de control de inventarios. Diseñado para automatizar el flujo de activos físicos y digitales, erradicar discrepancias financieras, y optimizar el reabastecimiento logístico utilizando la metodología ABC en la organización.</p>
            <div class="intro-meta">
              <div class="meta-item">
                <span class="m-val">📦</span>
                <span class="m-lbl">Suministros</span>
              </div>
              <div class="meta-item">
                <span class="m-val">📊</span>
                <span class="m-lbl">Clase ABC</span>
              </div>
              <div class="meta-item">
                <span class="m-val">🔔</span>
                <span class="m-lbl">Alertas</span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- TITLE FOR PRINTING -->
      <div class="print-header-main-title">
        <h1>Manual Operativo de Procesos del Sistema</h1>
        <hr class="title-divider"/>
      </div>

      <!-- MAIN SECTIONS -->
      {#if filteredSections.length === 0}
        <div class="empty-results card text-center" in:fade>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg>
          <h3>No se encontraron resultados</h3>
          <p>No hay secciones o roles que coincidan con "<strong>{searchQuery}</strong>". Intente con palabras como "ABC", "Almacén", "Ajustes" o "Salidas".</p>
          <button class="primary-btn mt-2" on:click={() => searchQuery = ''}>Limpiar búsqueda</button>
        </div>
      {:else}
        {#each filteredSections as sec (sec.id)}
          <section id={sec.id} class="manual-section card-wrapper" in:fade>
            <div class="manual-card card">
              <div class="section-card-header">
                <div class="num-badge icon-badge">
                  {#if sec.icon === 'package-plus'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/><path d="M16 11.37V16a4 4 0 0 1-8 0v-4.63"/></svg>
                  {:else if sec.icon === 'layers'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/></svg>
                  {:else if sec.icon === 'clipboard-check'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/></svg>
                  {:else if sec.icon === 'bell'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  {:else if sec.icon === 'refresh-cw'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.72 2.78L21 8"/><polyline points="15 3 21 3 21 9"/></svg>
                  {/if}
                </div>
                <div class="title-area">
                  <h2>{sec.title}</h2>
                  <p class="section-summary">{sec.summary}</p>
                </div>
              </div>

              <!-- DETAILED STEPS -->
              <div class="section-body-steps">
                {#each sec.steps as step, idx}
                  <div class="step-row">
                    <div class="step-meta">
                      <span class="step-indicator">Fase {idx + 1}</span>
                      <span class="role-badge" class:system={step.role.includes('Sistema') || step.role.includes('Algoritmo')}>
                        {step.role}
                      </span>
                    </div>
                    <div class="step-info">
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                {/each}
              </div>

              <!-- VISUAL PROCESS REPRESENTATION DIAGRAMS -->
              <div class="visual-diagram card-inner-panel">
                <span class="diagram-label">Esquema Gráfico del Proceso</span>

                {#if sec.id === 'sec-entry'}
                  <!-- Diagram: Entrada de Almacen -->
                  <div class="process-flow-css vertical-flow-md">
                    <div class="flow-step">
                      <div class="flow-icon">🔑</div>
                      <div class="flow-text">
                        <h5>1. Acceso Seguro</h5>
                        <p>Ingreso con credenciales al módulo de Recepción</p>
                      </div>
                    </div>
                    <div class="flow-connector"></div>
                    <div class="flow-step">
                      <div class="flow-icon">📦</div>
                      <div class="flow-text">
                        <h5>2. Verificación Física</h5>
                        <p>Factura de proveedor vs mercancía real</p>
                      </div>
                    </div>
                    <div class="flow-connector"></div>
                    <div class="flow-step">
                      <div class="flow-icon">✍️</div>
                      <div class="flow-text">
                        <h5>3. Registro Digital</h5>
                        <p>Carga de SKU, descripciones, cantidades y costo</p>
                      </div>
                    </div>
                    <div class="flow-connector"></div>
                    <div class="flow-step success-step">
                      <div class="flow-icon">🔄</div>
                      <div class="flow-text">
                        <h5>4. Actualización</h5>
                        <p>Cálculo de saldos y actualización inmediata de inventario</p>
                      </div>
                    </div>
                  </div>

                {:else if sec.id === 'sec-abc'}
                  <!-- Diagram: Metodo ABC -->
                  <div class="abc-grid-display">
                    <div class="abc-card priority-a">
                      <div class="abc-badge badge-a">Clase A</div>
                      <div class="abc-info">
                        <h5>Mayor Impacto Financiero</h5>
                        <p>Mayor valor de inversión. Requiere un resguardo sumamente riguroso y auditorías continuas.</p>
                        <span class="abc-meta-badge">Resguardo Estricto</span>
                      </div>
                    </div>
                    <div class="abc-card priority-b">
                      <div class="abc-badge badge-b">Clase B</div>
                      <div class="abc-info">
                        <h5>Impacto Moderado</h5>
                        <p>Rotación y valor medio. Monitoreo regular y seguimiento operativo de inventario estándar.</p>
                        <span class="abc-meta-badge">Seguimiento Regular</span>
                      </div>
                    </div>
                    <div class="abc-card priority-c">
                      <div class="abc-badge badge-c">Clase C</div>
                      <div class="abc-info">
                        <h5>Bajo Impacto Monetario</h5>
                        <p>Baja rotación o valor unitario pequeño. Esfuerzo de control básico e inventarios de rutina.</p>
                        <span class="abc-meta-badge">Monitoreo Estándar</span>
                      </div>
                    </div>
                  </div>
                  <div class="diagram-footer-note mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span><strong>Trazabilidad Histórica:</strong> La base de datos guarda logs históricos de consumo para ajustar de forma inteligente los puntos de reorden y stocks de seguridad.</span>
                  </div>

                {:else if sec.id === 'sec-dispatch'}
                  <!-- Diagram: Autorizacion y Salida -->
                  <div class="horizontal-flow-scroll-wrapper">
                    <div class="process-flow-css horizontal-flow-css">
                      <div class="flow-step h-step">
                        <div class="flow-num-badge">A</div>
                        <h5>Solicitud Detallada</h5>
                        <p>El operario describe SKU y cantidad requerida</p>
                      </div>
                      <div class="flow-arrow">➡️</div>
                      <div class="flow-step h-step accent-step">
                        <div class="flow-num-badge">B</div>
                        <h5>Aprobación Digital</h5>
                        <p>El Administrador o Supervisor aprueba la orden en el sistema</p>
                      </div>
                      <div class="flow-arrow">➡️</div>
                      <div class="flow-step h-step success-step">
                        <div class="flow-num-badge">C</div>
                        <h5>Despacho de Material</h5>
                        <p>El encargado descuenta stock al instante con fecha y responsable</p>
                      </div>
                    </div>
                  </div>

                {:else if sec.id === 'sec-monitoring'}
                  <!-- Diagram: Monitoreo y Alertas -->
                  <div class="alert-simulation-panel">
                    <div class="alert-simulation-header">
                      <span class="sim-title">Vista Previa de Alertas de Stock</span>
                      <span class="live-dot-indicator"><span></span>SISTEMA ACTIVO</span>
                    </div>
                    <div class="simulated-alert-box critical">
                      <div class="sim-icon">⚠️</div>
                      <div class="sim-details">
                        <div class="sim-headline">
                          <strong>Stock Crítico Alcanzado (Punto de Reorden)</strong>
                          <span class="sim-time-tag">Hace un momento</span>
                        </div>
                        <p class="sim-msg">El artículo <strong>"Material de Alta Rotación Categoría A" (SKU: MAT-ABC-CAT1)</strong> cuenta con un inventario de <strong>15 unidades</strong>. Ha cruzado su punto de reorden establecido en <strong>30 unidades</strong>.</p>
                      </div>
                      <div class="sim-action">
                        <span class="sim-badge-action">Gestionar Compra</span>
                      </div>
                    </div>
                    <div class="sim-search-bar-preview">
                      <div class="preview-search-input">
                        <span>🔍 MAT-ABC-</span>
                        <span class="cursor-line">|</span>
                      </div>
                      <span class="search-help">Búsqueda rápida y consulta instantánea de transacciones directamente en la interfaz del sistema.</span>
                    </div>
                  </div>

                {:else if sec.id === 'sec-counting'}
                  <!-- Diagram: Conteo Ciclico -->
                  <div class="comparison-grid-display">
                    <div class="comparison-header-row">
                      <span>PLANIFICACIÓN (DATOS TEÓRICOS)</span>
                      <span></span>
                      <span>CONCILIACIÓN (COMPROBACIÓN REAL)</span>
                    </div>
                    <div class="comparison-boxes">
                      <div class="comparison-box source-box">
                        <div class="box-icon">📋</div>
                        <div class="box-text">
                          <h6>Listado del Sistema</h6>
                          <p>SKU: PROD-102 · Producto Estándar</p>
                          <span class="box-qty">Teórico: <strong>85 Unds</strong></span>
                        </div>
                      </div>
                      <div class="comparison-vs">VS</div>
                      <div class="comparison-box target-box">
                        <div class="box-icon">🤝</div>
                        <div class="box-text">
                          <h6>Verificación en Galpón</h6>
                          <p>Conteo Presencial por el Almacenista</p>
                          <span class="box-qty mismatch">Conteo Físico: <strong>83 Unds</strong></span>
                        </div>
                      </div>
                    </div>
                    <div class="discrepancy-card">
                      <span class="discrepancy-badge">Diferencia Detectada: -2 Unds</span>
                      <p><strong>Ajuste Administrativo Obligatorio:</strong> Se procede a registrar la discrepancia con el motivo justificado y el sistema recalcula inmediatamente las existencias del inventario real en base de datos.</p>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </section>
        {/each}
      {/if}

      <!-- FAQ & TROUBLESHOOTING SECTION -->
      <section id="sec-conclusions" class="manual-section card-wrapper" in:fade>
        <div class="manual-card card faq-card">
          <div class="section-card-header">
            <div class="num-badge text-bg">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="title-area">
              <h2>PREGUNTAS FRECUENTES (FAQ)</h2>
              <p class="section-summary">Respuestas directas y guías operativas ante consultas o eventualidades comunes del sistema.</p>
            </div>
          </div>
          
          <div class="faq-list">
            <div class="faq-item" class:open={openFaqIndex === 0}>
              <button class="faq-trigger" on:click={() => toggleFaq(0)}>
                <span class="faq-question">💡 ¿Qué debo hacer si la factura física del proveedor no coincide con el sistema?</span>
                <span class="faq-arrow">▼</span>
              </button>
              <div class="faq-answer-wrapper" class:hidden-digital={openFaqIndex !== 0}>
                <div class="faq-answer">
                  <p><strong>Procedimiento Correctivo:</strong> No registre la entrada en la interfaz digital del sistema. Detenga temporalmente el proceso de carga, documente por escrito la discrepancia física directamente en la factura y guía de despacho del proveedor, y notifique inmediatamente al Supervisor de Administración. Asiente los saldos en el software únicamente cuando la diferencia de renglones o cantidades haya sido aclarada y autorizada formalmente.</p>
                </div>
              </div>
            </div>

            <div class="faq-item" class:open={openFaqIndex === 1}>
              <button class="faq-trigger" on:click={() => toggleFaq(1)}>
                <span class="faq-question">📦 ¿Por qué un suministro de "Categoría A" requiere un resguardo físico superior?</span>
                <span class="faq-arrow">▼</span>
              </button>
              <div class="faq-answer-wrapper" class:hidden-digital={openFaqIndex !== 1}>
                <div class="faq-answer">
                  <p><strong>Explicación de Control Interno (ABC):</strong> Los materiales de "Categoría A" concentran aproximadamente el 80% del valor total de capital invertido en el stock, a pesar de representar un porcentaje bajo en cantidad física. Debido a esta altísima importancia de liquidez de activos, cualquier merma, daño o error de entrega tiene un alto impacto financiero. Por ello, se exige que su almacenamiento sea en áreas restringidas y bajo candado, reduciendo riesgos operativos.</p>
                </div>
              </div>
            </div>

            <div class="faq-item" class:open={openFaqIndex === 2}>
              <button class="faq-trigger" on:click={() => toggleFaq(2)}>
                <span class="faq-question">⚠️ El sistema muestra una alerta de "Punto de Reorden (Stock Crítico)". ¿Qué debo hacer?</span>
                <span class="faq-arrow">▼</span>
              </button>
              <div class="faq-answer-wrapper" class:hidden-digital={openFaqIndex !== 2}>
                <div class="faq-answer">
                  <p><strong>Procedimiento de Reposición:</strong> Esta alerta (acompañada de un pulso luminoso) advierte que las existencias del material han llegado al stock mínimo de seguridad. El encargado de almacén debe emitir de manera inmediata una solicitud de cotización al departamento de compras. Esto garantiza que la nueva orden arribe con holgura antes de que el consumo diario agote por completo las existencias físicas del almacén.</p>
                </div>
              </div>
            </div>

            <div class="faq-item" class:open={openFaqIndex === 3}>
              <button class="faq-trigger" on:click={() => toggleFaq(3)}>
                <span class="faq-question">🔄 ¿Cómo se resuelven las discrepancias numéricas en los Conteos Cíclicos?</span>
                <span class="faq-arrow">▼</span>
              </button>
              <div class="faq-answer-wrapper" class:hidden-digital={openFaqIndex !== 3}>
                <div class="faq-answer">
                  <p><strong>Registro de Ajustes:</strong> Si el conteo en galpón arroja diferencias con el saldo digital, el Almacenista debe presionar la opción de "Registrar Ajuste", seleccionando obligatoriamente el motivo correspondiente (e.g., merma por deterioro, error de conteo previo, diferencia justificada). El sistema actualizará automáticamente el inventario real y generará una auditoría con la firma electrónica del usuario responsable.</p>
                </div>
              </div>
            </div>

            <div class="faq-item" class:open={openFaqIndex === 4}>
              <button class="faq-trigger" on:click={() => toggleFaq(4)}>
                <span class="faq-question">🔐 ¿Por qué es obligatorio el uso estrictamente personal y confidencial de las cuentas?</span>
                <span class="faq-arrow">▼</span>
              </button>
              <div class="faq-answer-wrapper" class:hidden-digital={openFaqIndex !== 4}>
                <div class="faq-answer">
                  <p><strong>Normativa de Seguridad de Datos:</strong> Todas las transacciones de entrada, salida y ajuste en el sistema se firman automáticamente con el usuario logueado en esa sesión. Compartir contraseñas debilita gravemente la cadena de custodia y hace al propietario de la cuenta responsable absoluto ante cualquier descuadre, error administrativo o pérdida financiera detectada por las auditorías de la organización.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- RECOMMENDATIONS SECTION -->
      <section id="sec-recommendations" class="manual-section card-wrapper" in:fade>
        <div class="manual-card card recommendations-card">
          <div class="section-card-header">
            <div class="num-badge text-bg secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            </div>
            <div class="title-area">
              <h2>RECOMENDACIONES</h2>
              <p class="section-summary">Directrices estratégicas para la alta gerencia y el personal operativo.</p>
            </div>
          </div>

          <div class="recommendations-list">
            <div class="recommendation-item">
              <div class="rec-icon">🏢</div>
              <div class="rec-content">
                <h4>A la Alta Gerencia</h4>
                <p>Se recomienda a la alta gerencia de la organización mantener un monitoreo estratégico de los indicadores clave de rendimiento (KPIs) de inventario que provee la plataforma. Para maximizar el retorno de esta herramienta, es fundamental asegurar el mantenimiento adecuado de la infraestructura de hardware, fomentar la capacitación continua del personal y liderar una cultura digital consolidada, de modo que el sistema se mantenga permanentemente como el pilar operativo y de toma de decisiones en el almacén.</p>
              </div>
            </div>

            <div class="recommendation-item">
              <div class="rec-icon">👷</div>
              <div class="rec-content">
                <h4>Al Personal Operativo de Almacén</h4>
                <p>Al personal operativo de almacén se le recomienda mantener un compromiso inquebrantable con el registro en tiempo real de cada movimiento logístico. Se debe evitar categóricamente la postergación de ingresos o despachos de mercancía en el software, asumiendo la premisa de que la fiabilidad de una base de datos depende exclusivamente de la inmediatez en la captura de la información. Por tanto, el registro digital debe convertirse en un paso simultáneo y obligatorio frente a cualquier manipulación física de los suministros y materiales.</p>
              </div>
            </div>

            <div class="recommendation-item">
              <div class="rec-icon">📋</div>
              <div class="rec-content">
                <h4>Al Departamento de Administración</h4>
                <p>De igual manera, se aconseja al departamento de administración establecer y ejecutar un cronograma de auditorías sorpresivas trimestrales, fundamentadas estrictamente en los reportes de stock generados por la nueva plataforma. Estas revisiones cíclicas deben consistir en el cruce directo de la data virtual contra las existencias físicas reales, con el firme propósito de verificar el estricto cumplimiento de los lineamientos estandarizados, detectar irregularidades de manera temprana y preservar de manera eficiente el patrimonio logístico y financiero de la organización.</p>
              </div>
            </div>

            <div class="recommendation-item">
              <div class="rec-icon">💾</div>
              <div class="rec-content">
                <h4>Para la Seguridad Tecnológica</h4>
                <p>Y, por último, para garantizar la perdurabilidad y seguridad de la propuesta tecnológica, se recomienda instaurar un protocolo de resguardo informático que incluya la generación de copias de seguridad (backups) semanales de la base de datos del inventario. Aunado a esto, es altamente conveniente programar jornadas semestrales de actualización y reentrenamiento para el talento humano, asegurando así la correcta operatividad del sistema a largo plazo y facilitando la integración de futuros empleados a la dinámica de control interno de la empresa.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</div>

<style>
  /* Root and Container Layout */
  .manual-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    margin-bottom: 2rem;
  }

  /* Interactive Top Header Bar */
  .manual-topbar {
    padding: 1.25rem 2rem;
    background: var(--bg-card);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;
  }

  .manual-topbar.sticky {
    position: sticky;
    top: 0;
    border-radius: 0 0 var(--radius-card) var(--radius-card);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    padding: 0.85rem 2rem;
    margin: 0 -0.5rem;
  }

  .topbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .topbar-left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .topbar-left h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
    margin: 0;
  }

  .manual-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background-color: rgba(30, 58, 138, 0.08);
    color: var(--color-primary);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 4px 10px;
    border-radius: 99px;
    width: fit-content;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  /* Search Engine Styling */
  .manual-search-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--bg-canvas);
    border: 1px solid var(--border-color);
    padding: 0.6rem 1rem;
    border-radius: var(--radius-pill);
    min-width: 280px;
    position: relative;
    transition: border-color 0.2s ease;
  }

  .manual-search-wrapper:focus-within {
    border-color: var(--color-primary);
  }

  .search-icon {
    color: var(--text-muted);
  }

  .manual-search-wrapper input {
    border: none;
    background: transparent;
    font-size: 0.85rem;
    color: var(--text-main);
    width: 100%;
    padding-right: 1.25rem;
  }

  .clear-btn {
    position: absolute;
    right: 1rem;
    font-size: 1.15rem;
    color: var(--text-muted);
    cursor: pointer;
    line-height: 1;
  }

  .clear-btn:hover {
    color: var(--color-primary);
  }

  /* Print Button styling */
  .print-trigger-btn {
    background-color: var(--color-primary);
    color: white;
    padding: 0.65rem 1.25rem;
    font-weight: 600;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
  }

  .print-trigger-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(30, 58, 138, 0.3);
    background-color: #1e3a8a;
  }

  /* Layout Structure */
  .manual-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  /* Left Index (Sidebar) */
  .manual-sidebar {
    padding: 1.5rem;
    position: sticky;
    top: 6rem;
    max-height: calc(100vh - 8rem);
    overflow-y: auto;
    align-self: start;
    z-index: 50;
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.75rem;
  }

  .sidebar-header h3 {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-main);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin: 0;
  }

  .count-badge {
    background-color: var(--bg-canvas);
    color: var(--text-muted);
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .nav-section-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    margin: 0.5rem 0 0.25rem 0.25rem;
  }

  .nav-section-divider {
    height: 1px;
    background-color: var(--border-color);
    margin: 0.75rem 0;
  }

  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    color: var(--text-muted);
    font-size: 0.825rem;
    font-weight: 500;
    text-align: left;
    width: 100%;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar-nav-item:hover {
    background-color: var(--bg-canvas);
    color: var(--color-primary);
  }

  .sidebar-nav-item.active {
    background-color: var(--color-primary);
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
  }

  .num-prefix {
    background: rgba(30, 58, 138, 0.1);
    color: var(--color-primary);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .num-prefix .lucide-icon {
    width: 14px;
    height: 14px;
    color: var(--color-primary);
    transition: color 0.2s ease;
  }

  .sidebar-nav-item.active .num-prefix {
    background: rgba(255, 255, 255, 0.2);
  }

  .sidebar-nav-item.active .num-prefix .lucide-icon {
    color: white;
  }

  .text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-footer-info {
    margin-top: 2rem;
    padding: 1rem;
    background-color: var(--bg-canvas);
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }

  .sidebar-footer-info p {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin: 0 0 0.25rem 0;
  }

  .support-email {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-primary);
    word-break: break-all;
  }

  /* Right Panel Content */
  .manual-content-pane {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Intro Banner Card */
  .intro-card {
    position: relative;
    padding: 2.5rem;
    background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%);
    color: white;
    overflow: hidden;
  }

  .intro-glow {
    position: absolute;
    top: -50%;
    right: -20%;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(30, 58, 138, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .intro-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 650px;
  }

  .intro-subtitle {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--color-accent);
  }

  .intro-content h2 {
    font-size: 1.85rem;
    font-weight: 800;
    line-height: 1.25;
    color: white;
    margin: 0;
  }

  .intro-content p {
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }

  .intro-meta {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 6px 14px;
    border-radius: 99px;
  }

  .meta-item .m-val {
    font-size: 1.1rem;
  }

  .meta-item .m-lbl {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Section Card Layouts */
  .card-wrapper {
    scroll-margin-top: 150px;
  }

  .manual-card {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .section-card-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.25rem;
  }

  .num-badge {
    background: var(--color-primary);
    color: white;
    font-size: 1.1rem;
    font-weight: 800;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(30, 58, 138, 0.2);
  }

  .num-badge.text-bg {
    background: #e0f2fe;
    color: var(--color-accent);
    box-shadow: none;
    font-size: 1.25rem;
  }

  .num-badge.text-bg.secondary {
    background: #fef9c3;
    color: #854d0e;
  }

  .num-badge.icon-badge {
    color: white;
  }

  .num-badge.icon-badge :global(svg) {
    width: 22px;
    height: 22px;
    color: white;
  }

  .num-badge.text-bg :global(svg) {
    color: var(--color-accent);
  }

  .num-badge.text-bg.secondary :global(svg) {
    color: #854d0e;
  }

  .title-area {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .title-area h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
    line-height: 1.3;
  }

  .section-summary {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0;
  }

  .lucide-icon {
    width: 20px;
    height: 20px;
    color: var(--color-primary);
  }

  /* Detailed Step Rows */
  .section-body-steps {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .step-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .step-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .step-indicator {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .role-badge {
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    background-color: #f3f4f6;
    padding: 4px 12px;
    border-radius: 8px;
    width: fit-content;
    border: 1px solid var(--border-color);
  }

  .role-badge.system {
    color: var(--color-secondary);
    background-color: #e6f4ea;
    border-color: rgba(4, 120, 87, 0.15);
  }

  .step-info h4 {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0 0 0.35rem 0;
  }

  .step-info p {
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--text-muted);
    margin: 0;
  }

  /* Inner Diagram Panel Wrapper */
  .card-inner-panel {
    background-color: var(--bg-canvas);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 1.5rem;
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .diagram-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: block;
  }

  /* Flow Diagram CSS */
  .process-flow-css {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  .vertical-flow-md {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  .flow-step {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
  }

  .flow-step:hover {
    border-color: var(--color-accent);
    transform: translateX(4px);
  }

  .flow-icon {
    font-size: 1.5rem;
    background-color: var(--bg-canvas);
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .flow-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .flow-text h5 {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
  }

  .flow-text p {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0;
  }

  .flow-connector {
    width: 2px;
    height: 16px;
    background-color: var(--border-color);
    margin-left: 35px;
  }

  .success-step {
    border-color: rgba(16, 185, 129, 0.3);
    background-color: #f0fdf4;
  }

  .success-step:hover {
    border-color: #10b981;
  }

  /* ABC Classification Grid */
  .abc-grid-display {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }

  .abc-card {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
  }

  .abc-badge {
    width: fit-content;
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .abc-card h5 {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0 0 0.25rem 0;
  }

  .abc-card p {
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--text-muted);
    margin: 0;
  }

  .abc-meta-badge {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-light);
    margin-top: auto;
    border-top: 1px dashed var(--border-color);
    padding-top: 0.5rem;
  }

  .priority-a { border-top: 4px solid var(--color-primary); }
  .priority-b { border-top: 4px solid var(--color-secondary); }
  .priority-c { border-top: 4px solid #64748b; }

  .badge-a { background-color: #e0f2fe; color: var(--color-primary); }
  .badge-b { background-color: #d1fae5; color: var(--color-secondary); }
  .badge-c { background-color: #f1f5f9; color: #475569; }

  .diagram-footer-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    background-color: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .info-icon {
    color: var(--color-accent);
    flex-shrink: 0;
  }

  /* Horizontal Flow Arrow Diagrams */
  .horizontal-flow-scroll-wrapper {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 0.25rem;
  }

  .horizontal-flow-css {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    min-width: 500px;
  }

  .h-step {
    flex: 1;
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    text-align: center;
    align-items: center;
  }

  .flow-num-badge {
    width: 24px;
    height: 24px;
    background-color: var(--bg-canvas);
    color: var(--text-muted);
    font-weight: 700;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .accent-step {
    border-color: rgba(59, 130, 246, 0.3);
    background-color: #eff6ff;
  }
  .accent-step .flow-num-badge {
    background-color: var(--color-accent);
    color: white;
  }

  .success-step .flow-num-badge {
    background-color: var(--color-secondary);
    color: white;
  }

  .h-step h5 {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
  }

  .h-step p {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.35;
  }

  .flow-arrow {
    font-size: 1.1rem;
    color: var(--text-light);
  }

  /* Alert Simulation Panel */
  .alert-simulation-panel {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .alert-simulation-header {
    background-color: #f8fafc;
    border-bottom: 1px solid var(--border-color);
    padding: 0.6rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sim-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .live-dot-indicator {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.65rem;
    font-weight: 700;
    color: #10b981;
  }

  .live-dot-indicator span {
    width: 6px;
    height: 6px;
    background-color: #10b981;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 0 2px #d1fae5;
    animation: blink 2s infinite;
  }

  @keyframes blink {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
    100% { transform: scale(0.95); opacity: 0.5; }
  }

  .simulated-alert-box {
    padding: 1rem;
    background-color: #fffaf0;
    border-left: 4px solid #f97316;
    display: flex;
    gap: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }

  .simulated-alert-box.critical {
    background-color: #fef2f2;
    border-left-color: #ef4444;
  }

  .sim-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .sim-details {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    flex: 1;
  }

  .sim-headline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--text-main);
  }

  .sim-headline strong {
    color: #991b1b;
  }

  .sim-time-tag {
    font-size: 0.65rem;
    color: var(--text-light);
  }

  .sim-msg {
    font-size: 0.75rem;
    line-height: 1.4;
    color: #374151;
    margin: 0;
  }

  .sim-action {
    display: flex;
    align-items: center;
  }

  .sim-badge-action {
    font-size: 0.7rem;
    font-weight: 700;
    color: white;
    background-color: #ef4444;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
  }

  .sim-search-bar-preview {
    padding: 0.75rem 1rem;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .preview-search-input {
    background: white;
    border: 1px solid var(--border-color);
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    font-size: 0.75rem;
    font-family: monospace;
    display: flex;
    align-items: center;
    color: var(--text-main);
    width: 140px;
  }

  .cursor-line {
    font-weight: 300;
    animation: textBlink 1s infinite;
    color: var(--color-accent);
  }

  @keyframes textBlink {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  .search-help {
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  /* Comparison Grid (Conteo Ciclico) */
  .comparison-grid-display {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .comparison-header-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-light);
    letter-spacing: 0.05em;
  }

  .comparison-boxes {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .comparison-box {
    flex: 1;
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .comparison-vs {
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--text-light);
    background-color: white;
    border: 1px solid var(--border-color);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .box-icon {
    font-size: 1.5rem;
    background-color: var(--bg-canvas);
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .box-text h6 {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
  }

  .box-text p {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin: 0 0 0.15rem 0;
  }

  .box-qty {
    font-size: 0.75rem;
    color: var(--color-secondary);
  }

  .box-qty.mismatch {
    color: #ef4444;
  }

  .discrepancy-card {
    background-color: #fff5f5;
    border: 1px solid #fee2e2;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .discrepancy-badge {
    color: #c53030;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .discrepancy-card p {
    font-size: 0.75rem;
    color: #5c2020;
    margin: 0;
    line-height: 1.4;
  }

  /* FAQ Accordion Styling */
  .faq-card {
    border-left: 5px solid var(--color-accent);
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .faq-item {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background-color: var(--bg-canvas);
    overflow: hidden;
    transition: all 0.25s ease;
  }

  .faq-item.open {
    border-color: var(--color-primary);
    background-color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  }

  .faq-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    gap: 1rem;
    transition: background-color 0.2s ease;
  }

  .faq-trigger:hover {
    background-color: rgba(30, 58, 138, 0.03);
  }

  .faq-question {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .faq-arrow {
    font-size: 0.75rem;
    color: var(--text-light);
    transition: transform 0.25s ease;
  }

  .faq-item.open .faq-arrow {
    transform: rotate(180deg);
    color: var(--color-primary);
  }

  .faq-answer {
    padding: 0 1.25rem 1.25rem 1.25rem;
    border-top: none;
  }

  .faq-answer p {
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--text-muted);
    margin: 0;
    text-align: justify;
  }

  .hidden-digital {
    display: none;
  }

  .recommendations-card {
    border-left: 5px solid var(--color-secondary);
  }

  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .recommendation-item {
    display: flex;
    gap: 1.25rem;
    align-items: start;
    padding: 1.25rem;
    background-color: var(--bg-canvas);
    border-radius: 16px;
    border: 1px solid var(--border-color);
  }

  .rec-icon {
    font-size: 1.5rem;
    background-color: white;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
  }

  .rec-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .rec-content h4 {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
  }

  .rec-content p {
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--text-muted);
    margin: 0;
    text-align: justify;
  }

  /* Utility classes */
  .text-center { text-align: center; }
  .empty-results {
    padding: 3.5rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .empty-icon {
    color: var(--text-light);
  }

  .empty-results p {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin: 0;
    max-width: 420px;
  }

  .mt-2 { margin-top: 1rem; }
  .mt-1 { margin-top: 0.5rem; }

  /* Custom general button styling */
  .primary-btn {
    background-color: var(--color-primary);
    color: white;
    padding: 0.6rem 1.25rem;
    border-radius: var(--radius-pill);
    font-weight: 600;
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .primary-btn:hover {
    background-color: #1e3a8a;
  }

  /* Print Layout styling */
  .print-only-header {
    display: none;
  }

  .print-header-main-title {
    display: none;
  }

  /* Responsive Adjustments */
  @media (max-width: 1024px) {
    .manual-layout {
      grid-template-columns: 1fr;
    }

    .manual-sidebar {
      display: none; 
    }
  }

  @media (max-width: 768px) {
    .step-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .abc-grid-display {
      grid-template-columns: 1fr;
    }

    .comparison-boxes {
      flex-direction: column;
    }

    .comparison-vs {
      transform: rotate(90deg);
    }

    .manual-topbar {
      padding: 1rem;
    }

    .manual-card {
      padding: 1.25rem;
    }
  }

  @media (max-width: 550px) {
    .topbar-content {
      flex-direction: column;
      align-items: stretch;
    }

    .manual-search-wrapper {
      min-width: unset;
      width: 100%;
    }

    .print-trigger-btn {
      width: 100%;
      justify-content: center;
    }

    .intro-card {
      padding: 1.5rem;
    }

    .intro-content h2 {
      font-size: 1.35rem;
    }

    .intro-meta {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  /* ------------------- ADVANCED PRINT VIEW ------------------- */
  @media print {
    :global(html), :global(body) {
      background: white !important;
      color: black !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: 'Inter', Arial, sans-serif !important;
      overflow: visible !important;
      overflow-x: visible !important;
      overflow-y: visible !important;
    }

    :global(::-webkit-scrollbar) {
      display: none !important;
    }

    :global(body > *:not(#app)) {
      display: none !important;
    }

    :global(body #app), 
    :global(body .dashboard-layout), 
    :global(body .main-content), 
    :global(body .content-wrapper) {
      display: block !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }
    
    :global(body #app .sidebar), 
    :global(body #app .top-nav), 
    :global(body #app .hide-print) {
      display: none !important;
    }

    .manual-container {
      display: block !important;
      background: white !important;
      padding: 0 !important;
      margin: 0 !important;
      box-shadow: none !important;
      width: 100% !important;
    }

    .manual-topbar,
    .manual-sidebar,
    .intro-card,
    .hide-print {
      display: none !important;
    }

    .manual-layout {
      display: block !important;
      width: 100% !important;
    }

    .manual-content-pane {
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
    }

    /* Print Header configuration */
    .print-only-header {
      display: block !important;
      border-bottom: 2px solid #000000;
      padding-bottom: 1.5rem;
      margin-bottom: 2.5rem;
      width: 100%;
    }

    .print-brand-header {
      display: flex !important;
      align-items: center !important;
      gap: 1.25rem !important;
    }

    .print-logo-circle {
      width: 60px !important;
      height: 60px !important;
      background: #f1f5f9 !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .print-logo-img {
      width: 48px !important;
      height: 48px !important;
      object-fit: contain !important;
    }

    .print-logo-text {
      font-size: 2rem !important;
    }

    .print-brand-text h1 {
      font-size: 1.35rem !important;
      font-weight: 800 !important;
      color: #000000 !important;
      margin: 0 !important;
      line-height: 1.1 !important;
    }

    .print-subtitle {
      font-size: 0.8rem !important;
      color: #475569 !important;
      margin: 0 !important;
      font-weight: 500 !important;
    }

    .print-doc-meta {
      margin-top: 1.25rem !important;
      background-color: #f8fafc !important;
      border: 1px solid #cbd5e1 !important;
      padding: 1rem !important;
      border-radius: 8px !important;
    }

    .print-doc-meta h2 {
      font-size: 1rem !important;
      font-weight: 800 !important;
      color: #0f172a !important;
      margin: 0 0 0.5rem 0 !important;
      letter-spacing: 0.05em !important;
    }

    .print-doc-meta p {
      font-size: 0.8rem !important;
      margin: 0.15rem 0 !important;
      color: #334155 !important;
    }

    /* Print Titles */
    .print-header-main-title {
      display: block !important;
      margin-top: 2rem !important;
      margin-bottom: 2rem !important;
    }

    .print-header-main-title h1 {
      font-size: 1.75rem !important;
      font-weight: 800 !important;
      color: #000000 !important;
      margin: 0 0 0.5rem 0 !important;
    }

    .title-divider {
      border: none !important;
      height: 2px !important;
      background-color: #000000 !important;
    }

    .card-wrapper {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 3rem !important;
    }

    .manual-card {
      box-shadow: none !important;
      border: none !important;
      background: white !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
      display: block !important;
    }

    .section-card-header {
      border-bottom: 2px solid #e2e8f0 !important;
      padding-bottom: 0.75rem !important;
      margin-bottom: 1.5rem !important;
    }

    .title-area h2 {
      font-size: 1.3rem !important;
      color: #000000 !important;
    }

    .section-summary {
      font-size: 0.85rem !important;
      color: #475569 !important;
    }

    .step-row {
      display: block !important;
      margin-bottom: 1.5rem !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .step-meta {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      gap: 1rem !important;
      margin-bottom: 0.35rem !important;
    }

    .step-indicator {
      font-size: 0.75rem !important;
      color: #000000 !important;
      font-weight: 800 !important;
    }

    .role-badge {
      font-size: 0.75rem !important;
      padding: 2px 6px !important;
      background-color: #f1f5f9 !important;
      border: 1px solid #cbd5e1 !important;
      color: #0f172a !important;
    }

    .step-info h4 {
      font-size: 0.95rem !important;
      font-weight: 700 !important;
      color: #000000 !important;
      margin-bottom: 0.2rem !important;
    }

    .step-info p {
      font-size: 0.85rem !important;
      color: #334155 !important;
      line-height: 1.5 !important;
    }

    .visual-diagram {
      border: 1px solid #cbd5e1 !important;
      background-color: #f8fafc !important;
      padding: 1.25rem !important;
      border-radius: 8px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-top: 1rem !important;
    }

    .diagram-label {
      color: #475569 !important;
      font-size: 0.7rem !important;
      border-bottom: 1px solid #cbd5e1 !important;
      padding-bottom: 0.35rem !important;
      margin-bottom: 0.75rem !important;
    }

    .flow-step {
      border: 1px solid #cbd5e1 !important;
      background: white !important;
      box-shadow: none !important;
    }

    .flow-step:hover {
      transform: none !important;
    }

    .abc-card {
      border: 1px solid #cbd5e1 !important;
      background: white !important;
    }

    .abc-badge {
      border: 1px solid #cbd5e1 !important;
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }

    .alert-simulation-panel, .comparison-box {
      border: 1px solid #cbd5e1 !important;
      background: white !important;
    }

    .simulated-alert-box {
      background: #f8fafc !important;
      border-left: 4px solid #000000 !important;
    }

    .sim-badge-action {
      border: 1px solid #000000 !important;
      background: white !important;
      color: #000000 !important;
    }

    .faq-card {
      border-left: 3px solid #000000 !important;
    }

    .faq-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 1rem !important;
    }

    .faq-item {
      border: 1px solid #cbd5e1 !important;
      border-radius: 8px !important;
      background: white !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .faq-trigger {
      padding: 1rem !important;
      border-bottom: 1px solid #cbd5e1 !important;
      background-color: #f8fafc !important;
    }

    .faq-arrow {
      display: none !important;
    }

    .faq-question {
      font-size: 0.9rem !important;
      font-weight: 800 !important;
      color: #000000 !important;
    }

    .faq-answer-wrapper {
      display: block !important;
    }

    .faq-answer {
      padding: 1rem !important;
    }

    .faq-answer p {
      font-size: 0.85rem !important;
      color: #334155 !important;
      line-height: 1.5 !important;
    }

    .recommendation-item {
      border: 1px solid #cbd5e1 !important;
      background: white !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .rec-icon {
      border: 1px solid #cbd5e1 !important;
      background: #f1f5f9 !important;
    }

    .rec-content h4 {
      color: #000000 !important;
    }

    .rec-content p {
      font-size: 0.85rem !important;
      color: #334155 !important;
    }
  }
</style>
