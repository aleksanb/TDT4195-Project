var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var fm = new FilterManager("filters",ctx);
var filterType = document.getElementById("filterType");
var removeButton = document.getElementById("remove");

document.getElementById("add").addEventListener("click",function(){
  fm.add(filterType.value);
  removeButton.disabled = !fm.filters.length;
});

removeButton.addEventListener("click",function(){
  fm.pop();
  removeButton.disabled = !fm.filters.length;
});

function xy(x,y, width){
  return Math.floor(4*(Math.floor(y)*width+Math.floor(x)));
}

canvas.addEventListener("click", function(e){
  var coords = relMouseCoords(e, canvas);
  console.log(getColor(canvas, coords.x, coords.y));
});