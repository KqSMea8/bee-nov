/**
 * @fileOverview
 * @author rainszhang
 * Created: 16-03-28
 */
LBF.define('qd/js/component/report.00ef2.js', function (require, exports, module) {
    
    var Cookie = require('util.Cookie');

    var report = {};
    var envType = g_data && g_data.envType;
    var pageId = g_data && g_data.pageId || '';
    var cgi = '//www.qiyan.com/qreport';

    // local & dev & oa 上报到一个错误的地址，方便自测、测试
    if(envType !== 'pro'){
        cgi = '//'+ envType + 'www.qiyan.com/qreport';
    }

    /**
     * 发送统计请求
     * @methed send
     */
    report.send = function(){

        // 页面加载后单独发请求统计PV
        $(document).ready(function(e) {

            var url = cgi + '?';
            var obj = {

                path: 'pclog',

                // P 浏览行为
                logtype: 'P',

                // 页面ID
                pageid: pageId || '',

                // 当前页面url
                pageUrl: window.location.href,

                // 来源referrer
                referer: document.referrer,

                // 横坐标
                x: e.clientX + $('body').scrollLeft() || '',

                // 纵坐标
                y: e.clientY + $('body').scrollTop() || '',

                // 分辨率横屏
                sw: screen.width,

                // 分辨率竖屏
                sh: screen.height
            };

            // 合并url：http://www.qiyan.com/qreport?path=pclog&logtype=P&pageid=qd_p_qidian&pageUrl=&referer=&
            $.each( obj, function( key, value ) {
                url = url + key + '=' + value + '&';
            });

            // 去除最后一个&
            url = url.substring(0, url.length-1);

            createSender(url);

            // 老起点还有额外的上报逻辑，无论如何，先一起上报了
            reportOldSiteData();
        });

        //初始化时间
        var initial = 0;
        // 点击链接
        $(document).on('click.report', function(e){
            //获取当前时间戳
            var now = +new Date();
            //如果当前点击与上一次点击的间隙小于100ms，说明是label与input联动造成的一次点击两次冒泡，因此只取上次点击的上报即可
            if (now - initial < 100) {
                return;
            }
            //每次点击后将当前时间戳缓存
            initial = now;
            var target = $(e.target);
            var url = cgi + '?';
            var obj = {

                // 平台类型
                path: 'pclog',

                // A 点击行为
                logtype: 'A',

                // 页面ID，每个页面hardcode
                pageid: pageId,

                // 当前页面url
                pageUrl: window.location.href,

                // 来源referrer
                referer: document.referrer,

                // 页面模块标识
                eventid: '',

                // 书籍ID
                bookid: '',

                // 章节信息
                chapterUrl: '',

                // 标签名
                tid: '',

                // 列表序号
                rankid: '',

                // 广告素材id
                qd_dd_p1: '',

                // 横坐标
                x: e.clientX + $('body').scrollLeft() || '',

                // 纵坐标
                y: e.clientY + $('body').scrollTop() || '',

                // 分辨率横屏
                sw: screen.width,

                // 分辨率竖屏
                sh: screen.height
            };

            var currentElement = target;

            while(currentElement.get(0) && currentElement.get(0).tagName != 'BODY'){

                // 数据统计也采用冒泡层级来区分模块，会采用l1~l7来标识，l1代表最外层，html层级越往里，依次递增，l2, l3, l4……
                for(var i=0; i<7; i++){
                    if(currentElement.data('l'+(i+1))){
                        obj['l'+(i+1)] = currentElement.data('l'+(i+1));
                        break;
                    }
                }

                // 如果获取到列表index，rid在l7以内，最里层元素eid、bid、chapterurl、tid之外
                if(currentElement.data('rid')){
                    obj.rankid = currentElement.data('rankid');
                }

                /**
                 * ==================================================
                 * 以下是最里层元素，在同一层
                 * ==================================================
                 */

                // 如果获取到模块ID
                if(currentElement.data('eid')){
                    obj.eventid = currentElement.data('eid');
                }

                // 如果点击的是书籍
                if(currentElement.data('bid')){
                    obj.bookid = currentElement.data('bid');
                }

                // 如果点击的是章节
                if(currentElement.data('chapterurl')){
                    obj.chapterUrl = currentElement.data('chapterurl');
                }

                // 如果点击的是标签
                if(currentElement.data('tid')){
                    obj.tid = currentElement.data('tid');
                }

                // 广告素材id，暂定是跳转url
                if(currentElement.data('qd_dd_p1') && currentElement.data('qd_dd_p1') == 1){
                    obj.qd_dd_p1 = currentElement.get(0).href || '';
                }

                currentElement = currentElement.parent();
            }

            // 合并url：http://www.qiyan.com/qreport?logtype=A&pageid=qd_p_qidian&pageUrl=&referer=&eventid=qd_A102&bookid=&chapterUrl=&tid=&rankid=&x=177&y=1142&sw=1440&sh=900&
            $.each( obj, function( key, value ) {
                url = url + key + '=' + value + '&';
            });

            // 去除最后一个&
            url = url.substring(0, url.length-1);

            // 防刷
            obj.l1 = obj.l1 || '';
            if(obj.l1 == ''){
                return;
            }

            createSender(url);
        });
    };

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

            // cookie中的ywguid
            curToken: Cookie.get('ywguid') || '',

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
            url = url + key + '=' + value + '&';
        });

        // 去除最后一个&
        url = url.substring(0, url.length-1);

        createSender(url);
    }

    return report;
});
/**
 * Created by renjiale on 2016/4/22.
 */
/**
 * @fileOverview
 * @author  renjiale
 * Created: 2016-4-11
 */
LBF.define('qd/js/free/addBook.83d23.js', function (require, exports, module) {
    var
        Node = require('ui.Nodes.Node'),
        ajaxSetting = require('qd/js/component/ajaxSetting.84b88.js'),
        Checkbox = require('ui.Nodes.Checkbox'),
        Pagination = require('ui.Nodes.Pagination'),
        Cookie = require('util.Cookie'),
        Login = require('qd/js/component/login.a4de6.js'),
        LightTip = require('ui.widget.LightTip.LightTip'),
        Loading = require('qd/js/component/loading.aa676.js');

    function addToBookShelf(e, oldClassName, newClassName) {
        var that = this;
        var getResponse;
        var targetBook = $(e.currentTarget);
        //如果书已在书架中，则不需要发请求加入书架
        if (targetBook.hasClass(newClassName)) {
            return;
        }

        //如果是弱登录状态，则显示登录框
        if(!Login.isLogin()){
            Login && Login.showLoginPopup && Login.showLoginPopup();
            return;
        }

        //在按钮loading的时候再次点击则不执行逻辑
        if(targetBook.hasClass('btn-loading')){
            return;
        }

        //显示loading
        var loading = new Loading({});
        loading.startLoading(targetBook,function(){
            return getResponse;
        },200);

        //超时情况
        setTimeout(function(){
            loading.clearLoading(targetBook);
        }, 10 * 1000);

        //如果是未登录状态，则弹出登录弹窗
        if (!Login.isLogin()) {
            Login.showLoginPopup();
        } else {
            //已登录状态下，点击加入书架则直接向后端发送请求
            var bookId = targetBook.attr('data-bookId');
            $.ajax({
                type: 'GET',
                url: '/ajax/BookShelf/add',
                dataType: 'json',
                data: {
                    bookId: bookId
                },
                success: function (data) {
                    getResponse = true;
                    loading.clearLoading(targetBook);
                    if (data.code === 0) {
                        targetBook.removeClass(oldClassName);
                        targetBook.addClass(newClassName);
                        targetBook.html('已在书架');
                        new LightTip({
                            content: '<div class="simple-tips"><span class="iconfont success">&#xe61d;</span><h3>成功加入书架</h3></div></div>'
                        }).success();
                    } else {
                        switch (parseInt(data.code)) {
                            case 1002:
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>已经在书架中</h3></div>'
                                }).error();
                                targetBook.removeClass(oldClassName);
                                targetBook.addClass(newClassName);
                                targetBook.html('已在书架');
                                break;
                            case 1003:
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>书架已满</h3></div>'
                                }).error();
                                break;
                            case 1004:
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>加入失败</h3></div>'
                                }).error();
                                break;
                            default:
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>'+ data.msg +'</h3></div>'
                                }).error();
                                break;

                        }
                    }
                }
            })
        }
    }

    /**
     * 关闭登录弹窗
     * @method hideLoginPopup
     */
    $('body').on('click', '.close-popup', function () {
        Login.hideLoginPopup();
    });

    return {
        addToBookShelf: addToBookShelf
    }

});/**
 * Created by renjiale on 2016/1/4.
 */
LBF.define('qd/js/component/url.c4960.js', function() {
    var URL = {
        getParamVal: function(paramName) {
            var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)", "i");
            var reg2 = new RegExp("[A-Za-z]");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                var final = r[2];
                if (reg2.test(final)) {
                    return r[2]
                } else {
                    return parseInt(r[2]);
                }
            }
            return null;
        },
        isValid: function(str) {
            var strRegex = "^(http(s)?(:\/\/))?(www\.)?[a-zA-Z0-9-_\.]+";
            var re = new RegExp(strRegex);

            return re.test(str);
        },
        setParam: function(url, param, paramVal) {
            var TheAnchor = null;
            var newAdditionalURL = "";
            var tempArray = url.split("?");
            var baseURL = tempArray[0];
            var additionalURL = tempArray[1];
            var temp = "";

            if (additionalURL) {
                var tmpAnchor = additionalURL.split("#");
                var TheParams = tmpAnchor[0];
                TheAnchor = tmpAnchor[1];
                if (TheAnchor)
                    additionalURL = TheParams;

                tempArray = additionalURL.split("&");

                for (i = 0; i < tempArray.length; i++) {
                    if (tempArray[i].split('=')[0] != param) {
                        newAdditionalURL += temp + tempArray[i];
                        temp = "&";
                    }
                }
            } else {
                var tmpAnchor = baseURL.split("#");
                var TheParams = tmpAnchor[0];
                TheAnchor = tmpAnchor[1];

                if (TheParams)
                    baseURL = TheParams;
            }

            if (TheAnchor)
                paramVal += "#" + TheAnchor;

            var rows_txt = temp + "" + param + "=" + paramVal;
            return baseURL + "?" + newAdditionalURL + rows_txt;
        }
    };
    return {
        getParamVal: URL.getParamVal,
        validURL: URL.isValid,
        setParam: URL.setParam
    };

});
