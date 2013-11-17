var camera, scene, renderer;
var shapes;
var skittles = {
  filePath: 'img/sweetsA01.png',
  height: 316,
  width: 600,
  groups: [
    {
      color: 12077332,
      elements: [
        {
          y: 316 * Math.random(),
          x: 600 * Math.random()
        },
        {
          y: 316 * Math.random(),
          x: 600 * Math.random()
        }
      ]
    },
    {
      color: 12077332,
      elements: [
        {
          y: 316 * Math.random(),
          x: 600 * Math.random()
        }
      ]
    },
    {
      color: 12077332,
      elements: [
        {
          y: 316 * Math.random(),
          x: 600 * Math.random()
        },
        {
          y: 316 * Math.random(),
          x: 600 * Math.random()
        }
      ]
    },
    {
      color: 12077332,
      elements: [
        {
          y: 316 * Math.random(),
          x: 600 * Math.random()
        },
        {
          y: 316 * Math.random(),
          x: 600 * Math.random()
        }
      ]
    }
  ]
};

function loadImage(path) {
  var img = new Image();
  img.onload = function() {
    init(skittles);
  };
  img.src = path;
  return img;
}

function init(skittles) {
  renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = skittles.height * 1;
  camera.position.x = skittles.width / 2;
  camera.position.y = skittles.height / 2;

  scene = new THREE.Scene();

  controls = new THREE.OrbitControls( camera, renderer.domElement );

  // Add background image
  var canvas = document.createElement('canvas');
  canvas.width = skittles.width;
  canvas.height = skittles.height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(backgroundImage, 0, 0);
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  // Create background box
  var background = new THREE.PlaneGeometry(skittles.width, skittles.height);
  var backgroundMaterial = new THREE.MeshBasicMaterial( { map: texture } );
  var boundingBox = new THREE.Mesh( background, backgroundMaterial );

  boundingBox.position.x = skittles.width / 2;
  boundingBox.position.y = skittles.height / 2;

  scene.add(boundingBox);

  // Create skittles
  shapes = [];

  skittles.groups.forEach(function(group, index) {
    group.elements.forEach(function(element) {
      var MAGIC_NUMBER = element.radius;
      // Create sphere
      var geometry = {
        0: new THREE.CubeGeometry(MAGIC_NUMBER / 0.71, MAGIC_NUMBER / 0.71, MAGIC_NUMBER / 0.71),
        1: new THREE.SphereGeometry(MAGIC_NUMBER * 0.9, MAGIC_NUMBER * 0.9, MAGIC_NUMBER * 0.9),
        2: new THREE.OctahedronGeometry(MAGIC_NUMBER, 0),
        3: new THREE.TeapotGeometry(MAGIC_NUMBER * 0.9)
      }[index % 4];

      material = new THREE.MeshLambertMaterial({ color: group.color });
      cube = new THREE.Mesh(geometry, material);

      // Position sphere
      cube.position.x = element.x;
      cube.position.y = skittles.height -element.y;
      cube.position.z = MAGIC_NUMBER;

      // Add sphere
      shapes.push(cube);
      scene.add(cube);

      // Create number
      var text3d = new THREE.TextGeometry( group.elements.length, {
        size: MAGIC_NUMBER,
        height: 4,
        font: "helvetiker",
        weight: "bold",
        style: "normal",
        bevelEnabled: true,
        bevelThickness: 3,
        bevelSize: 1
      });

      var textMesh = new THREE.Mesh( text3d, material );

      // Position number
      textMesh.position.x = element.x;
      textMesh.position.y = skittles.height - element.y + MAGIC_NUMBER * 1.7;
      textMesh.position.z = MAGIC_NUMBER;

      // Add number
      cube.textMesh = textMesh;
      scene.add(textMesh);
    });
  });

  var light = new THREE.PointLight(0xffffff);
  light.position = new THREE.Vector3(0,100,400);
  scene.add(light);

  var loadingElement = document.getElementById("loading");
  document.body.removeChild(loadingElement);

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  var t = Date.now();

  for (var i=0; i<shapes.length; i++) {
    var offset = Math.sin(i * 10) + t / 1000;
    shapes[i].rotation.y = offset * Math.pow(-1, i);
    shapes[i].rotation.x = offset * Math.pow(-1, i);
    shapes[i].rotation.z = offset * Math.pow(-1, i);

    shapes[i].textMesh.rotation.y = offset;
  }

  camera.position.x = skittles.width / 2 + 40 * Math.sin(t / 1000);
  camera.position.y = skittles.height / 2 + 40 * Math.cos(t / 1000);
  camera.lookAt(new THREE.Vector3(skittles.width / 2, skittles.height / 2, 0));

  renderer.render(scene, camera);
}

var mayhaps = $.jStorage.get('skittles');
if (mayhaps !== null) {
  skittles = mayhaps;
}

backgroundImage = loadImage(skittles.filePath);
