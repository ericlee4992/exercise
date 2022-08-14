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

function generateFileList(filelist) {
  let list = '<ul>';
  let i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i+1;
  }
  list = list + '</ul>';
  return list;
}

function templateHTML(title, desc, fileList, body) {
  return `
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${fileList}
    <h2>${title}</h2>
    <p>${desc}</p>
    ${body}
  </body>
  </html>
  `
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
      if (queryData.id === undefined) {
        var title = 'Welcome';
        fs.readdir('./data', function(error, filelist) {
          var template = templateHTML(title, 
            "Welcome to the page", 
            generateFileList(filelist),
            `<a href="/create">Create</a>`
          );
          response.end(template);
          response.writeHead(200);  // OK
        })
      } else {
        var title = queryData.id;
        fs.readdir('./data', function(error, filelist) {
          fs.readFile(`data/${queryData.id}`, `utf8`, function(err, desc) {
            var template = templateHTML(title, desc,
              generateFileList(filelist),
              `<a href="/create">Create</a>
               <a href="/update?id=${title}">Update</a>

               <form action="/delete_process" method=post>
                <input type="hidden" name="id" value=${title} />
                <input type="submit" value="delete" />
               </form>
              `
              );
            response.writeHead(200);
            response.end(template);
          })
        })
      }
    } else if (pathname === '/create') {
      fs.readdir('./data', function(error, filelist) {
        var template = templateHTML("Create", "Submit title and description to create a new document", 
          generateFileList(filelist),
          `<form action="http://localhost:3001/create_process" method="post">
          <p><input type="text" name="title"></p>
          <p>
            <textarea name="description"></textarea>
          </p>
          <p><input type="submit"></p>
          </form>`);
        response.writeHead(200);
        response.end(template);
      })
    } else if (pathname === '/update') {
      fs.readdir('./data', function(error, filelist) {
        fs.readFile(`data/${queryData.id}`, `utf8`, function(err, desc) {
          var title = queryData.id;
          var template = templateHTML("Create", "Submit title and description to create a new document", 
            generateFileList(filelist),
            `<form action="http://localhost:3001/update_process" method="post">
            <p><input type="text" name="title" value=${title}></p>
            <p>
              <textarea name="description">${desc}</textarea>
            </p>
            <p><input type="submit"></p>
            </form>`);
          response.writeHead(200);
          response.end(template);
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
    } else if (pathname === '/create_process') {
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
    } else if (pathname === "/update_process") {
      let body = '';
      request.on('data', function(data) {
        body = body + data;
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
    } else if (pathname === "/delete_process") {
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          fs.unlink(`data/${id}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    }

})
app.listen(3001);