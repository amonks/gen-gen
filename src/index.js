import { ask, replacer } from 'gen-util'
import $ from 'shelljs'

export default async () => {
  /**
   * GATHER INFO
   */

  const name = await ask('generator npm name?', {validator: v => v.indexOf(' ') === -1})

  /**
   * SET UP GENERATOR STRUCTURE
   */

  const source = `${__dirname}/../files`
  const target = await ask('save to?', {default: `${process.cwd()}/../${name}`})

  await $.cp('-R', `${source}/`, target)
  await $.mv(`${target}/_package.json`, `${target}/package.json`)

  const files = $.find(`${target}`)
  const replace = replacer(files)

  replace(/\$GENERATOR_NAME/, name)
  replace(/\$CURRENT_YEAR/, new Date().getFullYear())
  replace(/\$USER_NAME/, 'Andrew J. Monks <a@monks.co>')

  /**
   * SET UP USER'S FILES
   */

  const userSource = await ask('source?', {default: process.cwd()})
  const userTarget = `${target}/files`

  await $.cp('-R', `${userSource}/`, userTarget)

  const userPackageJson = `${userTarget}/package.json`
  if ($.test('-e', userPackageJson)) {
    await $.mv(userPackageJson, `${userTarget}/_package.json`)
  }

  const userFiles = $.find(`${userTarget}`)
  const userReplace = replacer(userFiles)

  while (true) {
    const from = await ask('any project-specific strings to replace? (just press enter for "no")')
    if (from === '') break
    const fromRegex = new RegExp(from)
    const to = await ask(`what should I replace "${from}" with?`)
    userReplace(fromRegex, to)
  }

  /**
   * DONE
   */

  console.log('💥')
  console.log("you'll probably want to go in and add some replacers to src/index.js within your generator")
}

