var filePath = "img/sweetsA03.png";
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var fm = new FilterManager("filters", ctx);
var filterType = document.getElementById("filterType");
var removeButton = document.getElementById("remove");
var cm = new ColorManager();
var rm = new RegionManager();

document.getElementById("add").addEventListener("click", function() {
  fm.add(filterType.value);
  removeButton.disabled = !fm.filters.length;
});

removeButton.addEventListener("click", function() {
  fm.pop();
  removeButton.disabled = !fm.filters.length;
});

function go3D() {
  if (cm.colors.length === 0) {
    alert("You should mark at least one color by clicking the image");
    return false;
  }

  var foundObjects = false;
  var regionsGrown = false;
  var regionsSanitized = false;
  for (var i = 0; i < fm.filters.length; i++) {
    var filter = fm.filters[i];
    var type = filter.type;
    if (type.startsWith("Find objects")) {
      foundObjects = true;
    } else if (type === "Region growing") {
      regionsGrown = true;
    } else if (type == "Sanitize regions") {
      regionsSanitized = true;
    }
  }

  if (!foundObjects) {
    fm.add("Find objects using LAB");
    return go3D();
  }

  if (!regionsGrown) {
    fm.add("Region growing");
    return go3D();
  }

  if (!regionsSanitized) {
    fm.add("Sanitize regions");
    return go3D();
  }
  removeButton.disabled = !fm.filters.length;

  rm.export();
  return true;
}

canvas.addEventListener("click", function(e) {
  var coords = relMouseCoords(e, canvas);
  var rgb = getColorAt(canvas, coords.x, coords.y);
  cm.addColor(rgb);
});