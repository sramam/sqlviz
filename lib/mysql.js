
module.exports = function() {

    var get_schema = function(db_name, host, user, password) {

        var db = require('mysql-promise')(),
            nunjucks = require('nunjucks'),
            exec = require('child_process').exec,
            Readable = require('stream').Readable;

        db.configure({
            host: host|| 'localhost',
            user: user|| 'root',
            password: password||'root',
            database: db_name
        });

        var tables = {};
        var graph  = {
            name: db_name,
            disable_fields: false,
            models: []
        };

        // fetch all tables in database
        db.query('select table_name, column_name, data_type from information_schema.columns where table_schema = database() order by table_name,ordinal_position;')
            .then(function(response) {
                return response[0];
            }).each(function(el){
                var name = el.table_name;
                tables[name] = tables[name] || {};
                tables[name][el.column_name] = {
                    name: el.column_name,
                    type: el.data_type,
                    blank: false, // to match from django-graphviz
                    fk: null
                };
                return tables;
            }).then(function(resp) {
                // add all constraints
                return db.query(
                    'select ' +
                    'TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,' +
                    'REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME ' +
                    'from INFORMATION_SCHEMA.KEY_COLUMN_USAGE ' +
                    'where ' +
                    'REFERENCED_TABLE_SCHEMA = database();')
                    .then(function(resp) {
                        return resp[0];
                    }).each(function(fk) {
                        tables[fk.TABLE_NAME][fk.COLUMN_NAME].fk = {
                            table: fk.REFERENCED_TABLE_NAME,
                            column: fk.REFERENCED_COLUMN_NAME
                        };
                        return tables;
                    });
            }).then(function(resp) {
                Object.keys(tables).forEach(function(name) {
                    var model = {
                        name: name,
                        fields: [],
                        relations: []
                    };
                    // the fields
                    Object.keys(tables[name]).forEach(function(c) {
                        var col = tables[name][c];
                        model.fields.push({
                            name: col.name,
                            type: col.type,
                            blank: col.blank
                        });
                        if (col.fk !== null) {
                            // the links
                            model.relations.push({
                                target: col.fk.table,
                                type: tables[col.fk.table][col.fk.column].type,
                                name: col.fk.column,
                                arrows: '' // TODO: add capability to detect relation type & modify arrows.
                            });
                        }
                    });
                    graph.models.push(model);
                });
                // we can finally work on the nunjucks (jinja2) template
                nunjucks.configure('tpl', { autoescape: true});
                var dot_str = nunjucks.render('sqlviz.tpl', graph);
                // run dot to generate a png.
                //
                exec('which dot', function(err, stdout, stderr) {
                    if (!err && !stderr) {
                        // has dot.
                        var fs = require('fs'),
                            tmp_dot_file = '__sqlviz__.dot',
                            out_filename = db_name + '.png',
                            dot = stdout.trim(),
                            cmd = dot + ' -Tpng -o ' + out_filename + ' ' + tmp_dot_file;
                        fs.writeFileSync(tmp_dot_file, dot_str);
                        console.log('executing \n' + cmd);
                        exec(cmd);
                        console.log('Generated ' + out_filename);
                        process.exit(0);
                    } else {
                        console.error(stderr + ' ' + err);
                        throw("Can't find dot to generate a png. Is graphviz installed?");
                    }
                });
            });
    },
    get_available_databases = function(host, user, password) {
        var db = require('mysql-promise')(), 
            db_list = [];
        db.configure({
            host: host,
            user: user,
            password: password
        });
        return db.query('show databases;').then(function(data) {
            return data[0].reduce(function(acc, d) {
                acc.push(d.Database);
                return acc;
            }, []);
        });
    };
    return {
        get_available_databases: get_available_databases,
        get_schema: get_schema
    };
}();
