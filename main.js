import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
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
scene.fog = new THREE.FogExp2(0x0a0a0c, 0.05); // Un peu de brouillard pour la profondeur

const sizes = { w: innerWidth, h: innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

/* 3. Environment (LE FIX POUR L'ÉCRAN NOIR) */
// On utilise RoomEnvironment pour créer des reflets réalistes sur les lunettes
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

/* 4. Lumières */
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// Lumière CHAUDE
const warmLight = new THREE.DirectionalLight(0xff5500, 4);
warmLight.position.set(5, 5, 5);
warmLight.castShadow = true;
scene.add(warmLight);

// Lumière FROIDE
const coldLight = new THREE.DirectionalLight(0x00e5ff, 0);
coldLight.position.set(-5, 5, 5);
coldLight.castShadow = true;
scene.add(coldLight);

/* 5. Chargement du vrai modèle 3D de lunettes (Sunglasses Khronos) */
const gltfLoader = new GLTFLoader();
// On configure le décodeur pour le modèle
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
gltfLoader.setDRACOLoader(dracoLoader);

let sunglasses = new THREE.Group();
let sunglassesLoaded = false;

gltfLoader.load(
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SunglassesKhronos/glTF-Binary/SunglassesKhronos.glb',
    (gltf) => {
        sunglasses = gltf.scene;
        sunglasses.scale.set(0.8, 0.8, 0.8); // Ajuster selon la taille du modèle
        sunglasses.position.set(0, 0, 0);
        sunglasses.rotation.set(0, -0.5, 0);
        
        // S'assurer que les ombres sont activées
        sunglasses.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(sunglasses);
        sunglassesLoaded = true;
    },
    undefined,
    (error) => {
        console.error("Erreur de chargement du modèle GLTF:", error);
        // Fallback au cas où le modèle ne charge pas
        const fallbackGeo = new THREE.BoxGeometry(3, 1, 1);
        const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        sunglasses = new THREE.Mesh(fallbackGeo, fallbackMat);
        scene.add(sunglasses);
        sunglassesLoaded = true;
    }
);

/* 6. Modèle du Masque (Procédural mais haut de gamme) */
// Faute de modèle gratuit fiable pour le masque, on fait une forme stylisée avec de la réfraction
const maskGroup = new THREE.Group();
maskGroup.position.set(0, 0, 0);
maskGroup.visible = false;

const maskFrameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7, metalness: 0.5 });
const maskLensMat = new THREE.MeshPhysicalMaterial({ 
  color: 0x00e5ff, 
  metalness: 1.0, 
  roughness: 0.0, 
  transmission: 0.9, 
  thickness: 1.0,
  ior: 1.5,
  clearcoat: 1.0
});

// La monture
const maskFrame = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.15, 16, 32, Math.PI), maskFrameMat);
maskFrame.rotation.z = Math.PI;
maskFrame.position.y = 0.2;
maskGroup.add(maskFrame);

// Le verre
const maskLens = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.2, 32, 1, false, 0, Math.PI), maskLensMat);
maskLens.rotation.x = Math.PI / 2;
maskLens.rotation.y = Math.PI / 2;
maskLens.position.y = 0.2;
maskGroup.add(maskLens);

// Sangle
const strap = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, 16, 32), maskFrameMat);
strap.rotation.x = Math.PI / 2;
strap.position.y = 0.2;
maskGroup.add(strap);

maskGroup.rotation.set(0, 0.5, 0);
scene.add(maskGroup);

/* 7. Particules */
const particleCount = 800;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i+=3){
  pPos[i] = (Math.random() - 0.5) * 30;
  pPos[i+1] = (Math.random() - 0.5) * 20;
  pPos[i+2] = (Math.random() - 0.5) * 20;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ color: 0xff5500, size: 0.05, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* 8. Animation au Scroll */
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
  .to(coldLight, { intensity: 6, duration: 1 }, 0)
  .to(particles.material.color, { r: 0, g: 0.9, b: 1, duration: 1 }, 0)
  
  // Lunettes disparaissent
  .to(sunglasses.rotation, { x: 2, y: 2, z: 1, duration: 1 }, 0)
  .to(sunglasses.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.8, ease: 'back.in(2)' }, 0)
  .set(sunglasses, { visible: false }, 0.8)

  // Masque apparaît
  .set(maskGroup, { visible: true }, 0.3)
  .from(maskGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.7, ease: 'back.out(2)' }, 0.3)
  .from(maskGroup.rotation, { x: -2, y: -1, z: 0, duration: 1 }, 0.3);

/* Textes */
gsap.to('.text-container:not(.text-container--right)', { 
  opacity: 0, y: -50, duration: 1, 
  scrollTrigger: { trigger: '.section:nth-child(3)', start: 'top center' } 
});
gsap.fromTo('.text-container--right', 
  { opacity: 0, y: 50 }, 
  { opacity: 1, y: 0, duration: 1, 
    scrollTrigger: { trigger: '.section:nth-child(3)', start: 'top center' } }
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

  // Flottement
  if (sunglasses.visible) sunglasses.position.y = Math.sin(t * 1.5) * 0.1;
  if (maskGroup.visible) maskGroup.position.y = Math.sin(t * 1.5) * 0.1;

  particles.rotation.y = t * 0.05;
  
  // Parallaxe
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
