function colorDifference(rgb1, rgb2) {
  var rm = 0.5 * (rgb1[0] + rgb2[0]);
  var diff = [
    (rgb1[0] - rgb2[0]) * (rgb1[0] - rgb2[0]),
    (rgb1[1] - rgb2[1]) * (rgb1[1] - rgb2[1]),
    (rgb1[2] - rgb2[2]) * (rgb1[2] - rgb2[2])
  ];
  diff[0] *= 2 + rm;
  diff[1] *= 4;
  diff[2] *= 3 - rm;
  return Math.sqrt(diff[0] + diff[1] + diff[2]);
}

console.log(colorDifference([0,0,0], [1,1,0]))
