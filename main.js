import * as THREE from 'three';

/* 1. Smooth Scroll */
const lenis = new Lenis({ duration: 1.5, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. Setup Scene */
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.03); // Brouillard sombre de base

const sizes = { w: innerWidth, h: innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 0, 12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/* 3. Lumières */
const ambient = new THREE.AmbientLight(0xffffff, 0.15);
scene.add(ambient);

// Lumière CHAUDE
const warmLight = new THREE.DirectionalLight(0xff3300, 4);
warmLight.position.set(5, 5, 2);
warmLight.castShadow = true;
warmLight.shadow.mapSize.set(1024, 1024);
warmLight.shadow.radius = 4;
scene.add(warmLight);

// Lumière FROIDE (initialement éteinte)
const coldLight = new THREE.DirectionalLight(0x00e5ff, 0);
coldLight.position.set(-5, 5, 2);
coldLight.castShadow = true;
coldLight.shadow.mapSize.set(1024, 1024);
coldLight.shadow.radius = 4;
scene.add(coldLight);

// Rim Light (pour détacher les objets du fond)
const rimLight = new THREE.DirectionalLight(0xffffff, 2);
rimLight.position.set(0, 0, -10);
scene.add(rimLight);

/* 4. Le Sol (Grille stylisée) */
const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x111111);
gridHelper.position.y = -2.5;
scene.add(gridHelper);

// Un plan au sol pour recevoir les ombres
const floorMat = new THREE.ShadowMaterial({ opacity: 0.5 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.5;
floor.receiveShadow = true;
scene.add(floor);

/* 5. Les Objets (Lunettes vs Masque) */

// Groupe pour les lunettes (CHAUD)
const glassesGroup = new THREE.Group();
scene.add(glassesGroup);

// Matériau Titane (Sombre, métallique)
const titaniumMat = new THREE.MeshStandardMaterial({ 
  color: 0x1a1a1a, 
  metalness: 0.9, 
  roughness: 0.2 
});

// Matériau Verre Fumé (Chaud)
const sunGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0x110500,
  metalness: 0.5,
  roughness: 0.0,
  transmission: 0.9,
  thickness: 0.5,
  ior: 1.5,
  clearcoat: 1.0
});

// Modélisation procédurale des lunettes (stylisées)
const lensL = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 16, 32), titaniumMat);
lensL.position.set(-1.2, 0, 0);
lensL.castShadow = true;
glassesGroup.add(lensL);

const lensR = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 16, 32), titaniumMat);
lensR.position.set(1.2, 0, 0);
lensR.castShadow = true;
glassesGroup.add(lensR);

const glassL = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), sunGlassMat);
glassL.position.set(-1.2, 0, 0);
glassesGroup.add(glassL);

const glassR = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), sunGlassMat);
glassR.position.set(1.2, 0, 0);
glassesGroup.add(glassR);

const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), titaniumMat);
bridge.castShadow = true;
glassesGroup.add(bridge);

const branchL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3), titaniumMat);
branchL.position.set(-2.2, 0, -1.5);
branchL.castShadow = true;
glassesGroup.add(branchL);

const branchR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3), titaniumMat);
branchR.position.set(2.2, 0, -1.5);
branchR.castShadow = true;
glassesGroup.add(branchR);

// On incline les lunettes pour la 3D
glassesGroup.rotation.set(0.2, -0.4, 0.1);


// Groupe pour le Masque (FROID)
const maskGroup = new THREE.Group();
maskGroup.visible = false;
scene.add(maskGroup);

// Matériau Plastique Glacé (Froid)
const snowPlasticMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, 
  metalness: 0.1, 
  roughness: 0.3 
});

// Matériau Verre Miroir (Froid)
const mirrorGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0x00e5ff,
  metalness: 1.0,
  roughness: 0.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1
});

// Modélisation procédurale du masque
const maskFrame = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.2, 16, 32, Math.PI), snowPlasticMat);
maskFrame.rotation.z = Math.PI;
maskFrame.position.y = 0.5;
maskFrame.castShadow = true;
maskGroup.add(maskFrame);

const maskLens = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.1, 32, 1, false, 0, Math.PI), mirrorGlassMat);
maskLens.rotation.x = Math.PI / 2;
maskLens.rotation.y = Math.PI / 2;
maskLens.position.y = 0.5;
maskGroup.add(maskLens);

const strap = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, 16, 32), snowPlasticMat);
strap.rotation.x = Math.PI / 2;
strap.position.y = 0.5;
maskGroup.add(strap);

maskGroup.rotation.set(-0.2, 0.4, -0.1);

/* 6. Particules (Poussière / Neige) */
const particleCount = 600;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i+=3){
  pPos[i] = (Math.random() - 0.5) * 30;
  pPos[i+1] = (Math.random() - 0.5) * 20;
  pPos[i+2] = (Math.random() - 0.5) * 20;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ 
  color: 0xff3300, 
  size: 0.05, 
  transparent: true, 
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* 7. ANIMATION AU SCROLL (Le Banger) */
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  }
});

tl
  // Lumière chaude s'éteint, lumière froide s'allume (très fort)
  .to(warmLight, { intensity: 0, duration: 1 }, 0)
  .to(coldLight, { intensity: 5, duration: 1 }, 0)
  // Les particules changent de couleur
  .to(particles.material.color, { r: 0, g: 0.9, b: 1, duration: 1 }, 0)
  // La grille passe au bleu
  .to(gridHelper.material.color, { r: 0, g: 0.1, b: 0.2, duration: 1 }, 0)
  
  // Disparition des lunettes
  .to(glassesGroup.rotation, { x: 1.5, y: 2, z: -1, duration: 1 }, 0)
  .to(glassesGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.8, ease: 'back.in(2)' }, 0)
  .set(glassesGroup, { visible: false }, 0.8)

  // Apparition du masque
  .set(maskGroup, { visible: true }, 0.3)
  .from(maskGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.7, ease: 'back.out(2)' }, 0.3)
  .from(maskGroup.rotation, { x: -1.5, y: -2, z: 1, duration: 1 }, 0.3);

/* Révélation des textes HTML */
// Le texte chaud disparaît
gsap.to('.text-container:not(.text-container--right)', { 
  opacity: 0, y: -50, duration: 1, 
  scrollTrigger: { trigger: '.section:nth-child(3)', start: 'top center' } 
});
// Le texte froid apparaît
gsap.fromTo('.text-container--right', 
  { opacity: 0, y: 50 }, 
  { opacity: 1, y: 0, duration: 1, 
    scrollTrigger: { trigger: '.section:nth-child(3)', start: 'top center' } }
);

/* 8. Gestion Souris & Tick */
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();

  // Flottement des objets
  if (glassesGroup.visible) glassesGroup.position.y = Math.sin(t * 1.5) * 0.2;
  if (maskGroup.visible) maskGroup.position.y = Math.sin(t * 1.5) * 0.2;

  // Mouvement des particules
  particles.rotation.y = t * 0.05;
  particles.rotation.x = t * 0.02;
  
  // Parallaxe Caméra (la souris fait bouger la caméra, pas les objets)
  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
  camera.position.y += (-mouse.y * 1 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

window.addEventListener('resize', () => {
  sizes.w = innerWidth;
  sizes.h = innerHeight;
  camera.aspect = sizes.w / sizes.h;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.w, sizes.h);
});

tick();
