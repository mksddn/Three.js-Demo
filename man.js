import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'stats.js'
import * as dat from 'lil-gui'

import '/style.css'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scene = new THREE.Scene();
const canvas = document.querySelector('.canvas');
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
scene.add(camera);
camera.position.set(0, 2, 4);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);


const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5),
  new THREE.MeshStandardMaterial({
    color: '#444',
    metallnes: 0,
    rougness: 0.5
  })
);

floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
// floor.position.set(0, 0, 1);

scene.add(floor);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);


const loader = new GLTFLoader();
let man = null
let mixer = null
loader.load('/models/man.glb', (model) => {
  man = model.scene.children[0];
  mixer = new THREE.AnimationMixer(model.scene);
  const action = mixer.clipAction(model.animations[0]);
  action.play();
  // man.scale.set(0.01, 0.01, 0.01);
  // man.position.set(0, 0, -15);
  scene.add(man)
})


const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const gui = new dat.GUI();
// gui.add(hemiLight.position, 'x').min(-100).max(100).step(10).name('hemiLight X');
// gui.add(hemiLight.position, 'y').min(-100).max(100).step(10).name('hemiLight Y');
// gui.add(hemiLight.position, 'z').min(-100).max(100).step(10).name('hemiLight Z');
gui.add(dirLight.position, 'x').min(-100).max(100).step(10).name('dirLight X');
gui.add(dirLight.position, 'y').min(-100).max(100).step(10).name('dirLight Y');
gui.add(dirLight.position, 'z').min(-100).max(100).step(10).name('dirLight Z');

const clock = new THREE.Clock();
const tick = () => {
  stats.begin();
  const delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }
  controls.update();
  renderer.render(scene, camera);
  stats.end();
  window.requestAnimationFrame(tick);
};
tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
  // Обновляем размеры
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Обновляем соотношение сторон камеры
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Обновляем renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});