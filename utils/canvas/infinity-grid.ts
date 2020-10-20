import { Viewport2D } from './viewport-2d';

interface LineStyle {
  lineWidth: number;
  strokeStyle: string;
  alpha: number;
}

interface LineConfig extends LineStyle {
  each: number;
}

interface Options {
  centerX: number;
  centerY: number;
  mainLines: LineConfig;
  subLines: LineConfig;
}

export class InfinityGrid {
  protected readonly options: Options;
  protected readonly viewport: Viewport2D;
  protected readonly ctx: CanvasRenderingContext2D;

  constructor(viewport: Viewport2D) {
    this.viewport = viewport;
    this.ctx = viewport.ctx;
    this.options = {
      centerX: 0,
      centerY: 0,
      mainLines: {
        each: 100,
        alpha: 0.7,
        lineWidth: 3,
        strokeStyle: '#aaa',
      },
      subLines: {
        each: 25,
        alpha: 0.4,
        lineWidth: 1,
        strokeStyle: '#aaa',
      },
    };
  }

  private static getDivisionPoints(
    center: number,
    first: number,
    last: number,
    each: number,
    filter?: number[]
  ): number[] {
    const points: number[] = [];
    const p0 = center - Math.ceil(Math.abs((first - center) / each)) * each;
    const p1 = center + Math.ceil(Math.abs((last - center) / each)) * each;

    for (let p = p0; p <= p1; p = p + each) {
      if (!filter || !filter.includes(p)) {
        points.push(p);
      }
    }

    return points;
  }

  public draw(): void {
    const { viewport, ctx } = this;
    const { mainLines, subLines, centerX, centerY } = this.options;
    const { top, bottom, left, right } = viewport.getVisibleWorldBounds();
    const mainXs = InfinityGrid.getDivisionPoints(
      centerX,
      left,
      right,
      mainLines.each
    );
    const mainYs = InfinityGrid.getDivisionPoints(
      centerY,
      top,
      bottom,
      mainLines.each
    );
    const subXs = InfinityGrid.getDivisionPoints(
      centerX,
      left,
      right,
      subLines.each,
      mainXs
    );
    const subYs = InfinityGrid.getDivisionPoints(
      centerY,
      top,
      bottom,
      subLines.each,
      mainYs
    );

    const alpha = ctx.globalAlpha;
    this.drawLines(subXs, subYs, subLines);
    this.drawLines(mainXs, mainYs, mainLines);
    ctx.globalAlpha = alpha;
  }

  private drawLines(xs: number[], ys: number[], config: LineConfig): void {
    const { ctx } = this;

    ctx.globalAlpha = config.alpha;
    ctx.lineWidth = config.lineWidth;
    ctx.strokeStyle = config.strokeStyle;

    const x0 = xs[0];
    const x1 = xs[xs.length - 1];
    const y0 = ys[0];
    const y1 = ys[ys.length - 1];

    ctx.beginPath();
    xs.forEach((x) => {
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
    });
    ys.forEach((y) => {
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
    });
    ctx.closePath();

    ctx.stroke();
  }
}
