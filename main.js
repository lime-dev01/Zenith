import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* 1. Lenis */
const lenis = new Lenis({ duration: 1.5, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

/* 2. Setup */
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0c, 0.02); 

const sizes = { w: innerWidth, h: innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 1000);
camera.position.set(0, 2, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

/* 3. Environnement */
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

/* 4. Lumières */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const warmLight = new THREE.DirectionalLight(0xff5500, 3);
warmLight.position.set(10, 10, 10);
warmLight.castShadow = true;
scene.add(warmLight);

const coldLight = new THREE.DirectionalLight(0xffffff, 0);
coldLight.position.set(-10, 10, 10);
coldLight.castShadow = true;
scene.add(coldLight);

/* 5. TERRAIN ENNEIGÉ PROCÉDURAL */
const terrainGeo = new THREE.PlaneGeometry(200, 200, 256, 256);
terrainGeo.rotateX(-Math.PI / 2);

// On déforme les vertices pour créer des montagnes
const posAttribute = terrainGeo.attributes.position;
const vertex = new THREE.Vector3();

for (let i = 0; i < posAttribute.count; i++) {
    vertex.fromBufferAttribute(posAttribute, i);
    // Bruit simple basé sur les coordonnées
    let y = Math.sin(vertex.x * 0.1) * Math.cos(vertex.z * 0.15) * 3; // Collines
    y += Math.sin(vertex.x * 0.5) * Math.cos(vertex.z * 0.6) * 0.5;  // Détails
    // On creuse le centre pour laisser de la place aux objets
    const distToCenter = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
    if (distToCenter < 15) {
        y *= (distToCenter / 15); // Aplanit au centre
    }
    posAttribute.setY(i, y);
}
terrainGeo.computeVertexNormals();

const terrainMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true // Donne un aspect "rocheux/glacé" plus marqué
});

const terrain = new THREE.Mesh(terrainGeo, terrainMat);
terrain.receiveShadow = true;
scene.add(terrain);

/* 6. CHARGEMENT DES LUNETTES (Modèle 3D) */
// On utilise le modèle "Sunglasses Khronos", optimisé pour le web
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
gltfLoader.setDRACOLoader(dracoLoader);

let glassesModel = new THREE.Group();

gltfLoader.load(
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SunglassesKhronos/glTF-Binary/SunglassesKhronos.glb',
    (gltf) => {
        glassesModel = gltf.scene;
        glassesModel.scale.set(1.5, 1.5, 1.5);
        glassesModel.position.set(0, 0, 0);
        glassesModel.rotation.set(0.1, 0.5, 0.1);
        
        // Assurer que le modèle a des ombres
        glassesModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(glassesModel);
    },
    undefined,
    (error) => console.error('Erreur de chargement des lunettes :', error)
);

/* 7. OBJET FROID (Masque de ski - Provisoire) */
// En attendant un modèle 3D, on garde une forme simple mais on la rendra belle plus tard
const maskGroup = new THREE.Group();
maskGroup.position.set(0, 0, 0);
maskGroup.visible = false;
const maskMat = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    roughness: 0.1,
    metalness: 0.5,
    transmission: 0.5,
    clearcoat: 1.0
});
const maskMesh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), maskMat);
maskMesh.scale.set(1.2, 0.6, 0.9);
maskGroup.add(maskMesh);
scene.add(maskGroup);

/* 8. Particules */
const particleCount = 1000;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i+=3){
  pPos[i] = (Math.random() - 0.5) * 50;
  pPos[i+1] = Math.random() * 20;
  pPos[i+2] = (Math.random() - 0.5) * 50;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ color: 0xff5500, size: 0.08, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

/* 9. Animation au Scroll */
const tl = gsap.timeline({
  scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
});

tl.to(warmLight, { intensity: 0, duration: 1 }, 0)
  .to(coldLight, { intensity: 4, duration: 1 }, 0)
  .to(terrainMat.color, { r: 0.8, g: 0.9, b: 1, duration: 1 }, 0)
  .to(particles.material.color, { r: 0.8, g: 0.9, b: 1, duration: 1 }, 0)
  
  // Disparition des lunettes
  .to(glassesModel.rotation, { y: 3, x: 1, duration: 1 }, 0)
  .to(glassesModel.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'back.in(2)' }, 0)
  .set(glassesModel, { visible: false }, 0.8)

  // Apparition du masque
  .set(maskGroup, { visible: true }, 0.4)
  .from(maskGroup.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'back.out(2)' }, 0.4)
  .from(maskGroup.rotation, { y: 2, duration: 1 }, 0.4);

/* 10. Titres HTML */
gsap.to('.title__warm', { opacity: 0, y: -100, duration: 1, scrollTrigger: { trigger: '.section--cold', start: 'top center' } });
gsap.fromTo('.title__cold', { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: '.section--cold', start: 'top center' } });

/* 11. Souris & Tick */
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();

  if (glassesModel.visible) glassesModel.position.y = Math.sin(t * 2) * 0.2;
  if (maskGroup.visible) maskGroup.position.y = Math.sin(t * 2) * 0.2;

  particles.rotation.y = t * 0.02;
  
  // Parallaxe caméra
  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
  camera.position.y += (-mouse.y * 1 + 3 - camera.position.y) * 0.05;
  camera.lookAt(0, 1, 0);

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
