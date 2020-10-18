import { Elem2D, Elem2dOptions } from '.';
import { ShapeStyle } from '../interfaces';

export interface TestElemOptions
  extends Omit<Elem2dOptions, 'centerX' | 'centerY'> {
  style?: Partial<ShapeStyle>;
}

export class Point2dElem extends Elem2D {
  public static readonly style: ShapeStyle = {
    fillStyle: 'yellow',
    fillAlpha: 1,
    strokeStyle: 'black',
    strokeAlpha: 1,
    lineWidth: 3,
  };

  private readonly style: ShapeStyle;

  constructor(ctx: CanvasRenderingContext2D, options: TestElemOptions) {
    const opt = {
      width: 3,
      height: 3,
      ...options,
    };

    super(ctx, opt);

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.style = opt.style
      ? { ...Point2dElem.style, ...opt.style }
      : Point2dElem.style;
  }

  protected drawElem(): void {
    const { ctx, width, height, style } = this;

    ctx.globalAlpha = style.strokeAlpha;
    ctx.strokeStyle = style.strokeStyle;
    ctx.strokeRect(0, 0, width, height);
    ctx.globalAlpha = style.fillAlpha;
    ctx.fillStyle = style.fillStyle;
    ctx.fillRect(0, 0, width, height);
  }
}
