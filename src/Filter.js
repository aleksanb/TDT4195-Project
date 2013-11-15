function Filter(type,imgcache) {
  this.type = type;
  this.img = imgcache;
  var can = document.createElement("canvas");
  can.width = canvas.width;
  can.height = canvas.height;
  var cx = can.getContext("2d");
  this.apply = {
    "Blur": function(img) {
      var radius = 6;
      return blurgen(img, radius);
    },
    "Find objects":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);

      var threshold = 70;
      for (var i = 0; i < newimg.data.length; i += 4) {
        var rgb = [newimg.data[i], newimg.data[i+1], newimg.data[i+2]];

        var minDiff = 255;
        for (var j = 0; j < cm.colors.length; j++) {
          var diff = rgbDelta(rgb, cm.colors[j]);
          if (diff < minDiff) {
            minDiff = diff;
          }
        }

        var val = 255 * Math.max(threshold - minDiff, 0) / threshold;

        newimg.data[i+2] = val;
        newimg.data[i+1] = val;
        newimg.data[i] = val;
      }
      return newimg;
    },
    "Find objects using HSV":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);

      hsvColors = [];
      for (var j = 0; j < cm.colors.length; j++) {
        var hsv = RGBtoHSV(cm.colors[j]);
        hsvColors.push(hsv);
      }

      var hueThreshold = 10;
      var saturationThreshold = 15;
      var valueThreshold = 20;
      for (var i = 0; i < newimg.data.length; i += 4) {
        var rgb = [newimg.data[i], newimg.data[i+1], newimg.data[i+2]];
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

        //var val = 255 * Math.max(threshold - minDiff, 0) / threshold;

        newimg.data[i+2] = val;
        newimg.data[i+1] = val;
        newimg.data[i] = val;
      }
      return newimg;
    },
    "Threshold":function(img){
      cx.putImageData(img,0,0);
      var threshold = 60;
      var newimg = cx.getImageData(0,0,can.width,can.height);
      for(var i=0;i<newimg.data.length;i+=4){
        newimg.data[i] = newimg.data[i] > threshold ? 255 : 0;
        newimg.data[i+1] = newimg.data[i + 1] > threshold ? 255 : 0;
        newimg.data[i+2] = newimg.data[i + 2] > threshold ? 255 : 0;
      }
      return newimg;
    }
  }[type];
}

