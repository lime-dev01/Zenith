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

// On crée une timeline pilotée par le scroll
const tlVideo = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-video',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onEnter: () => {
      // Lance la vidéo quand on entre dans la section
      video1.play();
    },
    onLeaveBack: () => {
      // Reset si on remonte tout en haut
      video1.pause();
      video1.currentTime = 0;
    }
  }
});

// 1. À 20% du scroll, on fait disparaître le texte chaud
tlVideo.to('.fade-text-warm', { opacity: 0, y: -30, duration: 0.2 }, 0.2);

// 2. À 40% du scroll (le temps que la vidéo fasse la transition vers la neige), on affiche le texte froid
tlVideo.to('.fade-text-cold', { opacity: 1, duration: 0.2 }, 0.4);

/* =========================================
   SCÈNE 3 (Prête pour demain)
   ========================================= */
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  }
});

// On anime les lignes SVG et les textes
techTl.to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.2)
      .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.2)
      .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, 0.5)
      .to('.tech-title', { opacity: 1, duration: 1 }, 0.8);
