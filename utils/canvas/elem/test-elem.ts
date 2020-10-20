import { Elem2D, Elem2dOptions } from '.';

export type TestElemOptions = Omit<
  Elem2dOptions,
  'width' | 'height' | 'centerX' | 'centerY'
>;

export class TestElem extends Elem2D {
  constructor(ctx: CanvasRenderingContext2D, options: TestElemOptions) {
    super(ctx, {
      ...options,
      width: 100,
      height: 100,
      centerX: 50,
      centerY: 50,
    });
  }

  protected drawElem(): void {
    // tslint:disable: no-magic-numbers
    const { ctx } = this;
    const DIV = 5;
    const dh = 360 / (DIV * DIV + 1);
    const width = this.width / DIV;
    const height = this.height / DIV;

    let hue = 0;
    for (let j = 0; j < DIV; j++) {
      const y = height * j;
      for (let i = 0; i < DIV; i++) {
        const x = width * i;
        ctx.fillStyle = `hsl(${hue}deg, 100%, 50%)`;
        ctx.fillRect(x, y, width, height);
        hue += dh;
      }
    }

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText('test-elem', 21, 14);
    ctx.fillText('test-elem', 21, 14);
  }
}
