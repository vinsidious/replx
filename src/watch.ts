import * as fs from 'fs'

import * as babylon from 'babylon'
import decache from 'decache'
import _ from 'lodash'
import { find } from 'simple-object-query'

import generate from '@babel/generator'
import traverse from '@babel/traverse'

import { parserOpts, transform } from './transform'

const watchPaths: string[] = []

/**
 * For each block of code, extract the imports and watch the files which are
 * descendants of the imported file for any changes. When they change, we
 * invalidate the cache and re-import the module.
 */
export function extractImports(code) {
  const ast = babylon.parse(code, parserOpts)
  traverse(ast, {
    ImportDeclaration(path) {
      const watchPath = _.get(find(path.node, { type: 'StringLiteral' }), '0.value')
      setTimeout(() => addToWatch(watchPath, generate(path.node).code), 1000)
    }
  })
}

/**
 * Whenever the required module changes, we invalidate that module within the
 * `require` cache and then we re-require it, assigning it to the same variable
 * as before.
 */
export function addToWatch(watchPath, code) {
  const path = require.resolve(watchPath)
  if (watchPaths.includes(path)) return
  watchPaths.push(path)
  const childPaths = recursivelyGetChildren(path)
  _.forEach([path, ...childPaths], _path => {
    fs.watchFile(_path, () => {
      decache(path)
      eval(transform(code))
    })
  })
}

function recursivelyGetChildren(mod) {
  const modPath = require.resolve(mod)
  const root = require.cache[modPath]

  const paths: string[] = []
  let seen: any[] = []

  function recurse(node) {
    if (!node || seen.includes(node)) return
    seen.push(node)
    if (node.filename) {
      if (!/node_modules/.test(node.filename)) paths.push(node.filename)
    }
    if (node.children) {
      _.forEach(node.children, _node => recurse(_node))
    }
  }

  recurse(root)

  return paths
}
