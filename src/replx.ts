import _ from 'lodash'
import repl from 'repl'
import chalk from 'chalk'
import mobx from 'mobx'

import writer from './Writer'
import evaluate from './evaluate'

const context = { _ }

const session = repl.start({
  eval: evaluate,
  useGlobal: true,
  replMode: 'sloppy',
  ignoreUndefined: true,
  writer: writer.format,
  prompt: chalk.dim('> ')
})

_.assign(session.context, context)

// Immediately clear the console and re-display the prompt to bypass the warning
// we get for overriding the `_` variable.
console.clear()
session.displayPrompt()

process.on('unhandledRejection', e => {
  console.log(e)
  session.displayPrompt()
})

process.on('uncaughtException', e => {
  console.log(e)
  session.displayPrompt()
})
