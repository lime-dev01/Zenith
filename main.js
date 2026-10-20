import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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

// Environnement de studio pour les reflets
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

/* 3. Lumières */
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const warmLight = new THREE.DirectionalLight(0xff5500, 3);
warmLight.position.set(5, 5, 5);
scene.add(warmLight);
const coldLight = new THREE.DirectionalLight(0x00e5ff, 0);
coldLight.position.set(-5, 5, 5);
scene.add(coldLight);

/* 4. FOND AVEC IMAGES RÉALISTES (Transition Shader) */
const textureLoader = new THREE.TextureLoader();
// Images Unsplash libres de droits
const desertTex = textureLoader.load('https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2076&auto=format&fit=crop'); // Désert
const snowTex = textureLoader.load('https://images.unsplash.com/photo-1478719059408-592965723cbc?q=80&w=2076&auto=format&fit=crop'); // Banquise

const bgGeo = new THREE.PlaneGeometry(2, 2);
const bgMat = new THREE.ShaderMaterial({
  uniforms: {
    uDesert: { value: desertTex },
    uSnow: { value: snowTex },
    uProgress: { value: 0.0 },
    uTime: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uDesert;
    uniform sampler2D uSnow;
    uniform float uProgress;
    uniform float uTime;

    // Bruit pour la distorsion
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // Distorsion des UV pour un effet organique
      vec2 distortedUv = vUv;
      distortedUv.x += sin(vUv.y * 10.0 + uTime) * 0.02 * (1.0 - uProgress);
      distortedUv.y += cos(vUv.x * 10.0 + uTime) * 0.02 * uProgress;

      vec4 desert = texture2D(uDesert, distortedUv);
      vec4 snow = texture2D(uSnow, distortedUv);
      
      // Mélange avec un masque de bruit pour une transition plus naturelle
      float mask = noise(vUv * 5.0 + uTime * 0.1);
      float mixFactor = smoothstep(mask - 0.2, mask + 0.2, uProgress);
      
      vec4 finalColor = mix(desert, snow, mixFactor);
      
      // Vignettage
      float vignette = smoothstep(1.0, 0.3, distance(vUv, vec2(0.5)));
      finalColor.rgb *= vignette;

      gl_FragColor = finalColor;
    }
  `,
  depthTest: false,
  depthWrite: false
});
const bgMesh = new THREE.Mesh(bgGeo, bgMat);
bgMesh.renderOrder = -1;
scene.add(bgMesh);

/* 5. CHARGEMENT DES MODÈLES 3D */
const gltfLoader = new GLTFLoader();

// --- LUNETTES DE SOLEIL (Modèle Khronos fiable) ---
let glasses = new THREE.Group();
gltfLoader.load(
  'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/SunglassesKhronos/glTF-Binary/SunglassesKhronos.glb',
  (gltf) => {
    glasses = gltf.scene;
    glasses.scale.set(1.2, 1.2, 1.2);
    glasses.position.set(0, 0, 0);
    glasses.rotation.set(0, -0.5, 0);
    scene.add(glasses);
  },
  undefined,
  (error) => console.error('Erreur lunettes:', error)
);

// --- MASQUE DE SKI (Modèle low-poly fiable) ---
let mask = new THREE.Group();
gltfLoader.load(
  'https://cdn.jsdelivr.net/gh/get3dmodels/free-models@main/ski-goggles/ski_goggles.glb',
  (gltf) => {
    mask = gltf.scene;
    mask.scale.set(2, 2, 2);
    mask.position.set(0, 0, 0);
    mask.rotation.set(0, 0.5, 0);
    mask.visible = false;
    scene.add(mask);
  },
  undefined,
  (error) => console.error('Erreur masque:', error)
);

/* 6. Particules (Poussière / Neige) */
const particleCount = 600;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i+=3){
  pPos[i] = (Math.random() - 0.5) * 30;
  pPos[i+1] = (Math.random() - 0.5) * 15;
  pPos[i+2] = (Math.random() - 0.5) * 20;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.05, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* 7. TIMELINE GSAP (Scroll) */
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  }
});

tl.to(warmLight, { intensity: 0, duration: 1 }, 0)
  .to(coldLight, { intensity: 4, duration: 1 }, 0)
  .to(bgMat.uniforms.uProgress, { value: 1.0, duration: 1 }, 0)
  .to(particles.material.color, { r: 0.8, g: 0.9, b: 1, duration: 1 }, 0)
  
  // Transition des modèles 3D
  .to(glasses.rotation, { y: 2, x: 0.5, duration: 1 }, 0)
  .to(glasses.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.8, ease: 'back.in(2)' }, 0)
  .set(glasses, { visible: false }, 0.8)
  .set(mask, { visible: true }, 0.3)
  .from(mask.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.7, ease: 'back.out(2)' }, 0.3)
  .from(mask.rotation, { y: -2, duration: 1 }, 0.3);

/* 8. Animation des textes (Correction du bug de réapparition) */
gsap.fromTo('.fade-text-warm', 
  { opacity: 1, y: 0 },
  { opacity: 0, y: -50, duration: 1,
    scrollTrigger: { 
      trigger: '.section:nth-child(3)', 
      start: 'top center',
      toggleActions: 'play reverse play reverse' // Réapparaît en remontant
    } 
  }
);

gsap.fromTo('.fade-text-cold',
  { opacity: 0, y: 50 },
  { opacity: 1, y: 0, duration: 1,
    scrollTrigger: { 
      trigger: '.section:nth-child(3)', 
      start: 'top center',
      toggleActions: 'play reverse play reverse'
    }
  }
);

/* 9. Souris & Tick */
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();
  bgMat.uniforms.uTime.value = t;

  if (glasses.visible) glasses.position.y = Math.sin(t * 1.5) * 0.1;
  if (mask.visible) mask.position.y = Math.sin(t * 1.5) * 0.1;

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
