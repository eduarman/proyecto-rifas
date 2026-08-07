<script setup>
import BrandLogo from './BrandLogo.vue'
import { useNav } from '../composables/useNav.js'

const { goRifas, goSection, goAdmin } = useNav()

const WHATSAPP_URL = 'https://wa.me/584125168616'
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-col footer-brand-col">
        <div class="footer-brand"><BrandLogo :size="30" :label="16" /></div>
        <p class="footer-desc">
          Plataforma moderna para participar en rifas online con pagos seguros, sorteos
          transparentes y premios reales.
        </p>
        <div class="footer-links footer-links-mobile">
          <a href="#" @click.prevent="goRifas">Rifas activas</a>
          <a :href="WHATSAPP_URL" target="_blank" rel="noopener">Contacto</a>
          <a href="#" @click.prevent="goAdmin">Panel admin</a>
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
        </div>
      </div>
      <div class="footer-col footer-nav-col">
        <div class="footer-heading">Plataforma</div>
        <a href="#" @click.prevent="goRifas">Rifas activas</a>
        <a href="#como-funciona" @click.prevent="goSection('como-funciona')">Cómo participar</a>
        <a href="#testimonios" @click.prevent="goSection('testimonios')">Ganadores</a>
        <a href="#preguntas" @click.prevent="goSection('preguntas')">Preguntas frecuentes</a>
      </div>
      <div class="footer-col footer-legal-col">
        <div class="footer-heading">Legal</div>
        <a href="#">Términos y condiciones</a>
        <a href="#">Política de privacidad</a>
        <a href="#">Reglamento de sorteos</a>
        <a :href="WHATSAPP_URL" target="_blank" rel="noopener">Contacto</a>
        <a href="#" @click.prevent="goAdmin">Panel admin</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Rifly. Todos los derechos reservados.</span>
      <span class="footer-tagline">Hecho con confianza y transparencia.</span>
      <span class="footer-credit">Sitio desarrollado por <a href="https://sitis.cl" target="_blank" rel="noopener">Sitis</a></span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #fff;
  padding: 32px 18px 24px;
  border-top: 1px solid var(--line-soft);
}
.footer-inner {
  display: flex;
  flex-direction: column;
}
.footer-brand {
  margin-bottom: 12px;
}
.footer-desc {
  font-size: 13px;
  color: var(--slate-500);
  line-height: 1.6;
  margin: 0 0 16px;
}
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-bottom: 24px;
}
.footer-links a {
  color: var(--slate-500);
  font-size: 12.5px;
}
.footer-nav-col,
.footer-legal-col {
  display: none;
}
.footer-bottom {
  font-size: 12px;
  color: var(--slate-400);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.footer-tagline {
  display: none;
}
.footer-credit a {
  color: var(--slate-500);
  font-weight: 600;
}
.footer-credit a:hover {
  color: var(--brand);
}

@media (min-width: 1024px) {
  .footer {
    padding: 48px 56px 28px;
  }
  .footer-inner {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 40px;
  }
  .footer-brand-col .footer-desc {
    max-width: 320px;
  }
  .footer-links-mobile {
    display: none;
  }
  .footer-nav-col,
  .footer-legal-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .footer-heading {
    font-size: 14.5px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .footer-nav-col a,
  .footer-legal-col a {
    color: var(--slate-500);
    font-size: 14px;
  }
  .footer-bottom {
    max-width: 1180px;
    margin: 32px auto 0;
    padding-top: 20px;
    border-top: 1px solid var(--line-soft);
    flex-direction: row;
    justify-content: space-between;
  }
  .footer-tagline {
    display: inline;
  }
}
</style>
