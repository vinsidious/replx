import 'sucrase/register'
import 'reify'

import * as babylon from 'babylon'
import decache from 'decache'
import _ from 'lodash'
import { fs } from 'mz'
import quasilon from 'quasilon'
import { find } from 'simple-object-query'

import * as babel from '@babel/core'
import generate from '@babel/generator'
import traverse from '@babel/traverse'
import * as types from '@babel/types'

import { extractImports } from './watch'

require('/Users/vince/shipotle-api/node_modules/babel-register')

const q = quasilon()

export const parserOpts = {
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  allowReturnOutsideFunction: true,
  ranges: true,
  plugins: [
    'typescript',
    'objectRestSpread',
    'decorators',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'asyncGenerators',
    'functionBind',
    'dynamicImport',
    'optionalChaining',
    'bigInt',
    'throwExpressions',
    'nullishCoalescingOperator'
  ]
}

export function transformAndExtractModules(code) {
  extractImports(code)
  return transform(code)
}

export function transform(originalCode) {
  const { code, ast } = babelTransform(originalCode, [
    // Transforms all 'import' statements to 'require' statements
    ['babel-plugin-transform-es2015-modules-simple-commonjs', { strictMode: false }],
    // Strips all TypeScript typings
    '@babel/plugin-transform-typescript',
    transformVariablesIntoGlobals,
    transformTopLevelAwaits
  ])

  return generate(ast).code
}

// Like babel.transformSync except that it's run once for each plugin
// **separately**. This is important in some circumstances so that one plugin
// doesn't strip out code before another plugin gets the chance to transform it.
function babelTransform(code, plugins, ast?) {
  _.castArray(plugins).forEach(plugin => {
    ;({ code, ast } = babel.transformSync(code, { ast: true, parserOpts, plugins: [plugin] }))
  })
  return { code, ast }
}

/**
 * Wraps awaits in an async IIFE. Handles variables being assigned to the
 * Promise's returned value.
 */
function transformTopLevelAwaits(ast) {
  return {
    visitor: {
      AwaitExpression(path) {
        const parentScope = path.scope.getFunctionParent()
        if (!parentScope || !parentScope.path.node.async) {
          if (types.isAssignmentExpression(path.parent)) {
            const variable = path.parent.left
            const awaitExpression = path.parent.right
            const replacement = q`(async () => ${awaitExpression})().then(__val => { ${variable} = __val; return ${variable} });`
            path.parentPath.parentPath.replaceWith(replacement.ast.program.body[0])
          } else {
            path.replaceWith(
              types.callExpression(types.arrowFunctionExpression([], path.node, true), [])
            )
          }
        }
      }
    }
  }
}

/**
 * Transforms all variables and function declarations into globals so that
 * they're accessible later on.
 */
function transformVariablesIntoGlobals(ast) {
  return {
    visitor: {
      ClassDeclaration(path) {
        const { id, superClass, body } = path.node
        path.replaceWith(
          types.expressionStatement(
            types.assignmentExpression(
              '=',
              types.memberExpression(types.identifier('global'), id),
              types.classExpression(id, superClass, body)
            )
          )
        )
      },
      FunctionDeclaration(path) {
        const { id, params, body, async } = path.node
        path.replaceWith(
          types.expressionStatement(
            types.assignmentExpression(
              '=',
              types.memberExpression(types.identifier('global'), id),
              types.functionExpression(id, params, body, false, async)
            )
          )
        )
      },
      VariableDeclaration(path) {
        path.replaceWithMultiple(
          path.node.declarations.map(({ id, init }) =>
            types.expressionStatement(
              types.assignmentExpression(
                '=',
                types.memberExpression(types.identifier('global'), id),
                init
              )
            )
          )
        )
      }
    }
  }
}

export default transformAndExtractModules
