const fs = require('fs')

const users = JSON.parse(fs.readFileSync('.all-contributorsrc').toString())

console.log(users.contributors.length)
