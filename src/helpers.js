function rgbDelta(rgb1, rgb2) {
  var rm = 0.5 * (rgb1[0] + rgb2[0]);
  var diff = [
    (rgb1[0] - rgb2[0]) * (rgb1[0] - rgb2[0]) * (2 + rm),
    (rgb1[1] - rgb2[1]) * (rgb1[1] - rgb2[1]) * 4,
    (rgb1[2] - rgb2[2]) * (rgb1[2] - rgb2[2]) * (3 - rm)
  ];
  return Math.sqrt(diff[0] + diff[1] + diff[2]);
}

function blurgen(img, radius) {
  var can = document.createElement("canvas");
  can.width = canvas.width;
  can.height = canvas.height;
  can.id = 'can';
  can.style.display = 'none';
  var cx = can.getContext("2d");
  cx.putImageData(img, 0, 0);

  document.body.appendChild(can);
  stackBlurCanvasRGBA('can', 0, 0, can.width, can.height, radius);
  document.body.removeChild(can);

  return cx.getImageData(0, 0, can.width, can.height);
}

function relMouseCoords(e, canvas) {
  var currentElement = canvas;
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;

  do {
    totalOffsetX += currentElement.offsetLeft;
    totalOffsetY += currentElement.offsetTop;
  }
  while (currentElement = currentElement.offsetParent);

  canvasX = (e.pageX || (e.touches && e.touches[0] && e.touches[0].pageX)) - totalOffsetX;
  canvasY = (e.pageY || (e.touches && e.touches[0] && e.touches[0].pageY)) - totalOffsetY;

  return {x: canvasX, y: canvasY}
}

function getColorAt(canvas, x, y) {
  var ctx = canvas.getContext("2d");
  var img = ctx.getImageData(x, y, 1, 1);
  return [img.data[0], img.data[1], img.data[2]];
}

function RGBtoHSV(rgb) {
  var r, g, b, h, s, v;
  r = rgb[0];
  g = rgb[1];
  b = rgb[2];
  min = Math.min(r, g, b);
  max = Math.max(r, g, b);

  v = max;
  delta = max - min;
  if (max != 0)
    s = delta / max;        // s
  else {
    // r = g = b = 0        // s = 0, v is undefined
    s = 0;
    h = -1;
    return [h, s, undefined];
  }
  if (r === max)
    h = ( g - b ) / delta;      // between yellow & magenta
  else if (g === max)
    h = 2 + ( b - r ) / delta;  // between cyan & yellow
  else
    h = 4 + ( r - g ) / delta;  // between magenta & cyan
  h *= 60;                // degrees
  if (h < 0)
    h += 360;
  if (isNaN(h))
    h = 0;
  return [h, s, v];
};

function HSVtoRGB(hsv) {
  var i;
  var h, s, v, r, g, b;
  h = hsv[0];
  s = hsv[1];
  v = hsv[2];
  if (s === 0) {
    // achromatic (grey)
    r = g = b = v;
    return [r, g, b];
  }
  h /= 60;            // sector 0 to 5
  i = Math.floor(h);
  f = h - i;          // factorial part of h
  p = v * ( 1 - s );
  q = v * ( 1 - s * f );
  t = v * ( 1 - s * ( 1 - f ) );
  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:        // case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return [r, g, b];
}

// a converter for converting rgb model to xyz model
function RGBtoXYZ(rgb) {
  var red2 = rgb[0] / 255;
  var green2 = rgb[1] / 255;
  var blue2 = rgb[2] / 255;
  if (red2 > 0.04045) {
    red2 = (red2 + 0.055) / 1.055;
    red2 = Math.pow(red2, 2.4);
  }
  else {
    red2 = red2 / 12.92;
  }
  if (green2 > 0.04045) {
    green2 = (green2 + 0.055) / 1.055;
    green2 = Math.pow(green2, 2.4);
  }
  else {
    green2 = green2 / 12.92;
  }
  if (blue2 > 0.04045) {
    blue2 = (blue2 + 0.055) / 1.055;
    blue2 = Math.pow(blue2, 2.4);
  }
  else {
    blue2 = blue2 / 12.92;
  }
  red2 = (red2 * 100);
  green2 = (green2 * 100);
  blue2 = (blue2 * 100);
  var x = (red2 * 0.4124) + (green2 * 0.3576) + (blue2 * 0.1805);
  var y = (red2 * 0.2126) + (green2 * 0.7152) + (blue2 * 0.0722);
  var z = (red2 * 0.0193) + (green2 * 0.1192) + (blue2 * 0.9505);
  var xyzresult = new Array();
  xyzresult[0] = x;
  xyzresult[1] = y;
  xyzresult[2] = z;
  return(xyzresult);
}

//a convertor from xyz to lab model
function XYZtoLAB(xyz) {
  var x = xyz[0];
  var y = xyz[1];
  var z = xyz[2];
  var x2 = x / 95.047;
  var y2 = y / 100;
  var z2 = z / 108.883;
  if (x2 > 0.008856) {
    x2 = Math.pow(x2, 1 / 3);
  }
  else {
    x2 = (7.787 * x2) + (16 / 116);
  }
  if (y2 > 0.008856) {
    y2 = Math.pow(y2, 1 / 3);
  }
  else {
    y2 = (7.787 * y2) + (16 / 116);
  }
  if (z2 > 0.008856) {
    z2 = Math.pow(z2, 1 / 3);
  }
  else {
    z2 = (7.787 * z2) + (16 / 116);
  }
  var l = 116 * y2 - 16;
  var a = 500 * (x2 - y2);
  var b = 200 * (y2 - z2);
  var labresult = new Array();
  labresult[0] = l;
  labresult[1] = a;
  labresult[2] = b;
  return labresult;
}

//calculating Delta E 1994
function deltae94(lab1, lab2) {
  var c1 = Math.sqrt((lab1[1] * lab1[1]) + (lab1[2] * lab1[2]));
  var c2 = Math.sqrt((lab2[1] * lab2[1]) + (lab2[2] * lab2[2]));
  var dc = c1 - c2;
  var dl = lab1[0] - lab2[0];
  var da = lab1[1] - lab2[1];
  var db = lab1[2] - lab2[2];
  var dh = Math.sqrt((da * da) + (db * db) - (dc * dc));
  var first = dl;
  var second = dc / (1 + (0.045 * c1));
  var third = dh / (1 + (0.015 * c1));
  var deresult = Math.sqrt((first * first) + (second * second) + (third * third));
  return deresult;
}

function to1D(x, y, width) {
  return (y * width + x) * 4;
}

function to2D(i, width, height) {
  var n = i / 4;
  return {
    x: n % width,
    y: parseInt(n / width)
  };
}

function getMedian(numberArray) {
  var middleIndex = parseInt(numberArray.length / 2);
  if (numberArray.length % 2 == 0) {
    return (numberArray[middleIndex] + numberArray[middleIndex - 1]) / 2;
  } else {
    return numberArray[middleIndex];
  }
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
  return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

function rgbToHexInteger(rgb) {
  var tmp = "0x" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
  return parseInt(tmp, 16);
}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str) {
    return this.indexOf(str) == 0;
  };
}

function loadImage(file) {
  if (!file.type.startsWith("image")) {
    return alert("That file is not going to work here...");
  }
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function(event){
    fm.original.src = event.target.result;
    fm.resetFilters();
  };
  reader.onerror = function(event){
    alert("Could not read the file");
  };
}

function rgbToGreyValue(rgb) {
  return 0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2];
}

function euclideanDistance(pos1, pos2) {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}
