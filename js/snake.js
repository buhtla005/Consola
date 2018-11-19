  var KEY     = { ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 },
      DIR     = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3, OPPOSITE: [1, 0, 3, 2] },
      stats   = new Stats(),
      canvas  = document.getElementById('canvas'),
      width   = canvas.width  = canvas.offsetWidth,
      height  = canvas.height = canvas.offsetHeight,
      ctx     = canvas.getContext('2d'),
      nx      = 44,
      ny      = 33,
      dx      = width  / nx,
      dy      = height / ny,
      playing = false,
      dstep, dt, length, moves, dir, growth, head, tail, food;

  function play() { reset(); playing = true;  };
  function lose() {          playing = false; };

  function reset() {
    dstep  = 0.06,
    dt     = 0;
    moves  = [];
    dir    = DIR.LEFT;
    head   = tail = { x: 30, y: 10 };
    length = 1;
    growth = 10;
    while(--growth)
      increase();
    food = unoccupied();
  };

  function update(idt) {
    if (playing) {
      dt = dt + idt;
      if (dt > dstep) {
        dt = dt - dstep;
        increase(moves.shift());
        decrease();

        if (snakeOccupies(head, true)) {
          lose();
        }
        else if (foodOccupies(head)) {
          growth += 10;
          food = unoccupied();
        }
      }
    }
  };

  function draw(ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = playing ? 1.0 : 0.5;
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * dx, food.y * dy, dx, dy);
    ctx.fillStyle = 'green';
    ctx.fillRect(head.x * dx, head.y * dy, dx, dy);
    var segment = head, n = 0;
    while(segment = segment.next) {
      ctx.fillStyle = brighten('#22FF32', 80 * n++ / length);
      ctx.fillRect(segment.x * dx + 1, segment.y * dy + 1, dx - 2, dy - 2);
    }
    ctx.fillStyle = 'green';
    ctx.font = 'bold 18pt arial';
    ctx.fillText(length.toString(), 10, 30);
  };

  function brighten(hex, percent) {
    var r = parseInt(hex.substr(1, 2), 16),
        g = parseInt(hex.substr(3, 2), 16),
        b = parseInt(hex.substr(5, 2), 16);
    return '#' +
     ((0|(1<<8) + r + (256-r) * percent/100).toString(16)).substr(1) +
     ((0|(1<<8) + g + (256-g) * percent/100).toString(16)).substr(1) +
     ((0|(1<<8) + b + (256-b) * percent/100).toString(16)).substr(1);
  };

  function push(segment) {
    length++;
    if (head) {
      head.prev = segment;
      segment.next = head;
    }
    head = segment;
  };

  function pop() {
    length--;
    if (tail.prev) {
      tail = tail.prev;
      tail.next = null;
    }
  };

  function increase(changeDir) {
    dir  = (typeof changeDir != 'undefined') ? changeDir : dir;
    switch(dir) {
      case DIR.LEFT:  push({x: head.x == 0    ? nx-1 : head.x-1, y: head.y                           }); break;
      case DIR.RIGHT: push({x: head.x == nx-1 ? 0    : head.x+1, y: head.y                           }); break;
      case DIR.UP:    push({x: head.x,                           y: head.y == 0    ? ny-1 : head.y-1 }); break;
      case DIR.DOWN:  push({x: head.x,                           y: head.y == ny-1 ? 0    : head.y+1 }); break;
    }
  };

  function decrease() {
    if (growth)
      growth--;
    else
      pop();
  };

  function move(where) {
    var previous = moves.length ? moves[moves.length-1] : dir;
    if ((where != previous) && (where != DIR.OPPOSITE[previous]))
      moves.push(where);
  };

  function onkeydown(ev) {
    var handled = false;
    if (playing) {
      switch(ev.keyCode) {
        case KEY.LEFT:   move(DIR.LEFT);  handled = true; break;
        case KEY.RIGHT:  move(DIR.RIGHT); handled = true; break;
        case KEY.UP:     move(DIR.UP);    handled = true; break;
        case KEY.DOWN:   move(DIR.DOWN);  handled = true; break;
        case KEY.ESC:    lose();          handled = true; break;
        case KEY.SPACE:                   handled = true; break;
      }
    }
    else if (ev.keyCode == KEY.SPACE) {
      play();
      handled = true;
    }
    if (handled)
      ev.preventDefault(); // prevent arrow keys from scrolling the page - supported in IE9+ and all other w3c compliant browsers
  };

  function foodOccupies(pos) {
    return occupies(food, pos);
  };

  function snakeOccupies(pos, ignoreHead) {
    var segment = ignoreHead ? head.next : head;
    do {
      if (occupies(segment, pos))
        return true;
    } while (segment = segment.next);
    return false;
  };

  function unoccupied() {
    var pos = {};
    do {
      pos.x = Math.round(random(0, nx-1));
      pos.y = Math.round(random(0, ny-1));
    } while (foodOccupies(pos) || snakeOccupies(pos));
    return pos;
  };

  function occupies(a, b)   { return a && b && (a.x == b.x) && (a.y == b.y); };
  function timestamp()      { return new Date().getTime();                   };
  function random(min, max) { return (min + (Math.random() * (max - min)));  };

  stats.domElement.id = 'stats';
  canvas.parentNode.appendChild(stats.domElement);
  document.addEventListener('keydown', onkeydown, false);

  var start, last = timestamp();
  function frame() {
    stats.update();
    start = timestamp();
    update((start - last) / 1000.0);
    draw(ctx);
    last = start;
    setTimeout(frame, 1);
  }

  reset();
  frame();

