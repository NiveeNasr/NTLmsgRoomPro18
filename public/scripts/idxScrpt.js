$(document).ready(function () {
    $("#pswdconfirm").on("change", function () {
        if ($("#pswdconfirm").val() === $("#usrpswd").val()) {
            $("#pwdvald").css("visibility", "hidden");
        }
        else {
            $("#pswdconfirm").css("border", "2px solid #910");
            $("#pwdvald").css("visibility", "visible");
        }
    });
    $("#rstForm").on("click", function () {
        document.forms[0].reset();
    });
    $("#submit").on("click", function (e) {
        let validFlag = 0;
        let xhr = new XMLHttpRequest();
        let usrnm = document.forms[0].elements.usrnm.value;
        let pswd = document.forms[0].elements.usrpswd.value;
        let confpswd = document.forms[0].elements.pswdconfirm.value;
        let valobj = {};
        e.preventDefault();
        valobj.usrmail = document.forms[0].elements.usrmail.value;
        if ((/^[a-zA-Z]{3,}$/.test(usrnm)) && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(valobj.usrmail)) && (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,}).+$/.test(pswd))&& (pswd === confpswd)) {
            validFlag = 1;
            $("#spvald").css("display", "block");
            $("#spinvald").css("display", "none");
        }
        else {
            $("#spinvald").css("display", "block");
            $("#spvald").css("display", "none");
        }
        if (validFlag) {
            xhr.open("post", '/validating');
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(valobj));
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4)
                    if (xhr.status == 200) {
                        let obj = JSON.parse(xhr.responseText);
                        if (obj.flag) { //usr already exists
                            document.getElementById("spex").style.visibility = "visible";
                            document.getElementById("spex").style.display = "block";
                            document.getElementById("spex").style.color = "red";
                            $("#spvald").css("display", "none");
                            setTimeout(function () {
                                $("#midReg").modal("hide");
                            }, 5000);
                        }
                        else {
                            document.forms[0].submit();
                        }
                    }
            }
        }
    });
});