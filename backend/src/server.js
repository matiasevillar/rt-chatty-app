import express from 'express'
import { ENV } from './lib/env.js'
import path from 'path'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.route.js'
import messagesRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js'
import { arcjetProtection } from './middlewares/arcjet.middleware.js'

const app = express()
const __dirname = path.resolve()

app.use(express.json()) // So we can get info that client sends req.body
app.use(cookieParser()) // Parse cookies (needed for JWT cookies)

// Arcjet protection --> Bots, rate limit, SQL injections etc
app.use(arcjetProtection)

app.use('/api/auth', authRoutes)
app.use('/api/messages', messagesRoutes)

// When the app is deployed to production, this code makes our Express backend also serve our React frontend.
if (ENV.NODE_ENV === 'production') {
  // serve static files
  app.use(express.static(path.join(__dirname, '../frontend/dist')))

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

app.listen(ENV.PORT, () => {
  console.log(`Server running on PORT: ${ENV.PORT}`)
  connectDB()
})
