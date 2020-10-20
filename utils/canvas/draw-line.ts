/**
 * Draw a line between the given points based on the style previously set
 * on the provided `ctx` context.
 * It uses the provided `alpha` value. If it's 0, it's not drawn at all.
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  alpha: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): void {
  if (alpha === 0) return;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.stroke();
}
