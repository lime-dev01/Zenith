/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. La Vidéo */
const video = document.getElementById('scroll-video');
video.pause(); // On la met en pause au début

/* 3. Le Scroll déclenche la vidéo */
// Quand la 2ème section arrive à l'écran, la vidéo joue
ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'top center', // Se déclenche quand la section froide est au milieu
  onEnter: () => {
    video.play();
  },
  onLeaveBack: () => {
    // Si on remonte tout en haut, on remet la vidéo au début et on la met en pause
    video.pause();
    video.currentTime = 0;
  }
});

/* 4. Animation des Textes */
// Le texte chaud disparaît quand on scrolle
gsap.to('.fade-text-warm', {
  opacity: 0,
  y: -50,
  duration: 1,
  scrollTrigger: {
    trigger: '.section--cold',
    start: 'top bottom',
    end: 'top center',
    scrub: true,
  }
});

// Le texte froid apparaît
gsap.fromTo('.fade-text-cold',
  { opacity: 0, y: 50 },
  {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '.section--cold',
      start: 'top bottom',
      end: 'top center',
      scrub: true,
    }
  }
);
