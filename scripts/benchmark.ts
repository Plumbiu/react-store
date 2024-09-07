import fsp from 'node:fs/promises'
import { version } from '../packages/store/package.json'
import benchResult from '../benchlib/result.json'

async function run() {
  const result = {}
  for (const item of benchResult.files) {
    const groups = item.groups
    for (const group of groups) {
      const benchmark = group.benchmarks[0]
      result[benchmark.name] = { mean: benchmark.mean, hz: benchmark.hz }
    }
  }
  await fsp.writeFile(
    `benchlib/records/${version}.json`,
    JSON.stringify(result),
  )
}

run()
