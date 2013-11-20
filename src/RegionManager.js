function RegionManager() {
  this.regions = [];
  this.colorCount = {};
  this.colors = [];
  this.medianRadius = null;
  this.averagePixelCount = null;
}

RegionManager.prototype.reset = function() {
  this.regions = [];
  this.colorCount = {};
  this.colors = [];
  this.medianRadius = null;
  this.averagePixelCount = null;
}

RegionManager.prototype.addRegion = function(pixels1D, rgb) {
  if (pixels1D) {
    var pixels2D = [];
    for (var i = 0; i < pixels1D.length; i++) {
      pixels2D.push(to2D(pixels1D[i], canvas.width, canvas.height));
    }
    this.regions.push(new Region(pixels2D, rgb));
  }
}

RegionManager.prototype.getUniqueColors = function() {
  if (this.colors.length === 0) {
    for (var i = 0; i < this.regions.length; i++) {
      var region = this.regions[i];
      var id = cm.getId(region.rgb);
      if (!(id in this.colorCount)) {
        this.colorCount[id] = 1;
        this.colors.push(region.rgb);
      } else {
        this.colorCount[id]++;
      }
    }
  }
  return this.colors;
}

RegionManager.prototype.export = function() {
  exports = {
    filePath: filePath,
    height: canvas.height,
    width: canvas.width,
    groups: []
  }

  var colorObjs = {};
  this.getUniqueColors().forEach(function(elm, idx) {
    colorObjs[rgbToHexInteger(elm)] = {
      color: rgbToHexInteger(elm),
      elements: []
    }
  });

  this.regions.forEach(function(elm, idx) {
    var element = elm.getCenter2D();
    element.radius = elm.getRadius();
    colorObjs[rgbToHexInteger(elm.rgb)].elements.push(element);
  });

  for (var element in colorObjs) {
    exports.groups.push(colorObjs[element]);
  }

  return exports;
}

RegionManager.prototype.getColorCount = function() {
  if (Object.keys(this.colorCount).length === 0) {
    this.getUniqueColors();
  }
  return this.colorCount;
}

RegionManager.prototype.sanitizeRegions = function() {
  var medianRadius = this.getMedianRadius();
  var averagePixelCount = this.getAveragePixelCount();
  var tempRegions = this.regions;

  this.regions = [];

  for (var i = 0; i < tempRegions.length; i++) {
    var region = tempRegions[i];
    var radius = region.getRadius();
    var numPixels = region.pixels2D.length;
    var relativeSize = radius / medianRadius;
    var relativeWidth = region.getWidth() / region.getHeight();
    var relativePixelCount = numPixels / averagePixelCount;
    if (relativeSize > 0.4 && relativeSize < 5
      && relativeWidth > 0.5 && relativeWidth < 2
      && relativePixelCount > 0.3 && relativePixelCount < 25) {
      this.regions.push(region);
    }
  }

  //Remove intersecting regions
  var toBeRemoved = [];
  for (var i = 0; i < this.regions.length; i++) {
    var region1 = this.regions[i];
    var numPixels1 = region1.pixels2D.length;
    for (var j = i + 1; j < this.regions.length; j++) {
      var region2 = this.regions[j];
      var distanceBetweenCenters = euclideanDistance(region1.getCenter2D(), region2.getCenter2D());
      if (distanceBetweenCenters < (region1.getRadius() + region2.getRadius()) * 0.8) {
        var numPixels2 = region2.pixels2D.length;
        var smallest = numPixels1 < numPixels2 ? i : j;
        toBeRemoved.push(smallest);
      }
    }
  }
  tempRegions = this.regions;
  this.regions = [];
  for (var i = 0; i < tempRegions.length; i++) {
    if (toBeRemoved.indexOf(i) === -1) {
      this.regions.push(tempRegions[i]);
    }
  }
}

RegionManager.prototype.getMedianRadius = function() {
  if (null == this.medianRadius) {
    var radiuses = [];
    for (var i = 0; i < this.regions.length; i++) {
      var region = this.regions[i];
      var radius = region.getRadius();
      var numPixels = region.pixels2D.length;
      if (radius > 2 && numPixels > 10) { //suppress really small areas
        radiuses.push(radius);
      }
    }
    radiuses.sort();
    this.medianRadius = getMedian(radiuses);
  }

  return this.medianRadius;
}

RegionManager.prototype.getAveragePixelCount = function() {
  if (null == this.averagePixelCount) {
    var pixels = 0;
    var ignoredRegions = 0;
    for (var i = 0; i < this.regions.length; i++) {
      var region = this.regions[i];
      var numPixels = region.pixels2D.length;
      if (numPixels > 12) { //ignore really small areas that are probably noise
        pixels += numPixels;
      } else {
        ignoredRegions++;
      }
    }
    this.averagePixelCount = pixels / (this.regions.length - ignoredRegions);
  }

  return this.averagePixelCount;
}

RegionManager.prototype.fitColorsToClosest = function() {
  for (var i = 0; i < this.regions.length; i++) {
    var region = this.regions[i];
    var rgb = region.rgb;
    var xyz = RGBtoXYZ(rgb);
    var lab = XYZtoLAB(xyz);
    var minDelta = 255;
    var closestRgb = rgb;
    for (var j = 0; j < cm.colors.length; j++) {
      var candidateRgb = cm.colors[j];
      var candidateXyz = RGBtoXYZ(candidateRgb);
      var candidateLab = XYZtoLAB(candidateXyz);
      var delta = deltae94(lab, candidateLab);
      if (delta < minDelta) {
        minDelta = delta;
        closestRgb = candidateRgb;
      }
    }

    this.regions[i].rgb = closestRgb;
  }
  this.colors.length = 0;
  this.colorCount = {};
}