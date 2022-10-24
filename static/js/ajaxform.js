function updateTable(a){
    document.location.reload(true)

    /*
    let c = document.createElement("div");

    c.innerHTML = `
                    <div class="post">
                    <span class="post-text">` + decodeURI(a.split("&")[2].replace("text=", "")) + `</span>
                    <div class="post-info">
                        <span class="post-author"> ` + decodeURI(a.split("&")[1].replace("author=", "")) + `, </span>
                        <span class="post-date"> недавно </span>
                    </div>
                </div>`

    document.querySelector("#guestbook").appendChild(c);
    */

}

function failWith(){
    alert("Пожалуйста, заполните форму корректными данными, имя пользователя должно быть меньше 20 символов, а текст меньше 2000, все поля не пустые");
}

$(document).ready(function () {
    $("#guestbook-form").submit(function (event) {
        sendAjaxForm("guestbook-form", "msg");
        event.preventDefault();
    });
});

function sendAjaxForm(form_ajax, msg) {
    var form = $("#" + form_ajax);
    $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: form.serialize(),
        success: function (response) {
            if (response === "success"){
                updateTable(form.serialize());
            }
            else{
                failWith(response);
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}