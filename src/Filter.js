function Filter(type,imgcache) {
  this.type = type;
  this.img = imgcache;
  var can = document.createElement("canvas");
  can.width = canvas.width;
  can.height = canvas.height;
  var cx = can.getContext("2d");
  this.apply = {
    "Blur": blurgen(2),
    "Color shift":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      for(var i=0;i<newimg.data.length;i+=4){
        var tmp = newimg.data[i+2];
        newimg.data[i+2] = newimg.data[i+1];
        newimg.data[i+1] = newimg.data[i];
        newimg.data[i] = tmp;
      }
      return newimg;
    },
    "Web Safe™":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      for(var i=0;i<newimg.data.length;i++){
        newimg.data[i] = 32*Math.floor(img.data[i]/(32));
      }
      return newimg;
    },
    "Dullify":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      for(var i=0;i<newimg.data.length;i+=4){
        newimg.data[i] /= 1.1;
        newimg.data[i+1] /= 1.1;
        newimg.data[i+2] /= 1.1;
      }
      return newimg;
    },
    "Scanline":function(img){
      cx.putImageData(img,0,0);
      cx.fillStyle = "rgba(0,0,0,0.1)";
      for(var i=0;i<can.height;i+=10){
        cx.fillRect(0,i,can.width,5);
      }
      var newimg = cx.getImageData(0,0,can.width,can.height);
      return newimg;
    },
    "Noise":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      for(var i=0;i<newimg.data.length;i+=4){
        newimg.data[i] += (Math.random()-0.5)*20;
        newimg.data[i+1] += (Math.random()-0.5)*20;
        newimg.data[i+2] += (Math.random()-0.5)*20;
      }
      return newimg;
    },
    "Intensify":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      for(var i=0;i<newimg.data.length;i+=4){
        newimg.data[i] *= 1.1;
        newimg.data[i+1] *= 1.1;
        newimg.data[i+2] *= 1.1;
      }
      return newimg;
    },
    "Grayscale":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      for(var i=0;i<newimg.data.length;i+=4){
        var temp = (newimg.data[i] +
          newimg.data[i+1] +
          newimg.data[i+2])/3;
        newimg.data[i] = temp;
        newimg.data[i+1] = temp;
        newimg.data[i+2] = temp;
      }
      return newimg;
    },
    "Reverse":function(img){
      cx.putImageData(img,0,0);
      cx.save();
      cx.scale(-1,1);
      cx.drawImage(can,-can.width,0);
      cx.restore();
      return cx.getImageData(0,0,can.width, can.height);
    },
    "Invert":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      for(var i=0;i<newimg.data.length;i+=4){
        newimg.data[i] = 256-img.data[i];
        newimg.data[i+1] = 256-img.data[i+1];
        newimg.data[i+2] = 256-img.data[i+2];
      }
      return newimg;
    },
    "Warp":function(img){
      cx.putImageData(img,0,0);
      var newimg = cx.getImageData(0,0,can.width,can.height);
      var x = 0, y = 0;
      var w = can.width;
      var h = can.height;
      for(var i=0;i<newimg.data.length;i+=4){
        newimg.data[i] = img.data[xy(x*Math.cos(0.5*Math.PI*x/w),y*Math.sin(0.5*Math.PI*y/h),w)];
        newimg.data[i+1] = img.data[1+xy(x*Math.cos(0.5*Math.PI*x/w),y*Math.sin(0.5*Math.PI*y/h),w)];
        newimg.data[i+2] = img.data[2+xy(x*Math.cos(0.5*Math.PI*x/w),y*Math.sin(0.5*Math.PI*y/h),w)];

        x++;
        if(x >= can.width){
          x=0;y++;
        }
      }
      return newimg;
    }
  }[type];
}

function blurgen(factor){
  return (function(img){
    var can = document.createElement("canvas");
    can.width = canvas.width;
    can.height = canvas.height;
    var cx = can.getContext("2d");
    cx.save();
    cx.putImageData(img,0,0);
    cx.scale(1/factor,1/factor);
    cx.drawImage(can,0,0);
    cx.restore();
    cx.scale(factor,factor);
    cx.drawImage(can,0,0);
    return cx.getImageData(0,0,can.width,can.height);
  });
}
