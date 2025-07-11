const particles = [];

const soundDrop = new Audio('sounds/drop.mp3');
const soundRotate = new Audio('sounds/rotate.mp3');
const soundClear = new Audio('sounds/clear.mp3');

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

// プレイフィールド生成
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// テトリミノ定義
function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ];
  } else if (type === 'O') {
    return [
      [2, 2],
      [2, 2],
    ];
  } else if (type === 'L') {
    return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ];
  } else if (type === 'J') {
    return [
      [4, 0, 0],
      [4, 4, 4],
      [0, 0, 0],
    ];
  } else if (type === 'I') {
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

const colors = [
  null,
  '#00ff66', // 明るいネオングリーン
  '#00dd55',
  '#00bb44',
  '#009933',
  '#007722',
  '#005511',
  '#003300'  // 最も暗い
];


// 衝突判定
function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (
        m[y][x] !== 0 &&
        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

// ブロックを固定
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

// ライン消去
function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCount * 10;
    rowCount *= 2;
	  soundClear.play();
  }
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    // ラインクリア前にエフェクト生成
    createClearParticles(y);
    
    // 既存の処理：行を消去・上に追加
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCount * 10;
    rowCount *= 2;
    soundClear.play();
  }
}

function createClearParticles(yCleared) {
  // クリアされた行y座標
  // arena[yCleared] の各セルについて生成
  const row = arena[yCleared];
  row.forEach((value, x) => {
    if (value !== 0) {
      // 各セルに対しパーティクル生成
      particles.push({
        x: x, // セルのグリッド座標
        y: yCleared,
        color: colors[value],
        dx: (Math.random() - 0.5) * 0.5, // 散らばり具合
        dy: -Math.random() * 0.5,        // 上方向に散らばる
        alpha: 1.0,
      });
    }
  });
}

function updateParticles(deltaTime) {
  // deltaTime（時間差）はミリ秒。エフェクトの時間経過に応じて更新します
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    // 速度に応じて位置を更新
    p.x += p.dx;
    p.y += p.dy;
    // alpha を減衰させる（500msで完全に消えるように）
    p.alpha -= deltaTime / 500;
    if (p.alpha <= 0) {
      particles.splice(i, 1); // 削除
    }
  }
}

function drawParticles() {
  particles.forEach(p => {
    context.globalAlpha = p.alpha;
    context.fillStyle = p.color;
    // ブロックのサイズは1単位なので描画
    context.fillRect(p.x, p.y, 1, 1);
    // 描画後は元の透明度に戻す
    context.globalAlpha = 1.0;
  });
}


function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
	  	context.strokeStyle = '#001100'; // より暗い緑の枠線
		context.lineWidth = 0.05;
		context.strokeRect(x + offset.x, y + offset.y, 1, 1);

      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

// ブロックを回転
function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
  	soundDrop.play();
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    document.getElementById('game-over-screen').style.display = 'flex'; // ← ここだけ表示
    return; // ここで止める
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
	soundRotate.play();
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'ArrowUp') {
    playerRotate(1);
  }
});

const arena = createMatrix(12, 20);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  // パーティクル更新
  updateParticles(deltaTime);

  draw();
  // パーティクル描画（ブロック描画の後に重ねる）
  drawParticles();

  requestAnimationFrame(update);
}
function updateScore() {
  document.getElementById('score').innerText = `SCORE: ${player.score}`;
}



document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('title-screen').style.display = 'none';
	playerReset();
	updateScore();
	update();
 // ゲーム開始
});

document.getElementById('retry-btn').addEventListener('click', () => {
  document.getElementById('game-over-screen').style.display = 'none';
  arena.forEach(row => row.fill(0));
  playerReset();
  updateScore();
  update();
});

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const retryBtn = document.getElementById('retry-btn');

  startBtn.addEventListener('click', () => {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    arena.forEach(row => row.fill(0));
    playerReset();
    updateScore();
    update(); // ← ここで初めてゲーム開始！
  });

  retryBtn.addEventListener('click', () => {
    document.getElementById('game-over-screen').style.display = 'none';
    arena.forEach(row => row.fill(0));
    playerReset();
    updateScore();
    update();
  });
});