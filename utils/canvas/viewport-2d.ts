import { extendObjectsOnly } from 'extend-objects-only';
import clamp from 'clamp';
import { deg2rad, normalizeAngle } from '@utils/trigonometry';
import { Bounds2D, Point2D } from './interfaces';

export type Viewport2dOptions = Partial<Options>;

interface Options {
  worldLimits?: Bounds2D;
  minZoom: number;
  maxZoom: number;
}

type Corners = [Point2D, Point2D, Point2D, Point2D];

export class Viewport2D {
  public static readonly defaultOptions: Options = {
    minZoom: -Infinity,
    maxZoom: Infinity,
  };

  // public attributes for read only
  // do not modify directly but use each method
  public readonly ctx: CanvasRenderingContext2D;
  public readonly canvas: HTMLCanvasElement;
  public width!: number;
  public height!: number;
  public centerX!: number;
  public centerY!: number;
  public zoom!: number;
  public angleDeg!: number;
  public angleRad!: number;

  // related to transform
  private dirtyTransform!: boolean;
  private tx = 0;
  private ty = 0;
  // related to visible world bounds
  private dirtyBounds!: boolean;
  private readonly bounds: Bounds2D;
  // related to visible world corners
  private dirtyCorners!: boolean;
  private readonly corners: Corners;

  private readonly options: Options;

  constructor(canvas: HTMLCanvasElement, options?: Viewport2dOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.options = extendObjectsOnly(
      {},
      Viewport2D.defaultOptions,
      options
    ) as Required<Options>;

    this.bounds = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
    this.corners = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    this.reset();
  }

  public reset(): void {
    const { canvas } = this;
    this.width = canvas.width;
    this.height = canvas.height;
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    this.zoom = 1;
    this.angleDeg = 0;
    this.angleRad = 0;

    this.dirtyTransform = true;
    this.dirtyBounds = true;
    this.dirtyCorners = true;
  }

  public resize(width: number, height: number): void {
    if (this.width === width && this.height === height) return;

    this.width = width;
    this.height = height;

    this.dirtyTransform = true;
    this.dirtyBounds = true;
    this.dirtyCorners = true;
  }

  public clear(): void {
    const { ctx } = this;
    ctx.resetTransform();
    ctx.clearRect(0, 0, this.width, this.height);
    this.applyTransform();
  }

  public moveCenter(x: number, y: number): void {
    this.center(this.centerX + x, this.centerY + y);
  }

  public center(x: number, y: number): void {
    const { worldLimits } = this.options;

    if (worldLimits) {
      this.centerX = clamp(
        x,
        worldLimits.left || -Infinity,
        worldLimits.right || Infinity
      );
      this.centerY = clamp(
        y,
        worldLimits.top || -Infinity,
        worldLimits.bottom || Infinity
      );
    } else {
      this.centerX = x;
      this.centerY = y;
    }
    this.dirtyTransform = true;
    this.dirtyBounds = true;
    this.dirtyCorners = true;
  }

  public increaseZoom(
    zoomDiff: number,
    centerX?: number,
    centerY?: number
  ): void {
    this.setZoom(this.zoom + zoomDiff, centerX, centerY);
  }

  public setZoom(zoom: number, centerX?: number, centerY?: number): void {
    const { minZoom, maxZoom } = this.options;
    const newZoom = clamp(zoom, minZoom, maxZoom);
    if (centerX !== undefined && centerY !== undefined) {
      const z = 1 - this.zoom / newZoom;
      this.centerX += (centerX - this.centerX) * z;
      this.centerY += (centerY - this.centerY) * z;
    }
    this.zoom = newZoom;

    this.dirtyTransform = true;
    this.dirtyBounds = true;
    this.dirtyCorners = true;
  }

  public rotate(degreesDiff: number): void {
    this.setAngle(this.angleDeg + degreesDiff);
  }

  public setAngle(degrees: number): void {
    const deg = normalizeAngle(degrees);
    if (this.angleDeg === deg) return;

    this.angleDeg = deg;

    this.dirtyTransform = true;
    this.dirtyBounds = true;
    this.dirtyCorners = true;
  }

  public applyTransform(): void {
    const { zoom } = this;

    if (this.dirtyTransform) {
      this.dirtyTransform = false;
      const { width, height } = this;
      this.angleRad = deg2rad(this.angleDeg);
      this.tx = Math.round(
        -(this.centerX - width / 2) * zoom - (width / 2) * (zoom - 1)
      );
      this.ty = Math.round(
        -(this.centerY - height / 2) * zoom - (height / 2) * (zoom - 1)
      );
    }

    this.ctx.setTransform(zoom, 0, 0, zoom, this.tx, this.ty);
    this.ctx.rotate(this.angleRad);
  }

  public getCanvasPoint(worldX: number, worldY: number): Point2D {
    const { zoom, tx, ty, angleRad } = this;

    if (!angleRad) {
      return {
        x: worldX * zoom + tx,
        y: worldY * zoom + ty,
      };
    }

    const s = Math.sin(angleRad);
    const c = Math.cos(angleRad);

    return {
      x: (worldX * c - worldY * s) * zoom + tx,
      y: (worldX * s + worldY * c) * zoom + ty,
    };
  }

  public getWorldPoint(canvasX: number, canvasY: number): Point2D {
    const { zoom, tx, ty, angleRad } = this;
    const x = (canvasX - tx) / zoom;
    const y = (canvasY - ty) / zoom;

    if (!angleRad) {
      return { x, y };
    }

    const s = Math.sin(-angleRad);
    const c = Math.cos(-angleRad);

    return {
      x: x * c - y * s,
      y: x * s + y * c,
    };
  }

  public getVisibleWorldBounds(): Bounds2D {
    if (this.dirtyBounds) {
      this.dirtyBounds = false;
      const [
        { x: x0, y: y0 },
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        { x: x3, y: y3 },
      ] = this.getVisibleWorldCorners();

      this.bounds.top = Math.min(y0, y1, y2, y3);
      this.bounds.bottom = Math.max(y0, y1, y2, y3);
      this.bounds.left = Math.min(x0, x1, x2, x3);
      this.bounds.right = Math.max(x0, x1, x2, x3);
    }
    return this.bounds;
  }

  public getVisibleWorldCorners(): Corners {
    if (this.dirtyCorners) {
      this.dirtyCorners = false;
      const w = this.width - 1;
      const h = this.height - 1;
      const corners = this.corners;
      // tslint:disable: no-magic-numbers
      corners[0] = this.getWorldPoint(0, 0);
      corners[1] = this.getWorldPoint(0, h);
      corners[2] = this.getWorldPoint(w, 0);
      corners[3] = this.getWorldPoint(w, h);
      // tslint:enable: no-magic-numbers
    }
    return this.corners;
  }
}
