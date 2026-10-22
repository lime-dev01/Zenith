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

// Cache le texte froid quand on entre dans la Scène 3
ScrollTrigger.create({
  trigger: '.scene-tech',
  start: 'top 50%',
  onEnter: () => gsap.to('.fade-text-cold', { opacity: 0, duration: 0.5 }),
  onLeaveBack: () => gsap.to('.fade-text-cold', { opacity: 1, duration: 0.5 })
});

/* =========================================
   SCÈNE 3 (Vidéo 2 - Stable)
   ========================================= */
const video2 = document.getElementById('video-2');
video2.pause();

// On lance la vidéo 2 quand on arrive dessus
ScrollTrigger.create({
  trigger: '.scene-tech',
  start: 'top 50%', // Se déclenche quand la section est à moitié visible
  onEnter: () => {
    console.log("Lecture vidéo 2");
    video2.play();
  },
  onLeaveBack: () => {
    video2.pause();
    video2.currentTime = 0;
    // Reset SVG
    gsap.set('.line', { strokeDashoffset: 50 });
    gsap.set('.spec', { opacity: 0, y: 10 });
    gsap.set('.tech-title', { opacity: 0 });
  }
});

// Animation SVG synchronisée avec le scroll (scrub)
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1, // Suit la molette
  }
});

techTl.to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.2)
      .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.2)
      .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, 0.5)
      .to('.tech-title', { opacity: 1, duration: 1 }, 0.8);
