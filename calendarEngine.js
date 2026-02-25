const { createCanvas } = require('@napi-rs/canvas');

function generateCalendarImage(year, month, rawEvents) {
  const width = 1400;
  const height = 1050;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bgColor = '#161421';
  const gridColor = '#332c47';
  const titleGold = '#f4d27a';
  const textWhite = '#ffffff';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = titleGold;
  ctx.font = 'bold 60px Sans';
  ctx.textAlign = 'center';
  ctx.fillText('KINGDOM 3558', width / 2, 80);

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  ctx.font = '36px Sans';
  ctx.fillText(`${monthName} ${year}`, width / 2, 130);

  const gridTop = 200;
  const cellWidth = width / 7;
  const cellHeight = 120;
  const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  ctx.font = '26px Sans';
  ctx.fillStyle = textWhite;

  for (let i = 0; i < 7; i++) {
    ctx.fillText(daysOfWeek[i], cellWidth * i + cellWidth / 2, gridTop);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let dayCounter = 1;
  const cellMap = {};

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {

      const x = col * cellWidth;
      const y = gridTop + 40 + row * cellHeight;

      ctx.strokeStyle = gridColor;
      ctx.strokeRect(x, y, cellWidth, cellHeight);

      if (row === 0 && col < firstDay) continue;
      if (dayCounter > daysInMonth) continue;

      cellMap[dayCounter] = { row, col };

      ctx.fillStyle = textWhite;
      ctx.font = '22px Sans';
      ctx.fillText(dayCounter.toString(), x + 10, y + 25);

      dayCounter++;
    }
  }

  rawEvents.forEach(event => {

    let current = new Date(event.start);
    const end = new Date(event.end);

    while (current <= end) {

      if (current.getMonth() !== month || current.getFullYear() !== year) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const startDay = current.getDate();
      const { row, col } = cellMap[startDay];

      let spanEnd = new Date(current);

      while (
        spanEnd <= end &&
        spanEnd.getMonth() === month &&
        spanEnd.getFullYear() === year &&
        cellMap[spanEnd.getDate()].row === row
      ) {
        spanEnd.setDate(spanEnd.getDate() + 1);
      }

      spanEnd.setDate(spanEnd.getDate() - 1);
      const endCol = cellMap[spanEnd.getDate()].col;

      const x = col * cellWidth;
      const y = gridTop + 40 + row * cellHeight;

      const barHeight = 20;
      const barY = y + 35;
      const barWidth = (endCol - col + 1) * cellWidth - 10;

      ctx.fillStyle = event.color || '#5a3ea1';
      ctx.fillRect(x + 5, barY, barWidth, barHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Sans';
      ctx.fillText(event.title.substring(0, 25), x + 10, barY + 14);

      current = new Date(spanEnd);
      current.setDate(current.getDate() + 1);
    }
  });

  return canvas.toBuffer('image/png');
}

module.exports = generateCalendarImage;
