function FilterManager(formId, ctx) {
  this.DOMfilters = document.getElementById(formId);
  this.filters = [];
  this.original = document.createElement("img");
  this.original.src = filePath;
  var that = this;
  this.original.addEventListener("load", function(e) {
    canvas.width = that.original.width;
    canvas.height = that.original.height;
    ctx.drawImage(that.original, 0, 0);
    that.img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    that.render(ctx);
  });

  this.pop = function() {
    if (this.filters.length == 0) return;
    var filter = this.filters.pop();
    if (filter.type == "Sanitize regions") {
      rm.reset();
    }
    this.DOMfilters.removeChild(this.DOMfilters.children[this.DOMfilters.children.length - 1]);
    this.render(ctx);
  }

  this.add = function(type) {
    if ((type == "Mark region centers") && rm.regions.length === 0) {
      alert("You haven't calculated any regions yet");
      return;
    } else if (type.startsWith("Find objects")) {
      if (cm.colors.length === 0) {
        alert("You should mark at least one color by clicking the image");
        return;
      }
    }
    var cache = !!this.filters.length ? this.filters[this.filters.length - 1].img : this.img;
    this.filters.push(new Filter(type, cache));
    this.filters[this.filters.length - 1].img = this.filters[this.filters.length - 1].apply(cache);
    this.DOMfilters.appendChild(this.createDOMFilterNode(type));
    this.render(ctx);
  }

  this.createDOMFilterNode = function(type) {
    var node = document.createElement("span");
    node.innerHTML = type;
    node.className = "appliedFilter";
    return node;
  }

  this.render = function(ctx) {
    var img = !!this.filters.length ? this.filters[this.filters.length - 1].img : this.img;
    ctx.putImageData(img, 0, 0);
  }
}

FilterManager.prototype.resetFilters = function() {
  this.filters.length = 0;
  $('.appliedFilter').remove();
};
