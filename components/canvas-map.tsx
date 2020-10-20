import { FunctionComponent, useEffect, useRef } from 'react';

export interface Props {
  className?: string;
  width?: number | string;
  height?: number | string;
  onMount?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  onResize?: (width: number, height: number) => void;
  onUnmount?: (canvas: HTMLCanvasElement) => void;
}

function useCanvasMap(
  onMount: Props['onMount'],
  onResize: Props['onResize'],
  onUnmount: Props['onUnmount']
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let init = false;

  function resizeCanvas() {
    const { width, height } = canvasRef.current!.getBoundingClientRect();
    canvasRef.current!.width = width;
    canvasRef.current!.height = height;

    if (init && onResize) {
      onResize(width, height);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      if (onMount) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2D Context not available');
        onMount(canvas, ctx);
        init = true;
      }
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      onUnmount && onUnmount(canvas!);
    };
  }, []);

  return {
    canvasRef,
  };
}

export const CanvasMap: FunctionComponent<Props> = ({
  className,
  width,
  height,
  onMount,
  onResize,
  onUnmount,
}) => {
  const { canvasRef } = useCanvasMap(onMount, onResize, onUnmount);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={width}
      height={height}
    />
  );
};
