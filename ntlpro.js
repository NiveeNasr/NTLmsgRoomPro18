var express = require("express");
var path = require("path");
var fs = require("fs");
var app = express();
var c = require("./cryptMod");
var bodyparser = require("body-parser");
var cookieParser = require('cookie-parser');
////////////
var http = require("http").createServer(app);
var serverio = require("socket.io")(http);
/////////////////////
//bodyparser middleware
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(bodyparser.json());

//cookie middleware
app.use(cookieParser());
/////////////
serverio.on("connection", function (client) {
    console.log("client connected");
   
    client.on("message", function (data) {
        
        let msg = data[Object.keys(data)[(Object.keys(data).length) - 1]];

        let cookief = client.handshake.headers.cookie;
        let cnmidx = cookief.indexOf(c.encrypt("usrname"));
        let cnmstpidx = cookief.indexOf(";", cnmidx);
        let coo = "";
        if (cnmstpidx == -1)
            coo = cookief.substr(cnmidx, (cookief.length - 1));
        else
            coo = cookief.substr(cnmidx, cnmstpidx);

        let unm = c.decrypt(coo.split("=")[1]);
        let toSave = { usr: unm, msg: msg };
        
        fs.readFile("./data.json", function (e, d) {

            let dataF = JSON.parse(d); 
            dataF.push(c.encrypt(JSON.stringify(toSave)));

            fs.writeFileSync("./data.json", JSON.stringify(dataF), function (e) {
                if (e) console.log(e);
                else console.log("data stored");
            });

            serverio.sockets.emit("all", toSave);
        });
    });

    client.on("historyReq", function () {
        fs.readFile("./data.json", function (err, data) {
            if (err) console.log("cant read file");
            else {
                let obj = JSON.parse(data);
                let msg = [];
                
                for (i in obj) {
                    msg.push(c.decrypt(obj[i]))
                }
                serverio.sockets.emit("historyRes", msg); 
            }
        });
    });
});

////////
app.get("/", function (req, res) {
    res.clearCookie(c.encrypt("usrname"));
    res.sendFile(path.join(__dirname + "/index.html"));
});

////////////////////////////dbdump//////////////////////////////////////
app.get("/dbdump", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/dump.html"));
});

app.get("/history", function (req, res) {
    fs.readFile("./data.json", function (e, d) {
        let dataHist = JSON.parse(d); //{usr:,msg:}
        let hist = [];
        for (let i in dataHist) {
            hist.push(JSON.parse(c.decrypt(dataHist[i])));
        }

        //res.send(hist);
         res.send(JSON.stringify(hist).split("},{").join("},<br/>{"));

    });
});

app.get("/users", function (req, res) {
    fs.readFile("./usrs.json", function (e, d) {
        let dataUsr = JSON.parse(d); //{usr:,msg:}
        let usr = [];
        for (let i in dataUsr) {

            let o = JSON.parse(c.decrypt(dataUsr[i]));
            o.usrpswd = "***";
            o["pswdconfirm"] = "***";
            usr.push(o);
        }
        res.send(JSON.stringify(usr).split("},{").join("},<br/>{"));

    });
});
//////////////////

app.get("/index.html", function (req, res) {
    res.redirect("/");
});
app.get("/logout", function (req, res) { res.redirect("/"); });

/////////////////////logIn Get Req////////////
app.get("/login", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/login.html"));
});

////////////////////logIn Post Req//////
app.post("/login", function (req, res) {
    fs.readFile("./usrs.json", function (e, d) {
        let dataF = JSON.parse(d);
        dataF.push(c.encrypt(JSON.stringify(req.body)));

        fs.writeFileSync("./usrs.json", JSON.stringify(dataF), function (e) {
            if (e) console.log(e);
            else console.log("new registered stored");
        });
        res.sendFile(path.join(__dirname + "/public/login.html"));
    });

});
/////////////////////validating that its 1st time to register///
app.post("/validating", function (req, res) {

    fs.readFile("./usrs.json", function (e, d) {
        let dataF = JSON.parse(d);
        let flag = 0;
        for (let i = 0; ((i < dataF.length) && (flag == 0)); i++) {
            let o = JSON.parse(c.decrypt(dataF[i]));
            if (req.body.usrmail === o.usrmail) { flag = 1; }
       
        }
        res.json({ flag: flag });
    });
});
//////////////////////////validating////////////////////
app.post("/validatingLog", function (req, res) {

    fs.readFile("./usrs.json", function (e, d) {
        let dataF = JSON.parse(d);
        let flag = 0, expire, nm, val;
        for (let i = 0; ((i < dataF.length) && (flag == 0)); i++) {
            let o = JSON.parse(c.decrypt(dataF[i]));
            if ((req.body.usrmail === o.usrmail) && (req.body.usrpswd === o.usrpswd)) {
                if (req.body.rememberME)
                    expire = new Date(Date.now() + 900000);
                else
                    expire = new Date(Date.now() - 900000);
                nm = c.encrypt("usrname");//el usernm
                val = c.encrypt(JSON.stringify(o.usrnm));
                flag = 1;
                res.cookie(nm, val, { maxAge: expire, httpOnly: false });
            }
            else { flag = 0; }
        }
        res.json({ flag: flag });
    });
});
/////////////////////////////////////////////
app.post("/msgroom", function (req, res) {    
    res.sendFile(path.join(__dirname + "/public/msgroom.html"));
});
//////////////////////////////////////////
//built-in middleware
app.use(express.static("./public"));

//////////////default 404///////////////////
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/not.html"))
});
////////////////////////////////////////////
http.listen(process.env.PORT ||5813, function () {
    console.log("listening..")
});