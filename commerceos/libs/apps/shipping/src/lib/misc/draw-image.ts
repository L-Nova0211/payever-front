export function drawText(textMain, canvas, position = { width:254,height:144,textX:127,textY:90 }) {
  const { width,height,textX,textY } = position;
  const quality = 2;
  const context = canvas.nativeElement.getContext('2d');
  canvas.nativeElement.width = width * quality;
  canvas.nativeElement.height =height * quality;
  const gradient = context.createLinearGradient(width / 2  * quality, 0, width / 2  * quality, height * quality);
  gradient.addColorStop(0, '#fe9f04');
  gradient.addColorStop(1, '#fa7421');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 254 * quality, 144 * quality);
  drawFull(context, quality, textMain ,  { x:textX,y:textY });

  return canvas.nativeElement.toDataURL('image/jpg');
}

export function drawFull(context, quality, textMain , position = { x:90,y:127 }) {
  context.font = `${14 * quality}px Roboto`;
  context.textAlign = 'center';
  context.fillStyle = '#ffffff';
  context.font = `bold ${24 * quality}px Roboto`;
  context.fillText(textMain, position.x * quality, position.y * quality);
}
