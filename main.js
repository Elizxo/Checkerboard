(function(){

var SQ = 50;
var BOARD_SIZE = 8;

var board = new Board(BOARD_SIZE);
var canvas = document.getElementById('boardCanvas');
var ctx = canvas.getContext('2d');
var piecesLayer = document.getElementById('piecesLayer');
var arrowSvg = document.getElementById('arrowSvg');
var statusMsg = document.getElementById('statusMsg');

var selectedChecker = null;
var pieceElements = new Map();

/* Draw board */
function drawBoard(){
  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      ctx.fillStyle = (r+c)%2===0 ? '#fff' : '#cc0000';
      ctx.fillRect(c*SQ, r*SQ, SQ, SQ);
    }
  }
}

/* Checker Piece Element with Selection & King Label */
function createPieceEl(checker){
  var el = document.createElement('div');
  el.className = 'checker';
  el.style.left = (checker.col * SQ + 4) + 'px';
  el.style.top  = (checker.row * SQ + 4) + 'px';

  var img = document.createElement('img');
  img.src = getImageSrc(checker);
  img.onerror = function(){
    el.classList.add(checker.color + '-fallback');
    el.removeChild(img);
  };
  el.appendChild(img);

  var kingLabel = document.createElement('span');
  kingLabel.className = 'king-label';
  kingLabel.textContent = 'K';
  el.appendChild(kingLabel);

  el.addEventListener('click', function(e){
    e.stopPropagation();
    if(selectedChecker === checker){
      el.classList.remove('selected');
      selectedChecker = null;
      statusMsg.textContent = 'Piece deselected.';
      return;
    }
    if(selectedChecker){
      document.querySelectorAll('.checker.selected').forEach(function(s){ s.classList.remove('selected'); });
    }
    selectedChecker = checker;
    el.classList.add('selected');
    statusMsg.textContent = 'Piece selected. Click an empty square to move.';
  });

  return el;
}

function getImageSrc(checker){
  if(checker.color === 'red'){
    return checker.isKing ? 'graphics/red-king.png' : 'graphics/red-piece.png';
  } else {
    return checker.isKing ? 'graphics/black-king.png' : 'graphics/black-piece.png';
  }
}

function placePieceEl(checker){
  var el = createPieceEl(checker);
  piecesLayer.appendChild(el);
  pieceElements.set(checker, el);
}

function movePieceEl(checker){
  var el = pieceElements.get(checker);
  if(!el) return;
  el.style.left = (checker.col * SQ + 4) + 'px';
  el.style.top  = (checker.row * SQ + 4) + 'px';
}

function promotePieceEl(checker){
  var el = pieceElements.get(checker);
  if(!el) return;
  var img = el.querySelector('img');
  if(img) img.src = getImageSrc(checker);
  el.classList.add('show-king');
}

function clearPieceEls(){
  piecesLayer.innerHTML = '';
  pieceElements.clear();
}

/* Click empty square to move selected piece */
piecesLayer.addEventListener('click', function(e){
  if(!selectedChecker) return;
  var rect = piecesLayer.getBoundingClientRect();
  var col = Math.floor((e.clientX - rect.left) / SQ);
  var row = Math.floor((e.clientY - rect.top) / SQ);
  board.moveTo(selectedChecker, row, col);
  document.querySelectorAll('.checker.selected').forEach(function(s){ s.classList.remove('selected'); });
  selectedChecker = null;
});

/* Arrow */
function drawArrow(fr,fc,tr,tc){
  arrowSvg.innerHTML = '';
  var ns = "http://www.w3.org/2000/svg";

  var defs = document.createElementNS(ns,'defs');
  var marker = document.createElementNS(ns,'marker');
  marker.setAttribute('id','arrowhead');
  marker.setAttribute('markerWidth','6');
  marker.setAttribute('markerHeight','6');
  marker.setAttribute('refX','3');
  marker.setAttribute('refY','3');
  marker.setAttribute('orient','auto');
  var poly = document.createElementNS(ns,'polygon');
  poly.setAttribute('points','0 0, 6 3, 0 6');
  poly.setAttribute('fill','yellow');
  marker.appendChild(poly);
  defs.appendChild(marker);
  arrowSvg.appendChild(defs);

  var line = document.createElementNS(ns,'line');
  line.setAttribute('x1', fc*SQ+25);
  line.setAttribute('y1', fr*SQ+25);
  line.setAttribute('x2', tc*SQ+25);
  line.setAttribute('y2', tr*SQ+25);
  line.setAttribute('stroke','yellow');
  line.setAttribute('stroke-width','4');
  line.setAttribute('marker-end','url(#arrowhead)');
  arrowSvg.appendChild(line);
}

/* Board events */
board.addEventListener('add', function(e){
  placePieceEl(e.details.checker);
});

board.addEventListener('move', function(e){
  movePieceEl(e.details.checker);
  drawArrow(e.details.fromRow, e.details.fromCol, e.details.toRow, e.details.toCol);
  statusMsg.textContent = 'Moved ' + e.details.checker.color + ' piece.';
});

board.addEventListener('promote', function(e){
  promotePieceEl(e.details.checker);
  statusMsg.textContent = e.details.checker.color + ' piece promoted to King!';
});

/* New game */
function newGame(){
  board.clear();
  clearPieceEls();
  arrowSvg.innerHTML = '';
  selectedChecker = null;

  for(var r = 0; r < BOARD_SIZE; r++){
    for(var c = 0; c < BOARD_SIZE; c++){
      if((r+c)%2 === 1){
        if(r < 3){
          board.add(new Checker('black'), r, c);
        } else if(r > 4){
          board.add(new Checker('red'), r, c);
        }
      }
    }
  }
  statusMsg.textContent = 'New game started. Red goes first.';
}

/* Move a random piece to a random empty dark square */
function moveRandom(){
  var keys = [];
  for(var r=0;r<BOARD_SIZE;r++){
    for(var c=0;c<BOARD_SIZE;c++){
      var ch = board.getCheckerAt(r,c);
      if(ch) keys.push(ch);
    }
  }
  if(keys.length === 0){ statusMsg.textContent = 'No pieces to move.'; return; }

  var empties = [];
  for(var r=0;r<BOARD_SIZE;r++){
    for(var c=0;c<BOARD_SIZE;c++){
      if((r+c)%2===1 && board.isEmptyLocation(r,c)) empties.push({r,c});
    }
  }
  if(empties.length === 0){ statusMsg.textContent = 'No empty squares.'; return; }

  var piece = keys[Math.floor(Math.random()*keys.length)];
  var dest  = empties[Math.floor(Math.random()*empties.length)];
  board.moveTo(piece, dest.r, dest.c);
}

/* Promote a random non-king piece to king */
function kingRandom(){
  var pieces = [];
  for(var r=0;r<BOARD_SIZE;r++){
    for(var c=0;c<BOARD_SIZE;c++){
      var ch = board.getCheckerAt(r,c);
      if(ch && !ch.isKing) pieces.push(ch);
    }
  }
  if(pieces.length === 0){ statusMsg.textContent = 'No pieces to promote.'; return; }
  var piece = pieces[Math.floor(Math.random()*pieces.length)];
  board.promote(piece);
}

/* Buttons */
document.getElementById('btnNewGame').addEventListener('click', newGame);
document.getElementById('btnMoveRandomly').addEventListener('click', moveRandom);
document.getElementById('btnKingRandomly').addEventListener('click', kingRandom);
document.getElementById('btnClear').addEventListener('click', function(){
  board.clear();
  clearPieceEls();
  arrowSvg.innerHTML = '';
  selectedChecker = null;
  statusMsg.textContent = 'Board cleared.';
});

/* Init */
drawBoard();
newGame();

})();
