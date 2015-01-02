sqlviz
======

SQL schema visualization. Built upon node.js &amp; graphviz.

A nodejs port of [django-graphviz](https://code.djangoproject.com/wiki/DjangoGraphviz).

Sqlviz actually derives SQL schema by querying your database. In that, it is 
designed to be independent of your web application framework.

Currently, sqlviz only supports mysql. This is more a limitation of my need than anything else.


## Requirements
- [graphviz](http://www.graphviz.org/Download..php) to be installed for your platform.

## Limitations
- Only generates png
- Only supports MySQL
- Testing has been reather limited


Drop me a line if you’d like more databases supported. I can use help with complex
database schemas being run through the tool. Please report any bugs you find.

