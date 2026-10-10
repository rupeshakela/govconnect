const Joi = require('joi');

module.exports.schemeSchema = Joi.object({
  scheme: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().valid('Farmers', 'Women', 'Students', 'Senior Citizens', 'Startups', 'Businesses', 'Healthcare', 'General').required(),
    eligibilityCriteria: Joi.string().required(),
    incomeLimit: Joi.number().min(0).default(300000),
    minAge: Joi.number().min(0).default(0),
    maxAge: Joi.number().min(0).default(100),
    genderRequirement: Joi.string().valid('Any', 'Male', 'Female').default('Any'),
    state: Joi.string().allow('', null),
    benefitAmount: Joi.number().min(0).default(0),
    documentsRequired: Joi.string().required(),
    applicationProcess: Joi.string().required(),
    officialWebsite: Joi.string().uri().required()
  }).required()
});

module.exports.profileSchema = Joi.object({
  profile: Joi.object({
    age: Joi.number().min(0).max(120).required(),
    gender: Joi.string().valid('Any', 'Male', 'Female', 'Other').required(),
    annualIncome: Joi.number().min(0).required(),
    occupation: Joi.string().required(),
    qualification: Joi.string().required(),
    casteCategory: Joi.string().required(),
    state: Joi.string().allow('', null),
    maritalStatus: Joi.string().valid('Single', 'Married', 'Widowed', 'Divorced').default('Single'),
    disabilityStatus: Joi.boolean().default(false)
  }).required()
});

module.exports.userSignupSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().trim().required().messages({
    'string.email': 'Please enter a valid email address.'
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be exactly 10 digits.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long.'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.'
  })
});

module.exports.otpVerifySchema = Joi.object({
  userId: Joi.string().required(),
  emailOtp: Joi.string().length(6).required(),
  phoneOtp: Joi.string().length(6).required()
});
