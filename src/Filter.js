function Filter(type, imgcache) {
  this.type = type;
  this.img = imgcache;
  var can = document.createElement("canvas");
  can.width = canvas.width;
  can.height = canvas.height;
  var cx = can.getContext("2d");
  this.apply = {
    "A little blur": function(img) {
      var radius = 2;
      return blurgen(img, radius);
    },
    "Medium blur": function(img) {
      var radius = 6;
      return blurgen(img, radius);
    },
    "Find objects using RGB": function(img) {
      cx.putImageData(img, 0, 0);
      var newimg = cx.getImageData(0, 0, can.width, can.height);

      var threshold = 70;
      for (var i = 0; i < newimg.data.length; i += 4) {
        var rgb = [newimg.data[i], newimg.data[i + 1], newimg.data[i + 2]];

        var minDiff = 255;
        for (var j = 0; j < cm.colors.length; j++) {
          var diff = rgbDelta(rgb, cm.colors[j]);
          if (diff < minDiff) {
            minDiff = diff;
          }
        }

        var val = 255 * Math.max(threshold - minDiff, 0) / threshold;

        newimg.data[i + 2] = val;
        newimg.data[i + 1] = val;
        newimg.data[i] = val;
      }
      return newimg;
    },
    "Find objects using HSV": function(img) {
      cx.putImageData(img, 0, 0);
      var newimg = cx.getImageData(0, 0, can.width, can.height);

      var hsvColors = [];
      for (var j = 0; j < cm.colors.length; j++) {
        var hsv = RGBtoHSV(cm.colors[j]);
        hsvColors.push(hsv);
      }

      var hueThreshold = 10;
      var saturationThreshold = 15;
      var valueThreshold = 20;
      for (var i = 0; i < newimg.data.length; i += 4) {
        var rgb = [newimg.data[i], newimg.data[i + 1], newimg.data[i + 2]];
        var hsv = RGBtoHSV(rgb);

        var val = 0;
        for (var j = 0; j < hsvColors.length; j++) {
          var hsvCompare = hsvColors[j];
          if (Math.abs(hsvCompare[0] - hsv[0]) < hueThreshold
            && Math.abs(hsvCompare[1] - hsv[1]) < saturationThreshold
            && Math.abs(hsvCompare[2] - hsv[2]) < valueThreshold
            ) {
            val = 255;
          }

        }

        newimg.data[i + 2] = val;
        newimg.data[i + 1] = val;
        newimg.data[i] = val;
      }
      return newimg;
    },
    "Find objects using LAB": function(img) {
      cx.putImageData(img, 0, 0);
      var newimg = cx.getImageData(0, 0, can.width, can.height);

      var labColors = [];
      for (var j = 0; j < cm.colors.length; j++) {
        var xyz = RGBtoXYZ(cm.colors[j]);
        var lab = XYZtoLAB(xyz)
        labColors.push(lab);
      }

      var threshold = 10;
      for (var i = 0; i < newimg.data.length; i += 4) {
        var rgb = [newimg.data[i], newimg.data[i + 1], newimg.data[i + 2]];
        var xyz = RGBtoXYZ(rgb);
        var lab = XYZtoLAB(xyz)

        var val = 0;
        for (var j = 0; j < labColors.length; j++) {
          var labCompare = labColors[j];
          if (deltae94(lab, labCompare) < threshold) {
            val = 255;
          }
        }

        newimg.data[i + 2] = val;
        newimg.data[i + 1] = val;
        newimg.data[i] = val;
      }
      return newimg;
    },
    "Threshold": function(img) {
      cx.putImageData(img, 0, 0);
      var threshold = 60;
      var newimg = cx.getImageData(0, 0, can.width, can.height);
      for (var i = 0; i < newimg.data.length; i += 4) {
        var val = newimg.data[i] > threshold ? 255 : 0;
        newimg.data[i] = val;
        newimg.data[i + 1] = val;
        newimg.data[i + 2] = val;
      }
      return newimg;
    },
    "Median filter (greyscale)": function(img) {
      cx.putImageData(img, 0, 0);
      var width = can.width;
      var height = can.height;
      var newimg = cx.getImageData(0, 0, width, height);
      var boxDimension = 3;
      var middle = parseInt(boxDimension * boxDimension / 2);
      var offset = -parseInt(boxDimension / 2);
      var minX = Math.abs(offset);
      var minY = Math.abs(offset);
      var maxX = width + offset;
      var maxY = height + offset;
      for (var i = 0; i < newimg.data.length; i += 4) {
        var pos = to2D(i, width, height);
        if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
          var valuesInBox = [];
          for (var boxY = 0; boxY < boxDimension; boxY++) {
            for (var boxX = 0; boxX < boxDimension; boxX++) {
              var xPos = pos.x + boxX + offset;
              var yPos = pos.y + boxY + offset;
              var iPos = to1D(xPos, yPos, width);
              var val = newimg.data[iPos];  //red channel
              valuesInBox.push(val);
            }
          }
          valuesInBox.sort();
          var median = valuesInBox[middle];
          newimg.data[i] = median;
          newimg.data[i + 1] = median;
          newimg.data[i + 2] = median;
        }
      }
      return newimg;
    }
  }[type];
}
