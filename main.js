/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. Setup Vidéo et Textes */
const video = document.getElementById('scroll-video');
video.pause();

// On cache le texte froid au départ
gsap.set('.fade-text-cold', { opacity: 0 });
gsap.set('.fade-text-cold .title span', { y: 100 }); // Poussé vers le bas pour l'effet masque
gsap.set('.fade-text-cold .desc', { opacity: 0, y: 20 });

let isTransitioning = false;

/* 3. Le Scroll déclenche la séquence (une seule fois) */
ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'top 80%', // Se déclenche quand on approche de la section froide
  onEnter: () => {
    if (isTransitioning) return;
    isTransitioning = true;

    // 1. On lance la vidéo (qui dure ~5s)
    video.play();

    // 2. Le texte chaud s'efface immédiatement
    gsap.to('.fade-text-warm', { opacity: 0, y: -30, duration: 0.8 });

    // 3. On attend que la vidéo fasse sa transition (2.5s) pour afficher le texte froid
    setTimeout(() => {
      gsap.to('.fade-text-cold', { opacity: 1, duration: 0.1 });
      gsap.to('.fade-text-cold .title span', { 
        y: 0, 
        duration: 1, 
        ease: 'power4.out', 
        stagger: 0.1 
      });
      gsap.to('.fade-text-cold .desc', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
    }, 2500); // 2.5 secondes de délai
  },
  onLeaveBack: () => {
    // Si on remonte tout en haut, on reset tout
    isTransitioning = false;
    video.pause();
    video.currentTime = 0;
    
    gsap.to('.fade-text-warm', { opacity: 1, y: 0, duration: 0.5 });
    gsap.to('.fade-text-cold', { opacity: 0, duration: 0.3 });
    gsap.set('.fade-text-cold .title span', { y: 100 });
    gsap.set('.fade-text-cold .desc', { opacity: 0, y: 20 });
  }
});
