var filePath = "img/sweetsA03.png";
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
  if (cm.colors.length === 0) {
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

  if (!foundObjects) {
    fm.add("Find objects using LAB");
    return go3D();
  }

  if (!regionsSanitized) {
    fm.add("Sanitize regions");
    return go3D();
  }
  removeButton.disabled = !fm.filters.length;

  rm.export();
  $("#threedee").show();
  setup3DScene();
  setTimeout(toggleFullScreen, 0);
}

canvas.addEventListener("click", function(e) {
  var coords = relMouseCoords(e, canvas);
  var rgb = getColorAt(canvas, coords.x, coords.y);
  cm.addColor(rgb);
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
    $('#threedee').hide().children().not('#loading').remove();
    stopAnimation = true;
    $("body").css("overflow", "visible");
    toggleFullScreen();
  }
}, false);
