import _ from 'lodash'
import autobind from 'protobind'
import prettier from 'prettier'
import highlight from '@babel/highlight'
import chalk from 'chalk'
import util from 'util'

@autobind
export class Writer {
  format(value: any) {
    return _.isString(value) ? this.formatString(value) : highlight(util.inspect(value))
  }

  formatString(value: string) {
    // Super basic, but if the string looks like it might be code, format it all
    // pretty-like.
    if (/^(let|var|const|function|if|import|export|require) /.test(value)) {
      try {
        return highlight(prettier.format(value))
      } catch (e) {}
    }
    if (/'/.test(value)) {
      const dimTick = chalk.dim('`')
      return dimTick + value + dimTick
    } else {
      const dimQuote = chalk.dim(`'`)
      return dimQuote + value + dimQuote
    }
  }
}

export default new Writer()
