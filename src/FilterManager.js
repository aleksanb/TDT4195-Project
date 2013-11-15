function FilterManager(formId,ctx){
  this.DOMfilters = document.getElementById(formId);
  this.filters = [];
  this.original = document.createElement("img");
  this.original.src = "color.jpg";
  var that = this;
  this.original.addEventListener("load",function(e){
    ctx.drawImage(that.original,0,0);
    that.img = ctx.getImageData(0,0,canvas.width,canvas.height);
    that.render(ctx);
  });

  this.pop = function(){
    if( this.filters.length == 0) return;
    this.filters.pop();
    this.DOMfilters.removeChild(this.DOMfilters.children[this.DOMfilters.children.length-1]);
    this.render(ctx);
  }
  this.add = function(type){
    var cache = !!this.filters.length ? this.filters[this.filters.length-1].img:this.img;
    this.filters.push(new Filter(type,cache));
    this.filters[this.filters.length-1].img = this.filters[this.filters.length-1].apply(cache);
    this.DOMfilters.appendChild(this.createDOMFilterNode(type));
    this.render(ctx);
  }

  this.createDOMFilterNode = function(type){
    var node = document.createElement("span");
    node.innerHTML = type;
    return node;
  }

  this.render = function(ctx){
    var img = !!this.filters.length?this.filters[this.filters.length-1].img:this.img;
    /*
     for(var i=0;i<this.filters.length;i++){
     img = this.filters[i].apply(img);
     }
     */
    ctx.putImageData(img,0,0);
  }
}
