export interface Size2D {
  width: number;
  height: number;
}
export interface Point2D {
  x: number;
  y: number;
}
export interface ZSortable {
  z: number;
}
export interface Rotatable {
  angle: number;
}
export interface Centerable {
  centerX: number;
  centerY: number;
}
export interface Scalable {
  scaleX: number;
  scaleY: number;
}
export interface Transparentable {
  alpha: number;
}

export type Rect2D = Size2D & Point2D;

export interface Bounds2D {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type CtxStyle = {
  alpha?: number;
  // compositeOperation: string;
  // filter: string;
  lineCap?: CanvasLineCap;
  lineDashOffset?: number;
  lineJoin?: CanvasLineJoin;
  lineWidth?: number;
  lineDash?: number[];
  // miterLimit: number;
  // shadowBlur: number;
  // shadowColor: string;
  // shadowOffsetX: number;
  // shadowOffsetY: number;
  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
};

export type ShapeStyle = Omit<CtxStyle, 'alpha'> & {
  fillAlpha?: number;
  strokeAlpha?: number;
};
