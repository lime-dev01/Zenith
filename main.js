/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.5, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. La logique de Scrub Vidéo */
const video = document.getElementById('scroll-video');
let videoReady = false;
let targetTime = 0;
let currentTime = 0;

// On met la vidéo en pause pour la contrôler manuellement
video.pause();

video.addEventListener('loadedmetadata', () => {
  videoReady = true;
});

/* 3. Animation des Textes */
// Le texte chaud disparaît quand on descend
gsap.to('.fade-text-warm', {
  opacity: 0,
  y: -50,
  duration: 1,
  scrollTrigger: {
    trigger: '.section--cold',
    start: 'top bottom', // Se déclenche quand la section froide arrive
    end: 'top center',
    scrub: true,
  }
});

// Le texte froid apparaît quand on descend
gsap.fromTo('.fade-text-cold',
  { opacity: 0, y: 50 },
  {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '.section--cold',
      start: 'top bottom',
      end: 'top center',
      scrub: true,
    }
  }
);

/* 4. Boucle d'animation (Lerp pour fluidité) */
function updateVideo() {
  if (videoReady) {
    // On calcule le pourcentage de scroll total de la page (0 à 1)
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));

    // On mappe ce pourcentage sur la durée de la vidéo
    targetTime = progress * video.duration;

    // On lisse la valeur (lerp) pour éviter les saccades
    currentTime += (targetTime - currentTime) * 0.1;

    // On applique le temps à la vidéo
    if (Math.abs(video.currentTime - currentTime) > 0.01) {
      video.currentTime = currentTime;
    }
  }
  requestAnimationFrame(updateVideo);
}

updateVideo();
