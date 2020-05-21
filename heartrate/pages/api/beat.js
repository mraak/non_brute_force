// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import store from '../../store'

export default (req, res) => {
  const beat = Number(req.body)

  if(beat) {
    store.push({
      beat,
      timestamp: (new Date).toISOString()
    })
  }

  res.statusCode = 200
  res.json({ beats: store })
}
