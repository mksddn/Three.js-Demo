import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import '/style.css'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Создаем сцену
const scene = new THREE.Scene();
const spaceTexture = new THREE.TextureLoader().load('images/space.jpg');
scene.background = spaceTexture;

// Настройки земли
const earthTexture = new THREE.TextureLoader().load('images/01-3.jpg');
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  new THREE.MeshStandardMaterial({
    map: earthTexture,
  })
);
earth.position.z = -3;
scene.add(earth);

// Добавление звезд на фоне
function addStar() {
  const geometry = new THREE.SphereGeometry(0.005, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xF8ECC9 });
  const star = new THREE.Mesh(geometry, material);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(3));
  star.position.set(x, y, z);
  scene.add(star);
}
Array(200).fill().forEach(addStar);

// Загружаем модели
const loader = new GLTFLoader();
let trex = null
const trexPositionY = -0.5
let mixer = null
loader.load('/models/animated_t-rex_dinosaur_biting_attack_loop.glb', (model) => {
  trex = model.scene.children[0];
  mixer = new THREE.AnimationMixer(model.scene);
  const action = mixer.clipAction(model.animations[0]);
  action.play();
  trex.scale.set(0.12, 0.12, 0.12);
  trex.position.set(0.5, trexPositionY, -1.2);
  trex.rotation.z = -0.8;
  scene.add(trex)
})
let meteor = null;
loader.load('/models/met02_meteor.glb', (model) => {
  meteor = model.scene.children[0];
  meteor.scale.set(0.001, 0.001, 0.001);
  meteor.position.set(0, -0.3, -2);
  scene.add(meteor)
})
let ipad = null;
const ipadPositionY = -2.9;
loader.load('/models/ipad_pro_12.9_2020.glb', (model) => {
  ipad = model.scene.children[0];
  ipad.scale.set(0.018, 0.018, 0.018);
  ipad.position.set(0, ipadPositionY, -1);
  scene.add(ipad)
})

// Создаем камеру
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
scene.add(camera);


// Настройка renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0xffffff, 0);
document.body.appendChild(renderer.domElement);


// Глобальное освещение
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff);
scene.add(directionalLight);


// Запускаем анимацию
const clock = new THREE.Clock();
const tick = () => {
  const delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }
  earth.rotation.y += 0.0003;
  earth.rotation.x += 0.0002;
  earth.rotation.z += 0.0002;
  if (meteor) {
    meteor.rotation.y += 0.002;
    meteor.rotation.x += 0.002;
  }
  window.requestAnimationFrame(tick);
  renderer.render(scene, camera)
}
tick();


// Событие для прокрутки
document.body.onscroll = handlerScroll;
function handlerScroll() {
  const t = document.body.getBoundingClientRect().top;
  // console.log(t * 1);
  trex.position.y = trexPositionY - (t * 0.001);
  ipad.position.y = ipadPositionY - (t * 0.001);
  meteor.position.x = Math.cos(t * 0.005)
  meteor.position.z = -5 + (-t * 0.00205);
  // if (camera.position.z < -1.4) {
  //   if (earth.position.x > -0.8) {
  //     earth.position.x -= 0.02;
  //   }
  // } else {
  //   earth.position.x = 0;
  // }
  camera.position.z = t * 0.0001;
}



/** Базовые обработчики событий для поддержки ресайза */
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