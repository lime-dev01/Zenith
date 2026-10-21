/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* =========================================
   SCÈNES 1 & 2 (Vidéo Transition)
   ========================================= */
const video1 = document.getElementById('video-1');
video1.pause();

gsap.set('.fade-text-cold', { opacity: 0, y: 50 });
gsap.set('.fade-text-cold .title span', { y: 100 });

let isTransitioning = false;

ScrollTrigger.create({
  trigger: '.scene-video',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    if (self.progress > 0.2 && !isTransitioning) {
      isTransitioning = true;
      video1.play();
      gsap.to('.fade-text-warm', { opacity: 0, y: -30, duration: 0.8 });
      
      setTimeout(() => {
        gsap.to('.fade-text-cold', { opacity: 1, duration: 0.1 });
        gsap.to('.fade-text-cold .title span', { y: 0, duration: 1, ease: 'power4.out', stagger: 0.1 });
      }, 2500);
    }
    
    if (self.progress < 0.1 && isTransitioning) {
      isTransitioning = false;
      video1.pause();
      video1.currentTime = 0;
      gsap.to('.fade-text-warm', { opacity: 1, y: 0, duration: 0.5 });
      gsap.to('.fade-text-cold', { opacity: 0, duration: 0.3 });
      gsap.set('.fade-text-cold .title span', { y: 100 });
    }
  }
});

/* =========================================
   SCÈNE 3 (Prête pour la vidéo de demain)
   ========================================= */
// On cible la balise vidéo
const video2 = document.getElementById('video-2');
video2.pause();

const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  }
});

// On allume la vidéo (de brightness 0 à 1)
techTl.to('.tech-media', { filter: 'brightness(1)', duration: 1 }, 0)
  .to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.5)
  .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.5)
  .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, 0.8)
  .to('.tech-title', { opacity: 1, duration: 1 }, 1);

// Optionnel : Faire jouer la vidéo quand on est dessus (si tu veux qu'elle boucle)
ScrollTrigger.create({
  trigger: '.scene-tech',
  start: 'top 50%',
  onEnter: () => video2.play(),
  onLeaveBack: () => {
    video2.pause();
    video2.currentTime = 0;
  }
});
