var TIMEFRAME = 20;
var BRIGHTNESS0 = 25;
var BRIGHTNESSSTEPS = 31; // up to 31 on Chrome that has better performance
if (navigator.userAgent.indexOf("Firefox")!=-1)
  BRIGHTNESSSTEPS = 6;
var BRIGHTNESSTABLE = [];
var BRIGHTNESSTABLERGB = [];
var HISTORY = 25;
var GRIDWIDTH = 10;
var MESSAGESTEP = 30;
var MESSAGE = "Pashay_chatakan"
var MESSAGE2 = "CH-ZAMOM-#8452"
var MESSAGEX = 2;
var MESSAGEY = 2;

var lastCols = {};
var lastColsList = [];
var lastColsIndex = 0;
var falls = {};
var fallsCounter = 0;
var time = 0;
var messageLoad = MESSAGE.length;
var messageTable = [];
var messageChar = 0;

function getchar2() {
  var ch = MESSAGE.charAt(messageChar++);
  if (messageChar >= MESSAGE.length)
    messageChar = 0;
  if (ch == ' ')
    ch = '&nbsp;'
  return ch;
}

function getchar() {
  var n = Math.floor((Math.random()*21)+1);
  var ch = String.fromCharCode(65 + n);
  return ch;
}

function init() {
  window.setTimeout(function(){
    updateBrightnessTable();
    updateZamoM();
    window.setTimeout(timeLoop,0);
  },500);
}

function evalBrightness(n) {
  // i : 31 = n : BRIGHTNESS0
  var i = Math.floor(n * 31 / BRIGHTNESS0);
  // brightness inc = BRIGHTNESS0 / BRIGHTNESSSTEPS
  var inc = 31 / BRIGHTNESSSTEPS;
  i = Math.floor(Math.floor(i / inc) * inc);
  var brHex = '#';
  var brCol = 'rgb(';
  if (i < 16) {
    var d = i * 16 + i;
    brHex += '0' + Number(i).toString(16) + '0';
    brCol += '255, ' + 0 + ', 0)';
  } else {
    i -= 16
    var d = i * 16 + i;
    var o = Number(i).toString(16);
    brHex += 0 + '0' + 0;
    brCol += d + ', 0, ' + 0 + ')';
  }
  return [brHex, brCol];
}

function updateBrightnessTable() {
  var i;
  for ( i = 0 ; i <= BRIGHTNESS0 ; ++i ) {
    var br = evalBrightness(i);
    BRIGHTNESSTABLE[i] = br[0];
    BRIGHTNESSTABLERGB[i] = br[1];
  }
}

function updateZamoM() {
  var gridx = Math.floor(document.documentElement.clientWidth / GRIDWIDTH);
  var gridy = Math.floor(document.documentElement.clientHeight / 18); // TODO const
  MESSAGEX = Math.floor((gridx - MESSAGE.length) / 2);
  MESSAGEY = Math.floor(gridy / 2) - 2;
  var i;
  for ( i = 0 ; i < MESSAGE.length ; ++i )
    messageTable[i] = false;
}

function isMessageColumn(col) {
  if (   col >= MESSAGEX 
    && col < MESSAGEX + MESSAGE.length) {
    return true;
  } else {
    return false;
  }
}

function timeLoop() {
  ++time;
  requestAnimationFrame(draw);
}

function draw() {

  var i;
  var grid = Math.floor(document.documentElement.clientWidth / GRIDWIDTH);

  i = 0;
  var col = null;
  do {
    if (i++ > HISTORY) {
      col = null;
      break;
    }
    col = Math.floor(Math.random()*grid);			
  } while(lastCols[col]);
  
  if (time % MESSAGESTEP == 0 && messageLoad) {
    for ( i = 0 ; i < MESSAGE.length ; ++i ) {
      if (messageTable[i] == false) {
        col = MESSAGEX + i;
        break;
      }
    }
  }
  
  var last = lastColsList[lastColsIndex];
  if (last != null)
    delete lastCols[last];
  if (col != null) {
    lastColsList[lastColsIndex] = col;
    lastCols[col] = col;
  }
  lastColsIndex++;
  if (lastColsIndex > HISTORY)
    lastColsIndex = 0;

  if (   time % 2 == 0
    && messageLoad
    && col) {
    var dx = col * GRIDWIDTH;
    var id = fallsCounter++;
    var el = document.createElement('div');
    el.id = 'col-'+id;
    el.className = 'column';
    el.style.top = 0;
    el.style.left = dx+'px';
    document.body.appendChild(el);
    var fall = falls[id] = {};
    fall.col = col;
    fall.id = id;
    fall.el = el;
    fall.str = [];			
  }
  
  var fallsNotEmpty = false;
  for (i in falls) {
    fallsNotEmpty = true;
    var fall = falls[i];
    drawFall(fall);
  }

  if (messageLoad || fallsNotEmpty) {
    window.setTimeout(timeLoop,TIMEFRAME);
  } else {
    var el = document.getElementById('message-0');
    var message2 = document.createElement('div');
    message2.style.position = 'absolute';
    message2.style.top = (el.offsetTop + el.offsetHeight + 5) + 'px';
    var x = el.offsetLeft + (el.offsetWidth * (MESSAGE.length - MESSAGE2.length)) / 2;
    message2.style.left = x + 'px';
    message2.style.position = 'absolute';
    message2.innerHTML = MESSAGE2;
    document.body.appendChild(message2);
  }
}

function drawFall(fall) {
  var el = fall.el;
  var str = fall.str;
  var n = str.length;
  if (el.offsetHeight < document.documentElement.clientHeight) {
    var cellId = n;
    var ch =  getchar(); // getchar2();

    var cellEl = document.createElement('div');
    cellEl.id = 'cell-'+fall.id+'-'+cellId;
    cellEl.className = 'cell';
    cellEl.innerHTML = ch;
    el.appendChild(cellEl);

    if (   cellId == MESSAGEY && isMessageColumn(fall.col)) {
      var charIndex = fall.col - MESSAGEX;
      if (document.getElementById('message-'+charIndex) == null) {

        var messageCell = cellEl.cloneNode(true);
        messageCell.id = 'message-'+charIndex;
        messageCell.style.zIndex = '10';
        messageCell.style.position = 'absolute';
        messageCell.style.top = cellEl.offsetTop + 'px';
        messageCell.style.left = el.offsetLeft + 'px';
        messageCell.style.color = '#fff';
        messageCell.style.textDecoration = 'blink';
        document.body.appendChild(messageCell);
        
        ch = MESSAGE.charAt(charIndex);
        if (ch == ' ')
          ch = '&nbsp;';
        messageCell.innerHTML = ch;
        messageTable[charIndex] = true;
        messageLoad--;
      }
      cellEl.innerHTML = '&nbsp;';
      cellEl.style.color = '#000';
      str[cellId] = [cellEl,0];
    } else {
      str[cellId] = [cellEl,BRIGHTNESS0];
    }
  }

  var end = true;
  var i;
  for (i = 0 ; i < n ; ++i) {
    var cell = str[i];
    if (checkBrightness(cell))
      end = false;
  }	
  if (end && n) {
    delete falls[fall.id];
    document.body.removeChild(el);
  }
}

function checkBrightness(cell) {
  var cellEl = cell[0];
  if (cell[1] > -1) {
    end = false;
    var br = BRIGHTNESSTABLERGB[cell[1]];
    if (cellEl.style.color != br)
      changeBrightness(cellEl,br);
    cell[1]--;
    return true;
  } else {
    return false;
  }
}

function changeBrightness(cellEl,br) {
  cellEl.style.color = br;
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 6 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
