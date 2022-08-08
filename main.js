var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring')

/*
  C - Create
  R - Read
  U - Update
  D - Delete

  synchronous / asynchronous
*/

function fileList(filelist) {
  let list = '<ul>';
  let i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i+1;
  }
  list = list + '</ul>';
  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var title = queryData.id;
    if(_url == '/'){
      title = 'Welcome';
    }
    if(_url == '/favicon.ico'){
      return response.writeHead(404);
    }
    response.writeHead(200); // OK
    console.log(queryData)
    console.log(pathname)
    if (pathname === '/') {
      fs.readdir('./data', function(error, filelist) {
        fs.readFile(`data/${queryData.id}`, `utf8`, function(err, desc) {
          var template = `
          <html>
          <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1><a href="/">WEB</a></h1>
            ${fileList(filelist)}
            <h2>${title}</h2>
            <p>${desc}</p>

            <div>
              <a href="/update?id=${title}">update</a>
              <a href="/delete?id=${title}">delete</a>
            </div>
    
            <form action="http://localhost:3001/create" method="post">
              <p><input type="text" name="title"></p>
              <p>
                <textarea name="description"></textarea>
              </p>
              <p><input type="submit"></p>
            </form>

    
          </body>
          </html>
          `;
          response.end(template);
        })
      })
    } else if (pathname === '/create') {
      let body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        let post = qs.parse(body);
        let title = post.title;
        let description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {Location: `/?id=${title}`}); // Redirect
          response.end();
        })
      });
    } else if (pathname === '/update') {
      let body = '';
      request.on('data', function(data) {
        console.log(data)
        body = body + data;
        console.log(body)
      });
      request.on('end', function() {
        let post = qs.parse(body);
        let id = post.id;
        let title = post.title;
        let description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(err) {
          fs.writeFile(`data/${title}`, description, `utf8`, function(err) {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
        })
      })
    } else if (pathname === '/delete') {
      let body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        let post = qs.parse(body);
        let id = post.id;
        fs.unlink(`data/${id}`, function(err) {
          response.writeHead(302, {Location: `/`});
          response.end();
        })
      })
    }

})
app.listen(3001);