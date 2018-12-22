/**

 * @fileOverview

 * @author rainszhang

 * Created: 16-08-24

 */

(function(global, factory) {

    if (typeof define === 'function') {

        // 支持LBF加载

        if(typeof LBF === 'object'){

            LBF.define('qidian.report', function(){

                return factory(global);

            });

        }else{

            define(function() {

                return factory(global);

            });

        }

    } else {

        factory(global);

    }

}(this, function(window) {

    var doc = document;



    var $ = window.$ || window.Zepto || window.jQuery;



    // local & dev & oa 上报到一个错误的地址，方便自测、测试，起点通过g_data传参，其他项目默认就是直接post到运营环境了

    var envType = (function(){

        try {

            return (g_data && g_data.envType || 'pro')  === 'pro' ?  '' : g_data.envType;

        } catch(e){

            return '';

        }

    })();



    // 请求路径

    var cgi = '//'+ envType + 'qdp.qiyan.com/qreport?';



    // common

    var commons = {



        // 平台

        path: 'pclog',



        // 行为 A：点击 P：浏览

        ltype: 'A',



        // 当前页面url

        url: window.location.href,



        // 来源

        ref: document.referrer,



        // 分辨率横屏

        sw: screen.width,



        // 分辨率竖屏

        sh: screen.height,



        // 横坐标

        x: '',



        // 纵坐标

        y: '',



        //页面标题

        title: document.title

    };



    // 起点中文网

    var defaults = {



        // 行为 A：点击 P：浏览

        ltype: 'A',



        // 页面ID

        pid: (function(){

            try {

                return g_data.pageId;

            } catch(e){

                return '';

            }

        })(),



        // 页面模块标识

        eid: '',



        // 书籍ID

        bid: '',



        // 章节url

        cid: '',



        // 标签名

        tid: '',



        // 列表序号

        rid: '',



        // 广告素材id，广告位

        qd_dd_p1: '',



        //广告素材

        qd_game_key:'',



        //作者id

        auid:'',



        //书单id

        blid:'',



        //算法id

        algrid:'',



        //关键词

        kw: ''

    };



    var Report = {

        /**

         * @method config

         * @param 全局配置参数，业务侧传递自定义参数可在此js中全局使用

         */

        config: function(options){

            if(options && typeof options == 'object'){

                $.extend(true, this, options);

            }

        },



        /**

         * @method init

         * @param params object {}

         */

        init: function(params){



            var that = this;



            // 页面加载后单独发请求统计PV

            $(document).ready(function(e) {



                var url = that.cgi ? that.cgi + '?': cgi;



                // 起点中文网

                var defaults = {



                    // 行为 A：点击 P：浏览

                    ltype: 'P',



                    // 页面ID

                    pid: (function(){

                        try {

                            return g_data.pageId;

                        } catch(e){

                            return '';

                        }

                    })(),



                    // 横坐标

                    x: '',



                    // 纵坐标

                    y: '',



                    //页面来源渠道,仅在页面浏览或hover的时候上报

                    chan: ''

                };



                //判断是否有e1,e2相关的domain及cookie值

                if(params && params.domain){

                    that.cookieDomain = params.domain;

                }

                if(params && params.e1){

                    that.cookieE1 = params.e1;

                }

                if(params && params.e2){

                    that.cookieE2 = params.e2;

                }



                //调用init方法时传递的参数会extend到默认的commons对象中，手动调用send方法时则无需再传递一遍

                $.extend(true, commons, params);



                var obj = $.extend({}, commons, defaults);



                // 合并url：http://www.qiyan.com/qreport?path=pclog&ltype=P&pid=qd_p_qidian&url=&ref=&x=&y=&sw=&sh=&title=

                $.each(obj, function (key, value) {

                    url = url + key + '=' + encodeURIComponent(value) + '&';

                });



                // 去除最后一个&

                url = url.substring(0, url.length - 1);



                createSender(url);



                that._send(params);



                // 老起点还有额外的上报逻辑，无论如何，先一起上报了

                obj.isQD && reportOldSiteData();

                obj.isQD && reportOldSiteDataGlobalUser();

            });

        },



        /**

         * @method _send

         * @param params object {}

         */

        _send: function(params){



            //初始化时，防label与input联动造成的一次点击两次冒泡

            this.initial = 0;



            var that = this;



            $(document).off('click.Report');

            $(document).on('click.Report', function(e){

                if (e && (e.isTrigger=== true || e.isTrusted === false  || e.hasOwnProperty('_args') || (e.pageY === 0 && e.screenY === 0))) {

                    // 不信任的点击不处理

                    return;

                }



                that.send(e, params);

            })

        },



        /**

         * var $dom = $('<div data-report-l1="2" data-report-mid="3"></div>');

         * getNodeReportInfo($dom[0]) => { l1: "2", mid: "3"}

         * @method getNodeReportInfo

         * @param node

         * @returns {Array}

         */

        getNodeReportInfo: function (node) {

            var attributes = node.attributes;

            // ie8- will transfer to camelCase

            var regexpReport = /^data-?report-?(.*)$/i;

            var rs = {};

            $.each(attributes, function(index, attr) {

                var matchResult = attr.name.match(regexpReport);

                if(matchResult && matchResult.length > 1) {

                    rs[matchResult[1]] = attr.value;

                }

            });

            return rs;

        },



        /**

         * @method sendParams

         * @param params object {}

         */

        sendParams: function(params){

            // 仅支持对象类型

            if(!params) return;

            if(typeof params != 'object') return;

            var obj = $.extend({}, commons, defaults, params);

            var url = this.cgi ? this.cgi + '?': cgi;

            url = url + $.param(obj);

            createSender(url);

        },



        /**

         * @method send

         * @param e

         * @param params object {}

         */

        send: function(e, params, proxyElement){

            var now = +new Date();



            // 如果当前点击与上一次点击的间隙小于100ms，说明是label与input联动造成的一次点击两次冒泡，因此只取上次点击的上报即可

            if (now - this.initial < 100) {

                return;

            }

            //每次点击后将当前时间戳缓存

            this.initial = now;



            var target = $(e.target);



            var url = this.cgi ? this.cgi + '?': cgi;



            //位置相关参数

            var positions = {

                // 横坐标

                x: e.clientX + $('body').scrollLeft() || '',



                // 纵坐标

                y: e.clientY + $('body').scrollTop() || '',

            };





            var obj = $.extend({}, commons, defaults, positions, params);



            var currentElement = target;



            while(currentElement.get(0) && currentElement.get(0).tagName != 'BODY'){



                // 数据统计也采用冒泡层级来区分模块，会采用l1~l7来标识，l1代表最外层，html层级越往里，依次递增，l2, l3, l4……

                for(var i=0; i<7; i++){

                    if(currentElement.data('l'+(i+1))){

                        obj['l'+(i+1)] = currentElement.data('l'+(i+1));

                        break;

                    }

                }



                // 如果获取到列表index，rid在l7以内，最里层元素eid、bid、cid、tid之外

                if(currentElement.data('rid')){

                    obj.rid = currentElement.data('rid');

                }



                /**

                 * ==================================================

                 * 以下是最里层元素，在同一层

                 * ==================================================

                 */



                // 如果获取到模块ID

                if(currentElement.data('eid')){

                    obj.eid = currentElement.data('eid');

                }



                // 如果点击的是书籍

                if(currentElement.data('bid')){

                    obj.bid = currentElement.data('bid');

                }



                // 如果点击的是章节

                if(currentElement.data('cid')){

                    obj.cid = currentElement.data('cid');

                }



                // 如果点击的是标签

                if(currentElement.data('tid')){

                    obj.tid = currentElement.data('tid');

                }



                // 广告素材id，暂定是跳转url

                if(currentElement.data('qd_dd_p1') && currentElement.data('qd_dd_p1') == 1){

                    obj.qd_dd_p1 = currentElement.get(0).href || '';

                }



                // 如果点击的是页面广告素材

                if(currentElement.data('qd_game_key')){

                    obj.qd_game_key = currentElement.data('qd_game_key');

                }



                // 如果点击的是作者

                if(currentElement.data('auid')){

                    obj.auid = currentElement.data('auid');

                }



                // 如果点击的是书单

                if(currentElement.data('blid')){

                    obj.blid = currentElement.data('blid');

                }



                // 算法id

                if(currentElement.data('algrid')){

                    obj.algrid = currentElement.data('algrid');

                }



                // 如果点击了搜索联想词汇或搜索按钮，则上报kw

                if(currentElement.data('kw')){

                    obj.kw = currentElement.data('kw');

                }



                var result = this.getNodeReportInfo(currentElement[0]) || {};



                currentElement = currentElement.parent();

            }



            //获取e1,e2事件的值

            if(typeof JSON !== 'undefined'){

                this._getE1E2(obj);

            }



            // 合并url：http://www.qiyan.com/qreport?ltype=A&pid=qd_p_qidian&pageUrl=&ref=&eid=qd_A102&bid=&cid=&tid=&rid=&x=177&y=1142&sw=1440&sh=900&title=

            $.each( obj, function( key, value ) {

                url = url + key + '=' + encodeURIComponent(value) + '&';

            });



            // 去除最后一个&

            url = url.substring(0, url.length-1);



            //如果参数中没有传递代理元素，则需判断l1是否存在，不存在则不能发送请求,否则发送请求。

            if(!proxyElement){

                // 防刷

                obj.l1 = obj.l1 || '';

                if(obj.l1 == ''){

                    return;

                }

            }



            //发送上报请求

            createSender(url);



            // reset 默认参数值，不然如果上一次有自定义参数，参数会一直跟随

            params = null;

        },



        //前一前二事件的支持

        _getE1E2:function(obj){

            //用于存储e1,e2的字符串对象

            var e1e2Obj = {};

            var cookieDomain = this.cookieDomain||'.qiyan.com';

            var cookieE1 = this.cookieE1||'e1';

            var cookieE2 = this.cookieE1||'e2';

            //如果cookie中不存在e1,e2，则初始化e1,e2

            if(!Cookie.get(cookieE1)){

                Cookie.set(cookieE1,'',cookieDomain,'',30*24*60*60*1000);

            }

            if(!Cookie.get(cookieE2)){

                Cookie.set(cookieE2,'',cookieDomain,'',30*24*60*60*1000);

            }



            //e1,e2的值需要携带eid,pid,l值

            for(var key in obj){

                if(key == 'eid'){

                    e1e2Obj[key] = obj[key];

                }

                if(key == 'pid'){

                    e1e2Obj[key] = obj[key];

                }

                if(/l[1-9]/.test(key)){

                    e1e2Obj[key] = obj[key];

                }

            }



            //e1为当前元素点击上报的信息的集合

            obj.e1 = decodeURIComponent(Cookie.get(cookieE1));

            //e2为cookie中的e1，也就是上一次上报时设置的e1

            obj.e2 = decodeURIComponent(Cookie.get(cookieE2));



            //更新完毕e1,e2后，需重置cookie

            if(typeof JSON !== 'undefined'){

                Cookie.set(cookieE1,JSON.stringify(e1e2Obj),cookieDomain,'',30*24*60*60*1000);

                Cookie.set(cookieE2,obj.e1,cookieDomain,'',30*24*60*60*1000);

            }

        }

    };



    var Cookie = {

        /**

         * method get

         * @param name

         * @returns {null}

         */

        get: function(name){

            var carr = doc.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));



            if (carr != null){

                return decodeURIComponent(carr[2]);

            }



            return null;

        },

        /**

         * method set

         * @param name

         * @returns {null}

         */

        set:function(name, value, domain, path, expires){

            if(expires){

                expires = new Date(+new Date() + expires);

            }

            var tempcookie = name + '=' + escape(value) +

                ((expires) ? '; expires=' + expires.toGMTString() : '') +

                ((path) ? '; path=' + path : '') +

                ((domain) ? '; domain=' + domain : '');



            //Ensure the cookie's size is under the limitation

            if(tempcookie.length < 4096) {

                doc.cookie = tempcookie;

            }

        }

    };



    /**

     * 创建老站的数据上报器

     * @method createOldSiteSender

     */

    function reportOldSiteData(){



        // 只有在cookie里面的stat_sessid不存在才会发这个请求

        if (Cookie.get('stat_sessid')) {

            return;

        }



        var url = '//uedas.qiyan.com/statajax.aspx?';

        var obj = {



            // 操作行为

            opName: 'AddSessionUser',



            // cookie中的stat_gid

            globalId: Cookie.get('stat_gid') || '',



            // cookie中的cmfuToken

            curToken: Cookie.get('cmfuToken') || '',



            // 页面title

            pageTitle: document.title,



            // 来源referrer

            referer: document.referrer,



            // 页面url

            pageUrl: window.location.href,



            // 页面路径

            pagePathName: window.location.pathname,



            // 页面查询部分

            pageQueryString: window.location.search,



            // 页面域名

            host: window.location.host

        };



        // 合并url: //uedas.qiyan.com/statajax.aspx?opName=AddSessionUser&globalId=&referrer=&pageTitle=&host=&pagePathName=&pageQueryString=&pageUrl=&topPageUrl=&isErrorPage=0&curToken=

        $.each( obj, function( key, value ) {

            url = url + key + '=' + encodeURIComponent(value) + '&';

        });



        // 去除最后一个&

        url = url.substring(0, url.length-1);



        createSender(url);

    }



    function reportOldSiteDataGlobalUser(){



        // 只有在cookie里面的guid不存在才会发这个请求

        if (Cookie.get('stat_gid')) {

            return;

        }



        var url = '//uedas.qiyan.com/statajax.aspx?';

        var obj = {



            // 操作行为

            opName: 'AddGlobalUser',



            // cookie中的stat_gid

            globalId: Cookie.get('stat_gid') || '',



            // cookie中的cmfuToken

            curToken: Cookie.get('cmfuToken') || '',



            // 页面title

            pageTitle: document.title,



            // 来源referrer

            referer: document.referrer,



            // 页面url

            pageUrl: window.location.href,



            // 页面路径

            pagePathName: window.location.pathname,



            // 页面查询部分

            pageQueryString: window.location.search,



            // 页面域名

            host: window.location.host

        };



        // 合并url: //uedas.qiyan.com/statajax.aspx?opName=AddSessionUser&globalId=&referrer=&pageTitle=&host=&pagePathName=&pageQueryString=&pageUrl=&topPageUrl=&isErrorPage=0&curToken=

        $.each( obj, function( key, value ) {

            url = url + key + '=' + encodeURIComponent(value) + '&';

        });



        // 去除最后一个&

        url = url.substring(0, url.length-1);



        createSender(url);

    }



    /**

     * 创建发送请求器

     * @method createSender

     * @param url 发送的请求

     */

    function createSender(url){

        var img = new Image();

        img.onload = img.onerror = function(){

            img = null;

        };

        img.src = url;

    }



    // 如果发现是直接引用模式，透给全局，污染了全局对象：Report

    if (typeof define !== 'function') {

        window.Report = Report;

    }



    return Report;

}));