/**
 * BARBEIRO DE SUCESSO — SCRIPT PRINCIPAL
 * Foco: Performance, Acessibilidade, UX e Rastreamento de Conversão
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. NAVEGAÇÃO MOBILE ACESSÍVEL
     ========================================================================== */
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('#nav-links-container');
  const navAnchorLinks = navLinks ? navLinks.querySelectorAll('a') : [];

  if (mobileToggle && navLinks) {
    const toggleMenu = (shouldOpen) => {
      const isOpen = shouldOpen !== undefined ? shouldOpen : !navLinks.classList.contains('active');
      navLinks.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileToggle.setAttribute('aria-label', isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    };

    mobileToggle.addEventListener('click', () => {
      const isCurrentlyOpen = navLinks.classList.contains('active');
      toggleMenu(!isCurrentlyOpen);
    });

    // Fechar menu ao clicar em qualquer link interno
    navAnchorLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Fechar menu com a tecla Escape para acessibilidade
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMenu(false);
        mobileToggle.focus();
      }
    });
  }

  /* ==========================================================================
     2. PROPAGAÇÃO DE PARÂMETROS UTM (META ADS / GOOGLE ADS)
     ========================================================================== */
  function propagateUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.toString()) return;

    const hotmartLinks = document.querySelectorAll('.hotmart-link');

    hotmartLinks.forEach(link => {
      try {
        const linkUrl = new URL(link.href);
        urlParams.forEach((value, key) => {
          linkUrl.searchParams.set(key, value);
        });
        link.href = linkUrl.toString();
      } catch (err) {
        // Fallback silencioso em caso de URL relativa
      }
    });
  }

  propagateUTMParameters();

  /* ==========================================================================
     3. BARRA FIXA DE CONVERSÃO MOBILE (STICKY CTA)
     ========================================================================== */
  const stickyMobileBar = document.getElementById('sticky-mobile-cta');
  const heroSection = document.getElementById('inicio') || document.querySelector('.hero');
  const offerSection = document.getElementById('investimento');

  if (stickyMobileBar && heroSection) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
          const scrollPos = window.scrollY;
          
          // Ocultar quando estiver na própria seção de oferta ou no topo
          let inOfferSection = false;
          if (offerSection) {
            const offerTop = offerSection.offsetTop - 150;
            const offerBottom = offerTop + offerSection.offsetHeight + 100;
            inOfferSection = scrollPos >= offerTop && scrollPos <= offerBottom;
          }

          if (scrollPos > heroBottom - 80 && !inOfferSection) {
            stickyMobileBar.classList.add('visible');
            stickyMobileBar.removeAttribute('aria-hidden');
          } else {
            stickyMobileBar.classList.remove('visible');
            stickyMobileBar.setAttribute('aria-hidden', 'true');
          }

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ==========================================================================
     4. FAQ ACCORDION SUAVE COM SEMÂNTICA NATIVA (<details>/<summary>)
     Permite fechar automaticamente outros ao abrir um novo, mantendo WCAG 100% nativo.
     ========================================================================== */
  const faqDetailsList = document.querySelectorAll('.faq-accordion details');

  faqDetailsList.forEach(targetDetail => {
    targetDetail.addEventListener('toggle', () => {
      if (targetDetail.open) {
        faqDetailsList.forEach(otherDetail => {
          if (otherDetail !== targetDetail && otherDetail.open) {
            otherDetail.open = false;
          }
        });
      }
    });
  });

  /* ==========================================================================
     5. RASTREAMENTO DE EVENTOS DE CONVERSÃO (DATA-LAYER / ANALYTICS READY)
     Dispara eventos customizados para Meta Pixel / GA4 caso estejam instalados.
     ========================================================================== */
  const trackingElements = document.querySelectorAll('[data-track-event]');

  trackingElements.forEach(element => {
    element.addEventListener('click', () => {
      const eventName = element.getAttribute('data-track-event') || 'cta_click';
      const eventLocation = element.getAttribute('data-track-location') || 'unknown';

      // Disparo para Google Tag Manager / GA4 dataLayer
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: eventName,
          cta_location: eventLocation,
          timestamp: new Date().toISOString()
        });
      }

      // Disparo para Meta Pixel fbq se presente
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', eventName, {
          content_name: 'Barbeiro de Sucesso',
          location: eventLocation
        });

        // Eventos Padrão do Meta Ads para Otimização de Campanha
        if (element.classList.contains('hotmart-link')) {
          window.fbq('track', 'InitiateCheckout', {
            content_name: 'Curso Barbeiro de Sucesso',
            value: 425.90,
            currency: 'BRL'
          });
        }

        if (eventName.includes('whatsapp') || element.classList.contains('whatsapp-float-btn')) {
          window.fbq('track', 'Contact');
        }
      }
    });
  });

});
