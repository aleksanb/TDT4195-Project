var filePath = "img/sweetsA01.png";
var canvas = document.getElementById("canvas");
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
  go3D();
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
canvas.addEventListener("mousedown", function(e){
  canvasStartMouseDownPos = relMouseCoords(e, canvas);
  canvasDragFlag = 0;
}, false);
canvas.addEventListener("mousemove", function(){
  canvasDragFlag = 1;
}, false);
canvas.addEventListener("mouseup", function(e){
  var currentPos = relMouseCoords(e, canvas);
  if(canvasDragFlag){ //drag
    var distance = euclideanDistance(canvasStartMouseDownPos, currentPos);
    if (distance > 4) {
      averageObjectRadius = Math.round(0.5 * distance);
      $('#averageRadius').html("<span>Average object radius: " + averageObjectRadius + "</span>");
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
    $("body").css("overflow", "visible");
  }
}, false);
