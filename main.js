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
    
    // Reset vidéos
    gsap.set('.bg-video', { opacity: 1, visibility: 'visible' });
    gsap.set('.tech-video', { opacity: 0, visibility: 'hidden' });
    gsap.set('.tech-overlay', { opacity: 0 });
    video2.pause();
    video2.currentTime = 0;
  }
});

/* =========================================
   SCÈNE 3 : LE SWITCH AU SCROLL
   ========================================= */
const video2 = document.getElementById('video-2');
video2.pause();

// C'est le SCROLL qui déclenche le passage à la vidéo 2
ScrollTrigger.create({
  trigger: '.scene-tech',
  start: 'top 80%', // Se déclenche quand on scrolle vers la scène 3
  onEnter: () => {
    // 1. On force la vidéo 1 à être sur sa dernière image
    video1.pause();
    video1.currentTime = video1.duration; 
    
    // 2. On échange les vidéos instantanément (invisible car même image)
    gsap.set('.bg-video', { opacity: 0, visibility: 'hidden' });
    gsap.set('.tech-video', { opacity: 1, visibility: 'visible' });
    
    // 3. On lance la vidéo 2
    video2.play();
    
    // 4. ON EFFACE LE TEXTE FROID
    gsap.to('.fade-text-cold', { opacity: 0, duration: 0.5 });
  },
  onLeaveBack: () => {
    // Si on remonte, on remet la vidéo 1
    gsap.set('.bg-video', { opacity: 1, visibility: 'visible' });
    gsap.set('.tech-video', { opacity: 0, visibility: 'hidden' });
    gsap.set('.tech-overlay', { opacity: 0 });
    video2.pause();
    video2.currentTime = 0;
    
    // On réaffiche le texte froid
    gsap.to('.fade-text-cold', { opacity: 1, duration: 0.5 });
  }
});

/* =========================================
   ANIMATION DES LIGNES SVG
   ========================================= */
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top 40%',
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
