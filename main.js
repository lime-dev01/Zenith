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
   SCÈNE 3 : LA VIDÉO 2 ET LES LIGNES
   ========================================= */
const video2 = document.getElementById('video-2');
video2.pause();

// 1. Déclenchement de la vidéo 2 et de l'overlay
ScrollTrigger.create({
  trigger: '.scene-tech',
  start: 'top 80%', // Se déclenche quand on approche de la scène 3
  onEnter: () => {
    video2.play();
    // On fait apparaître la vidéo 2 (qui est par-dessus la vidéo 1)
    gsap.to('.tech-overlay', { opacity: 1, duration: 0.5 });
    // On efface le texte froid
    gsap.to('.fade-text-cold', { opacity: 0, duration: 0.5 });
  },
  onLeaveBack: () => {
    video2.pause();
    video2.currentTime = 0;
    gsap.to('.tech-overlay', { opacity: 0, duration: 0.3 });
    gsap.to('.fade-text-cold', { opacity: 1, duration: 0.5 });
    
    // Reset SVG
    gsap.set('.line', { strokeDashoffset: 100 });
    gsap.set('.spec', { opacity: 0, y: 10 });
    gsap.set('.tech-title', { opacity: 0 });
  }
});

// 2. Animation des lignes SVG synchronisée avec le scroll dans la Scène 3
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1, // Le scroll pilote l'animation
  }
});

techTl.to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.5)
      .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.5)
      .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, 1.0)
      .to('.tech-title', { opacity: 1, duration: 1 }, 1.2);
