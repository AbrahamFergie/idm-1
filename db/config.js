/* eslint-disable no-console */
var url = require('url')

if (process.env.NODE_ENV === 'development') {
  require('dotenv').load()
}

var run = !module.parent

var _dbConfig
function config() {
  if (!_dbConfig) {
    var parsedUrl = url.parse(process.env.RETHINKDB_URL)
    _dbConfig = {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port, 10),
      db: parsedUrl.pathname.slice(1),
      authKey: parsedUrl.auth ? parsedUrl.auth.split(':')[1] : undefined,
    }
    if (process.env.RETHINKDB_CERT) {
      _dbConfig.ssl = {
        ca: process.env.RETHINKDB_CERT
      }
    }
  }
  return _dbConfig
}

if (run) {
  console.log(JSON.stringify(config()))
}

module.exports = config
