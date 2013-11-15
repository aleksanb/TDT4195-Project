function colorDifference(rgb1, rgb2) {
  var rm = 0.5 * (rgb1[0] + rgb2[0]);
  var diff = [
    (rgb1[0] - rgb2[0]) * (rgb1[0] - rgb2[0]) * (2 + rm),
    (rgb1[1] - rgb2[1]) * (rgb1[1] - rgb2[1]) * 4,
    (rgb1[2] - rgb2[2]) * (rgb1[2] - rgb2[2]) * (3 - rm)
  ];
  return Math.sqrt(diff[0] + diff[1] + diff[2]);
}

function blurgen(img, radius){
    var can = document.createElement("canvas");
    can.width = canvas.width;
    can.height = canvas.height;
    can.id = 'can';
    can.style.display = 'none';
    var cx = can.getContext("2d");
    cx.putImageData(img,0,0);

    document.body.appendChild(can);
    stackBlurCanvasRGBA('can', 0, 0, can.width, can.height, radius);
    document.body.removeChild(can);

    return cx.getImageData(0,0,can.width,can.height);
}