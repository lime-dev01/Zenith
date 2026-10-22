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

ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'top 80%',
  onEnter: () => {
    video1.play();
    gsap.to('.fade-text-warm', { opacity: 0, y: -30, duration: 0.8 });
    
    // On attend 2.5s pour afficher le texte froid (le temps que la vidéo transitionne)
    setTimeout(() => {
      gsap.to('.fade-text-cold', { opacity: 1, duration: 0.1 });
      gsap.to('.fade-text-cold .title span', { y: 0, duration: 1, ease: 'power4.out', stagger: 0.1 });
      gsap.to('.fade-text-cold .desc', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
    }, 2000);
  },
  onLeaveBack: () => {
    video1.pause();
    video1.currentTime = 0;
    gsap.to('.fade-text-warm', { opacity: 1, y: 0, duration: 0.5 });
    gsap.to('.fade-text-cold', { opacity: 0, duration: 0.3 });
    gsap.set('.fade-text-cold .title span', { y: 100 });
    gsap.set('.fade-text-cold .desc', { opacity: 0, y: 20 });
  }
});

/* =========================================
   SCÈNE 3 (Fondu de la vidéo 2)
   ========================================= */
const video2 = document.getElementById('video-2');
video2.pause();

// Déclenchement dès qu'on arrive sur la section Tech
ScrollTrigger.create({
  trigger: '.scene-tech',
  start: 'top 80%', // Se déclenche très vite quand on scrolle vers la scène 3
  onEnter: () => {
    video2.play();
    // La vidéo 2 recouvre la vidéo 1 en fondu (comme elle commence par la poussière noire, c'est invisible)
    gsap.to('.tech-video', { opacity: 1, duration: 0.6, ease: 'power2.inOut' });
    gsap.to('.tech-overlay', { opacity: 1, duration: 0.6, ease: 'power2.inOut' });
    
    // On cache le texte froid
    gsap.to('.fade-text-cold', { opacity: 0, duration: 0.5 });
  },
  onLeaveBack: () => {
    video2.pause();
    video2.currentTime = 0;
    gsap.to('.tech-video', { opacity: 0, duration: 0.3 });
    gsap.to('.tech-overlay', { opacity: 0, duration: 0.3 });
    gsap.to('.fade-text-cold', { opacity: 1, duration: 0.5 });
    
    // Reset SVG
    gsap.set('.line', { strokeDashoffset: 100 });
    gsap.set('.spec', { opacity: 0, y: 10 });
    gsap.set('.tech-title', { opacity: 0 });
  }
});

/* =========================================
   ANIMATION DES LIGNES SVG (Rapide au scroll)
   ========================================= */
// Hauteur de la section = 150vh. Le scrub commence dès le top et finit au bottom.
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1, 
  }
});

// Les lignes se dessinent en premier (pendant que la vidéo joue)
techTl.to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 })
      .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, "-=0.8")
      .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.5")
      .to('.tech-title', { opacity: 1, duration: 1 }, "-=0.5");
