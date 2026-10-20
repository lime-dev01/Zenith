import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

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

const sizes = { w: innerWidth, h: innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Environnement pour les reflets des verres
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

/* 3. Lumières */
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

const warmLight = new THREE.DirectionalLight(0xff5500, 3);
warmLight.position.set(5, 5, 5);
scene.add(warmLight);

const coldLight = new THREE.DirectionalLight(0x00e5ff, 0);
coldLight.position.set(-5, 5, 5);
scene.add(coldLight);

/* 4. FONDS (Shaders Désert et Banquise) */
// On crée deux plans qui remplissent l'écran, l'un derrière l'autre
const bgGeo = new THREE.PlaneGeometry(2, 2);
const bgMat = new THREE.ShaderMaterial({
  uniforms: {
    uColor1: { value: new THREE.Color(0x2a0800) }, // Rouge sombre
    uColor2: { value: new THREE.Color(0xff5500) }, // Orange vif
    uColor3: { value: new THREE.Color(0xffffff) }, // Blanc/bleu
    uColor4: { value: new THREE.Color(0x00e5ff) }, // Cyan
    uProgress: { value: 0.0 }, // 0 = Désert, 1 = Banquise
    uTime: { value: 0 }
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
    uniform vec3 uColor1, uColor2, uColor3, uColor4;
    uniform float uProgress, uTime;

    // Bruit pour simuler les dunes / la neige
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0; float a = 0.5;
      for(int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
      return v;
    }

    void main() {
      // Création de "dunes" procédurales
      vec2 uv = vUv * 3.0;
      float dune = fbm(uv + vec2(uTime * 0.05, 0.0));
      
      // Mélange chaud (Désert)
      vec3 warmBg = mix(uColor1, uColor2, dune);
      
      // Mélange froid (Banquise)
      vec3 coldBg = mix(uColor4, uColor3, dune);
      
      // Transition
      vec3 finalColor = mix(warmBg, coldBg, uProgress);
      
      // Vignettage
      float vignette = smoothstep(0.9, 0.3, distance(vUv, vec2(0.5)));
      finalColor *= vignette;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
  depthTest: false,
  depthWrite: false
});
const bgMesh = new THREE.Mesh(bgGeo, bgMat);
bgMesh.renderOrder = -1;
scene.add(bgMesh);

/* 5. OBJETS 3D (Lunettes et Masque) */
// Matériaux
const metalMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1.0, roughness: 0.2 });
const sunGlassMat = new THREE.MeshPhysicalMaterial({ color: 0x221100, metalness: 0.5, roughness: 0.0, transmission: 0.9, thickness: 0.5, ior: 1.5 });
const plasticMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.4 });
const snowGlassMat = new THREE.MeshPhysicalMaterial({ color: 0x00e5ff, metalness: 1.0, roughness: 0.0, clearcoat: 1.0 });

// LUNETTES (Chaud)
const glassesGroup = new THREE.Group();
// Verres
const lensL = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 16, 32), metalMat);
lensL.position.x = -1.2; glassesGroup.add(lensL);
const lensR = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 16, 32), metalMat);
lensR.position.x = 1.2; glassesGroup.add(lensR);
// Vitres
const glassL = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), sunGlassMat);
glassL.position.x = -1.2; glassesGroup.add(glassL);
const glassR = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), sunGlassMat);
glassR.position.x = 1.2; glassesGroup.add(glassR);
// Pont et branches
const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), metalMat);
glassesGroup.add(bridge);
const branchL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3), metalMat);
branchL.position.set(-2.2, 0, -1.5); glassesGroup.add(branchL);
const branchR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3), metalMat);
branchR.position.set(2.2, 0, -1.5); glassesGroup.add(branchR);
glassesGroup.rotation.set(0.2, -0.4, 0.1);
scene.add(glassesGroup);

// MASQUE (Froid)
const maskGroup = new THREE.Group();
maskGroup.visible = false;
// Monture
const maskFrame = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.15, 16, 32, Math.PI), plasticMat);
maskFrame.rotation.z = Math.PI; maskFrame.position.y = 0.2; maskGroup.add(maskFrame);
// Vitre (réfraction)
const maskLens = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.2, 32, 1, false, 0, Math.PI), snowGlassMat);
maskLens.rotation.x = Math.PI / 2; maskLens.rotation.y = Math.PI / 2; maskLens.position.y = 0.2; maskGroup.add(maskLens);
// Sangle
const strap = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, 16, 32), plasticMat);
strap.rotation.x = Math.PI / 2; strap.position.y = 0.2; maskGroup.add(strap);
maskGroup.rotation.set(0, 0.4, 0);
scene.add(maskGroup);

/* 6. Particules */
const particleCount = 800;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i+=3){
  pPos[i] = (Math.random() - 0.5) * 40;
  pPos[i+1] = (Math.random() - 0.5) * 20;
  pPos[i+2] = (Math.random() - 0.5) * 20;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ color: 0xff5500, size: 0.05, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* 7. TIMELINE GSAP (Le Scroll Banger) */
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  }
});

tl
  // Lumières
  .to(warmLight, { intensity: 0, duration: 1 }, 0)
  .to(coldLight, { intensity: 4, duration: 1 }, 0)
  // Fond (Shader)
  .to(bgMat.uniforms.uProgress, { value: 1.0, duration: 1 }, 0)
  // Particules (Poussière -> Neige)
  .to(particles.material.color, { r: 0.8, g: 0.9, b: 1, duration: 1 }, 0)
  
  // Transition des Objets
  .to(glassesGroup.rotation, { x: 1.5, y: 2, z: -1, duration: 1 }, 0)
  .to(glassesGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.8, ease: 'back.in(2)' }, 0)
  .set(glassesGroup, { visible: false }, 0.8)

  .set(maskGroup, { visible: true }, 0.3)
  .from(maskGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.7, ease: 'back.out(2)' }, 0.3)
  .from(maskGroup.rotation, { x: -1.5, y: -2, z: 1, duration: 1 }, 0.3);

/* Animation des textes HTML */
// Le texte chaud disparaît au scroll
gsap.to('.fade-text-warm', { 
  opacity: 0, y: -50, duration: 1, 
  scrollTrigger: { trigger: '.section:nth-child(3)', start: 'top center' } 
});
// Le texte froid apparaît
gsap.fromTo('.fade-text-cold', 
  { opacity: 0, y: 50 }, 
  { opacity: 1, y: 0, duration: 1, 
    scrollTrigger: { trigger: '.section:nth-child(3)', start: 'top center' } }
);

/* 8. Souris & Tick */
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();

  bgMat.uniforms.uTime.value = t;

  if (glassesGroup.visible) glassesGroup.position.y = Math.sin(t * 1.5) * 0.1;
  if (maskGroup.visible) maskGroup.position.y = Math.sin(t * 1.5) * 0.1;

  particles.rotation.y = t * 0.05;
  
  camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05;
  camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.05;
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
