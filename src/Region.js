function Region(pixels2D, rgb) {
  this.rgb = rgb;
  this.pixels2D = pixels2D;
  this.center2D = null;
}

Region.prototype.getCenter2D = function() {
  if (null == this.center2D) {
    var xSum = 0;
    var ySum = 0;
    for (var i = 0; i < this.pixels2D.length; i++) {
      var pixel = this.pixels2D[i];
      xSum += pixel.x;
      ySum += pixel.y;
    }
    this.center2D = {
      x: xSum / this.pixels2D.length,
      y: ySum / this.pixels2D.length
    };
  }
  return this.center2D;
}

Region.prototype.getColorId = function() {
  return cm.getId(this.rgb);
}