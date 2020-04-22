util = {
    get: function(p) {
        $.ajax({
            url: p.url,
            data: JSON.stringify(p.data),
            contentType: "application/json",
            type: "GET",
            success: function(data, textStatus, jqXHR) {
                p.callback({
                    success: true,
                    textStatus: textStatus,
                    data: data
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == "403") {
                    alert(jqXHR.responseJSON.err_message);
                    window.location = "/logout"
                } else {
                    p.callback({
                        success: false,
                        textStatus: textStatus,
                        error: jqXHR.status,
                        data: jqXHR.responseJSON
                    });
                }
            }
        });
    },

    post: function(p) {
        $.ajax({
            url: p.url,
            type: "POST",
            data: JSON.stringify(p.data),
            contentType: "application/json",

            success: function(data, textStatus, jqXHR) {
                console.log({ data, textStatus, jqXHR })
                if (p.callback) {
                    p.callback({
                        success: true,
                        textStatus: textStatus,
                        data: data
                    })
                } else if (p.success) {
                    p.success(data);
                } else {
                    console.log({ url: p.url, status: "success", data: data });
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {

                let err = {
                    url: p.url,
                    status: jqXHR.status,
                    message: (jqXHR.responseJSON === undefined) ? jqXHR.statusText : jqXHR.responseJSON.err_message,
                };
                console.log({ jqXHR, textStatus, errorThrown })
                if (jqXHR.status == "403") {
                    alert(jqXHR.responseJSON.err_message);
                    window.location = "/logout"
                } else if (p.callback) {
                    p.callback({
                        success: false,
                        textStatus: textStatus,
                        error: jqXHR.status,
                        data: jqXHR.responseJSON
                    });
                } else if (p.error) {
                    p.error(err);
                } else if (p.nopop) {
                    console.log(err);
                } else {
                    alert("url : " + p.url + "\nstatus : " + err.status + "\nmessage : " + err.message);
                }
            }
        });
    },

    getCookie: function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },

    setCookie: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
}