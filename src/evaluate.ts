import repl from 'repl'

import transform from './transform'

export async function evaluate(cmd, context, _file, callback) {
  try {
    const code = transform(cmd)
    const result = await eval(code)
    return callback(null, result)
  } catch (e) {
    if (isRecoverableError(e)) return callback(new repl.Recoverable(e))
    throw e
  }
}

function isRecoverableError(error) {
  if (error.name === 'SyntaxError') {
    return /(Unexpected end of input|Unexpected token|Unterminated template)/.test(error.message)
  }
  return false
}

export default evaluate
