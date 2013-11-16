function RegionManager() {
  this.regions = [];
  this.colorCount = {};
  this.colors = [];
}

RegionManager.prototype.reset = function() {
  this.regions = [];
  this.colorCount = {};
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
  if (this.colors.length < this.regions.length) {
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

RegionManager.prototype.getColorCount = function() {
  if (Object.keys(this.colorCount).length === 0) {
    this.getUniqueColors();
  }
  return this.colorCount;
}

RegionManager.prototype.sanitizeRegions = function() {
  var radiuses = [];
  for (var i = 0; i < this.regions.length; i++) {
    var region = this.regions[i];
    var radius = region.getRadius();
    if (radius > 2) {
      radiuses.push(radius);
    }
  }
  radiuses.sort();
  
  var medianRadius = median(radiuses);

  var tempRegions = this.regions;

  this.regions = [];

  for (var i = 0; i < tempRegions.length; i++) {
    var region = tempRegions[i];
    var radius = region.getRadius();
    if (Math.abs(1 - (radius / medianRadius)) < 0.5) {
      this.regions.push(region);
    }
  }
}

