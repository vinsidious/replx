import autobind from 'protobind'
import DraftLog from 'draftlog'
import { terminal } from 'terminal-kit'

declare var console: Console & {
  draft: any
}

DraftLog.into(console).addLineListener(process.stdin)

export enum Key {
  CTRL_C = 'CTRL_C',
  ENTER = 'ENTER',
  BACKSPACE = 'BACKSPACE'
}

interface CharacterInputData {
  isCharacter: true
  codepoint: number
  code: number
}

interface NonCharacterInputData {
  isCharacter: false
  code: Buffer
}

export class ScreenBuffer {
  private buffer: string = ''
  private logLine = console.draft()

  constructor(private onEnter) {
    autobind(this)
    this.bootstrap()
  }

  private bootstrap() {
    // Starts taking over the terminal. No key presses will automatically be
    // echoed on the screen, etc.
    terminal.grabInput()
    terminal.on('key', this.onKeyEvent)
  }

  private onKeyEvent(
    name: Key,
    matches: string[],
    { isCharacter }: CharacterInputData | NonCharacterInputData
  ) {
    console.log('name: ', name)
    if (name === Key.CTRL_C) this.terminate()
    else if (name === Key.ENTER) this.onPressEnter()
    else if (name === Key.BACKSPACE) this.onPressBackspace()
    else if (isCharacter) this.buffer += matches[0]
    this.logLine(this.buffer)
  }

  private onPressBackspace() {
    this.buffer = this.buffer.slice(0, -1)
  }

  private onPressEnter() {
    const currentBuffer = this.buffer
    this.clearBuffer()
    this.logLine = console.draft()
    return this.onEnter(currentBuffer)
  }

  private clearBuffer() {
    this.buffer = ''
  }

  private terminate() {
    terminal.grabInput(false)
    setTimeout(process.exit, 100)
  }
}
