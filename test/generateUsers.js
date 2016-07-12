import path from 'path'
import parseArgs from 'minimist'

import db from '../db'
import factory from './factories'

import '../config'

const r = db.connect()

async function createUsers(inviteCode, role, count) {
  const users = await factory.buildMany('user', {inviteCode, role}, count)
  return r.table('users')
    .insert(users, {returnChanges: 'always'})
    .run()
    .then(result => result.changes.map(c => c.new_val))
}

function printUsage(logger = console.error) {
  const command = path.basename(process.argv[1])
  logger(
`Usage:
    ${command} [OPTIONS] INVITE_CODE

Options:
    --help           print this help message
    --role=ROLE      create users with the role ROLE (default: 'player')
    --count          how many users to create (default: 15)
    --verbose        print out ids of created users
`
  )
}

async function run() {
  try {
    const {
      help,
      role: roleStr,
      count: countStr,
      verbose,
      _: [inviteCode]
    } = parseArgs(process.argv.slice(2), {
      boolean: ['help', 'verbose'],
      string: ['role', 'count'],
    })
    if (help) {
      printUsage(console.info)
      return 0
    }
    if (!inviteCode) {
      console.error('\nERROR: INVITE_CODE is required. Try --help for usage.\n')
      return 1
    }

    const role = roleStr || 'player'
    const count = countStr ? parseInt(countStr, 10) : 15

    const users = await createUsers(inviteCode, role, count)
    if (verbose) {
      users.forEach(user => console.info(user.id))
    }
    return 0
  } catch (err) {
    console.error('Error:', err.stack || err)
  } finally {
    r.getPoolMaster().drain()
  }
}

if (!module.parent) {
  /* eslint-disable xo/no-process-exit */
  run().then(retVal => process.exit(retVal))
}
