function Filter(type,imgcache) {
  this.type = type;
  this.img = imgcache;
  var can = document.createElement("canvas");
  can.width = canvas.width;
  can.height = canvas.height;
  var cx = can.getContext("2d");
  this.apply = {
    "Blur": function(img) {
      var radius = 8;
      return blurgen(img, radius);
    },
    "Find objects":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      var red = [189, 19, 16];
      var lightBlue = [144, 159, 192];

      var threshold = 100;
      for(var i=0;i<newimg.data.length;i+=4){
        var rgb = [newimg.data[i], newimg.data[i+1], newimg.data[i+2]];

        var colorDiff = colorDifference(rgb, lightBlue);

        var val = 255 * Math.max(threshold - colorDiff, 0) / threshold;

        newimg.data[i+2] = val;
        newimg.data[i+1] = val;
        newimg.data[i] = val;
      }
      return newimg;
    },
    "Threshold":function(img){
      cx.putImageData(img,0,0);
      var threshold = 20;
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

