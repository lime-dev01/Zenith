import * as THREE from 'three';

/* 1. Initialisation de Lenis (Smooth Scroll) */
const lenis = new Lenis({
  duration: 1.5,
  smoothWheel: true,
});
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. Setup Three.js de base */
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
// On met un brouillard pour cacher les bords du sol
scene.fog = new THREE.FogExp2(0x050505, 0.15); 

const sizes = { w: innerWidth, h: innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 2, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/* 3. Lumières */
// Lumière ambiante très faible
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// Lumière CHAUDE (Soleil)
const warmLight = new THREE.DirectionalLight(0xff5500, 3);
warmLight.position.set(5, 5, 5);
warmLight.castShadow = true;
warmLight.shadow.mapSize.width = 1024;
warmLight.shadow.mapSize.height = 1024;
scene.add(warmLight);

// Lumière FROIDE (Glace)
const coldLight = new THREE.DirectionalLight(0x00e5ff, 0);
coldLight.position.set(-5, 5, 5);
coldLight.castShadow = true;
coldLight.shadow.mapSize.width = 1024;
coldLight.shadow.mapSize.height = 1024;
scene.add(coldLight);

// Lumière de contour (Rim light) pour détacher les objets
const rimLight = new THREE.DirectionalLight(0xffffff, 1);
rimLight.position.set(0, 2, -5);
scene.add(rimLight);

/* 4. Le Sol */
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ 
  color: 0x111111, 
  roughness: 0.8,
  metalness: 0.2
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.5;
floor.receiveShadow = true;
scene.add(floor);

/* 5. Matériaux */
const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.8 });
const lensSunMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.5, transmission: 0.5 }); // Verre fumé
const lensSnowMat = new THREE.MeshPhysicalMaterial({ color: 0x00e5ff, roughness: 0.1, metalness: 0.9, transmission: 0.2, emissive: 0x00e5ff, emissiveIntensity: 0.2 }); // Verre réfléchissant
const strapMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

/* 6. L'OBJET 1 : Les Lunettes de Soleil */
const glassesGroup = new THREE.Group();
glassesGroup.position.set(0, 0, 0);

// Verre Gauche
const lensL = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 16, 32), frameMat);
lensL.position.set(-1, 0, 0);
glassesGroup.add(lensL);
// Verre Droit
const lensR = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 16, 32), frameMat);
lensR.position.set(1, 0, 0);
glassesGroup.add(lensR);

// Vitre Gauche
const glassL = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), lensSunMat);
glassL.position.set(-1, 0, 0);
glassesGroup.add(glassL);
// Vitre Droite
const glassR = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), lensSunMat);
glassR.position.set(1, 0, 0);
glassesGroup.add(glassR);

// Pont central
const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), frameMat);
glassesGroup.add(bridge);

// Branches (Branches droites)
const branchL = new THREE.Group();
const branchLMesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.15), frameMat);
branchLMesh.position.x = -1.25;
branchL.add(branchLMesh);
branchL.position.set(-1.8, 0.2, 0);
branchL.rotation.y = Math.PI / 2; // Tournées vers l'arrière
glassesGroup.add(branchL);

const branchR = new THREE.Group();
const branchRMesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.15), frameMat);
branchRMesh.position.x = 1.25;
branchR.add(branchRMesh);
branchR.position.set(1.8, 0.2, 0);
branchR.rotation.y = -Math.PI / 2;
glassesGroup.add(branchR);

// On incline les lunettes pour la vue 3D
glassesGroup.rotation.x = -0.2;
glassesGroup.rotation.y = -0.5;
scene.add(glassesGroup);

/* 7. L'OBJET 2 : Le Masque de Ski (Caché au début) */
const maskGroup = new THREE.Group();
maskGroup.position.set(0, 0, 0);
maskGroup.visible = false; // Caché

// Cadre du masque (une sphère aplatie)
const maskFrame = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), frameMat);
maskFrame.scale.set(1, 0.6, 0.8);
maskGroup.add(maskFrame);

// Le verre du masque
const maskLens = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), lensSnowMat);
maskLens.scale.set(1, 0.6, 0.8);
maskLens.position.y = 0.1;
maskGroup.add(maskLens);

// Sangle (Torus autour de la tête)
const strap = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.1, 16, 32), strapMat);
strap.rotation.x = Math.PI / 2;
strap.position.y = 0.2;
strap.scale.set(1, 1, 1);
maskGroup.add(strap);

maskGroup.rotation.x = 0.2;
maskGroup.rotation.y = 0.5;
scene.add(maskGroup);

/* 8. Particules d'ambiance (Poussière / Neige) */
const particleCount = 800;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i+=3){
  pPos[i] = (Math.random() - 0.5) * 30;
  pPos[i+1] = (Math.random() - 0.5) * 15;
  pPos[i+2] = (Math.random() - 0.5) * 20;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ 
  color: 0xff5500, 
  size: 0.05, 
  transparent: true, 
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* 9. ANIMATION AU SCROLL (Le Banger) */
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  }
});

// On anime les lumières (chaud s'éteint, froid s'allume)
tl.to(warmLight, { intensity: 0, duration: 1 }, 0)
  .to(coldLight, { intensity: 4, duration: 1 }, 0)
  .to(floorMat.color, { r: 0.1, g: 0.2, b: 0.3, duration: 1 }, 0) // Le sol devient bleu glacé
  .to(particles.material, { color: new THREE.Color(0x00e5ff), duration: 1 }, 0)
  
  // On cache les lunettes (en les faisant rétrécir et tourner)
  .to(glassesGroup.rotation, { x: 2, y: 3, z: 1, duration: 1 }, 0)
  .to(glassesGroup.scale, { x: 0, y: 0, z: 0, duration: 1, ease: 'back.in(2)' }, 0)
  .set(glassesGroup, { visible: false }, 1)

  // On fait apparaître le masque
  .set(maskGroup, { visible: true }, 0.5)
  .from(maskGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'back.out(2)' }, 0.5)
  .from(maskGroup.rotation, { x: -2, y: -3, z: -1, duration: 1 }, 0.5);

/* Révélation des titres HTML */
gsap.to('.title__warm', { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: '.section--warm', start: 'top center' } });
gsap.to('.title__warm', { opacity: 0, y: -100, duration: 1, scrollTrigger: { trigger: '.section--cold', start: 'top center' } });

gsap.fromTo('.title__cold', { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: '.section--cold', start: 'top center' } });

/* 10. Animation continue (Tick) */
const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();

  // Rotation de base
  if (glassesGroup.visible) {
    glassesGroup.position.y = Math.sin(t * 2) * 0.1;
  }
  if (maskGroup.visible) {
    maskGroup.position.y = Math.sin(t * 2) * 0.1;
  }

  // Mouvement des particules
  particles.rotation.y = t * 0.05;
  
  // Parallaxe souris sur la caméra
  camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05;
  camera.position.y += (-mouse.y * 0.5 + 1.5 - camera.position.y) * 0.05; // Y de base à 1.5
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

/* Gestion de la souris */
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
});

window.addEventListener('resize', () => {
  sizes.w = innerWidth;
  sizes.h = innerHeight;
  camera.aspect = sizes.w / sizes.h;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.w, sizes.h);
});

tick();
