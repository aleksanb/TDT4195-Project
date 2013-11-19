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

ColorManager.prototype.removeAllColors = function(rgb) {
  this.colors.length = 0;
  $("#colors").children().remove();
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
  var hueThreshold = 6;
  var labThreshold = 6.6;

  /*
  var hues = [];
  for (var a = 0; a < 10; a++) {
    hues.push(0);
  }

  for (var i = 0; i < colors.length; i++) {
    var rgb = colors[i];
    var hsv = RGBtoHSV(rgb);
    var hue = Math.floor(hsv[0] / 36);
    hues[hue]++;
  }
  */

  /*
   x = y = 0
   foreach angle {
   x += cos(angle)
   y += sin(angle)
   }
   average_angle = atan2(y, x)
   */

  var groups = [];
  for (var i = 0; i < colors.length; i++) {
    var rgb1 = colors[i];
    if (typeof rgb1["groupId"] === "undefined") {
      groups.push([rgb1]);
      rgb1["groupId"] = groups.length - 1;
    }
    var hsv1 = RGBtoHSV(rgb1);
    var hue1 = hsv1[0] + 360;
    var xyz1 = RGBtoXYZ(rgb1);
    var lab1 = XYZtoLAB(xyz1);
    for (var j = i + 1; j < colors.length; j++) {
      var rgb2 = colors[j];
      var hsv2 = RGBtoHSV(rgb2);
      var hue2 = hsv2[0] + 360;
      var xyz2 = RGBtoXYZ(rgb2);
      var lab2 = XYZtoLAB(xyz2);
      if (typeof rgb2["groupId"] === "undefined") {
        if (Math.abs(hue1 - hue2) < hueThreshold || deltae94(lab1, lab2) < labThreshold) {
          rgb2["groupId"] = rgb1["groupId"];
          groups[rgb2["groupId"]].push(rgb2);
        }
      }
    }
  }

  for (var groupId = 0; groupId < groups.length; groupId++) {
    var group = groups[groupId];
    var ls = [];
    var as = [];
    var bs = [];
    for (var i = 0; i < group.length; i++) {
      var rgb = group[i];
      var xyz = RGBtoXYZ(rgb);
      var lab = XYZtoLAB(xyz);
      ls.push(lab[0]);
      as.push(lab[1]);
      bs.push(lab[2]);
    }
    var medianL = getMedian(ls);
    var medianA = getMedian(as);
    var medianB = getMedian(bs);
    var medianLab = [medianL, medianA, medianB];
    var medianXyz = LABtoXYZ(medianLab);
    var medianRgb = XYZtoRGB(medianXyz);
    this.addColor(medianRgb);
  }

  return colors;
};

