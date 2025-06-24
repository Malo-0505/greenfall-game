const matrixCanvas = document.getElementById('matrix');
const ctx = matrixCanvas.getContext('2d');

matrixCanvas.width = window.innerWidth;
matrixCanvas.height = window.innerHeight;

const katakana = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ";
const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$%&";
const letters = (katakana + latin).split("");

const fontSize = 16;
const columns = matrixCanvas.width / fontSize;

const drops = Array.from({ length: columns }).fill(1);

function drawMatrixRain() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

  ctx.fillStyle = "#0F0";
  ctx.font = `${fontSize}px monospace`;

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > matrixCanvas.height || Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrixRain, 50);// JavaScript Document