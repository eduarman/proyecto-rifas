<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseIcon from '../components/BaseIcon.vue'
import BrandLogo from '../components/BrandLogo.vue'
import heroPremio from '../assets/hero-premio.svg'
import { steps, features, schedule, faqs, loadRifas } from '../data/content.js'
import { winners } from '../data/winners.js'
import { useNav } from '../composables/useNav.js'

const { goRifas, goSection, goAdmin } = useNav()

const WHATSAPP_URL = 'https://wa.me/584125168616'

// content.js only fetches rifas once, at module load — refetch on every
// visit to Home so a tab open since before a rifa was created/toggled
// picks up the change (Home doesn't list rifas directly, but RifasView
// and DetailView read the same shared reactive array).
onMounted(() => {
  loadRifas()
})

// Only winners with a comment read as testimonials; the rest are just
// prize-delivery records with nothing to quote on the home page.
const testimonials = computed(() => winners.filter((w) => w.comment))

const faqOpen = ref(1)
function toggleFaq(i) {
  faqOpen.value = faqOpen.value === i ? -1 : i
}
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="hero">
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="pill">
            <svg width="12" height="12" viewBox="0 0 24 24">
              <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#2563eb" />
            </svg>
            <span class="pill-text-mobile">Nueva rifa · Sorteo 30 jul</span>
            <span class="pill-text-desktop">Nueva rifa activa · Sorteo el 30 de julio</span>
          </div>
          <h1 class="hero-title">Gana premios reales <span class="accent">en minutos.</span></h1>
          <p class="hero-sub">
            Elige tu número, paga de forma segura y espera el sorteo en vivo.
            <span class="hero-sub-desktop"> Sin trámites complicados.</span> 100% transparente.
          </p>

          <div class="hero-actions">
            <button class="btn btn-primary" @click="goRifas">
              Ver rifas activas
              <svg class="btn-arrow" width="16" height="16" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>
            </button>
            <button class="btn btn-ghost" @click="goRifas">Cómo participar</button>
          </div>

          <div class="stats">
            <div><div class="stat-num">+12k</div><div class="stat-label">Participantes</div></div>
            <div><div class="stat-num">+380</div><div class="stat-label">Ganadores</div></div>
            <div><div class="stat-num">100%</div><div class="stat-label">Pagos seguros</div></div>
          </div>
        </div>

        <div class="hero-media">
          <img :src="heroPremio" alt="Premio: auto deportivo con regalos" />
          <div class="tag tag-tl">
            <svg width="12" height="12" viewBox="0 0 24 24">
              <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" fill="#fff" />
            </svg>
            Pago verificado
          </div>
          <div class="tag tag-br">
            <svg width="12" height="12" viewBox="0 0 24 24">
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="#f59e0b" />
            </svg>
            <span class="tag-text-mobile">En vivo</span>
            <span class="tag-text-desktop">Sorteo en vivo</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CÓMO PARTICIPAR -->
    <section id="como-funciona" class="band band-panel">
      <div class="band-inner">
        <div class="eyebrow">CÓMO PARTICIPAR</div>
        <h2 class="band-title">Cuatro pasos, listo</h2>
        <p class="band-sub">Diseñado para que compres tu número en menos de 2 minutos.</p>
        <div class="stack steps-grid">
          <div v-for="s in steps" :key="s.n" class="card step-card">
            <div class="step-head">
              <div class="icon-tile tint"><BaseIcon :paths="s.icon" :size="20" /></div>
              <span class="step-n">{{ s.n }}</span>
            </div>
            <h3 class="card-title">{{ s.title }}</h3>
            <p class="card-desc">{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- POR QUÉ RIFLY -->
    <section class="band band-white">
      <div class="band-inner">
        <div class="eyebrow">POR QUÉ RIFLY</div>
        <h2 class="band-title">Confianza en cada sorteo</h2>
        <p class="band-sub band-sub-narrow">
          Una experiencia moderna y transparente para que solo te preocupes por ganar.
        </p>
        <div class="stack features-grid">
          <div v-for="f in features" :key="f.title" class="card feature-card">
            <div class="icon-tile brand"><BaseIcon :paths="f.icon" :size="20" /></div>
            <h3 class="card-title">{{ f.title }}</h3>
            <p class="card-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIOS -->
    <section v-if="testimonials.length" id="testimonios" class="band band-panel">
      <div class="band-inner">
        <div class="eyebrow">TESTIMONIOS</div>
        <h2 class="band-title tight band-title-narrow">Historias que hablan por sí solas</h2>
        <div class="stack testi-grid">
          <div v-for="t in testimonials" :key="t.id" class="card testi-card">
            <p class="quote">“{{ t.comment }}”</p>
            <div class="testi-foot">
              <div class="avatar">{{ t.initials }}</div>
              <div>
                <div class="testi-name">{{ t.name }}</div>
                <div v-if="t.city" class="testi-city">{{ t.city }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AGENDA -->
    <section class="band band-white">
      <div class="band-inner">
        <div class="eyebrow">AGENDA</div>
        <h2 class="band-title">Próximos sorteos</h2>
        <p class="band-sub">Anota las fechas y no te pierdas ningún sorteo en vivo.</p>
        <div class="agenda">
          <div v-for="e in schedule" :key="e.id" class="agenda-row">
            <div class="date-chip">
              <span class="date-mon">{{ e.mon }}</span>
              <span class="date-day">{{ e.day }}</span>
            </div>
            <div class="agenda-main">
              <div class="agenda-title">{{ e.title }}</div>
              <div class="agenda-prize">{{ e.prize }}</div>
            </div>
            <div class="agenda-time">{{ e.time }}</div>
            <div class="status"><span class="status-dot" />{{ e.status }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- PREGUNTAS -->
    <section id="preguntas" class="band band-panel">
      <div class="band-inner">
        <div class="eyebrow">PREGUNTAS FRECUENTES</div>
        <h2 class="band-title tight">Resolvemos tus dudas</h2>
        <div class="faq-stack">
          <div v-for="(q, i) in faqs" :key="q.question" class="faq" @click="toggleFaq(i)">
            <div class="faq-head">
              <span class="faq-q">{{ q.question }}</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" class="faq-arrow"
                :style="{ transform: faqOpen === i ? 'rotate(180deg)' : 'none' }"
              >
                <path d="M6 9l6 6 6-6" stroke="#334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              </svg>
            </div>
            <p v-if="faqOpen === i" class="faq-a">{{ q.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="cta-wrap">
      <div class="cta-box">
        <h2 class="cta-title">Tu próximo premio te está esperando</h2>
        <p class="cta-sub">
          Únete a miles de participantes que ya confían en Rifly.
          <span class="cta-sub-desktop"> Tu número puede ser el ganador del próximo sorteo.</span>
        </p>
        <div class="cta-actions">
          <button class="btn cta-primary" @click="goRifas">
            Participar ahora
            <svg class="btn-arrow" width="16" height="16" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>
          </button>
          <a href="#preguntas" class="cta-link" @click.prevent="goSection('preguntas')">Tengo preguntas</a>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
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
  </div>
</template>

<style scoped>
/* Mobile/desktop copy variants: default to the shorter mobile text,
   swap in the longer desktop copy above the 1024px breakpoint. */
.pill-text-desktop,
.hero-sub-desktop,
.tag-text-desktop,
.cta-sub-desktop {
  display: none;
}

/* HERO */
.hero {
  background: linear-gradient(180deg, #eef4ff 0%, #ffffff 55%);
  padding: 28px 18px 36px;
}
.hero-grid {
  display: flex;
  flex-direction: column;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--tint);
  color: var(--brand);
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 18px;
}
.hero-title {
  font-size: 34px;
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}
.accent {
  color: var(--brand);
}
.hero-sub {
  font-size: 15.5px;
  color: var(--slate-500);
  line-height: 1.55;
  margin: 0 0 24px;
}
.hero-media {
  position: relative;
  margin-bottom: 24px;
}
.hero-media img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 18px;
  display: block;
}
.tag {
  position: absolute;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tag-tl {
  top: 10px;
  left: 10px;
  background: #111827;
  color: #fff;
}
.tag-br {
  bottom: 10px;
  right: 10px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
}
.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}
.btn {
  border-radius: 11px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  padding: 15px;
}
.btn-primary {
  background: var(--brand);
  color: #fff;
  border: none;
}
.btn-ghost {
  background: #fff;
  color: var(--ink);
  border: 1px solid var(--input-line);
}
.btn-arrow {
  display: none;
}
.stats {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--line);
  padding-top: 20px;
}
.stat-num {
  font-size: 21px;
  font-weight: 800;
}
.stat-label {
  font-size: 12px;
  color: var(--slate-500);
}

/* BANDS */
.band {
  padding: 44px 18px;
  text-align: center;
}
.band-panel {
  background: var(--panel);
}
.band-white {
  background: #fff;
}
.band-inner {
  max-width: 1180px;
  margin: 0 auto;
}
.eyebrow {
  display: inline-flex;
  background: var(--tint);
  color: var(--brand);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-bottom: 16px;
}
.band-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.band-title.tight {
  font-size: 24px;
  margin: 0 0 28px;
}
.band-sub {
  font-size: 14px;
  color: var(--slate-500);
  margin: 0 0 28px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}
.card {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 20px;
}
.step-card {
  background: #fff;
}
.step-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}
.icon-tile {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-tile.tint {
  background: var(--tint);
}
.icon-tile.brand {
  background: var(--brand);
  margin-bottom: 12px;
}
.step-n {
  font-size: 22px;
  font-weight: 800;
  color: var(--slate-400);
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 5px;
}
.card-desc {
  font-size: 13.5px;
  color: var(--slate-500);
  line-height: 1.5;
  margin: 0;
}

/* TESTIMONIALS */
.testi-card {
  background: #fff;
}
.quote {
  font-size: 14px;
  color: var(--slate-700);
  line-height: 1.6;
  margin: 0 0 16px;
}
.testi-foot {
  border-top: 1px solid var(--line-soft);
  padding-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--tint);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.testi-name {
  font-size: 13.5px;
  font-weight: 700;
}
.testi-city {
  font-size: 12px;
  color: var(--slate-500);
}

/* AGENDA */
.agenda {
  border: 1px solid var(--line);
  border-radius: 16px;
  text-align: left;
  overflow: hidden;
}
.agenda-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-bottom: 1px solid var(--line-soft);
}
.agenda-row:last-child {
  border-bottom: none;
}
.date-chip {
  width: 46px;
  height: 46px;
  border-radius: 11px;
  background: var(--brand);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.date-mon {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.date-day {
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
}
.agenda-main {
  flex: 1;
  min-width: 0;
}
.agenda-title {
  font-size: 14px;
  font-weight: 700;
}
.agenda-prize {
  font-size: 12.5px;
  color: var(--slate-500);
}
.agenda-time {
  display: none;
}
.status {
  background: #dcfce7;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
}
.status-dot {
  display: none;
}

/* FAQ */
.faq-stack {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.faq {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 13px;
  padding: 16px 18px;
  cursor: pointer;
}
.faq-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.faq-q {
  font-size: 14.5px;
  font-weight: 700;
}
.faq-arrow {
  flex-shrink: 0;
  transition: transform 0.2s;
}
.faq-a {
  font-size: 13.5px;
  color: var(--slate-500);
  line-height: 1.6;
  margin: 12px 0 0;
}

/* CTA */
.cta-wrap {
  background: #fff;
  padding: 0 18px 44px;
}
.cta-box {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 20px;
  padding: 32px 24px;
}
.cta-title {
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 12px;
  letter-spacing: -0.01em;
}
.cta-sub {
  color: #dbe6ff;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 22px;
}
.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}
.cta-primary {
  background: #fff;
  color: var(--brand);
  border: none;
  padding: 13px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14.5px;
  width: 100%;
}
.cta-link {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

/* FOOTER */
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

/* ============ DESKTOP (>=1024px) ============ */
@media (min-width: 1024px) {
  .pill-text-mobile,
  .tag-text-mobile {
    display: none;
  }
  .pill-text-desktop,
  .hero-sub-desktop,
  .tag-text-desktop,
  .cta-sub-desktop {
    display: inline;
  }

  .hero {
    padding: 64px 56px 40px;
  }
  .hero-grid {
    flex-direction: row;
    align-items: center;
    gap: 40px;
    max-width: 1180px;
    margin: 0 auto;
  }
  .hero-copy,
  .hero-media {
    flex: 1;
    min-width: 0;
  }
  .pill {
    padding: 8px 16px;
    font-size: 13.5px;
    gap: 8px;
    margin-bottom: 26px;
  }
  .hero-title {
    font-size: 52px;
    line-height: 1.05;
    margin: 0 0 22px;
  }
  .hero-sub {
    font-size: 18px;
    line-height: 1.55;
    max-width: 480px;
    margin: 0 0 30px;
  }
  .hero-media img {
    height: 420px;
    border-radius: 24px;
    box-shadow: 0 30px 60px -30px rgba(15, 23, 42, 0.25);
  }
  .tag {
    padding: 9px 16px;
    font-size: 13px;
    gap: 7px;
  }
  .tag-tl {
    top: 18px;
    left: 18px;
  }
  .tag-br {
    bottom: 18px;
    right: 18px;
  }
  .hero-actions {
    flex-direction: row;
    gap: 14px;
    margin-bottom: 44px;
  }
  .btn {
    padding: 15px 26px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-primary:hover {
    background: var(--brand-dark);
  }
  .btn-ghost:hover {
    background: #f8fafc;
  }
  .btn-arrow {
    display: inline-block;
  }
  .stats {
    justify-content: flex-start;
    gap: 44px;
    padding-top: 26px;
  }
  .stat-num {
    font-size: 26px;
  }
  .stat-label {
    font-size: 13.5px;
  }

  .band {
    padding: 80px 56px;
  }
  .band-title {
    font-size: 38px;
    margin: 0 0 12px;
  }
  .band-title.tight {
    font-size: 38px;
    margin: 0 0 48px;
  }
  .band-title-narrow {
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }
  .band-sub {
    font-size: 16.5px;
    margin: 0 0 48px;
  }
  .band-sub-narrow {
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
  }

  .steps-grid,
  .features-grid,
  .testi-grid {
    display: grid;
    gap: 22px;
  }
  .steps-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .features-grid,
  .testi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .card {
    padding: 26px;
    border-radius: 18px;
  }
  .icon-tile {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
  .card-title {
    font-size: 17px;
  }
  .card-desc {
    font-size: 14px;
  }
  .quote {
    font-size: 15px;
    margin: 0 0 22px;
  }
  .avatar {
    width: 38px;
    height: 38px;
    font-size: 13px;
  }
  .testi-name {
    font-size: 14.5px;
  }
  .testi-city {
    font-size: 12.5px;
  }

  .agenda {
    max-width: 900px;
    margin: 0 auto;
  }
  .agenda-row {
    gap: 20px;
    padding: 18px 26px;
  }
  .date-chip {
    width: 52px;
    height: 52px;
    border-radius: 12px;
  }
  .date-mon {
    font-size: 10.5px;
  }
  .date-day {
    font-size: 16px;
  }
  .agenda-title {
    font-size: 15.5px;
  }
  .agenda-time {
    display: block;
    font-size: 13.5px;
    color: var(--slate-700);
  }
  .status {
    font-size: 12px;
    padding: 5px 12px;
  }
  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
  }

  .faq-stack {
    max-width: 820px;
    margin: 0 auto;
    gap: 12px;
  }
  .faq {
    border-radius: 14px;
    padding: 20px 24px;
  }
  .faq-q {
    font-size: 16px;
  }
  .faq-arrow {
    width: 18px;
    height: 18px;
  }
  .faq-a {
    font-size: 14.5px;
    margin: 14px 0 0;
  }

  .cta-wrap {
    padding: 0 56px 80px;
  }
  .cta-box {
    max-width: 1180px;
    margin: 0 auto;
    border-radius: 24px;
    padding: 56px;
  }
  .cta-title {
    font-size: 34px;
    max-width: 520px;
    margin: 0 0 14px;
  }
  .cta-sub {
    font-size: 16px;
    max-width: 520px;
    margin: 0 0 28px;
  }
  .cta-actions {
    flex-direction: row;
    align-items: center;
    gap: 26px;
  }
  .cta-primary {
    width: auto;
    padding: 14px 24px;
    font-size: 15.5px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .cta-link {
    font-size: 15px;
  }

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
