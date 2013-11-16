function RegionManager() {
  this.regions = [];
}

RegionManager.prototype.reset = function() {
  this.regions = [];
}

RegionManager.prototype.addRegion = function(region) {
  if (region) {
    this.regions.push(region);
  }
}