/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. Vidéo */
const video = document.getElementById('scroll-video');
video.pause();

// On déclenche la vidéo DÈS QUE la section froide commence à pointer le bout de son nez
ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'top 90%', // Se déclenche quand le haut de la section froide est à 90% de l'écran (donc très vite)
  onEnter: () => {
    video.play();
  },
  onLeaveBack: () => {
    video.pause();
    video.currentTime = 0;
  }
});

/* 3. Synchronisation parfaite des textes */
// Le texte chaud part en même temps que la vidéo joue
gsap.to('.fade-text-warm', {
  opacity: 0,
  y: -50,
  duration: 0.5,
  scrollTrigger: {
    trigger: '.section--cold',
    start: 'top 90%',
    end: 'top 40%',
    scrub: true,
  }
});

// Le texte froid arrive exactement au même moment
gsap.fromTo('.fade-text-cold',
  { opacity: 0, y: 50 },
  {
    opacity: 1,
    y: 0,
    duration: 0.5,
    scrollTrigger: {
      trigger: '.section--cold',
      start: 'top 90%',
      end: 'top 40%',
      scrub: true,
    }
  }
);
