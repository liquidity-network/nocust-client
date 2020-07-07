import fs from 'fs'
import path from 'path'
const { execSync } = require('child_process')

main()

async function main() {
  const baseDir = path.join(__dirname, '../')

  execSync('rm -f ' + path.join(baseDir, './docs/index.md'))

  execSync('cp ' + path.join(baseDir, './docs-pages/*.md') + ' ' + path.join(baseDir, './docs/'))
  // console.log(result.toString())

  const sidebarsJson = fs.readFileSync(path.join(baseDir, 'website/sidebars.json'), 'utf8')
  const sidebars = JSON.parse(sidebarsJson)
  delete sidebars['nocust-client']
  const sidebarsNew = JSON.stringify(sidebars, undefined, 2)

  fs.writeFileSync(path.join(baseDir, 'website/sidebars.json'), sidebarsNew, 'utf8')
}
