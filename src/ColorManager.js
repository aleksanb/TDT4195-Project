function ColorManager(type, imgcache) {
  this.colors = [];
  this.DOMcolors = document.getElementById('colors');
}

ColorManager.prototype.createDOMColorNode = function(rgb) {
  var node = document.createElement("span");
  var hex = rgbToHex(rgb);
  var humanReadable = ntc.name(hex)[1];
  node.id = this.getId(rgb);
  node.innerHTML = humanReadable;
  node.style.backgroundColor = hex;
  node.title = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";

  var that = this;
  node.addEventListener("click", function(e) {
    var target = e.target;
    var pieces = target.id.split('_');
    var rgb = [parseInt(pieces[1]), parseInt(pieces[2]), parseInt(pieces[3])];
    that.removeColor(rgb);
  });

  return node;
};

ColorManager.prototype.getId = function(rgb) {
  return "rgb_" + rgb[0] + "_" + rgb[1] + "_" + rgb[2];
};

ColorManager.prototype.addColor = function(rgb) {
  if (!this.hasColor(rgb)) {
    this.colors.push(rgb);
    var node = this.createDOMColorNode(rgb);
    this.DOMcolors.appendChild(node);
  }
};

ColorManager.prototype.removeColor = function(rgb) {
  var index = this.indexOfColor(rgb);
  this.colors.splice(index, 1);
  var node = document.getElementById(this.getId(rgb));
  this.DOMcolors.removeChild(node);
};

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
};

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
};


ColorManager.prototype.autoGroupColors = function(colors) {
  var labThreshold = 10;
  var nextGroupId = 0;
  for (var i = 0; i < colors.length; i++) {
    var rgb = colors[i];
    if (typeof rgb["groupId"] === "undefined") {
      rgb["groupId"] = nextGroupId++;
    }
    var xyz = RGBtoXYZ(rgb);
    var lab = XYZtoLAB(xyz);
    for (var j = i + 1; j < colors.length; j++) {
      var rgb2 = colors[j];
      if (typeof rgb2["groupId"] === "undefined") {
        var xyz2 = RGBtoXYZ(rgb2);
        var lab2 = XYZtoLAB(xyz2);
        if (deltae94(lab, lab2) < labThreshold) {
          rgb2.groupId = rgb.groupId;
        }
      }
    }
  }

  for (var groupId = 0; groupId < nextGroupId; groupId++) {
    for (var i = 0; i < colors.length; i++) {
      var rgb = colors[i];
      if (rgb.groupId === i) {
        this.addColor(rgb);
      }
    }
  }


  return colors;
};

