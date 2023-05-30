const DEG_180 = Math.PI
const DEG_90 = DEG_180 / 2
const DEG_15 = DEG_90 / 6

const defaultWindow = typeof window !== 'undefined' ? window : undefined
type Fn = () => void
type Nullable<T> = T | null | undefined

interface Pauseable {
  isActive: boolean
  pause: () => void
  resume: () => void
}

export class Plum {
  context2D: Nullable<CanvasRenderingContext2D>
  canvas: Nullable<HTMLCanvasElement>
  size: Nullable<{
    width: number
    height: number
  }>

  constructor(
    public opts: {
      length: number
      minBranch: number
      color: string
      fps: number
    } = {
      length: 10,
      minBranch: 50,
      color: '#99999920',
      fps: 25,
    },
    public steps: (() => void)[] = [],
    public prevSteps: Fn[] = [],
    public lastExecutedTime: number = performance.now(),
    public pauseableController: Nullable<Pauseable> = null,
    private stopped = false,
    private isActive = false,
  ) {

  }

  polar2cart(x = 0, y = 0, r = 0, theta = 0) {
    const dx = r * Math.cos(theta)
    const dy = r * Math.sin(theta)

    return [x + dx, y + dy]
  }

  init() {
    if (!this.canvas || !this.size)
      return

    const { size } = this
    const ctx = this.canvas.getContext('2d')!

    const dpr = window.devicePixelRatio || 1
    // @ts-expect-error vendor
    const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1

    const dpi = dpr / bsr

    this.canvas.style.width = `${size.width}px`
    this.canvas.style.height = `${size.height}px`
    this.canvas.width = dpi * size.width
    this.canvas.height = dpi * size.height
    ctx.scale(dpi, dpi)

    this.context2D = ctx
    this.pauseableController = this.rafFn(this.frame.bind(this), { immediate: false })
  }

  getRandomPos() {
    return Math.random() * 0.6 + 0.2
  }

  rafFn(fn: (args: { delta: number; timestamp: DOMHighResTimeStamp }) => void, options: { immediate?: boolean; window?: Window }) {
    const {
      immediate = true,
      window = defaultWindow,
    } = options

    const { isActive } = this
    let previousFrameTimestamp = 0
    let rafId: null | number = null

    const loop = (timestamp: DOMHighResTimeStamp) => {
      if (!isActive || !window)
        return

      const delta = timestamp - previousFrameTimestamp
      fn({ delta, timestamp })

      previousFrameTimestamp = timestamp
      rafId = window.requestAnimationFrame(loop)
    }

    const resume = () => {
      if (!isActive && window) {
        this.isActive = true
        rafId = window.requestAnimationFrame(loop)
      }
    }

    const pause = () => {
      this.isActive = false
      if (rafId != null && window) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    if (immediate)
      resume()

    return {
      isActive: this.isActive,
      pause,
      resume,
    }
  }

  step(x: number, y: number, rad: number, counter = 0) {
    const { random } = Math
    const { minBranch, length } = this.opts
    const { size } = this
    const len = random() * length
    counter++

    const [nx, ny] = this.polar2cart(x, y, len, rad)
    const ctx = this.context2D!

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.stroke()

    const rad1 = rad + random() * DEG_15
    const rad2 = rad - random() * DEG_15

    if (!size || nx < -100 || nx > size.width + 100 || ny < -100 || ny > size.height + 100)
      return

    const rate = counter <= minBranch
      ? 0.8
      : 0.5

    if (random() < rate)
      this.steps.push(() => this.step(nx, ny, rad1, counter))

    if (random() < rate)
      this.steps.push(() => this.step(nx, ny, rad2, counter))
  }

  frame() {
    if (performance.now() - this.lastExecutedTime < this.opts.fps)
      return

    this.prevSteps = this.steps
    this.steps = []
    this.lastExecutedTime = performance.now()

    if (!this.prevSteps.length) {
      this.pauseableController?.pause()
      this.stopped = true
    }

    this.prevSteps.forEach((i) => {
      if (Math.random() < 0.5)
        this.steps.push(i)
      else
        i()
    })
  }

  start(el: HTMLCanvasElement, size: { width: number; height: number } = { width: 600, height: 600 }) {
    this.canvas = el
    this.size = size

    this.init()
    this.pauseableController?.pause()

    const ctx = this.context2D!

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.lineWidth = 1
    ctx.strokeStyle = this.opts.color
    this.prevSteps = []
    this.steps = [
      () => this.step(this.getRandomPos() * size.width, -5, DEG_90),
      () => this.step(this.getRandomPos() * size.width, size.height + 5, -DEG_90),
      () => this.step(-5, this.getRandomPos() * size.height, 0),
      () => this.step(size.width + 5, this.getRandomPos() * size.height, DEG_180),
    ]

    this.pauseableController?.resume()
    this.stopped = false
  }
}
