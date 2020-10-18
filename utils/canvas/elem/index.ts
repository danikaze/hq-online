import { deg2rad, normalizeAngle } from '@utils/trigonometry';
import clamp from 'clamp';
import { extendObjectsOnly } from 'extend-objects-only';
import { drawShape } from '../draw-shape.ts';
import {
  Centerable,
  Rect2D,
  Rotatable,
  ShapeStyle,
  Transparentable,
  ZSortable,
} from '../interfaces';
import { setCtxStyle } from '../set-ctx-style';

export type Elem2dOptions = Partial<RequiredOptions>;
export type RequiredOptions = Rect2D &
  ZSortable &
  Rotatable &
  Centerable &
  Transparentable & {
    outlineStyle: ShapeStyle;
  };

export abstract class Elem2D {
  public static readonly defaultOptions: RequiredOptions = {
    x: 0,
    y: 0,
    z: 0,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    angle: 0,
    alpha: 1.0,
    outlineStyle: {},
  };

  public static readonly outlineStyle: ShapeStyle = {
    fillStyle: 'white',
    fillAlpha: 0.5,
    strokeStyle: 'red',
    strokeAlpha: 1.0,
    lineWidth: 3.0,
  };

  protected ctx: CanvasRenderingContext2D;
  protected x: number;
  protected y: number;
  protected z: number;
  protected width: number;
  protected height: number;
  protected centerX: number;
  protected centerY: number;
  protected angleDeg: number;
  protected angleRad: number;
  protected alpha: number;
  protected shape: Path2D;
  protected outlineStyle: ShapeStyle;

  private dirty = true;

  constructor(ctx: CanvasRenderingContext2D, options?: Elem2dOptions) {
    this.ctx = ctx;
    const opt = extendObjectsOnly(
      {},
      Elem2D.defaultOptions,
      options
    ) as RequiredOptions;

    this.x = opt.x;
    this.y = opt.y;
    this.z = opt.z;
    this.width = opt.width;
    this.height = opt.height;
    this.centerX = opt.centerX;
    this.centerY = opt.centerY;
    this.angleDeg = opt.angle;
    this.angleRad = 0;
    this.alpha = opt.alpha;
    this.shape = new Path2D();
    this.outlineStyle = opt.outlineStyle
      ? { ...Elem2D.outlineStyle, ...opt.outlineStyle }
      : Elem2D.outlineStyle;

    this.shape.rect(0, 0, this.width, this.height);
  }

  public draw(outline?: boolean): void {
    this.ctx.save();
    this.applyLocalTransform();

    this.drawElem();
    outline && this.drawOutline();

    this.ctx.restore();
  }

  public move(dx: number, dy: number): void {
    this.setPosition(this.x + dx, this.y + dy);
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public rotate(degreesDiff: number): void {
    this.setAngle(this.angleDeg + degreesDiff);
  }

  public setAngle(degrees: number): void {
    let deg = normalizeAngle(degrees);
    if (this.angleDeg === deg) return;

    this.angleDeg = deg;
    this.dirty = true;
  }

  public setAlpha(alpha: number): void {
    this.alpha = clamp(alpha, 0, 1);
  }

  public isCanvasPointInside(x: number, y: number): boolean {
    this.ctx.save();
    this.applyLocalTransform();
    const inside = this.ctx.isPointInPath(this.shape, x, y);
    this.ctx.restore();

    return inside;
  }

  protected drawOutline(): void {
    const { ctx, shape, outlineStyle } = this;

    setCtxStyle(ctx, outlineStyle);
    drawShape(ctx, outlineStyle.fillAlpha!, outlineStyle.strokeAlpha!, shape);
  }

  /**
   * Drawing an specific element should always considers 0,0 as the
   * position of the element
   * Therefor, the implementation of this method doesn't need to
   * use `x`, `y` nor `centerX`, `centerY`
   */
  protected abstract drawElem(): void;

  private applyLocalTransform(): void {
    this.updateValues();
    const { ctx, x, y, centerX, centerY, alpha, angleRad } = this;

    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angleRad);
    ctx.translate(-centerX, -centerY);
  }

  private updateValues(): void {
    if (!this.dirty) return;
    this.dirty = false;
    this.angleRad = deg2rad(this.angleDeg);
  }
}
