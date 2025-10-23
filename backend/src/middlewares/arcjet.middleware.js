import aj from '../lib/arcjet.js'
import { isSpoofedBot } from '@arcjet/inspect'

export const arcjetProtection = async (req, res, next) => {
  try {
    // Protect the request using arcjet
    const decision = await aj.protect(req)
    console.log('Arcjet decision', decision)

    // check if the request should be denied
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests.',
        })
      } else if (decision.reason.isBot()) {
        return res.status(403).json({
          success: false,
          message: 'No bots allowed',
        })
      } else {
        return res.status(403).json({
          success: false,
          message: 'Forbidden',
        })
      }
    } else if (decision.ip.isHosting()) {
      // Requests from hosting IPs are likely from bots
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      })
    } else if (decision.results.some(isSpoofedBot)) {
      // Check for spoofed bots ==> is a type of bot that acts like human
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      })
    } else {
      // After everything is checked the request is allowed and we proceed to next middleware
      next()
    }
  } catch (error) {
    console.error('Arcjet protection error:', error)
    // In case of error, allow the request to proceed (fail-open)
    next()
  }
}
