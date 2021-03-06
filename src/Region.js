function Region(pixels2D, rgb) {
  this.rgb = rgb;
  this.pixels2D = pixels2D;
  this.center2D = null;
  this.colorId = cm.getId(this.rgb);
  this.radius = null;
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
      x: Math.round(xSum / this.pixels2D.length),
      y: Math.round(ySum / this.pixels2D.length)
    };
  }
  return this.center2D;
};

Region.prototype.getNumberOfRegionsWithThisColor = function() {
  return rm.getColorCount()[this.colorId];
};

Region.prototype.getRadius = function() {
  if (null == this.radius) {
    var dimensions = this.getDimensions();
    var averageDiff = (dimensions.width + dimensions.height) / 2;
    this.radius = averageDiff / 2;
  }
  return this.radius;
};

Region.prototype.getDimensions = function() {
  var minX = this.pixels2D[0].x;
  var maxX = minX;
  var minY = this.pixels2D[0].y;
  var maxY = minY;
  for (var i = 1; i < this.pixels2D.length; i++) {
    var pixel = this.pixels2D[i];
    if (pixel.x < minX) {
      minX = pixel.x;
    }
    if (pixel.x > maxX) {
      maxX = pixel.x;
    }
    if (pixel.y < minY) {
      minY = pixel.y;
    }
    if (pixel.y > maxY) {
      maxY = pixel.y;
    }
  }
  this.width = maxX - minX;
  this.height = maxY - minY;
  return {
    width: this.width,
    height: this.height
  };
};

Region.prototype.getWidth = function() {
  if (null === this.width) {
    this.getDimensions();
  }
  return this.width;
}
Region.prototype.getHeight = function() {
  if (null === this.height) {
    this.getDimensions();
  }
  return this.height;
};
