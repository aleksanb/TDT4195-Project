function colorDifference(rgb1, rgb2) {
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

function getColor(canvas, x, y) {
  var ctx = canvas.getContext("2d");
  img = ctx.getImageData(x, y, 1, 1);
  return [img.data[0], img.data[1], img.data[2]];
}

RGBtoHSV = function(color) {
  var r, g, b, h, s, v;
  r = color[0];
  g = color[1];
  b = color[2];
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

HSVtoRGB = function(color) {
  var i;
  var h, s, v, r, g, b;
  h = color[0];
  s = color[1];
  v = color[2];
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