var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;
var crypto=require('crypto');
var bodyParser=require('bodyparser');
var config={
    user:'rameshreddy799',
    database:'rameshreddy799',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password:process.env.DB_PASWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

function createTemplate(data){
    var title=data.title;
    var date=data.date;
    var heading=data.heading;
    var content=data.content;
var htmlTemplate=`<html>
    <head>
          <title>
                 ${title}
           </title>
        <meta name="viexport" content="width-device-width, initial-scale-1" />
        <link href="/ui/style.css" rel="stylesheet" />
       
        </head>
        <body>
            <div class="container">
            <div>
                <a href="/">Home</a>
            </div>
            <hr/>
            <h3>
                ${heading}
            </h3>
            <div>
                ${date.tDateoString()}
            </div>
            <div>
                ${content}
            </div>
            </div>
        </body>
</html>
`;
return htmlTemplate;
}
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
function hash(input, salt){
    //how  do we create hash
    var hashed=crypto.pbkdf2Sync(input,salt,1000,512,'sha512');
    return ['pbkdf2',"10000",salt,hashed.toString('hex')].join("$");
}
app.get('/hash/:input',function(req,res){
    var hashedString=hash(req.params.input,'this-is-some-random-string');
    res.send(hashedString);
});
app.post('/create-user',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    var salt=crypto.RandomBytes(128).toString('hex');
    var dbString=hash(password,salt);
    pool.query('INSERT INTO "user" (username,password) VALUES($1,$2)',[username,dbString],function(err,result){
    if(err){
           res.status(500).send(err.toString());
       }else{
           res.send('user successfully created: '+username);
       }
    });
});
var pool=new Pool(config);
app.get('/test-db',function(req,res){
    pool.query('SELECT * FROM test',function(err,result){
       if(err){
           res.status(500).send(err.toString());
       }else{
           res.send(JSON.stringify(result.rows));
       }
       
    });
});
