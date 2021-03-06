import express from 'express'

import {connect} from 'src/db'

/* eslint new-cap: [2, {"capIsNewExceptions": ["Router"]}] */
const app = new express.Router()
const r = connect()

app.get('/:filename', (req, res) => {
  const {filename} = req.params
  const userId = filename.replace(/\.jpe?g$/, '')
  r.table('userAvatars')
    .get(userId)
    .run()
    .then(userAvatar => {
      if (!userAvatar) {
        res.status(404).send(`No such image: ${filename}`)
        return
      }

      res
        .status(200)
        .set({
          'Content-Type': 'image/jpeg',
          'Content-Length': userAvatar.jpegData.length,
          'Cache-Tag': userAvatar.updatedAt.getTime(),
        })
        .send(userAvatar.jpegData)
    })
})

export default app
