/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. Vidéo & Timeline de texte */
const video = document.getElementById('scroll-video');
video.pause();

// On cache le texte froid au départ avec GSAP
gsap.set('.fade-text-cold', { opacity: 0 });
gsap.set('.fade-text-cold .title span', { y: 100 }); // Le texte est poussé vers le bas
gsap.set('.fade-text-cold .desc', { opacity: 0, y: 20 });

// La timeline de transition du texte
const textTransition = gsap.timeline({ paused: true });

textTransition
  // Le texte chaud part en fondu propre
  .to('.fade-text-warm', { opacity: 0, y: -20, duration: 0.5 })
  // Le texte froid apparaît avec un effet de masque (il monte)
  .to('.fade-text-cold', { opacity: 1, duration: 0.1 }, "-=0.2")
  .to('.fade-text-cold .title span', { y: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, "-=0.1")
  .to('.fade-text-cold .desc', { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");

/* 3. Le Scroll déclenche tout */
ScrollTrigger.create({
  trigger: '.section:nth-child(3)', // La section froide
  start: 'top 60%', // Se déclenche quand la section est à 60% de l'écran
  onEnter: () => {
    video.play(); // On lance la vidéo
    textTransition.play(); // On lance l'animation du texte (qui dure ~1.5s, le temps que la vidéo transitionne)
  },
  onLeaveBack: () => {
    video.pause();
    video.currentTime = 0;
    textTransition.reverse(); // Si on remonte, le texte redevient chaud
  }
});
