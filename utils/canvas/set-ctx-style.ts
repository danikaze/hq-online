import { CtxStyle } from './interfaces';

export function setCtxStyle<S extends CtxStyle>(
  ctx: CanvasRenderingContext2D,
  style: S
): void {
  if (style.alpha) {
    ctx.globalAlpha = style.alpha;
  }
  if (style.lineCap) {
    ctx.lineCap = style.lineCap;
  }
  if (style.lineDashOffset) {
    ctx.lineDashOffset = style.lineDashOffset;
  }
  if (style.lineJoin) {
    ctx.lineJoin = style.lineJoin;
  }
  if (style.lineWidth) {
    ctx.lineWidth = style.lineWidth;
  }
  if (style.lineDash) {
    ctx.setLineDash(style.lineDash);
  }
  if (style.strokeStyle) {
    ctx.strokeStyle = style.strokeStyle;
  }
  if (style.fillStyle) {
    ctx.fillStyle = style.fillStyle;
  }
}
