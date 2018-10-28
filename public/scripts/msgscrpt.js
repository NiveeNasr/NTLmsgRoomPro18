$(document).ready(function () {
    let socket = io();
    document.getElementById("btnLO").addEventListener("click", function () {
        location.replace("/logout");
    });
    socket.on("all", (data) => {
        let msgDiv = document.getElementById("d2");
        msgDiv.innerHTML += "message from " + data.usr.bold().fontcolor('red') + " : " + data.msg + "<br/>";
        if (msgDiv.scrollTop + msgDiv.clientHeight < msgDiv.scrollHeight) {
            msgDiv.scrollTop = msgDiv.scrollHeight;
        }
    });
    $("#sndmsg").on("click", () => {
        let usr = document.cookie;
        let nm = usr.split("=")[0];
        let val = usr.split("=")[1];
        let msg = document.getElementById("txt").value;
        $("#txt").val("");
        socket.emit("message", {
            [nm]: val, msg: msg
        });
    });
    $("#getHist").on("click", (e) => {
        var msg = "";
        socket.emit("historyReq", "");
        socket.on("historyRes", (data) => {
            for (let i in data) {
                msg += "Message from " + (Object.values(JSON.parse(data[i]))[0]).bold().fontcolor('red') + " : " + Object.values(JSON.parse(data[i]))[1] + "<br/>";
            }
            $("#d2").prepend("<hr>");
            $("#d2").prepend(msg);
        });
    });
});
$(window).on('beforeunload', () => {
    socket.close();
});