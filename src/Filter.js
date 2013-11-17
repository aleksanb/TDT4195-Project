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
        var resultRgb = [0, 0, 0];
        for (var j = 0; j < hsvColors.length; j++) {
          var hsvCompare = hsvColors[j];
          if (Math.abs(hsvCompare[0] - hsv[0]) < hueThreshold
            && Math.abs(hsvCompare[1] - hsv[1]) < saturationThreshold
            && Math.abs(hsvCompare[2] - hsv[2]) < valueThreshold
            ) {
              resultRgb = cm.colors[j];
          }
        }

        newimg.data[i] = resultRgb[0];
        newimg.data[i + 1] = resultRgb[1];
        newimg.data[i + 2] = resultRgb[2];
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

        var minDelta = 255;
        var resultRgb = [0, 0, 0];
        for (var j = 0; j < labColors.length; j++) {
          var labCompare = labColors[j];
          var delta = deltae94(lab, labCompare);
          if (delta < threshold) {
            if (delta < minDelta) {
              minDelta = delta;
              resultRgb = cm.colors[j];
            }
          }
        }

        newimg.data[i] = resultRgb[0];
        newimg.data[i + 1] = resultRgb[1];
        newimg.data[i + 2] = resultRgb[2];
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
          var median = getMedian(valuesInBox);
          newimg.data[i] = median;
          newimg.data[i + 1] = median;
          newimg.data[i + 2] = median;
        }
      }
      return newimg;
    },
    "Erosion": function(img) {
      cx.putImageData(img, 0, 0);
      var width = can.width;
      var height = can.height;
      var newimg = cx.getImageData(0, 0, width, height);

      var tempCan = document.createElement("canvas");
      tempCan.width = width;
      tempCan.height = height;
      var tempCtx = tempCan.getContext("2d");
      tempCtx.putImageData(img, 0, 0);
      var tempImg = tempCtx.getImageData(0, 0, width, height);

      var structuringElement = [
        [false, true, false],
        [true, true, true],
        [false, true, false]
      ];
      var boxDimension = structuringElement.length;
      var offset = -parseInt(boxDimension / 2);
      var minX = Math.abs(offset);
      var minY = Math.abs(offset);
      var maxX = width + offset - 1;
      var maxY = height + offset - 1;
      for (var i = 0; i < newimg.data.length; i += 4) {
        var pos = to2D(i, width, height);
        if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
          var factor = 1;
          erosionBox:
            for (var boxY = 0; boxY < boxDimension; boxY++) {
              for (var boxX = 0; boxX < boxDimension; boxX++) {
                var xPos = pos.x + boxX + offset;
                var yPos = pos.y + boxY + offset;
                var iPos = to1D(xPos, yPos, width);
                var rgbSum = tempImg.data[iPos] + tempImg.data[iPos + 1] + tempImg.data[iPos + 2];
                if (structuringElement[boxY][boxX] && !rgbSum) {
                  factor = 0;
                  break erosionBox;
                }
              }
            }
          newimg.data[i] = factor * newimg.data[i];
          newimg.data[i + 1] = factor * newimg.data[i + 1];
          newimg.data[i + 2] = factor * newimg.data[i + 2];
        } else {
          newimg.data[i] = 0;
          newimg.data[i + 1] = 0;
          newimg.data[i + 2] = 0;
        }
      }
      return newimg;
    },
    "Dilation": function(img) {
      cx.putImageData(img, 0, 0);
      var width = can.width;
      var height = can.height;
      var newimg = cx.getImageData(0, 0, width, height);

      var tempCan = document.createElement("canvas");
      tempCan.width = width;
      tempCan.height = height;
      var tempCtx = tempCan.getContext("2d");
      tempCtx.putImageData(img, 0, 0);
      var tempImg = tempCtx.getImageData(0, 0, width, height);

      var structuringElement = [
        [false, true, false],
        [true, true, true],
        [false, true, false]
      ];
      var boxDimension = structuringElement.length;
      var offset = -parseInt(boxDimension / 2);
      var minX = Math.abs(offset);
      var minY = Math.abs(offset);
      var maxX = width + offset - 1;
      var maxY = height + offset - 1;
      for (var i = 0; i < newimg.data.length; i += 4) {
        var pos = to2D(i, width, height);
        if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
          var resultColor = [0, 0, 0];
          dilationBox:
            for (var boxY = 0; boxY < boxDimension; boxY++) {
              for (var boxX = 0; boxX < boxDimension; boxX++) {
                var xPos = pos.x + boxX + offset;
                var yPos = pos.y + boxY + offset;
                var iPos = to1D(xPos, yPos, width);
                var rgbSum = tempImg.data[iPos] + tempImg.data[iPos + 1] + tempImg.data[iPos + 2];
                if (structuringElement[boxY][boxX] && rgbSum > 0) {
                  resultColor = [tempImg.data[iPos], tempImg.data[iPos + 1], tempImg.data[iPos + 2]];
                  break dilationBox;
                }
              }
            }
          newimg.data[i] = resultColor[0];
          newimg.data[i + 1] = resultColor[1];
          newimg.data[i + 2] = resultColor[2];
        } else {
          newimg.data[i] = 0;
          newimg.data[i + 1] = 0;
          newimg.data[i + 2] = 0;
        }
      }
      return newimg;
    },
    "Region growing": function(img) {
      cx.putImageData(img, 0, 0);
      var width = can.width;
      var height = can.height;
      var newimg = cx.getImageData(0, 0, width, height);

      var grownCanvas = document.createElement("canvas");
      grownCanvas.width = width;
      grownCanvas.height = height;
      var grownCtx = grownCanvas.getContext("2d");
      grownCtx.fillStyle = "black";
      grownCtx.fillRect(0, 0, width, height);
      var grownImg = grownCtx.getImageData(0, 0, width, height);

      var seeds1D = [];
      for (var i = 0; i < newimg.data.length; i += 4) {
        if (newimg.data[i] || newimg.data[i + 1] || newimg.data[i + 2]) {
          pos = to2D(i, width, height);
          seeds1D.push(i);
        }
      }

      var isGrown = function(pos1D) {
        return grownImg.data[pos1D] || grownImg.data[pos1D + 1] || grownImg.data[pos1D + 2];
      };

      var getNeighbours1D = function(pos1D) {
        var neighbours = [];
        var pos2D = to2D(pos1D, width, height);
        var candidate = to1D(pos2D.x - 1, pos2D.y, width);
        if (!isGrown(candidate) && pos2D.x > 0) {
          neighbours.push(candidate);
        }
        candidate = to1D(pos2D.x, pos2D.y - 1, width);
        if (!isGrown(candidate) && pos2D.y > 0) {
          neighbours.push(candidate);
        }
        candidate = to1D(pos2D.x + 1, pos2D.y, width);
        if (!isGrown(candidate) && pos2D.x < width - 1) {
          neighbours.push(candidate);
        }
        candidate = to1D(pos2D.x, pos2D.y + 1, width);
        if (!isGrown(candidate) && pos2D.y < height - 1) {
          neighbours.push(candidate);
        }
        return neighbours;
      };

      var setGrown = function(pos1D, rgb) {
        grownImg.data[pos1D] = rgb[0];
        grownImg.data[pos1D + 1] = rgb[1];
        grownImg.data[pos1D + 2] = rgb[2];
      }

      rm.reset();

      for (var i = 0; i < seeds1D.length; i++) {
        var seed1D = seeds1D[i];
        var seedRgb = [newimg.data[seed1D], newimg.data[seed1D + 1], newimg.data[seed1D + 2]];
        var region = null;
        if (!isGrown(seed1D)) {
          region = [seed1D];
          setGrown(seed1D, seedRgb);
        }
        var stack = [seed1D];
        while (stack.length) {
          var pos1D = stack.pop();
          var neighbours1D = getNeighbours1D(pos1D);
          for (var j = 0; j < neighbours1D.length; j++) {
            var neighbour1D = neighbours1D[j];
            var neighbourRgb = [newimg.data[neighbour1D], newimg.data[neighbour1D + 1], newimg.data[neighbour1D + 2]];
            if (rgbDelta(seedRgb, neighbourRgb) < 3) {
              setGrown(neighbour1D, seedRgb);
              region && region.push(neighbour1D);
              stack.push(neighbour1D);
            }
          }
        }

        rm.addRegion(region, seedRgb);
      }

      return grownImg;
    },
    "Sanitize regions": function(img) {
      rm.sanitizeRegions();

      var width = can.width;
      var height = can.height;
      cx.fillStyle = "black";
      cx.fillRect(0, 0, width, height);
      var newimg = cx.getImageData(0, 0, width, height);

      for (var i = 0; i < rm.regions.length; i++) {
        var region = rm.regions[i];
        var rgb = region.rgb;
        for (var j = 0; j < region.pixels2D.length; j++) {
          var pos2D = region.pixels2D[j];
          var pos1D = to1D(pos2D.x, pos2D.y, width);
          newimg.data[pos1D] = rgb[0];
          newimg.data[pos1D + 1] = rgb[1];
          newimg.data[pos1D + 2] = rgb[2];
        }
      }

      return newimg;
    },
    "Mark region centers": function(img) {
      cx.putImageData(img, 0, 0);
      cx.fillStyle = "white";

      for (var i = 0; i < rm.regions.length; i++) {
        var region = rm.regions[i];
        var center = region.getCenter2D();
        var radius = region.getRadius();
        cx.fillRect(center.x - radius / 2, center.y - radius / 2, radius, radius);
      }

      var width = can.width;
      var height = can.height;
      var newimg = cx.getImageData(0, 0, width, height);
      return newimg;
    }
  }[type];
}
