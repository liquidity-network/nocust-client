import chalk from 'chalk'

export function throwError(message: string) {
  console.log(chalk.red('ERROR: ' + message))
  process.exit(1)
}

export function spliceString(value: string, index: number, count: number, addValue: string) {
  const ar = value.split('')
  ar.splice(index, count, addValue)
  return ar.join('')
}
