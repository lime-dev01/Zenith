/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* =========================================
   VIDÉO 1 & TEXTE CHAUD
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
   SCÈNE 3 : LE FONDU SANS BUG
   ========================================= */
const video2 = document.getElementById('video-2');
video2.pause();

// 1. On lance la vidéo 2 quand la section approche
ScrollTrigger.create({
  trigger: '.scene-tech',
  start: 'top bottom',
  onEnter: () => video2.play(),
  onLeaveBack: () => { video2.pause(); video2.currentTime = 0; }
});

// 2. L'opacité est STRICTEMENT liée au scroll (aucun onEnter/onLeaveBack ici)
// Le fondu commence quand la section est en bas de l'écran, et finit quand elle est à 20% du haut.
gsap.to('.tech-video', {
  opacity: 1,
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top bottom',
    end: 'top 20%',
    scrub: 1
  }
});

gsap.to('.tech-overlay', {
  opacity: 1,
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top bottom',
    end: 'top 20%',
    scrub: 1
  }
});

// 3. Le texte froid s'efface
gsap.to('.fade-text-cold', {
  opacity: 0,
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top bottom',
    end: 'top 40%',
    scrub: 1
  }
});

// 4. Les lignes SVG se dessinent SEULEMENT quand la vidéo 2 est bien visible (top 20%)
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top 20%', // Déclenche quand le fondu est terminé
    end: 'bottom bottom', 
    scrub: 1
  }
});

techTl.to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 })
      .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, "-=0.8")
      .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.5")
      .to('.tech-title', { opacity: 1, duration: 1 }, "-=0.5");
