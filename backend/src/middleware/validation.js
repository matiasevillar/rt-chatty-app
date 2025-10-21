import validator from 'validator'

const validateSignupData = (data) => {
  const errors = {}
  const { firstName, lastName, email, password } = data

  // Check required fields
  if (!firstName) {
    errors.firstName = 'First name is required'
  }

  if (!lastName) {
    errors.lastName = 'Last name is required'
  }

  if (!email) {
    errors.email = 'Email is required'
  } else if (!validator.isEmail(email.trim())) {
    errors.email = 'Please provide a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
  } else {
    // Check for a valid password format only if password exists and is long enough
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(password)) {
      errors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  }

  return {
    // if errors length 0 then no issue
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Middleware functions

export const validateSignup = (req, res, next) => {
  const validation = validateSignupData(req.body) // return {isValid, errors}

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation Failed',
      errors: validation.errors,
    })
  }

  // Sanitize and add to req object for use in controller
  req.sanitizedBody = {
    firstName: req.body.firstName ? validator.escape(req.body.firstName.trim()) : '',
    lastName: req.body.lastName ? validator.escape(req.body.lastName.trim()) : '',
    email: req.body.email ? req.body.email.trim().toLowerCase() : '',
    password: req.body.password || '',
  }
  //The next() function is a crucial part of Express.js middleware. It tells Express to continue to the next middleware or route handler in the chain.
  next()
}
