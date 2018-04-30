import 'app-module-path/cwd'

import appRoot from 'app-root-path'
import chalk from 'chalk'
import _ from 'lodash'
import repl from 'repl'
import ReplHistory from 'repl.history'
import { addPath } from 'app-module-path'

import writer from './Writer'
import evaluate from './evaluate'
import bootstrap from './config'

function startReplx() {
  const context = { _ }

  const replx = repl.start({
    eval: evaluate,
    useGlobal: true,
    replMode: 'sloppy',
    ignoreUndefined: true,
    writer: writer.format,
    prompt: chalk.dim('> ')
  })

  _.assign(replx.context, context)

  ReplHistory(replx, `${appRoot}/.replx_history`)

  // Immediately clear the console and re-display the prompt to bypass the warning
  // we get for overriding the `_` variable.
  console.clear()
  replx.displayPrompt()

  process.on('unhandledRejection', e => {
    console.log(e)
    replx.displayPrompt()
  })

  process.on('uncaughtException', e => {
    console.log(e)
    replx.displayPrompt()
  })
}

bootstrap().then(startReplx)
