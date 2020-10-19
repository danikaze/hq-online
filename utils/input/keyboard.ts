import EventEmitter from 'eventemitter3';

export interface KeyboardInputOptions {
  trackCodes: string[];
  repeatInterval: number;
}

export interface KeyInputEvent {
  type: 'press' | 'release' | 'pressed';
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

export interface KeyPressedEvent extends KeyInputEvent {
  type: 'pressed';
  interval: number;
}

interface KeyInputEvents {
  press: [KeyInputEvent];
  release: [KeyInputEvent];
  pressed: [KeyPressedEvent];
}

interface KeyTrack {
  key: { [key: string]: boolean };
  code: { [code: string]: boolean };
}

interface PressedKey {
  key: string;
  code: string;
  t: number;
}

export class KeyboardInput extends EventEmitter<KeyInputEvents> {
  public static readonly defaultOptions: KeyboardInputOptions = {
    trackCodes: [],
    repeatInterval: 10,
  };

  public readonly keys: KeyTrack;
  public altKey = false;
  public ctrlKey = false;
  public shiftKey = false;

  private readonly elem: HTMLElement | Document;
  private readonly trackCodes: string[];
  private readonly repeatInterval: number;
  private readonly pressedCodes: PressedKey[] = [];
  private interval: number | undefined;

  constructor(elem?: HTMLElement, options?: Partial<KeyboardInputOptions>) {
    super();

    this.elem = elem ? elem : document;
    const opt: KeyboardInputOptions = {
      ...KeyboardInput.defaultOptions,
      ...options,
    };

    this.repeatInterval = opt.repeatInterval;
    this.trackCodes = opt.trackCodes;
    this.keys = { key: {}, code: {} };

    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
    this.repeat = this.repeat.bind(this);

    this.elem.addEventListener('keydown', this.downHandler as EventListener);
    this.elem.addEventListener('keyup', this.upHandler as EventListener);
  }

  public end() {
    this.elem.removeEventListener('keydown', this.downHandler as EventListener);
    this.elem.removeEventListener('keyup', this.upHandler as EventListener);

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private isTracked(ev: KeyboardEvent): boolean {
    const { trackCodes } = this;
    return trackCodes.length === 0 || trackCodes.includes(ev.code);
  }

  private downHandler(ev: KeyboardEvent) {
    if (!this.isTracked(ev)) return;

    const { keys } = this;
    const { key, code, altKey, ctrlKey, shiftKey } = ev;
    keys.key[key] = true;
    keys.code[key] = true;
    this.altKey = altKey;
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;

    const wasPressed =
      this.pressedCodes.findIndex((k) => k.code === code) !== -1;
    if (!this.interval && this.repeatInterval >= 0) {
      this.interval = window.setInterval(this.repeat, this.repeatInterval);
    }

    if (wasPressed) return;
    this.pressedCodes.push({ key, code, t: Date.now() });
    this.emit('press', {
      key,
      code,
      altKey,
      ctrlKey,
      shiftKey,
      type: 'press',
    });
  }

  private upHandler(ev: KeyboardEvent) {
    if (!this.isTracked(ev)) return;

    const { keys, pressedCodes, altKey, ctrlKey, shiftKey } = this;
    const { key, code } = ev;
    keys.key[key] = false;
    keys.code[code] = false;
    this.altKey = altKey;
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;

    const index = pressedCodes.findIndex((k) => k.code === code);
    if (index !== -1) {
      pressedCodes.splice(index, 1);
    }

    if (pressedCodes.length === 0) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    this.emit('release', {
      key,
      code,
      altKey,
      ctrlKey,
      shiftKey,
      type: 'release',
    });
  }

  private repeat(): void {
    const now = Date.now();
    const { pressedCodes } = this;

    pressedCodes.forEach(({ key, code, t }, i) => {
      this.emit('pressed', {
        key,
        code,
        altKey: this.altKey,
        ctrlKey: this.ctrlKey,
        shiftKey: this.shiftKey,
        type: 'pressed',
        interval: now - t,
      });
      pressedCodes[i].t = now;
    });
  }
}
