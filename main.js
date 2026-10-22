/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* =========================================
   SCÈNES 1 & 2 (Vidéo 1)
   ========================================= */
const video1 = document.getElementById('video-1');
video1.pause();

gsap.set('.fade-text-cold', { opacity: 0 });
gsap.set('.fade-text-cold .title span', { y: 100 });
gsap.set('.fade-text-cold .desc', { opacity: 0, y: 20 });

let isTransitioning = false;

ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'top 80%',
  onEnter: () => {
    if (isTransitioning) return;
    isTransitioning = true;

    video1.play();
    gsap.to('.fade-text-warm', { opacity: 0, y: -30, duration: 0.8 });

    setTimeout(() => {
      gsap.to('.fade-text-cold', { opacity: 1, duration: 0.1 });
      gsap.to('.fade-text-cold .title span', { y: 0, duration: 1, ease: 'power4.out', stagger: 0.1 });
      gsap.to('.fade-text-cold .desc', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
    }, 2500);
  },
  onLeaveBack: () => {
    isTransitioning = false;
    video1.pause();
    video1.currentTime = 0;
    gsap.to('.fade-text-warm', { opacity: 1, y: 0, duration: 0.5 });
    gsap.to('.fade-text-cold', { opacity: 0, duration: 0.3 });
    gsap.set('.fade-text-cold .title span', { y: 100 });
    gsap.set('.fade-text-cold .desc', { opacity: 0, y: 20 });
  }
});

/* =========================================
   SCÈNE 3 (Vidéo 2 - Fondu invisible)
   ========================================= */
const video2 = document.getElementById('video-2');
video2.pause();

// On déclenche le fondu quand on approche de la fin de la section froide
ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'bottom 80%', // Se déclenche quand le bas de la section froide est à 80% de l'écran
  onEnter: () => {
    video2.play();
    gsap.to('.tech-video', { opacity: 1, duration: 0.5, ease: 'power2.inOut' });
    gsap.to('.tech-overlay', { opacity: 1, duration: 0.5, ease: 'power2.inOut' });
    
    // On cache le texte froid
    gsap.to('.fade-text-cold', { opacity: 0, duration: 0.5 });
  },
  onLeaveBack: () => {
    video2.pause();
    video2.currentTime = 0;
    gsap.to('.tech-video', { opacity: 0, duration: 0.3 });
    gsap.to('.tech-overlay', { opacity: 0, duration: 0.3 });
    
    gsap.to('.fade-text-cold', { opacity: 1, duration: 0.5 });
    
    gsap.set('.line', { strokeDashoffset: 50 });
    gsap.set('.spec', { opacity: 0, y: 10 });
    gsap.set('.tech-title', { opacity: 0 });
  }
});

// Animation des lignes SVG (suit le scroll pendant la Scène 3)
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  }
});

techTl.to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.2)
      .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.2)
      .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, 0.5)
      .to('.tech-title', { opacity: 1, duration: 1 }, 0.8);
