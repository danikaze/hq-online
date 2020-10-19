import EventEmitter from 'eventemitter3';

export interface MouseInputOptions {
  nButtons: number;
  moveThreshold: number;
  doubleClickMaxTime: number;
  trackDragging: number[];
}

export type MouseInputMoveEvent = MouseInputEvent<'move' | 'enter' | 'leave'>;

export interface MouseInputButtonEvent
  extends MouseInputEvent<'click' | 'release'> {
  button: number;
  clickX: number;
  clickY: number;
  isDoubleClick?: boolean;
}

export interface MouseInputDragEvent
  extends MouseInputEvent<'dragStart' | 'dragMove' | 'dragEnd'> {
  button: number;
  clickX: number;
  clickY: number;
  isDoubleClick?: boolean;
  dragX: number;
  dragY: number;
}

export interface MouseInputWheelEvent extends MouseInputEvent<'wheel'> {
  deltaX: number;
  deltaY: number;
  deltaZ: number;
}

interface MouseInputEvent<T extends string> {
  type: T;
  x: number;
  y: number;
  dragging: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

interface MouseInputEvents {
  move: [MouseInputMoveEvent];
  enter: [MouseInputMoveEvent];
  leave: [MouseInputMoveEvent];
  click: [MouseInputButtonEvent];
  release: [MouseInputButtonEvent];
  dragStart: [MouseInputDragEvent];
  dragMove: [MouseInputDragEvent];
  dragEnd: [MouseInputDragEvent];
  wheel: [MouseInputWheelEvent];
}

export class MouseInput extends EventEmitter<MouseInputEvents> {
  public static readonly defaultOptions: MouseInputOptions = {
    nButtons: 2,
    moveThreshold: 3,
    doubleClickMaxTime: 500,
    trackDragging: [0],
  };

  public x: number = -1;
  public y: number = -1;
  public clickX: number = -1;
  public clickY: number = -1;
  public draggingButton: number = -1;
  public dragX: number = 0;
  public dragY: number = 0;
  public isOutside: boolean = true;
  public lastClickTime: number = 0;
  public lastClickButton: number = -1;

  private readonly elem: HTMLElement;
  private readonly buttons: boolean[] = [];
  private readonly nButtons: number;
  private readonly movementThreshold: number;
  private readonly trackDragging: number[];
  private readonly doubleClickMaxTime: number;

  constructor(elem: HTMLElement, options?: Partial<MouseInputOptions>) {
    super();

    this.elem = elem;
    const opt = { ...MouseInput.defaultOptions, options };
    this.nButtons = opt.nButtons;
    this.trackDragging = opt.trackDragging;
    this.movementThreshold = opt.moveThreshold;
    this.doubleClickMaxTime = opt.doubleClickMaxTime;

    for (let i = 0; i < this.nButtons; i++) {
      this.buttons.push(false);
    }

    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
    this.enterHandler = this.enterHandler.bind(this);
    this.leaveHandler = this.leaveHandler.bind(this);
    this.movementHandler = this.movementHandler.bind(this);
    this.wheelHandler = this.wheelHandler.bind(this);

    elem.addEventListener('mousedown', this.downHandler);
    elem.addEventListener('mouseup', this.upHandler);
    elem.addEventListener('mouseenter', this.enterHandler);
    elem.addEventListener('mouseleave', this.leaveHandler);
    elem.addEventListener('mousemove', this.movementHandler);
    elem.addEventListener('wheel', this.wheelHandler);
  }

  public end() {
    const { elem } = this;

    elem.removeEventListener('mousedown', this.downHandler);
    elem.removeEventListener('mouseup', this.upHandler);
    elem.removeEventListener('mouseenter', this.enterHandler);
    elem.removeEventListener('mouseleave', this.leaveHandler);
    elem.removeEventListener('mousemove', this.movementHandler);
    elem.removeEventListener('wheel', this.wheelHandler);
  }

  private downHandler(ev: MouseEvent): void {
    const button = ev.button;

    // if that button is not being tracked, ignore it
    if (button >= this.nButtons) return;

    const x = ev.clientX;
    const y = ev.clientY;

    const now = Date.now();
    const isDoubleClick =
      now - this.lastClickTime < this.doubleClickMaxTime &&
      button === this.lastClickButton &&
      Math.abs(x - this.clickX) < this.movementThreshold &&
      Math.abs(y - this.clickY) < this.movementThreshold;

    this.x = x;
    this.y = y;
    this.clickX = x;
    this.clickY = y;
    this.isOutside = false;
    this.buttons[button] = true;
    this.lastClickButton = button;
    this.lastClickTime = now;

    this.emit('click', {
      x,
      y,
      button,
      isDoubleClick,
      clickX: x,
      clickY: y,
      dragging: this.draggingButton !== -1,
      altKey: ev.altKey,
      ctrlKey: ev.ctrlKey,
      shiftKey: ev.shiftKey,
      type: 'click' as const,
    });
  }

  private upHandler(ev: MouseEvent): void {
    const button = ev.button;

    // if that button is not being tracked, ignore it
    if (button >= this.nButtons) return;

    const { draggingButton, clickX, clickY } = this;
    const x = ev.clientX;
    const y = ev.clientY;

    this.x = x;
    this.y = y;
    this.isOutside = false;

    this.buttons[button] = false;

    this.emit('release', {
      x,
      y,
      button,
      clickX,
      clickY,
      dragging: this.draggingButton !== -1,
      altKey: ev.altKey,
      ctrlKey: ev.ctrlKey,
      shiftKey: ev.shiftKey,
      type: 'release' as const,
    });

    // if mouse is not being dragged (or dragged with that button), do nothing
    if (draggingButton === -1 || draggingButton !== button) return;

    // stop tracking the drag
    this.draggingButton = -1;

    this.emit('dragEnd', {
      x,
      y,
      clickX,
      clickY,
      dragX: this.dragX,
      dragY: this.dragY,
      button: draggingButton,
      dragging: this.draggingButton !== -1,
      altKey: ev.altKey,
      ctrlKey: ev.ctrlKey,
      shiftKey: ev.shiftKey,
      type: 'dragEnd' as const,
    });
  }

  private enterHandler(ev: MouseEvent): void {
    const x = ev.clientX;
    const y = ev.clientY;

    this.x = x;
    this.y = y;
    this.isOutside = false;

    this.emit('enter', {
      x,
      y,
      dragging: this.draggingButton !== -1,
      altKey: ev.altKey,
      ctrlKey: ev.ctrlKey,
      shiftKey: ev.shiftKey,
      type: 'enter' as const,
    });
  }

  private leaveHandler(ev: MouseEvent): void {
    const x = ev.clientX;
    const y = ev.clientY;

    this.x = x;
    this.y = y;
    this.isOutside = true;

    this.emit('leave', {
      x,
      y,
      dragging: this.draggingButton !== -1,
      altKey: ev.altKey,
      ctrlKey: ev.ctrlKey,
      shiftKey: ev.shiftKey,
      type: 'leave' as const,
    });
  }

  private movementHandler(ev: MouseEvent): void {
    const { movementThreshold: dragThreshold } = this;

    const { altKey, ctrlKey, shiftKey } = ev;
    const x = ev.clientX;
    const y = ev.clientY;
    this.x = x;
    this.y = y;

    this.emit('move', {
      x,
      y,
      altKey,
      ctrlKey,
      shiftKey,
      dragging: this.draggingButton !== -1,
      type: 'move' as const,
    });

    // make sure we want to start tracking this button
    const draggingButton = this.buttons.findIndex((b) => b);
    if (!this.trackDragging.includes(draggingButton)) return;

    const trackingThis = this.draggingButton !== -1;
    const { clickX, clickY } = this;
    const dragX = x - clickX;
    const dragY = y - clickY;

    if (
      // drag is not being tracked yet
      !trackingThis &&
      // check is not a click
      (Math.abs(dragX) >= dragThreshold || Math.abs(dragY) >= dragThreshold)
    ) {
      // start tracking the drag
      this.draggingButton = draggingButton;
      this.emit('dragStart', {
        x,
        y,
        altKey,
        ctrlKey,
        shiftKey,
        clickX,
        clickY,
        dragX,
        dragY,
        button: draggingButton,
        dragging: this.draggingButton !== -1,
        type: 'dragStart' as const,
      });
    }

    if (!trackingThis) return;

    // it was already tracking the drag, so just update it
    this.dragX = dragX;
    this.dragY = dragY;

    this.emit('dragMove', {
      x,
      y,
      altKey,
      ctrlKey,
      shiftKey,
      clickX,
      clickY,
      dragX,
      dragY,
      button: draggingButton,
      dragging: this.draggingButton !== -1,
      type: 'dragMove' as const,
    });
  }

  private wheelHandler(ev: WheelEvent): void {
    const { x, y } = ev;
    this.x = x;
    this.y = y;

    this.emit('wheel', {
      x,
      y,
      altKey: ev.altKey,
      ctrlKey: ev.ctrlKey,
      shiftKey: ev.shiftKey,
      dragging: this.draggingButton !== -1,
      deltaX: ev.deltaX,
      deltaY: ev.deltaY,
      deltaZ: ev.deltaZ,
      type: 'wheel' as const,
    });
  }
}
