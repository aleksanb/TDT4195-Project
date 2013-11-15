function ColorManager(type,imgcache) {
  this.colors = [];
  this.DOMcolors = document.getElementById('colors');
}

ColorManager.prototype.createDOMColorNode = function(rgb){
  var node = document.createElement("span");
  var rgbString = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
  node.innerHTML = rgbString;
  node.style.backgroundColor = rgbString;
  return node;
}

ColorManager.prototype.addColor = function(rgb) {
  this.colors.push(rgb);
  var node = this.createDOMColorNode(rgb);
  this.DOMcolors.appendChild(node);
}
