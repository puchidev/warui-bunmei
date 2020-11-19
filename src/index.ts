/* eslint-disable no-global-assign, @typescript-eslint/no-var-requires */
// Enable ESModule syntax for the whole project
require = require('esm')(module)
module.exports = require('./main.ts')
