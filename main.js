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

ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'top 90%', 
  onEnter: () => {
    video.play();
  },
  onLeaveBack: () => {
    video.pause();
    video.currentTime = 0;
  }
});

/* 3. Animation des textes (Sans chevauchement) */
// Le texte chaud disparaît
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

// Le texte froid apparaît
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
