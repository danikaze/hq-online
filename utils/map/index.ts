// tslint:disable: no-any no-magic-numbers
import { Point2dElem } from '@utils/canvas/elem/point2d-elem';
import { TestElem } from '@utils/canvas/elem/test-elem';
import { TransformDecoratorElem } from '@utils/canvas/elem/transform-decorator';
import { InfinityGrid } from '@utils/canvas/infinity-grid';
import { Viewport2D } from '@utils/canvas/viewport-2d';
import { getLogger } from '@utils/logger';

const logger = getLogger('map test');
let viewport: Viewport2D;
let testElem: TestElem;
let transformDecorator: TransformDecoratorElem;
let grid: InfinityGrid;

export function initMap(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void {
  logger.info('initMap');

  if (!canvas || !ctx) return;

  viewport = new Viewport2D(canvas, {
    minZoom: 0.5,
    maxZoom: 10,
  });
  viewport.center(0, 0);
  viewport.setAngle(0);
  viewport.setZoom(2);
  viewport.applyTransform();

  grid = new InfinityGrid(viewport);

  testElem = new TestElem(ctx, { x: 50, y: 50, angle: 45, alpha: 1.0 });
  transformDecorator = new TransformDecoratorElem(ctx, testElem);

  (window as any).ctx = ctx;
  (window as any).viewport = viewport;
  (window as any).testElem = testElem;
  (window as any).transformDecorator = transformDecorator;
  (window as any).draw = draw;

  canvas.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeyDown);

  draw();
}

export function resizeMap(width: number, height: number): void {
  logger.info(`resizeMap to ${width}x${height}`);
  viewport.resize(width, height);
  draw();
}

export function clearMap(canvas: HTMLCanvasElement): void {
  canvas.removeEventListener('click', onClick);
  document.removeEventListener('keydown', onKeyDown);
}

function onKeyDown(ev: KeyboardEvent): void {
  const MOVE_SPEED = 25;
  const ZOOM_SPEED = 0.5;
  const ROTATION_SPEED = 15;
  let change = false;
  const key = ev.key.toLowerCase();

  if (key === 'r') {
    viewport.reset();
    change = true;
  } else if (key === '2') {
    viewport.increaseZoom(ZOOM_SPEED);
    change = true;
  } else if (key === '1') {
    viewport.increaseZoom(-ZOOM_SPEED);
    change = true;
  } else if (key === 'q') {
    viewport.rotate(-ROTATION_SPEED);
    change = true;
  } else if (key === 'e') {
    viewport.rotate(ROTATION_SPEED);
    change = true;
  } else if (key === 'z') {
    testElem.rotate(-ROTATION_SPEED);
    change = true;
  } else if (key === 'x') {
    testElem.rotate(ROTATION_SPEED);
    change = true;
  } else if (key === 's') {
    viewport.moveCenter(0, MOVE_SPEED);
    change = true;
  } else if (key === 'w') {
    viewport.moveCenter(0, -MOVE_SPEED);
    change = true;
  } else if (key === 'a') {
    viewport.moveCenter(-MOVE_SPEED, 0);
    change = true;
  } else if (key === 'd') {
    viewport.moveCenter(MOVE_SPEED, 0);
    change = true;
  } else if (key === 'p') {
    change = true;
  }

  if (change) {
    draw();
  }
}

function onClick(ev: MouseEvent): void {
  const { ctx } = viewport;
  const { x, y } = viewport.getWorldPoint(ev.clientX, ev.clientY);
  const canvasPoint = viewport.getCanvasPoint(x, y);
  const isInside = testElem.isCanvasPointInside(canvasPoint.x, canvasPoint.y);

  logger.debug(
    `[${isInside ? 'in' : 'out'}] canvas(${ev.clientX}, ${
      ev.clientY
    }) => world(${x.toFixed(2)}, ${y.toFixed(2)}) => canvas(${canvasPoint.x}, ${
      canvasPoint.y
    })`
  );
  const point = new Point2dElem(ctx, {
    x,
    y,
    style: {
      fillStyle: isInside ? 'red' : 'yellow',
      strokeStyle: isInside ? '#550000' : 'black',
    },
  });
  point.draw();

  drawCanvasPoint(canvasPoint.x, canvasPoint.y);
}

function drawCanvasPoint(canvasX: number, canvasY: number): void {
  const { ctx } = viewport;
  const tr = ctx.getTransform();
  ctx.resetTransform();
  ctx.beginPath();
  ctx.arc(canvasX, canvasY, 5, 0, 360);
  ctx.closePath();
  ctx.strokeStyle = 'cyan';
  ctx.stroke();
  ctx.setTransform(tr);
}

function draw(outline?: boolean) {
  viewport.clear();
  grid.draw();
  testElem.draw(outline);
  transformDecorator.draw();
}

if (!IS_SERVER) {
  (window as any).initMap = initMap;
  (window as any).resizeMap = resizeMap;
  (window as any).clearMap = clearMap;
}
