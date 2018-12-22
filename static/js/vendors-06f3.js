! function (e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
        var t;
        t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, t.shutterstockPrivateanalyticsListener = e()
    }
}(function () {
    return function e(t, n, o) {
        function i(a, c) {
            if (!n[a]) {
                if (!t[a]) {
                    var s = "function" == typeof require && require;
                    if (!c && s) return s(a, !0);
                    if (r) return r(a, !0);
                    var l = new Error("Cannot find module '" + a + "'");
                    throw l.code = "MODULE_NOT_FOUND", l
                }
                var u = n[a] = {
                    exports: {}
                };
                t[a][0].call(u.exports, function (e) {
                    var n = t[a][1][e];
                    return i(n || e)
                }, u, u.exports, e, t, n, o)
            }
            return n[a].exports
        }
        for (var r = "function" == typeof require && require, a = 0; a < o.length; a++) i(o[a]);
        return i
    }({
        1: [function (e, t, n) {
            (function (n) {
                var o = e("./logger.js"),
                    i = e("./handler.js"),
                    r = e("./tracker.js"),
                    a = e("./binder.js"),
                    c = e("./validator.js");
                ! function (e, n) {
                    t.exports = n, e.AnalyticsListener = n(e)
                }(n, function (e) {
                    var t = o(e),
                        n = i(e),
                        s = r(e),
                        l = a(e),
                        u = c(e),
                        d = function () {
                            var o;
                            t.log("validateTrackingData"), o = Array.prototype.slice.call(e.document.querySelectorAll("[data-track]")), o.forEach(function (e) {
                                var o = e.getAttribute("data-track"),
                                    i = n.parseTrackAttribute(o),
                                    r = u.buildValidateMessage(i, o, e);
                                r.length && (r.unshift(e), r.unshift("Issues found with the following element: "), t.error.apply({}, r))
                            })
                        };
                    return {
                        listen: function (o, i) {
                            var r;
                            if (!(o instanceof Function)) return void t.error("Analytics Listener requires that an event delegation library, such as jQuery, be passed into the listen function.  Exiting.");
                            t.log("listen"), e.debugAnalytics && d(), r = i || function () {
                                return {}
                            }, l.attachDirectEventListeners(l.directEventActionsSelector, "mouseenter", n.handleAction("hover", r, o), o), l.setUpListeners(o, n.handleAction, r)
                        },
                        validate: d,
                        track: s.sendTrack
                    }
                })
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            "./binder.js": 2,
            "./handler.js": 3,
            "./logger.js": 4,
            "./tracker.js": 5,
            "./validator.js": 6
        }],
        2: [function (e, t, n) {
            t.exports = function (e) {
                function t(t) {
                    var n = e.document.createElement("style"),
                        o = "@keyframes nodeInserted{from{outline-color:#fff}to{outline-color:#000}}@-moz-keyframes nodeInserted{from{outline-color:#fff}to{outline-color:#000}}@-webkit-keyframes nodeInserted{from{outline-color:#fff}to{outline-color:#000}}@-ms-keyframes nodeInserted{from{outline-color:#fff}to{outline-color:#000}}@-o-keyframes nodeInserted{from{outline-color:#fff}to{outline-color:#000}}" + t + "{animation-duration:.01s;-o-animation-duration:.01s;-ms-animation-duration:.01s;-moz-animation-duration:.01s;-webkit-animation-duration:.01s;animation-name:nodeInserted;-o-animation-name:nodeInserted;-ms-animation-name:nodeInserted;-moz-animation-name:nodeInserted;-webkit-animation-name:nodeInserted};";
                    n.type = "text/css", n.styleSheet ? n.styleSheet.cssText = o : n.appendChild(e.document.createTextNode(o)), e.document.getElementsByTagName("head")[0].appendChild(n)
                }

                function n(n, o, i, r) {
                    function a(e) {
                        "nodeInserted" === (e.animationName || e.originalEvent && e.originalEvent.animationName) && r(e.target).off(o, i).on(o, i)
                    }
                    r(e.document).on(o, n, i), t(n), r(e.document).on("animationstart", a), r(e.document).on("MSAnimationStart", a), r(e.document).on("webkitAnimationStart", a)
                }

                function o(t, n, o) {
                    i.forEach(function (i) {
                        var r = "linkClick" === i ? "click" : i;
                        t(e.document).on(r, "[data-track]", n(i, o, t))
                    })
                }
                var i = ["click", "submit", "linkClick", "change"],
                    r = ["hover"];
                return {
                    directEventActions: r,
                    supportedEventActions: i.concat(r),
                    directEventActionsSelector: r.map(function (e) {
                        return '[data-track^="' + e + '"]'
                    }).join(","),
                    attachDirectEventListeners: n,
                    setUpListeners: o
                }
            }
        }, {}],
        3: [function (e, t, n) {
            var o = e("./logger.js"),
                i = e("./tracker.js");
            t.exports = function (e) {
                function t(e) {
                    return JSON.parse(e)
                }

                function n(e) {
                    var n, o, i = e.trim().split(".");
                    if (i.length < 3 || -1 !== e.indexOf(" ")) return null;
                    if (n = {
                            eventAction: i[0].split(","),
                            pageSection: i[1],
                            eventLabel: i[2]
                        }, o = i.slice(3).join("."), o.length) try {
                        n.eventValue = t(o)
                    } catch (e) {
                        f.error("Unable to parse eventValue as JSON: " + e.toString()), n.eventValue = null
                    }
                    return n
                }

                function r(t, n, o) {
                    "string" == typeof t[n] && e.debugAnalytics && f.error("`getFirstData` function assigned data to reserved property: " + n + ". This data will be overwritten."), t[n] = o
                }

                function a(e) {
                    return e.selectedOptions ? [].slice.call(e.selectedOptions) : [].slice.call(e.options).filter(function (e) {
                        return e.selected
                    })
                }

                function c(t, n, o) {
                    "select-multiple" === t.type ? r(o.eventValue, "formElementValue", a(t).map(function (e) {
                        return e.value
                    })) : "checkbox" === t.type ? r(o.eventValue, "formElementValue", [].slice.call(e.document.getElementsByName(t.name)).filter(function (e) {
                        return e.checked
                    }).map(function (e) {
                        return e.value
                    })) : void 0 !== t.value && r(o.eventValue, "formElementValue", t.value), m.sendTrack(n, o)
                }

                function s(e, t, n, o) {
                    var i = (new Date).getTime(),
                        a = function () {
                            var c = (new Date).getTime() - i;
                            c > (n.eventValue.hoverTimeThreshold || 1500) && (r(n.eventValue, "hoverTime", c), m.sendTrack(t, n)), o(e).off("mouseleave", a)
                        };
                    o(e).on("mouseleave", a)
                }

                function l(e, t) {
                    m.sendTrack(e, t)
                }

                function u(e, t, n) {
                    m.link(e, t, n)
                }

                function d(t, o, i) {
                    return function (a) {
                        var d, m = this.getAttribute("data-track"),
                            v = a.target,
                            p = n(m);
                        if (p && p.eventAction.indexOf(t) > -1) {
                            d = o(this, a, m), r(d, "eventAction", t), r(d, "pageSection", p.pageSection), r(d, "eventLabel", p.eventLabel), r(d, "url", e.document.URL), r(d, "eventCategory", "userInteraction"), r(d, "name", void 0 !== v.name && "" !== v.name ? v.name : v.textContent), void 0 !== p.eventValue && null !== p.eventValue ? r(d, "eventValue", p.eventValue) : r(d, "eventValue", {});
                            try {
                                "linkClick" === t ? u(v, m, d) : "hover" === t ? s(v, m, d, i) : "change" === t ? c(v, m, d) : l(m, d)
                            } catch (e) {
                                f.error(e)
                            }
                        }
                    }
                }
                var f = o(e),
                    m = i(e);
                return {
                    parseTrackAttribute: n,
                    assignProp: r,
                    handleAction: d
                }
            }
        }, {
            "./logger.js": 4,
            "./tracker.js": 5
        }],
        4: [function (e, t, n) {
            t.exports = function (e) {
                function t() {
                    e.debugAnalytics && e.console.log.apply(e.console, arguments)
                }

                function n() {
                    e.debugAnalytics && e.console.error.apply(e.console, arguments)
                }
                return {
                    log: t,
                    error: n
                }
            }
        }, {}],
        5: [function (e, t, n) {
            var o = e("./logger.js");
            t.exports = function (e) {
                function t(t, n, o) {
                    i.log("Tracking Link: ", n, o), e.analytics.trackLink(t, n, o)
                }

                function n(t, n) {
                    var o;
                    n.visit ? n.visit.visitorId ? o = {
                        Optimizely: {
                            userId: n.visit.visitorId
                        }
                    } : i.error("No visitor ID present in analytics data", n) : i.error("Analytics data missing required object 'visit'!", t, n), i.log("Tracking: ", t, n, o), e.analytics.track(t, n, o)
                }
                var i = o(e);
                return {
                    link: t,
                    sendTrack: n
                }
            }
        }, {
            "./logger.js": 4
        }],
        6: [function (e, t, n) {
            var o = e("./binder.js");
            t.exports = function (e) {
                function t(e, t, o) {
                    var i = [];
                    return e ? (e.eventAction.forEach(function (e, t) {
                        -1 === n.supportedEventActions.indexOf(e) ? i.push("\n- Cannot track element because its eventAction `" + e + "` is not one of supported types: [" + n.supportedEventActions + "]") : t > 0 && n.directEventActions.indexOf(e) > -1 && i.push("\n- Cannot track element because its eventAction `" + e + "` must at the beginning of the attribute string")
                    }), null === e.eventValue && i.push("\n- Cannot parse eventValue as JSON from <eventAction>.<pageSection>.<eventLabel>.<eventValue JSON> See error output above."), -1 === e.eventAction.indexOf("submit") && o.children.length > 0 && i.push("\n- Element has children, which could lead to unexpected text recorded in the `name` field.  Confirm that the behavior is as expected."), e.eventAction.indexOf("submit") > -1 && !o.name && i.push("\n- Form has no name attribute, which leads to nothing recorded in the `name` field.  Confirm that the behavior is as expected.")) : t.trim().indexOf(" ") > -1 ? i.push("\n- Cannot track element because its data-track string contains spaces") : i.push("\n- Cannot track element because data-track attribute does not match form of <eventAction>.<pageSection>.<eventLabel>[.<eventValue JSON>]"), i.length && (i.unshift(o), i.unshift("Issues found with the following element: ")), i
                }
                var n = o(e);
                return {
                    buildValidateMessage: t
                }
            }
        }, {
            "./binder.js": 2
        }]
    }, {}, [1])(1)
});
! function (e, t) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = e.document ? t(e, !0) : function (e) {
        if (!e.document) throw new Error("jQuery requires a window with a document");
        return t(e)
    } : t(e)
}("undefined" != typeof window ? window : this, function (e, t) {
    function n(e) {
        var t = !!e && "length" in e && e.length,
            n = de.type(e);
        return "function" !== n && !de.isWindow(e) && ("array" === n || 0 === t || "number" == typeof t && t > 0 && t - 1 in e)
    }

    function r(e, t, n) {
        if (de.isFunction(t)) return de.grep(e, function (e, r) {
            return !!t.call(e, r, e) !== n
        });
        if (t.nodeType) return de.grep(e, function (e) {
            return e === t !== n
        });
        if ("string" == typeof t) {
            if (Te.test(t)) return de.filter(t, e, n);
            t = de.filter(t, e)
        }
        return de.grep(e, function (e) {
            return de.inArray(e, t) > -1 !== n
        })
    }

    function i(e, t) {
        do {
            e = e[t]
        } while (e && 1 !== e.nodeType);
        return e
    }

    function o(e) {
        var t = {};
        return de.each(e.match(Se) || [], function (e, n) {
            t[n] = !0
        }), t
    }

    function a() {
        re.addEventListener ? (re.removeEventListener("DOMContentLoaded", s), e.removeEventListener("load", s)) : (re.detachEvent("onreadystatechange", s), e.detachEvent("onload", s))
    }

    function s() {
        (re.addEventListener || "load" === e.event.type || "complete" === re.readyState) && (a(), de.ready())
    }

    function u(e, t, n) {
        if (void 0 === n && 1 === e.nodeType) {
            var r = "data-" + t.replace(He, "-$1").toLowerCase();
            if ("string" == typeof (n = e.getAttribute(r))) {
                try {
                    n = "true" === n || "false" !== n && ("null" === n ? null : +n + "" === n ? +n : Le.test(n) ? de.parseJSON(n) : n)
                } catch (e) {}
                de.data(e, t, n)
            } else n = void 0
        }
        return n
    }

    function l(e) {
        var t;
        for (t in e)
            if (("data" !== t || !de.isEmptyObject(e[t])) && "toJSON" !== t) return !1;
        return !0
    }

    function c(e, t, n, r) {
        if (je(e)) {
            var i, o, a = de.expando,
                s = e.nodeType,
                u = s ? de.cache : e,
                l = s ? e[a] : e[a] && a;
            if (l && u[l] && (r || u[l].data) || void 0 !== n || "string" != typeof t) return l || (l = s ? e[a] = ne.pop() || de.guid++ : a), u[l] || (u[l] = s ? {} : {
                toJSON: de.noop
            }), "object" != typeof t && "function" != typeof t || (r ? u[l] = de.extend(u[l], t) : u[l].data = de.extend(u[l].data, t)), o = u[l], r || (o.data || (o.data = {}), o = o.data), void 0 !== n && (o[de.camelCase(t)] = n), "string" == typeof t ? null == (i = o[t]) && (i = o[de.camelCase(t)]) : i = o, i
        }
    }

    function f(e, t, n) {
        if (je(e)) {
            var r, i, o = e.nodeType,
                a = o ? de.cache : e,
                s = o ? e[de.expando] : de.expando;
            if (a[s]) {
                if (t && (r = n ? a[s] : a[s].data)) {
                    de.isArray(t) ? t = t.concat(de.map(t, de.camelCase)) : t in r ? t = [t] : (t = de.camelCase(t), t = t in r ? [t] : t.split(" ")), i = t.length;
                    for (; i--;) delete r[t[i]];
                    if (n ? !l(r) : !de.isEmptyObject(r)) return
                }(n || (delete a[s].data, l(a[s]))) && (o ? de.cleanData([e], !0) : fe.deleteExpando || a != a.window ? delete a[s] : a[s] = void 0)
            }
        }
    }

    function d(e, t, n, r) {
        var i, o = 1,
            a = 20,
            s = r ? function () {
                return r.cur()
            } : function () {
                return de.css(e, t, "")
            },
            u = s(),
            l = n && n[3] || (de.cssNumber[t] ? "" : "px"),
            c = (de.cssNumber[t] || "px" !== l && +u) && _e.exec(de.css(e, t));
        if (c && c[3] !== l) {
            l = l || c[3], n = n || [], c = +u || 1;
            do {
                o = o || ".5", c /= o, de.style(e, t, c + l)
            } while (o !== (o = s() / u) && 1 !== o && --a)
        }
        return n && (c = +c || +u || 0, i = n[1] ? c + (n[1] + 1) * n[2] : +n[2], r && (r.unit = l, r.start = c, r.end = i)), i
    }

    function p(e) {
        var t = Ie.split("|"),
            n = e.createDocumentFragment();
        if (n.createElement)
            for (; t.length;) n.createElement(t.pop());
        return n
    }

    function h(e, t) {
        var n, r, i = 0,
            o = void 0 !== e.getElementsByTagName ? e.getElementsByTagName(t || "*") : void 0 !== e.querySelectorAll ? e.querySelectorAll(t || "*") : void 0;
        if (!o)
            for (o = [], n = e.childNodes || e; null != (r = n[i]); i++) !t || de.nodeName(r, t) ? o.push(r) : de.merge(o, h(r, t));
        return void 0 === t || t && de.nodeName(e, t) ? de.merge([e], o) : o
    }

    function g(e, t) {
        for (var n, r = 0; null != (n = e[r]); r++) de._data(n, "globalEval", !t || de._data(t[r], "globalEval"))
    }

    function m(e) {
        Re.test(e.type) && (e.defaultChecked = e.checked)
    }

    function v(e, t, n, r, i) {
        for (var o, a, s, u, l, c, f, d = e.length, v = p(t), y = [], x = 0; x < d; x++)
            if ((a = e[x]) || 0 === a)
                if ("object" === de.type(a)) de.merge(y, a.nodeType ? [a] : a);
                else if (ze.test(a)) {
            for (u = u || v.appendChild(t.createElement("div")), l = (Pe.exec(a) || ["", ""])[1].toLowerCase(), f = $e[l] || $e._default, u.innerHTML = f[1] + de.htmlPrefilter(a) + f[2], o = f[0]; o--;) u = u.lastChild;
            if (!fe.leadingWhitespace && We.test(a) && y.push(t.createTextNode(We.exec(a)[0])), !fe.tbody)
                for (a = "table" !== l || Xe.test(a) ? "<table>" !== f[1] || Xe.test(a) ? 0 : u : u.firstChild, o = a && a.childNodes.length; o--;) de.nodeName(c = a.childNodes[o], "tbody") && !c.childNodes.length && a.removeChild(c);
            for (de.merge(y, u.childNodes), u.textContent = ""; u.firstChild;) u.removeChild(u.firstChild);
            u = v.lastChild
        } else y.push(t.createTextNode(a));
        for (u && v.removeChild(u), fe.appendChecked || de.grep(h(y, "input"), m), x = 0; a = y[x++];)
            if (r && de.inArray(a, r) > -1) i && i.push(a);
            else if (s = de.contains(a.ownerDocument, a), u = h(v.appendChild(a), "script"), s && g(u), n)
            for (o = 0; a = u[o++];) Be.test(a.type || "") && n.push(a);
        return u = null, v
    }

    function y() {
        return !0
    }

    function x() {
        return !1
    }

    function b() {
        try {
            return re.activeElement
        } catch (e) {}
    }

    function w(e, t, n, r, i, o) {
        var a, s;
        if ("object" == typeof t) {
            "string" != typeof n && (r = r || n, n = void 0);
            for (s in t) w(e, s, n, r, t[s], o);
            return e
        }
        if (null == r && null == i ? (i = n, r = n = void 0) : null == i && ("string" == typeof n ? (i = r, r = void 0) : (i = r, r = n, n = void 0)), !1 === i) i = x;
        else if (!i) return e;
        return 1 === o && (a = i, i = function (e) {
            return de().off(e), a.apply(this, arguments)
        }, i.guid = a.guid || (a.guid = de.guid++)), e.each(function () {
            de.event.add(this, t, i, r, n)
        })
    }

    function T(e, t) {
        return de.nodeName(e, "table") && de.nodeName(11 !== t.nodeType ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
    }

    function C(e) {
        return e.type = (null !== de.find.attr(e, "type")) + "/" + e.type, e
    }

    function E(e) {
        var t = nt.exec(e.type);
        return t ? e.type = t[1] : e.removeAttribute("type"), e
    }

    function N(e, t) {
        if (1 === t.nodeType && de.hasData(e)) {
            var n, r, i, o = de._data(e),
                a = de._data(t, o),
                s = o.events;
            if (s) {
                delete a.handle, a.events = {};
                for (n in s)
                    for (r = 0, i = s[n].length; r < i; r++) de.event.add(t, n, s[n][r])
            }
            a.data && (a.data = de.extend({}, a.data))
        }
    }

    function k(e, t) {
        var n, r, i;
        if (1 === t.nodeType) {
            if (n = t.nodeName.toLowerCase(), !fe.noCloneEvent && t[de.expando]) {
                i = de._data(t);
                for (r in i.events) de.removeEvent(t, r, i.handle);
                t.removeAttribute(de.expando)
            }
            "script" === n && t.text !== e.text ? (C(t).text = e.text, E(t)) : "object" === n ? (t.parentNode && (t.outerHTML = e.outerHTML), fe.html5Clone && e.innerHTML && !de.trim(t.innerHTML) && (t.innerHTML = e.innerHTML)) : "input" === n && Re.test(e.type) ? (t.defaultChecked = t.checked = e.checked, t.value !== e.value && (t.value = e.value)) : "option" === n ? t.defaultSelected = t.selected = e.defaultSelected : "input" !== n && "textarea" !== n || (t.defaultValue = e.defaultValue)
        }
    }

    function S(e, t, n, r) {
        t = oe.apply([], t);
        var i, o, a, s, u, l, c = 0,
            f = e.length,
            d = f - 1,
            p = t[0],
            g = de.isFunction(p);
        if (g || f > 1 && "string" == typeof p && !fe.checkClone && tt.test(p)) return e.each(function (i) {
            var o = e.eq(i);
            g && (t[0] = p.call(this, i, o.html())), S(o, t, n, r)
        });
        if (f && (l = v(t, e[0].ownerDocument, !1, e, r), i = l.firstChild, 1 === l.childNodes.length && (l = i), i || r)) {
            for (s = de.map(h(l, "script"), C), a = s.length; c < f; c++) o = l, c !== d && (o = de.clone(o, !0, !0), a && de.merge(s, h(o, "script"))), n.call(e[c], o, c);
            if (a)
                for (u = s[s.length - 1].ownerDocument, de.map(s, E), c = 0; c < a; c++) o = s[c], Be.test(o.type || "") && !de._data(o, "globalEval") && de.contains(u, o) && (o.src ? de._evalUrl && de._evalUrl(o.src) : de.globalEval((o.text || o.textContent || o.innerHTML || "").replace(rt, "")));
            l = i = null
        }
        return e
    }

    function A(e, t, n) {
        for (var r, i = t ? de.filter(t, e) : e, o = 0; null != (r = i[o]); o++) n || 1 !== r.nodeType || de.cleanData(h(r)), r.parentNode && (n && de.contains(r.ownerDocument, r) && g(h(r, "script")), r.parentNode.removeChild(r));
        return e
    }

    function D(e, t) {
        var n = de(t.createElement(e)).appendTo(t.body),
            r = de.css(n[0], "display");
        return n.detach(), r
    }

    function j(e) {
        var t = re,
            n = st[e];
        return n || (n = D(e, t), "none" !== n && n || (at = (at || de("<iframe frameborder='0' width='0' height='0'/>")).appendTo(t.documentElement), t = (at[0].contentWindow || at[0].contentDocument).document, t.write(), t.close(), n = D(e, t), at.detach()), st[e] = n), n
    }

    function L(e, t) {
        return {
            get: function () {
                return e() ? void delete this.get : (this.get = t).apply(this, arguments)
            }
        }
    }

    function H(e) {
        if (e in Tt) return e;
        for (var t = e.charAt(0).toUpperCase() + e.slice(1), n = wt.length; n--;)
            if ((e = wt[n] + t) in Tt) return e
    }

    function q(e, t) {
        for (var n, r, i, o = [], a = 0, s = e.length; a < s; a++) r = e[a], r.style && (o[a] = de._data(r, "olddisplay"), n = r.style.display, t ? (o[a] || "none" !== n || (r.style.display = ""), "" === r.style.display && Me(r) && (o[a] = de._data(r, "olddisplay", j(r.nodeName)))) : (i = Me(r), (n && "none" !== n || !i) && de._data(r, "olddisplay", i ? n : de.css(r, "display"))));
        for (a = 0; a < s; a++) r = e[a], r.style && (t && "none" !== r.style.display && "" !== r.style.display || (r.style.display = t ? o[a] || "" : "none"));
        return e
    }

    function _(e, t, n) {
        var r = yt.exec(t);
        return r ? Math.max(0, r[1] - (n || 0)) + (r[2] || "px") : t
    }

    function F(e, t, n, r, i) {
        for (var o = n === (r ? "border" : "content") ? 4 : "width" === t ? 1 : 0, a = 0; o < 4; o += 2) "margin" === n && (a += de.css(e, n + Fe[o], !0, i)), r ? ("content" === n && (a -= de.css(e, "padding" + Fe[o], !0, i)), "margin" !== n && (a -= de.css(e, "border" + Fe[o] + "Width", !0, i))) : (a += de.css(e, "padding" + Fe[o], !0, i), "padding" !== n && (a += de.css(e, "border" + Fe[o] + "Width", !0, i)));
        return a
    }

    function M(e, t, n) {
        var r = !0,
            i = "width" === t ? e.offsetWidth : e.offsetHeight,
            o = dt(e),
            a = fe.boxSizing && "border-box" === de.css(e, "boxSizing", !1, o);
        if (i <= 0 || null == i) {
            if (i = pt(e, t, o), (i < 0 || null == i) && (i = e.style[t]), lt.test(i)) return i;
            r = a && (fe.boxSizingReliable() || i === e.style[t]), i = parseFloat(i) || 0
        }
        return i + F(e, t, n || (a ? "border" : "content"), r, o) + "px"
    }

    function O(e, t, n, r, i) {
        return new O.prototype.init(e, t, n, r, i)
    }

    function R() {
        return e.setTimeout(function () {
            Ct = void 0
        }), Ct = de.now()
    }

    function P(e, t) {
        var n, r = {
                height: e
            },
            i = 0;
        for (t = t ? 1 : 0; i < 4; i += 2 - t) n = Fe[i], r["margin" + n] = r["padding" + n] = e;
        return t && (r.opacity = r.width = e), r
    }

    function B(e, t, n) {
        for (var r, i = ($.tweeners[t] || []).concat($.tweeners["*"]), o = 0, a = i.length; o < a; o++)
            if (r = i[o].call(n, t, e)) return r
    }

    function W(e, t, n) {
        var r, i, o, a, s, u, l, c = this,
            f = {},
            d = e.style,
            p = e.nodeType && Me(e),
            h = de._data(e, "fxshow");
        n.queue || (s = de._queueHooks(e, "fx"), null == s.unqueued && (s.unqueued = 0, u = s.empty.fire, s.empty.fire = function () {
            s.unqueued || u()
        }), s.unqueued++, c.always(function () {
            c.always(function () {
                s.unqueued--, de.queue(e, "fx").length || s.empty.fire()
            })
        })), 1 === e.nodeType && ("height" in t || "width" in t) && (n.overflow = [d.overflow, d.overflowX, d.overflowY], l = de.css(e, "display"), "inline" === ("none" === l ? de._data(e, "olddisplay") || j(e.nodeName) : l) && "none" === de.css(e, "float") && (fe.inlineBlockNeedsLayout && "inline" !== j(e.nodeName) ? d.zoom = 1 : d.display = "inline-block")), n.overflow && (d.overflow = "hidden", fe.shrinkWrapBlocks() || c.always(function () {
            d.overflow = n.overflow[0], d.overflowX = n.overflow[1], d.overflowY = n.overflow[2]
        }));
        for (r in t)
            if (i = t[r], Nt.exec(i)) {
                if (delete t[r], o = o || "toggle" === i, i === (p ? "hide" : "show")) {
                    if ("show" !== i || !h || void 0 === h[r]) continue;
                    p = !0
                }
                f[r] = h && h[r] || de.style(e, r)
            } else l = void 0;
        if (de.isEmptyObject(f)) "inline" === ("none" === l ? j(e.nodeName) : l) && (d.display = l);
        else {
            h ? "hidden" in h && (p = h.hidden) : h = de._data(e, "fxshow", {}), o && (h.hidden = !p), p ? de(e).show() : c.done(function () {
                de(e).hide()
            }), c.done(function () {
                var t;
                de._removeData(e, "fxshow");
                for (t in f) de.style(e, t, f[t])
            });
            for (r in f) a = B(p ? h[r] : 0, r, c), r in h || (h[r] = a.start, p && (a.end = a.start, a.start = "width" === r || "height" === r ? 1 : 0))
        }
    }

    function I(e, t) {
        var n, r, i, o, a;
        for (n in e)
            if (r = de.camelCase(n), i = t[r], o = e[n], de.isArray(o) && (i = o[1], o = e[n] = o[0]), n !== r && (e[r] = o, delete e[n]), (a = de.cssHooks[r]) && "expand" in a) {
                o = a.expand(o), delete e[r];
                for (n in o) n in e || (e[n] = o[n], t[n] = i)
            } else t[r] = i
    }

    function $(e, t, n) {
        var r, i, o = 0,
            a = $.prefilters.length,
            s = de.Deferred().always(function () {
                delete u.elem
            }),
            u = function () {
                if (i) return !1;
                for (var t = Ct || R(), n = Math.max(0, l.startTime + l.duration - t), r = n / l.duration || 0, o = 1 - r, a = 0, u = l.tweens.length; a < u; a++) l.tweens[a].run(o);
                return s.notifyWith(e, [l, o, n]), o < 1 && u ? n : (s.resolveWith(e, [l]), !1)
            },
            l = s.promise({
                elem: e,
                props: de.extend({}, t),
                opts: de.extend(!0, {
                    specialEasing: {},
                    easing: de.easing._default
                }, n),
                originalProperties: t,
                originalOptions: n,
                startTime: Ct || R(),
                duration: n.duration,
                tweens: [],
                createTween: function (t, n) {
                    var r = de.Tween(e, l.opts, t, n, l.opts.specialEasing[t] || l.opts.easing);
                    return l.tweens.push(r), r
                },
                stop: function (t) {
                    var n = 0,
                        r = t ? l.tweens.length : 0;
                    if (i) return this;
                    for (i = !0; n < r; n++) l.tweens[n].run(1);
                    return t ? (s.notifyWith(e, [l, 1, 0]), s.resolveWith(e, [l, t])) : s.rejectWith(e, [l, t]), this
                }
            }),
            c = l.props;
        for (I(c, l.opts.specialEasing); o < a; o++)
            if (r = $.prefilters[o].call(l, e, c, l.opts)) return de.isFunction(r.stop) && (de._queueHooks(l.elem, l.opts.queue).stop = de.proxy(r.stop, r)), r;
        return de.map(c, B, l), de.isFunction(l.opts.start) && l.opts.start.call(e, l), de.fx.timer(de.extend(u, {
            elem: e,
            anim: l,
            queue: l.opts.queue
        })), l.progress(l.opts.progress).done(l.opts.done, l.opts.complete).fail(l.opts.fail).always(l.opts.always)
    }

    function z(e) {
        return de.attr(e, "class") || ""
    }

    function X(e) {
        return function (t, n) {
            "string" != typeof t && (n = t, t = "*");
            var r, i = 0,
                o = t.toLowerCase().match(Se) || [];
            if (de.isFunction(n))
                for (; r = o[i++];) "+" === r.charAt(0) ? (r = r.slice(1) || "*", (e[r] = e[r] || []).unshift(n)) : (e[r] = e[r] || []).push(n)
        }
    }

    function U(e, t, n, r) {
        function i(s) {
            var u;
            return o[s] = !0, de.each(e[s] || [], function (e, s) {
                var l = s(t, n, r);
                return "string" != typeof l || a || o[l] ? a ? !(u = l) : void 0 : (t.dataTypes.unshift(l), i(l), !1)
            }), u
        }
        var o = {},
            a = e === Gt;
        return i(t.dataTypes[0]) || !o["*"] && i("*")
    }

    function V(e, t) {
        var n, r, i = de.ajaxSettings.flatOptions || {};
        for (r in t) void 0 !== t[r] && ((i[r] ? e : n || (n = {}))[r] = t[r]);
        return n && de.extend(!0, e, n), e
    }

    function Y(e, t, n) {
        for (var r, i, o, a, s = e.contents, u = e.dataTypes;
            "*" === u[0];) u.shift(), void 0 === i && (i = e.mimeType || t.getResponseHeader("Content-Type"));
        if (i)
            for (a in s)
                if (s[a] && s[a].test(i)) {
                    u.unshift(a);
                    break
                } if (u[0] in n) o = u[0];
        else {
            for (a in n) {
                if (!u[0] || e.converters[a + " " + u[0]]) {
                    o = a;
                    break
                }
                r || (r = a)
            }
            o = o || r
        }
        if (o) return o !== u[0] && u.unshift(o), n[o]
    }

    function J(e, t, n, r) {
        var i, o, a, s, u, l = {},
            c = e.dataTypes.slice();
        if (c[1])
            for (a in e.converters) l[a.toLowerCase()] = e.converters[a];
        for (o = c.shift(); o;)
            if (e.responseFields[o] && (n[e.responseFields[o]] = t), !u && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)), u = o, o = c.shift())
                if ("*" === o) o = u;
                else if ("*" !== u && u !== o) {
            if (!(a = l[u + " " + o] || l["* " + o]))
                for (i in l)
                    if (s = i.split(" "), s[1] === o && (a = l[u + " " + s[0]] || l["* " + s[0]])) {
                        !0 === a ? a = l[i] : !0 !== l[i] && (o = s[0], c.unshift(s[1]));
                        break
                    } if (!0 !== a)
                if (a && e.throws) t = a(t);
                else try {
                    t = a(t)
                } catch (e) {
                    return {
                        state: "parsererror",
                        error: a ? e : "No conversion from " + u + " to " + o
                    }
                }
        }
        return {
            state: "success",
            data: t
        }
    }

    function G(e) {
        return e.style && e.style.display || de.css(e, "display")
    }

    function Q(e) {
        if (!de.contains(e.ownerDocument || re, e)) return !0;
        for (; e && 1 === e.nodeType;) {
            if ("none" === G(e) || "hidden" === e.type) return !0;
            e = e.parentNode
        }
        return !1
    }

    function K(e, t, n, r) {
        var i;
        if (de.isArray(t)) de.each(t, function (t, i) {
            n || tn.test(e) ? r(e, i) : K(e + "[" + ("object" == typeof i && null != i ? t : "") + "]", i, n, r)
        });
        else if (n || "object" !== de.type(t)) r(e, t);
        else
            for (i in t) K(e + "[" + i + "]", t[i], n, r)
    }

    function Z() {
        try {
            return new e.XMLHttpRequest
        } catch (e) {}
    }

    function ee() {
        try {
            return new e.ActiveXObject("Microsoft.XMLHTTP")
        } catch (e) {}
    }

    function te(e) {
        return de.isWindow(e) ? e : 9 === e.nodeType && (e.defaultView || e.parentWindow)
    }
    var ne = [],
        re = e.document,
        ie = ne.slice,
        oe = ne.concat,
        ae = ne.push,
        se = ne.indexOf,
        ue = {},
        le = ue.toString,
        ce = ue.hasOwnProperty,
        fe = {},
        de = function (e, t) {
            return new de.fn.init(e, t)
        },
        pe = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        he = /^-ms-/,
        ge = /-([\da-z])/gi,
        me = function (e, t) {
            return t.toUpperCase()
        };
    de.fn = de.prototype = {
        jquery: "1.12.4",
        constructor: de,
        selector: "",
        length: 0,
        toArray: function () {
            return ie.call(this)
        },
        get: function (e) {
            return null != e ? e < 0 ? this[e + this.length] : this[e] : ie.call(this)
        },
        pushStack: function (e) {
            var t = de.merge(this.constructor(), e);
            return t.prevObject = this, t.context = this.context, t
        },
        each: function (e) {
            return de.each(this, e)
        },
        map: function (e) {
            return this.pushStack(de.map(this, function (t, n) {
                return e.call(t, n, t)
            }))
        },
        slice: function () {
            return this.pushStack(ie.apply(this, arguments))
        },
        first: function () {
            return this.eq(0)
        },
        last: function () {
            return this.eq(-1)
        },
        eq: function (e) {
            var t = this.length,
                n = +e + (e < 0 ? t : 0);
            return this.pushStack(n >= 0 && n < t ? [this[n]] : [])
        },
        end: function () {
            return this.prevObject || this.constructor()
        },
        push: ae,
        sort: ne.sort,
        splice: ne.splice
    }, de.extend = de.fn.extend = function () {
        var e, t, n, r, i, o, a = arguments[0] || {},
            s = 1,
            u = arguments.length,
            l = !1;
        for ("boolean" == typeof a && (l = a, a = arguments[s] || {}, s++), "object" == typeof a || de.isFunction(a) || (a = {}), s === u && (a = this, s--); s < u; s++)
            if (null != (i = arguments[s]))
                for (r in i) e = a[r], n = i[r], a !== n && (l && n && (de.isPlainObject(n) || (t = de.isArray(n))) ? (t ? (t = !1, o = e && de.isArray(e) ? e : []) : o = e && de.isPlainObject(e) ? e : {}, a[r] = de.extend(l, o, n)) : void 0 !== n && (a[r] = n));
        return a
    }, de.extend({
        expando: "jQuery" + ("1.12.4" + Math.random()).replace(/\D/g, ""),
        isReady: !0,
        error: function (e) {
            throw new Error(e)
        },
        noop: function () {},
        isFunction: function (e) {
            return "function" === de.type(e)
        },
        isArray: Array.isArray || function (e) {
            return "array" === de.type(e)
        },
        isWindow: function (e) {
            return null != e && e == e.window
        },
        isNumeric: function (e) {
            var t = e && e.toString();
            return !de.isArray(e) && t - parseFloat(t) + 1 >= 0
        },
        isEmptyObject: function (e) {
            var t;
            for (t in e) return !1;
            return !0
        },
        isPlainObject: function (e) {
            var t;
            if (!e || "object" !== de.type(e) || e.nodeType || de.isWindow(e)) return !1;
            try {
                if (e.constructor && !ce.call(e, "constructor") && !ce.call(e.constructor.prototype, "isPrototypeOf")) return !1
            } catch (e) {
                return !1
            }
            if (!fe.ownFirst)
                for (t in e) return ce.call(e, t);
            for (t in e);
            return void 0 === t || ce.call(e, t)
        },
        type: function (e) {
            return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? ue[le.call(e)] || "object" : typeof e
        },
        globalEval: function (t) {
            t && de.trim(t) && (e.execScript || function (t) {
                e.eval.call(e, t)
            })(t)
        },
        camelCase: function (e) {
            return e.replace(he, "ms-").replace(ge, me)
        },
        nodeName: function (e, t) {
            return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
        },
        each: function (e, t) {
            var r, i = 0;
            if (n(e))
                for (r = e.length; i < r && !1 !== t.call(e[i], i, e[i]); i++);
            else
                for (i in e)
                    if (!1 === t.call(e[i], i, e[i])) break;
            return e
        },
        trim: function (e) {
            return null == e ? "" : (e + "").replace(pe, "")
        },
        makeArray: function (e, t) {
            var r = t || [];
            return null != e && (n(Object(e)) ? de.merge(r, "string" == typeof e ? [e] : e) : ae.call(r, e)), r
        },
        inArray: function (e, t, n) {
            var r;
            if (t) {
                if (se) return se.call(t, e, n);
                for (r = t.length, n = n ? n < 0 ? Math.max(0, r + n) : n : 0; n < r; n++)
                    if (n in t && t[n] === e) return n
            }
            return -1
        },
        merge: function (e, t) {
            for (var n = +t.length, r = 0, i = e.length; r < n;) e[i++] = t[r++];
            if (n !== n)
                for (; void 0 !== t[r];) e[i++] = t[r++];
            return e.length = i, e
        },
        grep: function (e, t, n) {
            for (var r = [], i = 0, o = e.length, a = !n; i < o; i++) !t(e[i], i) !== a && r.push(e[i]);
            return r
        },
        map: function (e, t, r) {
            var i, o, a = 0,
                s = [];
            if (n(e))
                for (i = e.length; a < i; a++) null != (o = t(e[a], a, r)) && s.push(o);
            else
                for (a in e) null != (o = t(e[a], a, r)) && s.push(o);
            return oe.apply([], s)
        },
        guid: 1,
        proxy: function (e, t) {
            var n, r, i;
            if ("string" == typeof t && (i = e[t], t = e, e = i), de.isFunction(e)) return n = ie.call(arguments, 2), r = function () {
                return e.apply(t || this, n.concat(ie.call(arguments)))
            }, r.guid = e.guid = e.guid || de.guid++, r
        },
        now: function () {
            return +new Date
        },
        support: fe
    }), "function" == typeof Symbol && (de.fn[Symbol.iterator] = ne[Symbol.iterator]), de.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function (e, t) {
        ue["[object " + t + "]"] = t.toLowerCase()
    });
    var ve = function (e) {
        function t(e, t, n, r) {
            var i, o, a, s, l, f, d, p, h = t && t.ownerDocument,
                g = t ? t.nodeType : 9;
            if (n = n || [], "string" != typeof e || !e || 1 !== g && 9 !== g && 11 !== g) return n;
            if (!r && ((t ? t.ownerDocument || t : R) !== j && D(t), t = t || j, H)) {
                if (11 !== g && (f = ge.exec(e)))
                    if (i = f[1]) {
                        if (9 === g) {
                            if (!(a = t.getElementById(i))) return n;
                            if (a.id === i) return n.push(a), n
                        } else if (h && (a = h.getElementById(i)) && M(t, a) && a.id === i) return n.push(a), n
                    } else {
                        if (f[2]) return G.apply(n, t.getElementsByTagName(e)), n;
                        if ((i = f[3]) && x.getElementsByClassName && t.getElementsByClassName) return G.apply(n, t.getElementsByClassName(i)), n
                    } if (x.qsa && !$[e + " "] && (!q || !q.test(e))) {
                    if (1 !== g) h = t, p = e;
                    else if ("object" !== t.nodeName.toLowerCase()) {
                        for ((s = t.getAttribute("id")) ? s = s.replace(ve, "\\$&") : t.setAttribute("id", s = O), d = C(e), o = d.length, l = ce.test(s) ? "#" + s : "[id='" + s + "']"; o--;) d[o] = l + " " + c(d[o]);
                        p = d.join(","), h = me.test(e) && u(t.parentNode) || t
                    }
                    if (p) try {
                        return G.apply(n, h.querySelectorAll(p)), n
                    } catch (e) {} finally {
                        s === O && t.removeAttribute("id")
                    }
                }
            }
            return N(e.replace(oe, "$1"), t, n, r)
        }

        function n() {
            function e(n, r) {
                return t.push(n + " ") > b.cacheLength && delete e[t.shift()], e[n + " "] = r
            }
            var t = [];
            return e
        }

        function r(e) {
            return e[O] = !0, e
        }

        function i(e) {
            var t = j.createElement("div");
            try {
                return !!e(t)
            } catch (e) {
                return !1
            } finally {
                t.parentNode && t.parentNode.removeChild(t), t = null
            }
        }

        function o(e, t) {
            for (var n = e.split("|"), r = n.length; r--;) b.attrHandle[n[r]] = t
        }

        function a(e, t) {
            var n = t && e,
                r = n && 1 === e.nodeType && 1 === t.nodeType && (~t.sourceIndex || X) - (~e.sourceIndex || X);
            if (r) return r;
            if (n)
                for (; n = n.nextSibling;)
                    if (n === t) return -1;
            return e ? 1 : -1
        }

        function s(e) {
            return r(function (t) {
                return t = +t, r(function (n, r) {
                    for (var i, o = e([], n.length, t), a = o.length; a--;) n[i = o[a]] && (n[i] = !(r[i] = n[i]))
                })
            })
        }

        function u(e) {
            return e && void 0 !== e.getElementsByTagName && e
        }

        function l() {}

        function c(e) {
            for (var t = 0, n = e.length, r = ""; t < n; t++) r += e[t].value;
            return r
        }

        function f(e, t, n) {
            var r = t.dir,
                i = n && "parentNode" === r,
                o = B++;
            return t.first ? function (t, n, o) {
                for (; t = t[r];)
                    if (1 === t.nodeType || i) return e(t, n, o)
            } : function (t, n, a) {
                var s, u, l, c = [P, o];
                if (a) {
                    for (; t = t[r];)
                        if ((1 === t.nodeType || i) && e(t, n, a)) return !0
                } else
                    for (; t = t[r];)
                        if (1 === t.nodeType || i) {
                            if (l = t[O] || (t[O] = {}), u = l[t.uniqueID] || (l[t.uniqueID] = {}), (s = u[r]) && s[0] === P && s[1] === o) return c[2] = s[2];
                            if (u[r] = c, c[2] = e(t, n, a)) return !0
                        }
            }
        }

        function d(e) {
            return e.length > 1 ? function (t, n, r) {
                for (var i = e.length; i--;)
                    if (!e[i](t, n, r)) return !1;
                return !0
            } : e[0]
        }

        function p(e, n, r) {
            for (var i = 0, o = n.length; i < o; i++) t(e, n[i], r);
            return r
        }

        function h(e, t, n, r, i) {
            for (var o, a = [], s = 0, u = e.length, l = null != t; s < u; s++)(o = e[s]) && (n && !n(o, r, i) || (a.push(o), l && t.push(s)));
            return a
        }

        function g(e, t, n, i, o, a) {
            return i && !i[O] && (i = g(i)), o && !o[O] && (o = g(o, a)), r(function (r, a, s, u) {
                var l, c, f, d = [],
                    g = [],
                    m = a.length,
                    v = r || p(t || "*", s.nodeType ? [s] : s, []),
                    y = !e || !r && t ? v : h(v, d, e, s, u),
                    x = n ? o || (r ? e : m || i) ? [] : a : y;
                if (n && n(y, x, s, u), i)
                    for (l = h(x, g), i(l, [], s, u), c = l.length; c--;)(f = l[c]) && (x[g[c]] = !(y[g[c]] = f));
                if (r) {
                    if (o || e) {
                        if (o) {
                            for (l = [], c = x.length; c--;)(f = x[c]) && l.push(y[c] = f);
                            o(null, x = [], l, u)
                        }
                        for (c = x.length; c--;)(f = x[c]) && (l = o ? K(r, f) : d[c]) > -1 && (r[l] = !(a[l] = f))
                    }
                } else x = h(x === a ? x.splice(m, x.length) : x), o ? o(null, a, x, u) : G.apply(a, x)
            })
        }

        function m(e) {
            for (var t, n, r, i = e.length, o = b.relative[e[0].type], a = o || b.relative[" "], s = o ? 1 : 0, u = f(function (e) {
                    return e === t
                }, a, !0), l = f(function (e) {
                    return K(t, e) > -1
                }, a, !0), p = [function (e, n, r) {
                    var i = !o && (r || n !== k) || ((t = n).nodeType ? u(e, n, r) : l(e, n, r));
                    return t = null, i
                }]; s < i; s++)
                if (n = b.relative[e[s].type]) p = [f(d(p), n)];
                else {
                    if (n = b.filter[e[s].type].apply(null, e[s].matches), n[O]) {
                        for (r = ++s; r < i && !b.relative[e[r].type]; r++);
                        return g(s > 1 && d(p), s > 1 && c(e.slice(0, s - 1).concat({
                            value: " " === e[s - 2].type ? "*" : ""
                        })).replace(oe, "$1"), n, s < r && m(e.slice(s, r)), r < i && m(e = e.slice(r)), r < i && c(e))
                    }
                    p.push(n)
                } return d(p)
        }

        function v(e, n) {
            var i = n.length > 0,
                o = e.length > 0,
                a = function (r, a, s, u, l) {
                    var c, f, d, p = 0,
                        g = "0",
                        m = r && [],
                        v = [],
                        y = k,
                        x = r || o && b.find.TAG("*", l),
                        w = P += null == y ? 1 : Math.random() || .1,
                        T = x.length;
                    for (l && (k = a === j || a || l); g !== T && null != (c = x[g]); g++) {
                        if (o && c) {
                            for (f = 0, a || c.ownerDocument === j || (D(c), s = !H); d = e[f++];)
                                if (d(c, a || j, s)) {
                                    u.push(c);
                                    break
                                } l && (P = w)
                        }
                        i && ((c = !d && c) && p--, r && m.push(c))
                    }
                    if (p += g, i && g !== p) {
                        for (f = 0; d = n[f++];) d(m, v, a, s);
                        if (r) {
                            if (p > 0)
                                for (; g--;) m[g] || v[g] || (v[g] = Y.call(u));
                            v = h(v)
                        }
                        G.apply(u, v), l && !r && v.length > 0 && p + n.length > 1 && t.uniqueSort(u)
                    }
                    return l && (P = w, k = y), m
                };
            return i ? r(a) : a
        }
        var y, x, b, w, T, C, E, N, k, S, A, D, j, L, H, q, _, F, M, O = "sizzle" + 1 * new Date,
            R = e.document,
            P = 0,
            B = 0,
            W = n(),
            I = n(),
            $ = n(),
            z = function (e, t) {
                return e === t && (A = !0), 0
            },
            X = 1 << 31,
            U = {}.hasOwnProperty,
            V = [],
            Y = V.pop,
            J = V.push,
            G = V.push,
            Q = V.slice,
            K = function (e, t) {
                for (var n = 0, r = e.length; n < r; n++)
                    if (e[n] === t) return n;
                return -1
            },
            Z = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
            ee = "[\\x20\\t\\r\\n\\f]",
            te = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
            ne = "\\[" + ee + "*(" + te + ")(?:" + ee + "*([*^$|!~]?=)" + ee + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + te + "))|)" + ee + "*\\]",
            re = ":(" + te + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + ne + ")*)|.*)\\)|)",
            ie = new RegExp(ee + "+", "g"),
            oe = new RegExp("^" + ee + "+|((?:^|[^\\\\])(?:\\\\.)*)" + ee + "+$", "g"),
            ae = new RegExp("^" + ee + "*," + ee + "*"),
            se = new RegExp("^" + ee + "*([>+~]|" + ee + ")" + ee + "*"),
            ue = new RegExp("=" + ee + "*([^\\]'\"]*?)" + ee + "*\\]", "g"),
            le = new RegExp(re),
            ce = new RegExp("^" + te + "$"),
            fe = {
                ID: new RegExp("^#(" + te + ")"),
                CLASS: new RegExp("^\\.(" + te + ")"),
                TAG: new RegExp("^(" + te + "|[*])"),
                ATTR: new RegExp("^" + ne),
                PSEUDO: new RegExp("^" + re),
                CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + ee + "*(even|odd|(([+-]|)(\\d*)n|)" + ee + "*(?:([+-]|)" + ee + "*(\\d+)|))" + ee + "*\\)|)", "i"),
                bool: new RegExp("^(?:" + Z + ")$", "i"),
                needsContext: new RegExp("^" + ee + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + ee + "*((?:-\\d)?\\d*)" + ee + "*\\)|)(?=[^-]|$)", "i")
            },
            de = /^(?:input|select|textarea|button)$/i,
            pe = /^h\d$/i,
            he = /^[^{]+\{\s*\[native \w/,
            ge = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
            me = /[+~]/,
            ve = /'|\\/g,
            ye = new RegExp("\\\\([\\da-f]{1,6}" + ee + "?|(" + ee + ")|.)", "ig"),
            xe = function (e, t, n) {
                var r = "0x" + t - 65536;
                return r !== r || n ? t : r < 0 ? String.fromCharCode(r + 65536) : String.fromCharCode(r >> 10 | 55296, 1023 & r | 56320)
            },
            be = function () {
                D()
            };
        try {
            G.apply(V = Q.call(R.childNodes), R.childNodes), V[R.childNodes.length].nodeType
        } catch (e) {
            G = {
                apply: V.length ? function (e, t) {
                    J.apply(e, Q.call(t))
                } : function (e, t) {
                    for (var n = e.length, r = 0; e[n++] = t[r++];);
                    e.length = n - 1
                }
            }
        }
        x = t.support = {}, T = t.isXML = function (e) {
            var t = e && (e.ownerDocument || e).documentElement;
            return !!t && "HTML" !== t.nodeName
        }, D = t.setDocument = function (e) {
            var t, n, r = e ? e.ownerDocument || e : R;
            return r !== j && 9 === r.nodeType && r.documentElement ? (j = r, L = j.documentElement, H = !T(j), (n = j.defaultView) && n.top !== n && (n.addEventListener ? n.addEventListener("unload", be, !1) : n.attachEvent && n.attachEvent("onunload", be)), x.attributes = i(function (e) {
                return e.className = "i", !e.getAttribute("className")
            }), x.getElementsByTagName = i(function (e) {
                return e.appendChild(j.createComment("")), !e.getElementsByTagName("*").length
            }), x.getElementsByClassName = he.test(j.getElementsByClassName), x.getById = i(function (e) {
                return L.appendChild(e).id = O, !j.getElementsByName || !j.getElementsByName(O).length
            }), x.getById ? (b.find.ID = function (e, t) {
                if (void 0 !== t.getElementById && H) {
                    var n = t.getElementById(e);
                    return n ? [n] : []
                }
            }, b.filter.ID = function (e) {
                var t = e.replace(ye, xe);
                return function (e) {
                    return e.getAttribute("id") === t
                }
            }) : (delete b.find.ID, b.filter.ID = function (e) {
                var t = e.replace(ye, xe);
                return function (e) {
                    var n = void 0 !== e.getAttributeNode && e.getAttributeNode("id");
                    return n && n.value === t
                }
            }), b.find.TAG = x.getElementsByTagName ? function (e, t) {
                return void 0 !== t.getElementsByTagName ? t.getElementsByTagName(e) : x.qsa ? t.querySelectorAll(e) : void 0
            } : function (e, t) {
                var n, r = [],
                    i = 0,
                    o = t.getElementsByTagName(e);
                if ("*" === e) {
                    for (; n = o[i++];) 1 === n.nodeType && r.push(n);
                    return r
                }
                return o
            }, b.find.CLASS = x.getElementsByClassName && function (e, t) {
                if (void 0 !== t.getElementsByClassName && H) return t.getElementsByClassName(e)
            }, _ = [], q = [], (x.qsa = he.test(j.querySelectorAll)) && (i(function (e) {
                L.appendChild(e).innerHTML = "<a id='" + O + "'></a><select id='" + O + "-\r\\' msallowcapture=''><option selected=''></option></select>", e.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + ee + "*(?:''|\"\")"), e.querySelectorAll("[selected]").length || q.push("\\[" + ee + "*(?:value|" + Z + ")"), e.querySelectorAll("[id~=" + O + "-]").length || q.push("~="), e.querySelectorAll(":checked").length || q.push(":checked"), e.querySelectorAll("a#" + O + "+*").length || q.push(".#.+[+~]")
            }), i(function (e) {
                var t = j.createElement("input");
                t.setAttribute("type", "hidden"), e.appendChild(t).setAttribute("name", "D"), e.querySelectorAll("[name=d]").length && q.push("name" + ee + "*[*^$|!~]?="), e.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), e.querySelectorAll("*,:x"), q.push(",.*:")
            })), (x.matchesSelector = he.test(F = L.matches || L.webkitMatchesSelector || L.mozMatchesSelector || L.oMatchesSelector || L.msMatchesSelector)) && i(function (e) {
                x.disconnectedMatch = F.call(e, "div"), F.call(e, "[s!='']:x"), _.push("!=", re)
            }), q = q.length && new RegExp(q.join("|")), _ = _.length && new RegExp(_.join("|")), t = he.test(L.compareDocumentPosition), M = t || he.test(L.contains) ? function (e, t) {
                var n = 9 === e.nodeType ? e.documentElement : e,
                    r = t && t.parentNode;
                return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)))
            } : function (e, t) {
                if (t)
                    for (; t = t.parentNode;)
                        if (t === e) return !0;
                return !1
            }, z = t ? function (e, t) {
                if (e === t) return A = !0, 0;
                var n = !e.compareDocumentPosition - !t.compareDocumentPosition;
                return n || (n = (e.ownerDocument || e) === (t.ownerDocument || t) ? e.compareDocumentPosition(t) : 1, 1 & n || !x.sortDetached && t.compareDocumentPosition(e) === n ? e === j || e.ownerDocument === R && M(R, e) ? -1 : t === j || t.ownerDocument === R && M(R, t) ? 1 : S ? K(S, e) - K(S, t) : 0 : 4 & n ? -1 : 1)
            } : function (e, t) {
                if (e === t) return A = !0, 0;
                var n, r = 0,
                    i = e.parentNode,
                    o = t.parentNode,
                    s = [e],
                    u = [t];
                if (!i || !o) return e === j ? -1 : t === j ? 1 : i ? -1 : o ? 1 : S ? K(S, e) - K(S, t) : 0;
                if (i === o) return a(e, t);
                for (n = e; n = n.parentNode;) s.unshift(n);
                for (n = t; n = n.parentNode;) u.unshift(n);
                for (; s[r] === u[r];) r++;
                return r ? a(s[r], u[r]) : s[r] === R ? -1 : u[r] === R ? 1 : 0
            }, j) : j
        }, t.matches = function (e, n) {
            return t(e, null, null, n)
        }, t.matchesSelector = function (e, n) {
            if ((e.ownerDocument || e) !== j && D(e), n = n.replace(ue, "='$1']"), x.matchesSelector && H && !$[n + " "] && (!_ || !_.test(n)) && (!q || !q.test(n))) try {
                var r = F.call(e, n);
                if (r || x.disconnectedMatch || e.document && 11 !== e.document.nodeType) return r
            } catch (e) {}
            return t(n, j, null, [e]).length > 0
        }, t.contains = function (e, t) {
            return (e.ownerDocument || e) !== j && D(e), M(e, t)
        }, t.attr = function (e, t) {
            (e.ownerDocument || e) !== j && D(e);
            var n = b.attrHandle[t.toLowerCase()],
                r = n && U.call(b.attrHandle, t.toLowerCase()) ? n(e, t, !H) : void 0;
            return void 0 !== r ? r : x.attributes || !H ? e.getAttribute(t) : (r = e.getAttributeNode(t)) && r.specified ? r.value : null
        }, t.error = function (e) {
            throw new Error("Syntax error, unrecognized expression: " + e)
        }, t.uniqueSort = function (e) {
            var t, n = [],
                r = 0,
                i = 0;
            if (A = !x.detectDuplicates, S = !x.sortStable && e.slice(0), e.sort(z), A) {
                for (; t = e[i++];) t === e[i] && (r = n.push(i));
                for (; r--;) e.splice(n[r], 1)
            }
            return S = null, e
        }, w = t.getText = function (e) {
            var t, n = "",
                r = 0,
                i = e.nodeType;
            if (i) {
                if (1 === i || 9 === i || 11 === i) {
                    if ("string" == typeof e.textContent) return e.textContent;
                    for (e = e.firstChild; e; e = e.nextSibling) n += w(e)
                } else if (3 === i || 4 === i) return e.nodeValue
            } else
                for (; t = e[r++];) n += w(t);
            return n
        }, b = t.selectors = {
            cacheLength: 50,
            createPseudo: r,
            match: fe,
            attrHandle: {},
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function (e) {
                    return e[1] = e[1].replace(ye, xe), e[3] = (e[3] || e[4] || e[5] || "").replace(ye, xe), "~=" === e[2] && (e[3] = " " + e[3] + " "), e.slice(0, 4)
                },
                CHILD: function (e) {
                    return e[1] = e[1].toLowerCase(), "nth" === e[1].slice(0, 3) ? (e[3] || t.error(e[0]), e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])), e[5] = +(e[7] + e[8] || "odd" === e[3])) : e[3] && t.error(e[0]), e
                },
                PSEUDO: function (e) {
                    var t, n = !e[6] && e[2];
                    return fe.CHILD.test(e[0]) ? null : (e[3] ? e[2] = e[4] || e[5] || "" : n && le.test(n) && (t = C(n, !0)) && (t = n.indexOf(")", n.length - t) - n.length) && (e[0] = e[0].slice(0, t), e[2] = n.slice(0, t)), e.slice(0, 3))
                }
            },
            filter: {
                TAG: function (e) {
                    var t = e.replace(ye, xe).toLowerCase();
                    return "*" === e ? function () {
                        return !0
                    } : function (e) {
                        return e.nodeName && e.nodeName.toLowerCase() === t
                    }
                },
                CLASS: function (e) {
                    var t = W[e + " "];
                    return t || (t = new RegExp("(^|" + ee + ")" + e + "(" + ee + "|$)")) && W(e, function (e) {
                        return t.test("string" == typeof e.className && e.className || void 0 !== e.getAttribute && e.getAttribute("class") || "")
                    })
                },
                ATTR: function (e, n, r) {
                    return function (i) {
                        var o = t.attr(i, e);
                        return null == o ? "!=" === n : !n || (o += "", "=" === n ? o === r : "!=" === n ? o !== r : "^=" === n ? r && 0 === o.indexOf(r) : "*=" === n ? r && o.indexOf(r) > -1 : "$=" === n ? r && o.slice(-r.length) === r : "~=" === n ? (" " + o.replace(ie, " ") + " ").indexOf(r) > -1 : "|=" === n && (o === r || o.slice(0, r.length + 1) === r + "-"))
                    }
                },
                CHILD: function (e, t, n, r, i) {
                    var o = "nth" !== e.slice(0, 3),
                        a = "last" !== e.slice(-4),
                        s = "of-type" === t;
                    return 1 === r && 0 === i ? function (e) {
                        return !!e.parentNode
                    } : function (t, n, u) {
                        var l, c, f, d, p, h, g = o !== a ? "nextSibling" : "previousSibling",
                            m = t.parentNode,
                            v = s && t.nodeName.toLowerCase(),
                            y = !u && !s,
                            x = !1;
                        if (m) {
                            if (o) {
                                for (; g;) {
                                    for (d = t; d = d[g];)
                                        if (s ? d.nodeName.toLowerCase() === v : 1 === d.nodeType) return !1;
                                    h = g = "only" === e && !h && "nextSibling"
                                }
                                return !0
                            }
                            if (h = [a ? m.firstChild : m.lastChild], a && y) {
                                for (d = m, f = d[O] || (d[O] = {}), c = f[d.uniqueID] || (f[d.uniqueID] = {}), l = c[e] || [], p = l[0] === P && l[1], x = p && l[2], d = p && m.childNodes[p]; d = ++p && d && d[g] || (x = p = 0) || h.pop();)
                                    if (1 === d.nodeType && ++x && d === t) {
                                        c[e] = [P, p, x];
                                        break
                                    }
                            } else if (y && (d = t, f = d[O] || (d[O] = {}), c = f[d.uniqueID] || (f[d.uniqueID] = {}), l = c[e] || [], p = l[0] === P && l[1], x = p),
                                !1 === x)
                                for (;
                                    (d = ++p && d && d[g] || (x = p = 0) || h.pop()) && ((s ? d.nodeName.toLowerCase() !== v : 1 !== d.nodeType) || !++x || (y && (f = d[O] || (d[O] = {}), c = f[d.uniqueID] || (f[d.uniqueID] = {}), c[e] = [P, x]), d !== t)););
                            return (x -= i) === r || x % r == 0 && x / r >= 0
                        }
                    }
                },
                PSEUDO: function (e, n) {
                    var i, o = b.pseudos[e] || b.setFilters[e.toLowerCase()] || t.error("unsupported pseudo: " + e);
                    return o[O] ? o(n) : o.length > 1 ? (i = [e, e, "", n], b.setFilters.hasOwnProperty(e.toLowerCase()) ? r(function (e, t) {
                        for (var r, i = o(e, n), a = i.length; a--;) r = K(e, i[a]), e[r] = !(t[r] = i[a])
                    }) : function (e) {
                        return o(e, 0, i)
                    }) : o
                }
            },
            pseudos: {
                not: r(function (e) {
                    var t = [],
                        n = [],
                        i = E(e.replace(oe, "$1"));
                    return i[O] ? r(function (e, t, n, r) {
                        for (var o, a = i(e, null, r, []), s = e.length; s--;)(o = a[s]) && (e[s] = !(t[s] = o))
                    }) : function (e, r, o) {
                        return t[0] = e, i(t, null, o, n), t[0] = null, !n.pop()
                    }
                }),
                has: r(function (e) {
                    return function (n) {
                        return t(e, n).length > 0
                    }
                }),
                contains: r(function (e) {
                    return e = e.replace(ye, xe),
                        function (t) {
                            return (t.textContent || t.innerText || w(t)).indexOf(e) > -1
                        }
                }),
                lang: r(function (e) {
                    return ce.test(e || "") || t.error("unsupported lang: " + e), e = e.replace(ye, xe).toLowerCase(),
                        function (t) {
                            var n;
                            do {
                                if (n = H ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang")) return (n = n.toLowerCase()) === e || 0 === n.indexOf(e + "-")
                            } while ((t = t.parentNode) && 1 === t.nodeType);
                            return !1
                        }
                }),
                target: function (t) {
                    var n = e.location && e.location.hash;
                    return n && n.slice(1) === t.id
                },
                root: function (e) {
                    return e === L
                },
                focus: function (e) {
                    return e === j.activeElement && (!j.hasFocus || j.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
                },
                enabled: function (e) {
                    return !1 === e.disabled
                },
                disabled: function (e) {
                    return !0 === e.disabled
                },
                checked: function (e) {
                    var t = e.nodeName.toLowerCase();
                    return "input" === t && !!e.checked || "option" === t && !!e.selected
                },
                selected: function (e) {
                    return e.parentNode && e.parentNode.selectedIndex, !0 === e.selected
                },
                empty: function (e) {
                    for (e = e.firstChild; e; e = e.nextSibling)
                        if (e.nodeType < 6) return !1;
                    return !0
                },
                parent: function (e) {
                    return !b.pseudos.empty(e)
                },
                header: function (e) {
                    return pe.test(e.nodeName)
                },
                input: function (e) {
                    return de.test(e.nodeName)
                },
                button: function (e) {
                    var t = e.nodeName.toLowerCase();
                    return "input" === t && "button" === e.type || "button" === t
                },
                text: function (e) {
                    var t;
                    return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || "text" === t.toLowerCase())
                },
                first: s(function () {
                    return [0]
                }),
                last: s(function (e, t) {
                    return [t - 1]
                }),
                eq: s(function (e, t, n) {
                    return [n < 0 ? n + t : n]
                }),
                even: s(function (e, t) {
                    for (var n = 0; n < t; n += 2) e.push(n);
                    return e
                }),
                odd: s(function (e, t) {
                    for (var n = 1; n < t; n += 2) e.push(n);
                    return e
                }),
                lt: s(function (e, t, n) {
                    for (var r = n < 0 ? n + t : n; --r >= 0;) e.push(r);
                    return e
                }),
                gt: s(function (e, t, n) {
                    for (var r = n < 0 ? n + t : n; ++r < t;) e.push(r);
                    return e
                })
            }
        }, b.pseudos.nth = b.pseudos.eq;
        for (y in {
                radio: !0,
                checkbox: !0,
                file: !0,
                password: !0,
                image: !0
            }) b.pseudos[y] = function (e) {
            return function (t) {
                return "input" === t.nodeName.toLowerCase() && t.type === e
            }
        }(y);
        for (y in {
                submit: !0,
                reset: !0
            }) b.pseudos[y] = function (e) {
            return function (t) {
                var n = t.nodeName.toLowerCase();
                return ("input" === n || "button" === n) && t.type === e
            }
        }(y);
        return l.prototype = b.filters = b.pseudos, b.setFilters = new l, C = t.tokenize = function (e, n) {
            var r, i, o, a, s, u, l, c = I[e + " "];
            if (c) return n ? 0 : c.slice(0);
            for (s = e, u = [], l = b.preFilter; s;) {
                r && !(i = ae.exec(s)) || (i && (s = s.slice(i[0].length) || s), u.push(o = [])), r = !1, (i = se.exec(s)) && (r = i.shift(), o.push({
                    value: r,
                    type: i[0].replace(oe, " ")
                }), s = s.slice(r.length));
                for (a in b.filter) !(i = fe[a].exec(s)) || l[a] && !(i = l[a](i)) || (r = i.shift(), o.push({
                    value: r,
                    type: a,
                    matches: i
                }), s = s.slice(r.length));
                if (!r) break
            }
            return n ? s.length : s ? t.error(e) : I(e, u).slice(0)
        }, E = t.compile = function (e, t) {
            var n, r = [],
                i = [],
                o = $[e + " "];
            if (!o) {
                for (t || (t = C(e)), n = t.length; n--;) o = m(t[n]), o[O] ? r.push(o) : i.push(o);
                o = $(e, v(i, r)), o.selector = e
            }
            return o
        }, N = t.select = function (e, t, n, r) {
            var i, o, a, s, l, f = "function" == typeof e && e,
                d = !r && C(e = f.selector || e);
            if (n = n || [], 1 === d.length) {
                if (o = d[0] = d[0].slice(0), o.length > 2 && "ID" === (a = o[0]).type && x.getById && 9 === t.nodeType && H && b.relative[o[1].type]) {
                    if (!(t = (b.find.ID(a.matches[0].replace(ye, xe), t) || [])[0])) return n;
                    f && (t = t.parentNode), e = e.slice(o.shift().value.length)
                }
                for (i = fe.needsContext.test(e) ? 0 : o.length; i-- && (a = o[i], !b.relative[s = a.type]);)
                    if ((l = b.find[s]) && (r = l(a.matches[0].replace(ye, xe), me.test(o[0].type) && u(t.parentNode) || t))) {
                        if (o.splice(i, 1), !(e = r.length && c(o))) return G.apply(n, r), n;
                        break
                    }
            }
            return (f || E(e, d))(r, t, !H, n, !t || me.test(e) && u(t.parentNode) || t), n
        }, x.sortStable = O.split("").sort(z).join("") === O, x.detectDuplicates = !!A, D(), x.sortDetached = i(function (e) {
            return 1 & e.compareDocumentPosition(j.createElement("div"))
        }), i(function (e) {
            return e.innerHTML = "<a href='#'></a>", "#" === e.firstChild.getAttribute("href")
        }) || o("type|href|height|width", function (e, t, n) {
            if (!n) return e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2)
        }), x.attributes && i(function (e) {
            return e.innerHTML = "<input/>", e.firstChild.setAttribute("value", ""), "" === e.firstChild.getAttribute("value")
        }) || o("value", function (e, t, n) {
            if (!n && "input" === e.nodeName.toLowerCase()) return e.defaultValue
        }), i(function (e) {
            return null == e.getAttribute("disabled")
        }) || o(Z, function (e, t, n) {
            var r;
            if (!n) return !0 === e[t] ? t.toLowerCase() : (r = e.getAttributeNode(t)) && r.specified ? r.value : null
        }), t
    }(e);
    de.find = ve, de.expr = ve.selectors, de.expr[":"] = de.expr.pseudos, de.uniqueSort = de.unique = ve.uniqueSort, de.text = ve.getText, de.isXMLDoc = ve.isXML, de.contains = ve.contains;
    var ye = function (e, t, n) {
            for (var r = [], i = void 0 !== n;
                (e = e[t]) && 9 !== e.nodeType;)
                if (1 === e.nodeType) {
                    if (i && de(e).is(n)) break;
                    r.push(e)
                } return r
        },
        xe = function (e, t) {
            for (var n = []; e; e = e.nextSibling) 1 === e.nodeType && e !== t && n.push(e);
            return n
        },
        be = de.expr.match.needsContext,
        we = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,
        Te = /^.[^:#\[\.,]*$/;
    de.filter = function (e, t, n) {
        var r = t[0];
        return n && (e = ":not(" + e + ")"), 1 === t.length && 1 === r.nodeType ? de.find.matchesSelector(r, e) ? [r] : [] : de.find.matches(e, de.grep(t, function (e) {
            return 1 === e.nodeType
        }))
    }, de.fn.extend({
        find: function (e) {
            var t, n = [],
                r = this,
                i = r.length;
            if ("string" != typeof e) return this.pushStack(de(e).filter(function () {
                for (t = 0; t < i; t++)
                    if (de.contains(r[t], this)) return !0
            }));
            for (t = 0; t < i; t++) de.find(e, r[t], n);
            return n = this.pushStack(i > 1 ? de.unique(n) : n), n.selector = this.selector ? this.selector + " " + e : e, n
        },
        filter: function (e) {
            return this.pushStack(r(this, e || [], !1))
        },
        not: function (e) {
            return this.pushStack(r(this, e || [], !0))
        },
        is: function (e) {
            return !!r(this, "string" == typeof e && be.test(e) ? de(e) : e || [], !1).length
        }
    });
    var Ce, Ee = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
    (de.fn.init = function (e, t, n) {
        var r, i;
        if (!e) return this;
        if (n = n || Ce, "string" == typeof e) {
            if (!(r = "<" === e.charAt(0) && ">" === e.charAt(e.length - 1) && e.length >= 3 ? [null, e, null] : Ee.exec(e)) || !r[1] && t) return !t || t.jquery ? (t || n).find(e) : this.constructor(t).find(e);
            if (r[1]) {
                if (t = t instanceof de ? t[0] : t, de.merge(this, de.parseHTML(r[1], t && t.nodeType ? t.ownerDocument || t : re, !0)), we.test(r[1]) && de.isPlainObject(t))
                    for (r in t) de.isFunction(this[r]) ? this[r](t[r]) : this.attr(r, t[r]);
                return this
            }
            if ((i = re.getElementById(r[2])) && i.parentNode) {
                if (i.id !== r[2]) return Ce.find(e);
                this.length = 1, this[0] = i
            }
            return this.context = re, this.selector = e, this
        }
        return e.nodeType ? (this.context = this[0] = e, this.length = 1, this) : de.isFunction(e) ? void 0 !== n.ready ? n.ready(e) : e(de) : (void 0 !== e.selector && (this.selector = e.selector, this.context = e.context), de.makeArray(e, this))
    }).prototype = de.fn, Ce = de(re);
    var Ne = /^(?:parents|prev(?:Until|All))/,
        ke = {
            children: !0,
            contents: !0,
            next: !0,
            prev: !0
        };
    de.fn.extend({
        has: function (e) {
            var t, n = de(e, this),
                r = n.length;
            return this.filter(function () {
                for (t = 0; t < r; t++)
                    if (de.contains(this, n[t])) return !0
            })
        },
        closest: function (e, t) {
            for (var n, r = 0, i = this.length, o = [], a = be.test(e) || "string" != typeof e ? de(e, t || this.context) : 0; r < i; r++)
                for (n = this[r]; n && n !== t; n = n.parentNode)
                    if (n.nodeType < 11 && (a ? a.index(n) > -1 : 1 === n.nodeType && de.find.matchesSelector(n, e))) {
                        o.push(n);
                        break
                    } return this.pushStack(o.length > 1 ? de.uniqueSort(o) : o)
        },
        index: function (e) {
            return e ? "string" == typeof e ? de.inArray(this[0], de(e)) : de.inArray(e.jquery ? e[0] : e, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
        },
        add: function (e, t) {
            return this.pushStack(de.uniqueSort(de.merge(this.get(), de(e, t))))
        },
        addBack: function (e) {
            return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
        }
    }), de.each({
        parent: function (e) {
            var t = e.parentNode;
            return t && 11 !== t.nodeType ? t : null
        },
        parents: function (e) {
            return ye(e, "parentNode")
        },
        parentsUntil: function (e, t, n) {
            return ye(e, "parentNode", n)
        },
        next: function (e) {
            return i(e, "nextSibling")
        },
        prev: function (e) {
            return i(e, "previousSibling")
        },
        nextAll: function (e) {
            return ye(e, "nextSibling")
        },
        prevAll: function (e) {
            return ye(e, "previousSibling")
        },
        nextUntil: function (e, t, n) {
            return ye(e, "nextSibling", n)
        },
        prevUntil: function (e, t, n) {
            return ye(e, "previousSibling", n)
        },
        siblings: function (e) {
            return xe((e.parentNode || {}).firstChild, e)
        },
        children: function (e) {
            return xe(e.firstChild)
        },
        contents: function (e) {
            return de.nodeName(e, "iframe") ? e.contentDocument || e.contentWindow.document : de.merge([], e.childNodes)
        }
    }, function (e, t) {
        de.fn[e] = function (n, r) {
            var i = de.map(this, t, n);
            return "Until" !== e.slice(-5) && (r = n), r && "string" == typeof r && (i = de.filter(r, i)), this.length > 1 && (ke[e] || (i = de.uniqueSort(i)), Ne.test(e) && (i = i.reverse())), this.pushStack(i)
        }
    });
    var Se = /\S+/g;
    de.Callbacks = function (e) {
        e = "string" == typeof e ? o(e) : de.extend({}, e);
        var t, n, r, i, a = [],
            s = [],
            u = -1,
            l = function () {
                for (i = e.once, r = t = !0; s.length; u = -1)
                    for (n = s.shift(); ++u < a.length;) !1 === a[u].apply(n[0], n[1]) && e.stopOnFalse && (u = a.length, n = !1);
                e.memory || (n = !1), t = !1, i && (a = n ? [] : "")
            },
            c = {
                add: function () {
                    return a && (n && !t && (u = a.length - 1, s.push(n)), function t(n) {
                        de.each(n, function (n, r) {
                            de.isFunction(r) ? e.unique && c.has(r) || a.push(r) : r && r.length && "string" !== de.type(r) && t(r)
                        })
                    }(arguments), n && !t && l()), this
                },
                remove: function () {
                    return de.each(arguments, function (e, t) {
                        for (var n;
                            (n = de.inArray(t, a, n)) > -1;) a.splice(n, 1), n <= u && u--
                    }), this
                },
                has: function (e) {
                    return e ? de.inArray(e, a) > -1 : a.length > 0
                },
                empty: function () {
                    return a && (a = []), this
                },
                disable: function () {
                    return i = s = [], a = n = "", this
                },
                disabled: function () {
                    return !a
                },
                lock: function () {
                    return i = !0, n || c.disable(), this
                },
                locked: function () {
                    return !!i
                },
                fireWith: function (e, n) {
                    return i || (n = n || [], n = [e, n.slice ? n.slice() : n], s.push(n), t || l()), this
                },
                fire: function () {
                    return c.fireWith(this, arguments), this
                },
                fired: function () {
                    return !!r
                }
            };
        return c
    }, de.extend({
        Deferred: function (e) {
            var t = [
                    ["resolve", "done", de.Callbacks("once memory"), "resolved"],
                    ["reject", "fail", de.Callbacks("once memory"), "rejected"],
                    ["notify", "progress", de.Callbacks("memory")]
                ],
                n = "pending",
                r = {
                    state: function () {
                        return n
                    },
                    always: function () {
                        return i.done(arguments).fail(arguments), this
                    },
                    then: function () {
                        var e = arguments;
                        return de.Deferred(function (n) {
                            de.each(t, function (t, o) {
                                var a = de.isFunction(e[t]) && e[t];
                                i[o[1]](function () {
                                    var e = a && a.apply(this, arguments);
                                    e && de.isFunction(e.promise) ? e.promise().progress(n.notify).done(n.resolve).fail(n.reject) : n[o[0] + "With"](this === r ? n.promise() : this, a ? [e] : arguments)
                                })
                            }), e = null
                        }).promise()
                    },
                    promise: function (e) {
                        return null != e ? de.extend(e, r) : r
                    }
                },
                i = {};
            return r.pipe = r.then, de.each(t, function (e, o) {
                var a = o[2],
                    s = o[3];
                r[o[1]] = a.add, s && a.add(function () {
                    n = s
                }, t[1 ^ e][2].disable, t[2][2].lock), i[o[0]] = function () {
                    return i[o[0] + "With"](this === i ? r : this, arguments), this
                }, i[o[0] + "With"] = a.fireWith
            }), r.promise(i), e && e.call(i, i), i
        },
        when: function (e) {
            var t, n, r, i = 0,
                o = ie.call(arguments),
                a = o.length,
                s = 1 !== a || e && de.isFunction(e.promise) ? a : 0,
                u = 1 === s ? e : de.Deferred(),
                l = function (e, n, r) {
                    return function (i) {
                        n[e] = this, r[e] = arguments.length > 1 ? ie.call(arguments) : i, r === t ? u.notifyWith(n, r) : --s || u.resolveWith(n, r)
                    }
                };
            if (a > 1)
                for (t = new Array(a), n = new Array(a), r = new Array(a); i < a; i++) o[i] && de.isFunction(o[i].promise) ? o[i].promise().progress(l(i, n, t)).done(l(i, r, o)).fail(u.reject) : --s;
            return s || u.resolveWith(r, o), u.promise()
        }
    });
    var Ae;
    de.fn.ready = function (e) {
        return de.ready.promise().done(e), this
    }, de.extend({
        isReady: !1,
        readyWait: 1,
        holdReady: function (e) {
            e ? de.readyWait++ : de.ready(!0)
        },
        ready: function (e) {
            (!0 === e ? --de.readyWait : de.isReady) || (de.isReady = !0, !0 !== e && --de.readyWait > 0 || (Ae.resolveWith(re, [de]), de.fn.triggerHandler && (de(re).triggerHandler("ready"), de(re).off("ready"))))
        }
    }), de.ready.promise = function (t) {
        if (!Ae)
            if (Ae = de.Deferred(), "complete" === re.readyState || "loading" !== re.readyState && !re.documentElement.doScroll) e.setTimeout(de.ready);
            else if (re.addEventListener) re.addEventListener("DOMContentLoaded", s), e.addEventListener("load", s);
        else {
            re.attachEvent("onreadystatechange", s), e.attachEvent("onload", s);
            var n = !1;
            try {
                n = null == e.frameElement && re.documentElement
            } catch (e) {}
            n && n.doScroll && function t() {
                if (!de.isReady) {
                    try {
                        n.doScroll("left")
                    } catch (n) {
                        return e.setTimeout(t, 50)
                    }
                    a(), de.ready()
                }
            }()
        }
        return Ae.promise(t)
    }, de.ready.promise();
    var De;
    for (De in de(fe)) break;
    fe.ownFirst = "0" === De, fe.inlineBlockNeedsLayout = !1, de(function () {
            var e, t, n, r;
            (n = re.getElementsByTagName("body")[0]) && n.style && (t = re.createElement("div"), r = re.createElement("div"), r.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", n.appendChild(r).appendChild(t), void 0 !== t.style.zoom && (t.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1", fe.inlineBlockNeedsLayout = e = 3 === t.offsetWidth, e && (n.style.zoom = 1)), n.removeChild(r))
        }),
        function () {
            var e = re.createElement("div");
            fe.deleteExpando = !0;
            try {
                delete e.test
            } catch (e) {
                fe.deleteExpando = !1
            }
            e = null
        }();
    var je = function (e) {
            var t = de.noData[(e.nodeName + " ").toLowerCase()],
                n = +e.nodeType || 1;
            return (1 === n || 9 === n) && (!t || !0 !== t && e.getAttribute("classid") === t)
        },
        Le = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
        He = /([A-Z])/g;
    de.extend({
            cache: {},
            noData: {
                "applet ": !0,
                "embed ": !0,
                "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
            },
            hasData: function (e) {
                return !!(e = e.nodeType ? de.cache[e[de.expando]] : e[de.expando]) && !l(e)
            },
            data: function (e, t, n) {
                return c(e, t, n)
            },
            removeData: function (e, t) {
                return f(e, t)
            },
            _data: function (e, t, n) {
                return c(e, t, n, !0)
            },
            _removeData: function (e, t) {
                return f(e, t, !0)
            }
        }), de.fn.extend({
            data: function (e, t) {
                var n, r, i, o = this[0],
                    a = o && o.attributes;
                if (void 0 === e) {
                    if (this.length && (i = de.data(o), 1 === o.nodeType && !de._data(o, "parsedAttrs"))) {
                        for (n = a.length; n--;) a[n] && (r = a[n].name, 0 === r.indexOf("data-") && (r = de.camelCase(r.slice(5)), u(o, r, i[r])));
                        de._data(o, "parsedAttrs", !0)
                    }
                    return i
                }
                return "object" == typeof e ? this.each(function () {
                    de.data(this, e)
                }) : arguments.length > 1 ? this.each(function () {
                    de.data(this, e, t)
                }) : o ? u(o, e, de.data(o, e)) : void 0
            },
            removeData: function (e) {
                return this.each(function () {
                    de.removeData(this, e)
                })
            }
        }), de.extend({
            queue: function (e, t, n) {
                var r;
                if (e) return t = (t || "fx") + "queue", r = de._data(e, t), n && (!r || de.isArray(n) ? r = de._data(e, t, de.makeArray(n)) : r.push(n)), r || []
            },
            dequeue: function (e, t) {
                t = t || "fx";
                var n = de.queue(e, t),
                    r = n.length,
                    i = n.shift(),
                    o = de._queueHooks(e, t),
                    a = function () {
                        de.dequeue(e, t)
                    };
                "inprogress" === i && (i = n.shift(), r--), i && ("fx" === t && n.unshift("inprogress"), delete o.stop, i.call(e, a, o)), !r && o && o.empty.fire()
            },
            _queueHooks: function (e, t) {
                var n = t + "queueHooks";
                return de._data(e, n) || de._data(e, n, {
                    empty: de.Callbacks("once memory").add(function () {
                        de._removeData(e, t + "queue"), de._removeData(e, n)
                    })
                })
            }
        }), de.fn.extend({
            queue: function (e, t) {
                var n = 2;
                return "string" != typeof e && (t = e, e = "fx", n--), arguments.length < n ? de.queue(this[0], e) : void 0 === t ? this : this.each(function () {
                    var n = de.queue(this, e, t);
                    de._queueHooks(this, e), "fx" === e && "inprogress" !== n[0] && de.dequeue(this, e)
                })
            },
            dequeue: function (e) {
                return this.each(function () {
                    de.dequeue(this, e)
                })
            },
            clearQueue: function (e) {
                return this.queue(e || "fx", [])
            },
            promise: function (e, t) {
                var n, r = 1,
                    i = de.Deferred(),
                    o = this,
                    a = this.length,
                    s = function () {
                        --r || i.resolveWith(o, [o])
                    };
                for ("string" != typeof e && (t = e, e = void 0), e = e || "fx"; a--;)(n = de._data(o[a], e + "queueHooks")) && n.empty && (r++, n.empty.add(s));
                return s(), i.promise(t)
            }
        }),
        function () {
            var e;
            fe.shrinkWrapBlocks = function () {
                if (null != e) return e;
                e = !1;
                var t, n, r;
                return (n = re.getElementsByTagName("body")[0]) && n.style ? (t = re.createElement("div"), r = re.createElement("div"), r.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px", n.appendChild(r).appendChild(t), void 0 !== t.style.zoom && (t.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1", t.appendChild(re.createElement("div")).style.width = "5px", e = 3 !== t.offsetWidth), n.removeChild(r), e) : void 0
            }
        }();
    var qe = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
        _e = new RegExp("^(?:([+-])=|)(" + qe + ")([a-z%]*)$", "i"),
        Fe = ["Top", "Right", "Bottom", "Left"],
        Me = function (e, t) {
            return e = t || e, "none" === de.css(e, "display") || !de.contains(e.ownerDocument, e)
        },
        Oe = function (e, t, n, r, i, o, a) {
            var s = 0,
                u = e.length,
                l = null == n;
            if ("object" === de.type(n)) {
                i = !0;
                for (s in n) Oe(e, t, s, n[s], !0, o, a)
            } else if (void 0 !== r && (i = !0, de.isFunction(r) || (a = !0), l && (a ? (t.call(e, r), t = null) : (l = t, t = function (e, t, n) {
                    return l.call(de(e), n)
                })), t))
                for (; s < u; s++) t(e[s], n, a ? r : r.call(e[s], s, t(e[s], n)));
            return i ? e : l ? t.call(e) : u ? t(e[0], n) : o
        },
        Re = /^(?:checkbox|radio)$/i,
        Pe = /<([\w:-]+)/,
        Be = /^$|\/(?:java|ecma)script/i,
        We = /^\s+/,
        Ie = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|dialog|figcaption|figure|footer|header|hgroup|main|mark|meter|nav|output|picture|progress|section|summary|template|time|video";
    ! function () {
        var e = re.createElement("div"),
            t = re.createDocumentFragment(),
            n = re.createElement("input");
        e.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", fe.leadingWhitespace = 3 === e.firstChild.nodeType, fe.tbody = !e.getElementsByTagName("tbody").length, fe.htmlSerialize = !!e.getElementsByTagName("link").length, fe.html5Clone = "<:nav></:nav>" !== re.createElement("nav").cloneNode(!0).outerHTML, n.type = "checkbox", n.checked = !0, t.appendChild(n), fe.appendChecked = n.checked, e.innerHTML = "<textarea>x</textarea>", fe.noCloneChecked = !!e.cloneNode(!0).lastChild.defaultValue, t.appendChild(e), n = re.createElement("input"), n.setAttribute("type", "radio"), n.setAttribute("checked", "checked"), n.setAttribute("name", "t"), e.appendChild(n), fe.checkClone = e.cloneNode(!0).cloneNode(!0).lastChild.checked, fe.noCloneEvent = !!e.addEventListener, e[de.expando] = 1, fe.attributes = !e.getAttribute(de.expando)
    }();
    var $e = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        legend: [1, "<fieldset>", "</fieldset>"],
        area: [1, "<map>", "</map>"],
        param: [1, "<object>", "</object>"],
        thead: [1, "<table>", "</table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        _default: fe.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
    };
    $e.optgroup = $e.option, $e.tbody = $e.tfoot = $e.colgroup = $e.caption = $e.thead, $e.th = $e.td;
    var ze = /<|&#?\w+;/,
        Xe = /<tbody/i;
    ! function () {
        var t, n, r = re.createElement("div");
        for (t in {
                submit: !0,
                change: !0,
                focusin: !0
            }) n = "on" + t, (fe[t] = n in e) || (r.setAttribute(n, "t"), fe[t] = !1 === r.attributes[n].expando);
        r = null
    }();
    var Ue = /^(?:input|select|textarea)$/i,
        Ve = /^key/,
        Ye = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
        Je = /^(?:focusinfocus|focusoutblur)$/,
        Ge = /^([^.]*)(?:\.(.+)|)/;
    de.event = {
        global: {},
        add: function (e, t, n, r, i) {
            var o, a, s, u, l, c, f, d, p, h, g, m = de._data(e);
            if (m) {
                for (n.handler && (u = n, n = u.handler, i = u.selector), n.guid || (n.guid = de.guid++), (a = m.events) || (a = m.events = {}), (c = m.handle) || (c = m.handle = function (e) {
                        return void 0 === de || e && de.event.triggered === e.type ? void 0 : de.event.dispatch.apply(c.elem, arguments)
                    }, c.elem = e), t = (t || "").match(Se) || [""], s = t.length; s--;) o = Ge.exec(t[s]) || [], p = g = o[1], h = (o[2] || "").split(".").sort(), p && (l = de.event.special[p] || {}, p = (i ? l.delegateType : l.bindType) || p, l = de.event.special[p] || {}, f = de.extend({
                    type: p,
                    origType: g,
                    data: r,
                    handler: n,
                    guid: n.guid,
                    selector: i,
                    needsContext: i && de.expr.match.needsContext.test(i),
                    namespace: h.join(".")
                }, u), (d = a[p]) || (d = a[p] = [], d.delegateCount = 0, l.setup && !1 !== l.setup.call(e, r, h, c) || (e.addEventListener ? e.addEventListener(p, c, !1) : e.attachEvent && e.attachEvent("on" + p, c))), l.add && (l.add.call(e, f), f.handler.guid || (f.handler.guid = n.guid)), i ? d.splice(d.delegateCount++, 0, f) : d.push(f), de.event.global[p] = !0);
                e = null
            }
        },
        remove: function (e, t, n, r, i) {
            var o, a, s, u, l, c, f, d, p, h, g, m = de.hasData(e) && de._data(e);
            if (m && (c = m.events)) {
                for (t = (t || "").match(Se) || [""], l = t.length; l--;)
                    if (s = Ge.exec(t[l]) || [], p = g = s[1], h = (s[2] || "").split(".").sort(), p) {
                        for (f = de.event.special[p] || {}, p = (r ? f.delegateType : f.bindType) || p, d = c[p] || [], s = s[2] && new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)"), u = o = d.length; o--;) a = d[o], !i && g !== a.origType || n && n.guid !== a.guid || s && !s.test(a.namespace) || r && r !== a.selector && ("**" !== r || !a.selector) || (d.splice(o, 1), a.selector && d.delegateCount--, f.remove && f.remove.call(e, a));
                        u && !d.length && (f.teardown && !1 !== f.teardown.call(e, h, m.handle) || de.removeEvent(e, p, m.handle), delete c[p])
                    } else
                        for (p in c) de.event.remove(e, p + t[l], n, r, !0);
                de.isEmptyObject(c) && (delete m.handle, de._removeData(e, "events"))
            }
        },
        trigger: function (t, n, r, i) {
            var o, a, s, u, l, c, f, d = [r || re],
                p = ce.call(t, "type") ? t.type : t,
                h = ce.call(t, "namespace") ? t.namespace.split(".") : [];
            if (s = c = r = r || re, 3 !== r.nodeType && 8 !== r.nodeType && !Je.test(p + de.event.triggered) && (p.indexOf(".") > -1 && (h = p.split("."), p = h.shift(), h.sort()), a = p.indexOf(":") < 0 && "on" + p, t = t[de.expando] ? t : new de.Event(p, "object" == typeof t && t), t.isTrigger = i ? 2 : 3, t.namespace = h.join("."), t.rnamespace = t.namespace ? new RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, t.result = void 0, t.target || (t.target = r), n = null == n ? [t] : de.makeArray(n, [t]), l = de.event.special[p] || {}, i || !l.trigger || !1 !== l.trigger.apply(r, n))) {
                if (!i && !l.noBubble && !de.isWindow(r)) {
                    for (u = l.delegateType || p, Je.test(u + p) || (s = s.parentNode); s; s = s.parentNode) d.push(s), c = s;
                    c === (r.ownerDocument || re) && d.push(c.defaultView || c.parentWindow || e)
                }
                for (f = 0;
                    (s = d[f++]) && !t.isPropagationStopped();) t.type = f > 1 ? u : l.bindType || p, o = (de._data(s, "events") || {})[t.type] && de._data(s, "handle"), o && o.apply(s, n), (o = a && s[a]) && o.apply && je(s) && (t.result = o.apply(s, n), !1 === t.result && t.preventDefault());
                if (t.type = p, !i && !t.isDefaultPrevented() && (!l._default || !1 === l._default.apply(d.pop(), n)) && je(r) && a && r[p] && !de.isWindow(r)) {
                    c = r[a], c && (r[a] = null), de.event.triggered = p;
                    try {
                        r[p]()
                    } catch (e) {}
                    de.event.triggered = void 0, c && (r[a] = c)
                }
                return t.result
            }
        },
        dispatch: function (e) {
            e = de.event.fix(e);
            var t, n, r, i, o, a = [],
                s = ie.call(arguments),
                u = (de._data(this, "events") || {})[e.type] || [],
                l = de.event.special[e.type] || {};
            if (s[0] = e, e.delegateTarget = this, !l.preDispatch || !1 !== l.preDispatch.call(this, e)) {
                for (a = de.event.handlers.call(this, e, u), t = 0;
                    (i = a[t++]) && !e.isPropagationStopped();)
                    for (e.currentTarget = i.elem, n = 0;
                        (o = i.handlers[n++]) && !e.isImmediatePropagationStopped();) e.rnamespace && !e.rnamespace.test(o.namespace) || (e.handleObj = o, e.data = o.data, void 0 !== (r = ((de.event.special[o.origType] || {}).handle || o.handler).apply(i.elem, s)) && !1 === (e.result = r) && (e.preventDefault(), e.stopPropagation()));
                return l.postDispatch && l.postDispatch.call(this, e), e.result
            }
        },
        handlers: function (e, t) {
            var n, r, i, o, a = [],
                s = t.delegateCount,
                u = e.target;
            if (s && u.nodeType && ("click" !== e.type || isNaN(e.button) || e.button < 1))
                for (; u != this; u = u.parentNode || this)
                    if (1 === u.nodeType && (!0 !== u.disabled || "click" !== e.type)) {
                        for (r = [], n = 0; n < s; n++) o = t[n], i = o.selector + " ", void 0 === r[i] && (r[i] = o.needsContext ? de(i, this).index(u) > -1 : de.find(i, this, null, [u]).length), r[i] && r.push(o);
                        r.length && a.push({
                            elem: u,
                            handlers: r
                        })
                    } return s < t.length && a.push({
                elem: this,
                handlers: t.slice(s)
            }), a
        },
        fix: function (e) {
            if (e[de.expando]) return e;
            var t, n, r, i = e.type,
                o = e,
                a = this.fixHooks[i];
            for (a || (this.fixHooks[i] = a = Ye.test(i) ? this.mouseHooks : Ve.test(i) ? this.keyHooks : {}), r = a.props ? this.props.concat(a.props) : this.props, e = new de.Event(o), t = r.length; t--;) n = r[t], e[n] = o[n];
            return e.target || (e.target = o.srcElement || re), 3 === e.target.nodeType && (e.target = e.target.parentNode), e.metaKey = !!e.metaKey, a.filter ? a.filter(e, o) : e
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function (e, t) {
                return null == e.which && (e.which = null != t.charCode ? t.charCode : t.keyCode), e
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function (e, t) {
                var n, r, i, o = t.button,
                    a = t.fromElement;
                return null == e.pageX && null != t.clientX && (r = e.target.ownerDocument || re, i = r.documentElement, n = r.body, e.pageX = t.clientX + (i && i.scrollLeft || n && n.scrollLeft || 0) - (i && i.clientLeft || n && n.clientLeft || 0), e.pageY = t.clientY + (i && i.scrollTop || n && n.scrollTop || 0) - (i && i.clientTop || n && n.clientTop || 0)), !e.relatedTarget && a && (e.relatedTarget = a === e.target ? t.toElement : a), e.which || void 0 === o || (e.which = 1 & o ? 1 : 2 & o ? 3 : 4 & o ? 2 : 0), e
            }
        },
        special: {
            load: {
                noBubble: !0
            },
            focus: {
                trigger: function () {
                    if (this !== b() && this.focus) try {
                        return this.focus(), !1
                    } catch (e) {}
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function () {
                    if (this === b() && this.blur) return this.blur(), !1
                },
                delegateType: "focusout"
            },
            click: {
                trigger: function () {
                    if (de.nodeName(this, "input") && "checkbox" === this.type && this.click) return this.click(), !1
                },
                _default: function (e) {
                    return de.nodeName(e.target, "a")
                }
            },
            beforeunload: {
                postDispatch: function (e) {
                    void 0 !== e.result && e.originalEvent && (e.originalEvent.returnValue = e.result)
                }
            }
        },
        simulate: function (e, t, n) {
            var r = de.extend(new de.Event, n, {
                type: e,
                isSimulated: !0
            });
            de.event.trigger(r, null, t), r.isDefaultPrevented() && n.preventDefault()
        }
    }, de.removeEvent = re.removeEventListener ? function (e, t, n) {
        e.removeEventListener && e.removeEventListener(t, n)
    } : function (e, t, n) {
        var r = "on" + t;
        e.detachEvent && (void 0 === e[r] && (e[r] = null), e.detachEvent(r, n))
    }, de.Event = function (e, t) {
        if (!(this instanceof de.Event)) return new de.Event(e, t);
        e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || void 0 === e.defaultPrevented && !1 === e.returnValue ? y : x) : this.type = e, t && de.extend(this, t), this.timeStamp = e && e.timeStamp || de.now(), this[de.expando] = !0
    }, de.Event.prototype = {
        constructor: de.Event,
        isDefaultPrevented: x,
        isPropagationStopped: x,
        isImmediatePropagationStopped: x,
        preventDefault: function () {
            var e = this.originalEvent;
            this.isDefaultPrevented = y, e && (e.preventDefault ? e.preventDefault() : e.returnValue = !1)
        },
        stopPropagation: function () {
            var e = this.originalEvent;
            this.isPropagationStopped = y, e && !this.isSimulated && (e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0)
        },
        stopImmediatePropagation: function () {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = y, e && e.stopImmediatePropagation && e.stopImmediatePropagation(), this.stopPropagation()
        }
    }, de.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
    }, function (e, t) {
        de.event.special[e] = {
            delegateType: t,
            bindType: t,
            handle: function (e) {
                var n, r = this,
                    i = e.relatedTarget,
                    o = e.handleObj;
                return i && (i === r || de.contains(r, i)) || (e.type = o.origType, n = o.handler.apply(this, arguments), e.type = t), n
            }
        }
    }), fe.submit || (de.event.special.submit = {
        setup: function () {
            if (de.nodeName(this, "form")) return !1;
            de.event.add(this, "click._submit keypress._submit", function (e) {
                var t = e.target,
                    n = de.nodeName(t, "input") || de.nodeName(t, "button") ? de.prop(t, "form") : void 0;
                n && !de._data(n, "submit") && (de.event.add(n, "submit._submit", function (e) {
                    e._submitBubble = !0
                }), de._data(n, "submit", !0))
            })
        },
        postDispatch: function (e) {
            e._submitBubble && (delete e._submitBubble, this.parentNode && !e.isTrigger && de.event.simulate("submit", this.parentNode, e))
        },
        teardown: function () {
            if (de.nodeName(this, "form")) return !1;
            de.event.remove(this, "._submit")
        }
    }), fe.change || (de.event.special.change = {
        setup: function () {
            if (Ue.test(this.nodeName)) return "checkbox" !== this.type && "radio" !== this.type || (de.event.add(this, "propertychange._change", function (e) {
                "checked" === e.originalEvent.propertyName && (this._justChanged = !0)
            }), de.event.add(this, "click._change", function (e) {
                this._justChanged && !e.isTrigger && (this._justChanged = !1), de.event.simulate("change", this, e)
            })), !1;
            de.event.add(this, "beforeactivate._change", function (e) {
                var t = e.target;
                Ue.test(t.nodeName) && !de._data(t, "change") && (de.event.add(t, "change._change", function (e) {
                    !this.parentNode || e.isSimulated || e.isTrigger || de.event.simulate("change", this.parentNode, e)
                }), de._data(t, "change", !0))
            })
        },
        handle: function (e) {
            var t = e.target;
            if (this !== t || e.isSimulated || e.isTrigger || "radio" !== t.type && "checkbox" !== t.type) return e.handleObj.handler.apply(this, arguments)
        },
        teardown: function () {
            return de.event.remove(this, "._change"), !Ue.test(this.nodeName)
        }
    }), fe.focusin || de.each({
        focus: "focusin",
        blur: "focusout"
    }, function (e, t) {
        var n = function (e) {
            de.event.simulate(t, e.target, de.event.fix(e))
        };
        de.event.special[t] = {
            setup: function () {
                var r = this.ownerDocument || this,
                    i = de._data(r, t);
                i || r.addEventListener(e, n, !0), de._data(r, t, (i || 0) + 1)
            },
            teardown: function () {
                var r = this.ownerDocument || this,
                    i = de._data(r, t) - 1;
                i ? de._data(r, t, i) : (r.removeEventListener(e, n, !0), de._removeData(r, t))
            }
        }
    }), de.fn.extend({
        on: function (e, t, n, r) {
            return w(this, e, t, n, r)
        },
        one: function (e, t, n, r) {
            return w(this, e, t, n, r, 1)
        },
        off: function (e, t, n) {
            var r, i;
            if (e && e.preventDefault && e.handleObj) return r = e.handleObj, de(e.delegateTarget).off(r.namespace ? r.origType + "." + r.namespace : r.origType, r.selector, r.handler), this;
            if ("object" == typeof e) {
                for (i in e) this.off(i, t, e[i]);
                return this
            }
            return !1 !== t && "function" != typeof t || (n = t, t = void 0), !1 === n && (n = x), this.each(function () {
                de.event.remove(this, e, n, t)
            })
        },
        trigger: function (e, t) {
            return this.each(function () {
                de.event.trigger(e, t, this)
            })
        },
        triggerHandler: function (e, t) {
            var n = this[0];
            if (n) return de.event.trigger(e, t, n, !0)
        }
    });
    var Qe = / jQuery\d+="(?:null|\d+)"/g,
        Ke = new RegExp("<(?:" + Ie + ")[\\s/>]", "i"),
        Ze = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
        et = /<script|<style|<link/i,
        tt = /checked\s*(?:[^=]|=\s*.checked.)/i,
        nt = /^true\/(.*)/,
        rt = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
        it = p(re),
        ot = it.appendChild(re.createElement("div"));
    de.extend({
        htmlPrefilter: function (e) {
            return e.replace(Ze, "<$1></$2>")
        },
        clone: function (e, t, n) {
            var r, i, o, a, s, u = de.contains(e.ownerDocument, e);
            if (fe.html5Clone || de.isXMLDoc(e) || !Ke.test("<" + e.nodeName + ">") ? o = e.cloneNode(!0) : (ot.innerHTML = e.outerHTML, ot.removeChild(o = ot.firstChild)), !(fe.noCloneEvent && fe.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || de.isXMLDoc(e)))
                for (r = h(o), s = h(e), a = 0; null != (i = s[a]); ++a) r[a] && k(i, r[a]);
            if (t)
                if (n)
                    for (s = s || h(e), r = r || h(o), a = 0; null != (i = s[a]); a++) N(i, r[a]);
                else N(e, o);
            return r = h(o, "script"), r.length > 0 && g(r, !u && h(e, "script")), r = s = i = null, o
        },
        cleanData: function (e, t) {
            for (var n, r, i, o, a = 0, s = de.expando, u = de.cache, l = fe.attributes, c = de.event.special; null != (n = e[a]); a++)
                if ((t || je(n)) && (i = n[s], o = i && u[i])) {
                    if (o.events)
                        for (r in o.events) c[r] ? de.event.remove(n, r) : de.removeEvent(n, r, o.handle);
                    u[i] && (delete u[i], l || void 0 === n.removeAttribute ? n[s] = void 0 : n.removeAttribute(s), ne.push(i))
                }
        }
    }), de.fn.extend({
        domManip: S,
        detach: function (e) {
            return A(this, e, !0)
        },
        remove: function (e) {
            return A(this, e)
        },
        text: function (e) {
            return Oe(this, function (e) {
                return void 0 === e ? de.text(this) : this.empty().append((this[0] && this[0].ownerDocument || re).createTextNode(e))
            }, null, e, arguments.length)
        },
        append: function () {
            return S(this, arguments, function (e) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    T(this, e).appendChild(e)
                }
            })
        },
        prepend: function () {
            return S(this, arguments, function (e) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var t = T(this, e);
                    t.insertBefore(e, t.firstChild)
                }
            })
        },
        before: function () {
            return S(this, arguments, function (e) {
                this.parentNode && this.parentNode.insertBefore(e, this)
            })
        },
        after: function () {
            return S(this, arguments, function (e) {
                this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
            })
        },
        empty: function () {
            for (var e, t = 0; null != (e = this[t]); t++) {
                for (1 === e.nodeType && de.cleanData(h(e, !1)); e.firstChild;) e.removeChild(e.firstChild);
                e.options && de.nodeName(e, "select") && (e.options.length = 0)
            }
            return this
        },
        clone: function (e, t) {
            return e = null != e && e, t = null == t ? e : t, this.map(function () {
                return de.clone(this, e, t)
            })
        },
        html: function (e) {
            return Oe(this, function (e) {
                var t = this[0] || {},
                    n = 0,
                    r = this.length;
                if (void 0 === e) return 1 === t.nodeType ? t.innerHTML.replace(Qe, "") : void 0;
                if ("string" == typeof e && !et.test(e) && (fe.htmlSerialize || !Ke.test(e)) && (fe.leadingWhitespace || !We.test(e)) && !$e[(Pe.exec(e) || ["", ""])[1].toLowerCase()]) {
                    e = de.htmlPrefilter(e);
                    try {
                        for (; n < r; n++) t = this[n] || {}, 1 === t.nodeType && (de.cleanData(h(t, !1)), t.innerHTML = e);
                        t = 0
                    } catch (e) {}
                }
                t && this.empty().append(e)
            }, null, e, arguments.length)
        },
        replaceWith: function () {
            var e = [];
            return S(this, arguments, function (t) {
                var n = this.parentNode;
                de.inArray(this, e) < 0 && (de.cleanData(h(this)), n && n.replaceChild(t, this))
            }, e)
        }
    }), de.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function (e, t) {
        de.fn[e] = function (e) {
            for (var n, r = 0, i = [], o = de(e), a = o.length - 1; r <= a; r++) n = r === a ? this : this.clone(!0), de(o[r])[t](n), ae.apply(i, n.get());
            return this.pushStack(i)
        }
    });
    var at, st = {
            HTML: "block",
            BODY: "block"
        },
        ut = /^margin/,
        lt = new RegExp("^(" + qe + ")(?!px)[a-z%]+$", "i"),
        ct = function (e, t, n, r) {
            var i, o, a = {};
            for (o in t) a[o] = e.style[o], e.style[o] = t[o];
            i = n.apply(e, r || []);
            for (o in t) e.style[o] = a[o];
            return i
        },
        ft = re.documentElement;
    ! function () {
        function t() {
            var t, c, f = re.documentElement;
            f.appendChild(u), l.style.cssText = "-webkit-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%", n = i = s = !1, r = a = !0, e.getComputedStyle && (c = e.getComputedStyle(l), n = "1%" !== (c || {}).top, s = "2px" === (c || {}).marginLeft, i = "4px" === (c || {
                width: "4px"
            }).width, l.style.marginRight = "50%", r = "4px" === (c || {
                marginRight: "4px"
            }).marginRight, t = l.appendChild(re.createElement("div")), t.style.cssText = l.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", t.style.marginRight = t.style.width = "0", l.style.width = "1px", a = !parseFloat((e.getComputedStyle(t) || {}).marginRight), l.removeChild(t)), l.style.display = "none", o = 0 === l.getClientRects().length, o && (l.style.display = "", l.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", l.childNodes[0].style.borderCollapse = "separate", t = l.getElementsByTagName("td"), t[0].style.cssText = "margin:0;border:0;padding:0;display:none", (o = 0 === t[0].offsetHeight) && (t[0].style.display = "", t[1].style.display = "none", o = 0 === t[0].offsetHeight)), f.removeChild(u)
        }
        var n, r, i, o, a, s, u = re.createElement("div"),
            l = re.createElement("div");
        l.style && (l.style.cssText = "float:left;opacity:.5", fe.opacity = "0.5" === l.style.opacity, fe.cssFloat = !!l.style.cssFloat, l.style.backgroundClip = "content-box", l.cloneNode(!0).style.backgroundClip = "", fe.clearCloneStyle = "content-box" === l.style.backgroundClip, u = re.createElement("div"), u.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute", l.innerHTML = "", u.appendChild(l), fe.boxSizing = "" === l.style.boxSizing || "" === l.style.MozBoxSizing || "" === l.style.WebkitBoxSizing, de.extend(fe, {
            reliableHiddenOffsets: function () {
                return null == n && t(), o
            },
            boxSizingReliable: function () {
                return null == n && t(), i
            },
            pixelMarginRight: function () {
                return null == n && t(), r
            },
            pixelPosition: function () {
                return null == n && t(), n
            },
            reliableMarginRight: function () {
                return null == n && t(), a
            },
            reliableMarginLeft: function () {
                return null == n && t(), s
            }
        }))
    }();
    var dt, pt, ht = /^(top|right|bottom|left)$/;
    e.getComputedStyle ? (dt = function (t) {
        var n = t.ownerDocument.defaultView;
        return n && n.opener || (n = e), n.getComputedStyle(t)
    }, pt = function (e, t, n) {
        var r, i, o, a, s = e.style;
        return n = n || dt(e), a = n ? n.getPropertyValue(t) || n[t] : void 0, "" !== a && void 0 !== a || de.contains(e.ownerDocument, e) || (a = de.style(e, t)), n && !fe.pixelMarginRight() && lt.test(a) && ut.test(t) && (r = s.width, i = s.minWidth, o = s.maxWidth, s.minWidth = s.maxWidth = s.width = a, a = n.width, s.width = r, s.minWidth = i, s.maxWidth = o), void 0 === a ? a : a + ""
    }) : ft.currentStyle && (dt = function (e) {
        return e.currentStyle
    }, pt = function (e, t, n) {
        var r, i, o, a, s = e.style;
        return n = n || dt(e), a = n ? n[t] : void 0, null == a && s && s[t] && (a = s[t]), lt.test(a) && !ht.test(t) && (r = s.left, i = e.runtimeStyle, o = i && i.left, o && (i.left = e.currentStyle.left), s.left = "fontSize" === t ? "1em" : a, a = s.pixelLeft + "px", s.left = r, o && (i.left = o)), void 0 === a ? a : a + "" || "auto"
    });
    var gt = /alpha\([^)]*\)/i,
        mt = /opacity\s*=\s*([^)]*)/i,
        vt = /^(none|table(?!-c[ea]).+)/,
        yt = new RegExp("^(" + qe + ")(.*)$", "i"),
        xt = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        bt = {
            letterSpacing: "0",
            fontWeight: "400"
        },
        wt = ["Webkit", "O", "Moz", "ms"],
        Tt = re.createElement("div").style;
    de.extend({
        cssHooks: {
            opacity: {
                get: function (e, t) {
                    if (t) {
                        var n = pt(e, "opacity");
                        return "" === n ? "1" : n
                    }
                }
            }
        },
        cssNumber: {
            animationIterationCount: !0,
            columnCount: !0,
            fillOpacity: !0,
            flexGrow: !0,
            flexShrink: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            float: fe.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function (e, t, n, r) {
            if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
                var i, o, a, s = de.camelCase(t),
                    u = e.style;
                if (t = de.cssProps[s] || (de.cssProps[s] = H(s) || s), a = de.cssHooks[t] || de.cssHooks[s], void 0 === n) return a && "get" in a && void 0 !== (i = a.get(e, !1, r)) ? i : u[t];
                if (o = typeof n, "string" === o && (i = _e.exec(n)) && i[1] && (n = d(e, t, i), o = "number"), null != n && n === n && ("number" === o && (n += i && i[3] || (de.cssNumber[s] ? "" : "px")), fe.clearCloneStyle || "" !== n || 0 !== t.indexOf("background") || (u[t] = "inherit"), !(a && "set" in a && void 0 === (n = a.set(e, n, r))))) try {
                    u[t] = n
                } catch (e) {}
            }
        },
        css: function (e, t, n, r) {
            var i, o, a, s = de.camelCase(t);
            return t = de.cssProps[s] || (de.cssProps[s] = H(s) || s), a = de.cssHooks[t] || de.cssHooks[s], a && "get" in a && (o = a.get(e, !0, n)), void 0 === o && (o = pt(e, t, r)), "normal" === o && t in bt && (o = bt[t]), "" === n || n ? (i = parseFloat(o), !0 === n || isFinite(i) ? i || 0 : o) : o
        }
    }), de.each(["height", "width"], function (e, t) {
        de.cssHooks[t] = {
            get: function (e, n, r) {
                if (n) return vt.test(de.css(e, "display")) && 0 === e.offsetWidth ? ct(e, xt, function () {
                    return M(e, t, r)
                }) : M(e, t, r)
            },
            set: function (e, n, r) {
                var i = r && dt(e);
                return _(e, n, r ? F(e, t, r, fe.boxSizing && "border-box" === de.css(e, "boxSizing", !1, i), i) : 0)
            }
        }
    }), fe.opacity || (de.cssHooks.opacity = {
        get: function (e, t) {
            return mt.test((t && e.currentStyle ? e.currentStyle.filter : e.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : t ? "1" : ""
        },
        set: function (e, t) {
            var n = e.style,
                r = e.currentStyle,
                i = de.isNumeric(t) ? "alpha(opacity=" + 100 * t + ")" : "",
                o = r && r.filter || n.filter || "";
            n.zoom = 1, (t >= 1 || "" === t) && "" === de.trim(o.replace(gt, "")) && n.removeAttribute && (n.removeAttribute("filter"), "" === t || r && !r.filter) || (n.filter = gt.test(o) ? o.replace(gt, i) : o + " " + i)
        }
    }), de.cssHooks.marginRight = L(fe.reliableMarginRight, function (e, t) {
        if (t) return ct(e, {
            display: "inline-block"
        }, pt, [e, "marginRight"])
    }), de.cssHooks.marginLeft = L(fe.reliableMarginLeft, function (e, t) {
        if (t) return (parseFloat(pt(e, "marginLeft")) || (de.contains(e.ownerDocument, e) ? e.getBoundingClientRect().left - ct(e, {
            marginLeft: 0
        }, function () {
            return e.getBoundingClientRect().left
        }) : 0)) + "px"
    }), de.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function (e, t) {
        de.cssHooks[e + t] = {
            expand: function (n) {
                for (var r = 0, i = {}, o = "string" == typeof n ? n.split(" ") : [n]; r < 4; r++) i[e + Fe[r] + t] = o[r] || o[r - 2] || o[0];
                return i
            }
        }, ut.test(e) || (de.cssHooks[e + t].set = _)
    }), de.fn.extend({
        css: function (e, t) {
            return Oe(this, function (e, t, n) {
                var r, i, o = {},
                    a = 0;
                if (de.isArray(t)) {
                    for (r = dt(e), i = t.length; a < i; a++) o[t[a]] = de.css(e, t[a], !1, r);
                    return o
                }
                return void 0 !== n ? de.style(e, t, n) : de.css(e, t)
            }, e, t, arguments.length > 1)
        },
        show: function () {
            return q(this, !0)
        },
        hide: function () {
            return q(this)
        },
        toggle: function (e) {
            return "boolean" == typeof e ? e ? this.show() : this.hide() : this.each(function () {
                Me(this) ? de(this).show() : de(this).hide()
            })
        }
    }), de.Tween = O, O.prototype = {
        constructor: O,
        init: function (e, t, n, r, i, o) {
            this.elem = e, this.prop = n, this.easing = i || de.easing._default, this.options = t, this.start = this.now = this.cur(), this.end = r, this.unit = o || (de.cssNumber[n] ? "" : "px")
        },
        cur: function () {
            var e = O.propHooks[this.prop];
            return e && e.get ? e.get(this) : O.propHooks._default.get(this)
        },
        run: function (e) {
            var t, n = O.propHooks[this.prop];
            return this.options.duration ? this.pos = t = de.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : this.pos = t = e, this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n && n.set ? n.set(this) : O.propHooks._default.set(this), this
        }
    }, O.prototype.init.prototype = O.prototype, O.propHooks = {
        _default: {
            get: function (e) {
                var t;
                return 1 !== e.elem.nodeType || null != e.elem[e.prop] && null == e.elem.style[e.prop] ? e.elem[e.prop] : (t = de.css(e.elem, e.prop, ""), t && "auto" !== t ? t : 0)
            },
            set: function (e) {
                de.fx.step[e.prop] ? de.fx.step[e.prop](e) : 1 !== e.elem.nodeType || null == e.elem.style[de.cssProps[e.prop]] && !de.cssHooks[e.prop] ? e.elem[e.prop] = e.now : de.style(e.elem, e.prop, e.now + e.unit)
            }
        }
    }, O.propHooks.scrollTop = O.propHooks.scrollLeft = {
        set: function (e) {
            e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
        }
    }, de.easing = {
        linear: function (e) {
            return e
        },
        swing: function (e) {
            return .5 - Math.cos(e * Math.PI) / 2
        },
        _default: "swing"
    }, de.fx = O.prototype.init, de.fx.step = {};
    var Ct, Et, Nt = /^(?:toggle|show|hide)$/,
        kt = /queueHooks$/;
    de.Animation = de.extend($, {
            tweeners: {
                "*": [function (e, t) {
                    var n = this.createTween(e, t);
                    return d(n.elem, e, _e.exec(t), n), n
                }]
            },
            tweener: function (e, t) {
                de.isFunction(e) ? (t = e, e = ["*"]) : e = e.match(Se);
                for (var n, r = 0, i = e.length; r < i; r++) n = e[r], $.tweeners[n] = $.tweeners[n] || [], $.tweeners[n].unshift(t)
            },
            prefilters: [W],
            prefilter: function (e, t) {
                t ? $.prefilters.unshift(e) : $.prefilters.push(e)
            }
        }), de.speed = function (e, t, n) {
            var r = e && "object" == typeof e ? de.extend({}, e) : {
                complete: n || !n && t || de.isFunction(e) && e,
                duration: e,
                easing: n && t || t && !de.isFunction(t) && t
            };
            return r.duration = de.fx.off ? 0 : "number" == typeof r.duration ? r.duration : r.duration in de.fx.speeds ? de.fx.speeds[r.duration] : de.fx.speeds._default, null != r.queue && !0 !== r.queue || (r.queue = "fx"), r.old = r.complete, r.complete = function () {
                de.isFunction(r.old) && r.old.call(this), r.queue && de.dequeue(this, r.queue)
            }, r
        }, de.fn.extend({
            fadeTo: function (e, t, n, r) {
                return this.filter(Me).css("opacity", 0).show().end().animate({
                    opacity: t
                }, e, n, r)
            },
            animate: function (e, t, n, r) {
                var i = de.isEmptyObject(e),
                    o = de.speed(t, n, r),
                    a = function () {
                        var t = $(this, de.extend({}, e), o);
                        (i || de._data(this, "finish")) && t.stop(!0)
                    };
                return a.finish = a, i || !1 === o.queue ? this.each(a) : this.queue(o.queue, a)
            },
            stop: function (e, t, n) {
                var r = function (e) {
                    var t = e.stop;
                    delete e.stop, t(n)
                };
                return "string" != typeof e && (n = t, t = e, e = void 0), t && !1 !== e && this.queue(e || "fx", []), this.each(function () {
                    var t = !0,
                        i = null != e && e + "queueHooks",
                        o = de.timers,
                        a = de._data(this);
                    if (i) a[i] && a[i].stop && r(a[i]);
                    else
                        for (i in a) a[i] && a[i].stop && kt.test(i) && r(a[i]);
                    for (i = o.length; i--;) o[i].elem !== this || null != e && o[i].queue !== e || (o[i].anim.stop(n), t = !1, o.splice(i, 1));
                    !t && n || de.dequeue(this, e)
                })
            },
            finish: function (e) {
                return !1 !== e && (e = e || "fx"), this.each(function () {
                    var t, n = de._data(this),
                        r = n[e + "queue"],
                        i = n[e + "queueHooks"],
                        o = de.timers,
                        a = r ? r.length : 0;
                    for (n.finish = !0, de.queue(this, e, []), i && i.stop && i.stop.call(this, !0), t = o.length; t--;) o[t].elem === this && o[t].queue === e && (o[t].anim.stop(!0), o.splice(t, 1));
                    for (t = 0; t < a; t++) r[t] && r[t].finish && r[t].finish.call(this);
                    delete n.finish
                })
            }
        }), de.each(["toggle", "show", "hide"], function (e, t) {
            var n = de.fn[t];
            de.fn[t] = function (e, r, i) {
                return null == e || "boolean" == typeof e ? n.apply(this, arguments) : this.animate(P(t, !0), e, r, i)
            }
        }), de.each({
            slideDown: P("show"),
            slideUp: P("hide"),
            slideToggle: P("toggle"),
            fadeIn: {
                opacity: "show"
            },
            fadeOut: {
                opacity: "hide"
            },
            fadeToggle: {
                opacity: "toggle"
            }
        }, function (e, t) {
            de.fn[e] = function (e, n, r) {
                return this.animate(t, e, n, r)
            }
        }), de.timers = [], de.fx.tick = function () {
            var e, t = de.timers,
                n = 0;
            for (Ct = de.now(); n < t.length; n++)(e = t[n])() || t[n] !== e || t.splice(n--, 1);
            t.length || de.fx.stop(), Ct = void 0
        }, de.fx.timer = function (e) {
            de.timers.push(e), e() ? de.fx.start() : de.timers.pop()
        }, de.fx.interval = 13, de.fx.start = function () {
            Et || (Et = e.setInterval(de.fx.tick, de.fx.interval))
        }, de.fx.stop = function () {
            e.clearInterval(Et), Et = null
        }, de.fx.speeds = {
            slow: 600,
            fast: 200,
            _default: 400
        }, de.fn.delay = function (t, n) {
            return t = de.fx ? de.fx.speeds[t] || t : t, n = n || "fx", this.queue(n, function (n, r) {
                var i = e.setTimeout(n, t);
                r.stop = function () {
                    e.clearTimeout(i)
                }
            })
        },
        function () {
            var e, t = re.createElement("input"),
                n = re.createElement("div"),
                r = re.createElement("select"),
                i = r.appendChild(re.createElement("option"));
            n = re.createElement("div"), n.setAttribute("className", "t"), n.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", e = n.getElementsByTagName("a")[0], t.setAttribute("type", "checkbox"), n.appendChild(t), e = n.getElementsByTagName("a")[0], e.style.cssText = "top:1px", fe.getSetAttribute = "t" !== n.className, fe.style = /top/.test(e.getAttribute("style")), fe.hrefNormalized = "/a" === e.getAttribute("href"), fe.checkOn = !!t.value, fe.optSelected = i.selected, fe.enctype = !!re.createElement("form").enctype, r.disabled = !0, fe.optDisabled = !i.disabled, t = re.createElement("input"), t.setAttribute("value", ""), fe.input = "" === t.getAttribute("value"), t.value = "t", t.setAttribute("type", "radio"), fe.radioValue = "t" === t.value
        }();
    var St = /\r/g,
        At = /[\x20\t\r\n\f]+/g;
    de.fn.extend({
        val: function (e) {
            var t, n, r, i = this[0]; {
                if (arguments.length) return r = de.isFunction(e), this.each(function (n) {
                    var i;
                    1 === this.nodeType && (i = r ? e.call(this, n, de(this).val()) : e, null == i ? i = "" : "number" == typeof i ? i += "" : de.isArray(i) && (i = de.map(i, function (e) {
                        return null == e ? "" : e + ""
                    })), (t = de.valHooks[this.type] || de.valHooks[this.nodeName.toLowerCase()]) && "set" in t && void 0 !== t.set(this, i, "value") || (this.value = i))
                });
                if (i) return (t = de.valHooks[i.type] || de.valHooks[i.nodeName.toLowerCase()]) && "get" in t && void 0 !== (n = t.get(i, "value")) ? n : (n = i.value, "string" == typeof n ? n.replace(St, "") : null == n ? "" : n)
            }
        }
    }), de.extend({
        valHooks: {
            option: {
                get: function (e) {
                    var t = de.find.attr(e, "value");
                    return null != t ? t : de.trim(de.text(e)).replace(At, " ")
                }
            },
            select: {
                get: function (e) {
                    for (var t, n, r = e.options, i = e.selectedIndex, o = "select-one" === e.type || i < 0, a = o ? null : [], s = o ? i + 1 : r.length, u = i < 0 ? s : o ? i : 0; u < s; u++)
                        if (n = r[u], (n.selected || u === i) && (fe.optDisabled ? !n.disabled : null === n.getAttribute("disabled")) && (!n.parentNode.disabled || !de.nodeName(n.parentNode, "optgroup"))) {
                            if (t = de(n).val(), o) return t;
                            a.push(t)
                        } return a
                },
                set: function (e, t) {
                    for (var n, r, i = e.options, o = de.makeArray(t), a = i.length; a--;)
                        if (r = i[a], de.inArray(de.valHooks.option.get(r), o) > -1) try {
                            r.selected = n = !0
                        } catch (e) {
                            r.scrollHeight
                        } else r.selected = !1;
                    return n || (e.selectedIndex = -1), i
                }
            }
        }
    }), de.each(["radio", "checkbox"], function () {
        de.valHooks[this] = {
            set: function (e, t) {
                if (de.isArray(t)) return e.checked = de.inArray(de(e).val(), t) > -1
            }
        }, fe.checkOn || (de.valHooks[this].get = function (e) {
            return null === e.getAttribute("value") ? "on" : e.value
        })
    });
    var Dt, jt, Lt = de.expr.attrHandle,
        Ht = /^(?:checked|selected)$/i,
        qt = fe.getSetAttribute,
        _t = fe.input;
    de.fn.extend({
        attr: function (e, t) {
            return Oe(this, de.attr, e, t, arguments.length > 1)
        },
        removeAttr: function (e) {
            return this.each(function () {
                de.removeAttr(this, e)
            })
        }
    }), de.extend({
        attr: function (e, t, n) {
            var r, i, o = e.nodeType;
            if (3 !== o && 8 !== o && 2 !== o) return void 0 === e.getAttribute ? de.prop(e, t, n) : (1 === o && de.isXMLDoc(e) || (t = t.toLowerCase(), i = de.attrHooks[t] || (de.expr.match.bool.test(t) ? jt : Dt)), void 0 !== n ? null === n ? void de.removeAttr(e, t) : i && "set" in i && void 0 !== (r = i.set(e, n, t)) ? r : (e.setAttribute(t, n + ""), n) : i && "get" in i && null !== (r = i.get(e, t)) ? r : (r = de.find.attr(e, t), null == r ? void 0 : r))
        },
        attrHooks: {
            type: {
                set: function (e, t) {
                    if (!fe.radioValue && "radio" === t && de.nodeName(e, "input")) {
                        var n = e.value;
                        return e.setAttribute("type", t), n && (e.value = n), t
                    }
                }
            }
        },
        removeAttr: function (e, t) {
            var n, r, i = 0,
                o = t && t.match(Se);
            if (o && 1 === e.nodeType)
                for (; n = o[i++];) r = de.propFix[n] || n, de.expr.match.bool.test(n) ? _t && qt || !Ht.test(n) ? e[r] = !1 : e[de.camelCase("default-" + n)] = e[r] = !1 : de.attr(e, n, ""), e.removeAttribute(qt ? n : r)
        }
    }), jt = {
        set: function (e, t, n) {
            return !1 === t ? de.removeAttr(e, n) : _t && qt || !Ht.test(n) ? e.setAttribute(!qt && de.propFix[n] || n, n) : e[de.camelCase("default-" + n)] = e[n] = !0, n
        }
    }, de.each(de.expr.match.bool.source.match(/\w+/g), function (e, t) {
        var n = Lt[t] || de.find.attr;
        _t && qt || !Ht.test(t) ? Lt[t] = function (e, t, r) {
            var i, o;
            return r || (o = Lt[t], Lt[t] = i, i = null != n(e, t, r) ? t.toLowerCase() : null, Lt[t] = o), i
        } : Lt[t] = function (e, t, n) {
            if (!n) return e[de.camelCase("default-" + t)] ? t.toLowerCase() : null
        }
    }), _t && qt || (de.attrHooks.value = {
        set: function (e, t, n) {
            if (!de.nodeName(e, "input")) return Dt && Dt.set(e, t, n);
            e.defaultValue = t
        }
    }), qt || (Dt = {
        set: function (e, t, n) {
            var r = e.getAttributeNode(n);
            if (r || e.setAttributeNode(r = e.ownerDocument.createAttribute(n)), r.value = t += "", "value" === n || t === e.getAttribute(n)) return t
        }
    }, Lt.id = Lt.name = Lt.coords = function (e, t, n) {
        var r;
        if (!n) return (r = e.getAttributeNode(t)) && "" !== r.value ? r.value : null
    }, de.valHooks.button = {
        get: function (e, t) {
            var n = e.getAttributeNode(t);
            if (n && n.specified) return n.value
        },
        set: Dt.set
    }, de.attrHooks.contenteditable = {
        set: function (e, t, n) {
            Dt.set(e, "" !== t && t, n)
        }
    }, de.each(["width", "height"], function (e, t) {
        de.attrHooks[t] = {
            set: function (e, n) {
                if ("" === n) return e.setAttribute(t, "auto"), n
            }
        }
    })), fe.style || (de.attrHooks.style = {
        get: function (e) {
            return e.style.cssText || void 0
        },
        set: function (e, t) {
            return e.style.cssText = t + ""
        }
    });
    var Ft = /^(?:input|select|textarea|button|object)$/i,
        Mt = /^(?:a|area)$/i;
    de.fn.extend({
        prop: function (e, t) {
            return Oe(this, de.prop, e, t, arguments.length > 1)
        },
        removeProp: function (e) {
            return e = de.propFix[e] || e, this.each(function () {
                try {
                    this[e] = void 0, delete this[e]
                } catch (e) {}
            })
        }
    }), de.extend({
        prop: function (e, t, n) {
            var r, i, o = e.nodeType;
            if (3 !== o && 8 !== o && 2 !== o) return 1 === o && de.isXMLDoc(e) || (t = de.propFix[t] || t, i = de.propHooks[t]), void 0 !== n ? i && "set" in i && void 0 !== (r = i.set(e, n, t)) ? r : e[t] = n : i && "get" in i && null !== (r = i.get(e, t)) ? r : e[t]
        },
        propHooks: {
            tabIndex: {
                get: function (e) {
                    var t = de.find.attr(e, "tabindex");
                    return t ? parseInt(t, 10) : Ft.test(e.nodeName) || Mt.test(e.nodeName) && e.href ? 0 : -1
                }
            }
        },
        propFix: {
            for: "htmlFor",
            class: "className"
        }
    }), fe.hrefNormalized || de.each(["href", "src"], function (e, t) {
        de.propHooks[t] = {
            get: function (e) {
                return e.getAttribute(t, 4)
            }
        }
    }), fe.optSelected || (de.propHooks.selected = {
        get: function (e) {
            var t = e.parentNode;
            return t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex), null
        },
        set: function (e) {
            var t = e.parentNode;
            t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex)
        }
    }), de.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
        de.propFix[this.toLowerCase()] = this
    }), fe.enctype || (de.propFix.enctype = "encoding");
    var Ot = /[\t\r\n\f]/g;
    de.fn.extend({
        addClass: function (e) {
            var t, n, r, i, o, a, s, u = 0;
            if (de.isFunction(e)) return this.each(function (t) {
                de(this).addClass(e.call(this, t, z(this)))
            });
            if ("string" == typeof e && e)
                for (t = e.match(Se) || []; n = this[u++];)
                    if (i = z(n), r = 1 === n.nodeType && (" " + i + " ").replace(Ot, " ")) {
                        for (a = 0; o = t[a++];) r.indexOf(" " + o + " ") < 0 && (r += o + " ");
                        s = de.trim(r), i !== s && de.attr(n, "class", s)
                    } return this
        },
        removeClass: function (e) {
            var t, n, r, i, o, a, s, u = 0;
            if (de.isFunction(e)) return this.each(function (t) {
                de(this).removeClass(e.call(this, t, z(this)))
            });
            if (!arguments.length) return this.attr("class", "");
            if ("string" == typeof e && e)
                for (t = e.match(Se) || []; n = this[u++];)
                    if (i = z(n), r = 1 === n.nodeType && (" " + i + " ").replace(Ot, " ")) {
                        for (a = 0; o = t[a++];)
                            for (; r.indexOf(" " + o + " ") > -1;) r = r.replace(" " + o + " ", " ");
                        s = de.trim(r), i !== s && de.attr(n, "class", s)
                    } return this
        },
        toggleClass: function (e, t) {
            var n = typeof e;
            return "boolean" == typeof t && "string" === n ? t ? this.addClass(e) : this.removeClass(e) : de.isFunction(e) ? this.each(function (n) {
                de(this).toggleClass(e.call(this, n, z(this), t), t)
            }) : this.each(function () {
                var t, r, i, o;
                if ("string" === n)
                    for (r = 0, i = de(this), o = e.match(Se) || []; t = o[r++];) i.hasClass(t) ? i.removeClass(t) : i.addClass(t);
                else void 0 !== e && "boolean" !== n || (t = z(this), t && de._data(this, "__className__", t), de.attr(this, "class", t || !1 === e ? "" : de._data(this, "__className__") || ""))
            })
        },
        hasClass: function (e) {
            var t, n, r = 0;
            for (t = " " + e + " "; n = this[r++];)
                if (1 === n.nodeType && (" " + z(n) + " ").replace(Ot, " ").indexOf(t) > -1) return !0;
            return !1
        }
    }), de.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (e, t) {
        de.fn[t] = function (e, n) {
            return arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
        }
    }), de.fn.extend({
        hover: function (e, t) {
            return this.mouseenter(e).mouseleave(t || e)
        }
    });
    var Rt = e.location,
        Pt = de.now(),
        Bt = /\?/,
        Wt = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;
    de.parseJSON = function (t) {
        if (e.JSON && e.JSON.parse) return e.JSON.parse(t + "");
        var n, r = null,
            i = de.trim(t + "");
        return i && !de.trim(i.replace(Wt, function (e, t, i, o) {
            return n && t && (r = 0), 0 === r ? e : (n = i || t, r += !o - !i, "")
        })) ? Function("return " + i)() : de.error("Invalid JSON: " + t)
    }, de.parseXML = function (t) {
        var n, r;
        if (!t || "string" != typeof t) return null;
        try {
            e.DOMParser ? (r = new e.DOMParser, n = r.parseFromString(t, "text/xml")) : (n = new e.ActiveXObject("Microsoft.XMLDOM"), n.async = "false", n.loadXML(t))
        } catch (e) {
            n = void 0
        }
        return n && n.documentElement && !n.getElementsByTagName("parsererror").length || de.error("Invalid XML: " + t), n
    };
    var It = /#.*$/,
        $t = /([?&])_=[^&]*/,
        zt = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
        Xt = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        Ut = /^(?:GET|HEAD)$/,
        Vt = /^\/\//,
        Yt = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        Jt = {},
        Gt = {},
        Qt = "*/".concat("*"),
        Kt = Rt.href,
        Zt = Yt.exec(Kt.toLowerCase()) || [];
    de.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: Kt,
            type: "GET",
            isLocal: Xt.test(Zt[1]),
            global: !0,
            processData: !0,
            async: !0,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": Qt,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /\bxml\b/,
                html: /\bhtml/,
                json: /\bjson\b/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            converters: {
                "* text": String,
                "text html": !0,
                "text json": de.parseJSON,
                "text xml": de.parseXML
            },
            flatOptions: {
                url: !0,
                context: !0
            }
        },
        ajaxSetup: function (e, t) {
            return t ? V(V(e, de.ajaxSettings), t) : V(de.ajaxSettings, e)
        },
        ajaxPrefilter: X(Jt),
        ajaxTransport: X(Gt),
        ajax: function (t, n) {
            function r(t, n, r, i) {
                var o, f, y, x, w, C = n;
                2 !== b && (b = 2, u && e.clearTimeout(u), c = void 0, s = i || "", T.readyState = t > 0 ? 4 : 0, o = t >= 200 && t < 300 || 304 === t, r && (x = Y(d, T, r)), x = J(d, x, T, o), o ? (d.ifModified && (w = T.getResponseHeader("Last-Modified"), w && (de.lastModified[a] = w), (w = T.getResponseHeader("etag")) && (de.etag[a] = w)), 204 === t || "HEAD" === d.type ? C = "nocontent" : 304 === t ? C = "notmodified" : (C = x.state, f = x.data, y = x.error, o = !y)) : (y = C, !t && C || (C = "error", t < 0 && (t = 0))), T.status = t, T.statusText = (n || C) + "", o ? g.resolveWith(p, [f, C, T]) : g.rejectWith(p, [T, C, y]), T.statusCode(v), v = void 0, l && h.trigger(o ? "ajaxSuccess" : "ajaxError", [T, d, o ? f : y]), m.fireWith(p, [T, C]), l && (h.trigger("ajaxComplete", [T, d]), --de.active || de.event.trigger("ajaxStop")))
            }
            "object" == typeof t && (n = t, t = void 0), n = n || {};
            var i, o, a, s, u, l, c, f, d = de.ajaxSetup({}, n),
                p = d.context || d,
                h = d.context && (p.nodeType || p.jquery) ? de(p) : de.event,
                g = de.Deferred(),
                m = de.Callbacks("once memory"),
                v = d.statusCode || {},
                y = {},
                x = {},
                b = 0,
                w = "canceled",
                T = {
                    readyState: 0,
                    getResponseHeader: function (e) {
                        var t;
                        if (2 === b) {
                            if (!f)
                                for (f = {}; t = zt.exec(s);) f[t[1].toLowerCase()] = t[2];
                            t = f[e.toLowerCase()]
                        }
                        return null == t ? null : t
                    },
                    getAllResponseHeaders: function () {
                        return 2 === b ? s : null
                    },
                    setRequestHeader: function (e, t) {
                        var n = e.toLowerCase();
                        return b || (e = x[n] = x[n] || e, y[e] = t), this
                    },
                    overrideMimeType: function (e) {
                        return b || (d.mimeType = e), this
                    },
                    statusCode: function (e) {
                        var t;
                        if (e)
                            if (b < 2)
                                for (t in e) v[t] = [v[t], e[t]];
                            else T.always(e[T.status]);
                        return this
                    },
                    abort: function (e) {
                        var t = e || w;
                        return c && c.abort(t), r(0, t), this
                    }
                };
            if (g.promise(T).complete = m.add, T.success = T.done, T.error = T.fail, d.url = ((t || d.url || Kt) + "").replace(It, "").replace(Vt, Zt[1] + "//"), d.type = n.method || n.type || d.method || d.type, d.dataTypes = de.trim(d.dataType || "*").toLowerCase().match(Se) || [""], null == d.crossDomain && (i = Yt.exec(d.url.toLowerCase()), d.crossDomain = !(!i || i[1] === Zt[1] && i[2] === Zt[2] && (i[3] || ("http:" === i[1] ? "80" : "443")) === (Zt[3] || ("http:" === Zt[1] ? "80" : "443")))), d.data && d.processData && "string" != typeof d.data && (d.data = de.param(d.data, d.traditional)), U(Jt, d, n, T), 2 === b) return T;
            l = de.event && d.global, l && 0 == de.active++ && de.event.trigger("ajaxStart"), d.type = d.type.toUpperCase(), d.hasContent = !Ut.test(d.type), a = d.url, d.hasContent || (d.data && (a = d.url += (Bt.test(a) ? "&" : "?") + d.data, delete d.data), !1 === d.cache && (d.url = $t.test(a) ? a.replace($t, "$1_=" + Pt++) : a + (Bt.test(a) ? "&" : "?") + "_=" + Pt++)), d.ifModified && (de.lastModified[a] && T.setRequestHeader("If-Modified-Since", de.lastModified[a]), de.etag[a] && T.setRequestHeader("If-None-Match", de.etag[a])), (d.data && d.hasContent && !1 !== d.contentType || n.contentType) && T.setRequestHeader("Content-Type", d.contentType), T.setRequestHeader("Accept", d.dataTypes[0] && d.accepts[d.dataTypes[0]] ? d.accepts[d.dataTypes[0]] + ("*" !== d.dataTypes[0] ? ", " + Qt + "; q=0.01" : "") : d.accepts["*"]);
            for (o in d.headers) T.setRequestHeader(o, d.headers[o]);
            if (d.beforeSend && (!1 === d.beforeSend.call(p, T, d) || 2 === b)) return T.abort();
            w = "abort";
            for (o in {
                    success: 1,
                    error: 1,
                    complete: 1
                }) T[o](d[o]);
            if (c = U(Gt, d, n, T)) {
                if (T.readyState = 1, l && h.trigger("ajaxSend", [T, d]), 2 === b) return T;
                d.async && d.timeout > 0 && (u = e.setTimeout(function () {
                    T.abort("timeout")
                }, d.timeout));
                try {
                    b = 1, c.send(y, r)
                } catch (e) {
                    if (!(b < 2)) throw e;
                    r(-1, e)
                }
            } else r(-1, "No Transport");
            return T
        },
        getJSON: function (e, t, n) {
            return de.get(e, t, n, "json")
        },
        getScript: function (e, t) {
            return de.get(e, void 0, t, "script")
        }
    }), de.each(["get", "post"], function (e, t) {
        de[t] = function (e, n, r, i) {
            return de.isFunction(n) && (i = i || r, r = n, n = void 0), de.ajax(de.extend({
                url: e,
                type: t,
                dataType: i,
                data: n,
                success: r
            }, de.isPlainObject(e) && e))
        }
    }), de._evalUrl = function (e) {
        return de.ajax({
            url: e,
            type: "GET",
            dataType: "script",
            cache: !0,
            async: !1,
            global: !1,
            throws: !0
        })
    }, de.fn.extend({
        wrapAll: function (e) {
            if (de.isFunction(e)) return this.each(function (t) {
                de(this).wrapAll(e.call(this, t))
            });
            if (this[0]) {
                var t = de(e, this[0].ownerDocument).eq(0).clone(!0);
                this[0].parentNode && t.insertBefore(this[0]), t.map(function () {
                    for (var e = this; e.firstChild && 1 === e.firstChild.nodeType;) e = e.firstChild;
                    return e
                }).append(this)
            }
            return this
        },
        wrapInner: function (e) {
            return de.isFunction(e) ? this.each(function (t) {
                de(this).wrapInner(e.call(this, t))
            }) : this.each(function () {
                var t = de(this),
                    n = t.contents();
                n.length ? n.wrapAll(e) : t.append(e)
            })
        },
        wrap: function (e) {
            var t = de.isFunction(e);
            return this.each(function (n) {
                de(this).wrapAll(t ? e.call(this, n) : e)
            })
        },
        unwrap: function () {
            return this.parent().each(function () {
                de.nodeName(this, "body") || de(this).replaceWith(this.childNodes)
            }).end()
        }
    }), de.expr.filters.hidden = function (e) {
        return fe.reliableHiddenOffsets() ? e.offsetWidth <= 0 && e.offsetHeight <= 0 && !e.getClientRects().length : Q(e)
    }, de.expr.filters.visible = function (e) {
        return !de.expr.filters.hidden(e)
    };
    var en = /%20/g,
        tn = /\[\]$/,
        nn = /\r?\n/g,
        rn = /^(?:submit|button|image|reset|file)$/i,
        on = /^(?:input|select|textarea|keygen)/i;
    de.param = function (e, t) {
        var n, r = [],
            i = function (e, t) {
                t = de.isFunction(t) ? t() : null == t ? "" : t, r[r.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
            };
        if (void 0 === t && (t = de.ajaxSettings && de.ajaxSettings.traditional), de.isArray(e) || e.jquery && !de.isPlainObject(e)) de.each(e, function () {
            i(this.name, this.value)
        });
        else
            for (n in e) K(n, e[n], t, i);
        return r.join("&").replace(en, "+")
    }, de.fn.extend({
        serialize: function () {
            return de.param(this.serializeArray())
        },
        serializeArray: function () {
            return this.map(function () {
                var e = de.prop(this, "elements");
                return e ? de.makeArray(e) : this
            }).filter(function () {
                var e = this.type;
                return this.name && !de(this).is(":disabled") && on.test(this.nodeName) && !rn.test(e) && (this.checked || !Re.test(e))
            }).map(function (e, t) {
                var n = de(this).val();
                return null == n ? null : de.isArray(n) ? de.map(n, function (e) {
                    return {
                        name: t.name,
                        value: e.replace(nn, "\r\n")
                    }
                }) : {
                    name: t.name,
                    value: n.replace(nn, "\r\n")
                }
            }).get()
        }
    }), de.ajaxSettings.xhr = void 0 !== e.ActiveXObject ? function () {
        return this.isLocal ? ee() : re.documentMode > 8 ? Z() : /^(get|post|head|put|delete|options)$/i.test(this.type) && Z() || ee()
    } : Z;
    var an = 0,
        sn = {},
        un = de.ajaxSettings.xhr();
    e.attachEvent && e.attachEvent("onunload", function () {
        for (var e in sn) sn[e](void 0, !0)
    }), fe.cors = !!un && "withCredentials" in un, un = fe.ajax = !!un, un && de.ajaxTransport(function (t) {
        if (!t.crossDomain || fe.cors) {
            var n;
            return {
                send: function (r, i) {
                    var o, a = t.xhr(),
                        s = ++an;
                    if (a.open(t.type, t.url, t.async, t.username, t.password), t.xhrFields)
                        for (o in t.xhrFields) a[o] = t.xhrFields[o];
                    t.mimeType && a.overrideMimeType && a.overrideMimeType(t.mimeType), t.crossDomain || r["X-Requested-With"] || (r["X-Requested-With"] = "XMLHttpRequest");
                    for (o in r) void 0 !== r[o] && a.setRequestHeader(o, r[o] + "");
                    a.send(t.hasContent && t.data || null), n = function (e, r) {
                        var o, u, l;
                        if (n && (r || 4 === a.readyState))
                            if (delete sn[s], n = void 0, a.onreadystatechange = de.noop, r) 4 !== a.readyState && a.abort();
                            else {
                                l = {}, o = a.status, "string" == typeof a.responseText && (l.text = a.responseText);
                                try {
                                    u = a.statusText
                                } catch (e) {
                                    u = ""
                                }
                                o || !t.isLocal || t.crossDomain ? 1223 === o && (o = 204) : o = l.text ? 200 : 404
                            } l && i(o, u, l, a.getAllResponseHeaders())
                    }, t.async ? 4 === a.readyState ? e.setTimeout(n) : a.onreadystatechange = sn[s] = n : n()
                },
                abort: function () {
                    n && n(void 0, !0)
                }
            }
        }
    }), de.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /\b(?:java|ecma)script\b/
        },
        converters: {
            "text script": function (e) {
                return de.globalEval(e), e
            }
        }
    }), de.ajaxPrefilter("script", function (e) {
        void 0 === e.cache && (e.cache = !1), e.crossDomain && (e.type = "GET", e.global = !1)
    }), de.ajaxTransport("script", function (e) {
        if (e.crossDomain) {
            var t, n = re.head || de("head")[0] || re.documentElement;
            return {
                send: function (r, i) {
                    t = re.createElement("script"), t.async = !0, e.scriptCharset && (t.charset = e.scriptCharset), t.src = e.url, t.onload = t.onreadystatechange = function (e, n) {
                        (n || !t.readyState || /loaded|complete/.test(t.readyState)) && (t.onload = t.onreadystatechange = null, t.parentNode && t.parentNode.removeChild(t), t = null, n || i(200, "success"))
                    }, n.insertBefore(t, n.firstChild)
                },
                abort: function () {
                    t && t.onload(void 0, !0)
                }
            }
        }
    });
    var ln = [],
        cn = /(=)\?(?=&|$)|\?\?/;
    de.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function () {
            var e = ln.pop() || de.expando + "_" + Pt++;
            return this[e] = !0, e
        }
    }), de.ajaxPrefilter("json jsonp", function (t, n, r) {
        var i, o, a, s = !1 !== t.jsonp && (cn.test(t.url) ? "url" : "string" == typeof t.data && 0 === (t.contentType || "").indexOf("application/x-www-form-urlencoded") && cn.test(t.data) && "data");
        if (s || "jsonp" === t.dataTypes[0]) return i = t.jsonpCallback = de.isFunction(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback, s ? t[s] = t[s].replace(cn, "$1" + i) : !1 !== t.jsonp && (t.url += (Bt.test(t.url) ? "&" : "?") + t.jsonp + "=" + i), t.converters["script json"] = function () {
            return a || de.error(i + " was not called"), a[0]
        }, t.dataTypes[0] = "json", o = e[i], e[i] = function () {
            a = arguments
        }, r.always(function () {
            void 0 === o ? de(e).removeProp(i) : e[i] = o, t[i] && (t.jsonpCallback = n.jsonpCallback, ln.push(i)), a && de.isFunction(o) && o(a[0]), a = o = void 0
        }), "script"
    }), de.parseHTML = function (e, t, n) {
        if (!e || "string" != typeof e) return null;
        "boolean" == typeof t && (n = t, t = !1), t = t || re;
        var r = we.exec(e),
            i = !n && [];
        return r ? [t.createElement(r[1])] : (r = v([e], t, i), i && i.length && de(i).remove(), de.merge([], r.childNodes))
    };
    var fn = de.fn.load;
    de.fn.load = function (e, t, n) {
        if ("string" != typeof e && fn) return fn.apply(this, arguments);
        var r, i, o, a = this,
            s = e.indexOf(" ");
        return s > -1 && (r = de.trim(e.slice(s, e.length)), e = e.slice(0, s)), de.isFunction(t) ? (n = t, t = void 0) : t && "object" == typeof t && (i = "POST"), a.length > 0 && de.ajax({
            url: e,
            type: i || "GET",
            dataType: "html",
            data: t
        }).done(function (e) {
            o = arguments, a.html(r ? de("<div>").append(de.parseHTML(e)).find(r) : e)
        }).always(n && function (e, t) {
            a.each(function () {
                n.apply(this, o || [e.responseText, t, e])
            })
        }), this
    }, de.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (e, t) {
        de.fn[t] = function (e) {
            return this.on(t, e)
        }
    }), de.expr.filters.animated = function (e) {
        return de.grep(de.timers, function (t) {
            return e === t.elem
        }).length
    }, de.offset = {
        setOffset: function (e, t, n) {
            var r, i, o, a, s, u, l, c = de.css(e, "position"),
                f = de(e),
                d = {};
            "static" === c && (e.style.position = "relative"), s = f.offset(), o = de.css(e, "top"), u = de.css(e, "left"), l = ("absolute" === c || "fixed" === c) && de.inArray("auto", [o, u]) > -1, l ? (r = f.position(), a = r.top, i = r.left) : (a = parseFloat(o) || 0, i = parseFloat(u) || 0), de.isFunction(t) && (t = t.call(e, n, de.extend({}, s))), null != t.top && (d.top = t.top - s.top + a), null != t.left && (d.left = t.left - s.left + i), "using" in t ? t.using.call(e, d) : f.css(d)
        }
    }, de.fn.extend({
        offset: function (e) {
            if (arguments.length) return void 0 === e ? this : this.each(function (t) {
                de.offset.setOffset(this, e, t)
            });
            var t, n, r = {
                    top: 0,
                    left: 0
                },
                i = this[0],
                o = i && i.ownerDocument;
            if (o) return t = o.documentElement, de.contains(t, i) ? (void 0 !== i.getBoundingClientRect && (r = i.getBoundingClientRect()), n = te(o), {
                top: r.top + (n.pageYOffset || t.scrollTop) - (t.clientTop || 0),
                left: r.left + (n.pageXOffset || t.scrollLeft) - (t.clientLeft || 0)
            }) : r
        },
        position: function () {
            if (this[0]) {
                var e, t, n = {
                        top: 0,
                        left: 0
                    },
                    r = this[0];
                return "fixed" === de.css(r, "position") ? t = r.getBoundingClientRect() : (e = this.offsetParent(), t = this.offset(), de.nodeName(e[0], "html") || (n = e.offset()), n.top += de.css(e[0], "borderTopWidth", !0), n.left += de.css(e[0], "borderLeftWidth", !0)), {
                    top: t.top - n.top - de.css(r, "marginTop", !0),
                    left: t.left - n.left - de.css(r, "marginLeft", !0)
                }
            }
        },
        offsetParent: function () {
            return this.map(function () {
                for (var e = this.offsetParent; e && !de.nodeName(e, "html") && "static" === de.css(e, "position");) e = e.offsetParent;
                return e || ft
            })
        }
    }), de.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function (e, t) {
        var n = /Y/.test(t);
        de.fn[e] = function (r) {
            return Oe(this, function (e, r, i) {
                var o = te(e);
                if (void 0 === i) return o ? t in o ? o[t] : o.document.documentElement[r] : e[r];
                o ? o.scrollTo(n ? de(o).scrollLeft() : i, n ? i : de(o).scrollTop()) : e[r] = i
            }, e, r, arguments.length, null)
        }
    }), de.each(["top", "left"], function (e, t) {
        de.cssHooks[t] = L(fe.pixelPosition, function (e, n) {
            if (n) return n = pt(e, t), lt.test(n) ? de(e).position()[t] + "px" : n
        })
    }), de.each({
        Height: "height",
        Width: "width"
    }, function (e, t) {
        de.each({
            padding: "inner" + e,
            content: t,
            "": "outer" + e
        }, function (n, r) {
            de.fn[r] = function (r, i) {
                var o = arguments.length && (n || "boolean" != typeof r),
                    a = n || (!0 === r || !0 === i ? "margin" : "border");
                return Oe(this, function (t, n, r) {
                    var i;
                    return de.isWindow(t) ? t.document.documentElement["client" + e] : 9 === t.nodeType ? (i = t.documentElement, Math.max(t.body["scroll" + e], i["scroll" + e], t.body["offset" + e], i["offset" + e], i["client" + e])) : void 0 === r ? de.css(t, n, a) : de.style(t, n, r, a)
                }, t, o ? r : void 0, o, null)
            }
        })
    }), de.fn.extend({
        bind: function (e, t, n) {
            return this.on(e, null, t, n)
        },
        unbind: function (e, t) {
            return this.off(e, null, t)
        },
        delegate: function (e, t, n, r) {
            return this.on(t, e, n, r)
        },
        undelegate: function (e, t, n) {
            return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", n)
        }
    }), de.fn.size = function () {
        return this.length
    }, de.fn.andSelf = de.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function () {
        return de
    });
    var dn = e.jQuery,
        pn = e.$;
    return de.noConflict = function (t) {
        return e.$ === de && (e.$ = pn), t && e.jQuery === de && (e.jQuery = dn), de
    }, t || (e.jQuery = e.$ = de), de
});

function _toConsumableArray(t) {
    if (Array.isArray(t)) {
        for (var e = 0, i = Array(t.length); e < t.length; e++) i[e] = t[e];
        return i
    }
    return Array.from(t)
}
var _slice = Array.prototype.slice,
    _slicedToArray = function () {
        function t(t, e) {
            var i = [],
                r = !0,
                n = !1,
                s = void 0;
            try {
                for (var a, o = t[Symbol.iterator](); !(r = (a = o.next()).done) && (i.push(a.value), !e || i.length !== e); r = !0);
            } catch (t) {
                n = !0, s = t
            } finally {
                try {
                    !r && o.return && o.return()
                } finally {
                    if (n) throw s
                }
            }
            return i
        }
        return function (e, i) {
            if (Array.isArray(e)) return e;
            if (Symbol.iterator in Object(e)) return t(e, i);
            throw new TypeError("Invalid attempt to destructure non-iterable instance")
        }
    }(),
    _extends = Object.assign || function (t) {
        for (var e = 1; e < arguments.length; e++) {
            var i = arguments[e];
            for (var r in i) Object.prototype.hasOwnProperty.call(i, r) && (t[r] = i[r])
        }
        return t
    };
! function (t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e(require("jquery")) : "function" == typeof define && define.amd ? define(["jquery"], e) : t.parsley = e(t.jQuery)
}(this, function (t) {
    "use strict";

    function e(t, e) {
        return t.parsleyAdaptedCallback || (t.parsleyAdaptedCallback = function () {
            var i = Array.prototype.slice.call(arguments, 0);
            i.unshift(this), t.apply(e || M, i)
        }), t.parsleyAdaptedCallback
    }

    function i(t) {
        return 0 === t.lastIndexOf(D, 0) ? t.substr(D.length) : t
    }

    function r() {
        var e = this,
            i = window || global;
        _extends(this, {
            isNativeEvent: function (t) {
                return t.originalEvent && !1 !== t.originalEvent.isTrusted
            },
            fakeInputEvent: function (i) {
                e.isNativeEvent(i) && t(i.target).trigger("input")
            },
            misbehaves: function (i) {
                e.isNativeEvent(i) && (e.behavesOk(i), t(document).on("change.inputevent", i.data.selector, e.fakeInputEvent), e.fakeInputEvent(i))
            },
            behavesOk: function (i) {
                e.isNativeEvent(i) && t(document).off("input.inputevent", i.data.selector, e.behavesOk).off("change.inputevent", i.data.selector, e.misbehaves)
            },
            install: function () {
                if (!i.inputEventPatched) {
                    i.inputEventPatched = "0.0.3";
                    for (var r = ["select", 'input[type="checkbox"]', 'input[type="radio"]', 'input[type="file"]'], n = 0; n < r.length; n++) {
                        var s = r[n];
                        t(document).on("input.inputevent", s, {
                            selector: s
                        }, e.behavesOk).on("change.inputevent", s, {
                            selector: s
                        }, e.misbehaves)
                    }
                }
            },
            uninstall: function () {
                delete i.inputEventPatched, t(document).off(".inputevent")
            }
        })
    }
    var n = 1,
        s = {},
        a = {
            attr: function (t, e, i) {
                var r, n, s, a = new RegExp("^" + e, "i");
                if (void 0 === i) i = {};
                else
                    for (r in i) i.hasOwnProperty(r) && delete i[r];
                if (!t) return i;
                for (s = t.attributes, r = s.length; r--;)(n = s[r]) && n.specified && a.test(n.name) && (i[this.camelize(n.name.slice(e.length))] = this.deserializeValue(n.value));
                return i
            },
            checkAttr: function (t, e, i) {
                return t.hasAttribute(e + i)
            },
            setAttr: function (t, e, i, r) {
                t.setAttribute(this.dasherize(e + i), String(r))
            },
            getType: function (t) {
                return t.getAttribute("type") || "text"
            },
            generateID: function () {
                return "" + n++
            },
            deserializeValue: function (t) {
                var e;
                try {
                    return t ? "true" == t || "false" != t && ("null" == t ? null : isNaN(e = Number(t)) ? /^[\[\{]/.test(t) ? JSON.parse(t) : t : e) : t
                } catch (e) {
                    return t
                }
            },
            camelize: function (t) {
                return t.replace(/-+(.)?/g, function (t, e) {
                    return e ? e.toUpperCase() : ""
                })
            },
            dasherize: function (t) {
                return t.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase()
            },
            warn: function () {
                var t;
                window.console && "function" == typeof window.console.warn && (t = window.console).warn.apply(t, arguments)
            },
            warnOnce: function (t) {
                s[t] || (s[t] = !0, this.warn.apply(this, arguments))
            },
            _resetWarnings: function () {
                s = {}
            },
            trimString: function (t) {
                return t.replace(/^\s+|\s+$/g, "")
            },
            parse: {
                date: function (t) {
                    var e = t.match(/^(\d{4,})-(\d\d)-(\d\d)$/);
                    if (!e) return null;
                    var i = e.map(function (t) {
                            return parseInt(t, 10)
                        }),
                        r = _slicedToArray(i, 4),
                        n = (r[0], r[1]),
                        s = r[2],
                        a = r[3],
                        o = new Date(n, s - 1, a);
                    return o.getFullYear() !== n || o.getMonth() + 1 !== s || o.getDate() !== a ? null : o
                },
                string: function (t) {
                    return t
                },
                integer: function (t) {
                    return isNaN(t) ? null : parseInt(t, 10)
                },
                number: function (t) {
                    if (isNaN(t)) throw null;
                    return parseFloat(t)
                },
                boolean: function (t) {
                    return !/^\s*false\s*$/i.test(t)
                },
                object: function (t) {
                    return a.deserializeValue(t)
                },
                regexp: function (t) {
                    var e = "";
                    return /^\/.*\/(?:[gimy]*)$/.test(t) ? (e = t.replace(/.*\/([gimy]*)$/, "$1"), t = t.replace(new RegExp("^/(.*?)/" + e + "$"), "$1")) : t = "^" + t + "$", new RegExp(t, e)
                }
            },
            parseRequirement: function (t, e) {
                var i = this.parse[t || "string"];
                if (!i) throw 'Unknown requirement specification: "' + t + '"';
                var r = i(e);
                if (null === r) throw "Requirement is not a " + t + ': "' + e + '"';
                return r
            },
            namespaceEvents: function (e, i) {
                return e = this.trimString(e || "").split(/\s+/), e[0] ? t.map(e, function (t) {
                    return t + "." + i
                }).join(" ") : ""
            },
            difference: function (e, i) {
                var r = [];
                return t.each(e, function (t, e) {
                    -1 == i.indexOf(e) && r.push(e)
                }), r
            },
            all: function (e) {
                return t.when.apply(t, _toConsumableArray(e).concat([42, 42]))
            },
            objectCreate: Object.create || function () {
                var t = function () {};
                return function (e) {
                    if (arguments.length > 1) throw Error("Second argument not supported");
                    if ("object" != typeof e) throw TypeError("Argument must be an object");
                    t.prototype = e;
                    var i = new t;
                    return t.prototype = null, i
                }
            }(),
            _SubmitSelector: 'input[type="submit"], button:submit'
        },
        o = {
            namespace: "data-parsley-",
            inputs: "input, textarea, select",
            excluded: "input[type=button], input[type=submit], input[type=reset], input[type=hidden]",
            priorityEnabled: !0,
            multiple: null,
            group: null,
            uiEnabled: !0,
            validationThreshold: 3,
            focus: "first",
            trigger: !1,
            triggerAfterFailure: "input",
            errorClass: "parsley-error",
            successClass: "parsley-success",
            classHandler: function (t) {},
            errorsContainer: function (t) {},
            errorsWrapper: '<ul class="parsley-errors-list"></ul>',
            errorTemplate: "<li></li>"
        },
        l = function () {
            this.__id__ = a.generateID()
        };
    l.prototype = {
        asyncSupport: !0,
        _pipeAccordingToValidationResult: function () {
            var e = this,
                i = function () {
                    var i = t.Deferred();
                    return !0 !== e.validationResult && i.reject(), i.resolve().promise()
                };
            return [i, i]
        },
        actualizeOptions: function () {
            return a.attr(this.element, this.options.namespace, this.domOptions), this.parent && this.parent.actualizeOptions && this.parent.actualizeOptions(), this
        },
        _resetOptions: function (t) {
            this.domOptions = a.objectCreate(this.parent.options), this.options = a.objectCreate(this.domOptions);
            for (var e in t) t.hasOwnProperty(e) && (this.options[e] = t[e]);
            this.actualizeOptions()
        },
        _listeners: null,
        on: function (t, e) {
            return this._listeners = this._listeners || {}, (this._listeners[t] = this._listeners[t] || []).push(e), this
        },
        subscribe: function (e, i) {
            t.listenTo(this, e.toLowerCase(), i)
        },
        off: function (t, e) {
            var i = this._listeners && this._listeners[t];
            if (i)
                if (e)
                    for (var r = i.length; r--;) i[r] === e && i.splice(r, 1);
                else delete this._listeners[t];
            return this
        },
        unsubscribe: function (e, i) {
            t.unsubscribeTo(this, e.toLowerCase())
        },
        trigger: function (t, e, i) {
            e = e || this;
            var r, n = this._listeners && this._listeners[t];
            if (n)
                for (var s = n.length; s--;)
                    if (!1 === (r = n[s].call(e, e, i))) return r;
            return !this.parent || this.parent.trigger(t, e, i)
        },
        asyncIsValid: function (t, e) {
            return a.warnOnce("asyncIsValid is deprecated; please use whenValid instead"), this.whenValid({
                group: t,
                force: e
            })
        },
        _findRelated: function () {
            return this.options.multiple ? t(this.parent.element.querySelectorAll("[" + this.options.namespace + 'multiple="' + this.options.multiple + '"]')) : this.$element
        }
    };
    var u = function (t, e) {
            var i = t.match(/^\s*\[(.*)\]\s*$/);
            if (!i) throw 'Requirement is not an array: "' + t + '"';
            var r = i[1].split(",").map(a.trimString);
            if (r.length !== e) throw "Requirement has " + r.length + " values when " + e + " are needed";
            return r
        },
        d = function (t, e, i) {
            var r = null,
                n = {};
            for (var s in t)
                if (s) {
                    var o = i(s);
                    "string" == typeof o && (o = a.parseRequirement(t[s], o)), n[s] = o
                } else r = a.parseRequirement(t[s], e);
            return [r, n]
        },
        h = function (e) {
            t.extend(!0, this, e)
        };
    h.prototype = {
        validate: function (t, e) {
            if (this.fn) return arguments.length > 3 && (e = [].slice.call(arguments, 1, -1)), this.fn(t, e);
            if (Array.isArray(t)) {
                if (!this.validateMultiple) throw "Validator `" + this.name + "` does not handle multiple values";
                return this.validateMultiple.apply(this, arguments)
            }
            var i = arguments[arguments.length - 1];
            if (this.validateDate && i._isDateInput()) return arguments[0] = a.parse.date(arguments[0]), null !== arguments[0] && this.validateDate.apply(this, arguments);
            if (this.validateNumber) return !isNaN(t) && (arguments[0] = parseFloat(arguments[0]), this.validateNumber.apply(this, arguments));
            if (this.validateString) return this.validateString.apply(this, arguments);
            throw "Validator `" + this.name + "` only handles multiple values"
        },
        parseRequirements: function (e, i) {
            if ("string" != typeof e) return Array.isArray(e) ? e : [e];
            var r = this.requirementType;
            if (Array.isArray(r)) {
                for (var n = u(e, r.length), s = 0; s < n.length; s++) n[s] = a.parseRequirement(r[s], n[s]);
                return n
            }
            return t.isPlainObject(r) ? d(r, e, i) : [a.parseRequirement(r, e)]
        },
        requirementType: "string",
        priority: 2
    };
    var p = function (t, e) {
            this.__class__ = "ValidatorRegistry", this.locale = "en", this.init(t || {}, e || {})
        },
        c = {
            email: /^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/,
            number: /^-?(\d*\.)?\d+(e[-+]?\d+)?$/i,
            integer: /^-?\d+$/,
            digits: /^\d+$/,
            alphanum: /^\w+$/i,
            date: {
                test: function (t) {
                    return null !== a.parse.date(t)
                }
            },
            url: new RegExp("^(?:(?:https?|ftp)://)?(?:\\S+(?::\\S*)?@)?(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-zA-Z\\u00a1-\\uffff0-9]-*)*[a-zA-Z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-zA-Z\\u00a1-\\uffff0-9]-*)*[a-zA-Z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-zA-Z\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:/\\S*)?$")
        };
    c.range = c.number;
    var f = function (t) {
            var e = ("" + t).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
            return e ? Math.max(0, (e[1] ? e[1].length : 0) - (e[2] ? +e[2] : 0)) : 0
        },
        m = function (t, e) {
            return e.map(a.parse[t])
        },
        g = function (t, e) {
            return function (i) {
                for (var r = arguments.length, n = Array(r > 1 ? r - 1 : 0), s = 1; s < r; s++) n[s - 1] = arguments[s];
                return n.pop(), e.apply(void 0, [i].concat(_toConsumableArray(m(t, n))))
            }
        },
        v = function (t) {
            return {
                validateDate: g("date", t),
                validateNumber: g("number", t),
                requirementType: t.length <= 2 ? "string" : ["string", "string"],
                priority: 30
            }
        };
    p.prototype = {
        init: function (t, e) {
            this.catalog = e, this.validators = _extends({}, this.validators);
            for (var i in t) this.addValidator(i, t[i].fn, t[i].priority);
            window.Parsley.trigger("parsley:validator:init")
        },
        setLocale: function (t) {
            if (void 0 === this.catalog[t]) throw new Error(t + " is not available in the catalog");
            return this.locale = t, this
        },
        addCatalog: function (t, e, i) {
            return "object" == typeof e && (this.catalog[t] = e), !0 === i ? this.setLocale(t) : this
        },
        addMessage: function (t, e, i) {
            return void 0 === this.catalog[t] && (this.catalog[t] = {}), this.catalog[t][e] = i, this
        },
        addMessages: function (t, e) {
            for (var i in e) this.addMessage(t, i, e[i]);
            return this
        },
        addValidator: function (t, e, i) {
            if (this.validators[t]) a.warn('Validator "' + t + '" is already defined.');
            else if (o.hasOwnProperty(t)) return void a.warn('"' + t + '" is a restricted keyword and is not a valid validator name.');
            return this._setValidator.apply(this, arguments)
        },
        hasValidator: function (t) {
            return !!this.validators[t]
        },
        updateValidator: function (t, e, i) {
            return this.validators[t] ? this._setValidator.apply(this, arguments) : (a.warn('Validator "' + t + '" is not already defined.'), this.addValidator.apply(this, arguments))
        },
        removeValidator: function (t) {
            return this.validators[t] || a.warn('Validator "' + t + '" is not defined.'), delete this.validators[t], this
        },
        _setValidator: function (t, e, i) {
            "object" != typeof e && (e = {
                fn: e,
                priority: i
            }), e.validate || (e = new h(e)), this.validators[t] = e;
            for (var r in e.messages || {}) this.addMessage(r, t, e.messages[r]);
            return this
        },
        getErrorMessage: function (t) {
            var e;
            if ("type" === t.name) {
                e = (this.catalog[this.locale][t.name] || {})[t.requirements]
            } else e = this.formatMessage(this.catalog[this.locale][t.name], t.requirements);
            return e || this.catalog[this.locale].defaultMessage || this.catalog.en.defaultMessage
        },
        formatMessage: function (t, e) {
            if ("object" == typeof e) {
                for (var i in e) t = this.formatMessage(t, e[i]);
                return t
            }
            return "string" == typeof t ? t.replace(/%s/i, e) : ""
        },
        validators: {
            notblank: {
                validateString: function (t) {
                    return /\S/.test(t)
                },
                priority: 2
            },
            required: {
                validateMultiple: function (t) {
                    return t.length > 0
                },
                validateString: function (t) {
                    return /\S/.test(t)
                },
                priority: 512
            },
            type: {
                validateString: function (t, e) {
                    var i = arguments.length <= 2 || void 0 === arguments[2] ? {} : arguments[2],
                        r = i.step,
                        n = void 0 === r ? "any" : r,
                        s = i.base,
                        a = void 0 === s ? 0 : s,
                        o = c[e];
                    if (!o) throw new Error("validator type `" + e + "` is not supported");
                    if (!o.test(t)) return !1;
                    if ("number" === e && !/^any$/i.test(n || "")) {
                        var l = Number(t),
                            u = Math.max(f(n), f(a));
                        if (f(l) > u) return !1;
                        var d = function (t) {
                            return Math.round(t * Math.pow(10, u))
                        };
                        if ((d(l) - d(a)) % d(n) != 0) return !1
                    }
                    return !0
                },
                requirementType: {
                    "": "string",
                    step: "string",
                    base: "number"
                },
                priority: 256
            },
            pattern: {
                validateString: function (t, e) {
                    return e.test(t)
                },
                requirementType: "regexp",
                priority: 64
            },
            minlength: {
                validateString: function (t, e) {
                    return t.length >= e
                },
                requirementType: "integer",
                priority: 30
            },
            maxlength: {
                validateString: function (t, e) {
                    return t.length <= e
                },
                requirementType: "integer",
                priority: 30
            },
            length: {
                validateString: function (t, e, i) {
                    return t.length >= e && t.length <= i
                },
                requirementType: ["integer", "integer"],
                priority: 30
            },
            mincheck: {
                validateMultiple: function (t, e) {
                    return t.length >= e
                },
                requirementType: "integer",
                priority: 30
            },
            maxcheck: {
                validateMultiple: function (t, e) {
                    return t.length <= e
                },
                requirementType: "integer",
                priority: 30
            },
            check: {
                validateMultiple: function (t, e, i) {
                    return t.length >= e && t.length <= i
                },
                requirementType: ["integer", "integer"],
                priority: 30
            },
            min: v(function (t, e) {
                return t >= e
            }),
            max: v(function (t, e) {
                return t <= e
            }),
            range: v(function (t, e, i) {
                return t >= e && t <= i
            }),
            equalto: {
                validateString: function (e, i) {
                    var r = t(i);
                    return r.length ? e === r.val() : e === i
                },
                priority: 256
            }
        }
    };
    var y = {},
        _ = function t(e, i, r) {
            for (var n = [], s = [], a = 0; a < e.length; a++) {
                for (var o = !1, l = 0; l < i.length; l++)
                    if (e[a].assert.name === i[l].assert.name) {
                        o = !0;
                        break
                    } o ? s.push(e[a]) : n.push(e[a])
            }
            return {
                kept: s,
                added: n,
                removed: r ? [] : t(i, e, !0).added
            }
        };
    y.Form = {
        _actualizeTriggers: function () {
            var t = this;
            this.$element.on("submit.Parsley", function (e) {
                t.onSubmitValidate(e)
            }), this.$element.on("click.Parsley", a._SubmitSelector, function (e) {
                t.onSubmitButton(e)
            }), !1 !== this.options.uiEnabled && this.element.setAttribute("novalidate", "")
        },
        focus: function () {
            if (this._focusedField = null, !0 === this.validationResult || "none" === this.options.focus) return null;
            for (var t = 0; t < this.fields.length; t++) {
                var e = this.fields[t];
                if (!0 !== e.validationResult && e.validationResult.length > 0 && void 0 === e.options.noFocus && (this._focusedField = e.$element, "first" === this.options.focus)) break
            }
            return null === this._focusedField ? null : this._focusedField.focus()
        },
        _destroyUI: function () {
            this.$element.off(".Parsley")
        }
    }, y.Field = {
        _reflowUI: function () {
            if (this._buildUI(), this._ui) {
                var t = _(this.validationResult, this._ui.lastValidationResult);
                this._ui.lastValidationResult = this.validationResult, this._manageStatusClass(), this._manageErrorsMessages(t), this._actualizeTriggers(), !t.kept.length && !t.added.length || this._failedOnce || (this._failedOnce = !0, this._actualizeTriggers())
            }
        },
        getErrorsMessages: function () {
            if (!0 === this.validationResult) return [];
            for (var t = [], e = 0; e < this.validationResult.length; e++) t.push(this.validationResult[e].errorMessage || this._getErrorMessage(this.validationResult[e].assert));
            return t
        },
        addError: function (t) {
            var e = arguments.length <= 1 || void 0 === arguments[1] ? {} : arguments[1],
                i = e.message,
                r = e.assert,
                n = e.updateClass,
                s = void 0 === n || n;
            this._buildUI(), this._addError(t, {
                message: i,
                assert: r
            }), s && this._errorClass()
        },
        updateError: function (t) {
            var e = arguments.length <= 1 || void 0 === arguments[1] ? {} : arguments[1],
                i = e.message,
                r = e.assert,
                n = e.updateClass,
                s = void 0 === n || n;
            this._buildUI(), this._updateError(t, {
                message: i,
                assert: r
            }), s && this._errorClass()
        },
        removeError: function (t) {
            var e = arguments.length <= 1 || void 0 === arguments[1] ? {} : arguments[1],
                i = e.updateClass,
                r = void 0 === i || i;
            this._buildUI(), this._removeError(t), r && this._manageStatusClass()
        },
        _manageStatusClass: function () {
            this.hasConstraints() && this.needsValidation() && !0 === this.validationResult ? this._successClass() : this.validationResult.length > 0 ? this._errorClass() : this._resetClass()
        },
        _manageErrorsMessages: function (e) {
            if (void 0 === this.options.errorsMessagesDisabled) {
                if (void 0 !== this.options.errorMessage) return e.added.length || e.kept.length ? (this._insertErrorWrapper(), 0 === this._ui.$errorsWrapper.find(".parsley-custom-error-message").length && this._ui.$errorsWrapper.append(t(this.options.errorTemplate).addClass("parsley-custom-error-message")), this._ui.$errorsWrapper.addClass("filled").find(".parsley-custom-error-message").html(this.options.errorMessage)) : this._ui.$errorsWrapper.removeClass("filled").find(".parsley-custom-error-message").remove();
                for (var i = 0; i < e.removed.length; i++) this._removeError(e.removed[i].assert.name);
                for (i = 0; i < e.added.length; i++) this._addError(e.added[i].assert.name, {
                    message: e.added[i].errorMessage,
                    assert: e.added[i].assert
                });
                for (i = 0; i < e.kept.length; i++) this._updateError(e.kept[i].assert.name, {
                    message: e.kept[i].errorMessage,
                    assert: e.kept[i].assert
                })
            }
        },
        _addError: function (e, i) {
            var r = i.message,
                n = i.assert;
            this._insertErrorWrapper(), this._ui.$errorClassHandler.attr("aria-describedby", this._ui.errorsWrapperId), this._ui.$errorsWrapper.addClass("filled").append(t(this.options.errorTemplate).addClass("parsley-" + e).html(r || this._getErrorMessage(n)))
        },
        _updateError: function (t, e) {
            var i = e.message,
                r = e.assert;
            this._ui.$errorsWrapper.addClass("filled").find(".parsley-" + t).html(i || this._getErrorMessage(r))
        },
        _removeError: function (t) {
            this._ui.$errorClassHandler.removeAttr("aria-describedby"), this._ui.$errorsWrapper.removeClass("filled").find(".parsley-" + t).remove()
        },
        _getErrorMessage: function (t) {
            var e = t.name + "Message";
            return void 0 !== this.options[e] ? window.Parsley.formatMessage(this.options[e], t.requirements) : window.Parsley.getErrorMessage(t)
        },
        _buildUI: function () {
            if (!this._ui && !1 !== this.options.uiEnabled) {
                var e = {};
                this.element.setAttribute(this.options.namespace + "id", this.__id__), e.$errorClassHandler = this._manageClassHandler(), e.errorsWrapperId = "parsley-id-" + (this.options.multiple ? "multiple-" + this.options.multiple : this.__id__), e.$errorsWrapper = t(this.options.errorsWrapper).attr("id", e.errorsWrapperId), e.lastValidationResult = [], e.validationInformationVisible = !1, this._ui = e
            }
        },
        _manageClassHandler: function () {
            if ("string" == typeof this.options.classHandler && t(this.options.classHandler).length) return t(this.options.classHandler);
            var e = this.options.classHandler;
            if ("string" == typeof this.options.classHandler && "function" == typeof window[this.options.classHandler] && (e = window[this.options.classHandler]), "function" == typeof e) {
                var i = e.call(this, this);
                if (void 0 !== i && i.length) return i
            } else {
                if ("object" == typeof e && e instanceof jQuery && e.length) return e;
                e && a.warn("The class handler `" + e + "` does not exist in DOM nor as a global JS function")
            }
            return this._inputHolder()
        },
        _inputHolder: function () {
            return this.options.multiple && "SELECT" !== this.element.nodeName ? this.$element.parent() : this.$element
        },
        _insertErrorWrapper: function () {
            var e = this.options.errorsContainer;
            if (0 !== this._ui.$errorsWrapper.parent().length) return this._ui.$errorsWrapper.parent();
            if ("string" == typeof e) {
                if (t(e).length) return t(e).append(this._ui.$errorsWrapper);
                "function" == typeof window[e] ? e = window[e] : a.warn("The errors container `" + e + "` does not exist in DOM nor as a global JS function")
            }
            return "function" == typeof e && (e = e.call(this, this)), "object" == typeof e && e.length ? e.append(this._ui.$errorsWrapper) : this._inputHolder().after(this._ui.$errorsWrapper)
        },
        _actualizeTriggers: function () {
            var t, e = this,
                i = this._findRelated();
            i.off(".Parsley"), this._failedOnce ? i.on(a.namespaceEvents(this.options.triggerAfterFailure, "Parsley"), function () {
                e._validateIfNeeded()
            }) : (t = a.namespaceEvents(this.options.trigger, "Parsley")) && i.on(t, function (t) {
                e._validateIfNeeded(t)
            })
        },
        _validateIfNeeded: function (t) {
            var e = this;
            t && /key|input/.test(t.type) && (!this._ui || !this._ui.validationInformationVisible) && this.getValue().length <= this.options.validationThreshold || (this.options.debounce ? (window.clearTimeout(this._debounced), this._debounced = window.setTimeout(function () {
                return e.validate()
            }, this.options.debounce)) : this.validate())
        },
        _resetUI: function () {
            this._failedOnce = !1, this._actualizeTriggers(), void 0 !== this._ui && (this._ui.$errorsWrapper.removeClass("filled").children().remove(), this._resetClass(), this._ui.lastValidationResult = [], this._ui.validationInformationVisible = !1)
        },
        _destroyUI: function () {
            this._resetUI(), void 0 !== this._ui && this._ui.$errorsWrapper.remove(), delete this._ui
        },
        _successClass: function () {
            this._ui.validationInformationVisible = !0, this._ui.$errorClassHandler.removeClass(this.options.errorClass).addClass(this.options.successClass)
        },
        _errorClass: function () {
            this._ui.validationInformationVisible = !0, this._ui.$errorClassHandler.removeClass(this.options.successClass).addClass(this.options.errorClass)
        },
        _resetClass: function () {
            this._ui.$errorClassHandler.removeClass(this.options.successClass).removeClass(this.options.errorClass)
        }
    };
    var w = function (e, i, r) {
            this.__class__ = "Form", this.element = e, this.$element = t(e), this.domOptions = i, this.options = r, this.parent = window.Parsley, this.fields = [], this.validationResult = null
        },
        b = {
            pending: null,
            resolved: !0,
            rejected: !1
        };
    w.prototype = {
        onSubmitValidate: function (t) {
            var e = this;
            if (!0 !== t.parsley) {
                var i = this._submitSource || this.$element.find(a._SubmitSelector)[0];
                if (this._submitSource = null, this.$element.find(".parsley-synthetic-submit-button").prop("disabled", !0), !i || null === i.getAttribute("formnovalidate")) {
                    window.Parsley._remoteCache = {};
                    var r = this.whenValidate({
                        event: t
                    });
                    "resolved" === r.state() && !1 !== this._trigger("submit") || (t.stopImmediatePropagation(), t.preventDefault(), "pending" === r.state() && r.done(function () {
                        e._submit(i)
                    }))
                }
            }
        },
        onSubmitButton: function (t) {
            this._submitSource = t.currentTarget
        },
        _submit: function (e) {
            if (!1 !== this._trigger("submit")) {
                if (e) {
                    var i = this.$element.find(".parsley-synthetic-submit-button").prop("disabled", !1);
                    0 === i.length && (i = t('<input class="parsley-synthetic-submit-button" type="hidden">').appendTo(this.$element)), i.attr({
                        name: e.getAttribute("name"),
                        value: e.getAttribute("value")
                    })
                }
                this.$element.trigger(_extends(t.Event("submit"), {
                    parsley: !0
                }))
            }
        },
        validate: function (e) {
            if (arguments.length >= 1 && !t.isPlainObject(e)) {
                a.warnOnce("Calling validate on a parsley form without passing arguments as an object is deprecated.");
                var i = _slice.call(arguments);
                e = {
                    group: i[0],
                    force: i[1],
                    event: i[2]
                }
            }
            return b[this.whenValidate(e).state()]
        },
        whenValidate: function () {
            var e, i = this,
                r = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0],
                n = r.group,
                s = r.force,
                o = r.event;
            this.submitEvent = o, o && (this.submitEvent = _extends({}, o, {
                preventDefault: function () {
                    a.warnOnce("Using `this.submitEvent.preventDefault()` is deprecated; instead, call `this.validationResult = false`"), i.validationResult = !1
                }
            })), this.validationResult = !0, this._trigger("validate"), this._refreshFields();
            var l = this._withoutReactualizingFormOptions(function () {
                return t.map(i.fields, function (t) {
                    return t.whenValidate({
                        force: s,
                        group: n
                    })
                })
            });
            return (e = a.all(l).done(function () {
                i._trigger("success")
            }).fail(function () {
                i.validationResult = !1, i.focus(), i._trigger("error")
            }).always(function () {
                i._trigger("validated")
            })).pipe.apply(e, _toConsumableArray(this._pipeAccordingToValidationResult()))
        },
        isValid: function (e) {
            if (arguments.length >= 1 && !t.isPlainObject(e)) {
                a.warnOnce("Calling isValid on a parsley form without passing arguments as an object is deprecated.");
                var i = _slice.call(arguments);
                e = {
                    group: i[0],
                    force: i[1]
                }
            }
            return b[this.whenValid(e).state()]
        },
        whenValid: function () {
            var e = this,
                i = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0],
                r = i.group,
                n = i.force;
            this._refreshFields();
            var s = this._withoutReactualizingFormOptions(function () {
                return t.map(e.fields, function (t) {
                    return t.whenValid({
                        group: r,
                        force: n
                    })
                })
            });
            return a.all(s)
        },
        refresh: function () {
            return this._refreshFields(), this
        },
        reset: function () {
            for (var t = 0; t < this.fields.length; t++) this.fields[t].reset();
            this._trigger("reset")
        },
        destroy: function () {
            this._destroyUI();
            for (var t = 0; t < this.fields.length; t++) this.fields[t].destroy();
            this.$element.removeData("Parsley"), this._trigger("destroy")
        },
        _refreshFields: function () {
            return this.actualizeOptions()._bindFields()
        },
        _bindFields: function () {
            var e = this,
                i = this.fields;
            return this.fields = [], this.fieldsMappedById = {}, this._withoutReactualizingFormOptions(function () {
                e.$element.find(e.options.inputs).not(e.options.excluded).each(function (t, i) {
                    var r = new window.Parsley.Factory(i, {}, e);
                    if (("Field" === r.__class__ || "FieldMultiple" === r.__class__) && !0 !== r.options.excluded) {
                        var n = r.__class__ + "-" + r.__id__;
                        void 0 === e.fieldsMappedById[n] && (e.fieldsMappedById[n] = r, e.fields.push(r))
                    }
                }), t.each(a.difference(i, e.fields), function (t, e) {
                    e.reset()
                })
            }), this
        },
        _withoutReactualizingFormOptions: function (t) {
            var e = this.actualizeOptions;
            this.actualizeOptions = function () {
                return this
            };
            var i = t();
            return this.actualizeOptions = e, i
        },
        _trigger: function (t) {
            return this.trigger("form:" + t)
        }
    };
    var F = function (t, e, i, r, n) {
            var s = window.Parsley._validatorRegistry.validators[e],
                a = new h(s);
            r = r || t.options[e + "Priority"] || a.priority, n = !0 === n, _extends(this, {
                validator: a,
                name: e,
                requirements: i,
                priority: r,
                isDomConstraint: n
            }), this._parseRequirements(t.options)
        },
        C = function (t) {
            return t[0].toUpperCase() + t.slice(1)
        };
    F.prototype = {
        validate: function (t, e) {
            var i;
            return (i = this.validator).validate.apply(i, [t].concat(_toConsumableArray(this.requirementList), [e]))
        },
        _parseRequirements: function (t) {
            var e = this;
            this.requirementList = this.validator.parseRequirements(this.requirements, function (i) {
                return t[e.name + C(i)]
            })
        }
    };
    var A = function (e, i, r, n) {
            this.__class__ = "Field", this.element = e, this.$element = t(e), void 0 !== n && (this.parent = n), this.options = r, this.domOptions = i, this.constraints = [], this.constraintsByName = {}, this.validationResult = !0, this._bindConstraints()
        },
        E = {
            pending: null,
            resolved: !0,
            rejected: !1
        };
    A.prototype = {
        validate: function (e) {
            arguments.length >= 1 && !t.isPlainObject(e) && (a.warnOnce("Calling validate on a parsley field without passing arguments as an object is deprecated."), e = {
                options: e
            });
            var i = this.whenValidate(e);
            if (!i) return !0;
            switch (i.state()) {
                case "pending":
                    return null;
                case "resolved":
                    return !0;
                case "rejected":
                    return this.validationResult
            }
        },
        whenValidate: function () {
            var t, e = this,
                i = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0],
                r = i.force,
                n = i.group;
            if (this.refresh(), !n || this._isInGroup(n)) return this.value = this.getValue(), this._trigger("validate"), (t = this.whenValid({
                force: r,
                value: this.value,
                _refreshed: !0
            }).always(function () {
                e._reflowUI()
            }).done(function () {
                e._trigger("success")
            }).fail(function () {
                e._trigger("error")
            }).always(function () {
                e._trigger("validated")
            })).pipe.apply(t, _toConsumableArray(this._pipeAccordingToValidationResult()))
        },
        hasConstraints: function () {
            return 0 !== this.constraints.length
        },
        needsValidation: function (t) {
            return void 0 === t && (t = this.getValue()), !(!t.length && !this._isRequired() && void 0 === this.options.validateIfEmpty)
        },
        _isInGroup: function (e) {
            return Array.isArray(this.options.group) ? -1 !== t.inArray(e, this.options.group) : this.options.group === e
        },
        isValid: function (e) {
            if (arguments.length >= 1 && !t.isPlainObject(e)) {
                a.warnOnce("Calling isValid on a parsley field without passing arguments as an object is deprecated.");
                var i = _slice.call(arguments);
                e = {
                    force: i[0],
                    value: i[1]
                }
            }
            var r = this.whenValid(e);
            return !r || E[r.state()]
        },
        whenValid: function () {
            var e = this,
                i = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0],
                r = i.force,
                n = void 0 !== r && r,
                s = i.value,
                o = i.group;
            if (i._refreshed || this.refresh(), !o || this._isInGroup(o)) {
                if (this.validationResult = !0, !this.hasConstraints()) return t.when();
                if (void 0 !== s && null !== s || (s = this.getValue()), !this.needsValidation(s) && !0 !== n) return t.when();
                var l = this._getGroupedConstraints(),
                    u = [];
                return t.each(l, function (i, r) {
                    var n = a.all(t.map(r, function (t) {
                        return e._validateConstraint(s, t)
                    }));
                    if (u.push(n), "rejected" === n.state()) return !1
                }), a.all(u)
            }
        },
        _validateConstraint: function (e, i) {
            var r = this,
                n = i.validate(e, this);
            return !1 === n && (n = t.Deferred().reject()), a.all([n]).fail(function (t) {
                r.validationResult instanceof Array || (r.validationResult = []), r.validationResult.push({
                    assert: i,
                    errorMessage: "string" == typeof t && t
                })
            })
        },
        getValue: function () {
            var t;
            return t = "function" == typeof this.options.value ? this.options.value(this) : void 0 !== this.options.value ? this.options.value : this.$element.val(), void 0 === t || null === t ? "" : this._handleWhitespace(t)
        },
        reset: function () {
            return this._resetUI(), this._trigger("reset")
        },
        destroy: function () {
            this._destroyUI(), this.$element.removeData("Parsley"), this.$element.removeData("FieldMultiple"), this._trigger("destroy")
        },
        refresh: function () {
            return this._refreshConstraints(), this
        },
        _refreshConstraints: function () {
            return this.actualizeOptions()._bindConstraints()
        },
        refreshConstraints: function () {
            return a.warnOnce("Parsley's refreshConstraints is deprecated. Please use refresh"), this.refresh()
        },
        addConstraint: function (t, e, i, r) {
            if (window.Parsley._validatorRegistry.validators[t]) {
                var n = new F(this, t, e, i, r);
                "undefined" !== this.constraintsByName[n.name] && this.removeConstraint(n.name), this.constraints.push(n), this.constraintsByName[n.name] = n
            }
            return this
        },
        removeConstraint: function (t) {
            for (var e = 0; e < this.constraints.length; e++)
                if (t === this.constraints[e].name) {
                    this.constraints.splice(e, 1);
                    break
                } return delete this.constraintsByName[t], this
        },
        updateConstraint: function (t, e, i) {
            return this.removeConstraint(t).addConstraint(t, e, i)
        },
        _bindConstraints: function () {
            for (var t = [], e = {}, i = 0; i < this.constraints.length; i++) !1 === this.constraints[i].isDomConstraint && (t.push(this.constraints[i]), e[this.constraints[i].name] = this.constraints[i]);
            this.constraints = t, this.constraintsByName = e;
            for (var r in this.options) this.addConstraint(r, this.options[r], void 0, !0);
            return this._bindHtml5Constraints()
        },
        _bindHtml5Constraints: function () {
            null !== this.element.getAttribute("required") && this.addConstraint("required", !0, void 0, !0), null !== this.element.getAttribute("pattern") && this.addConstraint("pattern", this.element.getAttribute("pattern"), void 0, !0);
            var t = this.element.getAttribute("min"),
                e = this.element.getAttribute("max");
            null !== t && null !== e ? this.addConstraint("range", [t, e], void 0, !0) : null !== t ? this.addConstraint("min", t, void 0, !0) : null !== e && this.addConstraint("max", e, void 0, !0), null !== this.element.getAttribute("minlength") && null !== this.element.getAttribute("maxlength") ? this.addConstraint("length", [this.element.getAttribute("minlength"), this.element.getAttribute("maxlength")], void 0, !0) : null !== this.element.getAttribute("minlength") ? this.addConstraint("minlength", this.element.getAttribute("minlength"), void 0, !0) : null !== this.element.getAttribute("maxlength") && this.addConstraint("maxlength", this.element.getAttribute("maxlength"), void 0, !0);
            var i = a.getType(this.element);
            return "number" === i ? this.addConstraint("type", ["number", {
                step: this.element.getAttribute("step") || "1",
                base: t || this.element.getAttribute("value")
            }], void 0, !0) : /^(email|url|range|date)$/i.test(i) ? this.addConstraint("type", i, void 0, !0) : this
        },
        _isRequired: function () {
            return void 0 !== this.constraintsByName.required && !1 !== this.constraintsByName.required.requirements
        },
        _trigger: function (t) {
            return this.trigger("field:" + t)
        },
        _handleWhitespace: function (t) {
            return !0 === this.options.trimValue && a.warnOnce('data-parsley-trim-value="true" is deprecated, please use data-parsley-whitespace="trim"'), "squish" === this.options.whitespace && (t = t.replace(/\s{2,}/g, " ")), "trim" !== this.options.whitespace && "squish" !== this.options.whitespace && !0 !== this.options.trimValue || (t = a.trimString(t)), t
        },
        _isDateInput: function () {
            var t = this.constraintsByName.type;
            return t && "date" === t.requirements
        },
        _getGroupedConstraints: function () {
            if (!1 === this.options.priorityEnabled) return [this.constraints];
            for (var t = [], e = {}, i = 0; i < this.constraints.length; i++) {
                var r = this.constraints[i].priority;
                e[r] || t.push(e[r] = []),
                    e[r].push(this.constraints[i])
            }
            return t.sort(function (t, e) {
                return e[0].priority - t[0].priority
            }), t
        }
    };
    var x = A,
        $ = function () {
            this.__class__ = "FieldMultiple"
        };
    $.prototype = {
        addElement: function (t) {
            return this.$elements.push(t), this
        },
        _refreshConstraints: function () {
            var e;
            if (this.constraints = [], "SELECT" === this.element.nodeName) return this.actualizeOptions()._bindConstraints(), this;
            for (var i = 0; i < this.$elements.length; i++)
                if (t("html").has(this.$elements[i]).length) {
                    e = this.$elements[i].data("FieldMultiple")._refreshConstraints().constraints;
                    for (var r = 0; r < e.length; r++) this.addConstraint(e[r].name, e[r].requirements, e[r].priority, e[r].isDomConstraint)
                } else this.$elements.splice(i, 1);
            return this
        },
        getValue: function () {
            if ("function" == typeof this.options.value) return this.options.value(this);
            if (void 0 !== this.options.value) return this.options.value;
            if ("INPUT" === this.element.nodeName) {
                var e = a.getType(this.element);
                if ("radio" === e) return this._findRelated().filter(":checked").val() || "";
                if ("checkbox" === e) {
                    var i = [];
                    return this._findRelated().filter(":checked").each(function () {
                        i.push(t(this).val())
                    }), i
                }
            }
            return "SELECT" === this.element.nodeName && null === this.$element.val() ? [] : this.$element.val()
        },
        _init: function () {
            return this.$elements = [this.$element], this
        }
    };
    var P = function (e, i, r) {
        this.element = e, this.$element = t(e);
        var n = this.$element.data("Parsley");
        if (n) return void 0 !== r && n.parent === window.Parsley && (n.parent = r, n._resetOptions(n.options)), "object" == typeof i && _extends(n.options, i), n;
        if (!this.$element.length) throw new Error("You must bind Parsley on an existing element.");
        if (void 0 !== r && "Form" !== r.__class__) throw new Error("Parent instance must be a Form instance");
        return this.parent = r || window.Parsley, this.init(i)
    };
    P.prototype = {
        init: function (t) {
            return this.__class__ = "Parsley", this.__version__ = "2.8.1", this.__id__ = a.generateID(), this._resetOptions(t), "FORM" === this.element.nodeName || a.checkAttr(this.element, this.options.namespace, "validate") && !this.$element.is(this.options.inputs) ? this.bind("parsleyForm") : this.isMultiple() ? this.handleMultiple() : this.bind("parsleyField")
        },
        isMultiple: function () {
            var t = a.getType(this.element);
            return "radio" === t || "checkbox" === t || "SELECT" === this.element.nodeName && null !== this.element.getAttribute("multiple")
        },
        handleMultiple: function () {
            var e, i, r = this;
            if (this.options.multiple = this.options.multiple || (e = this.element.getAttribute("name")) || this.element.getAttribute("id"), "SELECT" === this.element.nodeName && null !== this.element.getAttribute("multiple")) return this.options.multiple = this.options.multiple || this.__id__, this.bind("parsleyFieldMultiple");
            if (!this.options.multiple) return a.warn("To be bound by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.", this.$element), this;
            this.options.multiple = this.options.multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g, ""), e && t('input[name="' + e + '"]').each(function (t, e) {
                var i = a.getType(e);
                "radio" !== i && "checkbox" !== i || e.setAttribute(r.options.namespace + "multiple", r.options.multiple)
            });
            for (var n = this._findRelated(), s = 0; s < n.length; s++)
                if (void 0 !== (i = t(n.get(s)).data("Parsley"))) {
                    this.$element.data("FieldMultiple") || i.addElement(this.$element);
                    break
                } return this.bind("parsleyField", !0), i || this.bind("parsleyFieldMultiple")
        },
        bind: function (e, i) {
            var r;
            switch (e) {
                case "parsleyForm":
                    r = t.extend(new w(this.element, this.domOptions, this.options), new l, window.ParsleyExtend)._bindFields();
                    break;
                case "parsleyField":
                    r = t.extend(new x(this.element, this.domOptions, this.options, this.parent), new l, window.ParsleyExtend);
                    break;
                case "parsleyFieldMultiple":
                    r = t.extend(new x(this.element, this.domOptions, this.options, this.parent), new $, new l, window.ParsleyExtend)._init();
                    break;
                default:
                    throw new Error(e + "is not a supported Parsley type")
            }
            return this.options.multiple && a.setAttr(this.element, this.options.namespace, "multiple", this.options.multiple), void 0 !== i ? (this.$element.data("FieldMultiple", r), r) : (this.$element.data("Parsley", r), r._actualizeTriggers(), r._trigger("init"), r)
        }
    };
    var V = t.fn.jquery.split(".");
    if (parseInt(V[0]) <= 1 && parseInt(V[1]) < 8) throw "The loaded version of jQuery is too old. Please upgrade to 1.8.x or better.";
    V.forEach || a.warn("Parsley requires ES5 to run properly. Please include https://github.com/es-shims/es5-shim");
    var T = _extends(new l, {
        element: document,
        $element: t(document),
        actualizeOptions: null,
        _resetOptions: null,
        Factory: P,
        version: "2.8.1"
    });
    _extends(x.prototype, y.Field, l.prototype), _extends(w.prototype, y.Form, l.prototype), _extends(P.prototype, l.prototype), t.fn.parsley = t.fn.psly = function (e) {
        if (this.length > 1) {
            var i = [];
            return this.each(function () {
                i.push(t(this).parsley(e))
            }), i
        }
        if (0 != this.length) return new P(this[0], e)
    }, void 0 === window.ParsleyExtend && (window.ParsleyExtend = {}), T.options = _extends(a.objectCreate(o), window.ParsleyConfig), window.ParsleyConfig = T.options, window.Parsley = window.psly = T, T.Utils = a, window.ParsleyUtils = {}, t.each(a, function (t, e) {
        "function" == typeof e && (window.ParsleyUtils[t] = function () {
            return a.warnOnce("Accessing `window.ParsleyUtils` is deprecated. Use `window.Parsley.Utils` instead."), a[t].apply(a, arguments)
        })
    });
    var O = window.Parsley._validatorRegistry = new p(window.ParsleyConfig.validators, window.ParsleyConfig.i18n);
    window.ParsleyValidator = {}, t.each("setLocale addCatalog addMessage addMessages getErrorMessage formatMessage addValidator updateValidator removeValidator hasValidator".split(" "), function (t, e) {
        window.Parsley[e] = function () {
            return O[e].apply(O, arguments)
        }, window.ParsleyValidator[e] = function () {
            var t;
            return a.warnOnce("Accessing the method '" + e + "' through Validator is deprecated. Simply call 'window.Parsley." + e + "(...)'"), (t = window.Parsley)[e].apply(t, arguments)
        }
    }), window.Parsley.UI = y, window.ParsleyUI = {
        removeError: function (t, e, i) {
            var r = !0 !== i;
            return a.warnOnce("Accessing UI is deprecated. Call 'removeError' on the instance directly. Please comment in issue 1073 as to your need to call this method."), t.removeError(e, {
                updateClass: r
            })
        },
        getErrorsMessages: function (t) {
            return a.warnOnce("Accessing UI is deprecated. Call 'getErrorsMessages' on the instance directly."), t.getErrorsMessages()
        }
    }, t.each("addError updateError".split(" "), function (t, e) {
        window.ParsleyUI[e] = function (t, i, r, n, s) {
            var o = !0 !== s;
            return a.warnOnce("Accessing UI is deprecated. Call '" + e + "' on the instance directly. Please comment in issue 1073 as to your need to call this method."), t[e](i, {
                message: r,
                assert: n,
                updateClass: o
            })
        }
    }), !1 !== window.ParsleyConfig.autoBind && t(function () {
        t("[data-parsley-validate]").length && t("[data-parsley-validate]").parsley()
    });
    var M = t({}),
        R = function () {
            a.warnOnce("Parsley's pubsub module is deprecated; use the 'on' and 'off' methods on parsley instances or window.Parsley")
        },
        D = "parsley:";
    t.listen = function (t, r) {
        var n;
        if (R(), "object" == typeof arguments[1] && "function" == typeof arguments[2] && (n = arguments[1], r = arguments[2]), "function" != typeof r) throw new Error("Wrong parameters");
        window.Parsley.on(i(t), e(r, n))
    }, t.listenTo = function (t, r, n) {
        if (R(), !(t instanceof x || t instanceof w)) throw new Error("Must give Parsley instance");
        if ("string" != typeof r || "function" != typeof n) throw new Error("Wrong parameters");
        t.on(i(r), e(n))
    }, t.unsubscribe = function (t, e) {
        if (R(), "string" != typeof t || "function" != typeof e) throw new Error("Wrong arguments");
        window.Parsley.off(i(t), e.parsleyAdaptedCallback)
    }, t.unsubscribeTo = function (t, e) {
        if (R(), !(t instanceof x || t instanceof w)) throw new Error("Must give Parsley instance");
        t.off(i(e))
    }, t.unsubscribeAll = function (e) {
        R(), window.Parsley.off(i(e)), t("form,input,textarea,select").each(function () {
            var r = t(this).data("Parsley");
            r && r.off(i(e))
        })
    }, t.emit = function (t, e) {
        var r;
        R();
        var n = e instanceof x || e instanceof w,
            s = Array.prototype.slice.call(arguments, n ? 2 : 1);
        s.unshift(i(t)), n || (e = window.Parsley), (r = e).trigger.apply(r, _toConsumableArray(s))
    };
    return t.extend(!0, T, {
        asyncValidators: {
            default: {
                fn: function (t) {
                    return t.status >= 200 && t.status < 300
                },
                url: !1
            },
            reverse: {
                fn: function (t) {
                    return t.status < 200 || t.status >= 300
                },
                url: !1
            }
        },
        addAsyncValidator: function (t, e, i, r) {
            return T.asyncValidators[t] = {
                fn: e,
                url: i || !1,
                options: r || {}
            }, this
        }
    }), T.addValidator("remote", {
        requirementType: {
            "": "string",
            validator: "string",
            reverse: "boolean",
            options: "object"
        },
        validateString: function (e, i, r, n) {
            var s, a, o = {},
                l = r.validator || (!0 === r.reverse ? "reverse" : "default");
            if (void 0 === T.asyncValidators[l]) throw new Error("Calling an undefined async validator: `" + l + "`");
            i = T.asyncValidators[l].url || i, i.indexOf("{value}") > -1 ? i = i.replace("{value}", encodeURIComponent(e)) : o[n.element.getAttribute("name") || n.element.getAttribute("id")] = e;
            var u = t.extend(!0, r.options || {}, T.asyncValidators[l].options);
            s = t.extend(!0, {}, {
                url: i,
                data: o,
                type: "GET"
            }, u), n.trigger("field:ajaxoptions", n, s), a = t.param(s), void 0 === T._remoteCache && (T._remoteCache = {});
            var d = T._remoteCache[a] = T._remoteCache[a] || t.ajax(s),
                h = function () {
                    var e = T.asyncValidators[l].fn.call(n, d, i, r);
                    return e || (e = t.Deferred().reject()), t.when(e)
                };
            return d.then(h, h)
        },
        priority: -1
    }), T.on("form:submit", function () {
        T._remoteCache = {}
    }), l.prototype.addAsyncValidator = function () {
        return a.warnOnce("Accessing the method `addAsyncValidator` through an instance is deprecated. Simply call `Parsley.addAsyncValidator(...)`"), T.addAsyncValidator.apply(T, arguments)
    }, T.addMessages("en", {
        defaultMessage: "This value seems to be invalid.",
        type: {
            email: "This value should be a valid email.",
            url: "This value should be a valid url.",
            number: "This value should be a valid number.",
            integer: "This value should be a valid integer.",
            digits: "This value should be digits.",
            alphanum: "This value should be alphanumeric."
        },
        notblank: "This value should not be blank.",
        required: "This value is required.",
        pattern: "This value seems to be invalid.",
        min: "This value should be greater than or equal to %s.",
        max: "This value should be lower than or equal to %s.",
        range: "This value should be between %s and %s.",
        minlength: "This value is too short. It should have %s characters or more.",
        maxlength: "This value is too long. It should have %s characters or fewer.",
        length: "This value length is invalid. It should be between %s and %s characters long.",
        mincheck: "You must select at least %s choices.",
        maxcheck: "You must select %s choices or fewer.",
        check: "You must select between %s and %s choices.",
        equalto: "This value should be the same."
    }), T.setLocale("en"), (new r).install(), T
});
if ("undefined" == typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery"); + function (t) {
    "use strict";
    var e = t.fn.jquery.split(" ")[0].split(".");
    if (e[0] < 2 && e[1] < 9 || 1 == e[0] && 9 == e[1] && e[2] < 1 || e[0] > 3) throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4")
}(jQuery),
function (t) {
    "use strict";

    function e() {
        var t = document.createElement("bootstrap"),
            e = {
                WebkitTransition: "webkitTransitionEnd",
                MozTransition: "transitionend",
                OTransition: "oTransitionEnd otransitionend",
                transition: "transitionend"
            };
        for (var i in e)
            if (void 0 !== t.style[i]) return {
                end: e[i]
            };
        return !1
    }
    t.fn.emulateTransitionEnd = function (e) {
        var i = !1,
            o = this;
        t(this).one("bsTransitionEnd", function () {
            i = !0
        });
        var n = function () {
            i || t(o).trigger(t.support.transition.end)
        };
        return setTimeout(n, e), this
    }, t(function () {
        t.support.transition = e(), t.support.transition && (t.event.special.bsTransitionEnd = {
            bindType: t.support.transition.end,
            delegateType: t.support.transition.end,
            handle: function (e) {
                if (t(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        })
    })
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        return this.each(function () {
            var i = t(this),
                n = i.data("bs.alert");
            n || i.data("bs.alert", n = new o(this)), "string" == typeof e && n[e].call(i)
        })
    }
    var i = '[data-dismiss="alert"]',
        o = function (e) {
            t(e).on("click", i, this.close)
        };
    o.VERSION = "3.3.7", o.TRANSITION_DURATION = 150, o.prototype.close = function (e) {
        function i() {
            a.detach().trigger("closed.bs.alert").remove()
        }
        var n = t(this),
            s = n.attr("data-target");
        s || (s = n.attr("href"), s = s && s.replace(/.*(?=#[^\s]*$)/, ""));
        var a = t("#" === s ? [] : s);
        e && e.preventDefault(), a.length || (a = n.closest(".alert")), a.trigger(e = t.Event("close.bs.alert")), e.isDefaultPrevented() || (a.removeClass("in"), t.support.transition && a.hasClass("fade") ? a.one("bsTransitionEnd", i).emulateTransitionEnd(o.TRANSITION_DURATION) : i())
    };
    var n = t.fn.alert;
    t.fn.alert = e, t.fn.alert.Constructor = o, t.fn.alert.noConflict = function () {
        return t.fn.alert = n, this
    }, t(document).on("click.bs.alert.data-api", i, o.prototype.close)
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        return this.each(function () {
            var o = t(this),
                n = o.data("bs.button"),
                s = "object" == typeof e && e;
            n || o.data("bs.button", n = new i(this, s)), "toggle" == e ? n.toggle() : e && n.setState(e)
        })
    }
    var i = function (e, o) {
        this.$element = t(e), this.options = t.extend({}, i.DEFAULTS, o), this.isLoading = !1
    };
    i.VERSION = "3.3.7", i.DEFAULTS = {
        loadingText: "loading..."
    }, i.prototype.setState = function (e) {
        var i = "disabled",
            o = this.$element,
            n = o.is("input") ? "val" : "html",
            s = o.data();
        e += "Text", null == s.resetText && o.data("resetText", o[n]()), setTimeout(t.proxy(function () {
            o[n](null == s[e] ? this.options[e] : s[e]), "loadingText" == e ? (this.isLoading = !0, o.addClass(i).attr(i, i).prop(i, !0)) : this.isLoading && (this.isLoading = !1, o.removeClass(i).removeAttr(i).prop(i, !1))
        }, this), 0)
    }, i.prototype.toggle = function () {
        var t = !0,
            e = this.$element.closest('[data-toggle="buttons"]');
        if (e.length) {
            var i = this.$element.find("input");
            "radio" == i.prop("type") ? (i.prop("checked") && (t = !1), e.find(".active").removeClass("active"), this.$element.addClass("active")) : "checkbox" == i.prop("type") && (i.prop("checked") !== this.$element.hasClass("active") && (t = !1), this.$element.toggleClass("active")), i.prop("checked", this.$element.hasClass("active")), t && i.trigger("change")
        } else this.$element.attr("aria-pressed", !this.$element.hasClass("active")), this.$element.toggleClass("active")
    };
    var o = t.fn.button;
    t.fn.button = e, t.fn.button.Constructor = i, t.fn.button.noConflict = function () {
        return t.fn.button = o, this
    }, t(document).on("click.bs.button.data-api", '[data-toggle^="button"]', function (i) {
        var o = t(i.target).closest(".btn");
        e.call(o, "toggle"), t(i.target).is('input[type="radio"], input[type="checkbox"]') || (i.preventDefault(), o.is("input,button") ? o.trigger("focus") : o.find("input:visible,button:visible").first().trigger("focus"))
    }).on("focus.bs.button.data-api blur.bs.button.data-api", '[data-toggle^="button"]', function (e) {
        t(e.target).closest(".btn").toggleClass("focus", /^focus(in)?$/.test(e.type))
    })
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        return this.each(function () {
            var o = t(this),
                n = o.data("bs.carousel"),
                s = t.extend({}, i.DEFAULTS, o.data(), "object" == typeof e && e),
                a = "string" == typeof e ? e : s.slide;
            n || o.data("bs.carousel", n = new i(this, s)), "number" == typeof e ? n.to(e) : a ? n[a]() : s.interval && n.pause().cycle()
        })
    }
    var i = function (e, i) {
        this.$element = t(e), this.$indicators = this.$element.find(".carousel-indicators"), this.options = i, this.paused = null, this.sliding = null, this.interval = null, this.$active = null, this.$items = null, this.options.keyboard && this.$element.on("keydown.bs.carousel", t.proxy(this.keydown, this)), "hover" == this.options.pause && !("ontouchstart" in document.documentElement) && this.$element.on("mouseenter.bs.carousel", t.proxy(this.pause, this)).on("mouseleave.bs.carousel", t.proxy(this.cycle, this))
    };
    i.VERSION = "3.3.7", i.TRANSITION_DURATION = 600, i.DEFAULTS = {
        interval: 5e3,
        pause: "hover",
        wrap: !0,
        keyboard: !0
    }, i.prototype.keydown = function (t) {
        if (!/input|textarea/i.test(t.target.tagName)) {
            switch (t.which) {
                case 37:
                    this.prev();
                    break;
                case 39:
                    this.next();
                    break;
                default:
                    return
            }
            t.preventDefault()
        }
    }, i.prototype.cycle = function (e) {
        return e || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval(t.proxy(this.next, this), this.options.interval)), this
    }, i.prototype.getItemIndex = function (t) {
        return this.$items = t.parent().children(".item"), this.$items.index(t || this.$active)
    }, i.prototype.getItemForDirection = function (t, e) {
        var i = this.getItemIndex(e);
        if (("prev" == t && 0 === i || "next" == t && i == this.$items.length - 1) && !this.options.wrap) return e;
        var o = "prev" == t ? -1 : 1,
            n = (i + o) % this.$items.length;
        return this.$items.eq(n)
    }, i.prototype.to = function (t) {
        var e = this,
            i = this.getItemIndex(this.$active = this.$element.find(".item.active"));
        if (!(t > this.$items.length - 1 || t < 0)) return this.sliding ? this.$element.one("slid.bs.carousel", function () {
            e.to(t)
        }) : i == t ? this.pause().cycle() : this.slide(t > i ? "next" : "prev", this.$items.eq(t))
    }, i.prototype.pause = function (e) {
        return e || (this.paused = !0), this.$element.find(".next, .prev").length && t.support.transition && (this.$element.trigger(t.support.transition.end), this.cycle(!0)), this.interval = clearInterval(this.interval), this
    }, i.prototype.next = function () {
        if (!this.sliding) return this.slide("next")
    }, i.prototype.prev = function () {
        if (!this.sliding) return this.slide("prev")
    }, i.prototype.slide = function (e, o) {
        var n = this.$element.find(".item.active"),
            s = o || this.getItemForDirection(e, n),
            a = this.interval,
            r = "next" == e ? "left" : "right",
            l = this;
        if (s.hasClass("active")) return this.sliding = !1;
        var h = s[0],
            d = t.Event("slide.bs.carousel", {
                relatedTarget: h,
                direction: r
            });
        if (this.$element.trigger(d), !d.isDefaultPrevented()) {
            if (this.sliding = !0, a && this.pause(), this.$indicators.length) {
                this.$indicators.find(".active").removeClass("active");
                var p = t(this.$indicators.children()[this.getItemIndex(s)]);
                p && p.addClass("active")
            }
            var c = t.Event("slid.bs.carousel", {
                relatedTarget: h,
                direction: r
            });
            return t.support.transition && this.$element.hasClass("slide") ? (s.addClass(e), s[0].offsetWidth, n.addClass(r), s.addClass(r), n.one("bsTransitionEnd", function () {
                s.removeClass([e, r].join(" ")).addClass("active"), n.removeClass(["active", r].join(" ")), l.sliding = !1, setTimeout(function () {
                    l.$element.trigger(c)
                }, 0)
            }).emulateTransitionEnd(i.TRANSITION_DURATION)) : (n.removeClass("active"), s.addClass("active"), this.sliding = !1, this.$element.trigger(c)), a && this.cycle(), this
        }
    };
    var o = t.fn.carousel;
    t.fn.carousel = e, t.fn.carousel.Constructor = i, t.fn.carousel.noConflict = function () {
        return t.fn.carousel = o, this
    };
    var n = function (i) {
        var o, n = t(this),
            s = t(n.attr("data-target") || (o = n.attr("href")) && o.replace(/.*(?=#[^\s]+$)/, ""));
        if (s.hasClass("carousel")) {
            var a = t.extend({}, s.data(), n.data()),
                r = n.attr("data-slide-to");
            r && (a.interval = !1), e.call(s, a), r && s.data("bs.carousel").to(r), i.preventDefault()
        }
    };
    t(document).on("click.bs.carousel.data-api", "[data-slide]", n).on("click.bs.carousel.data-api", "[data-slide-to]", n), t(window).on("load", function () {
        t('[data-ride="carousel"]').each(function () {
            var i = t(this);
            e.call(i, i.data())
        })
    })
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        var i, o = e.attr("data-target") || (i = e.attr("href")) && i.replace(/.*(?=#[^\s]+$)/, "");
        return t(o)
    }

    function i(e) {
        return this.each(function () {
            var i = t(this),
                n = i.data("bs.collapse"),
                s = t.extend({}, o.DEFAULTS, i.data(), "object" == typeof e && e);
            !n && s.toggle && /show|hide/.test(e) && (s.toggle = !1), n || i.data("bs.collapse", n = new o(this, s)), "string" == typeof e && n[e]()
        })
    }
    var o = function (e, i) {
        this.$element = t(e), this.options = t.extend({}, o.DEFAULTS, i), this.$trigger = t('[data-toggle="collapse"][href="#' + e.id + '"],[data-toggle="collapse"][data-target="#' + e.id + '"]'), this.transitioning = null, this.options.parent ? this.$parent = this.getParent() : this.addAriaAndCollapsedClass(this.$element, this.$trigger), this.options.toggle && this.toggle()
    };
    o.VERSION = "3.3.7", o.TRANSITION_DURATION = 350, o.DEFAULTS = {
        toggle: !0
    }, o.prototype.dimension = function () {
        return this.$element.hasClass("width") ? "width" : "height"
    }, o.prototype.show = function () {
        if (!this.transitioning && !this.$element.hasClass("in")) {
            var e, n = this.$parent && this.$parent.children(".panel").children(".in, .collapsing");
            if (!(n && n.length && (e = n.data("bs.collapse")) && e.transitioning)) {
                var s = t.Event("show.bs.collapse");
                if (this.$element.trigger(s), !s.isDefaultPrevented()) {
                    n && n.length && (i.call(n, "hide"), e || n.data("bs.collapse", null));
                    var a = this.dimension();
                    this.$element.removeClass("collapse").addClass("collapsing")[a](0).attr("aria-expanded", !0), this.$trigger.removeClass("collapsed").attr("aria-expanded", !0), this.transitioning = 1;
                    var r = function () {
                        this.$element.removeClass("collapsing").addClass("collapse in")[a](""), this.transitioning = 0, this.$element.trigger("shown.bs.collapse")
                    };
                    if (!t.support.transition) return r.call(this);
                    var l = t.camelCase(["scroll", a].join("-"));
                    this.$element.one("bsTransitionEnd", t.proxy(r, this)).emulateTransitionEnd(o.TRANSITION_DURATION)[a](this.$element[0][l])
                }
            }
        }
    }, o.prototype.hide = function () {
        if (!this.transitioning && this.$element.hasClass("in")) {
            var e = t.Event("hide.bs.collapse");
            if (this.$element.trigger(e), !e.isDefaultPrevented()) {
                var i = this.dimension();
                this.$element[i](this.$element[i]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded", !1), this.$trigger.addClass("collapsed").attr("aria-expanded", !1), this.transitioning = 1;
                var n = function () {
                    this.transitioning = 0, this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")
                };
                if (!t.support.transition) return n.call(this);
                this.$element[i](0).one("bsTransitionEnd", t.proxy(n, this)).emulateTransitionEnd(o.TRANSITION_DURATION)
            }
        }
    }, o.prototype.toggle = function () {
        this[this.$element.hasClass("in") ? "hide" : "show"]()
    }, o.prototype.getParent = function () {
        return t(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each(t.proxy(function (i, o) {
            var n = t(o);
            this.addAriaAndCollapsedClass(e(n), n)
        }, this)).end()
    }, o.prototype.addAriaAndCollapsedClass = function (t, e) {
        var i = t.hasClass("in");
        t.attr("aria-expanded", i), e.toggleClass("collapsed", !i).attr("aria-expanded", i)
    };
    var n = t.fn.collapse;
    t.fn.collapse = i, t.fn.collapse.Constructor = o, t.fn.collapse.noConflict = function () {
        return t.fn.collapse = n, this
    }, t(document).on("click.bs.collapse.data-api", '[data-toggle="collapse"]', function (o) {
        var n = t(this);
        n.attr("data-target") || o.preventDefault();
        var s = e(n),
            a = s.data("bs.collapse"),
            r = a ? "toggle" : n.data();
        i.call(s, r)
    })
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        var i = e.attr("data-target");
        i || (i = e.attr("href"), i = i && /#[A-Za-z]/.test(i) && i.replace(/.*(?=#[^\s]*$)/, ""));
        var o = i && t(i);
        return o && o.length ? o : e.parent()
    }

    function i(i) {
        i && 3 === i.which || (t(n).remove(), t(s).each(function () {
            var o = t(this),
                n = e(o),
                s = {
                    relatedTarget: this
                };
            n.hasClass("open") && (i && "click" == i.type && /input|textarea/i.test(i.target.tagName) && t.contains(n[0], i.target) || (n.trigger(i = t.Event("hide.bs.dropdown", s)), i.isDefaultPrevented() || (o.attr("aria-expanded", "false"), n.removeClass("open").trigger(t.Event("hidden.bs.dropdown", s)))))
        }))
    }

    function o(e) {
        return this.each(function () {
            var i = t(this),
                o = i.data("bs.dropdown");
            o || i.data("bs.dropdown", o = new a(this)), "string" == typeof e && o[e].call(i)
        })
    }
    var n = ".dropdown-backdrop",
        s = '[data-toggle="dropdown"]',
        a = function (e) {
            t(e).on("click.bs.dropdown", this.toggle)
        };
    a.VERSION = "3.3.7", a.prototype.toggle = function (o) {
        var n = t(this);
        if (!n.is(".disabled, :disabled")) {
            var s = e(n),
                a = s.hasClass("open");
            if (i(), !a) {
                "ontouchstart" in document.documentElement && !s.closest(".navbar-nav").length && t(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(t(this)).on("click", i);
                var r = {
                    relatedTarget: this
                };
                if (s.trigger(o = t.Event("show.bs.dropdown", r)), o.isDefaultPrevented()) return;
                n.trigger("focus").attr("aria-expanded", "true"), s.toggleClass("open").trigger(t.Event("shown.bs.dropdown", r))
            }
            return !1
        }
    }, a.prototype.keydown = function (i) {
        if (/(38|40|27|32)/.test(i.which) && !/input|textarea/i.test(i.target.tagName)) {
            var o = t(this);
            if (i.preventDefault(), i.stopPropagation(), !o.is(".disabled, :disabled")) {
                var n = e(o),
                    a = n.hasClass("open");
                if (!a && 27 != i.which || a && 27 == i.which) return 27 == i.which && n.find(s).trigger("focus"), o.trigger("click");
                var r = n.find(".dropdown-menu li:not(.disabled):visible a");
                if (r.length) {
                    var l = r.index(i.target);
                    38 == i.which && l > 0 && l--, 40 == i.which && l < r.length - 1 && l++, ~l || (l = 0), r.eq(l).trigger("focus")
                }
            }
        }
    };
    var r = t.fn.dropdown;
    t.fn.dropdown = o, t.fn.dropdown.Constructor = a, t.fn.dropdown.noConflict = function () {
        return t.fn.dropdown = r, this
    }, t(document).on("click.bs.dropdown.data-api", i).on("click.bs.dropdown.data-api", ".dropdown form", function (t) {
        t.stopPropagation()
    }).on("click.bs.dropdown.data-api", s, a.prototype.toggle).on("keydown.bs.dropdown.data-api", s, a.prototype.keydown).on("keydown.bs.dropdown.data-api", ".dropdown-menu", a.prototype.keydown)
}(jQuery),
function (t) {
    "use strict";

    function e(e, o) {
        return this.each(function () {
            var n = t(this),
                s = n.data("bs.modal"),
                a = t.extend({}, i.DEFAULTS, n.data(), "object" == typeof e && e);
            s || n.data("bs.modal", s = new i(this, a)), "string" == typeof e ? s[e](o) : a.show && s.show(o)
        })
    }
    var i = function (e, i) {
        this.options = i, this.$body = t(document.body), this.$element = t(e), this.$dialog = this.$element.find(".modal-dialog"), this.$backdrop = null, this.isShown = null, this.originalBodyPad = null, this.scrollbarWidth = 0, this.ignoreBackdropClick = !1, this.options.remote && this.$element.find(".modal-content").load(this.options.remote, t.proxy(function () {
            this.$element.trigger("loaded.bs.modal")
        }, this))
    };
    i.VERSION = "3.3.7", i.TRANSITION_DURATION = 300, i.BACKDROP_TRANSITION_DURATION = 150, i.DEFAULTS = {
        backdrop: !0,
        keyboard: !0,
        show: !0
    }, i.prototype.toggle = function (t) {
        return this.isShown ? this.hide() : this.show(t)
    }, i.prototype.show = function (e) {
        var o = this,
            n = t.Event("show.bs.modal", {
                relatedTarget: e
            });
        this.$element.trigger(n), this.isShown || n.isDefaultPrevented() || (this.isShown = !0, this.checkScrollbar(), this.setScrollbar(), this.$body.addClass("modal-open"), this.escape(), this.resize(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', t.proxy(this.hide, this)), this.$dialog.on("mousedown.dismiss.bs.modal", function () {
            o.$element.one("mouseup.dismiss.bs.modal", function (e) {
                t(e.target).is(o.$element) && (o.ignoreBackdropClick = !0)
            })
        }), this.backdrop(function () {
            var n = t.support.transition && o.$element.hasClass("fade");
            o.$element.parent().length || o.$element.appendTo(o.$body), o.$element.show().scrollTop(0), o.adjustDialog(), n && o.$element[0].offsetWidth, o.$element.addClass("in"), o.enforceFocus();
            var s = t.Event("shown.bs.modal", {
                relatedTarget: e
            });
            n ? o.$dialog.one("bsTransitionEnd", function () {
                o.$element.trigger("focus").trigger(s)
            }).emulateTransitionEnd(i.TRANSITION_DURATION) : o.$element.trigger("focus").trigger(s)
        }))
    }, i.prototype.hide = function (e) {
        e && e.preventDefault(), e = t.Event("hide.bs.modal"), this.$element.trigger(e), this.isShown && !e.isDefaultPrevented() && (this.isShown = !1, this.escape(), this.resize(), t(document).off("focusin.bs.modal"), this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"), this.$dialog.off("mousedown.dismiss.bs.modal"), t.support.transition && this.$element.hasClass("fade") ? this.$element.one("bsTransitionEnd", t.proxy(this.hideModal, this)).emulateTransitionEnd(i.TRANSITION_DURATION) : this.hideModal())
    }, i.prototype.enforceFocus = function () {
        t(document).off("focusin.bs.modal").on("focusin.bs.modal", t.proxy(function (t) {
            document === t.target || this.$element[0] === t.target || this.$element.has(t.target).length || this.$element.trigger("focus")
        }, this))
    }, i.prototype.escape = function () {
        this.isShown && this.options.keyboard ? this.$element.on("keydown.dismiss.bs.modal", t.proxy(function (t) {
            27 == t.which && this.hide()
        }, this)) : this.isShown || this.$element.off("keydown.dismiss.bs.modal")
    }, i.prototype.resize = function () {
        this.isShown ? t(window).on("resize.bs.modal", t.proxy(this.handleUpdate, this)) : t(window).off("resize.bs.modal")
    }, i.prototype.hideModal = function () {
        var t = this;
        this.$element.hide(), this.backdrop(function () {
            t.$body.removeClass("modal-open"), t.resetAdjustments(), t.resetScrollbar(), t.$element.trigger("hidden.bs.modal")
        })
    }, i.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove(), this.$backdrop = null
    }, i.prototype.backdrop = function (e) {
        var o = this,
            n = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var s = t.support.transition && n;
            if (this.$backdrop = t(document.createElement("div")).addClass("modal-backdrop " + n).appendTo(this.$body), this.$element.on("click.dismiss.bs.modal", t.proxy(function (t) {
                    if (this.ignoreBackdropClick) return void(this.ignoreBackdropClick = !1);
                    t.target === t.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus() : this.hide())
                }, this)), s && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), !e) return;
            s ? this.$backdrop.one("bsTransitionEnd", e).emulateTransitionEnd(i.BACKDROP_TRANSITION_DURATION) : e()
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass("in");
            var a = function () {
                o.removeBackdrop(), e && e()
            };
            t.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one("bsTransitionEnd", a).emulateTransitionEnd(i.BACKDROP_TRANSITION_DURATION) : a()
        } else e && e()
    }, i.prototype.handleUpdate = function () {
        this.adjustDialog()
    }, i.prototype.adjustDialog = function () {
        var t = this.$element[0].scrollHeight > document.documentElement.clientHeight;
        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && t ? this.scrollbarWidth : "",
            paddingRight: this.bodyIsOverflowing && !t ? this.scrollbarWidth : ""
        })
    }, i.prototype.resetAdjustments = function () {
        this.$element.css({
            paddingLeft: "",
            paddingRight: ""
        })
    }, i.prototype.checkScrollbar = function () {
        var t = window.innerWidth;
        if (!t) {
            var e = document.documentElement.getBoundingClientRect();
            t = e.right - Math.abs(e.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < t, this.scrollbarWidth = this.measureScrollbar()
    }, i.prototype.setScrollbar = function () {
        var t = parseInt(this.$body.css("padding-right") || 0, 10);
        this.originalBodyPad = document.body.style.paddingRight || "", this.bodyIsOverflowing && this.$body.css("padding-right", t + this.scrollbarWidth)
    }, i.prototype.resetScrollbar = function () {
        this.$body.css("padding-right", this.originalBodyPad)
    }, i.prototype.measureScrollbar = function () {
        var t = document.createElement("div");
        t.className = "modal-scrollbar-measure", this.$body.append(t);
        var e = t.offsetWidth - t.clientWidth;
        return this.$body[0].removeChild(t), e
    };
    var o = t.fn.modal;
    t.fn.modal = e, t.fn.modal.Constructor = i, t.fn.modal.noConflict = function () {
        return t.fn.modal = o, this
    }, t(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function (i) {
        var o = t(this),
            n = o.attr("href"),
            s = t(o.attr("data-target") || n && n.replace(/.*(?=#[^\s]+$)/, "")),
            a = s.data("bs.modal") ? "toggle" : t.extend({
                remote: !/#/.test(n) && n
            }, s.data(), o.data());
        o.is("a") && i.preventDefault(), s.one("show.bs.modal", function (t) {
            t.isDefaultPrevented() || s.one("hidden.bs.modal", function () {
                o.is(":visible") && o.trigger("focus")
            })
        }), e.call(s, a, this)
    })
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        return this.each(function () {
            var o = t(this),
                n = o.data("bs.tooltip"),
                s = "object" == typeof e && e;
            !n && /destroy|hide/.test(e) || (n || o.data("bs.tooltip", n = new i(this, s)), "string" == typeof e && n[e]())
        })
    }
    var i = function (t, e) {
        this.type = null, this.options = null, this.enabled = null, this.timeout = null, this.hoverState = null, this.$element = null, this.inState = null, this.init("tooltip", t, e)
    };
    i.VERSION = "3.3.7", i.TRANSITION_DURATION = 150, i.DEFAULTS = {
        animation: !0,
        placement: "top",
        selector: !1,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover focus",
        title: "",
        delay: 0,
        html: !1,
        container: !1,
        viewport: {
            selector: "body",
            padding: 0
        }
    }, i.prototype.init = function (e, i, o) {
        if (this.enabled = !0, this.type = e, this.$element = t(i), this.options = this.getOptions(o), this.$viewport = this.options.viewport && t(t.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : this.options.viewport.selector || this.options.viewport), this.inState = {
                click: !1,
                hover: !1,
                focus: !1
            }, this.$element[0] instanceof document.constructor && !this.options.selector) throw new Error("`selector` option must be specified when initializing " + this.type + " on the window.document object!");
        for (var n = this.options.trigger.split(" "), s = n.length; s--;) {
            var a = n[s];
            if ("click" == a) this.$element.on("click." + this.type, this.options.selector, t.proxy(this.toggle, this));
            else if ("manual" != a) {
                var r = "hover" == a ? "mouseenter" : "focusin",
                    l = "hover" == a ? "mouseleave" : "focusout";
                this.$element.on(r + "." + this.type, this.options.selector, t.proxy(this.enter, this)), this.$element.on(l + "." + this.type, this.options.selector, t.proxy(this.leave, this))
            }
        }
        this.options.selector ? this._options = t.extend({}, this.options, {
            trigger: "manual",
            selector: ""
        }) : this.fixTitle()
    }, i.prototype.getDefaults = function () {
        return i.DEFAULTS
    }, i.prototype.getOptions = function (e) {
        return e = t.extend({}, this.getDefaults(), this.$element.data(), e), e.delay && "number" == typeof e.delay && (e.delay = {
            show: e.delay,
            hide: e.delay
        }), e
    }, i.prototype.getDelegateOptions = function () {
        var e = {},
            i = this.getDefaults();
        return this._options && t.each(this._options, function (t, o) {
            i[t] != o && (e[t] = o)
        }), e
    }, i.prototype.enter = function (e) {
        var i = e instanceof this.constructor ? e : t(e.currentTarget).data("bs." + this.type);
        return i || (i = new this.constructor(e.currentTarget, this.getDelegateOptions()), t(e.currentTarget).data("bs." + this.type, i)), e instanceof t.Event && (i.inState["focusin" == e.type ? "focus" : "hover"] = !0), i.tip().hasClass("in") || "in" == i.hoverState ? void(i.hoverState = "in") : (clearTimeout(i.timeout), i.hoverState = "in", i.options.delay && i.options.delay.show ? void(i.timeout = setTimeout(function () {
            "in" == i.hoverState && i.show()
        }, i.options.delay.show)) : i.show())
    }, i.prototype.isInStateTrue = function () {
        for (var t in this.inState)
            if (this.inState[t]) return !0;
        return !1
    }, i.prototype.leave = function (e) {
        var i = e instanceof this.constructor ? e : t(e.currentTarget).data("bs." + this.type);
        if (i || (i = new this.constructor(e.currentTarget, this.getDelegateOptions()), t(e.currentTarget).data("bs." + this.type, i)), e instanceof t.Event && (i.inState["focusout" == e.type ? "focus" : "hover"] = !1), !i.isInStateTrue()) {
            if (clearTimeout(i.timeout), i.hoverState = "out", !i.options.delay || !i.options.delay.hide) return i.hide();
            i.timeout = setTimeout(function () {
                "out" == i.hoverState && i.hide()
            }, i.options.delay.hide)
        }
    }, i.prototype.show = function () {
        var e = t.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);
            var o = t.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
            if (e.isDefaultPrevented() || !o) return;
            var n = this,
                s = this.tip(),
                a = this.getUID(this.type);
            this.setContent(), s.attr("id", a), this.$element.attr("aria-describedby", a), this.options.animation && s.addClass("fade");
            var r = "function" == typeof this.options.placement ? this.options.placement.call(this, s[0], this.$element[0]) : this.options.placement,
                l = /\s?auto?\s?/i,
                h = l.test(r);
            h && (r = r.replace(l, "") || "top"), s.detach().css({
                top: 0,
                left: 0,
                display: "block"
            }).addClass(r).data("bs." + this.type, this), this.options.container ? s.appendTo(this.options.container) : s.insertAfter(this.$element), this.$element.trigger("inserted.bs." + this.type);
            var d = this.getPosition(),
                p = s[0].offsetWidth,
                c = s[0].offsetHeight;
            if (h) {
                var f = r,
                    u = this.getPosition(this.$viewport);
                r = "bottom" == r && d.bottom + c > u.bottom ? "top" : "top" == r && d.top - c < u.top ? "bottom" : "right" == r && d.right + p > u.width ? "left" : "left" == r && d.left - p < u.left ? "right" : r, s.removeClass(f).addClass(r)
            }
            var g = this.getCalculatedOffset(r, d, p, c);
            this.applyPlacement(g, r);
            var m = function () {
                var t = n.hoverState;
                n.$element.trigger("shown.bs." + n.type), n.hoverState = null, "out" == t && n.leave(n)
            };
            t.support.transition && this.$tip.hasClass("fade") ? s.one("bsTransitionEnd", m).emulateTransitionEnd(i.TRANSITION_DURATION) : m()
        }
    }, i.prototype.applyPlacement = function (e, i) {
        var o = this.tip(),
            n = o[0].offsetWidth,
            s = o[0].offsetHeight,
            a = parseInt(o.css("margin-top"), 10),
            r = parseInt(o.css("margin-left"), 10);
        isNaN(a) && (a = 0), isNaN(r) && (r = 0), e.top += a, e.left += r, t.offset.setOffset(o[0], t.extend({
            using: function (t) {
                o.css({
                    top: Math.round(t.top),
                    left: Math.round(t.left)
                })
            }
        }, e), 0), o.addClass("in");
        var l = o[0].offsetWidth,
            h = o[0].offsetHeight;
        "top" == i && h != s && (e.top = e.top + s - h);
        var d = this.getViewportAdjustedDelta(i, e, l, h);
        d.left ? e.left += d.left : e.top += d.top;
        var p = /top|bottom/.test(i),
            c = p ? 2 * d.left - n + l : 2 * d.top - s + h,
            f = p ? "offsetWidth" : "offsetHeight";
        o.offset(e), this.replaceArrow(c, o[0][f], p)
    }, i.prototype.replaceArrow = function (t, e, i) {
        this.arrow().css(i ? "left" : "top", 50 * (1 - t / e) + "%").css(i ? "top" : "left", "")
    }, i.prototype.setContent = function () {
        var t = this.tip(),
            e = this.getTitle();
        t.find(".tooltip-inner")[this.options.html ? "html" : "text"](e), t.removeClass("fade in top bottom left right")
    }, i.prototype.hide = function (e) {
        function o() {
            "in" != n.hoverState && s.detach(), n.$element && n.$element.removeAttr("aria-describedby").trigger("hidden.bs." + n.type), e && e()
        }
        var n = this,
            s = t(this.$tip),
            a = t.Event("hide.bs." + this.type);
        if (this.$element.trigger(a), !a.isDefaultPrevented()) return s.removeClass("in"), t.support.transition && s.hasClass("fade") ? s.one("bsTransitionEnd", o).emulateTransitionEnd(i.TRANSITION_DURATION) : o(), this.hoverState = null, this
    }, i.prototype.fixTitle = function () {
        var t = this.$element;
        (t.attr("title") || "string" != typeof t.attr("data-original-title")) && t.attr("data-original-title", t.attr("title") || "").attr("title", "")
    }, i.prototype.hasContent = function () {
        return this.getTitle()
    }, i.prototype.getPosition = function (e) {
        e = e || this.$element;
        var i = e[0],
            o = "BODY" == i.tagName,
            n = i.getBoundingClientRect();
        null == n.width && (n = t.extend({}, n, {
            width: n.right - n.left,
            height: n.bottom - n.top
        }));
        var s = window.SVGElement && i instanceof window.SVGElement,
            a = o ? {
                top: 0,
                left: 0
            } : s ? null : e.offset(),
            r = {
                scroll: o ? document.documentElement.scrollTop || document.body.scrollTop : e.scrollTop()
            },
            l = o ? {
                width: t(window).width(),
                height: t(window).height()
            } : null;
        return t.extend({}, n, r, l, a)
    }, i.prototype.getCalculatedOffset = function (t, e, i, o) {
        return "bottom" == t ? {
            top: e.top + e.height,
            left: e.left + e.width / 2 - i / 2
        } : "top" == t ? {
            top: e.top - o,
            left: e.left + e.width / 2 - i / 2
        } : "left" == t ? {
            top: e.top + e.height / 2 - o / 2,
            left: e.left - i
        } : {
            top: e.top + e.height / 2 - o / 2,
            left: e.left + e.width
        }
    }, i.prototype.getViewportAdjustedDelta = function (t, e, i, o) {
        var n = {
            top: 0,
            left: 0
        };
        if (!this.$viewport) return n;
        var s = this.options.viewport && this.options.viewport.padding || 0,
            a = this.getPosition(this.$viewport);
        if (/right|left/.test(t)) {
            var r = e.top - s - a.scroll,
                l = e.top + s - a.scroll + o;
            r < a.top ? n.top = a.top - r : l > a.top + a.height && (n.top = a.top + a.height - l)
        } else {
            var h = e.left - s,
                d = e.left + s + i;
            h < a.left ? n.left = a.left - h : d > a.right && (n.left = a.left + a.width - d)
        }
        return n
    }, i.prototype.getTitle = function () {
        var t = this.$element,
            e = this.options;
        return t.attr("data-original-title") || ("function" == typeof e.title ? e.title.call(t[0]) : e.title)
    }, i.prototype.getUID = function (t) {
        do {
            t += ~~(1e6 * Math.random())
        } while (document.getElementById(t));
        return t
    }, i.prototype.tip = function () {
        if (!this.$tip && (this.$tip = t(this.options.template), 1 != this.$tip.length)) throw new Error(this.type + " `template` option must consist of exactly 1 top-level element!");
        return this.$tip
    }, i.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
    }, i.prototype.enable = function () {
        this.enabled = !0
    }, i.prototype.disable = function () {
        this.enabled = !1
    }, i.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled
    }, i.prototype.toggle = function (e) {
        var i = this;
        e && ((i = t(e.currentTarget).data("bs." + this.type)) || (i = new this.constructor(e.currentTarget, this.getDelegateOptions()), t(e.currentTarget).data("bs." + this.type, i))), e ? (i.inState.click = !i.inState.click, i.isInStateTrue() ? i.enter(i) : i.leave(i)) : i.tip().hasClass("in") ? i.leave(i) : i.enter(i)
    }, i.prototype.destroy = function () {
        var t = this;
        clearTimeout(this.timeout), this.hide(function () {
            t.$element.off("." + t.type).removeData("bs." + t.type), t.$tip && t.$tip.detach(), t.$tip = null, t.$arrow = null, t.$viewport = null, t.$element = null
        })
    };
    var o = t.fn.tooltip;
    t.fn.tooltip = e, t.fn.tooltip.Constructor = i, t.fn.tooltip.noConflict = function () {
        return t.fn.tooltip = o, this
    }
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        return this.each(function () {
            var o = t(this),
                n = o.data("bs.popover"),
                s = "object" == typeof e && e;
            !n && /destroy|hide/.test(e) || (n || o.data("bs.popover", n = new i(this, s)), "string" == typeof e && n[e]())
        })
    }
    var i = function (t, e) {
        this.init("popover", t, e)
    };
    if (!t.fn.tooltip) throw new Error("Popover requires tooltip.js");
    i.VERSION = "3.3.7", i.DEFAULTS = t.extend({}, t.fn.tooltip.Constructor.DEFAULTS, {
        placement: "right",
        trigger: "click",
        content: "",
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    }), i.prototype = t.extend({}, t.fn.tooltip.Constructor.prototype), i.prototype.constructor = i, i.prototype.getDefaults = function () {
        return i.DEFAULTS
    }, i.prototype.setContent = function () {
        var t = this.tip(),
            e = this.getTitle(),
            i = this.getContent();
        t.find(".popover-title")[this.options.html ? "html" : "text"](e), t.find(".popover-content").children().detach().end()[this.options.html ? "string" == typeof i ? "html" : "append" : "text"](i), t.removeClass("fade top bottom left right in"), t.find(".popover-title").html() || t.find(".popover-title").hide()
    }, i.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    }, i.prototype.getContent = function () {
        var t = this.$element,
            e = this.options;
        return t.attr("data-content") || ("function" == typeof e.content ? e.content.call(t[0]) : e.content)
    }, i.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find(".arrow")
    };
    var o = t.fn.popover;
    t.fn.popover = e, t.fn.popover.Constructor = i, t.fn.popover.noConflict = function () {
        return t.fn.popover = o, this
    }
}(jQuery),
function (t) {
    "use strict";

    function e(i, o) {
        this.$body = t(document.body), this.$scrollElement = t(t(i).is(document.body) ? window : i), this.options = t.extend({}, e.DEFAULTS, o), this.selector = (this.options.target || "") + " .nav li > a", this.offsets = [], this.targets = [], this.activeTarget = null, this.scrollHeight = 0, this.$scrollElement.on("scroll.bs.scrollspy", t.proxy(this.process, this)), this.refresh(), this.process()
    }

    function i(i) {
        return this.each(function () {
            var o = t(this),
                n = o.data("bs.scrollspy"),
                s = "object" == typeof i && i;
            n || o.data("bs.scrollspy", n = new e(this, s)), "string" == typeof i && n[i]()
        })
    }
    e.VERSION = "3.3.7", e.DEFAULTS = {
        offset: 10
    }, e.prototype.getScrollHeight = function () {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
    }, e.prototype.refresh = function () {
        var e = this,
            i = "offset",
            o = 0;
        this.offsets = [], this.targets = [], this.scrollHeight = this.getScrollHeight(), t.isWindow(this.$scrollElement[0]) || (i = "position", o = this.$scrollElement.scrollTop()), this.$body.find(this.selector).map(function () {
            var e = t(this),
                n = e.data("target") || e.attr("href"),
                s = /^#./.test(n) && t(n);
            return s && s.length && s.is(":visible") && [
                [s[i]().top + o, n]
            ] || null
        }).sort(function (t, e) {
            return t[0] - e[0]
        }).each(function () {
            e.offsets.push(this[0]), e.targets.push(this[1])
        })
    }, e.prototype.process = function () {
        var t, e = this.$scrollElement.scrollTop() + this.options.offset,
            i = this.getScrollHeight(),
            o = this.options.offset + i - this.$scrollElement.height(),
            n = this.offsets,
            s = this.targets,
            a = this.activeTarget;
        if (this.scrollHeight != i && this.refresh(), e >= o) return a != (t = s[s.length - 1]) && this.activate(t);
        if (a && e < n[0]) return this.activeTarget = null, this.clear();
        for (t = n.length; t--;) a != s[t] && e >= n[t] && (void 0 === n[t + 1] || e < n[t + 1]) && this.activate(s[t])
    }, e.prototype.activate = function (e) {
        this.activeTarget = e, this.clear();
        var i = this.selector + '[data-target="' + e + '"],' + this.selector + '[href="' + e + '"]',
            o = t(i).parents("li").addClass("active");
        o.parent(".dropdown-menu").length && (o = o.closest("li.dropdown").addClass("active")), o.trigger("activate.bs.scrollspy")
    }, e.prototype.clear = function () {
        t(this.selector).parentsUntil(this.options.target, ".active").removeClass("active")
    };
    var o = t.fn.scrollspy;
    t.fn.scrollspy = i, t.fn.scrollspy.Constructor = e, t.fn.scrollspy.noConflict = function () {
        return t.fn.scrollspy = o, this
    }, t(window).on("load.bs.scrollspy.data-api", function () {
        t('[data-spy="scroll"]').each(function () {
            var e = t(this);
            i.call(e, e.data())
        })
    })
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        return this.each(function () {
            var o = t(this),
                n = o.data("bs.tab");
            n || o.data("bs.tab", n = new i(this)), "string" == typeof e && n[e]()
        })
    }
    var i = function (e) {
        this.element = t(e)
    };
    i.VERSION = "3.3.7", i.TRANSITION_DURATION = 150, i.prototype.show = function () {
        var e = this.element,
            i = e.closest("ul:not(.dropdown-menu)"),
            o = e.data("target");
        if (o || (o = e.attr("href"), o = o && o.replace(/.*(?=#[^\s]*$)/, "")), !e.parent("li").hasClass("active")) {
            var n = i.find(".active:last a"),
                s = t.Event("hide.bs.tab", {
                    relatedTarget: e[0]
                }),
                a = t.Event("show.bs.tab", {
                    relatedTarget: n[0]
                });
            if (n.trigger(s), e.trigger(a), !a.isDefaultPrevented() && !s.isDefaultPrevented()) {
                var r = t(o);
                this.activate(e.closest("li"), i), this.activate(r, r.parent(), function () {
                    n.trigger({
                        type: "hidden.bs.tab",
                        relatedTarget: e[0]
                    }), e.trigger({
                        type: "shown.bs.tab",
                        relatedTarget: n[0]
                    })
                })
            }
        }
    }, i.prototype.activate = function (e, o, n) {
        function s() {
            a.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded", !1), e.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded", !0), r ? (e[0].offsetWidth, e.addClass("in")) : e.removeClass("fade"), e.parent(".dropdown-menu").length && e.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded", !0), n && n()
        }
        var a = o.find("> .active"),
            r = n && t.support.transition && (a.length && a.hasClass("fade") || !!o.find("> .fade").length);
        a.length && r ? a.one("bsTransitionEnd", s).emulateTransitionEnd(i.TRANSITION_DURATION) : s(), a.removeClass("in")
    };
    var o = t.fn.tab;
    t.fn.tab = e, t.fn.tab.Constructor = i, t.fn.tab.noConflict = function () {
        return t.fn.tab = o, this
    };
    var n = function (i) {
        i.preventDefault(), e.call(t(this), "show")
    };
    t(document).on("click.bs.tab.data-api", '[data-toggle="tab"]', n).on("click.bs.tab.data-api", '[data-toggle="pill"]', n)
}(jQuery),
function (t) {
    "use strict";

    function e(e) {
        return this.each(function () {
            var o = t(this),
                n = o.data("bs.affix"),
                s = "object" == typeof e && e;
            n || o.data("bs.affix", n = new i(this, s)), "string" == typeof e && n[e]()
        })
    }
    var i = function (e, o) {
        this.options = t.extend({}, i.DEFAULTS, o), this.$target = t(this.options.target).on("scroll.bs.affix.data-api", t.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", t.proxy(this.checkPositionWithEventLoop, this)), this.$element = t(e), this.affixed = null, this.unpin = null, this.pinnedOffset = null, this.checkPosition()
    };
    i.VERSION = "3.3.7", i.RESET = "affix affix-top affix-bottom", i.DEFAULTS = {
        offset: 0,
        target: window
    }, i.prototype.getState = function (t, e, i, o) {
        var n = this.$target.scrollTop(),
            s = this.$element.offset(),
            a = this.$target.height();
        if (null != i && "top" == this.affixed) return n < i && "top";
        if ("bottom" == this.affixed) return null != i ? !(n + this.unpin <= s.top) && "bottom" : !(n + a <= t - o) && "bottom";
        var r = null == this.affixed,
            l = r ? n : s.top,
            h = r ? a : e;
        return null != i && n <= i ? "top" : null != o && l + h >= t - o && "bottom"
    }, i.prototype.getPinnedOffset = function () {
        if (this.pinnedOffset) return this.pinnedOffset;
        this.$element.removeClass(i.RESET).addClass("affix");
        var t = this.$target.scrollTop(),
            e = this.$element.offset();
        return this.pinnedOffset = e.top - t
    }, i.prototype.checkPositionWithEventLoop = function () {
        setTimeout(t.proxy(this.checkPosition, this), 1)
    }, i.prototype.checkPosition = function () {
        if (this.$element.is(":visible")) {
            var e = this.$element.height(),
                o = this.options.offset,
                n = o.top,
                s = o.bottom,
                a = Math.max(t(document).height(), t(document.body).height());
            "object" != typeof o && (s = n = o), "function" == typeof n && (n = o.top(this.$element)), "function" == typeof s && (s = o.bottom(this.$element));
            var r = this.getState(a, e, n, s);
            if (this.affixed != r) {
                null != this.unpin && this.$element.css("top", "");
                var l = "affix" + (r ? "-" + r : ""),
                    h = t.Event(l + ".bs.affix");
                if (this.$element.trigger(h), h.isDefaultPrevented()) return;
                this.affixed = r, this.unpin = "bottom" == r ? this.getPinnedOffset() : null, this.$element.removeClass(i.RESET).addClass(l).trigger(l.replace("affix", "affixed") + ".bs.affix")
            }
            "bottom" == r && this.$element.offset({
                top: a - e - s
            })
        }
    };
    var o = t.fn.affix;
    t.fn.affix = e, t.fn.affix.Constructor = i, t.fn.affix.noConflict = function () {
        return t.fn.affix = o, this
    }, t(window).on("load", function () {
        t('[data-spy="affix"]').each(function () {
            var i = t(this),
                o = i.data();
            o.offset = o.offset || {}, null != o.offsetBottom && (o.offset.bottom = o.offsetBottom), null != o.offsetTop && (o.offset.top = o.offsetTop), e.call(i, o)
        })
    })
}(jQuery);
! function (t, e) {
    if ("function" == typeof define && define.amd) define(["moment", "jquery"], function (t, a) {
        return a.fn || (a.fn = {}), e(t, a)
    });
    else if ("object" == typeof module && module.exports) {
        var a = "undefined" != typeof window ? window.jQuery : void 0;
        a || (a = require("jquery"), a.fn || (a.fn = {}));
        var i = "undefined" != typeof window && void 0 !== window.moment ? window.moment : require("moment");
        module.exports = e(i, a)
    } else t.daterangepicker = e(t.moment, t.jQuery)
}(this, function (t, e) {
    var a = function (a, i, s) {
        if (this.parentEl = "body", this.element = e(a), this.startDate = t().startOf("day"), this.endDate = t().endOf("day"), this.minDate = !1, this.maxDate = !1, this.dateLimit = !1, this.autoApply = !1, this.singleDatePicker = !1, this.showDropdowns = !1, this.showWeekNumbers = !1, this.showISOWeekNumbers = !1, this.showCustomRangeLabel = !0, this.timePicker = !1, this.timePicker24Hour = !1, this.timePickerIncrement = 1, this.timePickerSeconds = !1, this.linkedCalendars = !0, this.autoUpdateInput = !0, this.alwaysShowCalendars = !1, this.ranges = {}, this.opens = "right", this.element.hasClass("pull-right") && (this.opens = "left"), this.drops = "down", this.element.hasClass("dropup") && (this.drops = "up"), this.buttonClasses = "btn btn-sm", this.applyClass = "btn-success", this.cancelClass = "btn-default", this.locale = {
                direction: "ltr",
                format: t.localeData().longDateFormat("L"),
                separator: " - ",
                applyLabel: "Apply",
                cancelLabel: "Cancel",
                weekLabel: "W",
                customRangeLabel: "Custom Range",
                daysOfWeek: t.weekdaysMin(),
                monthNames: t.monthsShort(),
                firstDay: t.localeData().firstDayOfWeek()
            }, this.callback = function () {}, this.isShowing = !1, this.leftCalendar = {}, this.rightCalendar = {}, "object" == typeof i && null !== i || (i = {}), i = e.extend(this.element.data(), i), "string" == typeof i.template || i.template instanceof e || (i.template = '<div class="daterangepicker dropdown-menu"><div class="calendar left"><div class="daterangepicker_input"><input class="input-mini form-control" type="text" name="daterangepicker_start" value="" /><i class="fa fa-calendar glyphicon glyphicon-calendar"></i><div class="calendar-time"><div></div><i class="fa fa-clock-o glyphicon glyphicon-time"></i></div></div><div class="calendar-table"></div></div><div class="calendar right"><div class="daterangepicker_input"><input class="input-mini form-control" type="text" name="daterangepicker_end" value="" /><i class="fa fa-calendar glyphicon glyphicon-calendar"></i><div class="calendar-time"><div></div><i class="fa fa-clock-o glyphicon glyphicon-time"></i></div></div><div class="calendar-table"></div></div><div class="ranges"><div class="range_inputs"><button class="applyBtn" disabled="disabled" type="button"></button> <button class="cancelBtn" type="button"></button></div></div></div>'), this.parentEl = e(i.parentEl && e(i.parentEl).length ? i.parentEl : this.parentEl), this.container = e(i.template).appendTo(this.parentEl), "object" == typeof i.locale && ("string" == typeof i.locale.direction && (this.locale.direction = i.locale.direction), "string" == typeof i.locale.format && (this.locale.format = i.locale.format), "string" == typeof i.locale.separator && (this.locale.separator = i.locale.separator), "object" == typeof i.locale.daysOfWeek && (this.locale.daysOfWeek = i.locale.daysOfWeek.slice()), "object" == typeof i.locale.monthNames && (this.locale.monthNames = i.locale.monthNames.slice()), "number" == typeof i.locale.firstDay && (this.locale.firstDay = i.locale.firstDay), "string" == typeof i.locale.applyLabel && (this.locale.applyLabel = i.locale.applyLabel), "string" == typeof i.locale.cancelLabel && (this.locale.cancelLabel = i.locale.cancelLabel), "string" == typeof i.locale.weekLabel && (this.locale.weekLabel = i.locale.weekLabel), "string" == typeof i.locale.customRangeLabel)) {
            var n = document.createElement("textarea");
            n.innerHTML = i.locale.customRangeLabel;
            var r = n.value;
            this.locale.customRangeLabel = r
        }
        if (this.container.addClass(this.locale.direction), "string" == typeof i.startDate && (this.startDate = t(i.startDate, this.locale.format)), "string" == typeof i.endDate && (this.endDate = t(i.endDate, this.locale.format)), "string" == typeof i.minDate && (this.minDate = t(i.minDate, this.locale.format)), "string" == typeof i.maxDate && (this.maxDate = t(i.maxDate, this.locale.format)), "object" == typeof i.startDate && (this.startDate = t(i.startDate)), "object" == typeof i.endDate && (this.endDate = t(i.endDate)), "object" == typeof i.minDate && (this.minDate = t(i.minDate)), "object" == typeof i.maxDate && (this.maxDate = t(i.maxDate)), this.minDate && this.startDate.isBefore(this.minDate) && (this.startDate = this.minDate.clone()), this.maxDate && this.endDate.isAfter(this.maxDate) && (this.endDate = this.maxDate.clone()), "string" == typeof i.applyClass && (this.applyClass = i.applyClass), "string" == typeof i.cancelClass && (this.cancelClass = i.cancelClass), "object" == typeof i.dateLimit && (this.dateLimit = i.dateLimit), "string" == typeof i.opens && (this.opens = i.opens), "string" == typeof i.drops && (this.drops = i.drops), "boolean" == typeof i.showWeekNumbers && (this.showWeekNumbers = i.showWeekNumbers), "boolean" == typeof i.showISOWeekNumbers && (this.showISOWeekNumbers = i.showISOWeekNumbers), "string" == typeof i.buttonClasses && (this.buttonClasses = i.buttonClasses), "object" == typeof i.buttonClasses && (this.buttonClasses = i.buttonClasses.join(" ")), "boolean" == typeof i.showDropdowns && (this.showDropdowns = i.showDropdowns), "boolean" == typeof i.showCustomRangeLabel && (this.showCustomRangeLabel = i.showCustomRangeLabel), "boolean" == typeof i.singleDatePicker && (this.singleDatePicker = i.singleDatePicker, this.singleDatePicker && (this.endDate = this.startDate.clone())), "boolean" == typeof i.timePicker && (this.timePicker = i.timePicker), "boolean" == typeof i.timePickerSeconds && (this.timePickerSeconds = i.timePickerSeconds), "number" == typeof i.timePickerIncrement && (this.timePickerIncrement = i.timePickerIncrement), "boolean" == typeof i.timePicker24Hour && (this.timePicker24Hour = i.timePicker24Hour), "boolean" == typeof i.autoApply && (this.autoApply = i.autoApply), "boolean" == typeof i.autoUpdateInput && (this.autoUpdateInput = i.autoUpdateInput), "boolean" == typeof i.linkedCalendars && (this.linkedCalendars = i.linkedCalendars), "function" == typeof i.isInvalidDate && (this.isInvalidDate = i.isInvalidDate), "function" == typeof i.isCustomDate && (this.isCustomDate = i.isCustomDate), "boolean" == typeof i.alwaysShowCalendars && (this.alwaysShowCalendars = i.alwaysShowCalendars), 0 != this.locale.firstDay)
            for (var o = this.locale.firstDay; o > 0;) this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift()), o--;
        var h, l, c;
        if (void 0 === i.startDate && void 0 === i.endDate && e(this.element).is("input[type=text]")) {
            var d = e(this.element).val(),
                m = d.split(this.locale.separator);
            h = l = null, 2 == m.length ? (h = t(m[0], this.locale.format), l = t(m[1], this.locale.format)) : this.singleDatePicker && "" !== d && (h = t(d, this.locale.format), l = t(d, this.locale.format)), null !== h && null !== l && (this.setStartDate(h), this.setEndDate(l))
        }
        if ("object" == typeof i.ranges) {
            for (c in i.ranges) {
                h = "string" == typeof i.ranges[c][0] ? t(i.ranges[c][0], this.locale.format) : t(i.ranges[c][0]), l = "string" == typeof i.ranges[c][1] ? t(i.ranges[c][1], this.locale.format) : t(i.ranges[c][1]), this.minDate && h.isBefore(this.minDate) && (h = this.minDate.clone());
                var f = this.maxDate;
                if (this.dateLimit && f && h.clone().add(this.dateLimit).isAfter(f) && (f = h.clone().add(this.dateLimit)), f && l.isAfter(f) && (l = f.clone()), !(this.minDate && l.isBefore(this.minDate, this.timepicker ? "minute" : "day") || f && h.isAfter(f, this.timepicker ? "minute" : "day"))) {
                    var n = document.createElement("textarea");
                    n.innerHTML = c;
                    var r = n.value;
                    this.ranges[r] = [h, l]
                }
            }
            var p = "<ul>";
            for (c in this.ranges) p += '<li data-range-key="' + c + '">' + c + "</li>";
            this.showCustomRangeLabel && (p += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + "</li>"), p += "</ul>", this.container.find(".ranges").prepend(p)
        }
        "function" == typeof s && (this.callback = s), this.timePicker || (this.startDate = this.startDate.startOf("day"), this.endDate = this.endDate.endOf("day"), this.container.find(".calendar-time").hide()), this.timePicker && this.autoApply && (this.autoApply = !1), this.autoApply && "object" != typeof i.ranges ? this.container.find(".ranges").hide() : this.autoApply && this.container.find(".applyBtn, .cancelBtn").addClass("hide"), this.singleDatePicker && (this.container.addClass("single"), this.container.find(".calendar.left").addClass("single"), this.container.find(".calendar.left").show(), this.container.find(".calendar.right").hide(), this.container.find(".daterangepicker_input input, .daterangepicker_input > i").hide(), this.timePicker ? this.container.find(".ranges ul").hide() : this.container.find(".ranges").hide()), (void 0 === i.ranges && !this.singleDatePicker || this.alwaysShowCalendars) && this.container.addClass("show-calendar"), this.container.addClass("opens" + this.opens), void 0 !== i.ranges && "right" == this.opens && this.container.find(".ranges").prependTo(this.container.find(".calendar.left").parent()), this.container.find(".applyBtn, .cancelBtn").addClass(this.buttonClasses), this.applyClass.length && this.container.find(".applyBtn").addClass(this.applyClass), this.cancelClass.length && this.container.find(".cancelBtn").addClass(this.cancelClass), this.container.find(".applyBtn").html(this.locale.applyLabel), this.container.find(".cancelBtn").html(this.locale.cancelLabel), this.container.find(".calendar").on("click.daterangepicker", ".prev", e.proxy(this.clickPrev, this)).on("click.daterangepicker", ".next", e.proxy(this.clickNext, this)).on("mousedown.daterangepicker", "td.available", e.proxy(this.clickDate, this)).on("mouseenter.daterangepicker", "td.available", e.proxy(this.hoverDate, this)).on("mouseleave.daterangepicker", "td.available", e.proxy(this.updateFormInputs, this)).on("change.daterangepicker", "select.yearselect", e.proxy(this.monthOrYearChanged, this)).on("change.daterangepicker", "select.monthselect", e.proxy(this.monthOrYearChanged, this)).on("change.daterangepicker", "select.hourselect,select.minuteselect,select.secondselect,select.ampmselect", e.proxy(this.timeChanged, this)).on("click.daterangepicker", ".daterangepicker_input input", e.proxy(this.showCalendars, this)).on("focus.daterangepicker", ".daterangepicker_input input", e.proxy(this.formInputsFocused, this)).on("blur.daterangepicker", ".daterangepicker_input input", e.proxy(this.formInputsBlurred, this)).on("change.daterangepicker", ".daterangepicker_input input", e.proxy(this.formInputsChanged, this)).on("keydown.daterangepicker", ".daterangepicker_input input", e.proxy(this.formInputsKeydown, this)), this.container.find(".ranges").on("click.daterangepicker", "button.applyBtn", e.proxy(this.clickApply, this)).on("click.daterangepicker", "button.cancelBtn", e.proxy(this.clickCancel, this)).on("click.daterangepicker", "li", e.proxy(this.clickRange, this)).on("mouseenter.daterangepicker", "li", e.proxy(this.hoverRange, this)).on("mouseleave.daterangepicker", "li", e.proxy(this.updateFormInputs, this)), this.element.is("input") || this.element.is("button") ? this.element.on({
            "click.daterangepicker": e.proxy(this.show, this),
            "focus.daterangepicker": e.proxy(this.show, this),
            "keyup.daterangepicker": e.proxy(this.elementChanged, this),
            "keydown.daterangepicker": e.proxy(this.keydown, this)
        }) : (this.element.on("click.daterangepicker", e.proxy(this.toggle, this)), this.element.on("keydown.daterangepicker", e.proxy(this.toggle, this))), this.element.is("input") && !this.singleDatePicker && this.autoUpdateInput ? (this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format)), this.element.trigger("change")) : this.element.is("input") && this.autoUpdateInput && (this.element.val(this.startDate.format(this.locale.format)), this.element.trigger("change"))
    };
    return a.prototype = {
        constructor: a,
        setStartDate: function (e) {
            "string" == typeof e && (this.startDate = t(e, this.locale.format)), "object" == typeof e && (this.startDate = t(e)), this.timePicker || (this.startDate = this.startDate.startOf("day")), this.timePicker && this.timePickerIncrement && this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement), this.minDate && this.startDate.isBefore(this.minDate) && (this.startDate = this.minDate.clone(), this.timePicker && this.timePickerIncrement && this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement)), this.maxDate && this.startDate.isAfter(this.maxDate) && (this.startDate = this.maxDate.clone(), this.timePicker && this.timePickerIncrement && this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement)), this.isShowing || this.updateElement(), this.updateMonthsInView()
        },
        setEndDate: function (e) {
            "string" == typeof e && (this.endDate = t(e, this.locale.format)), "object" == typeof e && (this.endDate = t(e)), this.timePicker || (this.endDate = this.endDate.add(1, "d").startOf("day").subtract(1, "second")), this.timePicker && this.timePickerIncrement && this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement), this.endDate.isBefore(this.startDate) && (this.endDate = this.startDate.clone()), this.maxDate && this.endDate.isAfter(this.maxDate) && (this.endDate = this.maxDate.clone()), this.dateLimit && this.startDate.clone().add(this.dateLimit).isBefore(this.endDate) && (this.endDate = this.startDate.clone().add(this.dateLimit)), this.previousRightTime = this.endDate.clone(), this.isShowing || this.updateElement(), this.updateMonthsInView()
        },
        isInvalidDate: function () {
            return !1
        },
        isCustomDate: function () {
            return !1
        },
        updateView: function () {
            this.timePicker && (this.renderTimePicker("left"), this.renderTimePicker("right"), this.endDate ? this.container.find(".right .calendar-time select").removeAttr("disabled").removeClass("disabled") : this.container.find(".right .calendar-time select").attr("disabled", "disabled").addClass("disabled")), this.endDate ? (this.container.find('input[name="daterangepicker_end"]').removeClass("active"), this.container.find('input[name="daterangepicker_start"]').addClass("active")) : (this.container.find('input[name="daterangepicker_end"]').addClass("active"), this.container.find('input[name="daterangepicker_start"]').removeClass("active")), this.updateMonthsInView(), this.updateCalendars(), this.updateFormInputs()
        },
        updateMonthsInView: function () {
            if (this.endDate) {
                if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month && (this.startDate.format("YYYY-MM") == this.leftCalendar.month.format("YYYY-MM") || this.startDate.format("YYYY-MM") == this.rightCalendar.month.format("YYYY-MM")) && (this.endDate.format("YYYY-MM") == this.leftCalendar.month.format("YYYY-MM") || this.endDate.format("YYYY-MM") == this.rightCalendar.month.format("YYYY-MM"))) return;
                this.leftCalendar.month = this.startDate.clone().date(2), this.linkedCalendars || this.endDate.month() == this.startDate.month() && this.endDate.year() == this.startDate.year() ? this.rightCalendar.month = this.startDate.clone().date(2).add(1, "month") : this.rightCalendar.month = this.endDate.clone().date(2)
            } else this.leftCalendar.month.format("YYYY-MM") != this.startDate.format("YYYY-MM") && this.rightCalendar.month.format("YYYY-MM") != this.startDate.format("YYYY-MM") && (this.leftCalendar.month = this.startDate.clone().date(2), this.rightCalendar.month = this.startDate.clone().date(2).add(1, "month"));
            this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate && (this.rightCalendar.month = this.maxDate.clone().date(2), this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, "month"))
        },
        updateCalendars: function () {
            if (this.timePicker) {
                var t, e, a;
                if (this.endDate) {
                    if (t = parseInt(this.container.find(".left .hourselect").val(), 10), e = parseInt(this.container.find(".left .minuteselect").val(), 10), a = this.timePickerSeconds ? parseInt(this.container.find(".left .secondselect").val(), 10) : 0, !this.timePicker24Hour) {
                        var i = this.container.find(".left .ampmselect").val();
                        "PM" === i && t < 12 && (t += 12), "AM" === i && 12 === t && (t = 0)
                    }
                } else if (t = parseInt(this.container.find(".right .hourselect").val(), 10), e = parseInt(this.container.find(".right .minuteselect").val(), 10), a = this.timePickerSeconds ? parseInt(this.container.find(".right .secondselect").val(), 10) : 0, !this.timePicker24Hour) {
                    var i = this.container.find(".right .ampmselect").val();
                    "PM" === i && t < 12 && (t += 12), "AM" === i && 12 === t && (t = 0)
                }
                this.leftCalendar.month.hour(t).minute(e).second(a), this.rightCalendar.month.hour(t).minute(e).second(a)
            }
            this.renderCalendar("left"), this.renderCalendar("right"), this.container.find(".ranges li").removeClass("active"), null != this.endDate && this.calculateChosenLabel()
        },
        renderCalendar: function (a) {
            var i = "left" == a ? this.leftCalendar : this.rightCalendar,
                s = i.month.month(),
                n = i.month.year(),
                r = i.month.hour(),
                o = i.month.minute(),
                h = i.month.second(),
                l = t([n, s]).daysInMonth(),
                c = t([n, s, 1]),
                d = t([n, s, l]),
                m = t(c).subtract(1, "month").month(),
                f = t(c).subtract(1, "month").year(),
                p = t([f, m]).daysInMonth(),
                u = c.day(),
                i = [];
            i.firstDay = c, i.lastDay = d;
            for (var g = 0; g < 6; g++) i[g] = [];
            var D = p - u + this.locale.firstDay + 1;
            D > p && (D -= 7), u == this.locale.firstDay && (D = p - 6);
            for (var k, y, v = t([f, m, D, 12, o, h]), g = 0, k = 0, y = 0; g < 42; g++, k++, v = t(v).add(24, "hour")) g > 0 && k % 7 == 0 && (k = 0, y++), i[y][k] = v.clone().hour(r).minute(o).second(h), v.hour(12), this.minDate && i[y][k].format("YYYY-MM-DD") == this.minDate.format("YYYY-MM-DD") && i[y][k].isBefore(this.minDate) && "left" == a && (i[y][k] = this.minDate.clone()), this.maxDate && i[y][k].format("YYYY-MM-DD") == this.maxDate.format("YYYY-MM-DD") && i[y][k].isAfter(this.maxDate) && "right" == a && (i[y][k] = this.maxDate.clone());
            "left" == a ? this.leftCalendar.calendar = i : this.rightCalendar.calendar = i;
            var C = "left" == a ? this.minDate : this.startDate,
                b = this.maxDate,
                w = ("left" == a ? this.startDate : this.endDate, "ltr" == this.locale.direction ? {
                    left: "chevron-left",
                    right: "chevron-right"
                } : {
                    left: "chevron-right",
                    right: "chevron-left"
                }),
                Y = '<table class="table-condensed">';
            Y += "<thead>", Y += "<tr>", (this.showWeekNumbers || this.showISOWeekNumbers) && (Y += "<th></th>"), C && !C.isBefore(i.firstDay) || this.linkedCalendars && "left" != a ? Y += "<th></th>" : Y += '<th class="prev available"><i class="fa fa-' + w.left + " glyphicon glyphicon-" + w.left + '"></i></th>';
            var P = this.locale.monthNames[i[1][1].month()] + i[1][1].format(" YYYY");
            if (this.showDropdowns) {
                for (var M = i[1][1].month(), x = i[1][1].year(), I = b && b.year() || x + 5, L = C && C.year() || x - 50, S = x == L, A = x == I, _ = '<select class="monthselect">', B = 0; B < 12; B++)(!S || B >= C.month()) && (!A || B <= b.month()) ? _ += "<option value='" + B + "'" + (B === M ? " selected='selected'" : "") + ">" + this.locale.monthNames[B] + "</option>" : _ += "<option value='" + B + "'" + (B === M ? " selected='selected'" : "") + " disabled='disabled'>" + this.locale.monthNames[B] + "</option>";
                _ += "</select>";
                for (var E = '<select class="yearselect">', W = L; W <= I; W++) E += '<option value="' + W + '"' + (W === x ? ' selected="selected"' : "") + ">" + W + "</option>";
                E += "</select>", P = _ + E
            }
            if (Y += '<th colspan="5" class="month">' + P + "</th>", b && !b.isAfter(i.lastDay) || this.linkedCalendars && "right" != a && !this.singleDatePicker ? Y += "<th></th>" : Y += '<th class="next available"><i class="fa fa-' + w.right + " glyphicon glyphicon-" + w.right + '"></i></th>', Y += "</tr>", Y += "<tr>", (this.showWeekNumbers || this.showISOWeekNumbers) && (Y += '<th class="week">' + this.locale.weekLabel + "</th>"), e.each(this.locale.daysOfWeek, function (t, e) {
                    Y += "<th>" + e + "</th>"
                }), Y += "</tr>", Y += "</thead>", Y += "<tbody>", null == this.endDate && this.dateLimit) {
                var O = this.startDate.clone().add(this.dateLimit).endOf("day");
                b && !O.isBefore(b) || (b = O)
            }
            for (var y = 0; y < 6; y++) {
                Y += "<tr>", this.showWeekNumbers ? Y += '<td class="week">' + i[y][0].week() + "</td>" : this.showISOWeekNumbers && (Y += '<td class="week">' + i[y][0].isoWeek() + "</td>");
                for (var k = 0; k < 7; k++) {
                    var N = [];
                    i[y][k].isSame(new Date, "day") && N.push("today"), i[y][k].isoWeekday() > 5 && N.push("weekend"), i[y][k].month() != i[1][1].month() && N.push("off"), this.minDate && i[y][k].isBefore(this.minDate, "day") && N.push("off", "disabled"), b && i[y][k].isAfter(b, "day") && N.push("off", "disabled"), this.isInvalidDate(i[y][k]) && N.push("off", "disabled"), i[y][k].format("YYYY-MM-DD") == this.startDate.format("YYYY-MM-DD") && N.push("active", "start-date"), null != this.endDate && i[y][k].format("YYYY-MM-DD") == this.endDate.format("YYYY-MM-DD") && N.push("active", "end-date"), null != this.endDate && i[y][k] > this.startDate && i[y][k] < this.endDate && N.push("in-range");
                    var R = this.isCustomDate(i[y][k]);
                    !1 !== R && ("string" == typeof R ? N.push(R) : Array.prototype.push.apply(N, R));
                    for (var j = "", H = !1, g = 0; g < N.length; g++) j += N[g] + " ", "disabled" == N[g] && (H = !0);
                    H || (j += "available"), Y += '<td class="' + j.replace(/^\s+|\s+$/g, "") + '" data-title="r' + y + "c" + k + '">' + i[y][k].date() + "</td>"
                }
                Y += "</tr>"
            }
            Y += "</tbody>", Y += "</table>", this.container.find(".calendar." + a + " .calendar-table").html(Y)
        },
        renderTimePicker: function (t) {
            if ("right" != t || this.endDate) {
                var e, a, i, s = this.maxDate;
                if (!this.dateLimit || this.maxDate && !this.startDate.clone().add(this.dateLimit).isAfter(this.maxDate) || (s = this.startDate.clone().add(this.dateLimit)), "left" == t) a = this.startDate.clone(), i = this.minDate;
                else if ("right" == t) {
                    a = this.endDate.clone(), i = this.startDate;
                    var n = this.container.find(".calendar.right .calendar-time div");
                    if ("" != n.html() && (a.hour(n.find(".hourselect option:selected").val() || a.hour()), a.minute(n.find(".minuteselect option:selected").val() || a.minute()), a.second(n.find(".secondselect option:selected").val() || a.second()), !this.timePicker24Hour)) {
                        var r = n.find(".ampmselect option:selected").val();
                        "PM" === r && a.hour() < 12 && a.hour(a.hour() + 12), "AM" === r && 12 === a.hour() && a.hour(0)
                    }
                    a.isBefore(this.startDate) && (a = this.startDate.clone()), s && a.isAfter(s) && (a = s.clone())
                }
                e = '<select class="hourselect">';
                for (var o = this.timePicker24Hour ? 0 : 1, h = this.timePicker24Hour ? 23 : 12, l = o; l <= h; l++) {
                    var c = l;
                    this.timePicker24Hour || (c = a.hour() >= 12 ? 12 == l ? 12 : l + 12 : 12 == l ? 0 : l);
                    var d = a.clone().hour(c),
                        m = !1;
                    i && d.minute(59).isBefore(i) && (m = !0), s && d.minute(0).isAfter(s) && (m = !0), c != a.hour() || m ? e += m ? '<option value="' + l + '" disabled="disabled" class="disabled">' + l + "</option>" : '<option value="' + l + '">' + l + "</option>" : e += '<option value="' + l + '" selected="selected">' + l + "</option>"
                }
                e += "</select> ", e += ': <select class="minuteselect">';
                for (var l = 0; l < 60; l += this.timePickerIncrement) {
                    var f = l < 10 ? "0" + l : l,
                        d = a.clone().minute(l),
                        m = !1;
                    i && d.second(59).isBefore(i) && (m = !0), s && d.second(0).isAfter(s) && (m = !0), a.minute() != l || m ? e += m ? '<option value="' + l + '" disabled="disabled" class="disabled">' + f + "</option>" : '<option value="' + l + '">' + f + "</option>" : e += '<option value="' + l + '" selected="selected">' + f + "</option>"
                }
                if (e += "</select> ", this.timePickerSeconds) {
                    e += ': <select class="secondselect">';
                    for (var l = 0; l < 60; l++) {
                        var f = l < 10 ? "0" + l : l,
                            d = a.clone().second(l),
                            m = !1;
                        i && d.isBefore(i) && (m = !0), s && d.isAfter(s) && (m = !0), a.second() != l || m ? e += m ? '<option value="' + l + '" disabled="disabled" class="disabled">' + f + "</option>" : '<option value="' + l + '">' + f + "</option>" : e += '<option value="' + l + '" selected="selected">' + f + "</option>"
                    }
                    e += "</select> "
                }
                if (!this.timePicker24Hour) {
                    e += '<select class="ampmselect">';
                    var p = "",
                        u = "";
                    i && a.clone().hour(12).minute(0).second(0).isBefore(i) && (p = ' disabled="disabled" class="disabled"'), s && a.clone().hour(0).minute(0).second(0).isAfter(s) && (u = ' disabled="disabled" class="disabled"'), a.hour() >= 12 ? e += '<option value="AM"' + p + '>AM</option><option value="PM" selected="selected"' + u + ">PM</option>" : e += '<option value="AM" selected="selected"' + p + '>AM</option><option value="PM"' + u + ">PM</option>", e += "</select>"
                }
                this.container.find(".calendar." + t + " .calendar-time div").html(e)
            }
        },
        updateFormInputs: function () {
            this.container.find("input[name=daterangepicker_start]").is(":focus") || this.container.find("input[name=daterangepicker_end]").is(":focus") || (this.container.find("input[name=daterangepicker_start]").val(this.startDate.format(this.locale.format)), this.endDate && this.container.find("input[name=daterangepicker_end]").val(this.endDate.format(this.locale.format)), this.singleDatePicker || this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)) ? this.container.find("button.applyBtn").removeAttr("disabled") : this.container.find("button.applyBtn").attr("disabled", "disabled"))
        },
        move: function () {
            var t, a = {
                    top: 0,
                    left: 0
                },
                i = e(window).width();
            this.parentEl.is("body") || (a = {
                top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                left: this.parentEl.offset().left - this.parentEl.scrollLeft()
            }, i = this.parentEl[0].clientWidth + this.parentEl.offset().left), t = "up" == this.drops ? this.element.offset().top - this.container.outerHeight() - a.top : this.element.offset().top + this.element.outerHeight() - a.top, this.container["up" == this.drops ? "addClass" : "removeClass"]("dropup"), "left" == this.opens ? (this.container.css({
                top: t,
                right: i - this.element.offset().left - this.element.outerWidth(),
                left: "auto"
            }), this.container.offset().left < 0 && this.container.css({
                right: "auto",
                left: 9
            })) : "center" == this.opens ? (this.container.css({
                top: t,
                left: this.element.offset().left - a.left + this.element.outerWidth() / 2 - this.container.outerWidth() / 2,
                right: "auto"
            }), this.container.offset().left < 0 && this.container.css({
                right: "auto",
                left: 9
            })) : (this.container.css({
                top: t,
                left: this.element.offset().left - a.left,
                right: "auto"
            }), this.container.offset().left + this.container.outerWidth() > e(window).width() && this.container.css({
                left: "auto",
                right: 0
            }))
        },
        show: function (t) {
            this.isShowing || (this._outsideClickProxy = e.proxy(function (t) {
                this.outsideClick(t)
            }, this), e(document).on("mousedown.daterangepicker", this._outsideClickProxy).on("touchend.daterangepicker", this._outsideClickProxy).on("click.daterangepicker", "[data-toggle=dropdown]", this._outsideClickProxy).on("focusin.daterangepicker", this._outsideClickProxy), e(window).on("resize.daterangepicker", e.proxy(function (t) {
                this.move(t)
            }, this)), this.oldStartDate = this.startDate.clone(), this.oldEndDate = this.endDate.clone(), this.previousRightTime = this.endDate.clone(), this.updateView(), this.container.show(), this.move(), this.element.trigger("show.daterangepicker", this), this.isShowing = !0)
        },
        hide: function (t) {
            this.isShowing && (this.endDate || (this.startDate = this.oldStartDate.clone(), this.endDate = this.oldEndDate.clone()), this.startDate.isSame(this.oldStartDate) && this.endDate.isSame(this.oldEndDate) || this.callback(this.startDate, this.endDate, this.chosenLabel), this.updateElement(), e(document).off(".daterangepicker"), e(window).off(".daterangepicker"), this.container.hide(), this.element.trigger("hide.daterangepicker", this), this.isShowing = !1)
        },
        toggle: function (t) {
            this.isShowing ? this.hide() : this.show()
        },
        outsideClick: function (t) {
            var a = e(t.target);
            "focusin" == t.type || a.closest(this.element).length || a.closest(this.container).length || a.closest(".calendar-table").length || (this.hide(), this.element.trigger("outsideClick.daterangepicker", this))
        },
        showCalendars: function () {
            this.container.addClass("show-calendar"), this.move(), this.element.trigger("showCalendar.daterangepicker", this)
        },
        hideCalendars: function () {
            this.container.removeClass("show-calendar"), this.element.trigger("hideCalendar.daterangepicker", this)
        },
        hoverRange: function (t) {
            if (!this.container.find("input[name=daterangepicker_start]").is(":focus") && !this.container.find("input[name=daterangepicker_end]").is(":focus")) {
                var e = t.target.getAttribute("data-range-key");
                if (e == this.locale.customRangeLabel) this.updateView();
                else {
                    var a = this.ranges[e];
                    this.container.find("input[name=daterangepicker_start]").val(a[0].format(this.locale.format)), this.container.find("input[name=daterangepicker_end]").val(a[1].format(this.locale.format))
                }
            }
        },
        clickRange: function (t) {
            var e = t.target.getAttribute("data-range-key");
            if (this.chosenLabel = e, e == this.locale.customRangeLabel) this.showCalendars();
            else {
                var a = this.ranges[e];
                this.startDate = a[0], this.endDate = a[1], this.timePicker || (this.startDate.startOf("day"), this.endDate.endOf("day")), this.alwaysShowCalendars || this.hideCalendars(), this.clickApply()
            }
        },
        clickPrev: function (t) {
            e(t.target).parents(".calendar").hasClass("left") ? (this.leftCalendar.month.subtract(1, "month"), this.linkedCalendars && this.rightCalendar.month.subtract(1, "month")) : this.rightCalendar.month.subtract(1, "month"), this.updateCalendars()
        },
        clickNext: function (t) {
            e(t.target).parents(".calendar").hasClass("left") ? this.leftCalendar.month.add(1, "month") : (this.rightCalendar.month.add(1, "month"), this.linkedCalendars && this.leftCalendar.month.add(1, "month")), this.updateCalendars()
        },
        hoverDate: function (t) {
            if (e(t.target).hasClass("available")) {
                var a = e(t.target).attr("data-title"),
                    i = a.substr(1, 1),
                    s = a.substr(3, 1),
                    n = e(t.target).parents(".calendar"),
                    r = n.hasClass("left") ? this.leftCalendar.calendar[i][s] : this.rightCalendar.calendar[i][s];
                this.endDate && !this.container.find("input[name=daterangepicker_start]").is(":focus") ? this.container.find("input[name=daterangepicker_start]").val(r.format(this.locale.format)) : this.endDate || this.container.find("input[name=daterangepicker_end]").is(":focus") || this.container.find("input[name=daterangepicker_end]").val(r.format(this.locale.format));
                var o = this.leftCalendar,
                    h = this.rightCalendar,
                    l = this.startDate;
                this.endDate || this.container.find(".calendar tbody td").each(function (t, a) {
                    if (!e(a).hasClass("week")) {
                        var i = e(a).attr("data-title"),
                            s = i.substr(1, 1),
                            n = i.substr(3, 1),
                            c = e(a).parents(".calendar"),
                            d = c.hasClass("left") ? o.calendar[s][n] : h.calendar[s][n];
                        d.isAfter(l) && d.isBefore(r) || d.isSame(r, "day") ? e(a).addClass("in-range") : e(a).removeClass("in-range")
                    }
                })
            }
        },
        clickDate: function (t) {
            if (e(t.target).hasClass("available")) {
                var a = e(t.target).attr("data-title"),
                    i = a.substr(1, 1),
                    s = a.substr(3, 1),
                    n = e(t.target).parents(".calendar"),
                    r = n.hasClass("left") ? this.leftCalendar.calendar[i][s] : this.rightCalendar.calendar[i][s];
                if (this.endDate || r.isBefore(this.startDate, "day")) {
                    if (this.timePicker) {
                        var o = parseInt(this.container.find(".left .hourselect").val(), 10);
                        if (!this.timePicker24Hour) {
                            var h = this.container.find(".left .ampmselect").val();
                            "PM" === h && o < 12 && (o += 12), "AM" === h && 12 === o && (o = 0)
                        }
                        var l = parseInt(this.container.find(".left .minuteselect").val(), 10),
                            c = this.timePickerSeconds ? parseInt(this.container.find(".left .secondselect").val(), 10) : 0;
                        r = r.clone().hour(o).minute(l).second(c)
                    }
                    this.endDate = null, this.setStartDate(r.clone())
                } else if (!this.endDate && r.isBefore(this.startDate)) this.setEndDate(this.startDate.clone());
                else {
                    if (this.timePicker) {
                        var o = parseInt(this.container.find(".right .hourselect").val(), 10);
                        if (!this.timePicker24Hour) {
                            var h = this.container.find(".right .ampmselect").val();
                            "PM" === h && o < 12 && (o += 12), "AM" === h && 12 === o && (o = 0)
                        }
                        var l = parseInt(this.container.find(".right .minuteselect").val(), 10),
                            c = this.timePickerSeconds ? parseInt(this.container.find(".right .secondselect").val(), 10) : 0;
                        r = r.clone().hour(o).minute(l).second(c)
                    }
                    this.setEndDate(r.clone()), this.autoApply && (this.calculateChosenLabel(), this.clickApply())
                }
                this.singleDatePicker && (this.setEndDate(this.startDate), this.timePicker || this.clickApply()), this.updateView(), t.stopPropagation()
            }
        },
        calculateChosenLabel: function () {
            var t = !0,
                e = 0;
            for (var a in this.ranges) {
                if (this.timePicker) {
                    var i = this.timePickerSeconds ? "YYYY-MM-DD hh:mm:ss" : "YYYY-MM-DD hh:mm";
                    if (this.startDate.format(i) == this.ranges[a][0].format(i) && this.endDate.format(i) == this.ranges[a][1].format(i)) {
                        t = !1, this.chosenLabel = this.container.find(".ranges li:eq(" + e + ")").addClass("active").html();
                        break
                    }
                } else if (this.startDate.format("YYYY-MM-DD") == this.ranges[a][0].format("YYYY-MM-DD") && this.endDate.format("YYYY-MM-DD") == this.ranges[a][1].format("YYYY-MM-DD")) {
                    t = !1, this.chosenLabel = this.container.find(".ranges li:eq(" + e + ")").addClass("active").html();
                    break
                }
                e++
            }
            t && (this.showCustomRangeLabel ? this.chosenLabel = this.container.find(".ranges li:last").addClass("active").html() : this.chosenLabel = null, this.showCalendars())
        },
        clickApply: function (t) {
            this.hide(), this.element.trigger("apply.daterangepicker", this)
        },
        clickCancel: function (t) {
            this.startDate = this.oldStartDate, this.endDate = this.oldEndDate, this.hide(), this.element.trigger("cancel.daterangepicker", this)
        },
        monthOrYearChanged: function (t) {
            var a = e(t.target).closest(".calendar").hasClass("left"),
                i = a ? "left" : "right",
                s = this.container.find(".calendar." + i),
                n = parseInt(s.find(".monthselect").val(), 10),
                r = s.find(".yearselect").val();
            a || (r < this.startDate.year() || r == this.startDate.year() && n < this.startDate.month()) && (n = this.startDate.month(), r = this.startDate.year()), this.minDate && (r < this.minDate.year() || r == this.minDate.year() && n < this.minDate.month()) && (n = this.minDate.month(), r = this.minDate.year()), this.maxDate && (r > this.maxDate.year() || r == this.maxDate.year() && n > this.maxDate.month()) && (n = this.maxDate.month(), r = this.maxDate.year()), a ? (this.leftCalendar.month.month(n).year(r), this.linkedCalendars && (this.rightCalendar.month = this.leftCalendar.month.clone().add(1, "month"))) : (this.rightCalendar.month.month(n).year(r),
                this.linkedCalendars && (this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, "month"))), this.updateCalendars()
        },
        timeChanged: function (t) {
            var a = e(t.target).closest(".calendar"),
                i = a.hasClass("left"),
                s = parseInt(a.find(".hourselect").val(), 10),
                n = parseInt(a.find(".minuteselect").val(), 10),
                r = this.timePickerSeconds ? parseInt(a.find(".secondselect").val(), 10) : 0;
            if (!this.timePicker24Hour) {
                var o = a.find(".ampmselect").val();
                "PM" === o && s < 12 && (s += 12), "AM" === o && 12 === s && (s = 0)
            }
            if (i) {
                var h = this.startDate.clone();
                h.hour(s), h.minute(n), h.second(r), this.setStartDate(h), this.singleDatePicker ? this.endDate = this.startDate.clone() : this.endDate && this.endDate.format("YYYY-MM-DD") == h.format("YYYY-MM-DD") && this.endDate.isBefore(h) && this.setEndDate(h.clone())
            } else if (this.endDate) {
                var l = this.endDate.clone();
                l.hour(s), l.minute(n), l.second(r), this.setEndDate(l)
            }
            this.updateCalendars(), this.updateFormInputs(), this.renderTimePicker("left"), this.renderTimePicker("right")
        },
        formInputsChanged: function (a) {
            var i = e(a.target).closest(".calendar").hasClass("right"),
                s = t(this.container.find('input[name="daterangepicker_start"]').val(), this.locale.format),
                n = t(this.container.find('input[name="daterangepicker_end"]').val(), this.locale.format);
            s.isValid() && n.isValid() && (i && n.isBefore(s) && (s = n.clone()), this.setStartDate(s), this.setEndDate(n), i ? this.container.find('input[name="daterangepicker_start"]').val(this.startDate.format(this.locale.format)) : this.container.find('input[name="daterangepicker_end"]').val(this.endDate.format(this.locale.format))), this.updateView()
        },
        formInputsFocused: function (t) {
            this.container.find('input[name="daterangepicker_start"], input[name="daterangepicker_end"]').removeClass("active"), e(t.target).addClass("active"), e(t.target).closest(".calendar").hasClass("right") && (this.endDate = null, this.setStartDate(this.startDate.clone()), this.updateView())
        },
        formInputsBlurred: function (e) {
            if (!this.endDate) {
                var a = this.container.find('input[name="daterangepicker_end"]').val(),
                    i = t(a, this.locale.format);
                i.isValid() && (this.setEndDate(i), this.updateView())
            }
        },
        formInputsKeydown: function (t) {
            13 === t.keyCode && (t.preventDefault(), this.formInputsChanged(t))
        },
        elementChanged: function () {
            if (this.element.is("input") && this.element.val().length) {
                var e = this.element.val().split(this.locale.separator),
                    a = null,
                    i = null;
                2 === e.length && (a = t(e[0], this.locale.format), i = t(e[1], this.locale.format)), (this.singleDatePicker || null === a || null === i) && (a = t(this.element.val(), this.locale.format), i = a), a.isValid() && i.isValid() && (this.setStartDate(a), this.setEndDate(i), this.updateView())
            }
        },
        keydown: function (t) {
            9 !== t.keyCode && 13 !== t.keyCode || this.hide(), 27 === t.keyCode && (t.preventDefault(), t.stopPropagation(), this.hide())
        },
        updateElement: function () {
            this.element.is("input") && !this.singleDatePicker && this.autoUpdateInput ? (this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format)), this.element.trigger("change")) : this.element.is("input") && this.autoUpdateInput && (this.element.val(this.startDate.format(this.locale.format)), this.element.trigger("change"))
        },
        remove: function () {
            this.container.remove(), this.element.off(".daterangepicker"), this.element.removeData()
        }
    }, e.fn.daterangepicker = function (t, i) {
        var s = e.extend(!0, {}, e.fn.daterangepicker.defaultOptions, t);
        return this.each(function () {
            var t = e(this);
            t.data("daterangepicker") && t.data("daterangepicker").remove(), t.data("daterangepicker", new a(t, s, i))
        }), this
    }, a
});
! function (e) {
    function t(e, t) {
        var i, s;
        return e && (i = t / e.height, s = Number(e.width * i).toFixed(6)), s
    }

    function i(e) {
        return {
            items: e.items || [],
            link: e.link || ""
        }
    }

    function s(e, t) {
        return ['<a class="' + this.styleClasses.loading + '" href="' + e.href + '">', t || "", "</a>"].join("")
    }

    function n(e) {
        return '<img src="' + e.src + '" alt="' + e.description + '" />'
    }

    function r(e) {
        return e.href
    }

    function a(t, i) {
        var s = this;
        this.$element = e(t), this.limit = i.limit && parseInt(i.limit, 10), this.ajax = i.ajax, this.processResponse = i.processResponse, this.itemDisplayHeight = i.itemDisplayHeight, this.templates = this._bindTemplates(i.templates), this.styleClasses = i.styleClasses, this.classes = i.classes, this.itemHref = i.itemHref, e.each(i.classes, function (e, t) {
            s["$$" + e] = "." + t
        }), this.$container = this.$element.closest(this.$$container), this.$container.length || (this.$element.wrap('<div class="' + this.$$container + '"></div>'), this.$container = this.$element.closest(this.$$container)), this.$slide = this.$element.find(this.$$slide), this.$viewAllSlide = this.$slide.find(this.$$viewAll), this.$viewAll = this.$container.find(this.$$viewAll).not(this.$viewAllSlide), this.$next = this.$container.find(this.$$next), this.$prev = this.$container.find(this.$$prev), this.$next.add(this.$prev).add(this.$viewAll).add(this.$viewAllSlide).addClass("hide"), this.ajax.url && e.ajax(this.ajax).then(this.processResponse.bind(this)).then(this.initializeInstance.bind(this)).fail(function () {
            this._hide()
        }.bind(this))
    }

    function l(t) {
        return this.each(function () {
            var i = e(this),
                s = i.data("bs.image-reel"),
                n = e.extend(!0, {}, a.DEFAULTS, i.data(), "object" == typeof t && t);
            s || (s = new a(this, n), i.data("bs.image-reel", s))
        })
    }
    a.DEFAULTS = {
        limit: 50,
        ajax: {
            type: "GET",
            dataType: "json"
        },
        itemDisplayHeight: 133,
        processResponse: i,
        itemHref: r,
        templates: {
            itemAnchor: s,
            itemImg: n
        },
        classes: {
            container: "js_image-reel--container",
            slide: "js_image-reel--slide",
            prev: "js_image-reel--prev",
            next: "js_image-reel--next",
            viewAll: "js_image-reel--view-all"
        },
        styleClasses: {
            loading: "image-reel--loading"
        }
    }, a.prototype.initializeInstance = function (i) {
        var s, n, r, a, l = i.items,
            o = this.itemDisplayHeight;
        l && l.length ? (this.availableWidth = this._getAvailableWidth(), s = this._partitionItems(l), this.remainder = s.remainder, n = s.initial, this.renderItems(s.initial), this.$container.removeClass("hide"), a = this._calculateGutter(), r = n.reduce(function (e, i, s) {
            var n = Number(t(i, o));
            return s && (n = a + n), e + n
        }, 0), r > this.availableWidth && (this._applyViewAllUrl(i.link), this.$container.find([this.$$next, this.$$viewAll + "[href]"].join(", ")).removeClass("hide")), this.bindControls(), e(document).triggerHandler("imagereel.ready", this)) : this._hide()
    }, a.prototype.renderItems = function (e) {
        var t = e.map(this.renderItem.bind(this)).join("");
        this.$slide.find("a").last().before(t).end().end().find("a").removeClass(this.styleClasses.loading)
    }, a.prototype.renderItem = function (e) {
        var t = this.templates.itemImg(e);
        return this.templates.itemAnchor(e, t)
    }, a.prototype._bindTemplates = function (e) {
        var t = this;
        return Object.keys(e).reduce(function (i, s) {
            return i[s] = e[s].bind(t), i
        }, {})
    }, a.prototype._calculateGutter = function () {
        var t, i = e("<a></a>");
        return this.$slide.append(i), t = i.css("padding-left"), i.remove(), parseInt(t, 10)
    }, a.prototype._applyViewAllUrl = function (e) {
        var t = this.$viewAll.add(this.$viewAllSlide);
        e ? t.attr("href", e) : t.removeAttr("href")
    }, a.prototype.bindControls = function () {
        this.$element.find([this.$$prev, this.$$next].join(",")).on("click", this._controlHandler.bind(this))
    }, a.prototype._controlHandler = function (t) {
        var i, s, n, r = e(t.currentTarget),
            a = r.hasClass(this.classes.next) ? "next" : "prev",
            l = "next" === a ? "prev" : "next",
            o = this["$" + l],
            h = this._getCurrentItems();
        t.preventDefault(), h.length && (this.remainder && this.remainder.length && (this._loadingPipeline(this.remainder), delete this.remainder), (i = this._getNextItem(a)) && (s = this._getScrollRemainder(a, i), this._isEndOfReel(a, s) ? (n = this._getEndPosition(a), r.addClass("hide")) : n = i.position().left, this.$slide.css("right", n + "px"), o.removeClass("hide")))
    }, a.prototype._getEndPosition = function (e) {
        var t = this._getCurrentItems().last(),
            i = this.$element.width();
        return "next" === e ? this._getItemRightEdge(t) - i : 0
    }, a.prototype._getItemRightEdge = function (t) {
        var i = e(t);
        return i.position().left + i[0].getBoundingClientRect().width
    }, a.prototype._isEndOfReel = function (e, t) {
        return "next" === e && t <= this.$element.width() || "prev" === e && t <= 0
    }, a.prototype._getScrollRemainder = function (e, t) {
        var i = this._getCurrentItems(),
            s = i.index(t);
        return ("next" === e ? i.slice(s) : i.slice(0, s)).toArray().reduce(function (e, t) {
            return e + t.getBoundingClientRect().width
        }, 0)
    }, a.prototype._getNextItem = function (e) {
        var t, i = -1 * this.$slide.position().left,
            s = this.$element.width(),
            n = i - s;
        return "next" === e && (n = i + s), t = this._isLastVisible.bind(this, e, n), Array.prototype.reduce.call(this._getCurrentItems(), t, null)
    }, a.prototype._isLastVisible = function (t, i, s, n, r, a) {
        var l, o = "next" === t ? 1 : -1;
        return s || (l = e(n), ("next" === t ? this._getItemRightEdge(l) : l.position().left) > i && (s = this.$previousFirstImage === l[0] ? e(a[r + o]) : l, this.$previousFirstImage = s ? s[0] : null)), s
    }, a.prototype._getCurrentItems = function () {
        return this.$element.find([this.$$slide, "a[href]"].join(" "))
    }, a.prototype._loadingPipeline = function (t) {
        var i = this._loadItem.bind(this);
        return e.when(t.map(i))
    }, a.prototype._loadItem = function (i) {
        var s = t(i, this.itemDisplayHeight),
            n = e(this.templates.itemAnchor(i)).css({
                height: this.itemDisplayHeight + "px",
                width: s + "px"
            });
        return this.$viewAllSlide.before(n), this._loadImage(i, n)
    }, a.prototype._loadImage = function (t, i) {
        var s = e.Deferred();
        return e(new Image).on("load", this._onImageLoad.bind(this, t, i)).on("load", s.resolve).on("error", i.remove).on("error", s.reject)[0].src = t.src, s.promise()
    }, a.prototype._onImageLoad = function (e, t) {
        t.attr("href", this.itemHref(e)).append(this.templates.itemImg(e)).css({
            height: "",
            width: ""
        }).removeClass(this.styleClasses.loading).find("img").css("width", "auto")
    }, a.prototype.reveal = function () {
        this.$element.removeClass("hide")
    }, a.prototype._hide = function () {
        this.$element.addClass("hide")
    }, a.prototype._getAvailableWidth = function () {
        return this.$container.parent().width()
    }, a.prototype._partitionItems = function (e) {
        function i(e) {
            var i = t(e, r.itemDisplayHeight);
            return e.rightEdge < 2 * s + i
        }
        var s = this.availableWidth,
            n = {
                initial: [],
                remainder: []
            },
            r = this;
        return e.reduce(function (e, t, s, n) {
            var r = n[s - 1],
                a = t.width;
            return r && (a += r.rightEdge), t.rightEdge = a, e[i(t) ? "initial" : "remainder"].push(t), e
        }, n)
    }, e.fn.imageReel = l, e.fn.imageReel.Constructor = a, e(window).on("load", function () {
        e('[data-ride="image-reel"]').each(function () {
            var t = e(this);
            l.call(t, t.data())
        })
    })
}(jQuery);
! function (t) {
    t(".btn-toggle-group").on("touchstart", '[data-toggle="tab"]', function () {
        t(this).data("handlingTouchEvent", !0)
    }).on("mouseenter", '[data-toggle="tab"]', function () {
        var n = t(this);
        n.data("handlingTouchEvent") || n.tab("show").one("mouseleave", function () {
            n.parent().find("> .active").tab("show")
        }), n.data("handlingTouchEvent", !1)
    })
}(jQuery);
! function (t, e) {
    "function" == typeof define && define.amd ? define(["jquery"], function (o) {
        return t.Tour = e(o)
    }) : "object" == typeof exports ? module.exports = e(require("jQuery")) : t.Tour = e(t.jQuery)
}(window, function (t) {
    var e;
    return e = window.document,
        function () {
            function o(e) {
                var o;
                try {
                    o = window.localStorage
                } catch (t) {
                    o = !1
                }
                this._options = t.extend({
                    name: "tour",
                    steps: [],
                    container: "body",
                    autoscroll: !0,
                    keyboard: !0,
                    storage: o,
                    debug: !1,
                    backdrop: !1,
                    backdropContainer: "body",
                    backdropPadding: 0,
                    redirect: !0,
                    orphan: !1,
                    duration: !1,
                    delay: !1,
                    basePath: "",
                    template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-title"></h3> <div class="popover-content"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-default" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-default" data-role="next">Next &raquo;</button> <button class="btn btn-sm btn-default" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> <button class="btn btn-sm btn-default" data-role="end">End tour</button> </div> </div>',
                    afterSetState: function (t, e) {},
                    afterGetState: function (t, e) {},
                    afterRemoveState: function (t) {},
                    onStart: function (t) {},
                    onEnd: function (t) {},
                    onShow: function (t) {},
                    onShown: function (t) {},
                    onHide: function (t) {},
                    onHidden: function (t) {},
                    onNext: function (t) {},
                    onPrev: function (t) {},
                    onPause: function (t, e) {},
                    onResume: function (t, e) {},
                    onRedirectError: function (t) {}
                }, e), this._force = !1, this._inited = !1, this._current = null, this.backdrop = {
                    overlay: null,
                    $element: null,
                    $background: null,
                    backgroundShown: !1,
                    overlayElementShown: !1
                }
            }
            return o.prototype.addSteps = function (t) {
                var e, o, n;
                for (o = 0, n = t.length; o < n; o++) e = t[o], this.addStep(e);
                return this
            }, o.prototype.addStep = function (t) {
                return this._options.steps.push(t), this
            }, o.prototype.getStep = function (e) {
                if (null != this._options.steps[e]) return t.extend({
                    id: "step-" + e,
                    path: "",
                    host: "",
                    placement: "right",
                    title: "",
                    content: "<p></p>",
                    next: e === this._options.steps.length - 1 ? -1 : e + 1,
                    prev: e - 1,
                    animation: !0,
                    container: this._options.container,
                    autoscroll: this._options.autoscroll,
                    backdrop: this._options.backdrop,
                    backdropContainer: this._options.backdropContainer,
                    backdropPadding: this._options.backdropPadding,
                    redirect: this._options.redirect,
                    reflexElement: this._options.steps[e].element,
                    backdropElement: this._options.steps[e].element,
                    orphan: this._options.orphan,
                    duration: this._options.duration,
                    delay: this._options.delay,
                    template: this._options.template,
                    onShow: this._options.onShow,
                    onShown: this._options.onShown,
                    onHide: this._options.onHide,
                    onHidden: this._options.onHidden,
                    onNext: this._options.onNext,
                    onPrev: this._options.onPrev,
                    onPause: this._options.onPause,
                    onResume: this._options.onResume,
                    onRedirectError: this._options.onRedirectError
                }, this._options.steps[e])
            }, o.prototype.init = function (t) {
                return this._force = t, this.ended() ? (this._debug("Tour ended, init prevented."), this) : (this.setCurrentStep(), this._initMouseNavigation(), this._initKeyboardNavigation(), this._onResize(function (t) {
                    return function () {
                        return t.showStep(t._current)
                    }
                }(this)), null !== this._current && this.showStep(this._current), this._inited = !0, this)
            }, o.prototype.start = function (t) {
                var e;
                return null == t && (t = !1), this._inited || this.init(t), null === this._current && (e = this._makePromise(null != this._options.onStart ? this._options.onStart(this) : void 0), this._callOnPromiseDone(e, this.showStep, 0)), this
            }, o.prototype.next = function () {
                var t;
                return t = this.hideStep(this._current, this._current + 1), this._callOnPromiseDone(t, this._showNextStep)
            }, o.prototype.prev = function () {
                var t;
                return t = this.hideStep(this._current, this._current - 1), this._callOnPromiseDone(t, this._showPrevStep)
            }, o.prototype.goTo = function (t) {
                var e;
                return e = this.hideStep(this._current, t), this._callOnPromiseDone(e, this.showStep, t)
            }, o.prototype.end = function () {
                var o, n;
                return o = function (o) {
                    return function (n) {
                        if (t(e).off("click.tour-" + o._options.name), t(e).off("keyup.tour-" + o._options.name), t(window).off("resize.tour-" + o._options.name), o._setState("end", "yes"), o._inited = !1, o._force = !1, o._clearTimer(), null != o._options.onEnd) return o._options.onEnd(o)
                    }
                }(this), n = this.hideStep(this._current), this._callOnPromiseDone(n, o)
            }, o.prototype.ended = function () {
                return !this._force && !!this._getState("end")
            }, o.prototype.restart = function () {
                return this._removeState("current_step"), this._removeState("end"), this._removeState("redirect_to"), this.start()
            }, o.prototype.pause = function () {
                var t;
                return (t = this.getStep(this._current)) && t.duration ? (this._paused = !0, this._duration -= (new Date).getTime() - this._start, window.clearTimeout(this._timer), this._debug("Paused/Stopped step " + (this._current + 1) + " timer (" + this._duration + " remaining)."), null != t.onPause ? t.onPause(this, this._duration) : void 0) : this
            }, o.prototype.resume = function () {
                var t;
                return (t = this.getStep(this._current)) && t.duration ? (this._paused = !1, this._start = (new Date).getTime(), this._duration = this._duration || t.duration, this._timer = window.setTimeout(function (t) {
                    return function () {
                        return t._isLast() ? t.next() : t.end()
                    }
                }(this), this._duration), this._debug("Started step " + (this._current + 1) + " timer with duration " + this._duration), null != t.onResume && this._duration !== t.duration ? t.onResume(this, this._duration) : void 0) : this
            }, o.prototype.hideStep = function (e, o) {
                var n, r, i, s;
                if (s = this.getStep(e)) return this._clearTimer(), i = this._makePromise(null != s.onHide ? s.onHide(this, e) : void 0), r = function (n) {
                    return function (r) {
                        var i, a;
                        if (i = t(s.element), i.data("bs.popover") || i.data("popover") || (i = t("body")), i.popover("destroy").removeClass("tour-" + n._options.name + "-element tour-" + n._options.name + "-" + e + "-element").removeData("bs.popover").focus(), s.reflex && t(s.reflexElement).removeClass("tour-step-element-reflex").off(n._reflexEvent(s.reflex) + ".tour-" + n._options.name), s.backdrop && ((a = null != o && n.getStep(o)) && a.backdrop && a.backdropElement === s.backdropElement || n._hideBackdrop()), null != s.onHidden) return s.onHidden(n)
                    }
                }(this), n = s.delay.hide || s.delay, "[object Number]" === {}.toString.call(n) && n > 0 ? (this._debug("Wait " + n + " milliseconds to hide the step " + (this._current + 1)), window.setTimeout(function (t) {
                    return function () {
                        return t._callOnPromiseDone(i, r)
                    }
                }(this), n)) : this._callOnPromiseDone(i, r), i
            }, o.prototype.showStep = function (t) {
                var o, n, r, i, s, a;
                return this.ended() ? (this._debug("Tour ended, showStep prevented."), this) : (a = this.getStep(t)) && (s = t < this._current, n = this._makePromise(null != a.onShow ? a.onShow(this, t) : void 0), this.setCurrentStep(t), o = function () {
                    switch ({}.toString.call(a.path)) {
                        case "[object Function]":
                            return a.path();
                        case "[object String]":
                            return this._options.basePath + a.path;
                        default:
                            return a.path
                    }
                }.call(this), !a.redirect || !this._isRedirect(a.host, o, e.location) || (this._redirect(a, t, o), this._isJustPathHashDifferent(a.host, o, e.location))) ? (i = function (e) {
                    return function (o) {
                        var n;
                        if (e._isOrphan(a)) {
                            if (!1 === a.orphan) return e._debug("Skip the orphan step " + (e._current + 1) + ".\nOrphan option is false and the element does not exist or is hidden."), void(s ? e._showPrevStep() : e._showNextStep());
                            e._debug("Show the orphan step " + (e._current + 1) + ". Orphans option is true.")
                        }
                        if (a.backdrop && e._showBackdrop(a), n = function () {
                                if (e.getCurrentStep() === t && !e.ended()) return null != a.element && a.backdrop && e._showOverlayElement(a, !0), e._showPopover(a, t), null != a.onShown && a.onShown(e), e._debug("Step " + (e._current + 1) + " of " + e._options.steps.length)
                            }, a.autoscroll ? e._scrollIntoView(a, n) : n(), a.duration) return e.resume()
                    }
                }(this), r = a.delay.show || a.delay, "[object Number]" === {}.toString.call(r) && r > 0 ? (this._debug("Wait " + r + " milliseconds to show the step " + (this._current + 1)), window.setTimeout(function (t) {
                    return function () {
                        return t._callOnPromiseDone(n, i)
                    }
                }(this), r)) : this._callOnPromiseDone(n, i), n) : void 0
            }, o.prototype.getCurrentStep = function () {
                return this._current
            }, o.prototype.setCurrentStep = function (t) {
                return null != t ? (this._current = t, this._setState("current_step", t)) : (this._current = this._getState("current_step"), this._current = null === this._current ? null : parseInt(this._current, 10)), this
            }, o.prototype.redraw = function () {
                return this._showOverlayElement(this.getStep(this.getCurrentStep()).element, !0)
            }, o.prototype._setState = function (t, e) {
                var o, n;
                if (this._options.storage) {
                    n = this._options.name + "_" + t;
                    try {
                        this._options.storage.setItem(n, e)
                    } catch (t) {
                        o = t, o.code === DOMException.QUOTA_EXCEEDED_ERR && this._debug("LocalStorage quota exceeded. State storage failed.")
                    }
                    return this._options.afterSetState(n, e)
                }
                return null == this._state && (this._state = {}), this._state[t] = e
            }, o.prototype._removeState = function (t) {
                var e;
                return this._options.storage ? (e = this._options.name + "_" + t, this._options.storage.removeItem(e), this._options.afterRemoveState(e)) : null != this._state ? delete this._state[t] : void 0
            }, o.prototype._getState = function (t) {
                var e, o;
                return this._options.storage ? (e = this._options.name + "_" + t, o = this._options.storage.getItem(e)) : null != this._state && (o = this._state[t]), void 0 !== o && "null" !== o || (o = null), this._options.afterGetState(t, o), o
            }, o.prototype._showNextStep = function () {
                var t, e, o;
                return o = this.getStep(this._current), e = function (t) {
                    return function (e) {
                        return t.showStep(o.next)
                    }
                }(this), t = this._makePromise(null != o.onNext ? o.onNext(this) : void 0), this._callOnPromiseDone(t, e)
            }, o.prototype._showPrevStep = function () {
                var t, e, o;
                return o = this.getStep(this._current), e = function (t) {
                    return function (e) {
                        return t.showStep(o.prev)
                    }
                }(this), t = this._makePromise(null != o.onPrev ? o.onPrev(this) : void 0), this._callOnPromiseDone(t, e)
            }, o.prototype._debug = function (t) {
                if (this._options.debug) return window.console.log("Bootstrap Tour '" + this._options.name + "' | " + t)
            }, o.prototype._isRedirect = function (t, e, o) {
                var n;
                return !(null == t || "" === t || !("[object RegExp]" === {}.toString.call(t) && !t.test(o.origin) || "[object String]" === {}.toString.call(t) && this._isHostDifferent(t, o))) || (n = [o.pathname, o.search, o.hash].join(""), null != e && "" !== e && ("[object RegExp]" === {}.toString.call(e) && !e.test(n) || "[object String]" === {}.toString.call(e) && this._isPathDifferent(e, n)))
            }, o.prototype._isHostDifferent = function (t, e) {
                switch ({}.toString.call(t)) {
                    case "[object RegExp]":
                        return !t.test(e.origin);
                    case "[object String]":
                        return this._getProtocol(t) !== this._getProtocol(e.href) || this._getHost(t) !== this._getHost(e.href);
                    default:
                        return !0
                }
            }, o.prototype._isPathDifferent = function (t, e) {
                return this._getPath(t) !== this._getPath(e) || !this._equal(this._getQuery(t), this._getQuery(e)) || !this._equal(this._getHash(t), this._getHash(e))
            }, o.prototype._isJustPathHashDifferent = function (t, e, o) {
                var n;
                return (null == t || "" === t || !this._isHostDifferent(t, o)) && (n = [o.pathname, o.search, o.hash].join(""), "[object String]" === {}.toString.call(e) && (this._getPath(e) === this._getPath(n) && this._equal(this._getQuery(e), this._getQuery(n)) && !this._equal(this._getHash(e), this._getHash(n))))
            }, o.prototype._redirect = function (o, n, r) {
                var i;
                return t.isFunction(o.redirect) ? o.redirect.call(this, r) : (i = "[object String]" === {}.toString.call(o.host) ? "" + o.host + r : r, this._debug("Redirect to " + i), this._getState("redirect_to") !== "" + n ? (this._setState("redirect_to", "" + n), e.location.href = i) : (this._debug("Error redirection loop to " + r), this._removeState("redirect_to"), null != o.onRedirectError ? o.onRedirectError(this) : void 0))
            }, o.prototype._isOrphan = function (e) {
                return null == e.element || !t(e.element).length || t(e.element).is(":hidden") && "http://www.w3.org/2000/svg" !== t(e.element)[0].namespaceURI
            }, o.prototype._isLast = function () {
                return this._current < this._options.steps.length - 1
            }, o.prototype._showPopover = function (e, o) {
                var n, r, i, s, a;
                if (t(".tour-" + this._options.name).remove(), s = t.extend({}, this._options), i = this._isOrphan(e), e.template = this._template(e, o), i && (e.element = "body", e.placement = "top"), n = t(e.element), n.addClass("tour-" + this._options.name + "-element tour-" + this._options.name + "-" + o + "-element"), e.options && t.extend(s, e.options), e.reflex && !i && t(e.reflexElement).addClass("tour-step-element-reflex").off(this._reflexEvent(e.reflex) + ".tour-" + this._options.name).on(this._reflexEvent(e.reflex) + ".tour-" + this._options.name, function (t) {
                        return function () {
                            return t._isLast() ? t.next() : t.end()
                        }
                    }(this)), a = !0 === e.smartPlacement && -1 === e.placement.search(/auto/i), n.popover({
                        placement: a ? "auto " + e.placement : e.placement,
                        trigger: "manual",
                        title: e.title,
                        content: e.content,
                        html: !0,
                        animation: e.animation,
                        container: e.container,
                        template: e.template,
                        selector: e.element
                    }).popover("show"), r = n.data("bs.popover") ? n.data("bs.popover").tip() : n.data("popover").tip(), r.attr("id", e.id), this._focus(r, n, e.next < 0), this._reposition(r, e), i) return this._center(r)
            }, o.prototype._template = function (e, o) {
                var n, r, i, s, a, u;
                return u = e.template, this._isOrphan(e) && "[object Boolean]" !== {}.toString.call(e.orphan) && (u = e.orphan), a = t(t.isFunction(u) ? u(o, e) : u), n = a.find(".popover-navigation"), i = n.find('[data-role="prev"]'), r = n.find('[data-role="next"]'), s = n.find('[data-role="pause-resume"]'), this._isOrphan(e) && a.addClass("orphan"), a.addClass("tour-" + this._options.name + " tour-" + this._options.name + "-" + o), e.reflex && a.addClass("tour-" + this._options.name + "-reflex"), e.prev < 0 && i.addClass("disabled").prop("disabled", !0).prop("tabindex", -1), e.next < 0 && r.addClass("disabled").prop("disabled", !0).prop("tabindex", -1), e.duration || s.remove(), a.clone().wrap("<div>").parent().html()
            }, o.prototype._reflexEvent = function (t) {
                return "[object Boolean]" === {}.toString.call(t) ? "click" : t
            }, o.prototype._focus = function (t, e, o) {
                var n, r;
                return r = o ? "end" : "next", n = t.find("[data-role='" + r + "']"), e.on("shown.bs.popover", function () {
                    return n.focus()
                })
            }, o.prototype._reposition = function (o, n) {
                var r, i, s, a, u, p, h;
                if (a = o[0].offsetWidth, i = o[0].offsetHeight, h = o.offset(), u = h.left, p = h.top, r = t(e).outerHeight() - h.top - o.outerHeight(), r < 0 && (h.top = h.top + r), s = t("html").outerWidth() - h.left - o.outerWidth(), s < 0 && (h.left = h.left + s), h.top < 0 && (h.top = 0), h.left < 0 && (h.left = 0), o.offset(h), "bottom" === n.placement || "top" === n.placement) {
                    if (u !== h.left) return this._replaceArrow(o, 2 * (h.left - u), a, "left")
                } else if (p !== h.top) return this._replaceArrow(o, 2 * (h.top - p), i, "top")
            }, o.prototype._center = function (e) {
                return e.css("top", t(window).outerHeight() / 2 - e.outerHeight() / 2)
            }, o.prototype._replaceArrow = function (t, e, o, n) {
                return t.find(".arrow").css(n, e ? 50 * (1 - e / o) + "%" : "")
            }, o.prototype._scrollIntoView = function (e, o) {
                var n, r, i, s, a, u, p;
                if (n = t(e.element), !n.length) return o();
                switch (r = t(window), a = n.offset().top, s = n.outerHeight(), p = r.height(), u = 0, e.placement) {
                    case "top":
                        u = Math.max(0, a - p / 2);
                        break;
                    case "left":
                    case "right":
                        u = Math.max(0, a + s / 2 - p / 2);
                        break;
                    case "bottom":
                        u = Math.max(0, a + s - p / 2)
                }
                return this._debug("Scroll into view. ScrollTop: " + u + ". Element offset: " + a + ". Window height: " + p + "."), i = 0, t("body, html").stop(!0, !0).animate({
                    scrollTop: Math.ceil(u)
                }, function (t) {
                    return function () {
                        if (2 == ++i) return o(), t._debug("Scroll into view.\nAnimation end element offset: " + n.offset().top + ".\nWindow height: " + r.height() + ".")
                    }
                }(this))
            }, o.prototype._onResize = function (e, o) {
                return t(window).on("resize.tour-" + this._options.name, function () {
                    return clearTimeout(o), o = setTimeout(e, 100)
                })
            }, o.prototype._initMouseNavigation = function () {
                var o;
                return o = this, t(e).off("click.tour-" + this._options.name, ".popover.tour-" + this._options.name + " *[data-role='prev']").off("click.tour-" + this._options.name, ".popover.tour-" + this._options.name + " *[data-role='next']").off("click.tour-" + this._options.name, ".popover.tour-" + this._options.name + " *[data-role='end']").off("click.tour-" + this._options.name, ".popover.tour-" + this._options.name + " *[data-role='pause-resume']").on("click.tour-" + this._options.name, ".popover.tour-" + this._options.name + " *[data-role='next']", function (t) {
                    return function (e) {
                        return e.preventDefault(), t.next()
                    }
                }(this)).on("click.tour-" + this._options.name, ".popover.tour-" + this._options.name + " *[data-role='prev']", function (t) {
                    return function (e) {
                        if (e.preventDefault(), t._current > 0) return t.prev()
                    }
                }(this)).on("click.tour-" + this._options.name, ".popover.tour-" + this._options.name + " *[data-role='end']", function (t) {
                    return function (e) {
                        return e.preventDefault(), t.end()
                    }
                }(this)).on("click.tour-" + this._options.name, ".popover.tour-" + this._options.name + " *[data-role='pause-resume']", function (e) {
                    var n;
                    return e.preventDefault(), n = t(this), n.text(o._paused ? n.data("pause-text") : n.data("resume-text")), o._paused ? o.resume() : o.pause()
                })
            }, o.prototype._initKeyboardNavigation = function () {
                if (this._options.keyboard) return t(e).on("keyup.tour-" + this._options.name, function (t) {
                    return function (e) {
                        if (e.which) switch (e.which) {
                            case 39:
                                return e.preventDefault(), t._isLast() ? t.next() : t.end();
                            case 37:
                                if (e.preventDefault(), t._current > 0) return t.prev()
                        }
                    }
                }(this))
            }, o.prototype._makePromise = function (e) {
                return e && t.isFunction(e.then) ? e : null
            }, o.prototype._callOnPromiseDone = function (t, e, o) {
                return t ? t.then(function (t) {
                    return function (n) {
                        return e.call(t, o)
                    }
                }(this)) : e.call(this, o)
            }, o.prototype._showBackdrop = function (e) {
                if (!this.backdrop.backgroundShown) return this.backdrop = t("<div>", {
                    class: "tour-backdrop"
                }), this.backdrop.backgroundShown = !0, t(e.backdropContainer).append(this.backdrop)
            }, o.prototype._hideBackdrop = function () {
                return this._hideOverlayElement(), this._hideBackground()
            }, o.prototype._hideBackground = function () {
                if (this.backdrop && this.backdrop.remove) return this.backdrop.remove(), this.backdrop.overlay = null, this.backdrop.backgroundShown = !1
            }, o.prototype._showOverlayElement = function (e, o) {
                var n, r, i;
                if (r = t(e.element), n = t(e.backdropElement), r && 0 !== r.length && (!this.backdrop.overlayElementShown || o)) return this.backdrop.overlayElementShown || (this.backdrop.$element = n.addClass("tour-step-backdrop"), this.backdrop.$background = t("<div>", {
                    class: "tour-step-background"
                }), this.backdrop.$background.appendTo(e.backdropContainer), this.backdrop.overlayElementShown = !0), i = {
                    width: n.innerWidth(),
                    height: n.innerHeight(),
                    offset: n.offset()
                }, e.backdropPadding && (i = this._applyBackdropPadding(e.backdropPadding, i)), this.backdrop.$background.width(i.width).height(i.height).offset(i.offset)
            }, o.prototype._hideOverlayElement = function () {
                if (this.backdrop.overlayElementShown) return this.backdrop.$element.removeClass("tour-step-backdrop"), this.backdrop.$background.remove(), this.backdrop.$element = null, this.backdrop.$background = null, this.backdrop.overlayElementShown = !1
            }, o.prototype._applyBackdropPadding = function (t, e) {
                return "object" == typeof t ? (null == t.top && (t.top = 0), null == t.right && (t.right = 0), null == t.bottom && (t.bottom = 0), null == t.left && (t.left = 0), e.offset.top = e.offset.top - t.top, e.offset.left = e.offset.left - t.left, e.width = e.width + t.left + t.right, e.height = e.height + t.top + t.bottom) : (e.offset.top = e.offset.top - t, e.offset.left = e.offset.left - t, e.width = e.width + 2 * t, e.height = e.height + 2 * t), e
            }, o.prototype._clearTimer = function () {
                return window.clearTimeout(this._timer), this._timer = null, this._duration = null
            }, o.prototype._getProtocol = function (t) {
                return t = t.split("://"), t.length > 1 ? t[0] : "http"
            }, o.prototype._getHost = function (t) {
                return t = t.split("//"), t = t.length > 1 ? t[1] : t[0], t.split("/")[0]
            }, o.prototype._getPath = function (t) {
                return t.replace(/\/?$/, "").split("?")[0].split("#")[0]
            }, o.prototype._getQuery = function (t) {
                return this._getParams(t, "?")
            }, o.prototype._getHash = function (t) {
                return this._getParams(t, "#")
            }, o.prototype._getParams = function (t, e) {
                var o, n, r, i, s;
                if (n = t.split(e), 1 === n.length) return {};
                for (n = n[1].split("&"), r = {}, i = 0, s = n.length; i < s; i++) o = n[i], o = o.split("="), r[o[0]] = o[1] || "";
                return r
            }, o.prototype._equal = function (t, e) {
                var o, n, r, i, s, a;
                if ("[object Object]" === {}.toString.call(t) && "[object Object]" === {}.toString.call(e)) {
                    if (n = Object.keys(t), r = Object.keys(e), n.length !== r.length) return !1;
                    for (o in t)
                        if (i = t[o], !this._equal(e[o], i)) return !1;
                    return !0
                }
                if ("[object Array]" === {}.toString.call(t) && "[object Array]" === {}.toString.call(e)) {
                    if (t.length !== e.length) return !1;
                    for (o = s = 0, a = t.length; s < a; o = ++s)
                        if (i = t[o], !this._equal(i, e[o])) return !1;
                    return !0
                }
                return t === e
            }, o
        }()
});
! function () {
    function ya(t) {
        switch (t) {
            case "'":
                return "&#39;";
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "©":
                return "&copy;";
            case "\u2028":
                return "<br>";
            case "\u2029":
                return "<p>";
            default:
                return t
        }
    }

    function k() {}

    function s() {}

    function ia(t) {
        k.prototype.init.call(this, t, k.TYPE.STANDARD)
    }

    function ja(t) {
        return l[t] || (l[t] = new ia(t)), l[t]
    }

    function R(t, e) {
        k.prototype.init.call(this, e + "_" + t, k.TYPE.AGENT)
    }

    function K(t, e) {
        var n = e + "_" + t;
        return l[n] || (l[n] = new R(t, e)), l[n]
    }

    function S(t, e) {
        s.prototype.init.call(this, t, e)
    }

    function T(t, e) {
        s.prototype.init.call(this, t, e)
    }

    function h(t) {
        k.prototype.init.call(this, t, k.TYPE.INVITE), this.active = !1, this.filterLogic = null, this.rules = {}, this.autoRejectTimeout = this.inviteTimeout = this.inviteDelay = this.ruleTree = null
    }

    function t(t) {
        return l[t] || (l[t] = new h(t)), l[t]
    }

    function z(t, e, n, i, o, r, a, l) {
        s.prototype.init.call(this, t, e), this.hasInviteAfterAccept = r, this.hasInviteAfterReject = a, this.rejectTime = l, null !== f.getCssAnimation(e) || "Custom" == n ? this.renderer = new h.RENDERER[n].renderClass(t, e, h.START_POSITION[i], h.END_POSITION[o]) : this.renderer = new h.RENDERER.Appear.renderClass(t, e, h.START_POSITION[i], h.END_POSITION[o])
    }

    function C(e) {
        return t(e) ? t(e).getTracker() : null
    }

    function r() {}

    function I(t, e, n, i) {
        r.prototype.init.call(this, t, e, n, i)
    }

    function J(t, e, n, i) {
        r.prototype.init.call(this, t, e, null, i)
    }

    function L(t, e, n, i) {
        r.prototype.init.call(this, t, e, null, i)
    }

    function D(t, e, n, i) {
        D.prototype.init.call(this, t, e, null, null)
    }

    function m() {}

    function M(t, e, n, i, o) {
        m.prototype.init.call(this, t, e, n, i, o)
    }

    function N(t, e, n, i, o) {
        m.prototype.init.call(this, t, e, n, i, o)
    }

    function U(t, e, n, i, o) {
        m.prototype.init.call(this, t, e, n, i, o)
    }

    function E(t) {
        if (1e3 < ++ka) throw Error("Error processing rule filter logic, preventing recursion");
        for (var e = 0, n = 0, i = 0; i < t.length; i++) "(" == t.charAt(i) ? n++ : ")" == t.charAt(i) && n--, "," == t.charAt(i) && 1 == n && (e = i);
        if (0 == t.indexOf("AND(")) return n = E(t.substring(4, e)), t = E(t.substring(e + 1, t.length - 1)), new V(n, t);
        if (0 == t.indexOf("OR(")) return n = E(t.substring(3, e)), t = E(t.substring(e + 1, t.length - 1)), new W(n, t);
        if (0 == t.indexOf("NOT(")) return n = E(t.substring(4, t.length - 1)), new X(n);
        if (!isNaN(parseInt(t, 10))) return new Y(parseInt(t, 10));
        throw Error("Encountered unexpected character in filter logic")
    }

    function y() {}

    function Y(t) {
        this.ruleId = t, y.prototype.init.call(this, null, null)
    }

    function V(t, e) {
        y.prototype.init.call(this, t, e)
    }

    function W(t, e) {
        y.prototype.init.call(this, t, e)
    }

    function X(t) {
        y.prototype.init.call(this, t, null)
    }

    function za(t, e, i, o) {
        var r = document.createElement("div");
        r.id = "liveagent_invite_button_" + t;
        var a = document.createElement("img");
        return a.style.cursor = "pointer", a.style.position = "absolute", a.style.right = "-20px", a.style.top = "-20px", a.src = p.contentServerUrl + "/images/x.png", f.addEventListener(a, "click", function () {
            n.rejectChat(t)
        }), r.appendChild(a), a = document.createElement("img"), a.style.cursor = "pointer", a.style.clear = "right", a.src = e, a.width = i, a.height = o, f.addEventListener(a, "click", function () {
            n.startChat(t)
        }), r.appendChild(a), document.body.appendChild(r), r
    }

    function la(t, e, n) {
        void 0 === n && (n = !0), this.getLabel = function () {
            return t
        }, this.getValue = function () {
            return e
        }, this.getDisplayToAgent = function () {
            return n
        };
        var i = new Z;
        this.getMapper = function () {
            return i
        }, this.doKnowledgeSearch = !1, this.getDoKnowledgeSearch = function () {
            return this.doKnowledgeSearch
        }, this.setDoKnowledgeSearch = function () {
            this.doKnowledgeSearch = !0
        }
    }

    function Z() {
        var t = [],
            e = [];
        this.getEntityMaps = function () {
            return t
        }, this.getTranscriptFields = function () {
            return e
        }
    }

    function ma(t, e, n, i, o) {
        this.getEntityName = function () {
            return t
        }, this.getFieldName = function () {
            return e
        }, this.getFastFill = function () {
            return n
        }, this.getAutoQuery = function () {
            return i
        }, this.getExactMatch = function () {
            return o
        }
    }

    function na(t) {
        this.saveToTranscript = "", this.showOnCreate = !1, this.linkToEntityField = this.linkToEntityName = "";
        var e = new oa;
        this.getEntityName = function () {
            return t
        }, this.getSaveTranscript = function () {
            return this.saveTranscript
        }, this.getShowOnCreate = function () {
            return this.showOnCreate
        }, this.getLinkToEntityName = function () {
            return this.linkToEntityName
        }, this.getLinkToEntityField = function () {
            return this.linkToEntityField
        }, this.getEntityMapper = function () {
            return e
        }, this.setSaveTranscript = function (t) {
            this.saveTranscript = t
        }, this.setShowOnCreate = function (t) {
            this.showOnCreate = t
        }, this.setLinkToEntityName = function (t) {
            this.linkToEntityName = t
        }, this.setLinkToEntityField = function (t) {
            this.linkToEntityField = t
        }
    }

    function oa() {
        var t = [];
        this.getEntityFieldsMaps = function () {
            return t
        }
    }

    function pa(t, e, n, i, o) {
        this.getFieldName = function () {
            return t
        }, this.getLabel = function () {
            return e
        }, this.getDoFind = function () {
            return n
        }, this.getIsExactMatch = function () {
            return i
        }, this.getDoCreate = function () {
            return o
        }
    }

    function O() {
        if (!qa) {
            if (qa = !0, f.log("DOM is ready. Setting up environment."), null == u.getOref() && u.setOref(document.referrer), null == u.getVisitCount() && u.setVisitCount(1), window._laq)
                for (var t = 0; t < window._laq.length; t++) window._laq[t].call(window);
            q.connection.setCallback("liveagent._.handlePing"), ra()
        }
    }

    function ra() {
        var t = [],
            e = {};
        $ && (e.chatted = 1), v ? (e.sid = v, f.log("Reusing existing session.")) : (t.push(new q.Noun("VisitorId")), f.log("Requesting new session.")), t.push(new q.Noun("Settings", {
            buttonIds: "[" + sa() + "]",
            updateBreadcrumb: 1
        })), q.connection.send(t, e)
    }

    function ta(t, e) {
        e.endpointUrl && t.setEndpoint(e.endpointUrl), e.prechatUrl && t.setPrechat(e.prechatUrl), e.language && t.setLanguage(e.language), t.setOnlineState(e.isAvailable)
    }

    function Aa() {
        if (q.connection.isRunning())
            if (null == v) ra();
            else {
                f.log("Pinging server to keep presence"), P = null;
                var t = {};
                t.sid = v, $ && (t.chatted = 1), t.r = (new Date).getMilliseconds();
                var e = [new q.Noun("Availability", {
                    ids: "[" + sa() + "]"
                })];
                q.connection.send(e, t)
            }
    }

    function aa() {
        f.log("Disconnecting from Live Agent"), q.connection.setIsRunning(!1);
        for (var t in l) l.hasOwnProperty(t) && l[t].setOnlineState(!1)
    }

    function sa() {
        var t, e = [],
            n = {};
        for (t in l) l.hasOwnProperty(t) && l[t].getType() == k.TYPE.STANDARD && (n[t] = l[t]);
        for (var i in n) e.push(i);
        var o, n = {};
        for (o in l) l.hasOwnProperty(o) && l[o].getType() == k.TYPE.AGENT && (n[o] = l[o]);
        for (i in n) e.push(i);
        o = {};
        for (var r in l) l.hasOwnProperty(r) && l[r].getType() == k.TYPE.INVITE && (o[r] = l[r]);
        for (i in o) e.push(i);
        for (i = "", r = 0; r < e.length; r++) i += e[r], r < e.length - 1 && (i += ",");
        return i
    }

    function ua(t, e, n, i) {
        document.cookie = "liveagent_chatted=1;path=/;", $ = !0;
        var o;
        o = "deployment_id=" + p.deploymentId, o = o + "&org_id=" + p.orgId, o += "&button_id=", o += t, n && (o += "&agent_id=", o += n), i && (o += "&do_fallback=1"), o += "&session_id=", o += v, t = n ? l[n + "_" + t].getEndpoint(o) : l[t].getEndpoint(o), n = "height=" + p.chatWindowHeight, n = n + ",width=" + p.chatWindowWidth, n += ",menubar=no", n += ",toolbar=no", n += ",location=no", n += ",personalbar=no", window.open("", e, n), Ba(e, t)
    }

    function Ba(t, e) {
        function n(t, e, n) {
            var i = document.createElement("input");
            i.name = e, i.value = n, t.appendChild(i)
        }
        var i = u.getVisitCount();
        null == i && (i = "0");
        var o = document.createElement("form");
        o.style.display = "none", n(o, "deploymentId", p.deploymentId), n(o, "orgId", p.orgId), n(o, "vc", i), n(o, "sid", v), n(o, "ptid", u.getPermanentId()), n(o, "det", f.jsonEncode(va)), n(o, "oref", u.getOref()), n(o, "pages", f.jsonEncode(A.getPages())), n(o, "sessionStart", (new Date).getTime() - A.getSessionStart()), n(o, "ent", f.jsonEncode(wa)), ba && n(o, "visitorName", ba), o.method = "POST", o.action = e, o.target = t, document.body.appendChild(o), o.submit()
    }

    function ca(t) {
        t ? f.log("Server Warning: " + t) : f.log("Server sent an anoymous warning.")
    }

    function xa(t) {
        t ? f.log("Server Error: " + t) : f.log("Server responded with an error."), aa()
    }
    if (!window.liveAgentDeployment) {
        window.liveAgentDeployment = !0;
        var n = {};
        window.liveagent && (n = window.liveagent), window.liveagent = n;
        var f = {
                getCookie: function (t) {
                    var e = document.cookie,
                        n = e.indexOf(t + "=");
                    return -1 == n ? null : (n += (t + "=").length, t = e.indexOf(";", n), -1 == t && (t = e.length), e.substring(n, t))
                },
                setCookie: function (t, e, n) {
                    t = t + "=" + e + ";", n && (n = new Date, n.setFullYear(n.getFullYear() + 10), t += "expires=" + n.toGMTString() + ";"), document.cookie = t + "path=/;"
                },
                addEventListener: function (t, e, n) {
                    if (t.addEventListener) t.addEventListener(e, n, !1);
                    else {
                        if (!t.attachEvent) throw Error("Could not add event listener");
                        t.attachEvent("on" + e, n, !1)
                    }
                },
                log: function (t) {
                    Q && window.console && window.console.log && window.console.log("LIVE AGENT: " + t)
                },
                logGroupStart: function (t) {
                    Q && window.console && (window.console.group ? window.console.groupCollapsed("LIVE AGENT: " + t) : f.log(t))
                },
                logGroupEnd: function () {
                    Q && window.console && window.console.group && window.console.groupEnd()
                },
                getLanguage: function () {
                    return void 0 !== window.navigator.language ? window.navigator.language : void 0 !== window.navigator.userLanguage ? window.navigator.userLanguage : ""
                },
                arrayHasItem: function (t, e) {
                    if (Array.prototype.indexOf) return -1 < t.indexOf(e);
                    for (var n = 0; n < t.length; n++)
                        if (t[n] == e) return !0
                },
                jsonEncode: function (t, e, n) {
                    function i(t) {
                        return a.lastIndex = 0, a.test(t) ? '"' + t.replace(a, function (t) {
                            var e = s[t];
                            return "string" == typeof e ? e : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
                        }) + '"' : '"' + t + '"'
                    }

                    function o(t, e) {
                        var n, r, a, s, f, h = l,
                            p = e[t];
                        switch (p && "object" == typeof p && "function" == typeof p.toJSON && (p = p.toJSON(t)), "function" == typeof c && (p = c.call(e, t, p)), typeof p) {
                            case "string":
                                return i(p);
                            case "number":
                                return isFinite(p) ? String(p) : "null";
                            case "boolean":
                            case "null":
                                return String(p);
                            case "object":
                                if (!p) return "null";
                                if (l += u, f = [], "[object Array]" === Object.prototype.toString.apply(p)) {
                                    for (s = p.length, n = 0; n < s; n += 1) f[n] = o(n, p) || "null";
                                    return a = 0 === f.length ? "[]" : l ? "[\n" + l + f.join(",\n" + l) + "\n" + h + "]" : "[" + f.join(",") + "]", l = h, a
                                }
                                if (c && "object" == typeof c)
                                    for (s = c.length, n = 0; n < s; n += 1) "string" == typeof c[n] && (r = c[n], (a = o(r, p)) && f.push(i(r) + (l ? ": " : ":") + a));
                                else
                                    for (r in p) Object.prototype.hasOwnProperty.call(Object(p), r) && (a = o(r, p)) && f.push(i(r) + (l ? ": " : ":") + a);
                                return a = 0 === f.length ? "{}" : l ? "{\n" + l + f.join(",\n" + l) + "\n" + h + "}" : "{" + f.join(",") + "}", l = h, a
                        }
                    }
                    if (void 0 !== window.JSON) return window.JSON.stringify(t, e, n);
                    if (void 0 === t || null === t) return "null";
                    var r, a = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                        s = {
                            "\b": "\\b",
                            "\t": "\\t",
                            "\n": "\\n",
                            "\f": "\\f",
                            "\r": "\\r",
                            '"': '\\"',
                            "\\": "\\\\"
                        },
                        l = "",
                        u = "",
                        c = e;
                    if ("number" == typeof n)
                        for (r = 0; r < n; r += 1) u += " ";
                    else "string" == typeof n && (u = n);
                    if (e && "function" != typeof e && ("object" != typeof e || "number" != typeof e.length)) throw Error("Error during JSON.stringify");
                    return o("", {
                        "": t
                    })
                },
                jsonDecode: function (a) {
                    if (a = String(a), void 0 !== window.JSON) return window.JSON.parse(a);
                    var b = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
                    if (b.lastIndex = 0, b.test(a) && (a = a.replace(b, function (t) {
                            return "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
                        })), /^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return eval("(" + a + ")");
                    throw Error("Error during JSON.parse")
                },
                getCssAnimation: function (t) {
                    var e = ["Webkit", "Moz", "O", "ms", "Khtml"];
                    if (void 0 !== t.style.animationName) return "";
                    for (var n = 0; n < e.length; n++)
                        if (void 0 !== t.style[e[n] + "AnimationName"]) return e[n].toLowerCase();
                    return null
                },
                addPrefixToURL: function (t, e, n) {
                    if (!f.isEmpty(t) && !f.isEmpty(e) && 0 !== t.indexOf(e)) {
                        n && (e = f.escapeToHtml(e));
                        var i = /(https?:\/\/)(.*)/i;
                        n = t.replace(i, "$1"), t = t.replace(i, "$2"), e = e.replace(i, "$2"), t = n + e + "/" + t
                    }
                    return t
                },
                getDomainFromUrl: function (t) {
                    if (f.isEmpty(t)) return "";
                    var e;
                    return da || (da = document.createElement("a")), e = da, e.href = t, t = t.match(/:(\d+)/g), e = e.protocol + "//" + e.hostname || window.location.protocol + "//" + window.location.hostname, t ? e + t[0] : e
                },
                isEmpty: function (t) {
                    return null === t || void 0 === t || "" === t
                },
                escapeToHtml: function (t) {
                    return null === t || void 0 === t || "" === t ? "" : t = t.replace(/[&<>"'\u00a9\u2028\u2029]/g, ya)
                }
            },
            da, u = {
                getVisitCount: function () {
                    var t = parseInt(f.getCookie("liveagent_vc"), 10);
                    return isNaN(t) ? null : t
                },
                getOref: function () {
                    return f.getCookie("liveagent_oref")
                },
                getPermanentId: function () {
                    var t = f.getCookie("liveagent_ptid");
                    return null != t ? t : ""
                },
                setVisitCount: function (t) {
                    f.setCookie("liveagent_vc", t, !0)
                },
                setOref: function (t) {
                    return f.setCookie("liveagent_oref", t, !0)
                },
                setPermanentId: function (t) {
                    f.setCookie("liveagent_ptid", t, !0)
                }
            },
            A = new function () {
                function t() {
                    return window.localStorage ? window.localStorage : window.sessionStorage
                }

                function e() {
                    var t = document.createElement("div");
                    return t.style.display = "none", document.body.appendChild(t), t.id = "liveagent_userdata_provider", t.addBehavior("#default#userData"), t.load("liveagent"), {
                        getItem: function (e) {
                            return t.getAttribute(e)
                        },
                        setItem: function (e, n) {
                            t.setAttribute(e, n), t.save("liveagent")
                        },
                        removeItem: function (e) {
                            t.removeAttribute(e), t.save("liveagent")
                        }
                    }
                }

                function n() {
                    o.setItem(i.SESSION_ID, v), o.setItem(i.PAGE_COUNT, "0"), o.setItem(i.SESSION_START, (new Date).getTime().toString())
                }
                var i = {
                    SESSION_ID: "liveAgentSid",
                    PAGE_COUNT: "liveAgentPc",
                    SESSION_START: "liveAgentStart",
                    PAGE: "liveAgentPage_",
                    PAGE_TIME: "liveAgentPageTime_"
                };
                t.isSupported = function () {
                    try {
                        return window.localStorage || window.sessionStorage
                    } catch (t) {
                        return !1
                    }
                }, e.isSupported = function () {
                    return document.createElement("div").addBehavior
                };
                var o;
                o = t.isSupported() ? t() : e.isSupported() ? e() : function () {
                    var t = {};
                    return {
                        getItem: function (e) {
                            return t[e]
                        },
                        setItem: function (e, n) {
                            t[e] = n
                        },
                        removeItem: function (e) {
                            delete t[e]
                        }
                    }
                }(), this.init = function () {
                    if (o.getItem(i.SESSION_ID)) {
                        if (o.getItem(i.SESSION_ID) != v) {
                            o.removeItem(i.SESSION_START);
                            for (var t = o.getItem(i.PAGE_COUNT), e = 25 > t ? 0 : t - 25; e < t; e++) o.removeItem(i.PAGE + e), o.removeItem(i.PAGE_TIME + e);
                            n()
                        }
                    } else n();
                    t = parseInt(o.getItem(i.PAGE_COUNT), 10), 25 <= t && (o.removeItem(i.PAGE + (t - 25)), o.removeItem(i.PAGE_TIME + (t - 25))), o.setItem(i.PAGE_COUNT, (t + 1).toString()), o.setItem(i.PAGE + t.toString(), window.location.href), o.setItem(i.PAGE_TIME + t.toString(), (new Date).getTime())
                }, this.getPageCount = function () {
                    return parseInt(o.getItem(i.PAGE_COUNT), 10)
                }, this.getSessionStart = function () {
                    return o.getItem(i.SESSION_START)
                }, this.getPages = function () {
                    for (var t = [], e = this.getPageCount(), n = 25 > e ? 0 : e - 25; n < e; n++) t.unshift({
                        location: o.getItem(i.PAGE + n.toString()),
                        time: ((new Date).getTime() - parseInt(o.getItem(i.PAGE_TIME + n.toString()), 10)).toString()
                    });
                    return t
                }, this.getCurrentPage = function () {
                    return o.getItem(i.PAGE + (this.getPageCount() - 1).toString())
                }, this.clear = function () {
                    o.clear()
                }
            };
        k.TYPE = {
            STANDARD: "STANDARD",
            INVITE: "INVITE",
            AGENT: "AGENT"
        }, k.EVENT = {
            BUTTON_AVAILABLE: "BUTTON_AVAILABLE",
            BUTTON_UNAVAILABLE: "BUTTON_UNAVAILABLE",
            BUTTON_ACCEPTED: "BUTTON_ACCEPTED",
            BUTTON_REJECTED: "BUTTON_REJECTED"
        }, k.prototype.init = function (t, e) {
            this.buttonId = t, this.type = e, this.onlineState = null, this.trackers = [], this.language = this.prechat = this.endpoint = null
        }, k.prototype.getType = function () {
            return this.type
        }, k.prototype.getOnlineState = function () {
            return this.onlineState
        }, k.prototype.setOnlineState = function (t) {
            this.onlineState = t;
            for (var e = 0; e < this.trackers.length; e++) this.trackers[e].setState(t)
        }, k.prototype.addTracker = function (t) {
            this.trackers.push(t)
        }, k.prototype.setPrechat = function (t) {
            this.prechat = t
        }, k.prototype.setEndpoint = function (t) {
            this.endpoint = t
        }, k.prototype.getEndpoint = function (t) {
            function e() {
                return (null != this.endpoint ? this.endpoint : p.contentServerUrl + p.chatPage) + "?language=" + (this.language ? this.language : "") + "#" + t
            }
            var n = null,
                n = null == this.prechat ? e.call(this) : this.prechat + "?endpoint=" + encodeURIComponent(e.call(this));
            return p.contentServerUrl + p.prechatHandler + "?endpoint=" + encodeURIComponent(n)
        }, k.prototype.setLanguage = function (t) {
            this.language = t
        }, k.prototype.startChat = function (t) {
            return !!this.dispatchEvent(k.EVENT.BUTTON_ACCEPTED) && (ua(this.buttonId, t), !0)
        }, k.prototype.rejectChat = function () {
            return !!this.dispatchEvent(k.EVENT.BUTTON_REJECTED)
        }, k.prototype.dispatchEvent = function (t) {
            return !ea.hasOwnProperty(this.buttonId) || !1 !== ea[this.buttonId].call(this, t)
        }, s.prototype.init = function (t, e) {
            this.buttonId = t, this.element = e
        }, s.prototype.getId = function () {
            return this.buttonId
        }, s.prototype.setState = function (t) {
            return f.log("Setting state for button " + this.buttonId + " to " + (t ? "online" : "offline")), !!l[this.buttonId].dispatchEvent(t ? k.EVENT.BUTTON_AVAILABLE : k.EVENT.BUTTON_UNAVAILABLE)
        }, ia.prototype = new k, R.prototype = new k, R.prototype.startChat = function (t, e) {
            if (this.dispatchEvent(k.EVENT.BUTTON_ACCEPTED)) {
                var n = this.buttonId.split("_");
                return ua(n[1], t, n[0], e), !0
            }
            return !1
        }, S.prototype = new s, S.prototype.setState = function (t) {
            s.prototype.setState.call(this, t) && (this.element.style.display = t ? "" : "none")
        }, T.prototype = new s, T.prototype.setState = function (t) {
            s.prototype.setState.call(this, t) && (this.element.style.display = t ? "none" : "")
        };
        var fa = !1,
            F = null,
            ga = {},
            G = {};
        h.prototype = new k, h.RENDERER = {
            Slide: {
                renderClass: I
            },
            Fade: {
                renderClass: J
            },
            Appear: {
                renderClass: L
            },
            Custom: {
                renderClass: D
            }
        }, h.START_POSITION = {
            TopLeft: {
                xPercent: 0,
                xPosition: -1,
                xOffset: -1,
                yPercent: 0,
                yPosition: -1,
                yOffset: -1
            },
            TopLeftTop: {
                xPercent: 0,
                xPosition: 0,
                xOffset: 1,
                yPercent: 0,
                yPosition: -1,
                yOffset: -1
            },
            Top: {
                xPercent: .5,
                xPosition: -.5,
                xOffset: 0,
                yPercent: 0,
                yPosition: -1,
                yOffset: -1
            },
            TopRightTop: {
                xPercent: 1,
                xPosition: -1,
                xOffset: -1,
                yPercent: 0,
                yPosition: -1,
                yOffset: -1
            },
            TopRight: {
                xPercent: 1,
                xPosition: 0,
                xOffset: 1,
                yPercent: 0,
                yPosition: -1,
                yOffset: -1
            },
            TopRightRight: {
                xPercent: 1,
                xPosition: 0,
                xOffset: 1,
                yPercent: 0,
                yPosition: 0,
                yOffset: 1
            },
            Right: {
                xPercent: 1,
                xPosition: 0,
                xOffset: 1,
                yPercent: .5,
                yPosition: -.5,
                yOffset: 0
            },
            BottomRightRight: {
                xPercent: 1,
                xPosition: 0,
                xOffset: 1,
                yPercent: 1,
                yPosition: -1,
                yOffset: -1
            },
            BottomRight: {
                xPercent: 1,
                xPosition: 0,
                xOffset: 1,
                yPercent: 1,
                yPosition: 0,
                yOffset: 1
            },
            BottomRightBottom: {
                xPercent: 1,
                xPosition: -1,
                xOffset: -1,
                yPercent: 1,
                yPosition: 0,
                yOffset: 1
            },
            Bottom: {
                xPercent: .5,
                xPosition: -.5,
                xOffset: 0,
                yPercent: 1,
                yPosition: 0,
                yOffset: 1
            },
            BottomLeftBottom: {
                xPercent: 0,
                xPosition: 0,
                xOffset: 1,
                yPercent: 1,
                yPosition: 0,
                yOffset: 1
            },
            BottomLeft: {
                xPercent: 0,
                xPosition: -1,
                xOffset: -1,
                yPercent: 1,
                yPosition: 0,
                yOffset: 1
            },
            BottomLeftLeft: {
                xPercent: 0,
                xPosition: -1,
                xOffset: -1,
                yPercent: 1,
                yPosition: -1,
                yOffset: -1
            },
            Left: {
                xPercent: 0,
                xPosition: -1,
                xOffset: -1,
                yPercent: .5,
                yPosition: -.5,
                yOffset: 0
            },
            TopLeftLeft: {
                xPercent: 0,
                xPosition: -1,
                xOffset: -1,
                yPercent: 0,
                yPosition: 0,
                yOffset: 1
            }
        }, h.END_POSITION = {
            TopLeft: {
                xPercent: 0,
                xOffset: 1,
                yPercent: 0,
                yOffset: 1
            },
            Top: {
                xPercent: .5,
                xOffset: 0,
                yPercent: 0,
                yOffset: 1
            },
            TopRight: {
                xPercent: 1,
                xOffset: -1,
                yPercent: 0,
                yOffset: 1
            },
            Left: {
                xPercent: 0,
                xOffset: 1,
                yPercent: .5,
                yOffset: 0
            },
            Center: {
                xPercent: .5,
                xOffset: 0,
                yPercent: .5,
                yOffset: 0
            },
            Right: {
                xPercent: 1,
                xOffset: -1,
                yPercent: .5,
                yOffset: 0
            },
            BottomLeft: {
                xPercent: 0,
                xOffset: 1,
                yPercent: 1,
                yOffset: -1
            },
            Bottom: {
                xPercent: .5,
                xOffset: 0,
                yPercent: 1,
                yOffset: -1
            },
            BottomRight: {
                xPercent: 1,
                xOffset: -1,
                yPercent: 1,
                yOffset: -1
            }
        }, h.prototype.setRules = function (t, e) {
            if (t && e) {
                for (var n in t) {
                    var i = t[n],
                        o = null;
                    switch (i.type) {
                        case m.TYPE.NUMBER_OF_PAGE_VIEWS:
                            o = new M(i.order, this.buttonId, A.getPageCount(), i.operator, parseInt(i.value, 10));
                            break;
                        case m.TYPE.URL_MATCH:
                            o = new M(i.order, this.buttonId, A.getCurrentPage(), i.operator, i.value);
                            break;
                        case m.TYPE.SECONDS_ON_PAGE:
                            o = new N(i.order, this.buttonId, (new Date).getTime(), i.operator, 1e3 * parseInt(i.value, 10));
                            break;
                        case m.TYPE.SECONDS_ON_SITE:
                            o = new N(i.order, this.buttonId, parseInt(A.getSessionStart(), 10), i.operator, 1e3 * parseInt(i.value, 10));
                            break;
                        case m.TYPE.CUSTOM_VARIABLE:
                            o = new U(i.order, this.buttonId, i.name, i.operator, i.value), G.hasOwnProperty(i.name) || (G[i.name] = []), G[i.name].push(this.buttonId)
                    }
                    null != o && this.addRule(o)
                }
                this.filterLogic = e, this.ruleTree = E(e)
            }
        }, h.prototype.setOnlineState = function (t) {
            !t && null !== this.inviteTimeout && (clearTimeout(this.inviteTimeout), this.inviteTimeout = null), !t && null !== this.autoRejectTimeout && (clearTimeout(this.autoRejectTimeout), this.autoRejectTimeout = null), k.prototype.setOnlineState.call(this, t)
        }, h.prototype.isActive = function () {
            return this.active
        }, h.prototype.setActive = function (t) {
            this.active = t
        }, h.prototype.addTracker = function (t) {
            this.trackers = [], k.prototype.addTracker.call(this, t)
        }, h.prototype.getTracker = function () {
            if (1 != this.trackers.length) throw Error("InviteButtons should have exactly 1 tracker");
            return this.trackers[0]
        }, h.prototype.startChat = function (t) {
            return !(!this.active || !k.prototype.startChat.call(this, t)) && (this.getTracker().accept(), !0)
        }, h.prototype.rejectChat = function () {
            return !(!this.active || !k.prototype.rejectChat.call(this)) && (this.getTracker().reject(), !0)
        }, h.prototype.trigger = function () {
            if (f.getCookie("liveagent_invite_rejected_" + this.buttonId)) return !1;
            var t = !0;
            if (null != this.ruleTree && (f.logGroupStart("Invite " + this.buttonId + " Rule Evaluation"), f.log("Filter Logic: " + this.filterLogic), t = this.ruleTree.evaluate(this), f.logGroupEnd()), !t && null != this.inviteDelay) {
                var e = this;
                this.inviteTimeout = window.setTimeout(function () {
                    e.setOnlineState(!0)
                }, this.inviteDelay), this.inviteDelay = null
            }
            return t
        }, h.prototype.addRule = function (t) {
            this.rules[t.getId()] = t
        }, h.prototype.getRule = function (t) {
            return this.rules[t]
        }, h.prototype.getInviteDelay = function () {
            return this.inviteDelay
        }, h.prototype.setInviteDelay = function (t) {
            f.log("Setting invite delay to: " + t), this.inviteDelay = t
        }, h.prototype.setAutoRejectTimeout = function (t) {
            this.autoRejectTimeout = t
        }, z.prototype = new s, z.prototype.setState = function (e) {
            e && !fa && t(this.buttonId).trigger() && s.prototype.setState.call(this, !0) ? (fa = !0, F = this.buttonId, this.renderer.render()) : !e && t(this.buttonId).isActive() && s.prototype.setState.call(this, !1) && (fa = !1, this.remove(!0))
        }, z.prototype.renderFinish = function () {
            if (t(this.buttonId).setActive(!0), -1 != this.rejectTime) {
                var e = this.buttonId;
                t(this.buttonId).setAutoRejectTimeout(window.setTimeout(function () {
                    t(e).rejectChat()
                }, 1e3 * this.rejectTime))
            }
            this.renderer.renderFinish()
        }, z.prototype.accept = function () {
            this.hasInviteAfterAccept || f.setCookie("liveagent_invite_rejected_" + this.buttonId, !0, !1), this.remove(!1)
        }, z.prototype.reject = function () {
            this.hasInviteAfterReject || f.setCookie("liveagent_invite_rejected_" + this.buttonId, !0, !1), this.remove(!0)
        }, z.prototype.remove = function (e) {
            t(this.buttonId).setActive(!1), this.renderer.remove(e)
        }, z.prototype.removeFinish = function () {
            this.renderer.remove(!1)
        }, r.prototype.init = function (t, e, n, i) {
            window.innerWidth ? this.realWidth = window.innerWidth : document.documentElement && document.documentElement.clientWidth ? this.realWidth = document.documentElement.clientWidth : document.body && (this.realWidth = document.body.clientWidth), window.innerHeight ? this.realHeight = window.innerHeight : document.documentElement && document.documentElement.clientHeight ? this.realHeight = document.documentElement.clientHeight : document.body && (this.realHeight = document.body.clientHeight), this.offset = 25, this.buttonId = t, this.animationPrefix = f.getCssAnimation(e), this.element = e, this.element.style.position = null !== this.animationPrefix ? "fixed" : "absolute", this.element.style.left = "-1000px", this.element.style.top = "-1000px", this.element.style.zIndex = "10000", this.element.style.display = "", this.width = this.element.offsetWidth, this.height = this.element.offsetHeight, this.startPosition = n, this.endPosition = i
        }, r.prototype.render = function () {
            this.element.style.display = ""
        }, r.prototype.renderFinish = function () {}, r.prototype.remove = function (t) {
            this.element.style.left = "-1000px", this.element.style.top = "-1000px"
        }, r.prototype.addRenderListeners = function () {
            var t = this.buttonId,
                e = "AnimationIteration",
                n = "AnimationEnd";
            "" == this.animationPrefix ? (e = e.toLowerCase(), n = n.toLowerCase()) : (e = this.animationPrefix + e, n = this.animationPrefix + n), f.addEventListener(this.element, e, function () {
                C(t).renderFinish()
            }), f.addEventListener(this.element, n, function () {
                C(t).removeFinish()
            })
        }, I.prototype = new r, I.prototype.render = function () {
            r.prototype.addRenderListeners.call(this);
            var t = this.width * this.startPosition.xPosition + this.offset * this.startPosition.xOffset,
                e = this.height * this.startPosition.yPosition + this.offset * this.startPosition.yOffset,
                n = -1 * this.width * this.endPosition.xPercent + this.offset * this.endPosition.xOffset,
                i = -1 * this.height * this.endPosition.yPercent + this.offset * this.endPosition.yOffset,
                o = "";
            "" !== this.animationPrefix && (o = "-" + this.animationPrefix + "-");
            var a = document.createElement("style");
            a.innerHTML = "@" + o + "keyframes slide" + this.buttonId + "{from { margin-left: " + t + "px; margin-top: " + e + "px; left: " + 100 * this.startPosition.xPercent + "%; top: " + 100 * this.startPosition.yPercent + "%; }to { margin-left: " + n + "px; margin-top: " + i + "px; left: " + 100 * this.endPosition.xPercent + "%; top: " + 100 * this.endPosition.yPercent + "%; }}", document.getElementsByTagName("head")[0].appendChild(a), this.element.style[o + "animation-name"] = "slide" + this.buttonId, this.element.style[o + "animation-duration"] = "1s", this.element.style[o + "animation-iteration-count"] = "2", this.element.style[o + "animation-direction"] = "alternate", this.element.style[o + "animation-timing-function"] = "ease-in-out", this.element.style.setProperty(o + "animation-name", "slide" + this.buttonId, ""), this.element.style.setProperty(o + "animation-duration", "1s", ""), this.element.style.setProperty(o + "animation-iteration-count", "2", ""), this.element.style.setProperty(o + "animation-direction", "alternate", ""), this.element.style.setProperty(o + "animation-timing-function", "ease-in-out", ""), r.prototype.render.call(this)
        }, I.prototype.renderFinish = function () {
            var t = "";
            "" !== this.animationPrefix && (t = "-" + this.animationPrefix + "-"), this.element.style[t + "animation-play-state"] = "paused", this.element.style.setProperty(t + "animation-play-state", "paused", "")
        }, I.prototype.remove = function (t) {
            var e = "";
            "" !== this.animationPrefix && (e = "-" + this.animationPrefix + "-"), t ? (this.element.style[e + "animation-play-state"] = "running", this.element.style.setProperty(e + "animation-play-state", "running", "")) : (this.element.style[e + "animation-name"] = "", this.element.style.setProperty(e + "animation-name", "", ""), r.prototype.remove.call(this, t))
        }, J.prototype = new r, J.prototype.render = function () {
            r.prototype.addRenderListeners.call(this);
            var t = "";
            "" !== this.animationPrefix && (t = "-" + this.animationPrefix + "-");
            var e = document.createElement("style");
            e.innerHTML = "@" + t + "keyframes fade" + this.buttonId + "{from { opacity: 0; }to { opacity: 1; }}", document.getElementsByTagName("head")[0].appendChild(e), this.element.style[t + "animation-name"] = "fade" + this.buttonId, this.element.style[t + "animation-duration"] = "1s", this.element.style[t + "animation-iteration-count"] = "2", this.element.style[t + "animation-direction"] = "alternate", this.element.style[t + "animation-timing-function"] = "ease-in-out", this.element.style.setProperty(t + "animation-name", "fade" + this.buttonId, ""), this.element.style.setProperty(t + "animation-duration", "1s", ""), this.element.style.setProperty(t + "animation-iteration-count", "2", ""), this.element.style.setProperty(t + "animation-direction", "alternate", ""), this.element.style.setProperty(t + "animation-timing-function", "ease-in-out", ""), this.element.style.marginLeft = -1 * this.width * this.endPosition.xPercent + this.offset * this.endPosition.xOffset + "px", this.element.style.left = 100 * this.endPosition.xPercent + "%", this.element.style.marginTop = -1 * this.height * this.endPosition.yPercent + this.offset * this.endPosition.yOffset + "px", this.element.style.top = 100 * this.endPosition.yPercent + "%", r.prototype.render.call(this)
        }, J.prototype.renderFinish = function () {
            var t = "";
            "" !== this.animationPrefix && (t = "-" + this.animationPrefix + "-"), this.element.style[t + "animation-play-state"] = "paused", this.element.style.setProperty(t + "animation-play-state", "paused", "")
        }, J.prototype.remove = function (t) {
            var e = "";
            "" !== this.animationPrefix && (e = "-" + this.animationPrefix + "-"), t ? (this.element.style[e + "animation-play-state"] = "running", this.element.style.setProperty(e + "animation-play-state", "running", ""), this.element.style.opacity = 0) : (this.element.style[e + "animation-name"] = "", this.element.style.setProperty(e + "animation-name", "", ""), r.prototype.remove.call(this, t))
        }, L.prototype = new r, L.prototype.render = function () {
            this.element.style.marginLeft = -1 * this.width * this.endPosition.xPercent + this.offset * this.endPosition.xOffset + "px", this.element.style.left = 100 * this.endPosition.xPercent + "%", this.element.style.marginTop = -1 * this.height * this.endPosition.yPercent + this.offset * this.endPosition.yOffset + "px", this.element.style.top = 100 * this.endPosition.yPercent + "%", r.prototype.render.call(this), C(this.buttonId).renderFinish()
        }, L.prototype.remove = function (t) {
            t ? C(this.buttonId).removeFinish() : r.prototype.remove.call(this, t)
        }, D.prototype = new r, D.prototype.render = function () {
            C(this.buttonId).renderFinish()
        }, D.prototype.renderFinish = function () {}, D.prototype.remove = function (t) {
            t && C(this.buttonId).removeFinish()
        }, m.TYPE = {
            NUMBER_OF_PAGE_VIEWS: "NUMBER_OF_PAGE_VIEWS",
            URL_MATCH: "URL_MATCH",
            SECONDS_ON_PAGE: "SECONDS_ON_PAGE",
            SECONDS_ON_SITE: "SECONDS_ON_SITE",
            CUSTOM_VARIABLE: "CUSTOM_VARIABLE"
        }, m.OPERATOR = {
            EQUALS: "EQUALS",
            NOT_EQUAL: "NOT_EQUAL",
            START_WITH: "START_WITH",
            CONTAINS: "CONTAINS",
            NOT_CONTAIN: "NOT_CONTAIN",
            LESS_THAN: "LESS_THAN",
            GREATER_THAN: "GREATER_THAN",
            LESS_OR_EQUAL: "LESS_OR_EQUAL",
            GREATER_OR_EQUAL: "GREATER_OR_EQUAL"
        }, m.prototype.init = function (t, e, n, i, o) {
            this.ruleId = t, this.buttonId = e, this.compareFrom = n, this.operator = i, this.compareTo = o
        }, m.prototype.getId = function () {
            return this.ruleId
        }, m.prototype.evaluate = function (t, e) {
            switch (this.operator) {
                case m.OPERATOR.EQUALS:
                    return f.log("Evaluate: " + t + " == " + e), t == e;
                case m.OPERATOR.NOT_EQUAL:
                    return f.log("Evaluate: " + t + " != " + e), t != e;
                case m.OPERATOR.START_WITH:
                    return f.log("Evaluate: " + t + " indexOf " + e + " == 0"), 0 == t.indexOf(e);
                case m.OPERATOR.CONTAINS:
                    return f.log("Evaluate: " + t + " indexOf " + e + " != -1"), -1 != t.indexOf(e);
                case m.OPERATOR.NOT_CONTAIN:
                    return f.log("Evaluate: " + t + " indexOf " + e + " == -1"), -1 == t.indexOf(e);
                case m.OPERATOR.LESS_THAN:
                    return f.log("Evaluate: " + parseFloat(t) + " < " + parseFloat(e)), parseFloat(t) < parseFloat(e);
                case m.OPERATOR.GREATER_THAN:
                    return f.log("Evaluate: " + parseFloat(t) + " > " + parseFloat(e)), parseFloat(t) > parseFloat(e);
                case m.OPERATOR.LESS_OR_EQUAL:
                    return f.log("Evaluate: " + parseFloat(t) + " <= " + parseFloat(e)), parseFloat(t) <= parseFloat(e);
                case m.OPERATOR.GREATER_OR_EQUAL:
                    return f.log("Evaluate: " + parseFloat(t) + " >= " + parseFloat(e)), parseFloat(t) >= parseFloat(e)
            }
        }, M.prototype = new m, M.prototype.evaluate = function () {
            return f.log("Evaluating StandardInviteRule"), m.prototype.evaluate.call(this, this.compareFrom, this.compareTo)
        }, N.prototype = new m, N.prototype.evaluate = function () {
            f.log("Evaluating TimerInviteRule");
            var e = (new Date).getTime() - this.compareFrom,
                n = m.prototype.evaluate.call(this, e, this.compareTo);
            return !n && e <= this.compareTo && (e = this.compareTo - e, (null == t(this.buttonId).getInviteDelay() || e < t(this.buttonId).getInviteDelay()) && t(this.buttonId).setInviteDelay(e)), n
        }, U.prototype = new m, U.prototype.evaluate = function () {
            return ga.hasOwnProperty(this.compareFrom) ? (f.log("Evaluating CustomInviteRule"), m.prototype.evaluate.call(this, ga[this.compareFrom].toString(), this.compareTo)) : (f.log("CustomInviteRule evaluation failed due to missing custom variable"), !1)
        };
        var ka = 0;
        y.prototype.init = function (t, e) {
            this.left = t, this.right = e
        }, y.prototype.evaluate = function (t) {
            return !1
        }, Y.prototype = new y, Y.prototype.evaluate = function (t) {
            return f.log("Evaluating Atom Node: " + this.ruleId), t.getRule(this.ruleId).evaluate()
        }, V.prototype = new y, V.prototype.evaluate = function (t) {
            return f.logGroupStart("Evaluating And Node"), t = this.left.evaluate(t) && this.right.evaluate(t), f.logGroupEnd(), t
        }, W.prototype = new y, W.prototype.evaluate = function (t) {
            return f.logGroupStart("Evaluating Or Node"), t = this.left.evaluate(t) || this.right.evaluate(t), f.logGroupEnd(), t
        }, X.prototype = new y, X.prototype.evaluate = function (t) {
            return f.logGroupStart("Evaluating Not Node"), t = !this.left.evaluate(t), f.logGroupEnd(), t
        }, la.prototype.toJSON = function () {
            return {
                label: this.getLabel(),
                value: this.getValue(),
                displayToAgent: this.getDisplayToAgent(),
                entityMaps: this.getMapper().getEntityMaps(),
                transcriptFields: this.getMapper().getTranscriptFields(),
                doKnowledgeSearch: this.getDoKnowledgeSearch()
            }
        }, Z.prototype.map = function (t, e, n, i, o) {
            void 0 === n && (n = !0), void 0 === i && (i = !0), void 0 === o && (o = !0), this.getEntityMaps().push(new ma(t, e, n, i, o))
        }, Z.prototype.saveToTranscript = function (t) {
            this.getTranscriptFields().push(t)
        }, ma.prototype.toJSON = function () {
            return {
                entityName: this.getEntityName(),
                fieldName: this.getFieldName(),
                fastFill: this.getFastFill(),
                autoQuery: this.getAutoQuery(),
                exactMatch: this.getExactMatch()
            }
        };
        var H = {};
        n._ = H, H.handlePing = function (t) {
            q.connection.handlePing(t)
        }, H.error = function (t) {
            t ? f.log("Server Error: " + t) : f.log("Server responded with an error."), aa()
        }, H.warning = function (t) {
            t ? f.log("Server Warning: " + t) : f.log("Server sent an anoymous warning.")
        }, H.setNewPtid = function (t) {
            u.setPermanentId(t)
        }, H.clearStorage = function () {
            A.clear()
        }, n.init = function (t, e, n) {
            if ("string" != typeof t || "string" != typeof e || "string" != typeof n) throw Error("The parameters to init must be strings");
            p.url = t, p.deploymentId = e, p.orgId = n, f.log("System Initialized. Waiting for the DOM to be ready"), "complete" === document.readyState ? setTimeout(O, 1) : document.addEventListener ? (document.addEventListener("DOMContentLoaded", O, !1), window.addEventListener("load", O, !1)) : window.attachEvent ? window.attachEvent("onload", O) : f.log("No available event model. Exiting.")
        }, n.getSid = function () {
            return v
        }, n.enableLogging = function () {
            Q = !0
        }, n.setLocation = function (t) {}, n.setChatWindowWidth = function (t) {
            p.chatWindowWidth = t
        }, n.setChatWindowHeight = function (t) {
            p.chatWindowHeight = t
        }, n.disconnect = function () {
            aa()
        }, n.startChat = function (t, e, n) {
            (e ? K(t, e) : l[t]).startChat("liveagent" + Math.round(1e5 * Math.random()) + (new Date).getTime(), n)
        }, n.startChatWithWindow = function (t, e, n, i) {
            (n ? K(t, n) : l[t]).startChat(e, i)
        }, n.rejectChat = function (t) {
            l[t].rejectChat()
        }, n.showWhenOnline = function (t, e, n) {
            if (q.connection.isRunning()) throw Error("You cannot add a button after page initialization.");
            t = n ? K(t, n) : ja(t), t.addTracker(new S(t.buttonId, e))
        }, n.showWhenOffline = function (t, e, n) {
            if (q.connection.isRunning()) throw Error("You cannot add a button after page initialization.");
            t = n ? K(t, n) : ja(t), t.addTracker(new T(t.buttonId, e))
        }, n.addCustomDetail = function (t, e, n) {
            if (q.connection.isRunning()) throw Error("You cannot add a detail after page initialization.");
            if (void 0 === t || void 0 === e || null === t || null === e) throw Error("CustomDetail contains null value");
            var i = new la(t, e, n);
            va.push(i);
            var o = {
                map: function (t, e, n, r, a) {
                    if (void 0 === t || null === t || void 0 === e || null === e || null === n || null === r || null === a) throw Error("CustomDetail.map contains null value");
                    return i.getMapper().map(t, e, n, r, a), o
                },
                saveToTranscript: function (t) {
                    if (void 0 === t || null === t) throw Error("CustomDetail.saveToTranscript contains null value");
                    return i.getMapper().saveToTranscript(t), o
                },
                doKnowledgeSearch: function () {
                    return i.setDoKnowledgeSearch(), o
                }
            };
            return o
        }, n.setName = function (t) {
            if (q.connection.isRunning()) throw Error("You cannot set the name after page initialization.");
            ba = t
        }, n.addButtonEventHandler = function (t, e) {
            "function" == typeof e && (ea[t] = e)
        }, n.BUTTON_EVENT = k.EVENT, n.setCustomVariable = function (e, n) {
            if (ga[e] = n, G.hasOwnProperty(e))
                for (var i = 0; i < G[e].length; i++) {
                    var o = t(G[e][i]);
                    o.getOnlineState() && o.setOnlineState(!0)
                }
        }, n.findOrCreate = function (t) {
            if (q.connection.isRunning()) throw Error("You cannot find or create after page initialization.");
            var e = new na(t);
            wa.push(e);
            var n = {
                map: function (t, i, o, r, a) {
                    return e.getEntityMapper().map(t, i, o, r, a), n
                },
                saveToTranscript: function (t) {
                    return e.setSaveTranscript(t), n
                },
                showOnCreate: function () {
                    return e.setShowOnCreate(!0), n
                },
                linkToEntity: function (t, i) {
                    return ha.hasOwnProperty(t) && ha[t] == e.getEntityName() ? (ca("Warning: Recursive links detected, skip link " + e.getEntityName() + " to " + t), n) : (e.setLinkToEntityName(t), e.setLinkToEntityField(i), ha[e.getEntityName()] = t, n)
                }
            };
            return n
        };
        var q = {
            VisitorMessage: {
                ERROR: "Error",
                WARNING: "Warning"
            },
            SystemMessage: {
                ASYNC_RESULT: "AsyncResult",
                SWITCH_SERVER: "SwitchServer"
            }
        };
        ! function () {
            var t = null,
                e = !1,
                n = null,
                i = null,
                o = {};
            ! function () {
                o.send = function (e, r) {
                    if (null !== n) o.onError.call(window, "Did not handle response before sending another message");
                    else {
                        void 0 === r && (r = {});
                        var a = "Visitor",
                            s = "",
                            l = !1;
                        for (1 < e.length ? (a = "System", s = "MultiNoun", r.nouns = "", l = !0) : s = e[0].getName(), a = p.url + "/rest/" + a + "/" + s + ".jsonp?", s = 0; s < e.length; s++) {
                            l && (r.nouns += e[s].getName() + ","), r[e[s].getName() + ".prefix"] = "Visitor";
                            for (var u in e[s].getData()) e[s].getData().hasOwnProperty(u) && (r[e[s].getName() + "." + u] = e[s].getData()[u])
                        }
                        l && (r.nouns = r.nouns.substr(0, r.nouns.length - 1));
                        for (var c in r) r.hasOwnProperty(c) && (a += c + "=" + r[c] + "&");
                        a += "callback=" + t, a += "&deployment_id=" + p.deploymentId, a += "&org_id=" + p.orgId, a += "&version=31", l = document.createElement("script"), l.type = "text/javascript", l.src = a, n = document.body.appendChild(l), i = window.setTimeout(function () {
                            o.onError.call(window, "Server failed to respond.")
                        }, p.pingTimeout)
                    }
                }, o.handlePing = function (t) {
                    i && (clearTimeout(i), i = null), e = !0, t = t.messages;
                    for (var r = 0; r < t.length; r++) o.messageHandler.call(window, t[r].type, t[r].message);
                    o.onSuccess.call(window), null !== n && (document.body.removeChild(n), n = null)
                }, o.messageHandler = function (t, e) {}, o.onSuccess = function () {}, o.onError = function (t) {}, o.isRunning = function () {
                    return e
                }, o.setIsRunning = function (t) {
                    e = t
                }, o.setCallback = function (e) {
                    t = e
                }
            }(), q.connection = o, q.Noun = function (t, e) {
                this.getName = function () {
                    return t
                }, this.getData = function () {
                    return e
                }
            }
        }(), na.prototype.toJSON = function () {
            return {
                entityName: this.getEntityName(),
                saveToTranscript: this.getSaveTranscript(),
                showOnCreate: this.getShowOnCreate(),
                linkToEntityName: this.getLinkToEntityName(),
                linkToEntityField: this.getLinkToEntityField(),
                entityFieldsMaps: this.getEntityMapper().getEntityFieldsMaps()
            }
        }, oa.prototype.map = function (t, e, n, i, o) {
            void 0 === n && (n = !0), void 0 === i && (i = !0), void 0 === o && (o = !0), this.getEntityFieldsMaps().push(new pa(t, e, n, i, o))
        }, pa.prototype.toJSON = function () {
            return {
                fieldName: this.getFieldName(),
                label: this.getLabel(),
                doFind: this.getDoFind(),
                isExactMatch: this.getIsExactMatch(),
                doCreate: this.getDoCreate()
            }
        };
        var v = f.getCookie("liveagent_sid"),
            $ = f.getCookie("liveagent_chatted"),
            qa = !1,
            Q = !1,
            l = {},
            va = [],
            wa = [],
            ba = null,
            ea = {},
            P = null,
            ha = {},
            p = {
                url: null,
                deploymentId: null,
                orgId: null,
                pingRate: null,
                pingTimeout: 5e3,
                chatWindowWidth: 482,
                chatWindowHeight: 350,
                contentServerUrl: null,
                chatPage: "/s/chat",
                prechatHandler: "/s/prechatVisitor"
            };
        q.connection.messageHandler = function (e, n) {
            switch (e) {
                case "VisitorId":
                    n.sessionId && (f.log("Received new session ID"), v = n.sessionId, document.cookie = "liveagent_sid=" + encodeURIComponent(v) + ";path=/;", null != u.getVisitCount() && u.setVisitCount(u.getVisitCount() + 1), u.getPermanentId() || u.setPermanentId(v));
                    break;
                case "Settings":
                    A.init(), f.log("Ping rate set to " + n.pingRate + "ms"), p.pingRate = n.pingRate, p.contentServerUrl = n.contentServerUrl;
                    for (var i = 0; i < n.buttons.length; i++) switch (n.buttons[i].type) {
                        case "ToAgent":
                        case "Standard":
                            var o = n.buttons[i],
                                r = l[o.id];
                            r && ta(r, o);
                            break;
                        case "Invite":
                            var o = n.buttons[i],
                                a = null,
                                a = o.inviteImageUrl ? za(o.id, o.inviteImageUrl, o.inviteImageWidth, o.inviteImageHeight) : document.getElementById("liveagent_invite_button_" + o.id);
                            null == a ? ca("Warning: Button " + o.id + " disabled because HTML element was not found") : (r = t(o.id), r.addTracker(new z(o.id, a, o.inviteRenderer, o.inviteStartPosition, o.inviteEndPosition, o.hasInviteAfterAccept, o.hasInviteAfterReject, o.inviteRejectTime)), a = f.jsonDecode(o.inviteRules), r.setRules(a.rules, a.filter), ta(r, o))
                    }
                    break;
                case "Availability":
                    for (i = {}, o = 0; o < n.results.length; o++)(r = l[n.results[o].id]) && (i[n.results[o].id] = {
                        button: r,
                        isAvailable: n.results[o].isAvailable
                    });
                    null != F && i.hasOwnProperty(F) && (i[F].button.setOnlineState(i[F].isAvailable), delete i[F]);
                    for (a in i) i.hasOwnProperty(a) && i[a].button.setOnlineState(i[a].isAvailable);
                    break;
                case q.VisitorMessage.WARNING:
                    ca(n.text);
                    break;
                case q.VisitorMessage.ERROR:
                    xa(n.text);
                    break;
                case q.SystemMessage.SWITCH_SERVER:
                    if ("string" != typeof (i = n.newUrl)) throw Error("Trying to set invalid LiveAgent server url: " + i);
                    p.url = i, f.log("Received updated LiveAgent server url: " + i + "! Consider updating this site's deployment code."), v = null
            }
        }, q.connection.onSuccess = function () {
            null !== P && clearTimeout(P), P = window.setTimeout(Aa, p.pingRate)
        }, q.connection.onError = function (t) {
            xa(t)
        }
    }
}();
! function (t, e) {
    function i(e) {
        this.settings = t.extend({}, o, e)
    }
    var o = {
        buttonSel: ".closable-close",
        animateTo: {
            opacity: 0,
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            padding: 0
        },
        cookieName: "cl",
        cookiePath: null,
        cookieMaxAge: 31536e3,
        idDataAttr: "closable-id",
        id: null,
        onClose: t.noop
    };
    i.prototype = {
        init: function (e) {
            this.el = e, null === this.settings.id ? (this.closableId = t(this.el).data("closable-id"), this.closableId = this.closableId ? String(this.closableId) : null) : this.closableId = this.settings.id, t(e).on("click", this.settings.buttonSel, this, this.handler.closeButtonClick)
        },
        persistClosedState: function () {
            var t;
            this.settings.cookieName && this.closableId && this.closableId.length && (t = this.getCookieValue(this.settings.cookieName), t ? new RegExp("(^|,)" + this.closableId + "(,|$)").test(t) || (t += "," + this.closableId) : t = this.closableId, e.cookie = this.settings.cookieName + "=" + t + ";max-age=" + this.settings.cookieMaxAge + ("string" == typeof this.settings.cookiePath ? ";path=" + this.settings.cookiePath : ""))
        },
        getCookieValue: function (t) {
            var i = encodeURIComponent(t).replace(/[\-\.\+\*]/g, "\\$&"),
                o = e.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + i + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1");
            return decodeURIComponent(o) || null
        },
        handler: {
            closeButtonClick: function (e) {
                var i = e.data;
                e.stopPropagation(), e.preventDefault(), t(e.delegateTarget).animate(i.settings.animateTo), i.persistClosedState.call(i), i.settings.onClose.call(e.delegateTarget)
            }
        },
        method: {
            close: function (e) {
                t(e).find(this.settings.buttonSel).trigger("click")
            }
        }
    }, t.fn.closeable = function (e, o) {
        var s = o,
            n = e;
        return "string" != typeof n && (s = n, n = !1), this.each(function () {
            var e = t(this),
                o = e.data("closable");
            o || (o = new i(s), o.init(this), e.data("closable", o)), n && "function" == typeof o.method[n] && o.method[n].call(o, this)
        })
    }
}(jQuery, document);
! function (a, e) {
    var l;
    a.carbonGlobals && a.carbonGlobals.lazyCssPath && (l = e.createElement("link"), l.rel = "stylesheet", l.href = a.carbonGlobals.lazyCssPath, e.getElementsByTagName("head")[0].appendChild(l))
}(window, document);
! function (t) {
    function e(t) {
        return t.$input.val()
    }

    function n(t) {
        return t.$suggestionContainer.find($.classListToSelector(t.options.classes.groupListItem))
    }

    function i(t) {
        var e = "." + t.options.classes.groupListItem,
            n = "." + t.options.classes.activeGroupListItem,
            i = t.$suggestionContainer,
            s = i.find(e),
            o = i.find(n + e);
        return {
            activeIndex: s.index(o),
            $items: s
        }
    }

    function s(t) {
        var e = t.$suggestionContainer.find("." + t.options.classes.activeGroupListItem);
        e.length && t.$input.val(e.text())
    }

    function o(t, e) {
        t.$suggestionContainer.find("." + t.options.classes.groupListItem).removeClass(t.options.classes.activeGroupListItem), e.addClass(t.options.classes.activeGroupListItem), s(t)
    }

    function u(e, n) {
        var s = i(e),
            u = s.activeIndex,
            r = s.$items,
            c = r.length,
            a = t(n ? r[c - 1] : r[0]),
            l = n ? -1 : 1;
        o(e, -1 === u ? a : t(r[$.mod(u + l, c)]))
    }

    function r(t) {
        t.$suggestionContainer.css({
            top: t.$input.outerHeight(),
            left: 0
        }), t.$suggestionContainer.show()
    }

    function c(t) {
        t.$suggestionContainer.hide()
    }

    function a(t, e, n) {
        var i = "string" == typeof n.text ? n.text : "",
            s = $.escapeForRegex("string" == typeof e ? e : ""),
            o = ["(", s, ")"].join(""),
            u = i.split(new RegExp(o, "i")),
            r = u[1] ? u[1] : "";
        return ["<li " + Object.keys(n.attributes || {}).reduce(function (t, e) {
            return t + e + "='" + n.attributes[e] + "'"
        }, "") + " class='" + t.options.classes.groupListItem + "'>", $.escapeHtml(u[0]), '<span class="' + t.options.classes.matchingFragment + '">' + $.escapeHtml(r) + "</span>", $.escapeHtml(u.slice(2).join("")), "</li>"].join("")
    }

    function l(t, e, n) {
        var i = n.title ? '<div class="' + t.options.classes.groupTitle + '">' + n.title + "</div>" : "";
        return ['<div class="' + t.options.classes.group + '">', i, '<ul class="' + t.options.classes.groupList + '">', n.suggestions.map(a.bind(null, t, e)).join(""), "</ul>", "</div>"].join("")
    }

    function p(t) {
        return function () {
            s(t), c(t)
        }
    }

    function g(t) {
        return function (e) {
            e.preventDefault(), c(t)
        }
    }

    function f(t) {
        var n = null,
            i = t.$suggestionContainer;
        return function () {
            var s = e(t),
                o = 0,
                u = $.once(r.bind(null, t)),
                a = $.once(function () {
                    i.empty()
                });
            n = new Date, t.options.fetchGroups(s, function (s, r, p) {
                s === n && r.suggestions.length && (u(), a(), o += r.suggestions.length, i.append(l(t, e(t), r))), p && 0 === o && (i.empty(), c(t))
            }.bind(null, n))
        }
    }

    function d(t) {
        return function (e) {
            if (n(t).length) switch (r(t), e.which) {
                case L.UP_ARROW:
                    u(t, !0);
                    break;
                case L.DOWN_ARROW:
                    u(t, !1);
                    break;
                case L.ENTER:
                    p(t)(e);
                    break;
                case L.ESCAPE:
                    g(t)(e)
            }
        }
    }

    function m(e) {
        return function (n) {
            var i = t(n.target);
            n.preventDefault(), o(e, i), c(e), e.$input.parents("form").submit()
        }
    }

    function v(e) {
        var n = e.$suggestionContainer,
            i = e.$input;
        return function (s) {
            var o = t(s.target);
            o.is(n) || o.is(i) || o.closest(n).length || c(e)
        }
    }

    function b(t) {
        var e = t.$input,
            n = t.$suggestionContainer,
            i = v(t);
        e.on("keydown", d(t)), e.on("input click", $.debounce(f(t), t.options.debounceTimeout || C.debounceTimeout)), n.on("click", $.classListToSelector(t.options.classes.groupListItem), m(t)), document.body.addEventListener("click", i, {
            capture: !0,
            passive: !0
        }), document.body.addEventListener("keydown", i, {
            capture: !0,
            passive: !0
        }), document.body.addEventListener("touchstart", i, {
            capture: !0,
            passive: !0
        })
    }

    function h(e, n) {
        var i = t.extend(!0, C, n),
            s = {
                $input: e,
                $suggestionContainer: t('<div class="' + i.classes.container + '" role="listbox"></div>'),
                options: i
            };
        e.after(s.$suggestionContainer), b(s)
    }
    var $ = {
            noop: function () {},
            mod: function (t, e) {
                return (t % e + e) % e
            },
            debounce: function (t, e) {
                var n, i = [];
                return function () {
                    i = arguments, clearTimeout(n), n = setTimeout(function () {
                        t.apply(this, i)
                    }.bind(this), e)
                }
            },
            once: function (t) {
                var e = !1;
                return function () {
                    if (!e) return e = !0, t.apply(this, arguments)
                }
            },
            classListToSelector: function (t) {
                return "." + t.split(" ").join(".")
            },
            escapeHtml: function (t) {
                var e = document.createElement("div");
                return e.appendChild(document.createTextNode(t)), e.innerHTML
            },
            escapeForRegex: function (t) {
                return t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
            }
        },
        L = {
            UP_ARROW: 38,
            DOWN_ARROW: 40,
            ENTER: 13,
            ESCAPE: 27
        },
        C = {
            debounceTimeout: 200,
            fetchGroups: $.noop,
            classes: {
                container: "suggestible",
                group: "suggestible-group",
                groupTitle: "suggestible-group-title",
                groupList: "suggestible-list",
                groupListItem: "suggestible-list-item",
                activeGroupListItem: "suggestible-list-item-active",
                matchingFragment: "suggestible-matching-fragment"
            }
        };
    t.fn.suggestible = function (e) {
        return this.each(function () {
            h(t(this), e)
        }), this
    }
}(jQuery);