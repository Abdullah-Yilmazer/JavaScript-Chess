const canvas = document.querySelector("canvas");
const ELEMENT_ul = document.querySelector("ul");
const ctx = canvas.getContext("2d");
BLOCK_SİZE = 100;
BLOCK_FONT_SIZE = 32;
BLACK_BLOK_COLOR = "#333";
WHITE_BLOK_COLOR = "#DDD";
SELECTED_BLOCK_COLOR = "#9A0";
SELECTED_BLOCK_TEXT_COLOR = "#ddd";
NOTION_WIDTH = BLOCK_SİZE / 2; // Notasyon genişliği
NOTION_FONT_SIZE = 24;
canvas.width = BLOCK_SİZE * 8 + NOTION_WIDTH * 2; // Kenar boşlukları eklendi
canvas.height = BLOCK_SİZE * 8 + NOTION_WIDTH * 2; // Kenar boşlukları eklendi
// var board = [
//   ["", "", "", "", "k", "", "", ""],
//   ["", "P", "Q", "R", "", "", "R", ""],
//   ["", "", "", "", "", "", "", ""],
//   ["", "", "", "", "", "", "", ""],
//   ["", "", "", "", "", "", "", ""],
//   ["", "", "", "", "", "", "", ""],
//   ["", "", "", "", "", "", "", ""],
//   ["", "", "", "", "K", "", "", ""],
// ];
var board = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];
var placesToGo = [
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
];
var notationSheet = [];
var boardLatters = ["a", "b", "c", "d", "e", "f", "g", "h"];
let enPassantTarget = null; // En passant hedef karesini tutar
let gameState = {
  hasWhiteMovedKing: false,
  hasWhiteMovedLeftRook: false,
  hasWhiteMovedRightRook: false,
  hasBlackMovedKing: false,
  hasBlackMovedLeftRook: false,
  hasBlackMovedRightRook: false,
}; // rok hareketlerini takip eder
var turn = 1; // -1 black // 1 white
const pieceImages = {}; // Resimleri saklamak için bir nesne
var selectedBlock = [null, null];
let currentMessageBox = null;

function resetGame() {
  board = [
    // Başlangıç tahtasını yeniden oluştur
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];
  gameState = {
    // Oyun durumunu sıfırla
    hasWhiteMovedKing: false,
    hasWhiteMovedLeftRook: false,
    hasWhiteMovedRightRook: false,
    hasBlackMovedKing: false,
    hasBlackMovedLeftRook: false,
    hasBlackMovedRightRook: false,
  };
  turn = 1; // Beyazın sırası
  selectedBlock = [null, null];
  resetToGo();
  enPassantTarget = null;
  notationSheet = [];
  currentMessageBox = null; // Mesaj kutusunu da sıfırla!
  updateNotationSheetDisplay();
}

function drawMessageBox(message, buttons = []) {
  const boxWidth = 300;
  const boxHeight = 200;
  const x = canvas.width / 2 - boxWidth / 2;
  const y = canvas.height / 2 - boxHeight / 2;

  // Arka plan
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(x, y, boxWidth, boxHeight);

  // Çerçeve
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, boxWidth, boxHeight);

  // Metin
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = message.split("\n");
  let textY = y + boxHeight / 2 - (lines.length - 1) * 15;
  for (const line of lines) {
    ctx.fillText(line, canvas.width / 2, textY);
    textY += 30;
  }

  // Butonlar (Resim ve Yazı Desteği)
  const buttonWidth = 60;
  const buttonHeight = 60;
  const buttonSpacing = 10;
  let buttonX = canvas.width / 2 - (buttons.length * (buttonWidth + buttonSpacing) - buttonSpacing) / 2;
  const buttonY = y + boxHeight - buttonHeight - 20;

  for (const button of buttons) {
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    if (button.image) {
      const img = new Image();
      img.src = button.image;
      // img.onload = () => {
      ctx.drawImage(img, buttonX, buttonY, buttonWidth, buttonHeight);
      // };
    }

    if (button.text) {
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(button.text, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    }

    button.x = buttonX;
    button.y = buttonY;
    button.width = buttonWidth;
    button.height = buttonHeight;

    buttonX += buttonWidth + buttonSpacing;
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function showPromotionBox(isWhite, x, y) {
  const color = isWhite ? "white" : "black";
  currentMessageBox = {
    message: "Piyonu Terfi Ettir:",
    buttons: [
      { image: `pieces/${color}/Queen.svg`, piece: "Q", onClick: () => promotePawn(x, y, isWhite, "Q") },
      { image: `pieces/${color}/Rook.svg`, piece: "R", onClick: () => promotePawn(x, y, isWhite, "R") },
      { image: `pieces/${color}/Bishop.svg`, piece: "B", onClick: () => promotePawn(x, y, isWhite, "B") },
      { image: `pieces/${color}/Knight.svg`, piece: "N", onClick: () => promotePawn(x, y, isWhite, "N") },
    ],
  };
  updateBoard();
}

function promotePawn(x, y, isWhite, piece) {
  board[y][x] = isWhite ? piece.toUpperCase() : piece.toLowerCase();
  currentMessageBox = null; // Mesaj kutusunu kapat
  updateBoard();
  if (isCheckmate(turn === 1)) {
    currentMessageBox = {
      message: turn === 1 ? "Beyaz Şah Mat! Siyah Kazandı!" : "Siyah Şah Mat! Beyaz Kazandı!",
      buttons: [
        {
          text: "Yeniden Başlat",
          onClick: () => {
            resetGame();
            updateBoard();
          },
        },
      ],
    };
  } else if (isStalemate(turn === 1)) {
    currentMessageBox = {
      message: "Pat! Berabere!",
      buttons: [
        {
          text: "Yeniden Başlat",
          onClick: () => {
            resetGame();
            updateBoard();
          },
        },
      ],
    };
  }
  updateBoard();
}

function updateNotationSheetDisplay() {
  const ulElement = document.querySelector("nav ul");
  ulElement.innerHTML = ""; // Önceki notasyonları temizle

  notationSheet.forEach((notation) => {
    const liElement = document.createElement("li");
    liElement.textContent = notation;
    ulElement.appendChild(liElement);
  });
}

function upperOrLower(word) {
  return word === word.toUpperCase();
}

function isOpponentPiece(x, y, target_x, target_y) {
  if (!isOnPlace(target_x, target_y)) {
    return false;
  }
  if (board[target_y][target_x] === "") {
    return false;
  }
  // Assuming lowercase letters are black pieces and uppercase letters are white pieces
  if (upperOrLower(board[y][x]) !== upperOrLower(board[target_y][target_x])) {
    return true;
  }
  return false;
}

function resetToGo() {
  placesToGo.forEach((row) => row.fill(false));
}

function isOnPlace(x, y) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function isOwnPiece(startX, startY, targetX, targetY) {
  const pieceAtStart = board[startY][startX];
  const pieceAtTarget = board[targetY][targetX];
  // console.log(startX, startY, targetX, targetY, pieceAtStart, pieceAtTarget);
  if (pieceAtTarget === "") {
    return false;
  } else if (!isOpponentPiece(startX, startY, targetX, targetY)) {
    return true;
  }
  return false;
}

function isUnderAttack(location, isWhite, tempBoard = board) {
  if (!Array.isArray(location) || location.length !== 2) {
    throw new Error("Invalid location format : " + location);
  }

  let y = location[0];
  let x = location[1];

  if (!isOnPlace(x, y)) {
    throw new Error("Location out of bounds : " + location);
  }

  const opponent = isWhite ? "lower" : "upper"; // Rakip taşların durumu (küçük/büyük harf)

  // Dikey ve yatay tehdit kontrolü (Kale ve Vezir)
  const directionsHV = [
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
  ];
  for (const dir of directionsHV) {
    let cx = x + dir.dx;
    let cy = y + dir.dy;
    while (isOnPlace(cx, cy)) {
      const piece = tempBoard[cy][cx];
      if (piece !== "") {
        if ((opponent === "lower" && (piece === "r" || piece === "q")) || (opponent === "upper" && (piece === "R" || piece === "Q"))) {
          return true;
        }
        break; // Başka bir taş varsa bu yöndeki kontrolü durdur
      }
      cx += dir.dx;
      cy += dir.dy;
    }
  }

  // Çapraz tehdit kontrolü (Fil ve Vezir)
  const directionsDiagonal = [
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
  ];
  for (const dir of directionsDiagonal) {
    let cx = x + dir.dx;
    let cy = y + dir.dy;
    while (isOnPlace(cx, cy)) {
      const piece = tempBoard[cy][cx];
      if (piece !== "") {
        if ((opponent === "lower" && (piece === "b" || piece === "q")) || (opponent === "upper" && (piece === "B" || piece === "Q"))) {
          return true;
        }
        break; // Başka bir taş varsa bu yöndeki kontrolü durdur
      }
      cx += dir.dx;
      cy += dir.dy;
    }
  }

  // At tehdit kontrolü
  const knightMoves = [
    { dx: 1, dy: 2 },
    { dx: 2, dy: 1 },
    { dx: -1, dy: 2 },
    { dx: -2, dy: 1 },
    { dx: 1, dy: -2 },
    { dx: 2, dy: -1 },
    { dx: -1, dy: -2 },
    { dx: -2, dy: -1 },
  ];
  for (const move of knightMoves) {
    let cx = x + move.dx;
    let cy = y + move.dy;
    if (isOnPlace(cx, cy)) {
      const piece = tempBoard[cy][cx];
      if ((opponent === "lower" && piece === "n") || (opponent === "upper" && piece === "N")) {
        return true;
      }
    }
  }

  // Piyon tehdit kontrolü
  const pawnAttackDirections = isWhite
    ? [
        { dx: -1, dy: -1 },
        { dx: 1, dy: -1 },
      ]
    : [
        { dx: -1, dy: 1 },
        { dx: 1, dy: 1 },
      ];
  for (const attackDir of pawnAttackDirections) {
    let attackerX = x + attackDir.dx;
    let attackerY = y + attackDir.dy;
    if (isOnPlace(attackerX, attackerY)) {
      const piece = tempBoard[attackerY][attackerX];
      if ((opponent === "lower" && piece === "p") || (opponent === "upper" && piece === "P")) {
        return true;
      }
    }
  }

  // Şah tehdit kontrolü (Önceki kod ile aynı)
  const kingMoves = [
    { dx: -1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
  ];
  for (const move of kingMoves) {
    let kx = x + move.dx;
    let ky = y + move.dy;
    if (isOnPlace(kx, ky)) {
      const piece = tempBoard[ky][kx];
      if ((opponent === "lower" && piece === "k") || (opponent === "upper" && piece === "K")) {
        return true;
      }
    }
  }

  return false;
}

function findPiece(piece, tempBoard = board) {
  let rowIndex = tempBoard.findIndex((row) => row.includes(piece));
  if (rowIndex !== -1) {
    let cellIndex = tempBoard[rowIndex].indexOf(piece);
    return [rowIndex, cellIndex];
  } else {
    console.log("Taş bulunamadı.");
  }
}

function isCheckmate(isWhite) {
  const kingLocation = findPiece(isWhite ? "K" : "k");
  if (!kingLocation) {
    return false; // Şah yoksa mat da yoktur
  }

  const [kingY, kingX] = kingLocation;

  if (!isUnderAttack([kingY, kingX], isWhite)) {
    return false; // Şah çekilmiyorsa mat da yoktur
  }

  // Şah çekiliyorsa, TÜM olası hamleleri KONTROL ET
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece !== "" && upperOrLower(piece) === isWhite) {
        const legalMoves = findLegalMovesForPiece(x, y);

        for (const move of legalMoves) {
          const tempBoard = board.map((row) => [...row]);
          tempBoard[y][x] = "";
          tempBoard[move[0]][move[1]] = piece;

          const tempKingLocation = findPiece(isWhite ? "K" : "k", tempBoard);

          if (!isUnderAttack(tempKingLocation, isWhite, tempBoard)) {
            return false; // Şah kurtulabiliyorsa mat yoktur
          }
        }
      }
    }
  }

  return true; // Şah çekiliyor VE hiçbir yasal hamle yoksa mat vardır
}

function isStalemate(isWhite) {
  const kingLocation = findPiece(isWhite ? "K" : "k");
  if (!kingLocation) {
    return false; // Şah yoksa pat da yoktur (normalde olmamalı)
  }

  const [kingY, kingX] = kingLocation;

  if (isUnderAttack([kingY, kingX], isWhite)) {
    return false; // Şah çekiliyorsa pat değildir
  }

  // Sıradaki oyuncunun hiç yasal hamlesi var mı kontrol et
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece !== "" && upperOrLower(piece) === isWhite) {
        const legalMoves = findLegalMovesForPiece(x, y);
        if (legalMoves.length > 0) {
          return false; // En az bir yasal hamle varsa pat değildir
        }
      }
    }
  }

  return true; // Hiç yasal hamle yoksa VE şah çekilmiyorsa, pat vardır
}

function findLegalMovesForPiece(startX, startY) {
  const piece = board[startY][startX];
  const isWhite = upperOrLower(piece);
  const kingLocation = findPiece(isWhite ? "K" : "k");

  if (!kingLocation) {
    console.error("Şah bulunamadı!");
    return [];
  }

  const [kingY, kingX] = kingLocation;
  const isKingInCheck = isUnderAttack([kingY, kingX], isWhite);
  const legalMoves = [];
  if (piece.toUpperCase() === "K") {
    King(piece, startX, startY, legalMoves);

    // Şah hareketleri için de geçici tahta kontrolü EKLEYİN
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (placesToGo[y][x]) {
          const tempBoard = board.map((row) => [...row]);
          tempBoard[startY][startX] = "";
          tempBoard[y][x] = piece;
          if (!isUnderAttack([y, x], isWhite, tempBoard)) {
            // Şahın yeni konumu kontrol ediliyor
            legalMoves.push([y, x]);
          }
        }
      }
    }
  } else {
    movePiece(startX, startY, piece);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (placesToGo[y][x]) {
          const tempBoard = board.map((row) => [...row]);
          const tempPiece = tempBoard[startY][startX];
          tempBoard[startY][startX] = "";
          tempBoard[y][x] = tempPiece;

          if (!isUnderAttack(findPiece(isWhite ? "K" : "k", tempBoard), isWhite, tempBoard)) {
            // GEÇİCİ TAHTA KULLANILIYOR
            legalMoves.push([y, x]);
          }
        }
      }
    }
  }
  resetToGo();
  return legalMoves;
}

function loadPieceImages() {
  const pieces = ["K", "Q", "B", "N", "R", "P", "k", "q", "b", "n", "r", "p"];
  const colors = ["white", "black"];

  for (const color of colors) {
    for (const piece of pieces) {
      if (upperOrLower(piece) ? color === "black" : color === "white") continue;
      const pieceName = {
        K: "King",
        Q: "Queen",
        B: "Bishop",
        N: "Knight",
        R: "Rook",
        P: "Pawn",
        k: "King",
        q: "Queen",
        b: "Bishop",
        n: "Knight",
        r: "Rook",
        p: "Pawn",
      }[piece];
      const img = new Image();
      img.src = `pieces/${color}/${pieceName}.svg`;
      pieceImages[piece] = img; // Resmi nesnede sakla

      img.onload = () => {
        // Tüm resimler yüklendiğinde tahtayı çiz
        if (Object.keys(pieceImages).length === 12) {
          updateBoard();
        }
      };
      img.onerror = () => {
        console.error(`SVG yüklenirken hata: pieces/${color}/${pieceName}.svg`);
      };
    }
  }
}
loadPieceImages();

function drawPiece(piece, x, y) {
  const img = pieceImages[piece]; // Yüklenmiş resmi kullan
  if (img) {
    ctx.drawImage(img, x, y, BLOCK_SİZE, BLOCK_SİZE);
  }
}

function drawNotation() {
  const notionWidthHalf = NOTION_WIDTH / 2;
  const blockWidthHalf = BLOCK_SİZE / 2;
  ctx.font = NOTION_FONT_SIZE + "px Arial";

  // Satır numaraları (sağ ve sol)
  for (let i = 0; i < 8; i++) {
    const y = i * BLOCK_SİZE + NOTION_WIDTH;
    ctx.fillStyle = i % 2 === 1 ? WHITE_BLOK_COLOR : BLACK_BLOK_COLOR;
    ctx.fillRect(0, y, NOTION_WIDTH, BLOCK_SİZE);
    ctx.fillStyle = i % 2 === 0 ? WHITE_BLOK_COLOR : BLACK_BLOK_COLOR;
    ctx.fillRect(canvas.width - NOTION_WIDTH, y, NOTION_WIDTH, BLOCK_SİZE);
    ctx.fillStyle = i % 2 === 0 ? WHITE_BLOK_COLOR : BLACK_BLOK_COLOR;
    ctx.fillText(8 - i, notionWidthHalf - NOTION_FONT_SIZE / 2, y + blockWidthHalf - NOTION_FONT_SIZE / 2);
    ctx.fillStyle = i % 2 === 1 ? WHITE_BLOK_COLOR : BLACK_BLOK_COLOR;
    ctx.fillText(8 - i, canvas.width - notionWidthHalf - NOTION_FONT_SIZE / 2, y + blockWidthHalf - NOTION_FONT_SIZE / 2);
  }

  // Sütun harfleri (alt ve üst)
  for (let j = 0; j < 8; j++) {
    const x = j * BLOCK_SİZE + NOTION_WIDTH;
    ctx.fillStyle = j % 2 === 1 ? WHITE_BLOK_COLOR : BLACK_BLOK_COLOR;
    ctx.fillRect(x, 0, BLOCK_SİZE, NOTION_WIDTH);
    ctx.fillStyle = j % 2 === 0 ? WHITE_BLOK_COLOR : BLACK_BLOK_COLOR;
    ctx.fillRect(x, canvas.height - NOTION_WIDTH, BLOCK_SİZE, NOTION_WIDTH);
    ctx.fillStyle = j % 2 === 0 ? WHITE_BLOK_COLOR : BLACK_BLOK_COLOR;
    ctx.fillText(boardLatters[j], x + blockWidthHalf - NOTION_FONT_SIZE / 2, notionWidthHalf + NOTION_FONT_SIZE / 2);
    ctx.fillStyle = j % 2 === 1 ? WHITE_BLOK_COLOR : BLACK_BLOK_COLOR;
    ctx.fillText(boardLatters[j], x + blockWidthHalf - NOTION_FONT_SIZE / 2, canvas.height - notionWidthHalf + NOTION_FONT_SIZE / 2);
  }
}

function drawBoard() {
  for (let row = 0; row < 8; row++) {
    let isDarkSquare = row % 2 === 1;
    for (let col = 0; col < 8; col++) {
      const x = col * BLOCK_SİZE + NOTION_WIDTH;
      const y = row * BLOCK_SİZE + NOTION_WIDTH;
      ctx.globalAlpha = 1;
      ctx.fillStyle = isDarkSquare ? BLACK_BLOK_COLOR : WHITE_BLOK_COLOR;
      ctx.fillRect(x, y, BLOCK_SİZE, BLOCK_SİZE);

      const piece = board[row][col];
      if (piece) {
        drawPiece(piece, x, y);
      }

      if (placesToGo[row][col]) {
        ctx.fillStyle = SELECTED_BLOCK_COLOR;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, y, BLOCK_SİZE, BLOCK_SİZE);
      }
      isDarkSquare = !isDarkSquare;
    }
  }
}

function updateBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Temizle
  drawNotation();
  drawBoard();
  if (currentMessageBox) {
    drawMessageBox(currentMessageBox.message, currentMessageBox.buttons);
  }
}

canvas.addEventListener("click", (target) => {
  const clickX = event.offsetX;
  const clickY = event.offsetY;
  if (currentMessageBox) {
    for (const button of currentMessageBox.buttons) {
      if (clickX >= button.x && clickX <= button.x + button.width && clickY >= button.y && clickY <= button.y + button.height) {
        button.onClick();
        currentMessageBox = null;
        updateBoard();
        return;
      }
    }
    return;
  }

  let target_x = target.offsetX - NOTION_WIDTH;
  let target_y = target.offsetY - NOTION_WIDTH;
  board.forEach((col, i) => {
    col.forEach((block, j) => {
      let block_x = j * BLOCK_SİZE;
      let block_y = i * BLOCK_SİZE;
      let selectedBlock_x = selectedBlock[0];
      let selectedBlock_y = selectedBlock[1];
      if (target_x > block_x && target_x < block_x + BLOCK_SİZE && target_y > block_y && target_y < block_y + BLOCK_SİZE) {
        if (selectedBlock_x == i && selectedBlock_y == j) {
          // seçilen taşa tıklandığında
          selectedBlock = [null, null];
          resetToGo();
        } else if (placesToGo[i][j]) {
          // hareket edilebilen bir yere tıklandığında
          let isWhitePiece = upperOrLower(board[selectedBlock_x][selectedBlock_y]);
          let piece = board[selectedBlock_x][selectedBlock_y].toLowerCase();
          let notation = "";
          const targetPiece = board[i][j];
          const captureSymbol = targetPiece !== "" ? "x" : "";

          // En passant kontrolü ve notasyonu
          if (enPassantTarget && i === enPassantTarget[0] && j === enPassantTarget[1]) {
            notation = `${boardLatters[selectedBlock_y]}${8 - selectedBlock_x}x${boardLatters[j]}${8 - i} e.p.`; // En passant notasyonu
          } else {
            //Normal hareket notasyonu
            notation = `${piece === "p" ? "" : board[selectedBlock_x][selectedBlock_y]}${captureSymbol}${boardLatters[j]}${8 - i}`;
          }

          notationSheet.push(notation);
          updateNotationSheetDisplay();

          // Rok hareketlerini işle
          if (piece === "k" && Math.abs(j - selectedBlock_y) === 2) {
            const rookStart = j === 6 ? 7 : 0;
            const rookEnd = j === 6 ? 5 : 3;
            board[i][rookEnd] = board[i][rookStart];
            board[i][rookStart] = "";
            if (j === 6) gameState.hasWhiteMovedRightRook = true;
            else gameState.hasWhiteMovedLeftRook = true;
          }
          if (piece === "K" && Math.abs(j - selectedBlock_y) === 2) {
            const rookStart = j === 6 ? 7 : 0;
            const rookEnd = j === 6 ? 5 : 3;
            board[i][rookEnd] = board[i][rookStart];
            board[i][rookStart] = "";
            if (j === 6) gameState.hasBlackMovedRightRook = true;
            else gameState.hasBlackMovedLeftRook = true;
          }

          // En passant hamlesi kontrolü ve taşı kaldırma
          if (enPassantTarget && i === enPassantTarget[0] && j === enPassantTarget[1]) {
            board[selectedBlock_x][j] = ""; // Atılan piyonu kaldır
          }

          // console.log("move");
          board[i][j] = board[selectedBlock_x][selectedBlock_y];
          board[selectedBlock_x][selectedBlock_y] = "";
          resetToGo();
          turn = -turn;
          turn === -1 ? console.log("Siyah") : console.log("Beyaz");
          if ((board[i][j] === "P" && i === 0) || (board[i][j] === "p" && i === 7)) {
            showPromotionBox(upperOrLower(board[i][j]), j, i);
            return;
          } else if(isCheckmate(turn === 1) || isStalemate(turn === 1)) {
            if (isCheckmate(turn === 1)) {
              currentMessageBox = {
                message: turn === 1 ? "Beyaz Şah Mat! Siyah Kazandı!" : "Siyah Şah Mat! Beyaz Kazandı!",
                buttons: [
                  {
                    text: "Yeniden Başlat",
                    onClick: () => {
                      resetGame();
                      updateBoard();
                    },
                  },
                ],
              };
              updateBoard(); // Mesajı göstermek için updateBoard çağırılıyor
              return; // Mat durumunda başka tıklama işlemi yapma
            } else if (isStalemate(turn === 1)) {
              currentMessageBox = {
                message: "Pat! Berabere!",
                buttons: [
                  {
                    text: "Yeniden Başlat",
                    onClick: () => {
                      resetGame();
                      updateBoard();
                    },
                  },
                ],
              };
              updateBoard(); // Mesajı göstermek için updateBoard çağırılıyor
              return; // Pat durumunda başka tıklama işlemi yapma
            }
          }

          if (board[i][j] === "K") gameState.hasWhiteMovedKing = true;
          if (board[i][j] === "R" && selectedBlock_y === 0 && selectedBlock_x === 7) gameState.hasWhiteMovedLeftRook = true;
          if (board[i][j] === "R" && selectedBlock_y === 7 && selectedBlock_x === 7) gameState.hasWhiteMovedRightRook = true;
          if (board[i][j] === "k") gameState.hasBlackMovedKing = true;
          if (board[i][j] === "r" && selectedBlock_y === 0 && selectedBlock_x === 0) gameState.hasBlackMovedLeftRook = true;
          if (board[i][j] === "r" && selectedBlock_y === 7 && selectedBlock_x === 0) gameState.hasBlackMovedRightRook = true;

          // En passant hedef karesini  (SADECE İKİ KARE İLERLEMEDE)
          enPassantTarget = null;
          if (Math.abs(i - selectedBlock_x) === 2) {
            enPassantTarget = [selectedBlock_x + (isWhitePiece ? -1 : +1), j];
          }
        } else if (board[i][j] === "") {
          // boşluğa tıklandığında
          // console.log("nothing");
          // console.log(i, j);
        } else if (board[i][j] !== "") {
          if ((turn == 1 && upperOrLower(board[i][j])) || (turn !== 1 && !upperOrLower(board[i][j]))) {
            resetToGo();
            selectedBlock = [i, j];
            const legalMoves = findLegalMovesForPiece(j, i);
            if (legalMoves) {
              legalMoves.forEach((move) => (placesToGo[move[0]][move[1]] = true));
            } else {
              movePiece(j, i, block);
            }
          }
        }
        updateBoard();
      }
    });
  });
});

function movePiece(x, y, piece) {
  if (piece === null || piece === undefined) {
    throw new Error("piece is null or undefined");
  }
  const rotate = upperOrLower(piece) ? 1 : -1;
  switch (piece) {
    case "K":
    case "k":
      King(piece, x, y);
      break;
    case "Q":
    case "q":
      Quin(piece, x, y);
      break;
    case "R":
    case "r":
      Rook(piece, x, y);
      break;
    case "N":
    case "n":
      Knight(piece, x, y);
      break;
    case "B":
    case "b":
      Bishop(piece, x, y);
      break;
    case "P":
    case "p":
      Pawns(piece, rotate, x, y);
      break;
    default:
      throw new Error(`Unknown piece: ${piece}`);
  }
}

function Pawns(piece, rotate, x, y) {
  // Pawn's codes
  var pawnMoves;
  if ((rotate === 1 && y === 6) || (rotate === -1 && y === 1)) {
    pawnMoves =
      rotate === 1
        ? [
            { dx: 0, dy: -1 },
            { dx: 0, dy: -2 },
          ]
        : [
            { dx: 0, dy: 1 },
            { dx: 0, dy: 2 },
          ];
  } else {
    pawnMoves = rotate === 1 ? [{ dx: 0, dy: -1 }] : [{ dx: 0, dy: 1 }];
  }
  for (const move of pawnMoves) {
    let target_x = x + move.dx;
    let target_y = y + move.dy;
    if (isOnPlace(target_x, target_y) && board[target_y][target_x] === "") {
      placesToGo[target_y][target_x] = true;
    }
  }

  // Check for diagonal pieces
  let leftDiagonal_x = x - 1;
  let rightDiagonal_x = x + 1;
  let leftDiagonal_y = rotate === 1 ? y - 1 : y + 1;
  let rightDiagonal_y = rotate === 1 ? y - 1 : y + 1;

  if (isOnPlace(leftDiagonal_x, leftDiagonal_y) && isOpponentPiece(x, y, leftDiagonal_x, leftDiagonal_y)) {
    placesToGo[leftDiagonal_y][leftDiagonal_x] = true;
  }

  if (isOnPlace(rightDiagonal_x, rightDiagonal_y) && isOpponentPiece(x, y, rightDiagonal_x, rightDiagonal_y)) {
    placesToGo[rightDiagonal_y][rightDiagonal_x] = true;
  }

  // En passant kontrolü
  if (enPassantTarget) {
    let [targetRow, targetCol] = enPassantTarget;
    if (y === (rotate === 1 ? 3 : 4) && Math.abs(x - targetCol) === 1 && (rotate === 1 ? board[y][x] === "P" : board[y][x] === "p")) {
      placesToGo[targetRow][targetCol] = true;
    }
  }
}

function Bishop(piece, x, y) {
  // Bishop's codes
  const directions = [
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
  ];
  for (const dir of directions) {
    let target_x = x + dir.dx;
    let target_y = y + dir.dy;
    while (isOnPlace(target_x, target_y)) {
      if (!isOwnPiece(x, y, target_x, target_y)) {
        placesToGo[target_y][target_x] = true;
        if (board[target_y][target_x] !== "") {
          break;
        }
      } else {
        break;
      }
      target_x += dir.dx;
      target_y += dir.dy;
    }
  }
}

function Knight(piece, x, y) {
  // Knight's codes
  const knightMoves = [
    { dx: 1, dy: 2 },
    { dx: 1, dy: -2 },
    { dx: -1, dy: 2 },
    { dx: -1, dy: -2 },
    { dx: 2, dy: 1 },
    { dx: 2, dy: -1 },
    { dx: -2, dy: 1 },
    { dx: -2, dy: -1 },
  ];
  for (const move of knightMoves) {
    let target_x = x + move.dx;
    let target_y = y + move.dy;
    if (isOnPlace(target_x, target_y) && !isOwnPiece(x, y, target_x, target_y)) {
      placesToGo[target_y][target_x] = true;
    }
  }
}

function Rook(piece, x, y) {
  // Rook's codes
  // Horizontal moves
  for (let i = x + 1; i < 8 && isOnPlace(i, y) && !isOwnPiece(x, y, i, y); i++) {
    placesToGo[y][i] = true;
    if (board[y][i] !== "") break;
  }

  for (let i = x - 1; i >= 0 && isOnPlace(i, y) && !isOwnPiece(x, y, i, y); i--) {
    placesToGo[y][i] = true;
    if (board[y][i] !== "") break;
  }

  // Vertical moves
  for (let i = y + 1; i < 8 && isOnPlace(x, i) && !isOwnPiece(x, y, x, i); i++) {
    placesToGo[i][x] = true;
    if (board[i][x] !== "") break;
  }

  for (let i = y - 1; i >= 0 && isOnPlace(x, i) && !isOwnPiece(x, y, x, i); i--) {
    placesToGo[i][x] = true;
    if (board[i][x] !== "") break;
  }
}

function King(piece, x, y, legalMoves) {
  // legalMoves parametresini ekledik
  const isWhite = upperOrLower(piece);
  const kingMoves = [
    { dx: -1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
  ];

  for (const move of kingMoves) {
    let target_x = x + move.dx;
    let target_y = y + move.dy;

    if (isOnPlace(target_x, target_y) && !isOwnPiece(x, y, target_x, target_y)) {
      const tempBoard = board.map((row) => [...row]);
      tempBoard[y][x] = "";
      tempBoard[target_y][target_x] = isWhite ? "K" : "k";

      if (!isUnderAttack([target_y, target_x], isWhite, tempBoard)) {
        if (legalMoves) {
          // legalMoves verilmişse oraya ekle
          legalMoves.push([target_y, target_x]);
        } else {
          // verilmemişse placesToGo'yu güncelle (movePiece tarafından çağrıldığında)
          placesToGo[target_y][target_x] = true;
        }
      }
    }
  }

  // Rok kontrolü (Aşağıdaki gibi güncellendi)
  const row = isWhite ? 7 : 0;
  const hasMovedKing = gameState[isWhite ? "hasWhiteMovedKing" : "hasBlackMovedKing"];
  const hasMovedLeftRook = gameState[isWhite ? "hasWhiteMovedLeftRook" : "hasBlackMovedLeftRook"];
  const hasMovedRightRook = gameState[isWhite ? "hasWhiteMovedRightRook" : "hasBlackMovedRightRook"];

  if (!hasMovedKing && !isUnderAttack([y, x], isWhite)) {
    // Şah tehdit altında değilse
    const rookPositions = [
      { col: 0, spaces: [1, 2, 3], placeToGo: 2, hasMovedRook: hasMovedLeftRook },
      { col: 7, spaces: [5, 6], placeToGo: 6, hasMovedRook: hasMovedRightRook },
    ];

    for (const { col, spaces, placeToGo, hasMovedRook } of rookPositions) {
      if (!hasMovedRook && board[row][col] === (isWhite ? "R" : "r") && spaces.every((c) => board[row][c] === "") && !isUnderAttack([y, placeToGo], isWhite)) {
        if (legalMoves) {
          legalMoves.push([y, placeToGo]); // Rok hareketi legalMoves'e ekleniyor
        } else {
          placesToGo[y][placeToGo] = true;
        }
      }
    }
  }
}

function Quin(piece, x, y) {
  // Quin's codes
  for (let i = x + 1; i < 8 && isOnPlace(i, y) && !isOwnPiece(x, y, i, y); i++) {
    placesToGo[y][i] = true;
    if (board[y][i] !== "") break;
  }

  for (let i = x - 1; i >= 0 && isOnPlace(i, y) && !isOwnPiece(x, y, i, y); i--) {
    placesToGo[y][i] = true;
    if (board[y][i] !== "") break;
  }

  // Vertical moves
  for (let i = y + 1; i < 8 && isOnPlace(x, i) && !isOwnPiece(x, y, x, i); i++) {
    placesToGo[i][x] = true;
    if (board[i][x] !== "") break;
  }

  for (let i = y - 1; i >= 0 && isOnPlace(x, i) && !isOwnPiece(x, y, x, i); i--) {
    placesToGo[i][x] = true;
    if (board[i][x] !== "") break;
  }

  // Cross moves
  const directions = [
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
  ];
  for (const dir of directions) {
    let target_x = x + dir.dx;
    let target_y = y + dir.dy;
    while (isOnPlace(target_x, target_y)) {
      if (!isOwnPiece(x, y, target_x, target_y)) {
        placesToGo[target_y][target_x] = true;
        if (board[target_y][target_x] !== "") {
          break;
        }
      } else {
        break;
      }
      target_x += dir.dx;
      target_y += dir.dy;
    }
  }
}

updateBoard();
