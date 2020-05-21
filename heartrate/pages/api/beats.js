// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import store from '../../store'

export default (req, res) => {
  res.statusCode = 200
  res.json({ beats: store })
}
