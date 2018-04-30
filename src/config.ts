import _ from 'lodash'
import cosmiconfig from 'cosmiconfig'

import { transform } from './transform'

export const MODULE_NAME = 'replx'

export type Command = string
export type Filepath = string

/**
 * Possible config options that users are able to specify via any file/format
 * that works with {@link https://github.com/davidtheclark/cosmiconfig cosmiconfig}.
 */
export interface Config {
  /**
   * `before` can either be a string or array of strings where each string is
   * either JavaScript code which will be `eval`d directly or a filepath which
   * will be `require`d. Use this to bootstrap your repl for your project.
   */
  before: (Command | Filepath)[]
}

export async function bootstrap() {
  const config = loadConfig()
  await runBeforeHooks(config)
}

function loadConfig() {
  const explorer = cosmiconfig(MODULE_NAME, { sync: true })

  const { config } = explorer.load()

  return config as Config
}

async function runBeforeHooks({ before }: Config) {
  before = _.castArray(before)
  await Promise.all(
    _.map(before, async beforeHook => {
      try {
        // First try to require the hook, we do this in a try/catch in case this
        // isn't actually a path (or it's an invalid path).
        // TODO: Implement something more elegant
        require(beforeHook)
      } catch (e) {
        // If the last command threw, it's because it's an invalid module path.
        // Let's assume that the user provided us with a block of code to execute
        // and try to `eval` it
        // TODO: Once again, something more elegent
        try {
          const code = transform(beforeHook)
          await eval(code)
        } catch (e) {}
      }
    })
  )
}

export default bootstrap
