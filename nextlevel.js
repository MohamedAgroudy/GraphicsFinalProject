//The Global Variables
let container, scene, camera, renderer, controls;
let keyboard = new THREEx.KeyboardState();
let clock = new THREE.Clock;
let stats;
let movingObstacles;
let collisionList = [];
let obstacles = [];
let crash = false;
let id = 0;
let score = 0;
let crashId = " ";
let lastCrashId = " ";
let randomRate = 0.04;
let randomCar = 30;
let speed = 25;
let randomColor = [
  '#0091ea',
  '#ffd600',
  '#f8bbd0',
  '#ffab00',
  '#546e7a',
  '#b388ff',
  '#4db6ac',
  '#c5cae9',
  '#a1887f'
]

let state = {
  left: false,
  right: false,
  top: false,
  bottom: false
}
/*
let leftBtn = document.querySelector('#left');
let rightBtn = document.querySelector('#right');
let topBtn = document.querySelector('#top');
let bottomBtn = document.querySelector('#bottom');
*/
let scoreDiv = document.querySelector('#score');



init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 5000);
  camera.position.set(0, 100, 300);
  
  // renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
    canvas: document.getElementById("three")
  });
  
  // screen size
  renderer.setClearColor(new THREE.Color(0x69c6d0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  // floor
  var floorGeometry = new THREE.PlaneGeometry(500, 11000, 10, 10);
  
    var floorMaterial = new THREE.MeshBasicMaterial({
    color:0x7cfc00,
    side: THREE.DoubleSide,
  });
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  floor.position.z = 2000;
  scene.add(floor);

  

  // abient light
  let ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.name = "Ambient Light";
  scene.add(ambientLight);

  


  var geometry = new THREE.SphereGeometry(15, 12, 12);
  var material=new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load('imagess.jpg')});   
  movingObstacles = new THREE.Mesh(geometry, material);
  var ball = new THREE.Mesh(geometry,material); 
  movingObstacles.position.set(0, 25, 0);
  movingObstacles.receiveShadow = true;
  movingObstacles.castShadow = true;
  scene.add(movingObstacles);
  

 


 
  
  // stats
  stats = initStats();
  
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  update();
}

function update() {
  stats.update();
  controls.update();
  let delta = clock.getDelta();
  movingObstacles.rotation.x -= 3 * Math.PI / 180;
  let moveDistance = 200 * delta;
  if (keyboard.pressed("left") || keyboard.pressed("A") || state.left) {
    if (movingObstacles.position.x > -270)
      movingObstacles.position.x -= moveDistance;
    
  }
  if (keyboard.pressed("right") || keyboard.pressed("D") || state.right) {
    if (movingObstacles.position.x < 270)
      movingObstacles.position.x += moveDistance;
    
  }
  if (keyboard.pressed("up") || keyboard.pressed("W") || state.top) {
    movingObstacles.position.z -= moveDistance;
  }
  if (keyboard.pressed("down") || keyboard.pressed("S") || state.bottom) {
    movingObstacles.position.z += moveDistance;
  }
  

  //The geometry of the threejs is the origin of the coordinates in the scene by default.
  //The world coordinates of the center of the model geometry can be obtained by theposition property or the .getWorldPosition() method

  let originPoint = movingObstacles.position.clone();
  //All vertred data for the sphere mesh model geometry
  let vertices = movingObstacles.geometry.vertices
  for (let vertexIndex = 0; vertexIndex < movingObstacles.geometry.vertices.length; vertexIndex++) {
    // The original coordinates of the vertred
    let localVertex = vertices[vertexIndex].clone();
    

    let globalVertex = localVertex.applyMatrix4(movingObstacles.matrix);

    let directionVector = globalVertex.sub(movingObstacles.position);
    
    let ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
   
    let collisionResults = ray.intersectObjects(collisionList, true);
   
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      crash = true;
      crashId = collisionResults[0].object.name;
      break;
    }
    crash = false;
  }

  if (crash) {
    movingObstacles.material.color.setHex(0xe91e63);
    console.log("Crash");
    if (crashId !== lastCrashId) {
      if (score > 1000000) {
        score -= 1000000;
      } else {
          if(alert('game over'+ '    your score is: '+score)){
              noloop();
          }

else     window.location.href = "index.html"; 
        
        }
      lastCrashId = crashId;
    }
  } else {
    movingObstacles.material.color.setHex(0xe5f2f2);
  }
  if (Math.random() < randomRate && obstacles.length < randomCar) {
    
    makeRandomCube();
  }
  for (i = 0; i < obstacles.length; i++) {
    if (obstacles[i].position.z > movingObstacles.position.z) {
      scene.remove(obstacles[i]);
      obstacles.splice(i, 1);
      collisionList.splice(i, 1);
      score += 10;
    } else {
      obstacles[i].position.z += speed;
    }
  }
  scoreDiv.innerHTML = score;
}



function makeRandomCube() {
    var a = 1 * 50,
        b = 50//+Math.random() *100,
        c = 1 * 50;
    var cubeGeometry = new THREE.CubeGeometry(a,b,c);
    var wired = new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load('cones.jfif')});   
  
  


   
  box = new THREE.Mesh(cubeGeometry, wired);
   
    //box.rotation.y = Math.PI / 8;
    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-2200, -4000);
    obstacles.push(box);
    box.name = "box_" + id;
    id++;
    collisionList.push(box);
  
  
  

    scene.add(box);
  
}


function initStats() {
  var stats = new Stats();
  

  return stats;
}

// Returns a random number between min and max
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// Returns an integer random number between min and max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


