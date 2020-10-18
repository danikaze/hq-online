/**
 * Draw a rectangle at the given top-left position and with the given size.
 * The style is not modified so it relies on the provided `ctx` context's style
 * but it uses the provided `fillAlpha` and `strokeAlpha` values.
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  fillAlpha: number,
  strokeAlpha: number,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  if (fillAlpha! > 0) {
    ctx.globalAlpha = fillAlpha;
    ctx.fillRect(x, y, width, height);
  }
  if (strokeAlpha! > 0) {
    ctx.globalAlpha = strokeAlpha;
    ctx.strokeRect(x, y, width, height);
  }
}
