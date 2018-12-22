/**

 * @fileOverview

 * @author  yangye

 * Created: 2016-7-5

 */

LBF.define('qd/js/book_details/index.55dc5.js', function (require, exports, module) {

    var

        Node = require('ui.Nodes.Node'),

        ajaxSetting = require('qd/js/component/ajaxSetting.84b88.js'),

        Common = require('qd/js/component/common.08bc6.js'),

        report = require('qidian.report'),

        Pagination = require('ui.Nodes.Pagination'),

        PinNav = require('qd/js/component/pinNav.34253.js'),

        Cookie = require('util.Cookie'),

        Switchable = require('ui.widget.Switchable.Switchable'),

        EJS = require('util.EJS'),

        Panel = require('ui.widget.Panel.Panel'),

        Textarea = require('ui.Nodes.Textarea'),

        TextCounter = require('ui.Plugins.TextCounter'),

        Addbook = require('qd/js/free/addBook.83d23.js'),

        Checkbox = require('ui.Nodes.Checkbox'),

        Login = require('qd/js/component/login.a4de6.js'),

        LightTip = require('ui.widget.LightTip.LightTip'),

        VotePopup = require('qd/js/component/votePopup.c61b1.js'),

        Catalog = require('qd/js/book_details/catalog.1bf23.js'),

        ejsChinese = require('qd/js/read.qidian.com/ejsChinese.a35d9.js'),

        Loading = require('qd/js/component/loading.aa676.js');





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

            //显示推荐票提示

            'mouseenter #recTip': 'showRecTip',



            //隐藏推荐票提示

            'mouseleave #recTip': 'hideRecTip',



            //热门、最新切换 分别发请求，接口/ajax/comment/info

            'click #sortBox a': 'getSortCommentList',



            //作品信息、目录切换

            'click .nav-wrap ul li': 'switchTab',



            //投票按钮

            'click #monthBtn, #recBtn, #topVoteBtn, #topRewardBtn': 'showVotePopup',



            //打赏按钮 —— 需要判断作品是否是非签约，非签约作品不能弹出打赏弹窗

            'click #rewardBtn': 'isShowRewardPopup',



            //跳转到订阅本书

            'click #subscribe': 'jumpSubscribe',



            //提示去APP

            'click #subscribe-total': 'subscribeTotal',



            //下载弹窗

            'click #download': 'downloadPopup',



            //加入书架

            'click .add-book': 'addToBookShelf',



            //我要评价 - 判断是否已登录，已登录就调用evaluatePopup

            'click #goComment, #scoreBtn': 'commentIsLogin',



            //去充值

            'click .j_charge': 'goCharge',



            //弹快捷支付弹窗

            'click .j_quickPay': 'showQuickPay',



            //支付并打赏

            'click .j_payByQuick': 'selectPayMethod',



            //回到选择支付方式

            'click .j_switchMethod': 'backToQuickPay',



            //点赞

            'click .zan': 'addPraise',





            //展开评论

            'click .j_unfold': 'unfoldComment',



            //展开作者介绍

            'click .j_infoUnfold': 'unfoldAuthorInfo',



            //发送评分评价

            'click #sendComment': 'sendComment',



            //评价textarea 文字清空

            'click #evaMsgText': 'clearEvaText',



            //作品信息和目录的上报p事件

            //'click #j-bookInfoPage, #j_catalogPage': 'reportPageId',



            //切换作品讨论区、书友评价

            'click .user-commentWrap .comment-head span': 'switchDiscussComment',



            //点击打赏tab触发的‘完成绑定’按钮【有关风控】

            'click .j_complete_bind': 'continueProcess',



            //绑定继续打赏事件

            'click .j_continue': 'continueProcess',



            //重新打赏

            'click .j_retry_payment': 'retryReward',



            //关闭当前panel弹窗

            'click .closeBtn, .close': 'closeCurrentPanel',



            //关闭顶部广告

            'click .top-bg-op-box .close-game-op': 'closeTopOp',



            'click .top-bg-box .back-to-op': 'showTopOp',



            // 更多置顶帖

            'click .more-post a': 'showMorePost',

            // 赞

            'click .like-btn': 'clickLikeBtn'

        },



        /**

         * Nodes default UI element，this.$element

         * @property elements

         * @type Object

         * @protected

         */

        elements: {

            //月票数字

            monthNum: '#monthNum',



            //推荐票数字

            recNum: '#recNum',



            //月票

            mTicket: '#mTicket',



            //推荐票

            recTicket: '#recTicket',



            //打赏列表

            rewardList: '#rewardList',



            //支付方式

            payMode: '#payMode'

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



            //页面load时发送通用请求

            var env = g_data.envType == 'pro' ? '' : g_data.envType;

            var common = new Common();



            //pinNav.js

            var pinNav = new PinNav({});



            // 图片延迟加载

            this.lazyLoad();



            // 新书预发

            if (g_data.isPre) {

                this.initPreBook();



            // 普通书籍详情

            } else {



                //标识getBookScore接口请求为false，请求过一次后变为true

                this.getBookScoreHasLoaded = false;



                //标识是否点击过点赞，防止频繁点击操作

                this.zanComplete = 0;



                //定义全局变量 传递用户评分

                var userScore = '';



                //获取当前页面书的bookId，发请求都需要用到

                var bookId = $('#bookImg').attr('data-bid');



                //变更作用域，给其他方法内使用此变量

                that.bookId = bookId;



                //通过cookie值判断是否需要返回旧版

                //this.backToOld();



                //实例化loading.js

                this.loading = new Loading({});



                //引入目录页js

                var catalog = new Catalog({});



                //window.getReadStatus = function () {

                //    that.getReadStatus(that);

                //};



                //切换月票、推荐票

                this.switchTicket();



                // 判断用户是否登录，获取分析信息

                this.getUserFansInfo();



                //全局化函数，给login回调用

                window.getUserFansInfo = function () {

                    //将作用域传递给回调的login.js,否则that.bookId会是undefined

                    that.getUserFansInfo(that);

                };



                //其他作品轮播切换

                this.workSlides();



                //显示荣誉信息列表

                this.showHonorList();



                //投票弹窗

                this.VotePopup = new VotePopup({});

                this.payment = this.VotePopup.payment;



                //在作品介绍页加载完后 再加载其他

                setTimeout(function () {

                    //加载目录

                    if(g_data.hasDirectData){

                        that.getReadStatus();

                    }else{

                        catalog.getCatalogInfo(function(){

                            that.getReadStatus();

                        });

                    }



                    //已登录情况下 后加载我的评价

                    if (Login.isLogin()) {

                        that.myCommentData();

                    }



                    //获取本书评分评价信息，后加载书友评价信息（首次拉取）

                    that.getBookScore();

                    window.getBookScore = function () {

                        //将作用域传递给回调的login.js,否则that.bookId会是undefined

                        that.getBookScore(that);

                    };

                    that.showFlashOp();



                    //后加载作品讨论区

                    that.discussList();



                    //后加载粉丝排行榜

                    that.fansRankList();



                    //后加载粉丝名人榜

                    that.topFansList();



                    //本书粉丝动态滚动列表

                    that.fansRollList();



                    //获取阅读进度和书架

                    //that.getReadStatus(that);



                    //全部加载完毕后 获取用户名，投月票 推荐票 打赏后使用

                    //userName = $('#nav-user-name').html();



                    //登录相关设置

                    that.settingOnLogin(catalog);



                }, 0);

            }

        },



        /**

         * 登录相关设置

         */

        settingOnLogin: function(catalog){

            var that = this;

            window.myCommentData = function () {

                //将作用域传递给回调的login.js,否则that.bookId会是undefined

                that.myCommentData(that);

            };



            //全局化getCatalogInfo方法，给login登录后回调使用

            window.getCatalogInfo = function () {

                //重新拉取目录，因此这项需要设置为false

                catalog.catalogHasLoaded = false;

                catalog.getCatalogInfo(function(){

                    that.getReadStatus();

                });

            };



            //设置登录成功回调

            Login.setSuccess(that, function(){

                Login.loginOnSuccess();

                var noLoginBox = $('#noLogin');

                var inLoginBox = $('#loginIn');

                //登录成功后，未登录状态隐藏

                noLoginBox.hide();

                //显示已登录状态

                inLoginBox.show();



                // 登录之后拉取我的评价数据

                window.myCommentData();

                // 登录之后拉取右上角我的评分信息 和 书友评价列表

                window.getBookScore();

                // 登录之后拉取目录中的阅读进度

                window.getCatalogInfo();

                // 登录之后拉取粉丝排行榜信息

                window.getUserFansInfo();



                //加入书架按钮如果正在loading则清除loading

                var target = $('#addBookBtn');

                if(target.hasClass('btn-loading')){

                    target.children('cite').remove();

                    target.removeClass('btn-loading');

                }

            })

        },



        /**

         * 新书预发js

         */

        initPreBook: function () {

            // 倒计时

            var timer = setInterval(function () {

                if (g_data.preTimeLeft > 0) {

                    g_data.preTimeLeft -= 1;

                    var day = Math.floor((g_data.preTimeLeft / 3600) / 24);

                    var hour = Math.floor((g_data.preTimeLeft / 3600) % 24);

                    var minute = Math.floor((g_data.preTimeLeft / 60) % 60);

                    var second = Math.floor(g_data.preTimeLeft % 60);

                    $('.book-pre .day').text(day < 10 ? "0" + day : day);

                    $('.book-pre .hour').text(hour < 10 ? "0" + hour : hour);

                    $('.book-pre .minute').text(minute < 10 ? "0" + minute : minute);

                    $('.book-pre .second').text(second < 10 ? "0" + second : second);

                } else {

                    clearInterval(timer);

                }

            }, 1000);

        },



        /**

         * 通过cookie值判断是否跳转旧版

         * @method backToOld

         */

        backToOld: function () {

            var env = g_data.envType == 'pro' ? '' : g_data.envType;

            //nb为2则不跳转，否则跳旧版，为null也跳旧版

            if (Cookie.get('nb') == 2) {

                return;

            } else {

                location.href = '//' + env + 'www.qiyan.com/Book/' + this.bookId + '.aspx';

            }

        },



        /*

         * 图片延迟加载

         * @method lazyLoad

         */

        lazyLoad: function () {

            /**

             * 如果想提载入图片，可以使用 threshold 进行设置，

             * $("img.lazy").lazyload({ threshold :100});

             */

            require.async('qd/js/component/jquery.lazyload.2e65d.js', function () {

                $("img.lazy").lazyload({

                    placeholder: 'data:image/gif;base64,R0lGODlhCgAKAIAAAP///wAAACH5BAEAAAAALAAAAAAKAAoAAAIIhI+py+0PYysAOw==',

                    threshold: 200

                });

            });

        },

        /**

         * 去充值后关闭弹窗

         * @method goCharge

         */

        goCharge: function (e) {

            var that = this;

            var link = g_data.envType == 'pro' ? '//www.qiyan.com/charge/meRedirect': '//' + g_data.envType + 'www.qiyan.com/charge/meRedirect';

            $(e.currentTarget).attr('href', link);

            //关闭原来的打赏弹窗

            $('.lbf-panel .lbf-panel-close').trigger('click');

        },

        /**

         * 转到快捷支付弹窗

         * @method showQuickPay

         */

        showQuickPay: function () {

            var that = this;

            /*

             *

             * 参数1：panel【将当前页面的全局弹窗传递到payment.js中，当前弹窗在VotePopup.js中】

             */

            that.payment.getPanel(that.VotePopup.panel);



            /**

             * 参数1：按钮文案

             * 参数2：当前余额

             * 参数3：需要总价

             *

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

            this.payment.payByTargetMethod(payMethod, this.VotePopup.requiredData, this.quickPay, this.CheckStatus, that);

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

                        //重置投票互动弹窗各个tab的标识

                        that.VotePopup.resetSigns();

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

                                    that.addNumAnimate($('.rewardNum'), that.VotePopup.amount, that.VotePopup.expNum);

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

            //再次传入参数显示 选择支付方式的弹窗

            this.payment.showQuickPayAlert('支付并打赏', balance, amount, '打赏');

            clearInterval(this.payment.payAndSubTimer);

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

                            var userLogin = $('#loginIn');

                            //获取粉丝接口里的数据

                            var userFansInfo = data.data;

                            var userId = userFansInfo.userId;

                            var levelInfo = userFansInfo.userLevel;

                            var userAvatar = userFansInfo.avatar;

                            var userRank = userFansInfo.rank;

                            var levelLnterval = userFansInfo.levelLnterval;

                            var isFans = userFansInfo.isFans;

                            //填入用户头像

                            userLogin.find('img').attr('src', userAvatar);

                            //填入用户等级标签

                            userLogin.find('.user-level').addClass('lv' + levelInfo).text(levelInfo);

                            //填入用户等级排名

                            userLogin.find('.red').html(userRank);

                            //填入相差多少升级

                            userLogin.find('#Lnterval').html(levelLnterval);



                            var userLevel = $('#userLevel').text();



                            //isFans　0：不是本书粉丝　１：是本书粉丝

                            if (isFans == 1) {

                                //是本书粉丝，显示有等级的粉丝信息

                                $('#haveLv').removeClass('hidden');

                            } else {

                                //不是本书粉丝，显示暂无等级的信息

                                $('#noLv').removeClass('hidden');

                            }

                        }

                    }

                });

            }

        },

        /**

         * 后加载我的评价

         * @method myCommentData

         */

        myCommentData: function () {

            var that = this;



            //拿到EJS所需json数据

            var pageJson = g_data.pageJson;



            $.ajax({

                type: "GET",

                //月票接口

                url: "/ajax/comment/personal",

                data: {

                    bookId: that.bookId

                },

                success: function (response) {

                    if (response.code === 0) {

                        //移除loading

                        $('#myCommentWrap').children().remove();

                        if (response.data.length != 0) {

                            //数据传给EJS模板

                            var myCommentTemp = new EJS({

                                url: '/ejs/qd/js/book_details/myComment.a9d68.ejs'

                            }).render(response, pageJson);



                            //添加模板到我的评价区

                            $('#myCommentWrap').append(myCommentTemp);

                        }

                    } else {

                        $('#myCommentWrap').children().remove().end().append('<div class="error-wrap"><p>我的评价加载失败</p></div>');

                    }

                }

            })

        },

        /**

         * 获取本书的页面评分信息 - 首次拉取书友评价列表

         * @method getBookScore

         * 这里的请求有右上角评分数据，也有书友评价的数据，合并在一个请求内了

         * 登录回调后会再请求一次，但是做了判断，请求一次后就不会在拉取书友评价，仅拉取我的评价分数

         */

        getBookScore: function () {

            var that = this;



            //拿到EJS所需json数据

            var pageJson = g_data.pageJson;



            $.ajax({

                type: "GET",

                url: "/ajax/comment/index",

                data: {

                    bookId: that.bookId,

                    pageSize: 15

                },

                success: function (response) {

                    $('#commentWrap').find('.load-score').remove().end().children().show();

                    var data = response.data;



                    //获取第一行dom元素

                    var $bookScore = $('#j_bookScore');



                    //获取第二行dom元素

                    var $userCount = $('#j_userCount');



                    //定义评分变量

                    var scoreBox;



                    //评分不为空时，先拉取评分

                    if (data.rate != '') {

                        //获取本书评分，并转换成字符串

                        var rate = data.rate.toString();



                        //获取评价人数

                        var userCount = data.userCount;



                        //分割填充得分，保留此方法，之后可能会用在小编评分中

                        function showScore() {

                            //分割成x.x，页面显示样式需要

                            scoreBox = rate.split('.');

                            //分别填入数组1和数组2的分数

                            $('#score1').html(scoreBox[0]);

                            $('#score2').html(scoreBox[1]);

                        }



                        //有评分，但评价人数小于10，且有小编评分，显示小编评分

                        if (userCount >= 10) {

                            showScore();

                            //填入有多少用户评论

                            $userCount.find('span').html(userCount);

                        } else {

                            //既没有评分也没有小编评分

                            $bookScore.html('<b>暂无评分</b>');

                            $userCount.html('少于10人评价');

                        }

                    }



                    //获取我的评分，传递给全局评分变量（多处使用）

                    that.userScore = data.iRateStar;

                    //右上角star显示我已评价过的star

                    $('#scoreBtn').attr('data-score', that.userScore);



                    if (response.code != 0) {

                        //请求失败时提示

                        $('#commentWrap').children().remove().end().append('<div class="error-score"><h3>评分获取失败</h3></div>');

                    }



                    //如果是第一次发请求，拉取书友评价

                    if (that.getBookScoreHasLoaded == false) {

                        //获取书友评价逻辑

                        var userComment = {};



                        userComment = response;



                        //全局化userComment

                        that.userComment = userComment;



                        var userCommentTemp = new EJS({

                            url: '/ejs/qd/js/book_details/userComment.ce60d.ejs'

                        }).render(userComment, pageJson);



                        $('#userCommentWrap .la-ball-pulse').remove();



                        //添加模板到用户评论区

                        $('#userCommentWrap').append(userCommentTemp);



                        //拉到数据填好模板后再初始化书友评价的分页。

                        that.PagiNation();





                        //评分初始化

                        require.async('qd/js/component/jquery.raty.min.f60d7.js', function () {

                            $('#scoreBtn').find('img').remove();

                            //设定星星的图片路径

                            $.fn.raty.defaults.path = g_data.staticPath;

                            //头部我要评价处

                            $('#scoreBtn').raty({

                                width: 116,

                                targetType: "number",

                                starHalf: "/images/book_details/star-half.27094.png",

                                starOff: "/images/book_details/star-off.b2a1b.png",

                                starOn: "/images/book_details/star-on.02731.png",

                                click: function (score) {

                                    that.userScore = score;

                                },

                                score: function () {

                                    return $(this).attr('data-score');

                                }

                            });

                        });

                        //请求拉取完毕后，设为true，下次请求不再执行拉取书友评价

                        that.getBookScoreHasLoaded = true;

                    }

                }

            });

        },

        /**

         * 拉取热门或者最新的书友评价列表

         * @method getSortCommentList

         * @param e 事件对象

         *        page 当前点击的分页

         */

        getSortCommentList: function (e, page) {

            var that = this;

            var target = $(e.currentTarget);

            target.addClass('act').siblings().removeClass('act');



            //清除原来的列表

            //$('#commentList, #userCommentWrap .comment-list').remove();



            //添加loading【为防止屏幕闪烁，去除loading】

            //$('#userCommentWrap').append('<div class="la-ball-pulse"><span></span><span></span><span></span></div>');



            //获取排序类型 0//0-时间倒序 1-时间正序 2-点赞数倒序

            var orderBy = $('#sortBox a.act').data('order');



            //拿到EJS所需json数据

            var pageJson = g_data.pageJson;



            //遇到请求返回错误或者空数据时的处理方式

            function showNullData() {

                //遇到code错误时去除所有dom元素，添加无数据状态的样式

                $('#userCommentWrap').find('.la-ball-pulse, .comment-list').remove();

                $('#userCommentWrap').append('<div class="comment-list"><div class="no-data"><span></span><p>还没有评价<i>&#183;</i>快来抢沙发</p></div></div>');

            };



            //发送请求拉取热门或者最新的书友评论列表

            $.ajax({

                type: "GET",

                url: "/ajax/comment/info",

                timeout: 5000, //超时时间设置，单位毫秒

                data: {

                    //当前点击的分页

                    pageIndex: page,

                    //固定每次只拉5条评论

                    pageSize: 15,

                    //排序方式 0是最新 2是热门

                    orderBy: orderBy,

                    bookId: that.bookId

                },

                success: function (response) {

                    if (response.code === 0) {



                        if (response.data != '') {

                            //重写userComment数据

                            that.userComment = response;



                            //新数据传入模板

                            var userCommentTemp = new EJS({

                                url: '/ejs/qd/js/book_details/userComment.ce60d.ejs'

                            }).render(that.userComment, pageJson);



                            //再次去除loading

                            //$('#userCommentWrap .la-ball-pulse').remove();



                            //清除原来的列表【为防止请求回应过慢造成的闪烁，在请求回应后再移除原内容并添加新内容】

                            $('#commentList, #userCommentWrap #commentList').remove();



                            //添加模板到用户评论区

                            $('#userCommentWrap').append(userCommentTemp);



                            //拉到数据填好模板后再初始化分页。

                            that.PagiNation();

                        } else {

                            showNullData()

                        }

                    } else {

                        showNullData()

                    }

                },

                error: function (xmlHttpRequest, error) {

                    showNullData()

                }

            });

        },

        /**

         * 书友评价-分页

         * @method PagiNation

         */

        PagiNation: function () {

            var that = this;



            var pagination = new Pagination({

                container: '#page-container',

                startPage: 1,

                endPage: parseInt($('#page-container').attr('data-pageMax')),

                page: parseInt($('#page-container').attr('data-page')),

                isShowJump: true,

                headDisplay: 1,

                tailDisplay: 1,

                prevText: '&lt;',

                nextText: '&gt;',

                events: {

                    'change:page': function (e, page) {

                        //热门和最新点击的请求与分页相同，直接调用

                        //page 当前点击的分页

                        that.getSortCommentList(e, page);

                    }

                }

            });

        },

        /**

         * 书友评价 - 大于3行评论文字时可以展开评论

         * @method unfoldComment

         * @param e 事件对象

         */

        unfoldComment: function (e) {

            var target = $(e.currentTarget);

            target.parent().css({"height": "auto", "overflow": "auto"}).end().hide();

        },

        /**

         * 作者介绍展开 -大于3行文字时可以展开

         * @method unfoldAuthorInfo

         * @param e 事件对象

         */

        unfoldAuthorInfo: function (e) {

            var target = $(e.currentTarget);

            target.parent().css({"maxHeight": "none", "overflow": "auto"}).end().hide();

        },

        /**

         * 后加载作品讨论区

         * @method discussList

         */

        discussList: function () {

            var that = this;



            //获取EJS所需的json

            var pageJson = g_data.pageJson;



            $.ajax({

                type: "GET",

                //月票接口

                url: "/ajax/book/GetBookForum",

                data: {

                    authorId: pageJson.authorInfo.authorId,

                    bookId: that.bookId,

                    chanId: g_data.chanId,

                    pageSize: 15

                },

                success: function (data) {

                    $('#userDiscuss').find('.la-ball-pulse').remove();

                    if (data.code === 0) {

                        //导航 - 作品讨论数量填入

                        $('#J-discusCount').html('(' + data.data.threadCnt + '条)');

                        // 更新链接

                        $('#J-discusCount').parents('a').attr('href', pageJson.forumPreFix + '/index/' + data.data.forumId);

                        $('.j_forumBtn').attr('href', pageJson.forumPreFix + '/send/' + data.data.forumId);



                        g_data.forumId = data.data.forumId;

                    }

                    //后加载数据的模板

                    var discussTemp = new EJS({

                        url: '/ejs/qd/js/book_details/userDiscuss.0bcc8.ejs'

                    }).render(data, pageJson);



                    //添加模板dom元素到讨论区

                    $('#userDiscuss').append(discussTemp);

                }

            });

        },

        // 更多置顶帖

        showMorePost: function (e) {

            $('#userDiscuss').find('.discuss-list').find('li').removeClass('hidden');

            $('.more-post').remove();

        },

        // 点击赞

        clickLikeBtn: function (e) {

            if (!g_data.pageJson.isLogin) {

                Login.showLoginPopup();

                return;

            }

            var el = $(e.currentTarget);

            var num = el.find('span');

            var isAgree = el.hasClass('act') ? 0 : 1;

            var topicId = el.parents('.info').attr('data-id');

        

            $.ajax({

                url: '/ajax/book/AgreeTopic',

                type: 'POST',

                dataType: 'json',

                data: {

                    forumId: g_data.forumId,

                    topicId: topicId,

                    isAgree: isAgree

                },

            })

            .done(function(res) {

                if (res.code !== 0) {

                    new LightTip({

                        content: res.msg

                    }).error();

                    return;

                }

                // 取消赞

                if (isAgree === 0) {

                    el.removeClass('act').find('.iconfont').html('&#xe677;');

                    // 改数量

                    num.text(parseInt(num.text()) - 1 + '赞');

                // 点赞

                } else {

                    el.addClass('act').find('.iconfont').html('&#xe678;');

                    // 改数量

                    num.text(parseInt(num.text()) + 1 + '赞');

                }

            })

            .fail(function() {

                new LightTip({

                    content: "操作失败，请稍后重试"

                }).error();

            });

        },



        /**

         * 后加载粉丝排行榜

         * @method fansRankList

         */

        fansRankList: function () {

            var that = this;



            //获取EJS所需的json

            var pageJson = g_data.pageJson;



            //设置用户投票空对象，用来存放json数据

            var fansRankData = {};



            $.ajax({

                type: "GET",

                //月票接口

                url: "/ajax/book/GetFansRank",

                data: {

                    bookId: that.bookId

                },

                success: function (data) {

                    //拿到讨论区列表数据



                    var fansRankTemp = new EJS({

                        url: '/ejs/qd/js/book_details/fansRank.5b5d7.ejs'

                    }).render(data, pageJson);



                    //添加模板到粉丝排行榜区域

                    $('#fansRankWrap').find('.la-ball-pulse').remove().end().append(fansRankTemp);

                }

            })

        },



        /**

         * 本书名人榜

         * @method topFansList

         */

        topFansList: function () {

            var that = this;

            //获取EJS所需的json

            var pageJson = g_data.pageJson;



            $.ajax({

                type: "GET",

                //月票接口

                url: "/ajax/book/getFansHall",

                data: {

                    bookId: that.bookId

                },

                success: function (data) {

                    //获得本书名人榜数据

                    var topFansData = new EJS({

                        url: '/ejs/qd/js/book_details/fansHall.d3908.ejs'

                    }).render(data, pageJson);



                    //添加模板到粉丝排行榜区域

                    $('#topFansWrap').find('.la-ball-pulse').remove().end().append(topFansData);

                }

            })

        },

        /**

         * 切换月票、推荐票

         * @method switchTicket

         */

        switchTicket: function () {

            var ticketTab = $('#ticket-Tab a');

            var ticketWrap = $('#ticket-wrap');

            ticketTab.on('click', function () {

                $(this).addClass('act').siblings().removeClass('act');

                ticketWrap.find('.ticket').eq(ticketTab.index(this)).show().siblings().hide();

            });

        },

        /**

         * 其他作品轮播切换

         * @method worksSlider

         */

        workSlides: function () {

            new Switchable({

                selector: '#workSlides .nav a',

                classAdd: "active",

                animation: "translate",

                autoTime: 3000,

                duration: 300,

                hoverStop: true,

                container: $('#workSlides .arrows'),

                onSwitch: function (target) {

                    //遍历所有的img，延迟加载

                    target.each(function () {

                        var img = $(this).find('img')[0];

                        if (img && !img.src) {

                            img.src = $(img).attr('data-src');

                        }

                    });

                }

            });

            //暂时解决怪异bug，点第二次才有反应，并且第一次不点的话，点左边会重叠的问题

            $('#workSlides .next').click();



        },

        /**

         * 显示荣誉列表

         * @method showHonorList

         */

        showHonorList: function () {

            var timer, timer2 = null;

            $('#honor strong, #moreHonorWrap').mouseenter(function () {

                clearTimeout(timer2);

                timer = setTimeout(function () {

                    $('#moreHonorWrap').fadeIn(200);

                }, 200);



            });

            //移开浮层和父级区块 隐藏浮层

            $('#honor,#moreHonorWrap').mouseleave(function () {

                clearTimeout(timer);

                timer2 = setTimeout(function () {

                    $('#moreHonorWrap').stop().fadeOut(200);

                }, 200);

            });

        },

        /**

         * 显示仅有推荐票的提示

         * @method showRecTip

         * @param e 事件对象

         */

        showRecTip: function (e) {

            var target = $(e.currentTarget);

            target.next('cite').fadeIn();

        },

        /**

         * 隐藏仅有推荐票的提示

         * @method hideRecTip

         * @param e 事件对象

         */

        hideRecTip: function (e) {

            var target = $(e.currentTarget);

            target.next('cite').stop().fadeOut();

        },

        /**

         * 切换作品介绍页tab

         * @method switchTab

         * @param e 事件对象

         */

        switchTab: function (e) {

            //获取当前点击的tab

            var targetTab = $(e.currentTarget);

            //获取当前点击的tab的索引

            var tabIdx = targetTab.index();

            //如果点击了作品讨论区，则新开页跳转，不参与此处逻辑

            if (targetTab.hasClass('j_discussion_block')) {

                return;

            }

            //点击的tab添加act样式，兄弟元素去除act样式

            targetTab.addClass('act').siblings().removeClass('act');

            //如果索引为0则显示作品信息tab页，为1则显示目录章节信息页

            if (tabIdx == 0) {

                $('.book-content-wrap').show();

                $('.catalog-content-wrap').hide();

                if (history.replaceState) {

                    history.replaceState(null, '', location.pathname + location.search);

                } else {

                    location.hash = 'info';

                }

            } else if(tabIdx == 1){

                $('.book-content-wrap').hide();

                $('.catalog-content-wrap').show();

                location.hash = 'Catalog';

            } else {

                $('.book-content-wrap, .catalog-content-wrap').hide();

                $('.book-game-wrap').show();

                location.hash = 'GameCenter';

            }

        },

        /**

         * 评分弹窗 - 我要评价，和点击 星星都能触发此弹窗

         * @method  evaluatePopup

         */

        evaluatePopup: function (e) {

            var that = this;

            var target = $(e.currentTarget);

            var evaluatePopup = new EJS({

                url: '/ejs/qd/js/book_details/evaluatePopup.e68e2.ejs'

            }).render();

            var panel = new Panel({

                drag: false,

                headerVisible: false,

                width: 520,

                footerVisible: false,

                content: evaluatePopup,

                events: {

                    close: function () {

                        //评分初始化

                        require.async('qd/js/component/jquery.raty.min.f60d7.js', function () {

                            $('#scoreBtn').find('img').remove();

                            //设定星星的图片路径

                            $.fn.raty.defaults.path = g_data.staticPath;

                            //头部我要评价处方法

                            $('#scoreBtn').raty({

                                width: 116,

                                targetType: "number",

                                starHalf: "/images/book_details/star-half.27094.png",

                                starOff: "/images/book_details/star-off.b2a1b.png",

                                starOn: "/images/book_details/star-on.02731.png",

                                click: function (score) {

                                    that.userScore = score;

                                },

                                score: function () {

                                    //关闭时把原始自己打过的评分恢复到star中

                                    $('#scoreBtn').data('score', that.iRateStar);

                                    //返回原来的iRateStar得分

                                    return $(this).attr('data-score');

                                }

                            });

                        });

                        //启用评价星星组件

                        this.close();

                    }

                }

            });

            panel.confirm();

            //全局化panel

            this.panel = panel;



            //启用评价星星组件

            require.async('qd/js/component/jquery.raty.min.f60d7.js', function () {

                //设定星星的图片路径

                $.fn.raty.defaults.path = g_data.staticPath;

                //弹窗中的评论星星

                $('#starBig').raty({

                    width: 210,

                    target: '#hint',

                    starHalf: "/images/book_details/star-half.27094.png",

                    starOff: "/images/book_details/star-off.b2a1b.png",

                    starOn: "/images/book_details/star-on.02731.png",

                    targetKeep: true,

                    score: function () {

                        $(this).attr('data-score', that.userScore);

                        return $(this).data('score');

                    }

                });

            });



            //如果我没有评价过（拿不到之前评分），并且点击下方我的评价按钮，文案置空

            if (target.data('comment') == 1 && that.userScore == 0) {

                $('#hint').html('');

            }



            //初始化文本框改变文字颜色

            that.switchTextAreaColor();

        },

        /**

         * 发送评分评价的错误提示方法

         * @method sendCommentError

         * @param tip 传入错误提示

         */

        sendCommentError: function (tip) {

            $('.warning-tip').remove();

            $('#evaStarWrap').append('<div class="warning-tip">' + tip + '</div>');

            $('.warning-tip').animate({top: 0}, 500);

        },

        /**

         * 提交评分评价

         * @method sendComment

         *  @param e 事件对象

         */

        sendComment: function (e) {

            var that = this;

            var targetBtn = $(e.currentTarget);



            var sendCommentSucceed;



            //获取最终星星的得分 1-5

            var star = $('#starBig input').val();



            //获取评论内容

            var evaluateText = $('#evaMsgText').val();



            //获取自己的粉丝等级

            var fanLevel = $('#userLevel').html();



            //获取自己的头像

            var myUserIcon = $('#myUserIcon img').attr('src');



            //判断用户是否在textarea输入过

            var isInputComment = $('#evaMsgText').data('clear');



            // 判断是否点击过星星，点过才给提交

            if (star != '') {

                //显示按钮loading样式

                that.loading.startLoading(targetBtn, function () {

                    return sendCommentSucceed;

                }, 200);

                //如果没有输入过评价，清空评价内容提交空数据

                if (isInputComment == 0) {

                    evaluateText = null;

                }

                $.ajax({

                    type: "POST",

                    url: "/ajax/comment/create",

                    data: {

                        bookId: that.bookId,

                        //粉丝等级

                        fanLevel: fanLevel,

                        //评分

                        star: star,

                        //提交的评分内容

                        comment: evaluateText || '',

                        //用户头像

                        userIcon: myUserIcon

                    },

                    success: function (response) {

                        //设置loading结束标识

                        sendCommentSucceed = true;

                        that.loading.clearLoading(targetBtn);

                        var code = response.code;

                        switch (code) {

                            case 0:

                                that.panel.close();

                                new LightTip({

                                    content: '<div class="simple-tips"><span class="iconfont success">&#xe61d;</span><h3>评价提交成功</h3></div>'

                                }).success();



                                //获取提交时间

                                var commentTime = response.data.createTime;



                                //获取评价的id

                                var rateId = response.data.rateId;



                                //准备好自己评价的数据对象，在提交成功后执行显示我的评价方法

                                var myData = {

                                    "data": {

                                        //头像

                                        "userIcon": myUserIcon,

                                        //用户粉丝等级

                                        "fanLevel": fanLevel,

                                        //赞数量

                                        "like": 0,

                                        //评论ID号

                                        "rateId": rateId,

                                        //评论ID号

                                        "nickName": userName,

                                        //评论ID号

                                        "star": star,

                                        //评价内容

                                        "comment": evaluateText,

                                        //评价时间

                                        "time": commentTime

                                    }

                                };



                                //提交成功后显示我的评价数据，插入到页面中

                                that.showMyComment(myData);

                                break;

                            case 1016:

                                //遇到错误时提示

                                that.sendCommentError('保存失败，请重新保存');

                                break;

                            case 1000:

                                that.panel.close();

                                Login && Login.showLoginPopup && Login.showLoginPopup();

                            default:

                                //其他情况获取msg进行提示

                                that.sendCommentError(response.msg);

                        }

                    }

                });

            } else {

                that.sendCommentError('您还没有输入自己的评价或尚未评分');

            }

        },

        /**

         * 提交评分评价后，在本页显示我的评价区块

         * @method showMyComment

         * @param myData 用户提交的数据

         */

        showMyComment: function (myData) {

            //先移除原来的评论内容

            $('#myCommentWrap').children().remove();



            //获取EJS所需的json

            var pageJson = g_data.pageJson;



            //创建新的EJS模板，显示用户刚才提交的评论数据

            var myCommentTemp = new EJS({

                url: '/ejs/qd/js/book_details/myComment.a9d68.ejs'

            }).render(myData, pageJson);



            //添加模板到我的评价区

            $('#myCommentWrap').append(myCommentTemp);

        },

        /**

         * 初始提示评价内容清空

         * @method clearEvaText

         * @param e 事件对象

         */

        clearEvaText: function (e) {

            var target = $(e.currentTarget);

            var isClear = target.data('clear');

            //只清空第一次默认文案，之后用户自己输入的不清空

            if (isClear == 0) {

                target.val('');

                target.text('');

                target.data('clear', '1');

            }



            //评价统计输入框字数

            new Textarea({

                selector: '#evaMsgText'

            }).plug(TextCounter, {

                counter: '#evaCounter',

                countDirection: 'up',

                strictMax: true,

                maxCount: 350

            });

        },

        /**

         *  开启投票弹窗

         *  @method votePopup

         *  @param e 事件对象

         */

        showVotePopup: function (e) {

            var that = this;

            var targetBtn = $(e.currentTarget);

            //showtype :1月票 2推荐票 3打赏

            this.VotePopup.getVoteData(targetBtn.data('showtype'), $('#userLevel').text());

        },

        /**

         * 打赏按钮点击后判断是否是签约作品，如果是非签约作品，弹出toast提示

         * @method isShowRewardPopup

         */

        isShowRewardPopup: function (e) {

            var that = this;

            var pageJson = {};

            pageJson = g_data.pageJson;

            var isSign = pageJson.isSign;

            if (isSign == 0) {

                //如果是非签约作品，弹toast

                new LightTip({

                    content: '<div class="simple-tips"><p>非签约作品不能进行打赏</p><p>建议使用推荐票支持本书</p></div>'

                }).success();

                $('.lbf-overlay').hide();



            } else {

                //否则开启投票弹窗

                that.showVotePopup(e);

            }



        },

        /**

         * 跳转到订阅本书

         * @method jumpSubscribe

         * @param e 事件对象

         */

        jumpSubscribe: function (e) {

            var that = this;

            var target = $(e.currentTarget);

            //设置跳转订阅链接



            if (g_data.envType == 'pro') {

                var envType = '';

            } else {

                var envType = g_data.envType;

            }

            var subPageUrl = '//' + envType + 'book.qiyan.com/subscribe/' + that.bookId;

            target.attr('href', subPageUrl);

            target.attr('target', '_blank');

        },



        subscribeTotal: function (e) {

            new LightTip({

                content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>请前往起点APP订阅</h3></div>'

            }).error();

        },

        /**

         * 下载弹窗

         * @method downloadPopup

         */

        downloadPopup: function () {

            var that = this;



            var pageJson = g_data.pageJson;



            //异步请求的模板（通过ejsChinese方法转换繁体）

            var downloadPopup = ejsChinese('/ejs/qd/js/book_details/downloadPopup.8db9f.ejs', pageJson);



            var panel = new Panel({

                drag: false,

                headerVisible: false,

                width: 520,

                footerVisible: false,

                content: downloadPopup

            });

            panel.confirm();



        },

        /**

         * 加入书架

         * @method addToBookShelf

         */

        addToBookShelf: function (e) {

            //引用Addbook.js中的加入书架方法

            Addbook.addToBookShelf(e, 'blue-btn', 'in-shelf');

        },

        /**

         * 我的评价，判断用户是否登录，已登录就弹评价弹窗

         * @method commentIsLogin

         */

        commentIsLogin: function (e) {

            var that = this;



            if (!Login.isLogin()) {

                //如果是未登录状态，开启登录弹窗

                Login.showLoginPopup();

            } else {

                //已登录开启评价弹窗

                that.evaluatePopup(e);

            }

        },

        /**

         * 粉丝动态滚动列表

         * @method fansRollList

         */

        fansRollList: function () {

            require.async('qd/js/component/jq_scroll.9311c.js', function () {

                $("#scrollDiv").Scroll({line: 1, speed: 500, timer: 3000});

            });

        },

        /**

         * 获取阅读进度和书架

         * @method GetReadStatus

         */

        getReadStatus: function () {

            var that = this;

            var target = $('.J-getJumpUrl');

            //缺省情况下（未登录或者请求挂了）都跳转第一章节

            var jumpurl = $(target).data('firstchapterjumpurl');



            //先设置缺省url 如果请求挂了或者还没请求完毕时就点击，跳缺省url

            target.attr('href', jumpurl);



            //发送请求

            $.ajax({

                method: 'GET',

                url: '/ajax/book/GetReadStatus',

                data: {

                    bookId: that.bookId

                },

                //成功后跳转最新阅读进度地址

                success: function (respons) {

                    if (respons.code === 0) {

                        //最近阅读章节链接

                        jumpurl = respons.data.jumpurl;

                        //0-不在书架 1-已在书架

                        isInBookShelf = respons.data.isInBookShelf;

                        //1-有阅读进度 2-无阅读进度

                        status = respons.data.status;



                        //设置阅读进度跳转链接

                        if (jumpurl != '') {

                            var readBtn = $('#readBtn');

                            var readTrackHtml = '';



                            //判断是否有阅读进度

                            if (respons.data.hasRead) {

                                target.attr('href', jumpurl);

                                readBtn.text('继续阅读');

                                //变更继续阅读的数据埋点data-eid

                                //html中变更（表象）

                                readBtn.attr('data-eid', 'qd_G04');



                                //实际report时变更

                                readBtn.data('eid', 'qd_G04');

                                //在目录页显示阅读进度

                                readTrackHtml = '<div class="reading-track mb40"><a class="read-progress" href="' + respons.data.readChapterUrl + '" target="_blank" data-eid="qd_G54"><span>你已读至</span><i class="progress-name">' + respons.data.readProgress + '</i><em class="iconfont">&#xe621;</em></a></div>'

                                //如果目录信息已经载入，则将进度安插到目录前面区域

                                //if ($('.volume-wrap').length > 0 && $('.reading-track ').length == 0) {

                                //    $('.catalog-content-wrap').prepend(window.readTrackHtml);

                                //    window.readTrackHtml = null;

                                //}

                                $('.catalog-content-wrap').prepend(readTrackHtml);



                                //var readTrack = $('.reading-track');

                                //readTrack.removeClass('hidden');

                                //readTrack.find('.read-progress').attr('href',respons.data.readChapterUrl);

                                //readTrack.find('.progress-name').html(respons.data.readProgress);

                            }

                        }

                        //判断是否已加入书架

                        if (isInBookShelf == 1) {

                            $('#addBookBtn').text('已在书架').addClass('in-shelf');

                        }

                    }

                }

            });

        },

        /**

         * 点赞

         * @method addPraise

         * @param e 事件对象

         */

        addPraise: function (e) {

            var that = this;



            //防止频繁点击发请求，点击一次后发请求，变量过500毫秒后再变0（才可以再次点击发请求）

            if (that.zanComplete == 0) {

                that.zanComplete = 1;



                var target = $(e.currentTarget);



                //获取点赞数量的元素

                var domPraise = target.find('b');



                //获取评价列表的id

                var rateId = target.data('rateid');



                //获取点赞数量 - 整数

                var oldPraise = parseInt(target.find('b').html());



                //设置点赞变量初始值

                var zanStatus = target.data('islike');

                var zanPost = '';



                if (zanStatus == 0) {

                    zanPost = 1;

                } else {

                    zanPost = 0;

                }



                //发送点赞请求

                $.ajax({

                    type: "POST",

                    url: "/ajax/comment/star",

                    data: {

                        bookId: that.bookId,

                        //评价id

                        rateId: rateId,

                        //status 0取消赞 1点赞

                        status: zanPost

                    },

                    success: function (response) {

                        //没有返回data，所以只做异常处理

                        if (response.code != 0) {

                            new LightTip({

                                content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>' + response.msg + '</h3></div>'

                            }).error();

                            $('.lbf-overlay').hide();

                        } else {

                            if (zanStatus == 0) {

                                domPraise.html(oldPraise + 1);

                                domPraise.parent('.zan').addClass('act');

                                target.data('islike', 1);

                            } else {

                                domPraise.html(oldPraise - 1);

                                domPraise.parent('.zan').removeClass('act');

                                target.data('islike', 0);

                            }

                        }

                    }

                });



                //执行请求之后间隔500毫秒把按钮重新设置为可点击（发请求）

                setTimeout(function () {

                    that.zanComplete = 0;

                }, 500);

            } else {

                return false;

            }



        },



        /**

         * 文本框的文字颜色变化

         * @method switchTextAreaColor

         */

        switchTextAreaColor: function () {

            $('textarea').focus(function () {

                $(this).css('color', '#111');

            }).blur(function () {

                $(this).css('color', '#666');

            })

        },

        /**

         * 上报作品信息页面page事件

         * @method reportPageId

         * @param e 点击的事件对象

         */

        reportPageId: function (e) {

            var that = this;

            var target = $(e.currentTarget);



            var pageId;

            //如果点击的是作品信息

            if (target.data('eid') == 'qd_G15') {

                pageId = 'qd_P_xiangqing';

            } else {

                pageId = 'qd_P_mulu';

            }



            //调用P类型上报事件，传入当前应该提交的pageId

            that.reportBookInfoEvent(e, pageId);

        },

        /**

         * 传参 P类型的事件上报，区分用户点击了目录和作品信息页

         * @method reportBookInfoEvent

         * @param pageId 发送请求的pageId编号

         */

        reportBookInfoEvent: function (e, pageId) {

            /**

             * 创建发送请求器

             * @method createSender

             * @param url

             */

                //var createSender = function (url) {

                //    var img = new Image();

                //    img.onload = img.onerror = function () {

                //        img = null;

                //    };

                //    img.src = url;

                //};

                //var cgi = 'http://www.qiyan.com/qreport';

                //var url = cgi + '?';

                //var obj = {

                //

                //    path: 'pclog',

                //

                //    // P 浏览行为

                //    // H hover行为

                //    logtype: 'P',

                //

                //    //pageid：页面ID

                //    pageid: pageId || '',

                //

                //    // 当前页面url

                //    pageUrl: window.location.href,

                //

                //    // 来源referrer

                //    referer: document.referrer

                //};

                //

                //$.each(obj, function (key, value) {

                //    url = url + key + '=' + value + '&';

                //});

                //

                //// 去除最后一个&

                //url = url.substring(0, url.length - 1);

                //createSender(url);

            report.send(e, {pid: pageId});

        },



        /**

         * 切换作品讨论区和书友评价

         * @method switchDiscussComment

         * @param e 事件句柄

         */

        switchDiscussComment: function (e) {

            var targetTab = $(e.currentTarget);

            var discussBlock = $('#userDiscuss');

            var commentBlock = $('#userCommentWrap');

            //点击的元素添加act样式

            targetTab.addClass('act');

            targetTab.siblings('span').removeClass('act');



            //如果点击的元素是作品讨论区，则隐藏热门最新及我要评价按钮,并将我要发帖显示出来

            if (targetTab.hasClass('j_godiscuss')) {

                $('.sort-box').hide();

                $('.j_commentBtn').addClass('hidden');

                $('.j_forumBtn').removeClass('hidden');



                //显示作品讨论区内容

                discussBlock.show();

                commentBlock.hide();

                $('.user-commentWrap').data('l1', '8');



            } else {

                $('.sort-box').show();

                $('.j_commentBtn').removeClass('hidden');

                $('.j_forumBtn').addClass('hidden');



                //显示书友评价内容

                commentBlock.show();

                discussBlock.hide();

                $('.user-commentWrap').data('l1', '7');

            }

        },



        /**

         * flash广告的展示

         * @method showFlashOp

         */

        showFlashOp: function () {

            var flashSigns = g_data.gamesFlashOp;

            //中部左侧广告1，中部左侧广告2，右侧广告

            var left1 = $('.games-op-wrap .left-game');

            var left2 = $('.games-op-wrap .right-game');

            var right = $('.right-op-wrap');



            //如果中部左侧广告1为flash，去除loading

            if (flashSigns.middleLeft1 == 2) {

                left1.find('.la-ball-pulse').remove();

                left1.find('embed.embed-fix').addClass('fix');

                left1.find('a').css('display', 'inline');

            }



            //如果中部左侧广告2为flash，去除loading

            if (flashSigns.middleLeft2 == 2) {

                left2.find('.la-ball-pulse').remove();

                left2.find('embed.embed-fix').addClass('fix');

                left2.find('a').css('display', 'inline');

            }



            //如果右侧广告为flash，去除loading

            if (flashSigns.middleRight == 2) {

                right.find('.la-ball-pulse').remove();

                right.find('embed.embed-fix').addClass('fix');

                right.find('a').css('display', 'inline');

            }

        },



        /**

         * 顶部背景的展示-广告或原有的书背景

         * @method showTopBg

         */

        showTopBg: function () {



        },



        /**

         * 关闭顶部广告

         * @method closeTopOp

         * @param e 事件对象

         */

        closeTopOp: function (e) {

            var target = $(e.currentTarget);

            var originalBg = $('#j-topBgBox');

            var opBg = $('#j-topHeadBox');

            var breadNav = $('.crumbs-nav');



            //如果当前页面存在头部背景图，则显示头部背景，隐藏广告相关的元素

            if (originalBg.length > 0) {

                originalBg.fadeIn();

                if (g_data.isRecom == 1) {

                    breadNav.removeClass('top-op').addClass('rec-book');

                } else {

                    breadNav.removeClass('top-op');

                }

                opBg.stop().stop().fadeOut();

                opBg.find('.close').stop().fadeOut();

                opBg.find('.op-tag').stop().fadeOut();

            }



            //获取用户本地剩余时间（时间戳）

            var leftTime = ((new Date()).getTime()) % ( 86400000);

            //计算用户今天还剩下多少时间（时间戳）

            var cookieTime = 86400000 - leftTime;



            //设置当天24点之前用户看不到这个广告

            Cookie.set('hideTopOp', '1', '', '.qiyan.com', cookieTime);

        },



        /**

         * 显示顶部广告

         * @method showTopOp

         * @param e 事件对象

         */

        showTopOp: function (e) {

            var target = $(e.currentTarget);

            var originalBg = $('#j-topBgBox');

            var opBg = $('#j-topHeadBox');

            var breadNav = $('.crumbs-nav');



            //显示头部广告，同时显示其相关的按钮和标识，隐藏头部原有背景图

            opBg.stop().fadeIn();

            opBg.find('.close').stop().fadeIn();

            opBg.find('.op-tag').stop().fadeIn();

            originalBg.fadeOut();

            if (g_data.isRecom == 1) {

                breadNav.addClass('top-op').removeClass('rec-book');

            } else {

                breadNav.addClass('top-op');

            }

            //清除cookie，使广告在之后每次刷新都显示

            Cookie.set('hideTopOp', '', '', '.qiyan.com');

        },

        /**

         * 关闭当前panel弹窗

         * @method closeCurrentPanel

         */

        closeCurrentPanel: function () {

            this.VotePopup.closeCurrentPanel();

        },

        continueProcess: function () {

            this.VotePopup.continueProcess();

        },

        retryReward: function () {

            this.VotePopup.retryReward();

        },

    })

});

