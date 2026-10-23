/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* =========================================
   SCÈNES 1 & 2
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
    
    gsap.set('.bg-video', { opacity: 1, visibility: 'visible' });
    gsap.set('.tech-video', { opacity: 0, visibility: 'hidden' });
    gsap.set('.tech-overlay', { opacity: 0 });
    video2.pause();
    video2.currentTime = 0;
  }
});

// CORRECTION 1 : Le texte froid disparaît beaucoup plus tôt (bottom 90%)
ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'bottom 90%', 
  onEnter: () => gsap.to('.fade-text-cold', { opacity: 0, duration: 0.4 }),
  onLeaveBack: () => gsap.to('.fade-text-cold', { opacity: 1, duration: 0.4 })
});

/* =========================================
   SCÈNE 3 (Vidéo 2)
   ========================================= */
const video2 = document.getElementById('video-2');
video2.pause();

// CORRECTION 2 : On déclenche la vidéo 2 sur la section froide, bien plus tôt
ScrollTrigger.create({
  trigger: '.section--cold',
  start: 'bottom 80%', // Se déclenche quand la section froide est presque terminée
  onEnter: () => {
    video1.pause();
    video1.currentTime = video1.duration; 
    
    gsap.to('.bg-video', { opacity: 0, duration: 0.2, onComplete: () => {
      gsap.set('.bg-video', { visibility: 'hidden' });
    }});
    
    gsap.to('.tech-video', { opacity: 1, duration: 0.2, onComplete: () => {
      video2.play();
    }});
  },
  onLeaveBack: () => {
    gsap.set('.bg-video', { opacity: 1, visibility: 'visible' });
    gsap.set('.tech-video', { opacity: 0, visibility: 'hidden' });
    gsap.set('.tech-overlay', { opacity: 0 });
    video2.pause();
    video2.currentTime = 0;
  }
});

// Le reste de l'animation de la Scène 3 (lignes SVG)
const techTl = gsap.timeline({
  scrollTrigger: {
    trigger: '.scene-tech',
    start: 'top 50%',
    end: 'bottom bottom',
    scrub: 1
  }
});

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
      .to('.spec-card', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.5")
      .to('.tech-title', { opacity: 1, duration: 1 }, "-=0.5");

/* =========================================
   SCÈNE 4 : L'ACTION (HUD)
   ========================================= */
const videoSki = document.getElementById('video-ski');
const videoSand = document.getElementById('video-sand');
const hud = document.getElementById('hud');
const switchBtn = document.getElementById('switch-btn');
const modeText = document.getElementById('mode-text');
const tempText = document.getElementById('temp-text');
const altText = document.getElementById('alt-text');
const uvText = document.getElementById('uv-text');

const fillTemp = document.getElementById('fill-temp');
const fillAlt = document.getElementById('fill-alt');

videoSki.pause();
videoSand.pause();

let isColdMode = true; 

ScrollTrigger.create({
  trigger: '.scene-action',
  start: 'top 80%',
  onEnter: () => {
    gsap.set('.tech-video', { opacity: 0, visibility: 'hidden' });
    gsap.set('.tech-overlay', { opacity: 0 });
    video2.pause();

    gsap.set('.action-video', { opacity: 0 });
    gsap.set('#video-ski', { opacity: 1 });
    videoSki.play();
    
    gsap.to('.hud-container', { opacity: 1, duration: 0.5 });
    gsap.to('.hud-container', { color: '#00e5ff', duration: 0.5 });
  },
  onLeaveBack: () => {
    videoSki.pause();
    videoSki.currentTime = 0;
    videoSand.pause();
    videoSand.currentTime = 0;
    gsap.set('.action-video', { opacity: 0 });
    gsap.to('.hud-container', { opacity: 0, duration: 0.3 });
    
    gsap.set('.tech-video', { opacity: 1, visibility: 'visible' });
    gsap.set('.tech-overlay', { opacity: 1 });
    video2.play();
  }
});

function switchMode() {
  gsap.to('.hud-container', { x: 10, y: -10, duration: 0.05, repeat: 5, yoyo: true, onComplete: () => {
    gsap.set('.hud-container', { x: 0, y: 0 });
  }});

  if (isColdMode) {
    gsap.set('#video-ski', { visibility: 'hidden' });
    gsap.set('#video-sand', { visibility: 'visible', opacity: 1 });
    videoSand.play();
    
    gsap.to('.hud-container', { color: '#ff5500', duration: 0.3 });
    gsap.to('.corner', { borderColor: '#ff5500', duration: 0.3 });
    gsap.to('.center-dot', { backgroundColor: '#ff5500', duration: 0.3 });
    gsap.to('.hud-btn', { color: '#ff5500', borderColor: '#ff5500', duration: 0.3 });
    gsap.to('.data-row span', { color: '#ff5500', duration: 0.3 });
    
    modeText.textContent = "DÉSERT";
    tempText.textContent = "48°C";
    altText.textContent = "120M";
    uvText.textContent = "MAX";
    
    gsap.to(fillTemp, { width: '90%', duration: 0.5, backgroundColor: '#ff5500', boxShadow: '0 0 8px #ff5500' });
    gsap.to(fillAlt, { width: '20%', duration: 0.5, backgroundColor: '#ff5500', boxShadow: '0 0 8px #ff5500' });
    
    isColdMode = false;
  } else {
    gsap.set('#video-sand', { visibility: 'hidden' });
    gsap.set('#video-ski', { visibility: 'visible', opacity: 1 });
    videoSki.play();
    
    gsap.to('.hud-container', { color: '#00e5ff', duration: 0.3 });
    gsap.to('.corner', { borderColor: '#00e5ff', duration: 0.3 });
    gsap.to('.center-dot', { backgroundColor: '#00e5ff', duration: 0.3 });
    gsap.to('.hud-btn', { color: '#00e5ff', borderColor: '#00e5ff', duration: 0.3 });
    gsap.to('.data-row span', { color: '#00e5ff', duration: 0.3 });
    
    modeText.textContent = "POLAIRE";
    tempText.textContent = "-24°C";
    altText.textContent = "3200M";
    uvText.textContent = "0%";
    
    gsap.to(fillTemp, { width: '20%', duration: 0.5, backgroundColor: '#00e5ff', boxShadow: '0 0 8px #00e5ff' });
    gsap.to(fillAlt, { width: '80%', duration: 0.5, backgroundColor: '#00e5ff', boxShadow: '0 0 8px #00e5ff' });
    
    isColdMode = true;
  }
}

switchBtn.addEventListener('click', switchMode);
