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

export interface ShapeStyle {
  fillStyle: string;
  fillAlpha: number;
  strokeStyle: string;
  strokeAlpha: number;
  strokeWidth: number;
}
