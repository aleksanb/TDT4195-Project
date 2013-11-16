var filePath = "img/sweetsA01.png";
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var fm = new FilterManager("filters",ctx);
var filterType = document.getElementById("filterType");
var removeButton = document.getElementById("remove");
var go3dButton = document.getElementById("go3d");
var cm = new ColorManager();
var rm = new RegionManager();

document.getElementById("add").addEventListener("click",function(){
  fm.add(filterType.value);
  removeButton.disabled = !fm.filters.length;
});

removeButton.addEventListener("click",function(){
  fm.pop();
  removeButton.disabled = !fm.filters.length;
});

go3dButton.addEventListener("click", function(){
  rm.export();
  window.location = "3d.html";
});

function xy(x,y, width){
  return Math.floor(4*(Math.floor(y)*width+Math.floor(x)));
}

canvas.addEventListener("click", function(e){
  var coords = relMouseCoords(e, canvas);
  var rgb = getColorAt(canvas, coords.x, coords.y);
  cm.addColor(rgb);
});