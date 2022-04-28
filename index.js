const entry = require('./app/app.js')
const serverless = require('serverless-http')
module.exports.main = async (event, context) => {
  return serverless(entry)(event, context)
}