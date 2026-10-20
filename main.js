import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* 1. Initialisation de Lenis */
const lenis = new Lenis({ duration: 1.5, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. Setup Three.js */
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0c, 0.08); 

const sizes = { w: innerWidth, h: innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 1, 9);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;

/* --- ENVIRONNEMENT POUR LES REFLETS --- */
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

/* 3. Lumières */
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

const warmLight = new THREE.DirectionalLight(0xff5500, 4);
warmLight.position.set(5, 5, 5);
warmLight.castShadow = true;
warmLight.shadow.mapSize.width = 1024;
warmLight.shadow.mapSize.height = 1024;
scene.add(warmLight);

const coldLight = new THREE.DirectionalLight(0x00e5ff, 0);
coldLight.position.set(-5, 5, 5);
coldLight.castShadow = true;
coldLight.shadow.mapSize.width = 1024;
coldLight.shadow.mapSize.height = 1024;
scene.add(coldLight);

/* 4. Le Sol */
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ 
  color: 0x111111, 
  roughness: 0.2,
  metalness: 0.8
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.5;
floor.receiveShadow = true;
scene.add(floor);

/* 5. FOND DÉGRADÉ (Shader) */
// On crée un plan qui fait la taille de l'écran, derrière tout le reste
const bgGeo = new THREE.PlaneGeometry(2, 2);
const bgMat = new THREE.ShaderMaterial({
  uniforms: {
    uColor1: { value: new THREE.Color(0x0a0a0c) }, // Noir profond
    uColor2: { value: new THREE.Color(0xff5500) }, // Rouge/Orange chaud
    uProgress: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uProgress;
    void main() {
      // Mélange les couleurs en fonction du progress
      vec3 color = mix(uColor1, uColor2, uProgress);
      // Ajoute un léger vignettage (bords plus sombres)
      float vignette = smoothstep(0.8, 0.2, distance(vUv, vec2(0.5)));
      color *= vignette;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  depthWrite: false,
  depthTest: false
});
const bgMesh = new THREE.Mesh(bgGeo, bgMat);
bgMesh.renderOrder = -1; // S'assure qu'il est dessiné en premier
scene.add(bgMesh);

/* 6. Matériaux (Verre réaliste) */
const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 1.0 });
// Verre fumé pour les lunettes de soleil
const lensSunMat = new THREE.MeshPhysicalMaterial({ 
  color: 0x111111, 
  roughness: 0.0, 
  metalness: 1.0, 
  transmission: 0.9, // Laisse passer la lumière
  thickness: 0.5,    // Épaisseur du verre
  ior: 1.5           // Indice de réfraction
});
// Verre bleu glacé pour le masque
const lensSnowMat = new THREE.MeshPhysicalMaterial({ 
  color: 0x00e5ff, 
  roughness: 0.0, 
  metalness: 0.9, 
  transmission: 0.4, 
  clearcoat: 1.0,    // Effet miroir
  clearcoatRoughness: 0.1
});
const strapMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });

/* 7. L'OBJET 1 : Les Lunettes de Soleil */
const glassesGroup = new THREE.Group();
glassesGroup.position.set(0, 0, 0);
glassesGroup.rotation.set(-0.1, -0.4, 0);

const lensL = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 16, 32), frameMat);
lensL.position.set(-1, 0, 0);
glassesGroup.add(lensL);
const lensR = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 16, 32), frameMat);
lensR.position.set(1, 0, 0);
glassesGroup.add(lensR);

const glassL = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), lensSunMat);
glassL.position.set(-1, 0, 0);
glassesGroup.add(glassL);
const glassR = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), lensSunMat);
glassR.position.set(1, 0, 0);
glassesGroup.add(glassR);

const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), frameMat);
glassesGroup.add(bridge);

const branchL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.5), frameMat);
branchL.position.set(-1.8, 0.2, -1.25);
glassesGroup.add(branchL);
const branchR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.5), frameMat);
branchR.position.set(1.8, 0.2, -1.25);
glassesGroup.add(branchR);

scene.add(glassesGroup);

/* 8. L'OBJET 2 : Le Masque de Ski (Caché au début) */
const maskGroup = new THREE.Group();
maskGroup.position.set(0, 0, 0);
maskGroup.rotation.set(0.1, 0.4, 0);
maskGroup.visible = false;

const maskFrame = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), frameMat);
maskFrame.scale.set(1, 0.6, 0.8);
maskGroup.add(maskFrame);

const maskLens = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), lensSnowMat);
maskLens.scale.set(1, 0.6, 0.8);
maskLens.position.y = 0.1;
maskGroup.add(maskLens);

const strap = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.1, 16, 32), strapMat);
strap.rotation.x = Math.PI / 2;
strap.position.y = 0.2;
maskGroup.add(strap);

scene.add(maskGroup);

/* 9. Particules */
const particleCount = 800;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i+=3){
  pPos[i] = (Math.random() - 0.5) * 30;
  pPos[i+1] = (Math.random() - 0.5) * 15;
  pPos[i+2] = (Math.random() - 0.5) * 20;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ color: 0xff5500, size: 0.06, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* 10. ANIMATION AU SCROLL */
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  }
});

tl.to(warmLight, { intensity: 0, duration: 1 }, 0)
  // La lumière froide devient blanche pour le côté "polaire"
  .to(coldLight, { intensity: 5, color: new THREE.Color(0xffffff), duration: 1 }, 0) 
  .to(floorMat.color, { r: 0.05, g: 0.1, b: 0.15, duration: 1 }, 0)
  .to(particles.material.color, { r: 0.8, g: 0.9, b: 1, duration: 1 }, 0)
  
  // LE FOND PASSE DE NOIR/ROUGE À BLANC/BLEU
  .to(bgMat.uniforms.uColor1, { value: new THREE.Color(0xffffff), duration: 1 }, 0) // Fond principal blanc
  .to(bgMat.uniforms.uColor2, { value: new THREE.Color(0x00e5ff), duration: 1 }, 0) // Accent bleu
  .to(bgMat.uniforms.uProgress, { value: 1.0, duration: 1 }, 0) // Le mélange s'active

  // Lunettes disparaissent
  .to(glassesGroup.rotation, { x: 2, y: 3, z: 1, duration: 1 }, 0)
  .to(glassesGroup.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'back.in(2)' }, 0)
  .set(glassesGroup, { visible: false }, 0.8)

  // Masque apparaît
  .set(maskGroup, { visible: true }, 0.4)
  .from(maskGroup.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'back.out(2)' }, 0.4)
  .from(maskGroup.rotation, { x: -2, y: -3, z: -1, duration: 1 }, 0.4);

/* Révélation des titres */
gsap.to('.title__warm', { opacity: 0, y: -100, duration: 1, scrollTrigger: { trigger: '.section--cold', start: 'top center' } });
gsap.fromTo('.title__cold', { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: '.section--cold', start: 'top center' } });

/* 11. Tick & Souris */
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();

  if (glassesGroup.visible) glassesGroup.position.y = Math.sin(t * 2) * 0.1;
  if (maskGroup.visible) maskGroup.position.y = Math.sin(t * 2) * 0.1;

  particles.rotation.y = t * 0.05;
  
  camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05;
  camera.position.y += (-mouse.y * 0.5 + 1 - camera.position.y) * 0.05;
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
