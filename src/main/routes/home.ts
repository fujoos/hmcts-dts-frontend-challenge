import { Application } from 'express'

export default function (app: Application): void {
  app.get('/', (req, res) => {
    return res.redirect('/tasks')
  })
}
