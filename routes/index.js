const fs = require('fs'),
      errors = require('restify-errors')


       
var models = {}
    , models_path = process.cwd() + '/models'
fs.readdirSync(models_path).forEach(function (file) {
    if (file.indexOf('.js') != -1) {
        models[file.split('.')[0]] = require(models_path + '/' + file)
    }
})

//User
server.get("/user", models.users.getAll)
server.post("/user", models.users.createUser)