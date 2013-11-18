function setup3DScene() {
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

  function init(skittles) {
    toggleFullScreen();
    
    renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth - 24, window.innerHeight - 24);
    $('#threedee').append(renderer.domElement);

    camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = skittles.height * 1;
    camera.position.x = skittles.width / 2;
    camera.position.y = skittles.height / 2;

    scene = new THREE.Scene();

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add background image
    var canvas = document.createElement('canvas');
    canvas.width = skittles.width;
    canvas.height = skittles.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(fm.original, 0, 0);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // Create background box
    var background = new THREE.PlaneGeometry(skittles.width, skittles.height);
    var backgroundMaterial = new THREE.MeshBasicMaterial({ map: texture });
    var boundingBox = new THREE.Mesh(background, backgroundMaterial);

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
          0: new THREE.CubeGeometry(MAGIC_NUMBER, MAGIC_NUMBER, MAGIC_NUMBER),
          1: new THREE.SphereGeometry(MAGIC_NUMBER * 0.9, 10, 10),
          2: new THREE.OctahedronGeometry(MAGIC_NUMBER, 0),
          3: new THREE.TeapotGeometry(MAGIC_NUMBER * 0.666)
        }[index % 4];

        material = new THREE.MeshLambertMaterial({ color: group.color });
        shape = new THREE.Mesh(geometry, material);

        // Position sphere
        shape.position.x = element.x;
        shape.position.y = skittles.height - element.y;
        shape.position.z = MAGIC_NUMBER;

        if (index % 4 === 1) {
          shape.scale.y = 0.6;  //"flat" sphere
        }

        // Add shape
        shapes.push(shape);
        scene.add(shape);

        // Create number
        var text3d = new THREE.TextGeometry(group.elements.length, {
          size: MAGIC_NUMBER * 0.9,
          height: 4,
          font: "helvetiker",
          weight: "bold",
          style: "normal",
          bevelEnabled: true,
          bevelThickness: MAGIC_NUMBER * 0.2,
          bevelSize: 1
        });
        var textMesh = new THREE.Mesh(text3d, material);

        // Position number with offset correction
        var offsetX = 0.4 * MAGIC_NUMBER * group.elements.length.toString().length;
        var pivot = new THREE.Object3D();
        pivot.position.x = element.x;
        pivot.position.y = skittles.height - element.y + MAGIC_NUMBER;
        pivot.position.z = MAGIC_NUMBER;
        textMesh.position.x -= offsetX;
        textMesh.position.z -= 2;
        pivot.add(textMesh);

        // Add number
        shape.textMesh = pivot;
        scene.add(pivot);
      });
    });

    var light = new THREE.PointLight(0xffffff);
    light.position = new THREE.Vector3(0, 100, 400);
    scene.add(light);

    $("body").css("overflow", "hidden");

    stopAnimation = false;
    animate();
  }

  function animate() {
    if (stopAnimation) {
      return;
    }
    requestAnimationFrameId = requestAnimationFrame(animate);
    var t = Date.now();

    for (var i = 0; i < shapes.length; i++) {
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

  if (exports !== null) {
    skittles = exports;
  }

  init(skittles);
}
