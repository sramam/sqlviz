#! /usr/bin/env node

var program = require('commander'),
    Promise = require('bluebird'),
    inquirer = require('inquirer'),
    prompt = Promise.promisify(inquirer.prompt),
    pjson = require('./package.json'),
    sqlviz = {
        mysql: require('./lib/mysql.js')
    };

program
  .version(pjson.version)
  .option('-d, --database [database]', 'database to extract schema from', null)
  .option('-o, --output [filename]', 'filename to write the database to', './dbviz.png')
  .option('-h, --host [host]', 'database host', 'localhost')
  .option('-u, --user [user]', 'database user', 'root')
  .option('-p, --password [password]', 'password for username', null)
  .parse(process.argv);

if (program.database === null) {
    console.error("database is a required parameter");
    process.exit(1);
}
/*
if (program.host === null) {
    console.error("Host is a required parameter");
    process.exit(1);
}
if (program.user === null) {
    console.error("user is a required parameter");
    process.exit(1);
}
if (program.password === null) {
    console.error("password is a required parameter");
    process.exit(1);
    }
    */

sqlviz.mysql.get_schema(program.database, program.output, program.host, program.user, program.password);
