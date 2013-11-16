var filePath = "img/sweetsA02.png";
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
  if (cm.colors.length === 0) {
    alert("You should mark at least one color by clicking the image");
    return;
  }

  var foundObjects = false;
  var regionsGrown = false;
  var regionsSanitized = false;
  for (var i = 0; i < fm.filters.length; i++) {
    var filter = fm.filters[i];
    var type = filter.type;
    console.log(type);
    if (type.startsWith("Find objects")) {
      foundObjects = true;
    } else if (type === "Region growing") {
      regionsGrown = true;
    } else if (type == "Sanitize regions") {
      regionsSanitized = true;
    }
  }

  var that = this;
  if (!foundObjects) {
    fm.add("Find objects using LAB");
    setTimeout(function() { that.click(); }, 1);
    return;
  }

  if (!regionsGrown) {
    fm.add("Region growing");
    setTimeout(function() { that.click(); }, 1);
    return;
  }

  if (!regionsSanitized) {
    fm.add("Sanitize regions");
    setTimeout(function() { that.click(); }, 1);
    return;
  }

  console.log("GO!")
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