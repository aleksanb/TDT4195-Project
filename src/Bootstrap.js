var filePath = "img/sweetsA01.png";
var canvas = document.getElementById("canvas");
var originalImage = document.getElementById("originalImage");
var ctx = canvas.getContext("2d");
var fm = new FilterManager("filters", ctx);
var filterType = document.getElementById("filterType");
var removeButton = document.getElementById("remove");
var cm = new ColorManager();
var rm = new RegionManager();

document.getElementById("file1").addEventListener("change", function(event) {
  var file = event.target.files[0];
  if (file){
    loadImage(file);
  }
});

document.getElementById("add").addEventListener("click", function() {
  fm.add(filterType.value);
  removeButton.disabled = !fm.filters.length;
});

removeButton.addEventListener("click", function() {
  fm.pop();
  removeButton.disabled = !fm.filters.length;
});

document.getElementById("go3d").addEventListener("click", function() {
  $("body").addClass("wait");
  setTimeout(go3D, 0);
});

function go3D() {
  if (cm.colors.length === 0 && rm.regions.length === 0) {
    alert("You should mark at least one color by clicking the image");
    return false;
  }

  var foundObjects = false;
  var regionsSanitized = false;
  for (var i = 0; i < fm.filters.length; i++) {
    var filter = fm.filters[i];
    var type = filter.type;
    if (type.startsWith("Find objects")) {
      foundObjects = true;
    } else if (type == "Sanitize regions") {
      regionsSanitized = true;
    }
  }

  if (!foundObjects && rm.regions.length === 0) {
    fm.add("Find objects using LAB");
    return go3D();
  }

  if (!regionsSanitized && rm.regions.length === 0) {
    fm.add("Sanitize regions");
    return go3D();
  }
  removeButton.disabled = !fm.filters.length;

  rm.export();
  $("#threedee").show();
  setup3DScene();
}

var averageObjectRadius = null;
var canvasDragFlag = 0;
var canvasStartMouseDownPos = {};
originalImage.addEventListener("mousedown", function(e){
  canvasStartMouseDownPos = relMouseCoords(e, canvas);
  canvasDragFlag = 0;
}, false);
originalImage.addEventListener("mousemove", function(e){
  e.preventDefault();
  canvasDragFlag = 1;
}, false);
originalImage.addEventListener("mouseup", function(e){
  var currentPos = relMouseCoords(e, canvas);
  if(canvasDragFlag){ //drag
    var distance = euclideanDistance(canvasStartMouseDownPos, currentPos);
    if (distance > 4) {
      averageObjectRadius = Math.round(0.5 * distance);
      $('#averageRadius').html('<span title="Click to remove this manually set radius">Average object radius: ' + averageObjectRadius + "</span>");
    }
  } else {  //click
    var rgb = getColorAt(canvas, currentPos.x, currentPos.y);
    cm.addColor(rgb);
  }
}, false);

$('#averageRadius').click(function() {
  averageObjectRadius = null;
  $('#averageRadius').children().remove();
});

var threeDeeDragFlag = 0;
var threeDee = document.getElementById("threedee");
threeDee.addEventListener("mousedown", function(){
  threeDeeDragFlag = 0;
}, false);
threeDee.addEventListener("mousemove", function(){
  threeDeeDragFlag = 1;
}, false);
threeDee.addEventListener("mouseup", function(){
  if(!threeDeeDragFlag){
    $('#threedee').hide().children().not("#controls").remove();
    stopAnimation = true;
    $("body").removeClass("threedee");
  }
}, false);

document.getElementById("getLucky").addEventListener("click", function() {
  filtersToStartWith = fm.filters.length;
  cm.removeAllColors();
  $("body").addClass("wait");
  setTimeout(getLucky, 0);
});

function getLucky() {
  var todo = [
    "Canny edge detection",
    "Hough circle transform",
    "Basic global threshold",
    "Dilation",
    "Dilation",
    "Dilation",
    "Dilation",
    "Dilation",
    "Dilation",
    "Find and sanitize regions",
    "Find original region colors",
    "Auto group colors"
  ];


  for (var i = filtersToStartWith; i < fm.filters.length; i++) {
    var filter = fm.filters[i];
    var type = filter.type;
    if (type === todo[0]) {
      todo.splice(0, 1);
    } else {
      break;
    }
  }

  if (todo.length > 0) {
    fm.add(todo[0]);
    setTimeout(getLucky, 0);
    return;
  }

  removeButton.disabled = !fm.filters.length;
  $("body").removeClass("wait");
}

$('#originalFilter').hover(function() {
  $("#originalImage").addClass("visible");
}, function() {
  $("#originalImage").removeClass("visible");
});

document.getElementById("originalFilter").addEventListener("click", function() {
  while (fm.filters.length) {
    fm.pop();
  }
});