#! /usr/bin/env node

var program = require('commander'),
    Promise = require('bluebird'),
    inquirer = require('inquirer'),
    prompt = Promise.promisify(inquirer.prompt),
    sqlviz = {
        mysql: require('./lib/mysql.js')
    };

program
  .version('0.0.1')
  .option('-h, --host [host]', 'database host', null)
  .option('-u, --user [user]', 'database user', null)
  .option('-p, --password [pasword]', 'password for username', null)
  .option('-d, --database [database]', 'database to extract schema from', null)
  .parse(process.argv);

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
if (program.database === null) {
    console.error("database is a required parameter");
    process.exit(1);
}

sqlviz.mysql.get_schema(program.database, program.host, program.user, program.password);
