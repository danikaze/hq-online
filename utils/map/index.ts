// tslint:disable: no-any no-magic-numbers
import { drawShape } from '@utils/canvas/draw-shape.ts';
import { TestElem } from '@utils/canvas/elem/test-elem';
import { InfinityGrid } from '@utils/canvas/infinity-grid';
import { setCtxStyle } from '@utils/canvas/set-ctx-style';
import { Viewport2D } from '@utils/canvas/viewport-2d';
import { KeyboardInput, KeyInputEvent } from '@utils/input/keyboard';
import {
  MouseInput,
  MouseInputButtonEvent,
  MouseInputDragEvent,
  MouseInputWheelEvent,
} from '@utils/input/mouse';
import { getLogger } from '@utils/logger';

const MOVE_SPEED = 25;
const ZOOM_SPEED = 0.5;
const ROTATION_SPEED = 15;

const logger = getLogger('map test');
let viewport: Viewport2D;
let testElem: TestElem;
let grid: InfinityGrid;
let kbInput: KeyboardInput;
let mouseInput: MouseInput;
let draggingShape: Path2D | undefined;

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

  (window as any).ctx = ctx;
  (window as any).viewport = viewport;
  (window as any).testElem = testElem;
  (window as any).draw = draw;

  kbInput = new KeyboardInput();
  kbInput.on('press', onKeyPress);

  mouseInput = new MouseInput(canvas);
  mouseInput.on('click', onClick);
  mouseInput.on('dragStart', onDrag);
  mouseInput.on('dragMove', onDrag);
  mouseInput.on('dragEnd', onDrag);
  mouseInput.on('wheel', onWheel);

  draw();
}

export function resizeMap(width: number, height: number): void {
  logger.info(`resizeMap to ${width}x${height}`);
  viewport.resize(width, height);
  draw();
}

export function clearMap(canvas: HTMLCanvasElement): void {
  mouseInput.off('click', onClick);
  mouseInput.off('dragStart', onDrag);
  mouseInput.off('dragMove', onDrag);
  mouseInput.off('dragEnd', onDrag);
  mouseInput.off('wheel', onWheel);
  kbInput.off('press', onKeyPress);
}

function onKeyPress(ev: KeyInputEvent): void {
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

function onClick(ev: MouseInputButtonEvent): void {
  const { x, y } = viewport.getWorldPoint(ev.x, ev.y);
  const canvasPoint = viewport.getCanvasPoint(x, y);
  const isInside = testElem.isCanvasPointInside(canvasPoint.x, canvasPoint.y);

  logger.debug(
    `[${isInside ? 'in' : 'out'}] canvas(${ev.x}, ${ev.y}) => world(${x.toFixed(
      2
    )}, ${y.toFixed(2)}) => canvas(${canvasPoint.x}, ${canvasPoint.y})`
  );
  drawCanvasPoint(canvasPoint.x, canvasPoint.y);
}

function onDrag(ev: MouseInputDragEvent): void {
  if (ev.type === 'dragEnd') {
    draggingShape = undefined;
    draw();
    return;
  }

  const { dragX, dragY } = ev;
  const absX = Math.abs(dragX);
  const absY = Math.abs(dragY);
  const w = ev.shiftKey ? Math.sign(dragX) * Math.max(absX, absY) : dragX;
  const h = ev.shiftKey ? Math.sign(dragY) * Math.max(absX, absY) : dragY;
  draggingShape = new Path2D();
  draggingShape.rect(ev.clickX, ev.clickY, w, h);
  draw();
}

function onWheel(ev: MouseInputWheelEvent): void {
  const { x, y } = viewport.getWorldPoint(ev.x, ev.y);
  viewport.increaseZoom(-ZOOM_SPEED * Math.sign(ev.deltaY), x, y);
  draw();
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
  const { ctx } = viewport;

  viewport.clear();
  grid.draw();
  testElem.draw(outline);

  if (!draggingShape) return;

  ctx.save();
  ctx.resetTransform();
  setCtxStyle(ctx, {
    fillStyle: 'red',
    strokeStyle: 'red',
    lineDash: [],
    lineWidth: 1,
  });
  drawShape(ctx, 0.2, 1, draggingShape);
  ctx.restore();
}

if (!IS_SERVER) {
  (window as any).initMap = initMap;
  (window as any).resizeMap = resizeMap;
  (window as any).clearMap = clearMap;
}
