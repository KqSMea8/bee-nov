/**
 * Created by rainszhang on 14-1-16.
 */
LBF.define('monitor.SpeedReport', function(require){
    var report = require('util.report'),
        Class = require('lang.Class'),
        serialize = require('util.serialize'),
        Attribute = require('util.Attribute');

    var defaults = {
        url: '//isdspeed.qq.com/cgi-bin/r.cgi',
        rate: 1,
        calGap: false
    };

    var PointReport = Class.inherit(Attribute, {
        initialize: function(options){
            this
                .set(defaults)
                .set({
                    points: [],
                    start: +new Date()
                })
                .set(options);
        },

        add: function(time, pos){
            var points = this.get('points');

            time = time || +new Date();
            pos = pos || points.length;

            points[pos] = time;

            return this;
        },

        send: function(){
            // clear points
            var points = this.get('points').splice(0);

            if(Math.random() > this.get('rate')){
                return this;
            }

            var start = this.get('start'),
                f1 = this.get('flag1'),
                f2 = this.get('flag2'),
                f3 = this.get('flag3'),
                url = this.get('url') + '?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&',
                proxy = this.get('proxy'),
                i;

            if(this.get('calGap')){
                for(i= points.length - 1; i> 0; i--){
                    points[i-1] = points[i-1] || 0;
                    points[i] -= points[i-1];
                }
            } else {
                for(i= points.length - 1; i> 0; i--){
                    if(points[i]){
                        points[i] -= start;
                    }
                }
            }

            url = url + serialize(points);

            // when use proxy mode
            if(proxy){
                url = proxy.replace('{url}', encodeURIComponent(url));
            }

            report(url);
        }
    });

    /**
     * 上报Performance timing数据；
     * 如果某个时间点花费时间为0，则此时间点数据不上报。
     *
     * @param {Object} options
     *
     * @param {String} options.flag1，测速系统中的业务ID，譬如校友业务为164
     *
     * @param {String} options.flag2，测速的站点ID
     *
     * @param {String} options.flag3IE，测速的页面ID
     *（因为使用过程中我们发现IE9的某些数据存在异常，
     * 如果IE9和chrome合并统计，会影响分析结果，所以这里建议分开统计）
     *
     * @param {String} [options.flag3Chrome]，测速的页面ID
     * （如果为空，则IE9和chrome合并统计）
     *
     * @param {Number} [options.initTime] 统计页面初始化时的时间
     *
     */
    var reportPerformance = function(options){
        var f1 = options.flag1,
            f2 = options.flag2,
            f3_ie = options.flag3IE,
            f3_c = options.flag3Chrome,
            d0 = options.initTime,
            proxy = options.proxy,
            defaultUrl = '//isdspeed.qq.com/cgi-bin/r.cgi';

        var _t, _p = window.performance || window.webkitPerformance || window.msPerformance, _ta = ["navigationStart","unloadEventStart","unloadEventEnd","redirectStart","redirectEnd","fetchStart","domainLookupStart","domainLookupEnd","connectStart","connectEnd","requestStart",/*10*/"responseStart","responseEnd","domLoading","domInteractive","domContentLoadedEventStart","domContentLoadedEventEnd","domComplete","loadEventStart","loadEventEnd"], _da = [], _t0, _tmp, f3 = f3_ie;

        if(Math.random() > options.rate){
            return this;
        }

        if (_p && (_t = _p.timing)) {

            if (typeof(_t.msFirstPaint) != 'undefined') {	//ie9
                _ta.push('msFirstPaint');
            } else {
                if (f3_c) {
                    f3 = f3_c;
                }
            }

            _t0 = _t[_ta[0]];
            for (var i = 1, l = _ta.length; i < l; i++) {
                _tmp = _t[_ta[i]];
                _tmp = (_tmp ? (_tmp - _t0) : 0);
                if (_tmp > 0) {
                    _da.push( i + '=' + _tmp);
                }
            }

            if (d0) {//统计页面初始化时的d0时间
                _da.push('30=' + (d0 - _t0));
            }

            //如果业务侧传递了url，则使用此url
            var url = options.url || defaultUrl;
            var url = url + '?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + _da.join('&');

            // when use proxy mode
            if(proxy){
                url = proxy.replace('{url}', encodeURIComponent(url));
            }

            report(url);
        }

    };

    /**
     * 上报Performance timing数据；
     * 如果某个时间点花费时间为0，则此时间点数据不上报。
     *
     * @param {Object} options
     *
     * @param {String} options.flag1，测速系统中的业务ID，譬如校友业务为164
     *
     * @param {String} options.flag2，测速的站点ID
     *
     * @param {String} options.flag3IE，测速的页面ID
     *（因为使用过程中我们发现IE9的某些数据存在异常，
     * 如果IE9和chrome合并统计，会影响分析结果，所以这里建议分开统计）
     *
     * @param {String} [options.flag3Chrome]，测速的页面ID
     * （如果为空，则IE9和chrome合并统计）
     *
     * @param {Number} [options.initTime] 统计页面初始化时的时间
     *
     */
    var reportPerform = function(options){
        var f1 = options.flag1,
            f2 = options.flag2,
            f3_ie = options.flag3IE,
            f3_c = options.flag3Chrome,
            d0 = options.initTime,
            proxy = options.proxy,
            defaultUrl = location.protocol.indexOf('https') !== -1 ? '//huatuospeed.weiyun.com/cgi-bin/r.cgi' : '//isdspeed.qq.com/cgi-bin/r.cgi';

        var _t, _p = window.performance || window.webkitPerformance || window.msPerformance, _ta = ["navigationStart","unloadEventStart","unloadEventEnd","redirectStart","redirectEnd","fetchStart","domainLookupStart","domainLookupEnd","connectStart","connectEnd","requestStart",/*10*/"responseStart","responseEnd","domLoading","domInteractive","domContentLoadedEventStart","domContentLoadedEventEnd","domComplete","loadEventStart","loadEventEnd"], _da = [], _t0, _tmp, f3 = f3_ie;

        if(Math.random() > this.get('rate')){
            return this;
        }

        if (_p && (_t = _p.timing)) {

            if (typeof(_t.msFirstPaint) != 'undefined') {   //ie9
                _ta.push('msFirstPaint');
            } else {
                if (f3_c) {
                    f3 = f3_c;
                }
            }

            _t0 = _t[_ta[0]];
            for (var i = 1, l = _ta.length; i < l; i++) {
                _tmp = _t[_ta[i]];
                _tmp = (_tmp ? (_tmp - _t0) : 0);
                if (_tmp > 0) {
                    _da.push( i + '=' + _tmp);
                }
            }

            if (d0) {//统计页面初始化时的d0时间
                _da.push('30=' + (d0 - _t0));
            }

            var url = options.url || defaultUrl;

            url += '?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + _da.join('&');

            // when use proxy mode
            if(proxy){
                url = proxy.replace('{url}', encodeURIComponent(url));
            }

            report(url);
        }

    };

    return {
        create: function(options){
            return new PointReport(options);
        },

        reportPerformance: reportPerformance,

        reportPerform: reportPerform
    }
});/**
 * @fileOverview
 * @author yangye & rainszhang
 * Created: 16-03-14
 */
LBF.define('qd/js/component/login.a4de6.js', function (require, exports, module) {
    var
        Cookie = require('util.Cookie'),
        JSON = require('lang.JSON'),
        QLogin = require('common.login.qiyan');

    var Login = {
        /**
         * 登录成功后回调
         * @method init
         */
        init: function () {
            var that = this;
            var env = g_data ? (g_data.envType ? (g_data.envType == 'pro' ? '': g_data.envType) : '') : '';

            //创建defer对象
            var loginDefer = $.Deferred();

            //如果有登录态则执行登录成功回调，否则初始化qidian login来checkstatus
            var gLoginDefer = this.qLoginDefer = QLogin.init();
            gLoginDefer.done(function(){
                that.loginOnSuccess();
            });

            gLoginDefer.always(function(){
                loginDefer.resolve();
            });

            //有登录态的情况直接执行成功逻辑
            if(QLogin.isLogin()){
                that.loginOnSuccess();
            }

            //登录成功
            QLogin.setCallback('success',this,this.loginOnSuccess);

            //退出登录
            QLogin.setCallback('logout',this,this.logoutCallback);

            //绑定登录按钮，弹出登录弹窗
            $('#login-btn, #pin-login').on('click',function(){
                Login.showLoginPopup({
                    returnurl: location.protocol + '//' + env + 'www.qiyan.com/loginSuccess?surl=' + encodeURIComponent(location.href)
                });
            });

            //绑定登录按钮，弹出登录弹窗
            $('#exit-btn, #exit').on('click',function(){
                Login.logout();
            });

            return loginDefer.promise();
        },


        //获取qlogindefer，方便之后其他页面调用，设置done方法
        getQloginDefer: function(){
            return this.qLoginDefer;
        },
        /**
         * 提供方法让业务侧设置自己的登录成功回调
         * @method setSuccess
         */
        setSuccess:function(that, callback){
            QLogin.setCallback('success',that,callback);
        },

        /**
         * 提供方法让业务侧设置自己的关闭登录弹窗回调
         * @method setClose
         */
        setClose:function(that, callback){
            QLogin.setCallback('close',that,callback);
        },

        /**
         * 提供方法让业务侧设置自己的登出回调
         * @method setLogout
         */
        setLogout:function(that, callback){
            QLogin.setCallback('logout',that,callback);
        },

        /**
         * 登录成功回调
         * @method loginOnSuccess
         */
        loginOnSuccess:function(){
            QLogin.hideLoginIfr();
            this.getUserMsg();
        },

        /**
         * 关闭登录弹窗回调
         * @method loginOnClose
         */
        loginOnClose:function(){
            QLogin.hideLoginIfr();
        },

        /**
         * 未登录状态，登录成功拉取用户信息
         * @method getUserMsg
         */
        getUserMsg: function () {
            $.ajax({
                url: '/ajax/UserInfo/GetUserInfo',
                //允许请求头带加密信息
                xhrFields: {
                    withCredentials: true
                }
            }).done(function (data) {
                if (data.code === 0) {
                    $('#msg-box').show();
                    $('.sign-in').removeClass('hidden');
                    $('.sign-out').addClass('hidden');
                    //获取用户名
                    var userName = data.data.nickName;
                    //全局化用户名，书详情页需要使用
                    window.userName = userName;
                    $('#user-name, #nav-user-name').text(userName);
                    if (data.data.msgCnt == 0) {
                        $('#msg-btn').find('i').addClass('black');
                    }
                    $('#msg-btn').find('i').text(data.data.msgCnt);
                    $('#top-msg').text(data.data.msgCnt);

                    //注释保留，今后可能会再做新手任务逻辑
                    //有登录头的页面、并且能拿到用户注册时间才请求判断是否显示新手任务
                    /*if ($('.top-nav').length == 1 && Cookie.get('rt')) {
                        //拉取cookie判断是否是新用户
                        //获取用户的注册时间，系统时间，准备做计算
                        curTime = new Date().getTime();
                        //拿到cookie里用户注册时间，火狐下需要把-换成“/”
                        var userTime = Cookie.get('rt').replace(/-/g, "/");
                        var newUserTime = parseInt(new Date(userTime).getTime());
                        var oneMonth = 86400000 * 30;
                        //判断是否新用户，然后获取新手任务状态
                        if ((curTime - newUserTime) < oneMonth) {
                            var newUserWrap = $('#new-user');
                            var newUserTip = $('#new-user-tip');
                            $.ajax({
                                url: '/activity/ajax/NewUser/GetUserTask'
                            }).done(function (data) {
                                if (data.code === 0) {
                                    //获取抽奖状态，：0没有抽奖机会，1有抽奖机会，2已领奖
                                    var userChancePrize = data.data.userChancePrize;
                                    //获取有多少个奖品未领取
                                    var userChanceAccept = data.data.userChanceAccept;
                                    //获取已经领奖的次数
                                    var haveAccepted = data.data.haveAccepted;
                                    //先判断领奖状态和数量，如果领奖数量小于等于0，表示没有奖品可领取，再去判断是否有抽奖机会
                                    if (userChancePrize === 1) {
                                        //判断抽奖状态，显示对应的信息
                                        newUserWrap.show();
                                        newUserTip.html('您有<i>1</i>次抽奖机会');
                                    } else if (userChanceAccept > 0) {
                                        newUserWrap.show();
                                        newUserTip.html('您有<i>' + userChanceAccept + '</i>个奖励未领取');
                                    } else if (haveAccepted >= 3 && userChancePrize == 2 && userChanceAccept == 0) {
                                        $('#new-user').remove();
                                    } else {
                                        newUserWrap.show();
                                    }
                                }
                            });
                        }
                    }*/
                }
            });
        },

        /**
         * 弱登录态时拉取用户信息
         * @method weekLoginStatus
         */
        weekLoginStatus: function () {
            $('#msg-box').hide();
            var loginInfo = {};
            var userInfo = '';
            var cookieRaw = document.cookie.split(';');
            for (i = 0; i < cookieRaw.length; i++) {
                var cur = cookieRaw[i].split('=');
                var keyName = cur[0].replace(/ /g, "");
                loginInfo[keyName] = cur[1];
                if (keyName == 'mdltk') {
                    userInfo = cur.join('=');
                }
            }
            var _userName = decodeURIComponent(userInfo.split('&')[1].split('=').pop());
            var bookShelf = parseInt(Cookie.get('bsc'));

            $('.sign-in').removeClass('hidden');
            $('.sign-out').addClass('hidden');
            $('#user-name, #nav-user-name').text(_userName);
        },

        /**
         * 退出登录-默认逻辑
         * @method logoutCallback
         */
        logoutCallback: function () {
            $('.sign-in').addClass('hidden');
            $('.sign-out').removeClass('hidden');
            $('#shelf-num, #pin-shelf').hide().text('');
            $('#web-dropdown').find('.not-logged').show().end().find('.logged-in').hide();
            location.reload();
        },

        /**
         * 触发退出登录的请求
         * @method goLogout
         */
        logout:function(){
            QLogin.goLogout();
        },
        /**
         * 展示登录弹窗
         * @method showLoginPopup
         */
        showLoginPopup:function(params){
            var env = g_data ? (g_data.envType ? (g_data.envType == 'pro' ? '': g_data.envType) : '') : '';
            QLogin.showPCLogin({ returnurl: location.protocol + '//' + env + 'www.qiyan.com/loginSuccess?surl=' + encodeURIComponent(location.href)});
        },

        //是否登录了
        isLogin: function(){
            return QLogin.isLogin();
        }
    };

    window.Login = Login;
    return Login
});

/**
 * @fileOverview
 * @author  yangye & liuwentao
 * Created: 2016-9-19
 */
LBF.define('qd/js/read.qiyan.com/index.91e04.js', function (require, exports, module) {

    var
        Node = require('ui.Nodes.Node'),
        ajaxSetting = require('qd/js/component/ajaxSetting.84b88.js'),
        report = require('qiyan.report'),
        Cookie = require('util.Cookie'),
        Textarea = require('ui.Nodes.Textarea'),
        TextCounter = require('ui.Plugins.TextCounter'),
        EJS = require('util.EJS'),
        Panel = require('ui.widget.Panel.Panel'),
        Checkbox = require('ui.Nodes.Checkbox'),
        LightTip = require('ui.widget.LightTip.LightTip'),
        Radio = require('ui.Nodes.Radio'),
        Common = require('qd/js/component/common.08bc6.js'),
        Loading = require('qd/js/component/loading.aa676.js'),
        readCommon = require('qd/js/read.qiyan.com/common.014c7.js'),
        ejsChinese = require('qd/js/read.qiyan.com/ejsChinese.a35d9.js'),
        VotePopup = require('qd/js/component/votePopup.c61b1.js'),
        discussTalk = require('qd/js/read.qiyan.com/discussTalk.fbd5e.js'),
        Login = require('qd/js/component/login.a4de6.js');

    exports = module.exports = Node.inherit({
        /**
         * Default UI proxy Element
         * @protected
         */
        el: 'body',
        /**
         * Default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            //添加删除章节书签
            'click .book-mark': 'markOperate',
            //显示用户行为小气泡
            'mouseenter .j_userActive': 'showUserActBubble',
            //隐藏用户行为小气泡
            'mouseleave .j_userActive': 'hideUserActBubble',
            //显示获取用户评论回复弹窗
            'mouseenter .j_userPost': 'showUserDiscuss',
            //隐藏用户评论回复弹窗
            'mouseleave .j_userPost': 'hideUserDiscuss',
            //提交用户评论回复的评论
            'click .j_userPostReply': 'userDiscussReply',
            //关闭用户评论回复弹窗
            'click .close-panel': 'closeUserDiscuss',
            //点击显示章节评论弹窗
            'click .comment-btn': 'commentPopup',
            //提交章节评论
            'click .j_chapterReply': 'commentReply',
            //打开举报
            'click .j_reportBtn': 'reportPopup',
            //提交章节举报
            'click #j_accusationBtn': 'accusationAjax',
            //关闭当前阅读进度弹窗
            'click .read-status-close': 'closeCurrentPopup',
            //右侧导航评论跳转链接
            'mouseenter #j_discussHref': 'setDiscussHref',
            //是否自动订阅下一章
            'click .j_autoSubs': 'autoSubNextChapter',
            //投票按钮
            'click #monthBtn, #recBtn, #navTicket ': 'showVotePopup',
            //打赏
            'click #navReward , .j_admireBtn , #rewardBtn ': 'showChapterVotePopup',
            //订阅章节
            'click .j_subscribeBtn': 'subscribeChapter',
            //立即支付
            'click .j_paynow': 'payNow',
            //去快捷支付方式
            'click .j_quickpay': 'showQuick',
            //弹快捷支付弹窗
            'click .j_quickPay': 'showQuickPay',
            //去充值
            'click .j_charge': 'goCharge',
            //支付成功,关闭弹窗
            'click .j_success_close': 'closeAndRefresh',
            //支付并打赏
            'click .j_payByQuick': 'selectPayMethod',
            //回到选择支付方式
            'click .j_switchMethod': 'backToQuickPay',
            //重新打赏
            'click .j_retry_payment': 'retryReward',
            //点击打赏tab触发的‘完成绑定’按钮【有关风控】
            'click .j_complete_bind,.j_continue': 'continueProcess',
            //关闭弹窗
            'click .j_close': 'closeSubscribePop',
            //关闭当前panel弹窗
            'click .closeBtn, .close': 'closeCurrentPanel',
            //显示口令红包
            'click .j_pwdRedPacketBtn': 'pwdRedPacketPop',
            //移除口令红包pop
            'click .j_removepwdRedPop': 'removeRedPacketPop'
        },
        /**
         * Nodes default UI element，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {
            //当前页面的大封面，获取bookId
            bookImg: '#bookImg'
        },

        /**
         * Render node
         * Most node needs overwritten this method for own logic
         * @method render
         * @chainable
         */
        render: function () {

            // 设置UI Node proxy对象，chainable method，勿删
            this.setElement(this.el);
            // 页面逻辑入口
            this.init();

            // 返回组件
            return this;
        },

        /**
         * 页面逻辑入口
         */
        init: function () {

            var that = this;

            //书id
            that.bookId = $(bookImg).data('bid');

            //chapterInfo是否加载完成标识,false为允许向下加载
            that.chapterLoad = false;

            //当为瀑布流时,章节预加载标识
            that.chapterAdvanceLoad = {
                bool: false,
                id: '',
                pageTurn: '',
                content: '',
                isMarked: 0,
                discussList: '',
                admire: '',
                admireNum: '',
                url: ''
            };

            //标识因为页面短第一次触发滚动
            that.firstScroll = false;

            //瀑布流模式时,页面进入当前章节是否为普通章节最后一章  or  页面进入当前章节是否为vip章节最后一章
            if (( g_data.chapter.vipStatus == 0 && g_data.nextChapterVip == 1 ) || g_data.chapter.nextId == -1) {
                that.loadLastBool = true;
            }

            //获取章节dom
            that.chapterBox = $('#j_chapterBox');

            //页面load时发送通用请求
            var env = g_data.envType == 'pro' ? '' : g_data.envType;
            new Common();

            //初始化common.js实例
            that.readCommon = new readCommon({});

            //禁止页面选中文字、copy、右键功能
            that.forbidCopy();

            //初始化记录当前章节url
            that.chapterUrlToMark(g_data.chapter.id, window.location.href);

            //页面进入时,初始化,该章节打赏、评论、是否已加入书签状态
            that.chapterAjaxInit(g_data.chapter.id, g_data.chapter.vipStatus, g_data.chapter.isBuy, false);

            //当为左右切换,加载键盘事件
            that.chapterKey();

            //当为瀑布流时,加载懒加载事件
            that.chapterLazyLoad();

            //页面章节,记录cookie
            that.nearReadCookies(g_data.chapter.id);

            //阅读模式切换触发
            that.readTypeChange();

            //阅读进度同步,以及是否加入书架
            that.readStatusSync();

            //focus input\textArea
            that.focusInput();

            //获取用户分级等级
            that.getUserFansInfo();

            //实例化loading.js
            this.loading = new Loading({});

            //投票弹窗实例
            that.VotePopup = new VotePopup({});

            //章节打赏的回调
            this.chapterRewardCallBack();

            //快捷支付
            that.payment = that.VotePopup.payment;

            //红包调用
            that.discussTalk = new discussTalk({});
            that.discussTalk.payment = that.payment;
            that.discussTalk.scrollChapter = that.readCommon.scrollChapter ;

            that.renderPageOps();

            //增加书籍点击
            that.addBookClick();

            //背景广告
            that.bgOpsInfo();
        },
        /*
         * 字符串简繁体转换
         * @method strToChinese
         * @param str  需要转换的str
         * @return (string)  转换后的string
         * */
        strToChinese: function (str) {
            //判断简繁体
            require.async('qd/js/component/chinese.cafe9.js', function (S2TChinese) {
                str = S2TChinese.s2tString(str);
            });
            return str;
        },
        /*
         * 禁止页面选中文字、copy、右键功能
         * @method forbidCopy
         */
        forbidCopy: function () {

            //禁止copy
            $('body').on('copy', function () {
                return false;
            });
            //禁止cut
            $('body').on('cut', function () {
                return false;
            });
            //禁止鼠标右键默认弹窗
            $('body').on('contextmenu', function () {
                return false;
            });

        },
        /*
         * 初始化记录当前章节url
         * @method chapterUrlToMark
         * @param url  当前章节url
         * @param chapterId  需要加到的chapter 的 id
         */
        chapterUrlToMark: function (chapterId, url) {

            var chapterBox = $('#chapter-' + chapterId),
                markIcon = chapterBox.find('.book-mark');
            //保存数据
            markIcon.data('curl', url);

        },
        /*
         * 阅读模式切换触发
         * @method readTypeChange
         * */
        readTypeChange: function () {
            var that = this;
            //给阅读页通用common.js 添加阅读模式调用function
            that.readCommon.readTypeCallBack = function (type) {

                //移除其他状态的翻页
                $('.chapter-control').remove();
                //判断为哪种阅读方式
                switch (type) {
                    //翻页模式
                    case 0:
                        that.readPageType();
                        break;
                    //瀑布流模式
                    case 1:
                        that.readLoadType();
                        // 主动触发scroll
                        $(window).trigger('scroll');
                        break;
                }
            }
        },
        /*
         * 阅读模式切换成翻页模式
         * @method readTypePage
         * */
        readPageType: function () {
            var that = this,
            //获取页面当前显示的章节id
                nowshowChapterId = that.readCommon.scrollChapter(),
            //章节对象
                chapterBox = $('#chapter-' + nowshowChapterId),
            //除了该章节其他章节
                otherChapter = chapterBox.siblings('.text-wrap');

            //遍历其他章节,删除
            otherChapter.each(function (i, el) {
                if ($(el).data('cid') != nowshowChapterId) {
                    $(el).remove();
                }
            });

            $('.j_chapterLoad').addClass('hidden');

            //获取上一章下一章url
            var prevUrl = chapterBox.data('purl'),
                nextUrl = chapterBox.data('nurl'),
                catalogUrl = '//book.qiyan.com/info/' + that.bookId + '#Catalog';
            //获取章节相关信息
            var chapterAndInfo = chapterBox.data('info').split('|')
                , prevClass = '',
                nextTxt = '下一章',
                prevReportData = 'data-eid="qd_R107"',
                nextReportData = 'data-eid="qd_R109"';

            // 判断上一章需要的class
            if (chapterAndInfo[1] == -1) {
                prevClass = 'disable';
                prevReportData = '';
            }
            //判断下一章显示文字
            if (chapterAndInfo[1] == -1) {
                nextTxt = '书末页';
                nextReportData = 'data-eid="qd_R118"';
            }
            //生成dom
            var pageStr = '<div class="chapter-control dib-wrap" data-l1="3"><a class="' + prevClass + '" id="j_chapterPrev" href="' + prevUrl + '" ' + prevReportData + '>上一章</a><span>|</span><a target="_blank" href="' + catalogUrl + '" data-eid="qd_R108">目录</a><span>|</span><a id="j_chapterNext" href="' + nextUrl + '" ' + nextReportData + '>' + nextTxt + '</a></div>';
            //简繁体转换判断
            pageStr = that.strToChinese(pageStr);
            //加入页面中
            $('#j_readMainWrap').append(pageStr);

            //重置 g_data.chapter
            g_data.chapter = {
                //页面进入加载的章节id
                id: nowshowChapterId,
                //章节vip标识
                vipStatus: chapterAndInfo[0],
                //上一章id
                prevId: chapterAndInfo[1],
                //下一章id
                nextId: chapterAndInfo[2],
                //本章节是否已经订阅
                isBuy: chapterAndInfo[3]
            };
            g_data.nextChapterVip = chapterAndInfo[4];

            //重置初始化章节预加载标识
            that.chapterAdvanceLoad = {
                bool: false,
                id: '',
                pageTurn: '',
                content: '',
                isMarked: 0,
                discussList: '',
                admire: '',
                admireNum: '',
                pwdRedBtn: '',
                url: ''
            };
            that.firstScroll = false;

            $('.page-ops').remove();
        },
        /*
         * 阅读模式切换成瀑布流模式
         * @method readLoadType
         * @param   advanceBool   是否为预加载 默认false 不是 ,true 为是
         * @param   nextUrl   当advanceBool 为 true 的时候才有这个值
         * */
        readLoadType: function (advanceBool, nextUrl) {

            var that = this,
                nextBtnText = '',
                repartData = '';

            $('.page-ops').remove();

            advanceBool = advanceBool ? advanceBool : false;
            //当前章节是否为普通章节最后一章
            if (g_data.chapter.vipStatus == 0 && g_data.nextChapterVip == 1) {
                nextBtnText = '前往VIP章节';
                repartData = 'data-eid="qd_R119"';
                //当前章节是否为vip章节最后一章
            } else if (g_data.chapter.nextId == -1) {
                nextBtnText = '前往书末页';
                repartData = 'data-eid="qd_R118"';
            }
            //瀑布流时,显示按钮的方法
            if (nextBtnText != '') {
                //获取nextUrl
                var nextUrl = ( advanceBool ) ? nextUrl : $('#chapter-' + g_data.chapter.id).data('nurl');
                that.loadLastBool = true;
                var loadToDom = '<div class="chapter-control dib-wrap" data-l1="3"> <a class="w-all" href="' + nextUrl + '"  ' + repartData + ' >' + nextBtnText + '</a></div>';
                //简繁体转换判断
                loadToDom = that.strToChinese(loadToDom);
                //判断是否是预加载
                if (advanceBool) {
                    that.chapterAdvanceLoad.pageTurn = loadToDom;
                } else {
                    //加入页面中
                    $('#j_readMainWrap').append(loadToDom);
                }
            } else {
                that.loadLastBool = false;
                //判断是否是预加载
                if (advanceBool) that.chapterAdvanceLoad.pageTurn = '';
            }

        },
        /*
         * 重新获取章节内容
         * @method  getChapterId
         * @param   chapterId           章节id
         * @param   isRepeat            是否是重复加载 是:true  否:false
         * @param   advanceBool         是否为预加载 默认false 不是 ,true 为是
         * @param   successCallback     成功操作之后等回调
         * @param   failCallBack        失败的回调
         * */
        getChapterInfo: function (chapterId, isRepeat, advanceBool, successCallback, failCallBack) {

            var that = this;

            advanceBool = advanceBool ? advanceBool : false;

            $.ajax({
                type: 'GET',
                url: '/ajax/chapter/chapterInfo',
                dataType: 'json',
                data: {
                    //book id
                    bookId: that.bookId,
                    //需要加载章节id
                    chapterId: chapterId,
                    authorId: g_data.bookInfo.authorId
                },
                success: function (response) {
                    if (response.code == 0) {

                        var data = response.data;
                        //add数据
                        data.mePreFix = g_data.pageJson.mePreFix;
                        data.forumPreFix = g_data.pageJson.forumPreFix;
                        data.bookInfo = g_data.bookInfo;
                        data.bottomOps = g_data.bottomOps;
                        data.isLogin = Login.isLogin() ? 1 : 0;
                        data.isPublication = g_data.isPublication;
                        data.salesMode = g_data.salesMode;
                        //获取ejs dom str
                        var chapterDiscussList = ejsChinese('/ejs/qd/js/read.qiyan.com/chapter.322b1.ejs', data);
                        if (isRepeat) {
                            $('#chapter-' + chapterId).remove();
                            if (g_data.readSetting.rt == 1) $('.chapter-control').remove();
                        }
                        //加载章节到页面中
                        if (advanceBool) {
                            that.chapterAdvanceLoad.content = chapterDiscussList;
                            that.chapterAdvanceLoad.id = data.chapterInfo.chapterId;
                        } else {
                            that.chapterBox.append(chapterDiscussList);
                        }
                        //重置 g_data.chapter
                        g_data.chapter = {
                            //页面进入加载的章节id
                            id: data.chapterInfo.chapterId,
                            //章节vip标识
                            vipStatus: data.chapterInfo.vipStatus,
                            //上一章id
                            prevId: data.chapterInfo.prev,
                            //下一章id
                            nextId: data.chapterInfo.next,
                            //本章节是否已经订阅
                            isBuy: data.chapterInfo.isBuy
                        };
                        g_data.nextChapterVip = data.chapterInfo.extra.nextVipStatus;
                        //获取当前章节的url
                        var nowChapterUrl = $('#chapter-' + g_data.chapter.prevId).data('nurl');
                        //加载章节到页面中
                        if (advanceBool) {
                            that.chapterAdvanceLoad.url = nowChapterUrl;
                        } else {
                            that.chapterUrlToMark(g_data.chapter.id, nowChapterUrl);
                        }
                        //拉取该章节评论,打赏,是否在书签的ajax
                        that.chapterAjaxInit(g_data.chapter.id, g_data.chapter.vipStatus, g_data.chapter.isBuy, advanceBool);
                        //判断章节是否为最后一章
                        var nextUrl = ( data.chapterInfo.next == -1 ) ? ( '//read.qiyan.com/lastpage/' + that.bookId ) : data.chapterInfo.extra.nextUrl;
                        //当为瀑布流是才去判断是否是最后一章
                        if (g_data.readSetting.rt == 1) that.readLoadType(advanceBool, nextUrl);
                        //成功操作之后等回调
                        if (successCallback) successCallback(data);

                        var $pageOps = new EJS({
                            url: '/ejs/qd/js/read.qiyan.com/pageOps.43e01.ejs'
                        }).render(data.pageOps);
                        //把广告添加到顶部
                        $('.text-wrap').last().before($pageOps);
                    } else {
                        //失败的回调
                        if (failCallBack) failCallBack();
                    }
                }
            });
        },
        /*
         * 更新阅读进度
         * @method repeatReadStatus
         * @param chapterId    当前章节id
         * @param chapterName  当前章节name
         * @param isVip        当前章节是否为vip章节
         * @param updateTime   当前章节跟新时间
         * @param time         计数器
         * */
        repeatReadStatus: function (chapterId, chapterName, isVip, updateTime, time) {
            var that = this;
            //判断用户是否登陆了,登陆发送ajax
            if (Login.isLogin()) {
                $.ajax({
                    type: 'POST',
                    url: '/ajax/chapter/UpdReadStatus',
                    dataType: 'json',
                    data: {
                        bookId: that.bookId,
                        chapterId: chapterId,
                        chapterName: chapterName,
                        isVip: isVip,
                        updateTime: updateTime
                    },
                    success: function (response) {
                        //当保存更新失败,重新发送一次,在失败一次,不在发送请求
                        if (response.code != 0 && time == 0) {
                            that.repeatReadStatus(chapterId, chapterName, isVip, updateTime, 1);
                        }
                    }
                })
            }
        },
        /*
         * 初始化章节打赏、评论、是否已加入书签状态
         * @method   chapterInit
         * @param    chapterId       章节id
         * @param    vipStatus       该章节是否为vip章节
         * @param    isBuy           该章节是否购买
         * @param    advanceBool     是否为预加载 默认false 不是 ,true 为是
         * */
        chapterAjaxInit: function (chapterId, vipStatus, isBuy, advanceBool) {

            var that = this,
                chapterBox = $('#chapter-' + chapterId);

            //判断用户是否登陆了,登陆发送ajax,获取用户是否把该章节加入书签
            if (Login.isLogin()) {
                $.ajax({
                    type: 'GET',
                    url: '/ajax/chapter/checkChapterMark',
                    dataType: 'json',
                    data: {
                        chapterId: chapterId,
                        bookId: that.bookId
                    },
                    success: function (response) {
                        if (response.code == 0 && response.data.isMarked == 1) {
                            if (advanceBool) {
                                that.chapterAdvanceLoad.isMarked = 1;
                            } else {
                                chapterBox.find('.book-mark').addClass('on').data('eid', '');
                            }

                        }
                    }
                })
            }

            //获取章节书评 , 除了 该章节为vip章节,且未订阅的 情况下 , 都加载章节评论
            if (!( vipStatus == 1 && isBuy == 0 )) {
                $.ajax({
                    type: 'GET',
                    url: '/ajax/chapter/getChapterReviews',
                    dataType: 'json',
                    data: {
                        chapterId: chapterId,
                        bookId : that.bookId
                    },
                    success: function (response) {
                        if (response.code == 0) {
                            var chapterDiscussList = ejsChinese('/ejs/qd/js/read.qiyan.com/chapterDiscuss.73d76.ejs', response.data);
                            if (advanceBool) {
                                that.chapterAdvanceLoad.discussList = chapterDiscussList;
                            } else {
                                chapterBox.find('.text-info').append(chapterDiscussList);
                            }
                        }
                    }
                })
            }

            //获取章节打赏显示 ,签约作家才能打赏
            if (!( vipStatus == 1 && isBuy == 0 ) && g_data.pageJson.isSign == 1) {
                $.ajax({
                    type: 'GET',
                    url: '/ajax/chapter/getChapterReward',
                    dataType: 'json',
                    data: {
                        chapterId: chapterId
                    },
                    success: function (response) {
                        if (response.code == 0) {
                            //打赏列表
                            response.data.mePreFix = g_data.pageJson.mePreFix;
                            var chapterAdmire = ejsChinese('/ejs/qd/js/read.qiyan.com/chapterAdmire.068e6.ejs', response.data);
                            //打赏数量
                            response.data.rewardNum = (response.data.rewardNum == 0 ) ? '' : response.data.rewardNum;

                            if (advanceBool) {
                                that.chapterAdvanceLoad.admire = chapterAdmire;
                                that.chapterAdvanceLoad.admireNum = response.data.rewardNum;
                            } else {
                                chapterBox.find('.j_admireNum').text(response.data.rewardNum);
                                chapterBox.find('.admire-wrap').append(chapterAdmire);
                            }
                        }
                    }
                })
            }

            //判断是否有口令红包
            if (!( vipStatus == 1 && isBuy == 0 )) {
                $.ajax({
                    type: 'GET',
                    url: '/ajax/luckyMoney/getPwdHongBaoByChapter',
                    dataType: 'json',
                    data: {
                        bookId: that.bookId,
                        chapterId: chapterId
                    },
                    success: function (response) {

                        var pwdBtnDom = '';

                        //当请求成功,并且返回红包list存在,且不为0时,有口令红包,显示入口
                        if (response.code == 0 && response.data.list.length) {

                            pwdBtnDom = '<a class="admire pwd-btn lang j_pwdRedPacketBtn" href="javascript:" data-chapterid="' + chapterId + '" data-eid="qd_R122" >口令红包</a>';

                            if (advanceBool) {
                                that.chapterAdvanceLoad.pwdRedBtn = pwdBtnDom;
                            } else {
                                chapterBox.find('.read-btn-box').append(pwdBtnDom);
                            }
                        }
                    }
                })
            }

        },
        /*
         * 当为瀑布流时,加载懒加载事件
         * @method chapterLazyLoad
         * */
        chapterLazyLoad: function () {

            var that = this,
            //页面高度
                pageHeight = $(document).height(),
            //滚动条距顶部高度
                winSTop,
                winHeight = $(window).height();

            $(window).on('scroll', that.throttle(function () {
                //当为左右切换时,不执行
                if (g_data.readSetting.rt == 0) return false;
                //当当前章节为vip章节,且未订阅时,不再加载下面章节
                if (g_data.chapter.vipStatus == 1 && g_data.chapter.isBuy == 0) return false;
                //当正在加载章节时,不再加载下面章节
                if (that.chapterLoad) return false;
                //当前章节是否为最后一章(普通章节&&vip章节),不再加载下面章节
                if (that.loadLastBool && !that.chapterAdvanceLoad.bool) return false;

                //当页面为瀑布流形式,且章节判断是可以继续加载时,加载
                pageHeight = $(document).height();
                winSTop = $(window).scrollTop();
                //初始化浏览器高度
                winHeight = $(window).height();

                //vip 不提前加载,页面滚到底部,加载
                var cHeight = ( g_data.chapter.vipStatus == 1 && g_data.nextChapterVip == 1 ) ? winHeight : ( 2.5 * winHeight );
                //当剩下小于1屏未显示的时候,加载新的章节
                if (pageHeight <= ( winSTop + cHeight )) {
                    //显示加载load
                    $('.j_chapterLoad').show();
                    //判断与加载里面的是否有章节信息
                    if (that.chapterAdvanceLoad.bool && that.chapterAdvanceLoad.id == g_data.chapter.id) {
                        //去显示预加载的内容
                        that.addAdvanceChapter();
                        $('.j_chapterLoad').hide();
                    } else {
                        //重置为true,禁止发送请求
                        that.chapterLoad = true;
                        //拉取章节信息
                        that.getChapterInfo(g_data.chapter.nextId, false, false,
                            //数据拉取成功的回调
                            function (data) {
                                //更新cookie
                                that.nearReadCookies();
                                //重置为false,允许下次符合条件时,发送请求
                                that.chapterLoad = false;
                                $('.j_chapterLoad').hide();
                                //更新阅读进度
                                that.repeatReadStatus(data.chapterInfo.chapterId, data.chapterInfo.chapterName, data.chapterInfo.vipStatus, data.chapterInfo.updateTime, 0);
                                if (that.firstScroll) that.firstScroll = false;
                            },
                            //数据拉取失败的回调
                            function () {
                                //拉取失败,重置为false ,再次拉取
                                that.chapterLoad = false;
                            }
                        );
                    }
                    //章节预加载
                } else if (!that.chapterAdvanceLoad.bool && g_data.nextChapterVip != 1 && !that.firstScroll && !that.chapterLoad) {
                    //重置为true,禁止发送请求
                    that.chapterLoad = true;
                    that.chapterAdvanceLoad.bool = true;
                    //拉取章节信息
                    that.getChapterInfo(g_data.chapter.nextId, false, true,
                        //数据拉取成功的回调
                        function () {
                            //加载完成,重置
                            that.chapterLoad = false;
                            $(window).trigger('scroll');
                        },
                        //数据拉取失败的回调
                        function () {
                            //拉取失败,重置为false ,再次拉取
                            that.chapterLoad = false;
                            //预加载完成,标识
                            that.chapterAdvanceLoad.bool = false;
                        }
                    );
                }

            }, 100, 160));

            //当页面高度小于视窗高度时,触发
            if (pageHeight <= winHeight) {
                //标识第一次加载,直接加载dom到页面
                that.firstScroll = true;
                $(window).trigger('scroll');
            }
        },
        /*
         * 显示预加载章节
         * @method addAdvanceChapter
         * */
        addAdvanceChapter: function () {

            var that = this,
                chapterCon = that.chapterAdvanceLoad;

            //加入章节
            that.chapterBox.append(chapterCon.content);
            var chapterItem = $('#chapter-' + chapterCon.id);
            //当前章节url
            chapterItem.find('.book-mark').data('curl', chapterCon.url);
            //书签
            if (chapterCon.isMarked == 1) chapterItem.find('.book-mark').addClass('on').data('eid', '');
            //评论
            chapterItem.find('.text-info').append(chapterCon.discussList);
            //点赞
            if (chapterItem.find('.j_admireNum').length && g_data.pageJson.isSign == 1) {
                chapterItem.find('.j_admireNum').text(chapterCon.admireNum);
                chapterItem.find('.admire-wrap').append(chapterCon.admire);
            }
            //口令红包
            chapterItem.find('.read-btn-box').append(chapterCon.pwdRedBtn);
            //pageTurn加入页面中
            $('#j_readMainWrap').append(chapterCon.pageTurn);

            //重置章节预加载标识
            that.chapterAdvanceLoad = {
                bool: false,
                id: '',
                pageTurn: '',
                content: '',
                isMarked: 0,
                discussList: '',
                admire: '',
                admireNum: '',
                pwdRedBtn: '',
                url: ''
            };
        },
        /*
         * 添加删除章节书签
         * @method markOperate
         * @param e 事件对象
         * */
        markOperate: function (e) {

            //判断用户是否登录
            if (Login.isLogin()) {

                var that = this,
                    target = $(e.currentTarget),
                    targetChapter = target.parents('.text-wrap'),
                //获取章节id
                    chapterId = targetChapter.data('cid');

                if (target.hasClass('disabled')) return false;

                target.addClass('disabled');

                //当该章节书签标识,有on,删除书签
                if (target.hasClass('on')) {
                    //ajax删除书签
                    $.ajax({
                        type: 'GET',
                        url: '/ajax/chapter/delBookMark',
                        dataType: 'json',
                        data: {
                            bookId: that.bookId,
                            chapterId: chapterId
                        },
                        success: function (response) {
                            if (response.code == 0) {
                                target.removeClass('on');
                                that.readCommon.navMarkDelReset(chapterId);
                                that.tipsShow(1, '删除书签成功');
                                target.data('eid', 'qd_R104');
                            } else {
                                that.tipsShow(0, '删除书签失败');
                            }
                            target.removeClass('disabled');
                        }
                    })

                    //当该章节书签标识,无on,添加书签
                } else {

                    //获取章节name
                    var chapterTitle = targetChapter.find('.j_chapterName').text(),
                    // 获取该书是否在书架
                        isInBookShelf = ( $('.add-book').hasClass('in-shelf') ) ? 1 : 0;
                    //ajax添加书签
                    $.ajax({
                        type: 'POST',
                        url: '/ajax/chapter/addBookMark',
                        dataType: 'json',
                        data: {
                            bookId: that.bookId,
                            chapterId: chapterId,
                            chapterName: chapterTitle,
                            isInBookShelf: isInBookShelf
                        },
                        success: function (response) {
                            if (response.code == 0) {
                                target.addClass('on');
                                //加入书签栏
                                var chapterUrl = target.data('curl');
                                that.readCommon.navMarkAddReset(chapterId, chapterUrl, chapterTitle);
                                //显示提示
                                that.tipsShow(1, '加入书签成功');
                                target.data('eid', 'qd_R49');
                            } else {
                                that.tipsShow(0, '加入书签失败');
                            }
                            target.removeClass('disabled');
                        }
                    });
                }
                //用户未登录,显示登录弹窗
            } else {
                Login.showLoginPopup();
            }
        },
        /*
         * tips显示
         * @method tipsShow
         * @param type  标识 : 1-成功  0-失败
         * @conText 提示文字
         * */
        tipsShow: function (type, conText) {

            var typeText = type ? 'success' : 'error',
                typeIcon = type ? '&#xe61d;' : '&#xe61e;',
                content = '<div class="simple-tips"><span class="iconfont ' + typeText + '">' + typeIcon + '</span><h3>' + conText + '</h3></div>';

            if (type) {
                new LightTip({
                    content: content
                }).success();
            } else {
                new LightTip({
                    content: content
                }).error();
            }

        },
        /**
         * 显示用户行为小气泡
         * @method showUserActBubble
         * @param e 事件对象
         */
        showUserActBubble: function (e) {

            if (e != undefined) {
                var target = $(e.currentTarget);
                target.find('.active-bubble').stop().fadeIn(200);
            }

        },
        /**
         * 隐藏用户行为小气泡
         * @method showUserActBubble
         * @param e 事件对象
         */
        hideUserActBubble: function (e) {

            if (e != undefined) {
                var target = $(e.currentTarget);
                target.find('.active-bubble').stop().fadeOut(200);
            }

        },
        /**
         * 打开评论弹窗
         * @mthod commentPopup
         * @param e 事件对象
         */
        commentPopup: function (e) {

            //判断用户是否登录
            if (Login.isLogin()) {

                var that = this,
                    target = $(e.currentTarget),
                    targetChapter = target.parents('.text-wrap'),
                    data = {
                        //获取章节name
                        chapterTitle: targetChapter.find('.j_chapterName').text(),
                        chapterId: targetChapter.data('cid'),
                        commentList: []
                    };

                var commentLen = parseInt(target.prev('.j_comReplyNum').text());
                //当回帖条数内容为空的时候,且回帖小于3不需要发送ajax请求
                if (commentLen != '' && commentLen > 3) {
                    //ajax加载
                    $.ajax({
                        type: 'GET',
                        url: '/ajax/chapter/getChapterUpdReviews',
                        dataType: 'json',
                        data: {
                            chapterId: targetChapter.data('cid'),
                            bookId: that.bookId
                        },
                        success: function (response) {
                            if (response.code == 0) {
                                //合并数据
                                data.commentList = response.data.list;
                                //处理恢复内容
                                for (var i = 0; i < data.commentList.length; i++) {
                                    data.commentList[i].content = that.fnToImg(data.commentList[i].content);
                                }
                                data.mePreFix = g_data.pageJson.mePreFix;
                                //加载评论弹窗
                                that.AddCommentPop(data);
                            }
                        }
                    });
                } else {
                    //加载评论弹窗
                    that.AddCommentPop(data);
                }
                //未登录,弹出登陆框
            } else {
                Login.showLoginPopup();
            }

        },
        /*
         * 加载评论弹窗
         * @method AddCommentPop
         * @param data   ejs加载数据
         */
        AddCommentPop: function (data) {

            //异步加载弹窗模板
            var commentPopup = ejsChinese('/ejs/qd/js/read.qiyan.com/commentPopup.8b0dc.ejs', data);
            //显示弹窗
            var panel = new Panel({
                drag: false,
                headerVisible: false,
                width: 600,
                footerVisible: false,
                content: commentPopup
            });
            panel.confirm();
            this.readPanel = panel;

            //初始化字数统计
            new Textarea({
                selector: '.j_commentText'
            }).plug(TextCounter, {
                counter: '.j_commentCounter',
                countDirection: 'up',
                strictMax: true,
                maxCount: 200
            });

        },
        /*
         * 显示获取用户评论回复信息
         * @method showUserDiscuss
         * @param e 事件对象
         * */
        showUserDiscuss: function (e) {

            if (e != undefined) {

                var that = this,
                    target = $(e.currentTarget),
                    postId = target.data('postid'),
                    userDiscussItem = target.find('.reply-popup');

                //清除定时器,立即隐藏弹窗
                clearTimeout(this.discussTime);
                $('.reply-popup').hide();

                //判断弹窗是否是第一次加载
                if (userDiscussItem.length == 0) {
                    //ajax加载
                    $.ajax({
                        type: 'GET',
                        url: '/ajax/chapter/getChapterPost',
                        dataType: 'json',
                        data: {
                            postId: postId,
                            bookId: that.bookId,
                            chapterId : target.parents('.text-wrap').attr('data-cid')
                        },
                        success: function (response) {
                            if (response.code == 0) {

                                //处理获取data
                                var data = response.data;

                                //把postId、mePreFix传入ejs,做标识
                                data.postId = postId;
                                data.mePreFix = g_data.pageJson.mePreFix;

                                //处理content
                                data.content = that.fnToImg(data.content);
                                //处理replyList的 replyContent
                                for (var i = 0; i < data.replyList.length; i++) {
                                    data.replyList[i].replyContent = that.fnToImg(data.replyList[i].replyContent);
                                }

                                //初始化ejs
                                userDiscussItem = ejsChinese('/ejs/qd/js/read.qiyan.com/chapterDiscussDetail.3887c.ejs', data);
                                target.append(userDiscussItem);
                            }
                        }
                    });
                } else {
                    userDiscussItem.show();
                }
            }
        },
        /*
         * 隐藏用户评论回复弹窗
         * @method hideUserDiscuss
         * @param e 事件对象
         * */
        hideUserDiscuss: function (e) {
            if (e != undefined) {
                var target = $(e.currentTarget),
                    userDiscussItem = target.find('.reply-popup');

                //移除鼠标 mouseenter ,2s后隐藏弹窗
                this.discussTime = setTimeout(function () {
                    userDiscussItem.fadeOut(200);
                }, 500);
            }
        },
        /*
         * 关闭用户评论回复弹窗
         * @method closeUserDiscuss
         * @param e 事件对象
         * */
        closeUserDiscuss: function (e) {
            var target = $(e.currentTarget),
                userDiscussItem = target.parents('.reply-popup');
            userDiscussItem.fadeOut(200);
        },
        /*
         * 提交章节评论
         * @method commentReply
         * @param e 事件对象
         * */
        commentReply: function (e) {

            var that = this,
                target = $(e.currentTarget),
                chapterId = target.data('cid'),
                tParent = target.parents('.comment-text-wrap'),
                repInput = tParent.find('.j_commentText'),
                repCon = repInput.val();

            var getOrderSucceed;
            //在按钮loading的时候再次点击则不执行逻辑
            if (target.hasClass('btn-loading')) {
                return;
            }

            var inputType = that.isRightFormat(repCon),
                inputBox = tParent.find('.count-text');

            switch (inputType) {
                case 0 :
                    inputBox.addClass('error');
                    tParent.find('.error-tip').text('请输入评论内容');
                    break;
                case 2:
                    inputBox.addClass('error');
                    tParent.find('.error-tip').text('禁止水贴');
                    break;
                case 1:
                    //显示按钮loading样式
                    that.loading.startLoading(target, function () {
                        return getOrderSucceed;
                    }, 200);
                    //ajax加载
                    $.ajax({
                        type: 'POST',
                        url: '/ajax/chapter/addPost',
                        dataType: 'json',
                        data: {
                            bookId: this.bookId,
                            chapterId: chapterId,
                            content: repCon
                        },
                        success: function (response) {
                            if (response.code == 0) {

                                //跟新评论列表
                                var data = response.data,
                                    chapterBox = $('#chapter-' + chapterId),
                                    chDiscussBox = chapterBox.find('.user-post-list'),
                                    chDiscussList = chDiscussBox.find('dd'),
                                //章节评论数量dom
                                    comReplyNum = chapterBox.find('.j_comReplyNum'),
                                    cutNum = parseInt(comReplyNum.text());

                                //添加最新评论
                                addDiscussItem = '<dd class="j_userPost" data-postid="' + data.postId + '"><img src="' + data.avatar + '" alt="' + data.userName + '"></dd> ';
                                //当当前显示评论为3个时,移除最后一个
                                if (chDiscussList.length >= 3) {
                                    chDiscussList.eq(2).remove();
                                }
                                //在dom里面的最前面添加最新评论
                                chDiscussBox.prepend(addDiscussItem);
                                //章节评论数据量加1
                                cutNum = (cutNum) ? (cutNum + 1) : 1;
                                comReplyNum.text(cutNum);
                                //关闭弹窗
                                that.readPanel.close();
                                that.tipsShow(1, '评论成功');
                                //其他失败原因
                            } else if (response.code == 5501) {
                                inputBox.addClass('error');
                                tParent.find('.error-tip').text('经验值不足,禁止评论');
                            } else {
                                inputBox.addClass('error');
                                tParent.find('.error-tip').text(response.msg);
                            }
                            //设置loading结束标识
                            getOrderSucceed = true;
                            that.loading.clearLoading(target);
                        },
                        error: function () {
                            inputBox.addClass('error');
                            tParent.find('.error-tip').text('回复失败,请稍后再试');
                            //设置loading结束标识
                            getOrderSucceed = true;
                            that.loading.clearLoading(target);
                        }
                    });
                    break;
            }
        },
        /*
         * 提交用户评论回复的评论
         * @method UserDiscussReply
         * @param e 事件对象
         * */
        userDiscussReply: function (e) {

            //判断用户是否登陆了
            if (Login.isLogin()) {
                var that = this,
                    target = $(e.currentTarget),
                    postId = target.data('postid'),
                    replyTxt = target.next('.j_postReplyText'),
                    repCon = replyTxt.val();

                var getOrderSucceed;
                //在按钮loading的时候再次点击则不执行逻辑
                if (target.hasClass('btn-loading')) {
                    return;
                }
                var inputType = that.isRightFormat(repCon);

                switch (inputType) {
                    //未输入
                    case 0 :
                        replyTxt.addClass('error');
                        replyTxt.next('.error-tip').text('请输入评论内容');
                        break;
                    //纯数字
                    case 2:
                        replyTxt.addClass('error');
                        replyTxt.next('.error-tip').text('禁止水贴');
                        break;
                    //输入符合
                    case 1:
                        //显示按钮loading样式
                        that.loading.startLoading(target, function () {
                            return getOrderSucceed;
                        }, 200);
                        //ajax加载
                        $.ajax({
                            type: 'POST',
                            url: '/ajax/chapter/addReply',
                            dataType: 'json',
                            data: {
                                postId: postId,
                                content: repCon,
                                bookId : that.bookId,
                                chapterId :target.parents('.text-wrap').attr('data-cid')
                            },
                            success: function (response) {
                                if (response.code == 0) {
                                    //xss转译
                                    repCon = that.safeStr(repCon);
                                    //跟新评论列表
                                    var data = response.data,
                                    // 添加评论item
                                        replyDom = '<li>' +
                                            '<div class="user-photo">' +
                                            '<a target="_blank" href="' + g_data.pageJson.mePreFix + '.qiyan.com/friendIndex.aspx?id=' + data.userId + '">' +
                                            '<img src="' + data.avatar + '"> ' +
                                            '<span class="user-level lv' + data.userLevel + '"></span>' +
                                            '</a>' +
                                            '</div>' +
                                            '<div class="user-comment">' +
                                            '<h5><a href="' + g_data.pageJson.mePreFix + '.qiyan.com/friendIndex.aspx?id=' + data.userId + '" target="_blank">' + data.userName + '</a></h5> ' +
                                            '<p>' + repCon + '</p><p>' + data.time + '</p>' +
                                            '</div>' +
                                            '</li>';
                                    //获取评论列表
                                    var replyPop = target.parents('.reply-popup'),
                                        replyBox = replyPop.find('.other-reply-wrap'),
                                        replyList = replyBox.find('ul'),
                                        replyLi = replyList.find('li');
                                    //如果该评论下面没有一条评论,显示隐藏dom
                                    replyBox.show();
                                    //当已经显示有3条评论时,移除最后一条
                                    if (replyLi.length >= 3) {
                                        replyLi.eq(2).remove();
                                    }
                                    //添加评论
                                    replyList.prepend(replyDom);
                                    var replyNumBox = replyPop.find('.j_replyUserNum'),
                                        replyNum = parseInt(replyNumBox.text());
                                    //评论数量加1
                                    replyNum = (replyNum) ? (replyNum + 1) : 1;
                                    replyNumBox.text(replyNum);
                                    //清空输入框,alert显示评论成功
                                    replyTxt.val('');
                                    //that.tipsShow( 1 , '评论成功' );
                                } else if (response.code == 5501) {
                                    replyTxt.addClass('error');
                                    replyTxt.next('.error-tip').text('经验值不足,禁止评论');
                                } else {
                                    replyTxt.addClass('error');
                                    replyTxt.next('.error-tip').text(response.msg);
                                }
                                //设置loading结束标识
                                getOrderSucceed = true;
                                that.loading.clearLoading(target);
                            },
                            error: function () {
                                replyTxt.addClass('error');
                                replyTxt.next('.error-tip').text('回复失败,请稍后再试');
                                //设置loading结束标识
                                getOrderSucceed = true;
                                that.loading.clearLoading(target);
                            }
                        });
                        break;
                }


            } else {
                Login.showLoginPopup();
            }
        },
        /*
         * focus input 、textarea 移除error状态
         * @method focusInput
         * */
        focusInput: function () {

            //textArea
            $('body').on('focus', '.j_commentText', function () {
                var me = $(this),
                    tParent = me.parents('.comment-text-wrap');
                //移除error状态
                tParent.find('.count-text').removeClass('error');
                tParent.find('.error-tip').text('');
            })
            //input
            $('body').on('focus', '.j_postReplyText', function () {
                var me = $(this);
                //移除error状态
                me.removeClass('error');
                me.next('.error-tip').text('');
            })
        },
        /*
         * 页面章节,记录cookie
         * @method   nearReadCookies
         * @param    chapterId 章节id
         * */
        nearReadCookies: function () {

            var nearRead = Cookie.get('lrbc'),
                oldRRead = Cookie.get('rcr'),
                bid = this.bookId,
                chapterId = g_data.chapter.id,
                cVipStatus = g_data.chapter.vipStatus,
            //bookLrbr : 存储最新要存入cookies字符串 、bookLrbrItem : 拼接cookie 中要记录的book信息
                bookLrbr = bookLrbrItem = bid + '|' + chapterId + '|' + cVipStatus;
            bookRcr = bid;
            //"lrbc"
            if (nearRead) {
                var nearReadList = nearRead.split(','),
                    nrLen = nearReadList.length;
                if (nrLen != 0) {
                    var readBookInfo;
                    //判断cookie中是否经保存相同书籍了
                    for (var i = 0; i < nrLen; i++) {
                        readBookInfo = nearReadList[i].split('|');
                        if (bid == readBookInfo[0]) {
                            nearReadList.splice(i, 1);
                            break;
                        }
                    }
                    //判断cookie中书籍数量,>=3本,删除之后的留下2本
                    nrLen = nearReadList.length;
                    if (nrLen >= 3) {
                        //留下2个书信息,删除之后的
                        nearReadList.splice(1, nrLen - 2);
                    }
                    //在数组最前面添加这边书信息
                    nearReadList.splice(0, 0, bookLrbrItem);
                    bookLrbr = nearReadList.join(',');
                }
            }
            //"rcr"
            if (oldRRead) {
                var oldNearList = oldRRead.split(','),
                    oldLen = oldNearList.length;
                if (oldLen != 0) {
                    //判断cookie中是否经保存相同书籍了
                    for (var j = 0; j < oldLen; j++) {
                        if (oldNearList[j] == bid) {
                            oldNearList.splice(j, 1);
                            break;
                        }
                    }
                    //判断cookie中书籍数量,>=38本,删除之后的留下299本
                    oldLen = oldNearList.length;
                    if (oldLen >= 38) {
                        //留下299个书信息,删除之后的
                        oldNearList.splice(36, oldLen - 37);
                    }
                    oldNearList.splice(0, 0, bid);
                    bookRcr = oldNearList.join(',');
                }
            }

            //判断用户是否登录,未登录保存365天,登录保存8小时
            var day = Login.isLogin() ? 8 : 8760;
            //lrbc
            Cookie.set('lrbc', bookLrbr, 'qiyan.com', '/', 3600000 * day);
            //rcr
            Cookie.set('rcr', bookRcr, 'qiyan.com', '/', 86400000 * 365);
        },
        /*
         * 当为左右切换,加载键盘事件
         * @method chapterKey
         */
        chapterKey: function () {
            var toPage;
            //键盘事件
            $(document).on("keydown", function (e) {
                var target = e.target,
                    tagName = target.nodeName.toLowerCase();
                //当阅读模式为翻页模式,上下按键切换章节有效
                if (g_data.readSetting.rt == 0 && tagName != 'textarea' && tagName != 'input') {
                    if (e.keyCode == 37) {
                        //左方面键
                        toPage = $('#j_chapterPrev');
                        if (!toPage.hasClass('disabled')) {
                            //页面跳转链接
                            window.location.href = toPage.attr('href');
                        }
                    } else if (e.keyCode == 39) {
                        //右方面键
                        toPage = $('#j_chapterNext');
                        if (!toPage.hasClass('disabled')) {
                            //页面跳转链接
                            window.location.href = toPage.attr('href');
                        }
                    }
                }
            });

        },
        /*
         * 简单的节流函数
         * @method throttle
         * @param func
         * @param wait
         * @param mustRun
         * */
        throttle: function (func, wait, mustRun) {

            var timeout,
                startTime = new Date();

            return function () {
                var context = this,
                    args = arguments,
                    curTime = new Date();

                clearTimeout(timeout);
                // 如果达到了规定的触发时间间隔，触发 handler
                if (curTime - startTime >= mustRun) {
                    func.apply(context, args);
                    startTime = curTime;
                    // 没达到触发间隔，重新设定定时器
                } else {
                    timeout = setTimeout(func, wait);
                }
            };
        },

        /**
         * 举报弹窗
         * @method reportPopup
         * @param e 事件对象
         */
        reportPopup: function (e) {
            //判断用户是否登录
            if (Login.isLogin()) {
                var that = this,
                    target = $(e.currentTarget),
                    chapterBox = target.parents('.text-wrap'),
                    chapterId = chapterBox.data('cid'),
                    chapterName = chapterBox.find('.j_chapterName').text(),
                    reportData = {
                        chapterName: chapterName,
                        chapterId: chapterId
                    },
                //异步加载弹窗模板
                    reportPopup = ejsChinese('/ejs/qd/js/component/template/reportPopup.a5e83.ejs', reportData);
                //显示弹窗
                var panel = new Panel({
                    drag: false,
                    headerVisible: false,
                    width: 520,
                    footerVisible: false,
                    content: reportPopup
                });
                panel.confirm();
                that.readPanel = panel;

                //初始化字数统计
                new Textarea({
                    selector: '.j_reportMsgText'
                }).plug(TextCounter, {
                    counter: '#reportCounter',
                    countDirection: 'up',
                    strictMax: true,
                    maxCount: 100
                });

                //初始化单选框
                new Radio({
                    selector: '.type input'
                });
            } else {
                Login.showLoginPopup();
            }
        },
        /*
         * 提交章节举报
         * @method accusationAjax
         * @param e 事件对象
         * */
        accusationAjax: function (e) {

            var that = this,
                target = $(e.currentTarget),
                reportBox = target.parents('.report-wrap'),
                reportRadio = reportBox.find('.lbf-radio'),
                checkRadio = reportBox.find('.lbf-radio-checked'),
                rindex = reportRadio.index(checkRadio),
            // 提交输入内容
                content = reportBox.find('.j_reportMsgText').val();

            if (rindex == -1) {
                that.tipsShow(0, '请勾选举报类型');
            } else if (content == '') {
                that.tipsShow(0, '请输入举报描述');
            } else {
                //获取章节id、章节名称
                var chapterId = target.data('cid'),
                    chapterName = reportBox.find('.j_reportChapterName').text();
                chapterUrl = $('#chapter-' + chapterId).find('.book-mark').data('curl');
                $.ajax({
                    type: 'POST',
                    url: '/ajax/chapter/chapterReport',
                    dataType: 'json',
                    data: {
                        bookId: that.bookId,
                        chapterId: chapterId,
                        bookName: g_data.bookInfo.bookName,
                        chapterName: chapterName,
                        type: rindex,
                        url: chapterUrl,
                        content: content
                    },
                    success: function (response) {
                        if (response.code == 0) {
                            that.tipsShow(1, '举报成功');
                            that.readPanel.close();
                        } else {
                            that.tipsShow(0, '举报失败,请重新提交');
                        }
                    }
                })
            }

        },
        /**
         * 右侧导航章节评论
         * @method setDiscussHref
         * @param e 事件元素
         */
        setDiscussHref: function (e) {

            var that = this,
                target = $(e.currentTarget),
                chapterId;

            var resetLinks = [
                // 整本书的讨论区
                '//forum.qiyan.com/NewForum/List.aspx?forumId=',
                // 单章节讨论区
                '//forum.qiyan.com/NewForum/Detail.aspx?threadid=',
                // 女生网整本书讨论区
                '//forum.qdmm.com/MMBookForumNew.aspx?BookId=',
                // 女生网单章节讨论区
                '//forum.qdmm.com/MMThreadDetailNew.aspx?threadid='
            ];

            // 存放现在的href
            var nowLink = '';

            //当为翻页模式时
            if (g_data.readSetting.rt == 0) {
                chapterId = g_data.chapter.id;
            } else if (g_data.readSetting.rt == 1) {
                chapterId = that.readCommon.scrollChapter();
            }

            var threadBox = $('#chapter-' + chapterId).find('.user-post-list');
            //当不存在时，跳转整本书的讨论区
            if (threadBox.length == 0) {
                //替换链接
                if (g_data.isWebSiteType == 0) {
                    nowLink = resetLinks[2] + that.bookId;
                } else {
                    nowLink = resetLinks[0] + that.bookId;
                }
            } else {
                var threadId = threadBox.data('threadid');
                //替换链接
                if (g_data.isWebSiteType == 0) {
                    nowLink = (threadId == 0 ) ? ( resetLinks[2] + that.bookId ) : ( resetLinks[3] + threadId );
                } else {
                    nowLink = (threadId == 0 ) ? ( resetLinks[0] + that.bookId ) : ( resetLinks[1] + threadId );
                }
            }

            //替换链接
            target.find('a').attr('href', nowLink);
        },
        /*
         * 是否自动订阅下一章
         * @method autoSubNextChapter
         * @param e 事件元素
         * */
        autoSubNextChapter: function (e) {

            var subscribeCheck = $('#j_autoSubscribe'),
                targetBox = subscribeCheck.parent(),
                dataEid;

            //判断checkbox是否选中
            if (targetBox.hasClass('lbf-checkbox-checked')) {
                targetBox.removeClass('lbf-checkbox-checked');
                subscribeCheck.prop('checked', false);
                dataEid = 'qd_R115';
            } else {
                targetBox.addClass('lbf-checkbox-checked');
                subscribeCheck.prop('checked', true);
                dataEid = 'qd_R114';
            }
            //埋点
            report.send(e, {
                eid: dataEid
            }, 'l1');

        },
        /**
         * 阅读进度同步,以及是否加入书架
         * @method readStatusSync
         */
        readStatusSync: function () {
            var that = this;
            //获取章节name
            var chapterBox = $('#chapter-' + g_data.chapter.id),
                chapterName = chapterBox.find('.j_chapterName').text(),
                updateTime = chapterBox.find('.j_updateTime').text();

            //用户未登陆,不发送显示阅读进度请求
            if (Login.isLogin()) {
                $.ajax({
                    type: 'GET',
                    url: '/ajax/chapter/GetReadStatus',
                    dataType: 'json',
                    data: {
                        bookId: that.bookId,
                        chapterId: g_data.chapter.id,
                        chapterName: encodeURIComponent(chapterName),
                        isVip: g_data.chapter.vipStatus,
                        updateTime: updateTime
                    },
                    success: function (response) {
                        if (response.code === 0) {

                            var data = response.data;
                            //有阅读进度,加载弹窗
                            if (data.status == 1) {
                                //异步加载阅读进度同步弹窗模板
                                var readStatus = ejsChinese('/ejs/qd/js/component/template/readStatus.93154.ejs', data);
                                //显示弹窗
                                var panel = new Panel({
                                    drag: false,
                                    headerVisible: false,
                                    width: 520,
                                    footerVisible: false,
                                    content: readStatus
                                });
                                panel.confirm();
                                that.readPanel = panel;
                            }
                            //是否在书架
                            if (data.isInBookShelf == 1) {
                                $('.add-book').addClass('in-shelf').html('已在书架');
                            }
                        }
                    }
                });
            }
        },
        /*
         * 背景广告
         * */
        bgOpsInfo: function () {
            var that = this;
            //页面一进入判断章节是否为vip章节
            if (g_data.chapter.vipStatus == 1) return false;
            //当随机广告为0张,不显示
            var bgOps = g_data.bgOpsInfo// 4.5.4 ;
            if (bgOps.hasAd == 0) return false;

            //判断广告显示类型 1是背景广告，2是人物动效广告
            if (bgOps.adType == 1) {
                that.singleBgOp(bgOps);
            } else {
                that.floatImgOp(bgOps);
            }
        },
        /**
         * 单独的背景随机广告
         * @method singleBgOp
         * @param bgOps 后台传过来的json信息
         */
        singleBgOp: function (bgOps) {
            var bsSupport = 'BackgroundSize' in document.documentElement.style || 'WebkitBackgroundSize' in document.documentElement.style,
                winWidth = parseInt($(window).width()),
                data = {
                    //获取图片
                    bgOps: bgOps,
                    //以1920为标准,设置倍数
                    imgSize: ( winWidth > 1920 && bsSupport ) ? parseFloat(winWidth / 1920) : 1
                },
                bgOpsBox = $('#j_bodyRecWrap');

            var bgOpsDom = new EJS({
                url: '/ejs/qd/js/read.qiyan.com/gameBox.b9135.ejs'
            }).render(data);
            //插入广告
            setTimeout(function () {
                bgOpsBox.append(bgOpsDom);
                bgOpsBox.fadeIn(300);
            }, 0);


            //判断浏览器是否支持改属性
            if (!bsSupport) return false;

            //resize
            $(window).on('resize', function () {

                var nowWidth = parseInt($(window).width());

                //当屏幕宽度无变化时,return false
                if (winWidth == nowWidth) return false;
                //宽度变化,执行
                winWidth = nowWidth;
                var size = ( winWidth > 1920 && bsSupport ) ? parseFloat(winWidth / 1920) : 1;

                if (data.imgSize == size) return false;
                data.imgSize = size;
                //重置样式
                if (size == 1) {
                    bgOpsBox.find('.body-rec-wrap').css({
                        'background-size': 'auto',
                        '-webkit-background-size': 'auto'
                    })
                } else {
                    bgOpsBox.find('.body-rec-wrap').css({
                        'background-size': '100% auto',
                        '-webkit-background-size': '100% auto'
                    })
                }
                $('#j_leftRecBox').css({
                    'top': 110 * size + 'px',
                    'margin-left': -704 * size + 'px',
                    'width': 200 * size + 'px',
                    'height': 530 * size + 'px'
                });
                $('#j_rightRecBox').css({
                    'top': 110 * size + 'px',
                    'margin-right': -704 * size + 'px',
                    'width': 200 * size + 'px',
                    'height': 530 * size + 'px'
                });
            });
        },
        /**
         * 两侧人物和字的特效广告
         * @method floatImgOp
         * @param bgOps 后台传过来的json信息
         */
        floatImgOp: function (bgOps) {
            var floatImgOp = $('#j_bodyRecWrap');

            bgOps.isShowPerson = Cookie.get('floatOp');

            var floatOpDom = new EJS({
                url: '/ejs/qd/js/read.qiyan.com/floatOpBox.2d319.ejs'
            }).render(bgOps);

            //插入广告
            setTimeout(function () {
                var that = this;
                floatImgOp.append(floatOpDom);
                floatImgOp.fadeIn(300);
                var opElements = $('.left-person, .left-word, .right-person, .right-word');
                that.opElements = opElements;
            }, 0);

            //拿不到cookie时表明已经过了12分钟，显示人物特效广告
            if (!bgOps.isShowPerson) {
                //判断滚动条方向
                function scroll(fn) {
                    var beforeScrollTop = $(document).scrollTop(),
                        fn = fn || function () {
                            };
                    window.addEventListener('scroll', function () {
                        var afterScrollTop = $(document).scrollTop(),
                            delta = afterScrollTop - beforeScrollTop;
                        if (delta === 0) return false;
                        fn(delta > 0 ? "down" : "up");
                    }, false);
                }

                //往下滚动时触发广告动效
                scroll(function (direction) {
                    if (direction == 'down') {
                        var that = this;
                        if ($(document).scrollTop() > 0) {
                            that.opElements.addClass('action');
                        }
                    }
                });

                //种cookie 12分钟后失效
                var env = g_data.envType || '';
                //线上环境种cookie去掉pro前缀种
                if (env == 'pro') {
                    env = '';
                }
                Cookie.set('floatOp', 12, env + 'read.qiyan.com', '/', 720000);
            }
        },
        /*
         * 替换特殊字符为img
         * @method fnToImg
         * @param  str  替换的字符串
         * @return (string)
         * */
        fnToImg: function (str) {
            //正则第一次过滤fn1-60，替换成对应img
            var textContent = str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\[fn=(\d+)\]/g, '<img src=//c.pingba.qiyan.com/images/newface/f1/$1.png>'),
            //正则第二次过滤fn2_x 3_x 替换对应img
                textContent2 = textContent.replace(/\[fn=(\d+)_(\d+)\]/g, '<img src=//c.pingba.qiyan.com/images/newface/f$1/$2.gif>');

            return textContent2;
        },
        /**
         * 关闭当前弹窗
         * @method closeCurrentPopup
         */
        closeCurrentPopup: function () {
            var that = this;
            that.readPanel.close();
        },
        /*
         * 输入判断
         * @method isRightFormat
         * @param str  输入文字
         * @return num 标识
         * */
        isRightFormat: function (str) {
            //如果输入为空时,返回0
            if (str == '') {
                return 0;
            }
            //当输入问纯数字时 ,返回2
            if ((/^\d+$/).test(str)) {
                return 2;
            }
            //如果都不是,输入是正确的,返回2
            return 1;
        },
        /**
         * 判断用户是否登录，获取信息
         * @method getUserFansInfo
         */
        getUserFansInfo: function () {
            var that = this;
            //如果未登录，不发请求，否则会报错，登录后会切换这块DOM，所以判断如果登录后的状态是显示情况下，才发请求
            if (Login.isLogin()) {
                $.ajax({
                    type: "GET",
                    url: "/ajax/userInfo/GetUserFansInfo",
                    data: {
                        //请求参数
                        bookId: that.bookId
                    },
                    success: function (data) {
                        if (data.code === 0) {
                            //获取粉丝接口里的数据
                            var userFansInfo = data.data;
                            //填入用户等级标签
                            var levelInfo = userFansInfo.userLevel;
                            $('#userLevel').text(levelInfo);
                            //获取用户头像
                            that.userImg = userFansInfo.avatar;
                        }
                    }
                });
            }
        },
        /*
         * 章节订阅
         * @method subscribeChapter
         * */
        subscribeChapter: function (e) {
            //如果是弱登录状态，则显示登录框
            if (!Login.isLogin()) {
                Login && Login.showLoginPopup && Login.showLoginPopup();
                return;
            }
            if (g_data.salesMode == 2) {
                new LightTip({
                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>请前往起点APP订阅</h3></div>'
                }).error();
                return;
            }
            var that = this,
                target = $(e.currentTarget),
                soa = target.data('soa'),
                chapterPrice = target.find('i').text();
            //章节订阅标识
            g_data.isScribe = 1;
            //订阅请求所需数据准备
            that.requiredData = {
                bookId: that.bookId,
                chapterPrice: chapterPrice,
                chapters: [],
                //是否自动订阅
                isRenew: $('#j_autoSubscribe').is(':checked') ? 1 : 0
            };

            //判断是否为全部章节订阅或者单章节订阅
            switch (soa) {
                //单章节订阅
                case 0 :
                    //触发订阅的当前章节id
                    var chapterBox = target.parents('.text-wrap');
                    //章节num
                    that.requiredData.chapterCnt = 1;
                    //章节信息
                    that.requiredData.chapters.push({
                        chapterId: parseInt(chapterBox.data('cid')),
                        chapterCnt: parseInt(chapterBox.find('.j_chapterWordCut').text()),
                        price: parseInt(chapterPrice),
                        uuid: parseInt(target.data('uid'))
                    });
                    that.requiredData.isBuyAll = 0;
                    break;
                //全部章节订阅
                case 1:
                    //章节num
                    that.requiredData.chapterCnt = target.find('.j_chapterNum').text();
                    that.requiredData.isBuyAll = 1;
                    break;
            }
            //发获取余额的ajax请求
            that.payment.getBalance(this.requiredData, this.payment.compareBalance);
        },
        /**
         * 立即支付（在余额充足的情况下）
         * @method payNow
         */
        payNow: function (e) {

            var that = this;

            this.payment.goSubscribe(this.requiredData, function (payment, response) {

                //关闭支付弹窗
                payment.panel.close();
                //显示订阅成功
                that.tipsShow(1, '订阅成功');
                //更新改章节
                that.getChapterInfo(g_data.chapter.id, true);

            });
        },
        /*
         **展示快捷支付弹窗【方便本页面传参调用】【快捷支付】
         * @method showQuick
         * @param e 事件元素
         */
        showQuick: function () {
            var price = parseInt($('.subscribe-popup .current-price').html());
            var balance = parseInt($('.subscribe-popup .current-balance').html());
            this.payment.checkBeforeQuick(price, balance, '订阅', 5);
        },
        /*
         **终止轮询【快捷支付】
         * @method cancelLoop
         */
        cancelLoop: function () {
            this.payment.closeAndStop();
        },
        /*
         **风控验证完毕、绑定手机完毕后继续进行的逻辑
         * continueSub
         */
        continueSub: function (e) {
            this.payment.continueProcess(e);
        },
        /*
         * 章节打赏
         * @method showChapterVotePopup
         * */
        showChapterVotePopup: function (e) {
            var that = this;
            //为签约作家才能打赏
            if (g_data.pageJson.isSign == 1) {

                var target = $(e.currentTarget);
                //判断是否是章节打赏,是,获取章节id,否为undefined
                if (target.hasClass('j_admireBtn')) {
                    that.VotePopup.voteChapterId = target.parents('.text-wrap').data('cid');
                } else {
                    that.VotePopup.voteChapterId = undefined;
                }
                //调用开启投票弹窗
                that.showVotePopup(e);

            } else {
                //非签约作家
                new LightTip({
                    content: '<div class="simple-tips"><p>非签约作品不能进行打赏</p><p>建议使用推荐票支持本书</p></div>'
                }).success();
            }
        },
        /*
         * 章节打赏的回调
         * @method chapterRewardCallBack
         */
        chapterRewardCallBack: function () {
            var that = this;
            //参数:用户名,打赏金额
            that.VotePopup.voteRewardCallBack = function (userName, amount) {
                //如果章节id存在
                if (that.VotePopup.voteChapterId) {
                    //章节对象
                    var chapterBox = $('#chapter-' + that.VotePopup.voteChapterId),
                    //章节打赏区
                        rewardList = chapterBox.find('.user-active'),
                        rewardDd = rewardList.find('dd'),
                        rewardItem = '<dd class="j_userActive">'
                            + '<a href="//me.qiyan.com/Index.aspx" target="_blank"><img src="' + that.userImg + '" alt="' + userName + '"></a>'
                            + '<div class="active-bubble">'
                            + '<cite></cite><span>' + userName + ' 打赏了' + amount + '起点币</span>'
                            + '</div>'
                            + '</dd>';
                    //简繁体转换判断
                    if (rewardDd.length >= 5) {
                        rewardDd.eq(4).remove();
                    }
                    rewardItem = that.strToChinese(rewardItem);
                    rewardList.prepend(rewardItem);
                    //重置章节打赏人数
                    var rewardBox = chapterBox.find('.j_admireNum'),
                        rewardNum = rewardBox.text();
                    rewardNum = ( rewardNum != '' ) ? parseInt(rewardNum) : 0;
                    rewardBox.text(rewardNum + 1);

                }
            }
        },
        /**
         *  开启投票弹窗
         *  @method votePopup
         *  @param e 事件对象
         */
        showVotePopup: function (e) {

            //投票打赏标认识
            g_data.isScribe = 0;

            var that = this,
                targetBtn = $(e.currentTarget);
            g_data.pageJson.isLogin = Login.isLogin() ? 1 : 0;
            //showtype :1月票 2推荐票 3打赏  userLevel本页里没有，后续需要加到页面中，get到再传给VotePopup.getVoteData
            that.VotePopup.getVoteData(targetBtn.data('showtype'), $('#userLevel').text());
        },
        /**
         * 去充值后关闭弹窗
         * @method goCharge
         */
        goCharge: function (e) {
            var link = g_data.envType == 'pro' ? '//www.qiyan.com/charge/meRedirect': '//' + g_data.envType + 'www.qiyan.com/charge/meRedirect';
            //去旧的起点充值页面进行充值(需要判断登录状态)
            if (g_data.isScribe == 0) {
                // 打赏
                $(e.currentTarget).attr('href', link);
            } else if (g_data.isScribe == 1) {
                //订阅
                $(e.currentTarget).attr('href', link);
            }
            //关闭原来的打赏弹窗
            $('.lbf-panel .lbf-panel-close').trigger('click');

        },
        /*
         * 关闭订阅失败弹窗
         * @method closeSubscribePop
         */
        closeSubscribePop: function (e) {
            var target = $(e.currentTarget);
            //关闭原来的打赏弹窗
            target.parents('.lbf-panel').find('.lbf-panel-close').trigger('click');
        },
        /**
         * 转到快捷支付弹窗
         * @method showQuickPay
         */
        showQuickPay: function () {
            var that = this;
            /*
             * 参数1：panel【将当前页面的全局弹窗传递到payment.js中，当前弹窗在VotePopup.js中】
             */
            that.payment.getPanel(that.VotePopup.panel);
            /**
             * 参数1：按钮文案
             * 参数2：当前余额
             * 参数3：需要总价
             */
            that.payment.checkBeforeQuick(amount, balance, '打赏', 4);
            //that.payment.showQuickPayAlert('支付并打赏', balance, amount, '打赏');
            //将当前弹窗更新为快捷支付弹窗
        },
        /**
         * 转到快捷支付并打赏
         * @method selectPayMethod
         * @param e 事件对象
         */
        selectPayMethod: function (e) {
            var that = this;
            //获取当前支付类型
            var payMethod = $(e.currentTarget).attr('method');
            //参数1：支付方式代号【绑定在支付按钮method属性上，具体代号看payment.js中的payByTargetMethod】
            //参数2：后端请求所需数据【当前数据在votepopup.js中】
            //参数3：获取订单号和二维码的逻辑
            //参数4：查询打赏状态 —— 轮询的逻辑
            //参数5：当前作用域
            if (g_data.isScribe == 0) {
                // 打赏
                this.payment.payByTargetMethod(payMethod, this.VotePopup.requiredData, this.quickPay, this.CheckStatus, that);
            } else if (g_data.isScribe == 1) {
                //订阅
                this.payment.payByTargetMethod(payMethod, this.requiredData, this.payment.getOrderInfo, this.payment.paySubLoop, null, function (payment) {
                    //关闭支付弹窗
                    payment.panel.close();
                    //显示订阅成功
                    that.tipsShow(1, '订阅成功');
                    //更新改章节
                    that.getChapterInfo(g_data.chapter.id, true);
                });
            }

        },
        /**
         *  充值 → 支付并打赏 → 获取订单号和二维码
         *  @method quickPay
         */
        quickPay: function (that, requiredData, _payMethod, callBack, startLoop) {
            var getOrderSucceed;
            var targetBtn = $('.j_payByQuick');

            //当用户未勾选 '同意服务条款'时，默认操作不能进行下去
            if ($(that.agreeRulesCheckbox).is(':checked') == false) {
                $(that.agreeRulesCheckbox).next().removeClass('ui-checkbox-checked');
                return;
            }

            //显示按钮loading样式
            that.loading.startLoading(targetBtn, function () {
                return getOrderSucceed;
            }, 200);

            //设置支付类型
            requiredData.payMethod = parseInt(_payMethod);

            //获取EJS所需JSON
            var pageJson = g_data.pageJson;

            //充值和打赏的提示弹窗
            var rewardTipPopup = new EJS({
                url: '/ejs/qd/js/component/template/rewardTipPopup.b72df.ejs'
            }).render(pageJson);

            //发送请求充值获取订单号
            $.ajax({
                method: 'POST',
                url: '/ajax/reward/quickPay',
                dataType: 'json',
                data: requiredData,
                success: function (response) {
                    //设置loading结束标识
                    getOrderSucceed = true;
                    that.loading.clearLoading(targetBtn);
                    switch (response.code) {
                        //充值成功 0
                        case 0:
                            callBack(that, response.data, requiredData, startLoop, requiredData.amount - balance, '打赏');
                            break;

                        case 1000:
                            that.panel.close();
                            Login && Login.showLoginPopup && Login.showLoginPopup();
                            break;

                        //充值失败 2001
                        case 2001:
                            console.log('充值金额未到账');
                            //改变panel的html内容
                            that.panel.setContent(rewardTipPopup);
                            //重新设置panel宽度
                            that.panel.setWidth(520);
                            //显示充值失败的提示
                            $('#payError').show();
                            break;

                        //以上code都不符合的时候，再次判断是否存在消费异常
                        default:
                            //快捷支付弹窗在点击重试或完成绑定时不再出现，因此method属性有可能获取不到，但thirdpartymethod为全局变量，因此它还保留着原来method的值
                            that.checkBadPaymentNoCode(response, requiredData, 4, that.thirdPartyMethod || $('.j_payByQuick').attr('method'), '打赏');
                            break;
                    }
                }
            });
        },
        /**
         * 查询打赏状态 —— 轮询
         * @method CheckStatus
         */
        CheckStatus: function (that, requiredData) {
            //获取EJS所需JSON
            var pageJson = g_data.pageJson;

            //充值和打赏的提示弹窗
            var rewardTipPopup = new EJS({
                url: '/ejs/qd/js/component/template/rewardTipPopup.b72df.ejs'
            }).render(pageJson);

            //设置轮询请求code == 0 的标识
            that.hasSucced = false;
            //初始化时间
            var time = 0;
            var timer = setInterval(function () {
                //之后需更改为30[分钟]
                if (time > 15 * 30) {
                    clearInterval(timer);
                    console.log('网络异常');

                    //改变panel的html内容
                    that.panel.setContent(rewardTipPopup);
                    //重新设置panel宽度
                    that.panel.setWidth(520);
                    //显示网络异常提示
                    $('#netError').show();
                    //当点击重新尝试时，继续轮询【click事件写在这里是为了更方便将数据传进CheckStatus方法中】
                    $('.j_retry_polling').on('click', function () {
                        that.CheckStatus(that, requiredData);
                    });
                    return;
                }
                $.ajax({
                    method: 'POST',
                    url: '/ajax/reward/CheckStatus',
                    data: requiredData,
                    success: function (response) {
                        //hasSucced为true时，说明已经打赏成功，此时无需响应后端延迟返回的数据，因此跳出成功回调函数
                        if (that.hasSucced) {
                            return
                        }
                        switch (response.code) {
                            //充值、打赏成功 0
                            case 0:
                                //打赏成功时，hasSucced为true
                                that.hasSucced = true;

                                //显示投票互动弹窗【此时各tab页内容都已初始化，必须重新获取数据才能正常显示】
                                var VoteData = {balance: 0};
                                that.VotePopup.loadVotePanel(that, VoteData, 3, {
                                    monthVisibility: 'hidden',
                                    recVisibility: 'hidden'
                                });
                                that.VotePopup.renderRewardPopup(that, VoteData, pageJson);

                                var rewardNoLimit = $('#rewardPopup').find('.no-limit-wrap');

                                rewardNoLimit.hide();

                                var voteComplete = rewardNoLimit.siblings('.vote-complete');
                                voteComplete.show();
                                //显示打赏多少起点币
                                voteComplete.find('.post-num').text(that.VotePopup.amount);
                                //显示获得多少粉丝值
                                voteComplete.find('.fans-value').text(response.data.info);

                                //若monthTicketCnt > 0 显示赠投信息
                                if (response.data.monthTicketCnt > 0) {
                                    voteComplete.find('.gift').html('赠投出 ' + response.data.monthTicketCnt + ' 张月票，');
                                }

                                //关闭后调用显示+数字动画
                                voteComplete.on('click', '.closeBtn', function () {
                                    that.VotePopup.addNumAnimate($('.rewardNum'), that.VotePopup.amount, that.VotePopup.expNum);
                                    that.panel.remove();
                                });

                                //往粉丝动态里添加自己操作记录
                                $('#scrollDiv ul').append('<li><em class="money"></em><a href="//me.qiyan.com/Index.aspx" target="_blank" title=' + userName + '>' + userName + '</a><span>打赏了</span>' + amount + '起点币</li>');

                                //清除计时器
                                clearInterval(timer);

                                //将支付宝等第三方支付过程中隐藏的关闭按钮显示出来，因为此时用户可以关闭弹窗
                                $('.lbf-panel .lbf-icon-close').show();
                                break;

                            //充值成功但打赏失败 1052
                            case 1052:
                                //改变panel的html内容
                                that.panel.setContent(rewardTipPopup);
                                //显示充值成功但打赏失败提示
                                $('#rewardError').show();
                                //将支付宝等第三方支付过程中隐藏的关闭按钮显示出来，因为此时用户可以关闭弹窗
                                $('.lbf-panel .lbf-icon-close').show();
                                that.panel.setToCenter();
                                //重新设置panel宽度
                                that.panel.setWidth(520);

                                clearInterval(timer);
                                break;

                            //充值中，loading 1053
                            case 1053:
                                //改变panel的html内容
                                that.panel.setContent(rewardTipPopup);
                                //重新设置panel宽度
                                that.panel.setWidth(520);
                                //显示loading
                                $('#loading').show();
                                that.panel.setToCenter();
                                $('.lbf-icon-close').on('click', function () {
                                    clearInterval(timer);
                                });
                                //将支付宝等第三方支付过程中隐藏的关闭按钮显示出来，因为此时用户可以关闭弹窗
                                $('.lbf-panel .lbf-icon-close').show();
                                break;

                            //余额不足 1054
                            case 1054:
                                //改变panel的html内容
                                that.panel.setContent(rewardTipPopup);
                                //重新设置panel宽度
                                that.panel.setWidth(520);
                                //显示余额不足
                                $('#noBalance').show();
                                that.panel.setToCenter();
                                //将支付宝等第三方支付过程中隐藏的关闭按钮显示出来，因为此时用户可以关闭弹窗
                                $('.lbf-panel .lbf-icon-close').show();
                                clearInterval(timer);
                                break;

                            case 2009:
                                break;

                            case 1000:
                                that.panel.close();
                                Login && Login.showLoginPopup && Login.showLoginPopup();
                                clearInterval(timer);
                                break;

                            //code都匹配不到时触发风控规则，需要输入验证码
                            default:
                                that.checkBadPaymentNoCode(response, requiredData, 4, '打赏');
                                //将支付宝等第三方支付过程中隐藏的关闭按钮显示出来，因为此时用户可以关闭弹窗
                                $('.lbf-panel .lbf-icon-close').show();
                                clearInterval(timer);
                                break;
                        }
                        //重置投票互动弹窗各个tab的标识
                        that.VotePopup.resetSigns();
                    }
                });
                time++;
            }, 2000);
            that.payAndSubTimer = timer;
        },
        /**
         * 返回选择支付方式
         * @method backToQuickPay
         */
        backToQuickPay: function () {

            if (g_data.isScribe == 0) {
                // 打赏
                this.payment.showQuickPayAlert('支付并打赏', balance, amount, '打赏');
            } else if (g_data.isScribe == 1) {
                //订阅
                this.payment.showQuickPayAlert('支付并订阅');
            }
            //再次传入参数显示 选择支付方式的弹窗
            clearInterval(this.payment.payAndSubTimer);

        },
        /*
         **点击打赏中出现的完成绑定，则继续显示打赏弹窗【让用户继续尝试打赏】
         * @method continueProcess
         */
        continueProcess: function (e) {
            if (g_data.isScribe == 0) {
                // 打赏
                this.VotePopup.continueProcess();
            } else if (g_data.isScribe == 1) {
                //订阅
                this.payment.continueProcess(e);
            } else if (g_data.isScribe == 2) {
                //红包
                $('#j_editRedPacket').fadeIn(200);
                $('.red-overlay').fadeIn(200);
                this.payment.panel.close();
            }
        },
        /*
         **刷新去获取
         * @method retryReward
         */
        retryReward: function (e) {
            if (g_data.isScribe == 0) {
                // 打赏
                this.VotePopup.retryReward();
            } else if (g_data.isScribe == 1) {
                //订阅
                this.payment.continueProcess(e);
            } else if (g_data.isScribe == 2) {
                //红包
                $('#j_editRedPacket').fadeIn(200);
                $('.red-overlay').fadeIn(200);
                this.payment.panel.close();
            }
        },
        /**
         * 关闭当前panel弹窗
         * @method closeCurrentPanel
         */
        closeCurrentPanel: function () {
            if (g_data.isScribe == 0) {
                // 打赏
                this.VotePopup.closeCurrentPanel();
            } else if (g_data.isScribe == 1) {
                //订阅
                this.payment.closeAlert();
            }

        },
        /*
         * 防止xss,字符串转换
         * @method safeStr
         * @param str 需要转换的字符串
         * @ return (string) 转换后的字符串
         * */
        safeStr: function (str) {
            return str.replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },
        /*
         * 增加书籍点击
         * @method addBookClick
         * */
        addBookClick: function () {
            var that = this,
                readedBookStartTime = new Date();
            var isAddedClick = true;
            var readedBook = Cookie.get("bc");
            if (readedBook) {
                var tmp = readedBook.split(",");
                for (var i = 0; i < tmp.length; i++) {
                    if (tmp[i] == that.bookId) {
                        isAddedClick = false;
                    }
                }
            }
            //cookie中无改书籍bookid时,发送请求
            if (isAddedClick) {
                var __url = "http://www.qiyan.com/Javascript/abc.htm?bookid=" + that.bookId + "&a=" + (new Date().getTime() - readedBookStartTime.getTime()) + "&b=" + g_data.chapter.id + "&c=0" + "&d=0" + "&e=" + escape(location.href) + "&f=" + escape(document.referrer);
                $("body").append("<iframe width=0 height=0 id='bookreadadd' style='display:none;'></iframe>");
                $("#bookreadadd").attr("src", __url);

                // 增加上报接口
                $.ajax({
                    type: 'GET',
                    url: '/ajax/chapter/AddBookClick',
                    dataType: 'json',
                    data: {
                        bookId: that.bookId,
                        chapterId: g_data.chapter.id,
                        bookType: g_data.isWebSiteType
                    },
                    success: function (response) {
                    }
                });
            }

        },
        /*
         * 显示口令红包
         * @method pwdRedPacketPop
         * */
        pwdRedPacketPop: function (e) {
            var that = this;
            var target = $(e.currentTarget);
            //获取口令红包的章节id
            var chapterId = target.data('chapterid');
            //发送ajax拉取口令红包信息
            $.ajax({
                type: 'GET',
                url: '/ajax/luckyMoney/getPwdHongBaoByChapter',
                dataType: 'json',
                data: {
                    bookId: that.bookId,
                    chapterId: chapterId
                },
                success: function (response) {
                    //当请求成功,并且返回红包list存在,且不为0时,有口令红包,显示入口
                    if (response.code == 0) {
                        //初始化ejs
                        var pwdRedPop = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/pwdRedPacket.7d825.ejs', response.data);
                        $('body').append(pwdRedPop);

                        var redPacketPop = $('#j_pwdRedPacketPop');
                        var redPacketPopHeight = redPacketPop.outerHeight();
                        //计算 marign-top 值
                        redPacketPop.css('margin-top', -redPacketPopHeight / 2 + 'px');
                    }
                }
            });

        },

        renderPageOps: function () {
            var pageOps = g_data.pageOps;
            //获取后加载的模板，将json数据传入
            var $pageOps = new EJS({
                url: '/ejs/qd/js/read.qiyan.com/pageOps.43e01.ejs'
            }).render(pageOps);
            //把广告添加到顶部
            $('.text-wrap').last().after($pageOps);
            // $('#j_chapterBox').after($pageOps);

        },
        /*
         * 移除口令红包pop
         * @method removeRedPacketPop
         * */
        removeRedPacketPop: function (e) {
            var target = $(e.currentTarget);
            //移除红包pop && 遮罩
            target.parents('.red-packet-pop').remove();
            $('.pwd-overlay').remove();
        },
        /*
         **点击成功提示弹窗的关闭按钮
         * @method closePanel
         * @param e 事件元素
         */
        closeAndRefresh:function(){
            this.payment.closeAndRefresh();
        },
    })
});
/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-4-2 下午9:19
 */
LBF.define('util.report', function(){
    var logs = {};

    /**
     * Report to a url
     * @class report
     * @namespace util
     * @module util
     * @constructor
     * @param {String} url Report destination. All data should be serialized and add tu search part of url
     * @chainable
     */
    return function(url){
        //send data
        var now = +new Date(),
            name = 'log_' + now,
            img = logs[name] = new Image();

        img.onload = img.onerror = function(){
            logs[name] = null;
        };

        url += (url.indexOf('?') > -1 ? '&' : '?') + now;

        img.src = url;

        return arguments.callee;
    };
});/**
 * Created by amos on 14-8-18.
 */
LBF.define('lang.Class', function(require, exports, module){
    var toArray = require('lang.toArray'),
        extend = require('lang.extend');

    /**
     * Base Class
     * @class Class
     * @namespace lang
     * @module lang
     * @constructor
     * @example
     *      // SubClass extends Class
     *      var SubClass = Class.extend({
     *          // overwritten constructor
     *          initialize: function(){
     *
     *          },
     *
     *          someMethod: function(){
     *          }
     *      });
     *
     *      // add static methods and attributes
     *      SubClass.include({
     *          staticMethod: function(){
     *          },
     *
     *          staticAttr: 'attrValue'
     *      });
     *
     *      // Extension is always available for sub class
     *      var SubSubClass = SubClass.extend({
     *          // methods to be extended
     *      });
     */
    module.exports = inherit.call(Function, {
        initialize: function(){},

        /**
         * Mix in methods and attributes. Instead of inherit from base class, mix provides a lighter way to extend object.
         * @method mixin
         * @since 0.5.2
         * @param {Object} [mixin]* The object to be mixed in
         * @chainable
         * @example
         *      var someInstance = new Class;
         *
         *      someInstance.mix({
         *          sayHello: function(){
         *              alert('hello');
         *          }
         *      });
         */
        mixin: include
    });

    function inherit(ext){
        // prepare extends
        var args = toArray(arguments);

        // constructor
        var Class = function(){
            // real constructor
            this.initialize.apply(this, arguments);
        };

        // copy Base.prototype
        var Base = function(){};
        Base.prototype = this.prototype;
        var proto = new Base();

        // correct constructor pointer
        /**
         * Instance's constructor, which initialized the instance
         * @property constructor
         * @for lang.Class
         * @type {lang.Class}
         */
        proto.constructor = Class;

        /**
         * Superclass of the instance
         * @property superclass
         * @type {lang.Class}
         */
        proto.superclass = this;

        // extends prototype
        args.unshift(proto);
        extend.apply(args, args);
        Class.prototype = proto;

        // add static methods
        extend(Class, {
            /**
             * Extend a sub Class
             * @method inherit
             * @static
             * @for lang.Class
             * @param {Object} [ext]* Prototype extension. Multiple exts are allow here.
             * @chainable
             * @example
             *     var SubClass = Class.extend(ext1);
             *
             * @example
             *      // multiple extensions are acceptable
             *      var SubClass = Class.extend(ext1, ext2, ...);
             */
            inherit: inherit,

            /**
             * Extend static attributes
             * @method include
             * @static
             * @for lang.Class
             * @param {Object} [included]* Static attributes to be extended
             * @chainable
             * @example
             *     Class.include(include1);
             *
             * @example
             *     // multiple includes are acceptable
             *     Class.include(include1, include2, ...);
             */
            include: include,

            /**
             * Inherit base class and add/overwritten some new methods or properties.
             * This is a deprecated method for it's easily misunderstood. It's just for backward compatible use and will be removed in the near future.
             * We recommend inherit for a replacement
             * @method extend
             * @static
             * @for lang.Class
             * @deprecated
             * @see inherit
             */
            extend: inherit,

            /**
             * Superclass the Class inherited from
             * @property superclass
             * @type {lang.Class}
             * @for lang.Class
             */
            superclass: this
        });

        return Class;
    };

    function include(included){
        var args = toArray(arguments);
        args.unshift(this);
        extend.apply(this, args);
        return this;
    }
});/**
 * Created by amos on 14-8-18.
 */
LBF.define('util.serialize', function(require, exports, module){
    /**
     * Serialize object with delimiter
     * @class serialize
     * @namespace util
     * @constructor
     * @param {Object} obj
     * @param {String} [delimiterInside='=']
     * @param {String} [delimiterBetween='&']
     * @return {String}
     */
    module.exports = function(obj, delimiterInside, delimiterBetween){
        var stack = [];
        delimiterInside = delimiterInside || '=';
        delimiterBetween = delimiterBetween || '&';

        for(var key in obj){
            if(obj.hasOwnProperty){
                stack.push(key + delimiterInside + (obj[key] || ''));
            }
        }

        return stack.join(delimiterBetween);
    };
});/**
 * Created by amos on 14-8-18.
 */
LBF.define('util.Attribute', function(require, exports, module){
    var extend = require('lang.extend');

    var ATTR = '_ATTRIBUTES',
        VALIDATES = '_VALIDATES';

    /**
     * [mixable] Common attributes handler. Can be extended to any object that wants event handler.
     * @class Attribute
     * @namespace util
     * @example
     *      // mix in instance example
     *      // assume classInstance is instance of lang.Class or its sub class
     *
     *      // use class's mix method
     *      classInstance.mix(Event);
     *
     *      // watch events
     *      classInstance.bind('someEvent', function(){
     *          // do sth
     *      });
     *
     * @example
     *      // extend a sub class example
     *
     *      // use class's extend method
     *      var SubClass = Class.extend(Event, {
     *          // some other methods
     *          method1: function(){
     *          },
     *
     *          method2: function(){
     *          }
     *      });
     *
     *      // initialize an instance
     *      classInstance = new SubClass;
     *
     *      // watch events
     *      classInstance.bind('someEvent', function(){
     *          // do sth
     *      });
     */


    /**
     * Set an attribute
     * @method set
     * @param {String} attr Attribute name
     * @param {*} value
     * @param {Object} options Other options for setter
     * @param {Boolean} [options.silence=false] Silently set attribute without fire change event
     * @chainable
     */
    exports.set = function(attr, val, options){
        var attrs = this[ATTR];

        if(!attrs){
            attrs = this[ATTR] = {};
        }

        if(typeof attr !== 'object'){
            var oAttr = attrs[attr];
            attrs[attr] = val;

            // validate
            if(!this.validate(attrs)){
                // restore value
                attrs[attr] = oAttr;
            } else {
                // trigger event only when value is changed and is not a silent setting
                if(val !== oAttr && (!options || !options.silence) && this.trigger){
                    /**
                     * Fire when an attribute changed
                     * Fire once for each change and trigger method is needed
                     * @event change:attr
                     * @param {Event} JQuery event
                     * @param {Object} Current attributes
                     */
                    this.trigger('change:' + attr, [attrs[attr], oAttr]);

                    /**
                     * Fire when attribute changed
                     * Fire once for each change and trigger method is needed
                     * @event change
                     * @param {Event} JQuery event
                     * @param {Object} Current attributes
                     */
                    this.trigger('change', [attrs]);
                }
            }

            return this;
        }

        // set multiple attributes by passing in an object
        // the 2nd arg is options in this case
        options = val;

        // plain merge
        // so settings will only be merged plainly
        var obj = extend({}, attrs, attr);

        if(this.validate(obj)){
            this[ATTR] = obj;
            // change event
            if((!options || !options.silence) && this.trigger){
                var changedCount = 0;
                for(var i in attr){
                    // has property and property changed
                    if(attr.hasOwnProperty(i) && obj[i] !== attrs[i]){
                        changedCount++;
                        this.trigger('change:' + i, [obj[i], attrs[i]]);
                    }
                }

                // only any attribute is changed can trigger change event
                changedCount > 0 && this.trigger('change', [obj]);
            }
        }

        return this;
    };

    /**
     * Get attribute
     * @method get
     * @param {String} attr Attribute name
     * @return {*}
     */
    exports.get = function(attr){
        return !this[ATTR] ? null : this[ATTR][attr];
    };

    /**
     * Get all attributes.
     * Be sure it's ready-only cause it's not a copy!
     * @method attributes
     * @returns {Object} All attributes
     */
    exports.attributes = function(){
        return this[ATTR] || {};
    };

    /**
     * Add validate for attributes
     * @method addValidate
     * @param {Function} validate Validate function, return false when failed validation
     * @chainable
     * @example
     *      instance.addValidate(function(event, attrs){
     *          if(attrs.someAttr !== 1){
     *              return false; // return false when failed validation
     *          }
     *      });
     */
    exports.addValidate = function(validate){
        var validates = this[VALIDATES];

        if(!validates){
            validates = this[VALIDATES] = [];
        }

        // validates for all attributes
        validates.push(validate);

        return this;
    };

    /**
     * Remove a validate function
     * @method removeValidate
     * @param {Function} validate Validate function
     * @chainable
     * @example
     *      instance.removeValidate(someExistValidate);
     */
    exports.removeValidate = function(validate){
        // remove all validates
        if(!validate){
            this[VALIDATES] = null;
            return this;
        }

        var valArr = this[VALIDATES];

        for(var i= 0, len= valArr.length; i< len; i++){
            if(valArr[i] === validate){
                valArr.splice(i, 1);
                --i;
                --len;
            }
        }

        return this;
    };

    /**
     * Validate all attributes
     * @method validate
     * @return {Boolean} Validation result, return false when failed validation
     */
    exports.validate = function(attrs){
        var valArr = this[VALIDATES];
        if(!valArr){
            return true;
        }

        attrs = attrs || this[ATTR];
        for(var i= 0, len= valArr.length; i< len; i++){
            if(valArr[i].call(this, attrs) === false){
                return false;
            }
        }

        return true;
    };
});/**
 * Created by amos on 14-8-18.
 */
LBF.define('lang.toArray', function(require, exports, module){
    /**
     * Make array like object to array
     * Usually for arguments, jQuery instance
     * @class toArray
     * @namespace lang
     * @constructor
     * @param {Object} arrayLike Array like object
     * @returns {Array}
     * @example
     *      var someFn = function(){
     *          var args = toArray(arguments);
     *      };
     */
    module.exports = function(arrayLike){
        return [].slice.call(arrayLike);
    };
});/**
 * Created by amos on 14-8-7.
 */
LBF.define('lang.extend', function(require, exports, module){
    var isPlainObject = require('lang.isPlainObject');

    /**
     * Extend(copy) attributes from an object to another
     * @class extend
     * @namespace lang
     * @constructor
     * @param {Boolean} [isRecursive=false] Recursively extend the object
     * @param {Object} base Base object to be extended into
     * @param {Object} ext* Object to extend base object
     * @example
     *      // plain extend
     *      // returns {a: 1, b:1}
     *      extend({a: 1}, {b: 1});
     *
     *      // recursive extend
     *      var b = { x: 1};
     *      var ret = extend(true, {}, { b: b});
     *      b.x = 2;
     *      b.x !== ret.b.x;
     */
    module.exports = function(isRecursive, base, ext){
        var args = [].slice.apply(arguments),
            o = args.shift(),
            extFn = plain;

        if(typeof o === 'boolean'){
            o = args.shift();
            o && (extFn = recursive);
        }

        for(var i= 0, len= args.length; i< len; i++){
            args[i] && extFn(o, args[i]);
        }

        return o;

        function plain(o, ext){
            for(var attr in ext){
                if(ext.hasOwnProperty(attr)){
                    o[attr] = ext[attr];
                }
            }
        }

        function recursive(o, ext){
            for(var attr in ext){
                if(ext.hasOwnProperty(attr)){
                    if(isPlainObject(ext[attr])){
                        o[attr] = o[attr] || {};
                        recursive(o[attr], ext[attr]);
                    } else{
                        o[attr] = ext[attr];
                    }
                }
            }
        }
    };
});LBF.define('lang.isPlainObject', function(require, exports, module){
    var isObject = require('lang.isObject'),
        isWindow = function(obj){
            return obj && obj === obj.window;
        };
        
    /**
     * Whether the obj is a plain object, not array or regexp etc.
     * @method isPlainObject
     * @static
     * @param {*} obj
     * @return {Boolean}
     */
    module.exports = function( obj ) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !obj || !isObject(obj) || obj.nodeType || isWindow( obj ) ) {
            return false;
        }

        var hasOwn = Object.prototype.hasOwnProperty;

        try {
            // Not own constructor property must be Object
            if ( obj.constructor &&
                !hasOwn.call(obj, 'constructor') &&
                !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf') ) {
                return false;
            }
        } catch ( e ) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for ( key in obj ) {}

        return key === undefined || hasOwn.call( obj, key );
    };
});