function Filter(type, imgcache) {
  this.type = type;
  this.img = imgcache;
  var can = document.createElement("canvas");
  can.width = canvas.width;
  can.height = canvas.height;
  var cx = can.getContext("2d");
  var width = can.width;
  var height = can.height;
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
        var resultRgb = [0, 0, 0];
        for (var j = 0; j < cm.colors.length; j++) {
          var diff = rgbDelta(rgb, cm.colors[j]);
          if (diff <= threshold && diff < minDiff) {
            minDiff = diff;
            resultRgb = cm.colors[j];
          }
        }

        newimg.data[i] = resultRgb[0];
        newimg.data[i + 1] = resultRgb[1];
        newimg.data[i + 2] = resultRgb[2];
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

      var threshold = 12.5;
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
    "Median filter (greyscale)": function(img) {
      cx.putImageData(img, 0, 0);
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
              var val = rgbToGreyValue([newimg.data[iPos], newimg.data[iPos + 1], newimg.data[iPos + 2]]);
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
    "Find and sanitize regions": function(img) {
      cx.putImageData(img, 0, 0);
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

      rm.sanitizeRegions();

      grownCtx.fillRect(0, 0, width, height);
      var newimg = grownCtx.getImageData(0, 0, width, height);

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

      var newimg = cx.getImageData(0, 0, width, height);
      return newimg;
    },
    "Canny edge detection": function(img) {
      cx.putImageData(img, 0, 0);
      var newimg = cx.getImageData(0, 0, width, height);

      var cannyImage = cvCreateImage(width, height);
      cannyImage.imageData = newimg;
      cannyImage.RGBA = newimg.data;
      cannyImage.canvas = can;

      cvCvtColor(cannyImage, cannyImage, CV_CODE.RGB2GRAY);
      cvCanny(cannyImage, cannyImage, 50, 80);
      return cannyImage.imageData;
    },
    "Hough circle transform": function(img) {
      cx.fillStyle = "black";
      cx.fillRect(0, 0, width, height);

      var minX = 1;
      var maxX = width - 2;
      var minY = 1;
      var maxY = height - 2;
      var edgePixels = [];
      for (var i = 0; i < img.data.length; i += 4) {
        if (img.data[i] || img.data[i + 1] || img.data[i + 2]) {
          var pos = to2D(i, width, height);
          if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
            edgePixels.push(i);
          }
        }
      }

      var eAngle = 2 * Math.PI;
      var minRadius = 13;
      var maxRadius = 23;
      var bestRadius = null;
      var bestRadiusIntensity = 0;
      if (null != averageObjectRadius) {
        minRadius = averageObjectRadius;
        maxRadius = averageObjectRadius;
      }

      var strokeCircles = function(radius) {
        cx.strokeStyle = "white";
        cx.globalAlpha = 0.02;
        for (var i = 0; i < edgePixels.length; i++) {
          var pos = to2D(edgePixels[i], width, height);
          cx.beginPath();
          cx.arc(pos.x, pos.y, radius, 0, eAngle);
          cx.stroke();
        }
      }

      for (var radius = minRadius; radius <= maxRadius; radius++) {
        console.log("trying radius", radius);
        strokeCircles(radius);
        var tempImg = cx.getImageData(0, 0, width, height);
        var maxIntensity = 0;
        for (var i = 0; i < tempImg.data.length; i += 4) {
          if (tempImg.data[i] > maxIntensity) {
            maxIntensity = tempImg.data[i];
          }
        }
        console.log("maxintensity", maxIntensity);
        if (maxIntensity > bestRadiusIntensity) {
          bestRadiusIntensity = maxIntensity;
          bestRadius = radius;
        }
        can.width = can.width;
        cx.fillStyle = "black";
        cx.fillRect(0, 0, width, height);
      }

      autoFoundRadius = bestRadius;
      strokeCircles(bestRadius);

      return cx.getImageData(0, 0, width, height);
    },
    "Basic global threshold": function(img) {
      cx.putImageData(img, 0, 0);
      var newimg = cx.getImageData(0, 0, can.width, can.height);

      var maxIntensity = 0;
      for (var i = 0; i < newimg.data.length; i += 4) {
        if (newimg.data[i] > maxIntensity) {
          maxIntensity = newimg.data[i];
        }
      }
      var threshold = maxIntensity / 2.9;

      for (var i = 0; i < newimg.data.length; i += 4) {
        var val = newimg.data[i] > threshold ? 255 : 0;
        newimg.data[i] = val;
        newimg.data[i + 1] = val;
        newimg.data[i + 2] = val;
      }
      return newimg;
    },
    "Intensify": function(img) {
      cx.putImageData(img, 0, 0);
      var newimg = cx.getImageData(0, 0, can.width, can.height);

      var maxIntensity = 0;
      for (var i = 0; i < newimg.data.length; i += 4) {
        if (newimg.data[i] > maxIntensity) {
          maxIntensity = newimg.data[i];
        }
      }

      var factor = 300 / maxIntensity;
      for (var i = 0; i < newimg.data.length; i += 4) {
        newimg.data[i] = Math.min(newimg.data[i] * factor, 255);
        newimg.data[i + 1] = Math.min(newimg.data[i + 1] * factor, 255);
        newimg.data[i + 2] = Math.min(newimg.data[i + 2] * factor, 255);
      }
      return newimg;
    },
    "Find original region colors": function(img) {
      cx.drawImage(fm.original, 0, 0);
      var originalImg = cx.getImageData(0, 0, can.width, can.height);

      var minX = 1;
      var maxX = width - 1;
      var minY = 1;
      var maxY = height - 1;
      var radius = (averageObjectRadius ? averageObjectRadius : autoFoundRadius);
      var maxRadius = Math.round(0.75 * radius);
      var minRadius = Math.round(0.4 * radius);
      for (var i = 0; i < rm.regions.length; i++) {
        var region = rm.regions[i];
        var center = region.getCenter2D();

        var hs = [];
        var ss = [];
        var vs = [];
        for (var x = center.x - maxRadius; x <= center.x + maxRadius; x++) {
          for (var y = center.y - maxRadius; y <= center.y + maxRadius; y++) {
            var distance = euclideanDistance({x: x, y: y}, center);
            if (x >= minX && x <= maxX && y >= minY && y <= maxY && distance >= minRadius && distance <= maxRadius) {
              var oneD = to1D(x, y, width);
              var rgb = [originalImg.data[oneD], originalImg.data[oneD + 1], originalImg.data[oneD + 2]];
              var hsv = RGBtoHSV(rgb);
              hs.push(hsv[0]);
              ss.push(hsv[1]);
              vs.push(hsv[2]);
            }
          }
        }
        var medianH = getMedian(hs);
        var medianS = getMedian(ss);
        var medianV = Math.round(getMedian(vs));
        var medianHsv = [medianH, medianS, medianV];
        var medianRgb = HSVtoRGB(medianHsv);
        cx.fillStyle = rgbToHex(medianRgb);
        cx.beginPath();
        cx.arc(center.x, center.y, maxRadius, 0, 2 * Math.PI);
        cx.fill();
      }

      return cx.getImageData(0, 0, can.width, can.height);
    }
  }[type];
}
