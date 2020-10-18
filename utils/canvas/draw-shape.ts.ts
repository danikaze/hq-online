/**
 * Draw a shape on the given `ctx` context.
 * The style is not modified so it uses the current one, but with the provided
 * `fillAlpha` and `strokeAlpha` values.
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  fillAlpha: number,
  strokeAlpha: number,
  shape: Path2D
): void {
  if (fillAlpha! > 0) {
    ctx.globalAlpha = fillAlpha;
    ctx.fill(shape);
  }
  if (strokeAlpha! > 0) {
    ctx.globalAlpha = strokeAlpha;
    ctx.stroke(shape);
  }
}
