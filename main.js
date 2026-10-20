// ============================================
// SUB — JavaScript
// ============================================

/* 1. Initialisation de Lenis (Smooth Scroll) */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Connecter Lenis à GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

gsap.registerPlugin(ScrollTrigger);

/* 2. Animation du Preloader */
window.addEventListener('load', () => {
  const tl = gsap.timeline();
  
  // Le texte clignote rapidement (style terminal)
  tl.to('.preloader__text', { opacity: 0, duration: 0.1, repeat: 3, yoyo: true })
    // Puis l'écran noir slide vers le haut
    .to('.preloader', { yPercent: -100, duration: 0.8, ease: 'power4.inOut', delay: 0.2 })
    // Animation d'entrée du Hero
    .from('.hero__title .line', { y: 100, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.4')
    .from('.hero__meta', { opacity: 0, duration: 0.5 }, '-=0.4');
});

/* 3. Scroll Horizontal de la Collection */
const track = document.querySelector('.collection__track');

// On calcule la largeur totale du track moins la largeur de l'écran
const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

const tween = gsap.to(track, {
  x: getScrollAmount,
  ease: 'none'
});

ScrollTrigger.create({
  trigger: '.collection',
  start: 'top top',
  end: () => `+=${track.scrollWidth - window.innerWidth}`,
  pin: true, // On bloque l'écran
  animation: tween,
  scrub: 1, // Le scroll contrôle l'animation
  invalidateOnRefresh: true, // Recalcule si on redimensionne la fenêtre
});

/* 4. Apparition du texte au scroll (Manifeste & autres) */
const revealTexts = document.querySelectorAll('.reveal-text:not(.hero__title .reveal-text)');

revealTexts.forEach((text) => {
  gsap.from(text, {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: text,
      start: 'top 85%', // Se déclenche quand le texte est à 85% de l'écran
    }
  });
});
