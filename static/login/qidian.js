! function (o, e) {
    "function" == typeof define ? "object" == typeof LBF ? LBF.define("common.login.qidian", function () {
        return e(o)
    }) : define(function () {
        return e(o)
    }) : window.qdLogin = e(o)
}(this, function (o) {
    var e = o.$ || o.jQuery || o.Zepto,
        t = function () {
            try {
                return "dev" === g_data.envType || "oa" === g_data.envType || "pre" === g_data.envType ? "pre" : ""
            } catch (o) {
                return ""
            }
        }(),
        n = {},
        a = {
            init: function (e) {
                return this.httpHeader = location.protocol, n.close = a._loginOnClose, o.top.qdlogin_onSuccess = n.success = a._loginOnSuccess, o.top.qdlogin_onError = n.error = a._loginOnError, a._receivePostMessage(), this.autoLogin(e)
            },
            isLogin: function () {
                return !(!i.get("ywguid") || !i.get("ywkey"))
            },
            _receivePostMessage: function () {
                "undefined" != typeof o.postMessage ? o.onmessage = function (e) {
                    var t, a = e || o.event;
                    switch ((t = "undefined" != typeof JSON ? JSON.parse(a.data) : this._str2JSON(a.data)).action) {
                        case "close":
                            n.close(t.data)
                    }
                } : navigator.ywlogin_callback = function (o) {
                    switch (data = this._str2JSON(o.data), data.action) {
                        case "close":
                            n.close(data.data)
                    }
                }
            },
            setEnv: function (o) {
                o && (t = o)
            },
            autoLogin: function (o) {
                var a;
                try {
                    a = e.Deferred()
                } catch (l) {
                    a = null
                }
                var r = this;
                e("body");
                if (i.get("ywguid") || i.get("ywkey")) a && a.reject();
                else {
                    var c = {
                        areaid: 1,
                        appid: 10,
                        format: "jsonp"
                    };
                    if (o && (c.appid = 13), "" != t && "pre" != t) s = "https://oaptlogin.qiyan.com/login/checkStatus?";
                    else var s = "https://ptlogin.qiyan.com/login/checkStatus?";
                    for (var u in c) s = s + u + "=" + c[u] + "&";
                    e.ajax({
                        type: "GET",
                        async: !1,
                        url: s,
                        dataType: "jsonp",
                        global: !1,
                        jsonpCallback: "autoLoginHandler",
                        jsonp: "method",
                        success: function (o) {
                            0 == o.code ? (i.set("ywkey", o.data.ywKey, r.getRootDomain(), "/", 0), i.set("ywguid", o.data.ywGuid, r.getRootDomain(), "/", 0), a ? a && a.resolve() : n.autoSuccess && "function" == typeof n.autoSuccess && n.autoSuccess()) : a && a.reject()
                        },
                        error: function (o) {
                            a && a.reject()
                        }
                    })
                }
                return setTimeout(function () {
                    a && a.reject()
                }, 5e3), a && a.promise()
            },
            getRootDomain: function () {
                var o = document.domain.split("."),
                    e = o.length;
                return e >= 2 ? "." + o[e - 2] + "." + o[e - 1] : ".qiyan.com"
            },
            getPCLoginUrl: function (o) {
                if ("" != t && "pre" != t) n = "https://oapassport.qiyan.com/?";
                else var n = "https://passport.qiyan.com/?";
                var a = {
                    returnurl: o && o.returnurl || location.href,
                    popup: 1,
                    ticket: 1,
                    target: "iframe",
                    areaid: 1,
                    appid: 10,
                    auto: 1,
                    autotime: 30,
                    version: "1.0"
                };
                return "object" == typeof o && e.extend(a, o), n += e.param(a)
            },
            getMLoginUrl: function (o) {
                if ("" != t && "pre" != t) n = "https://oapassport.qiyan.com/?";
                else var n = "https://passport.qiyan.com/?";
                var a = {
                    popup: 0,
                    ticket: 1,
                    target: "top",
                    areaid: 1,
                    appid: 13,
                    auto: 1,
                    autotime: 30,
                    version: "1.0",
                    source: "m"
                };
                return "object" == typeof o && e.extend(a, o), a.returnurl = a.returnurl || location.href, n += e.param(a)
            },
            showPCLogin: function (o) {
                var t = e("body"),
                    n = ['<div class="qdlogin-wrap">', '<iframe id="loginIfr" src="' + this.getPCLoginUrl(o) + '" name="frameLG" id="frameLG" allowtransparentcy="true" width="100%" height="100%" scrolling="no" frameborder="no"></iframe>', "</div>"].join("");
                e(".mask") && e(".mask").remove(), e(".qdlogin-wrap") && e(".qdlogin-wrap").remove(), t.append('<div class="mask"></div>'), t.append(n)
            },
            showMLogin: function (o) {
                e("body");
                var t = this.getMLoginUrl(o);
                location.href = t
            },
            goLogout: function () {
                if ("" != t && "pre" != t) o = "//oaptlogin.qiyan.com/login/logout?";
                else var o = "//ptlogin.qiyan.com/login/logout?";
                var e = {
                    appid: 10,
                    areaid: 1,
                    source: "pc",
                    version: "1.0",
                    format: "redirect"
                };
                for (var a in e) o += a + "=" + e[a] + "&";
                var i = document.createElement("script");
                i.src = o, i.type = "text/javascript", i.id = "sso" + Math.random(), i.onloadDone = !1, i.onload = function () {
                    i.onloadDone = !0, n.logout && "function" == typeof n.logout && n.logout()
                }, i.onreadystatechange = function () {
                    "loaded" !== i.readyState && "complete" !== i.readyState || i.onloadDone || (n.logout && "function" == typeof n.logout && n.logout(), i.onloadDone = !0)
                }, document.getElementsByTagName("head")[0].appendChild(i)
            },
            _loginOnClose: function () {
                a.hideLoginIfr()
            },
            close: function (o, e) {
                e && "function" == typeof e && (n.close = function () {
                    o ? e.call(o) : e()
                })
            },
            _loginOnSuccess: function () {
                a.hideLoginIfr()
            },
            success: function (e, t) {
                t && "function" == typeof t && (n.success = function () {
                    e ? t.call(e) : t()
                }, o.top.qdlogin_onSuccess = n.success)
            },
            _loginOnError: function (o, e) {
                alert(e), a.hideLoginIfr(), 10003 === o && a.goLogout()
            },
            error: function (e, t) {
                t && "function" == typeof t && (n.error = function () {
                    e ? t.call(e) : t()
                }, o.top.qdlogin_onError = n.error)
            },
            logout: function (o, e) {
                e && "function" == typeof e && (n.logout = function () {
                    o ? e.call(o) : e()
                })
            },
            autoSuccess: function (o) {
                o && "function" == typeof o && (n.autoSuccess = function () {
                    o()
                })
            },
            hideLoginIfr: function () {
                var o = e(".mask");
                e(".qdlogin-wrap").remove(), o.remove()
            },
            setCallback: function (o, e, t) {
                switch (o) {
                    case "close":
                        a.close(e, t);
                        break;
                    case "success":
                        a.success(e, t);
                        break;
                    case "error":
                        a.error(e, t);
                        break;
                    case "logout":
                        a.logout(e, t);
                        break;
                    case "autoSuccess":
                        a.autoSuccess(t)
                }
            },
            _str2JSON: function (o) {
                var e = /(?:^|:|,)(?:\s*\[)+/g,
                    t = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
                    n = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
                return /^[\],:{}\s]*$/.test(o.replace(t, "@").replace(n, "]").replace(e, "")) ? new Function("return " + o)() : {}
            }
        },
        i = {
            get: function (o) {
                var e = document.cookie.match(new RegExp("(^| )" + o + "=([^;]*)(;|$)"));
                return null != e ? decodeURIComponent(e[2]) : null
            },
            set: function (o, e, t, n, a) {
                a && (a = new Date(+new Date + a));
                var i = o + "=" + escape(e) + (a ? "; expires=" + a.toGMTString() : "") + (n ? "; path=" + n : "") + (t ? "; domain=" + t : "");
                i.length < 4096 && (document.cookie = i)
            }
        };
    return a
});