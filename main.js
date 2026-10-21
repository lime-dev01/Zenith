/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. Initialisation de la vidéo */
const video = document.getElementById('tech-video');
video.pause();

/* 3. La Timeline de révélation (qui se déclenche à la fin de la vidéo) */
const revealTimeline = gsap.timeline({ paused: true });

revealTimeline
  // Dessin des lignes rouges (Gauche)
  .to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 })
  // Dessin des lignes bleues (Droite)
  .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, "-=0.8")
  // Apparition des textes
  .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.5")
  // Apparition du titre final
  .to('.tech-title', { opacity: 1, duration: 1 }, "-=0.5");

/* 4. Le ScrollTrigger pour bloquer et lire */
ScrollTrigger.create({
  trigger: '.scene-tech',
  start: 'top top',
  end: 'bottom bottom',
  pin: '.sticky-container', // Bloque l'écran
  pinSpacing: false,
  onEnter: () => {
    // Quand on arrive sur la section, on lance la vidéo
    video.play();
  },
  onLeaveBack: () => {
    // Si on remonte, on reset tout
    video.pause();
    video.currentTime = 0;
    revealTimeline.reverse();
  }
});

/* 5. Événement à la fin de la vidéo */
video.addEventListener('ended', () => {
  // Quand la vidéo est finie (les produits sont révélés), on lance les lignes
  revealTimeline.play();
});
