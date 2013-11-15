function ColorManager(type,imgcache) {
  this.colors = [];
  this.DOMcolors = document.getElementById('colors');
}

ColorManager.prototype.createDOMColorNode = function(rgb) {
  var node = document.createElement("span");
  var rgbString = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
  node.id = this.getId(rgb);
  node.innerHTML = rgbString;
  node.style.backgroundColor = rgbString;

  var that = this;
  node.addEventListener("click", function(e) {
    var target = e.target;
    var pieces = target.id.split('_');
    var rgb = [parseInt(pieces[1]), parseInt(pieces[2]), parseInt(pieces[3])];
    that.removeColor(rgb);
  });

  return node;
}

ColorManager.prototype.getId = function(rgb) {
  return "rgb_" + rgb[0] + "_" + rgb[1] + "_" + rgb[2];
}

ColorManager.prototype.addColor = function(rgb) {
  if (!this.hasColor(rgb)) {
    this.colors.push(rgb);
    var node = this.createDOMColorNode(rgb);
    this.DOMcolors.appendChild(node);
  }
}

ColorManager.prototype.removeColor = function(rgb) {
  var index = this.indexOfColor(rgb);
  this.colors.splice(index, 1);
  var node = document.getElementById(this.getId(rgb));
  this.DOMcolors.removeChild(node);
}

ColorManager.prototype.hasColor = function(rgb) {
  var hasColor = false;
  for (var i = 0; i < this.colors.length; i++) {
    var color = this.colors[i];
    if (color[0] === rgb[0] && color[1] === rgb[1] && color[2] === rgb[2]) {
      hasColor = true;
      break;
    }
  }
  return hasColor;
}

ColorManager.prototype.indexOfColor = function(rgb) {
  var index = -1;
  for (var i = 0; i < this.colors.length; i++) {
    var color = this.colors[i];
    if (color[0] === rgb[0] && color[1] === rgb[1] && color[2] === rgb[2]) {
      index = i;
      break;
    }
  }
  return index;
}