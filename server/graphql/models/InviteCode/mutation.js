import raven from 'raven'

import {GraphQLNonNull, GraphQLString} from 'graphql'
import {GraphQLInputObjectType} from 'graphql/type'
import {GraphQLError} from 'graphql/error'

import {InviteCode} from './schema'

import r from '../../../../db/connect'

const sentry = new raven.Client(process.env.SENTRY_SERVER_DSN)

const InputInviteCode = new GraphQLInputObjectType({
  name: 'InputInviteCode',
  description: 'The invite code',
  fields: () => ({
    code: {type: new GraphQLNonNull(GraphQLString), description: 'The invite code'},
    description: {type: new GraphQLNonNull(GraphQLString), description: 'The description of for whom the code was created'},
  })
})

export default {
  createInviteCode: {
    type: InviteCode,
    args: {
      inviteCode: {type: new GraphQLNonNull(InputInviteCode)},
    },
    async resolve(source, {inviteCode}) {
      try {
        const inviteCodes = await r.table('inviteCodes').getAll(inviteCode.code, {index: 'code'}).limit(1).run()
        const result = inviteCodes[0]
        if (result) {
          throw new GraphQLError('Invite codes must be unique')
        }
        const insertedInviteCode = await r.table('inviteCodes')
          .insert(inviteCode, {returnChanges: 'always'})
          .run()
        if (insertedInviteCode.inserted) {
          return insertedInviteCode.changes[0].new_val
        }
        throw new GraphQLError('Could not create invite code, please try again')
      } catch (err) {
        sentry.captureException(err)
        throw err
      }
    }
  },
}