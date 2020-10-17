// tslint:disable:no-magic-numbers

/**
 * Take an angle and return it in the (-180, 180] interval
 */
export function normalizeAngle(angle: number): number {
  let a = angle;

  if (a <= 180) {
    do {
      a += 360;
    } while (a <= -180);
  }
  if (a > 180) {
    do {
      a -= 360;
    } while (a > 180);
  }

  return a;
}

export function deg2rad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function rad2deg(radians: number): number {
  return (radians * 180) / Math.PI;
}
