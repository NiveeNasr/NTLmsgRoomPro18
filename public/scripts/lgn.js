$(document).ready(function () {
    $("#btnHO").on("click", function () {
        location.replace("/");
    });
    $("#lin").on("click", function (e) {
        let xhr = new XMLHttpRequest();
        xhr.open("post", "/validatingLog");
        let formData = {};
        formData.usrmail = $("#usrmail").val();
        formData.usrpswd = $("#usrpswd").val();
        formData.rememberME = $("#rememberME").val();
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(formData));
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4)
                if (xhr.status == 200) {
                    let obj = JSON.parse(xhr.responseText);
                    if (!obj.flag) {
                        $("#spvald").css("visibility", "visible");
                        document.forms[0].reset();
                        e.preventDefault();
                    }
                    else {
                        document.forms[0].submit();
                    }
                }
        }
    });
});