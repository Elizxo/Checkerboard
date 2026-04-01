function Checker(color, isKing) {
  this.color = color;
  this.isKing = isKing || false;
  this.row = null;
  this.col = null;

  this.toString = function() {
    return this.isKing ? this.color.toUpperCase() : this.color;
  };
}
