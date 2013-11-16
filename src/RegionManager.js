function RegionManager() {
  this.regions = [];
  this.colorIds = {};
  this.colors = [];
}

RegionManager.prototype.reset = function() {
  this.regions = [];
  this.colorIds = {};
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
      if (!(id in this.colorIds)) {
        this.colorIds[id] = true;
        this.colors.push(region.rgb);
      }
    }
  }
  return this.colors;
}
