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
    // Reset complet si on remonte
    video1.pause();
    video1.currentTime = 0;
    gsap.to('.fade-text-warm', { opacity: 1, y: 0, duration: 0.5 });
    gsap.to('.fade-text-cold', { opacity: 0, duration: 0.3 });
    gsap.set('.fade-text-cold .title span', { y: 100 });
    gsap.set('.fade-text-cold .desc', { opacity: 0, y: 20 });
    
    // On remet la vidéo 1 et on cache la vidéo 2
    gsap.set('.bg-video', { opacity: 1, visibility: 'visible' });
    gsap.set('.tech-video', { opacity: 0, visibility: 'hidden' });
    gsap.set('.tech-overlay', { opacity: 0 });
    video2.pause();
    video2.currentTime = 0;
  }
});

/* =========================================
   SCÈNE 3 : LE SWITCH INSTANTANÉ
   ========================================= */
const video2 = document.getElementById('video-2');
video2.pause();

// 1. LE MOMENT CLÉ : Quand la vidéo 1 se termine
video1.addEventListener('ended', () => {
  // On cache la vidéo 1 INSTANTANÉMENT
  gsap.set('.bg-video', { opacity: 0, visibility: 'hidden' });
  // On montre la vidéo 2 INSTANTANÉMENT (elle commence sur la poussière noire)
  gsap.set('.tech-video', { opacity: 1, visibility: 'visible' });
  // On lance la vidéo 2
  video2.play();
});

// 2. Le scroll contrôle l'apparition des lignes SVG (une fois la vidéo 2 lancée)
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top 80%',
    end: 'bottom bottom',
    scrub: 1
  }
});

// On affiche l'overlay (lignes + textes)
gsap.to('.tech-overlay', {
  opacity: 1,
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top 60%',
    end: 'top 20%',
    scrub: 1
  }
});

techTl.to('.line--warm', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 0.5)
      .to('.line--cold', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, "-=0.8")
      .to('.spec', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.5")
      .to('.tech-title', { opacity: 1, duration: 1 }, "-=0.5");
