function Board(size) {
  this.boardSize = size;
  this.square = [];
  for (var i = 0; i <= size; i++) this.square[i] = [];
  this.allHandlers = {};

  this.size = function() { return this.boardSize; };

  this.isValidLocation = function(r,c) {
    return r>=0 && r<this.boardSize && c>=0 && c<this.boardSize;
  };

  this.isEmptyLocation = function(r,c) {
    return !(this.square[r] && this.square[r][c]);
  };

  this.getCheckerAt = function(r,c) {
    return this.isValidLocation(r,c) ? (this.square[r][c] || null) : null;
  };

  this.add = function(checker,row,col) {
    if(!this.isValidLocation(row,col)||!this.isEmptyLocation(row,col)) return;
    checker.row=row; checker.col=col;
    this.square[row][col]=checker;
    this._dispatch("add",{checker,row,col});
  };

  this.moveTo = function(checker,toRow,toCol) {
    if(!this.isValidLocation(toRow,toCol)||!this.isEmptyLocation(toRow,toCol)) return;

    var d = {
      checker,
      fromRow: checker.row,
      fromCol: checker.col,
      toRow,
      toCol
    };

    delete this.square[checker.row][checker.col];
    this.square[toRow][toCol]=checker;
    checker.row=toRow;
    checker.col=toCol;

    this._dispatch("move",d);

    if(this.canBeKing(checker,toRow)) this.promote(checker);
  };

  this.promote = function(checker) {
    checker.isKing = true;
    this._dispatch("promote",{checker});
  };

  this.canBeKing = function(checker,row) {
    return checker.color==="red" ? row===this.boardSize-1 : row===0;
  };

  this.clear = function() {
    this.square = [];
    for (var i = 0; i <= this.boardSize; i++) this.square[i] = [];
  };

  this.addEventListener = function(type,fn) {
    if(!this.allHandlers[type]) this.allHandlers[type]=[];
    this.allHandlers[type].push(fn);
  };

  this._dispatch = function(type,details) {
    var evt = new BoardEvent(type,details);
    (this.allHandlers[type]||[]).forEach(fn=>fn(evt));
  };
}
