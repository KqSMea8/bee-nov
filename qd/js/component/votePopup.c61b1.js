/**

 * @fileOverview

 * @author  yangye

 * Created: 2016-8-3

 */

LBF.define('qd/js/component/votePopup.c61b1.js', function (require, exports, module) {

    var

        Panel = require('ui.widget.Panel.Panel'),

        Textarea = require('ui.Nodes.Textarea'),

        TextCounter = require('ui.Plugins.TextCounter'),

        LightTip = require('ui.widget.LightTip.LightTip'),

        Login = require('qd/js/component/login.a4de6.js'),

        Node = require('ui.Nodes.Node'),

        Cookie = require('util.Cookie'),

        Payment = require('qd/js/book_details/payment.d67e7.js'),

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

            //+月票

            'click #addMonth': 'addMonthTicket',



            //-月票

            'click #subMonth': 'subMonthTicket',



            //+推荐票

            'click #addRec': 'addRecTicket',



            //-推荐票

            'click #subRec': 'subRecTicket',



            //选择打赏金额

            'click #rewardList li': 'selectReward',



            //切换弹窗

            'click #popupTab a': 'popupTabSwitch',



            //投月票

            'click #voteMonth': 'voteMonthPost',



            //投推荐票

            'click #voteRec': 'voteRecPost',



            //打赏

            'click #voteReward': 'voteRewardPost',



            //跳转打赏弹窗

            'click .goReward': 'goRewardTab',



            //关闭当前panel弹窗

            //'click .closeBtn, .close': 'closeCurrentPanel',



            //点击‘投推荐票’tab

            'click #recTab': 'showRecPopup',



            //点击‘投月票’tab

            'click #monthTab': 'showMonthPopup',



            //点击‘打赏’tab

            'click #rewardTab': 'showRewardPopup',



            //显示‘请确认是否完成手机绑定’弹窗

            'click .j_bindphone': 'showPhoneBindProcess',



            //点击月票tab触发的‘完成绑定’按钮【无关风控】

            'click .j_month_hasbind': 'bindComplete',



            //检查推荐票输入数量 2016-12-5 add

            'keyup #recNum': 'checkRecNum'



        },



        /**

         * Nodes default UI element，this.$element

         * @property elements

         * @type Object

         * @protected

         */

        elements: {

            //弹窗切换tab容器

            popupTab: '#popupTab',



            //弹窗容器

            voteWrap: '#voteWrap',



            //打赏文本框

            rewardMsgText: '#rewardMsgText'

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



            //获取当前页面书的bookId，发请求都需要用到

            var bookId = $('#bookImg').data('bid');



            var authorId = $('#authorId').data('authorid');



            //设置余额变量

            var balance = '';



            //设置打赏金额

            var amount = '';



            //变更作用域，给其他方法内使用此变量

            that.bookId = bookId;

            that.authorId = authorId;



            var panel = {};



            //初始化打赏金额

            this.rewardPrice = 500;



            //实例化loading.js

            this.loading = new Loading({});



            //初始化payment.js实例

            this.payment = new Payment({});



            //推荐票输入检查

            //this.checkRecNum();



        },

        /**

         * 检查推荐票输入数量 2016-12-5 add

         * @method checkRecNum

         */

        checkRecNum: function (evt) {

            var that = this;

            //最多能投多少推荐票

            var recSurplus = parseInt($('#recSurplus').html());



            //推荐票输入框的值

            var recVal = parseInt($('#recNum').val());



            //推荐票UI的icon容器

            var recIcon = $('#recTicket');



            //每次keyup后清除按钮状态和错误提示

            $('.warning-tip').remove();

            $('#addRec, #subRec').removeClass('disabled');



            //投推荐票输入范围检查提示

            if (recVal > recSurplus) {

                that.voteErrorTip($('#voteWrap'), '输入错误！', '当前最大只能投' + recSurplus + '张');

                $('#recNum').val(recSurplus);

                recIcon.find('b').remove();

                recIcon.append('<b></b><b></b><b></b><b></b><b></b>');

                $('#addRec').addClass('disabled');

            }

            else if (recVal == 1) {

                $('#subRec').addClass('disabled');

                recIcon.find('b').remove();

                recIcon.append('<b></b>');

            }

            else if (recVal == 2) {

                recIcon.find('b').remove();

                recIcon.append('<b></b><b></b>');

            }

            else if (recVal == 3) {

                recIcon.find('b').remove();

                recIcon.append('<b></b><b></b><b></b>');

            }

            else if (recVal == 4) {

                recIcon.find('b').remove();

                recIcon.append('<b></b><b></b><b></b><b></b>');

            }

            else if (recVal >= 5) {

                recIcon.find('b').remove();

                recIcon.append('<b></b><b></b><b></b><b></b><b></b>');

            }

            else {

                $('.warning-tip').remove();

            }

        },

        /**

         * 初始化弹窗切换

         * @method popupTab

         * @param e 事件对象

         */

        popupTabSwitch: function (e) {

            //获取事件对象

            var targetTab = $(e.currentTarget);



            //获取弹窗切换容器

            var voteWrap = $('#voteWrap');



            targetTab.addClass('act').siblings().removeClass('act');

            voteWrap.find('.popup-content').eq(targetTab.index()).show().siblings('.popup-content').hide();



            $('.warning-tip').remove();

        },



        /**

         * 点击‘投票互动/投票打赏’【控制弹窗当前应显示的tab】

         * @method getVoteData

         */

        getVoteData: function (showtype, userLevel) {

            var that = this;

            //如果是弱登录状态，则显示登录框

            if (!Login.isLogin()) {

                Login && Login.showLoginPopup && Login.showLoginPopup();

                return;

            }

            var that = this;

            //设置用户投票空对象，用来存放json数据

            var VoteData = {};

            var visibilityObj = {monthVisibility: 'hidden', recVisibility: 'hidden'};

            //showtype=1为VIP的情况，默认请求月票信息

            if (showtype === 1) {

                that.loadVotePanel(that, VoteData, showtype, visibilityObj);

                that.getMonthData(VoteData, showtype, userLevel, that.showVote, visibilityObj);

            } else if (showtype === 2) {

                //showtype=2为非VIP的情况，默认请求推荐票信息

                that.loadVotePanel(that, VoteData, showtype, visibilityObj);

                that.getRecData(VoteData, showtype, userLevel, that.showVote, visibilityObj);

            } else {

                //showtype=3为打赏情况

                that.loadVotePanel(that, VoteData, showtype, visibilityObj);

                that.getRewardData(that.showVote);

            }

        },



        /**

         * 初始化投票弹窗

         * @method loadVotePanel

         */

        loadVotePanel: function (that, VoteData, showtype, visibilityObj) {

            var pageJson = g_data.pageJson;

            if ($('#votePopup').length == 0) {



                //继承json

                $.extend(pageJson, visibilityObj);



                //异步请求的模板（通过ejsChinese方法转换繁体）

                var votePopup = ejsChinese('/ejs/qd/js/component/template/votePopup.3d8ee.ejs', pageJson);



                if ($('.lbf-panel').length > 0) {

                    that.panel.setContent(votePopup);

                    that.panel.setToCenter();

                } else {

                    var panel = new Panel({

                        drag: false,

                        headerVisible: false,

                        width: 520,

                        footerVisible: false,

                        content: votePopup

                    });

                    //全局化panel

                    that.panel = panel;

                }

            }



            //判断传入进来的点击参数类型，决定显示哪个弹窗tab

            if (showtype === 1) {

                $(popupTab).find('#monthTab').addClass('act');

                $(voteWrap).find('#monthPopup').show();

            } else if (showtype === 2) {

                $(popupTab).find('#recTab').addClass('act');

                $(voteWrap).find('#recPopup').show();

            } else {

                $(popupTab).find('#rewardTab').addClass('act');

                $(voteWrap).find('#rewardPopup').show();

            }



            //给右上角弹窗关闭按钮绑定事件

            $('.lbf-icon-close').on('click', function () {

                that.resetSigns();

            });

        },



        /**

         * 拉取月票逻辑

         * @method getMonthData

         */

        getMonthData: function (VoteData, showtype, userLevel, successLogic, visibilityObj) {

            var that = this;

            if (that.hasMonthData) {

                return;

            }

            //请求月票tab相关数据

            $.ajax({

                type: "GET",

                //月票接口

                url: "/ajax/book/GetUserMonthTicket",

                data: {

                    bookId: that.bookId,

                    userLevel: userLevel,

                    authorId: that.authorId

                },

                success: function (monthData) {

                    if (monthData.code === 0) {

                        //拿到月票数据

                        VoteData.monthArr = monthData.data;

                        visibilityObj.monthVisibility = '';

                        successLogic(that, VoteData, showtype, visibilityObj);



                        if ($('#monthMsgText').length > 0) {

                            //打赏统计输入框字数

                            new Textarea({

                                selector: '#monthMsgText'

                            }).plug(TextCounter, {

                                counter: '#mCounter',

                                countDirection: 'up',

                                strictMax: true,

                                maxCount: 350

                            });

                        }

                        that.hasMonthData = true;

                    } else if (monthData.code === 1000) {

                        that.panel.close();

                        Login && Login.showLoginPopup && Login.showLoginPopup();

                    } else {

                        new LightTip({

                            content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>网络异常，请稍后再试</h3></div>'

                        }).error();

                        $('.lbf-overlay:last').hide();

                    }

                }

            })

        },



        /**

         * 拉取推荐票逻辑

         * @method getRecData

         */

        getRecData: function (VoteData, showtype, userLevel, successLogic, visibilityObj) {

            var that = this;

            if (that.hasRecData) {

                return;

            }



            //请求推荐票接口

            $.ajax({

                    type: "GET",

                    url: "/ajax/book/GetUserRecomTicket",

                    data: {

                        bookId: that.bookId,

                        userLevel: userLevel

                    },

                    success: function (recData) {

                        if (recData.code === 0) {

                            //推荐票可投数量

                            that.recNum = recData.data.enableCnt;

                            //拿到推荐票数据

                            VoteData.recArr = recData.data;

                            visibilityObj.recVisibility = '';

                            //调用初始化弹窗，传入按钮的data-showtype,1:月票 2:推荐票 3:打赏

                            successLogic(that, VoteData, showtype, visibilityObj);

                            that.hasRecData = true;

                        } else if (recData.code === 1000) {

                            that.panel.close();

                            Login && Login.showLoginPopup && Login.showLoginPopup();

                        } else {

                            new LightTip({

                                content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>网络异常，请稍后再试</h3></div>'

                            }).error();

                            $('.lbf-overlay:last').hide();

                        }

                    }

                }

            );

        },



        /*

         **拉取打赏中的余额逻辑

         * @method getRewardData

         */

        getRewardData: function (successLogic) {

            var that = this;

            if (that.hasRewardData) {

                return;

            }

            //console.log("get reward again");

            var VoteData = {};

            $.ajax({

                type: "GET",

                url: "/ajax/book/getDashangBalance",

                success: function (rewardData) {

                    if (rewardData.code === 1000) {

                        that.panel.close();

                        Login && Login.showLoginPopup && Login.showLoginPopup();

                        return;

                    }

                    VoteData.balance = rewardData.data && rewardData.data.balance;

                    that.balance = rewardData.data.balance;

                    if (VoteData.balance == undefined) {

                        VoteData.balance = '- -';

                    }

                    //无论获取余额成功或失败，都继续渲染打赏的模板

                    successLogic(that, VoteData, g_data.pageJson);

                    that.hasRewardData = true;

                    if ($('#rewardMsgText').length > 0) {

                        //打赏统计输入框字数

                        new Textarea({

                            selector: '#rewardMsgText'

                        }).plug(TextCounter, {

                            counter: '#rCounter',

                            countDirection: 'up',

                            strictMax: true,

                            maxCount: 350

                        });

                    }

                }

            })

        },



        /**

         * 初始化投推荐票tab

         * @method showRecPopup

         */

        showRecPopup: function () {

            var that = this;

            var VoteData = {};

            var visibilityObj = {monthVisibility: 'hidden', recVisibility: 'hidden'};

            this.getRecData(VoteData, 2, $('#userLevel').text(), this.renderRecPopup, visibilityObj);

            //this.panel.setToCenter();



            //待后加载dom完毕后光标定在input上

            setTimeout(function () {

                $('#recNum').focus();

            }, 10);

        },



        /**

         * 初始化投月票tab

         * @method showMonthVote

         */

        showMonthPopup: function () {

            var VoteData = {};

            var visibilityObj = {monthVisibility: 'hidden', recVisibility: 'hidden'};

            this.getMonthData(VoteData, 1, $('#userLevel').text(), this.renderMonthPopup, visibilityObj);

            //this.panel.setToCenter();



        },

        /*

         **初始化打赏tab

         * @method showRewardPopup

         */

        showRewardPopup: function () {

            this.getRewardData(this.renderRewardPopup);



            //this.panel.setToCenter();

        },

        /*

         **渲染推荐票tab的html

         * @method renderRecPopup

         */

        renderRecPopup: function (that, VoteData, pageJson) {

            if (that.hasRecData) {

                return;

            }

            pageJson = g_data.pageJson;

            //获取推荐票tab对应的content部分

            var recPopup = $('#recPopup');

            var recTemplate = new EJS({

                url: '/ejs/qd/js/component/template/recPopup.00968.ejs'

            }).render(VoteData, pageJson);

            //清空推荐票tab页的内容，同时添加最新渲染好的html片段

            recPopup.html("");

            recPopup.append(recTemplate);

        },

        /*

         **渲染月票tab的html

         *  @method renderMonthPopup

         */

        renderMonthPopup: function (that, VoteData, pageJson) {

            if (that.hasMonthData) {

                return;

            }

            //获取月票tab对应的content部分

            var monPopup = $('#monthPopup');

            var rewardPopup = new EJS({

                url: '/ejs/qd/js/component/template/monthPopup.275c5.ejs'

            }).render(VoteData, pageJson);

            //清空推荐票tab页的内容，同时添加最新渲染好的html片段

            monPopup.html("");

            monPopup.append(rewardPopup);

        },



        /*

         **渲染打赏tab页内容

         * @method renderRewardPopup

         */

        renderRewardPopup: function (that, VoteData, pageJson) {

            if (that.hasRewardData) {

                return;

            }

            //获取推荐票tab对应的content部分

            var rewardPopup = $('#rewardPopup');

            var rewardPopupTem = new EJS({

                url: '/ejs/qd/js/component/template/rewardPopup.e283a.ejs'

            }).render({balance: VoteData.balance}, pageJson);

            //清空推荐票tab页的内容，同时添加最新渲染好的html片段

            rewardPopup.html("");

            rewardPopup.append(rewardPopupTem);

        },



        /**

         * 初始化投票弹窗，传入json的data及当前作用域that

         * @method showMonthVot

         */

        showVote: function (that, VoteData) {

            var pageJson = g_data.pageJson;

            //如果有推荐票相关数据，则将推荐票模板添加到votePopup.ejs中

            if (VoteData.recArr) {

                that.renderRecPopup(that, VoteData, pageJson);

            }



            //如果有月票相关数据，则将月票模板添加到votePopup.ejs中

            if (VoteData.monthArr) {

                that.renderMonthPopup(that, VoteData, pageJson);

            }



            //如果有打赏相关数据，则将打赏模板添加到votePopup.ejs中

            if (pageJson.isSign == 1) {

                that.renderRewardPopup(that, VoteData, pageJson);

            }

        },



        /*

         **重置月票、推荐票、打赏时获取到数据的标识【重置后再次打开弹窗会重新发请求获取】

         * @method resetSigns

         */

        resetSigns: function () {

            this.hasRecData = false;

            this.hasMonthData = false;

            this.hasRewardData = false;

        },

        /**

         * 增加月票

         * @method addMonthTicket

         */

        addMonthTicket: function () {

            //获取剩余月票

            var monthSurplus = $('#monthSurplus').html();



            var i = parseInt($(monthNum).html());



            $('#subMonth').removeClass('disabled');



            //点击开始增加月票，同时加入月票图标动效，限制到5张

            if (i <= monthSurplus) {

                i += 1;

                $(monthNum).text(i);

                if ($(mTicket).find('b').length < monthSurplus) {

                    $(mTicket).append('<b></b>');

                }

            }



            //判断等于剩余月票时加号禁用，不可再投，发现数量大于限制时，将数量减回，同时阻止事件上报

            if (i > monthSurplus) {

                $(monthNum).text(i - 1);

                $('#addMonth').addClass('disabled');

                return false;

            }



            $(mTicket).find('b').fadeIn(200);



            //计算获得多少粉丝值

            $('#calcMonthExp').html(i);

        }

        ,

        /**

         * 减少月票

         * @method subMonthTicket

         */

        subMonthTicket: function () {

            var i = parseInt($(monthNum).html());

            $('#addMonth').removeClass('disabled');



            //点击开始减少月票，同时remove月票图标，限制到1张

            if (i >= 1) {

                i -= 1;

                $(monthNum).text(i);

                if (i < 5) {

                    $(mTicket).find('b:last').prev('b').remove();

                }

            }



            //判断少于1张时，把数量+回1，同时阻止事件上报

            if (i < 1) {

                $(monthNum).text(i + 1);

                $('#subMonth').addClass('disabled');

                return false;

            }



            //计算获得多少粉丝值

            $('#calcMonthExp').html(i);

        },

        /**

         * 增加推荐票

         * @method addRecTicket

         */

        addRecTicket: function () {

            $('.warning-tip').remove();

            $(recNum).focus();

            //获取当前能投的推荐票

            var recSurplus = parseInt($('#recSurplus').html());



            var i = parseInt($(recNum).val());

            $('#subRec').removeClass('disabled');



            //点击开始增加推荐票，同时加入推荐票图标动效，限制到5张

            if (i <= recSurplus) {

                i += 1;

                $(recNum).val(i);

                var maxNum = ( recSurplus > 5) ? 5 : recSurplus;

                if ($(recTicket).find('b').length < maxNum) {

                    $(recTicket).append('<b></b>');

                }

            }



            //判断等于剩余推荐票时加号禁用，不可再投，发现数量大于限制时，将数量减回，同时阻止事件上报

            if (i > recSurplus) {

                $(recNum).val(i - 1);

                $('#addRec').addClass('disabled');

                return false;

            }



            $(recTicket).find('b').fadeIn(200);



            //计算获得多少粉丝值

            $('#calcRecExp').html(i)



        },

        /**

         * 减少推荐票

         * @method subRecTicket

         */

        subRecTicket: function () {

            $('.warning-tip').remove();

            $(recNum).focus();



            var i = parseInt($(recNum).val());

            $('#addRec').removeClass('disabled');



            //点击开始减少推荐票，同时remove推荐票图标，限制到1张

            if (i >= 1) {

                i -= 1;

                $(recNum).val(i);

                if (i < 5) {

                    $(recTicket).find('b:last').prev('b').remove();

                }

            }



            //判断少于1张时，把数量+回1，同时阻止事件上报

            if (i < 1) {

                $(recNum).val(i + 1);

                $('#subRec').addClass('disabled');

                return false;

            }



            //计算获得多少粉丝值

            $('#calcRecExp').html(i)

        }

        ,

        /**

         * 选择打赏列表

         * @method selectReward

         * @param e 事件对象

         */

        selectReward: function (e) {



            var target = $(e.currentTarget);

            target.addClass('act').siblings().removeClass('act');

            this.rewardPrice = target.data('reward');



            //选择打赏时对应的文案和计算本次打赏金额

            switch (this.rewardPrice) {

                case 100:

                    $('.calcReward').text(100);

                    $(rewardMsgText).val('这本书太棒了，犒劳一下，希望后续更加精彩！');

                    break;

                case 500:

                    $('.calcReward').text(500);

                    $(rewardMsgText).val('这本书太棒了，犒劳一下，希望后续更加精彩！');

                    break;

                case 1000:

                    $('.calcReward').text(1000);

                    $(rewardMsgText).val('这本书太棒了，犒劳一下，希望后续更加精彩！');

                    break;

                case 2000:

                    $('.calcReward').text(2000);

                    $(rewardMsgText).val('这本书太棒了，犒劳一下，希望后续更加精彩！');

                    break;

                case 10000:

                    $('.calcReward').text(10000);

                    $(rewardMsgText).val('这本书太棒了，犒劳一下，希望后续更加精彩！');

                    break;

                case 50000:

                    $('.calcReward').text(50000);

                    $(rewardMsgText).val('击节赞叹，拍案而起，非此犒赏不足以表吾之意!');

                    break;

                case 100000:

                    $('.calcReward').text(100000);

                    $(rewardMsgText).val('天花乱坠，感动涕零，先生之才当受此赏！');

                    break;

                case 1000000:

                    $('.calcReward').text(1000000);

                    $(rewardMsgText).val('心潮澎湃，相见恨晚，百万虽巨，亦难表吾之喜爱！');

                    break;

                case 10000000:

                    $('.calcReward').text(10000000);

                    $(rewardMsgText).val('荡气回肠，百感交集，千金妙笔相赠，助先生纸墨风流！');

                    break;

                default:

                    $(rewardMsgText).val('这本书太棒了，犒劳一下，希望后续更加精彩！');

            }

        }

        ,

        /**

         * 投票 显示 + 个数字的动效 投票完后调用

         * @method addNumAnimate

         * @param totalTarget:dom中的总数

         *        postNum:显示+n的数字动效

         */

        addNumAnimate: function (totalTarget, postNum, updLevel) {

            //获取传进来的总数dom元素

            var TotalNum = totalTarget;



            //获取还差多少粉丝值升级，转换成数字，之后做计算

            var Lnterval = parseInt($('#Lnterval').text());



            //获取用户原来的等级，如果升级后做加法

            var userOldLevel = parseInt($('#userLevel').text());



            //如果点的是打赏按钮，关闭后显示打赏人数+1 粉丝升级根据打赏对应变化

            if (TotalNum.hasClass('rewardNum')) {

                //获取打赏人数

                var rewardCount = parseInt($('.rewardNum').text());

                var todayNum = parseInt($('#todayNum').text());

                setTimeout(function () {

                    //显示打商人数+1

                    $('#rewardNum').after('<span>+1</span>');

                    $('#rewardNum').text(rewardCount + 1);

                    $('#todayNum').text(todayNum + 1);



                    //如果还剩多少粉丝值变负数 || 请求返回的升级数 > 0 || 页面中是暂无粉丝等级的情况下

                    if ((Lnterval - postNum) < 0 || updLevel > 0) {

                        if ($('#noLv').hasClass('hidden')) {

                            //页面中暂无粉丝等级如果是隐藏的情况下在已有等级div里恭喜升级

                            $('#Lnterval').parent().html('恭喜您已成功升级:Lv' + (userOldLevel + updLevel));

                        } else {

                            //否则在暂无粉丝等级div里显示

                            $('#levelUp').html('恭喜您已成功升级:Lv' + (userOldLevel + updLevel));

                        }

                    } else {

                        $('#Lnterval').text(Lnterval - postNum);

                    }



                }, 1000);

            } else {

                //如果点的不是打赏按钮，关闭后显示票数+多少 粉丝升级根据投票对应变化



                //获取月票或推荐票总数



                var ticketCount = parseInt(TotalNum.text());

                setTimeout(function () {

                    //总数+上投票的个数

                    TotalNum.text(ticketCount + postNum);

                    //把span添加入dom元素，由css3动画来显示动效

                    TotalNum.after('<span>' + '+' + postNum + '</span>');



                    //如果还剩多少粉丝值变负数 || 请求返回的升级数 > 0 执行恭喜升级动态文字

                    if ((Lnterval - postNum) < 0 || updLevel > 0) {

                        //页面中暂无粉丝等级如果是隐藏的情况下在已有等级div里恭喜升级

                        if ($('#noLv').hasClass('hidden')) {

                            $('#Lnterval').parent().html('恭喜您已成功升级:Lv' + (userOldLevel + updLevel));

                        } else {

                            //否则在暂无粉丝等级div里显示

                            $('#levelUp').html('恭喜您已成功升级:Lv' + (userOldLevel + updLevel));

                        }

                    } else {

                        $('#Lnterval').text(Lnterval - postNum * 100);

                    }

                }, 1000);

            }



            //动画结束后隐藏，下次投票可以重复显示，再隐藏

            setTimeout(function () {

                TotalNum.next('span').fadeOut();

            }, 2000);

        }

        ,

        /**

         * 投票遇到系统错误的提示

         * @method voteErrorTip

         * @param wrap 父级容器

         *        action 用户行为

         *        msg data中返回的msg

         */

        voteErrorTip: function (wrap, action, msg) {

            $('.warning-tip').remove();

            //wrap.append('<div class="warning-tip">' + action + '失败！系统出现错误，请重写提交</div>')

            wrap.append('<div class="warning-tip">' + action + msg + '</div>');

            $('.warning-tip').animate({top: 0}, 300);

        },

        /**

         * 投出月票

         * @metho voteMonthPost

         */

        voteMonthPost: function (e) {

            var that = this;

            var targetBtn = $(e.currentTarget);

            var voteMonthSucceed;

            var voteData = {};

            //最终投月票的数量

            var postMonth = parseInt($('#monthNum').html());

            that.hasMonthData = false;



            //在按钮loading的时候再次点击则不执行逻辑

            if (targetBtn.hasClass('btn-loading')) {

                return;

            }



            //显示按钮loading样式

            that.loading.startLoading(targetBtn, function () {

                return voteMonthSucceed;

            }, 200);



            //去除之前可能存在的错误提示

            if ($('.warning-tip').length > 0) {

                $('.warning-tip').remove();

            }

            $.ajax({

                type: "POST",

                url: "/ajax/book/VoteMonthTicket",

                data: {

                    bookId: that.bookId,

                    //投票数量

                    cnt: postMonth,

                    desc: $('#monthMsgText').val(),

                    authorId: that.authorId

                },

                dataType: "json",

                success: function (data) {

                    if (data.code === 0) {

                        //设置loading结束标识

                        voteMonthSucceed = true;

                        voteData.monthArr = data.data;

                        that.renderMonthPopup(that, voteData, g_data.pageJson);

                        that.loading.clearLoading(targetBtn);

                        //投票后，一律不显示monthNoLimit,因为这是相关于投票之前的展示

                        var status = data.data.status;

                        //投月票中正常投票的容器

                        var monthNoLimit = $('#monthPopup .no-limit-wrap');

                        monthNoLimit.hide();



                        //status一共有0,1,2,3,4,5种可能

                        if (status === 0) {

                            //status===0 时表示成功

                            var exp = {};

                            exp = data.data;

                            //投票获取的经验值

                            var expNum = exp.info;



                            //获取投票后是否升级, 0是不升级，>1是升多少级

                            var updLevel = exp.updLevel;



                            var voteComplete = monthNoLimit.siblings('.vote-complete');

                            voteComplete.show();

                            //显示投出多少月票

                            voteComplete.find('.post-num').text(postMonth);

                            //显示获得多少粉丝值

                            voteComplete.find('.fans-value').text(expNum);



                            //关闭后调用显示+数字动画

                            voteComplete.on('click', '.closeBtn', function () {

                                that.addNumAnimate($('#monthCount'), postMonth, updLevel);

                            });



                            //往粉丝动态里添加自己操作记录

                            $('#scrollDiv ul').append('<li><em class="month"></em><a href="//me.qiyan.com/Index.aspx" target="_blank" title=' + userName + '>' + userName + '</a><span>投了</span>' + postMonth + '张月票</li>');



                            //月票回调

                            if (that.voteMonthCallBack) that.voteMonthCallBack(userName, postMonth);

                        }

                    } else if (data.code === 1000) {

                        that.closePanel();

                        Login && Login.showLoginPopup && Login.showLoginPopup();

                    } else {

                        //code 0 以外的异常情况

                        that.voteErrorTip($('#voteWrap'), '投月票失败！', data.msg);

                    }

                }

            });

        },

        /**

         * 投出推荐票

         * @metho voteRecPost

         */

        voteRecPost: function (e) {

            var that = this;

            var targetBtn = $(e.currentTarget);

            var voteRecSucceed;

            var voteData = {};



            //获取最多能投多少张推荐票

            var recSurplus = parseInt($('#recSurplus').html());



            //获取输入投出多少张推荐票

            var recNumVal = $('#recNum').val().trim();



            //正则匹配正整数

            var intRec = /^[1-9]+[0-9]*]*$/;



            //在按钮loading的时候再次点击则不执行逻辑

            if (targetBtn.hasClass('btn-loading')) {

                return;

            }



            //确保推荐票输入框有值才可以发请求

            if (recNumVal != '' && recNumVal <= recSurplus && intRec.test(recNumVal) == true) {

                //显示按钮loading样式

                that.loading.startLoading(targetBtn, function () {

                    return voteRecSucceed;

                }, 200);

                //最终投推荐票的数量

                var postRec = parseInt($('#recNum').val());



                //去除之前可能存在的错误提示

                $('.warning-tip').remove();



                $.ajax({

                    type: "POST",

                    url: "/ajax/book/VoteRecomTicket",

                    data: {

                        bookId: that.bookId,

                        //投票数量

                        cnt: postRec,

                        //desc: $('#recMsgText').val(),

                        enableCnt: that.recNum

                    },

                    dataType: "json",

                    success: function (data) {

                        if (data.code === 0) {

                            //设置loading结束标识

                            voteRecSucceed = true;

                            //需重新渲染ejs模板，因此重置此变量

                            that.hasRecData = false;

                            voteData.recArr = data.data;

                            that.renderRecPopup(that, voteData, g_data.pageJson);

                            that.loading.clearLoading(targetBtn);

                            var recNoLimit = $('#recPopup .no-limit-wrap');

                            recNoLimit.hide();

                            var status = data.data.status;



                            //status一共有0,1,2,3种可能

                            if (status === 0) {

                                //status === 0 时表示成功

                                var exp = {};

                                exp = data.data;

                                //投票获取的经验值

                                var expNum = exp.info;



                                recNoLimit.hide();

                                var voteComplete = recNoLimit.siblings('.vote-complete');

                                voteComplete.show();

                                //显示投出多少月票

                                voteComplete.find('.post-num').text(postRec);

                                //显示获得多少粉丝值

                                voteComplete.find('.fans-value').text(expNum);



                                //关闭后调用显示+数字动画

                                voteComplete.on('click', '.closeBtn', function () {

                                    var $recCount = $('#recCount');

                                    var recCount = parseInt($recCount.text());

                                    $recCount.after('<span>' + '+' + postRec + '</span>');

                                    setTimeout(function () {

                                        $recCount.text(recCount + postRec);

                                    }, 1000);



                                    //动画结束后隐藏，下次投票可以重复显示，再隐藏

                                    setTimeout(function () {

                                        $recCount.next('span').fadeOut();

                                    }, 2000);

                                });



                                //往粉丝动态里添加自己操作记录

                                $('#scrollDiv ul').append('<li><em class="month"></em><a href="//me.qiyan.com/Index.aspx" target="_blank" title=' + userName + '>' + userName + '</a><span>投了</span>' + postRec + '张推荐票</li>');



                                //推荐票回调

                                if (that.voteRecCallBack) that.voteRecCallBack(userName, postRec);

                            }

                        } else if (data.code === 1000) {

                            that.closePanel();

                            Login && Login.showLoginPopup && Login.showLoginPopup();

                        } else {

                            //code 0 以外的情况

                            that.voteErrorTip($('#voteWrap'), '投推荐票失败！', data.msg);

                        }

                    }

                });

            } else {

                that.voteErrorTip($('#voteWrap'), '投推荐票失败！', '请输入正确的推荐票数量');

                $('#recNum').focus();

            }



        },

        /**

         * 打赏行为

         * @method voteRewardPost

         */

        voteRewardPost: function (e) {

            var that = this;

            var targetBtn = $(e.currentTarget);

            var voteRewardSucceed;



            //在按钮loading的时候再次点击则不执行逻辑

            if (targetBtn.hasClass('btn-loading')) {

                return;

            }

            //打赏金额数

            amount = parseInt($('#rewardList li.act').data('reward'));



            //全局化金额数

            that.amount = amount;



            //包裹发送数据

            this.requiredData = {

                bookId: that.bookId,

                //打赏金额

                amount: amount,

                desc: $('#rewardMsgText').val()

            };



            //判断用户有没有传入章节id

            if (that.voteChapterId) this.requiredData.chapterId = that.voteChapterId;



            //显示按钮loading样式

            that.loading.startLoading(targetBtn, function () {

                return voteRewardSucceed;

            }, 0);



            //去除之前可能存在的错误提示

            if ($('.warning-tip').length > 0) {

                $('.warning-tip').remove();

            }

            //打赏发请求

            $.ajax({

                type: "POST",

                url: "/ajax/book/RewardBook",

                data: this.requiredData,

                dataType: "json",

                success: function (data) {

                    voteRewardSucceed = true;

                    that.loading.clearLoading(targetBtn);

                    //正常状态

                    if (data.code === 0) {

                        var rewardData = {};



                        rewardData = data.data;



                        //获取打赏得到的经验值

                        var expNum = rewardData.info;



                        //获取打赏后是否升级, 0是不升级，>1是升多少级

                        var updLevel = rewardData.updLevel;



                        //获取打赏大额后赠出的月票数量

                        var giftMonthTicket = rewardData.monthTicketCnt;



                        //获取账户余额

                        window.balance = rewardData.balance;



                        //获取打赏资格状态 2是禁止消费状态

                        var status = rewardData.status;



                        //若账户余额是0，弹出余额不足的模板，隐藏打赏模板

                        if (status == 1) {

                            var differ = parseInt(that.rewardPrice) - balance;

                            $('#rewardPopup').find('#noMoney').show().end().find('.no-limit-wrap').hide();

                            //显示用户余额

                            $('#balance').html(balance);

                            //计算相差多少 去掉负号

                            $('#differ').html(Math.abs(differ));

                            return false;

                        } else if (status === 2) {

                            $('#rewardPopup').find('#rewardBan').show().end().find('.no-limit-wrap').hide();

                        } else {

                            //status === 0 时表示成功

                            var rewardNoLimit = $('#rewardPopup').find('.no-limit-wrap');



                            rewardNoLimit.hide();



                            var voteComplete = rewardNoLimit.siblings('.vote-complete');

                            voteComplete.show();

                            //显示打赏多少起点币

                            voteComplete.find('.post-num').text(amount);

                            //显示获得多少粉丝值

                            voteComplete.find('.fans-value').text(expNum);



                            //若monthTicketCnt > 0 显示赠投信息

                            if (giftMonthTicket > 0) {

                                voteComplete.find('.gift').html('赠投出 ' + giftMonthTicket + ' 张月票，');

                            }



                            //关闭后调用显示+数字动画

                            voteComplete.on('click', '.closeBtn', function () {

                                that.addNumAnimate($('.rewardNum'), amount, updLevel);

                            });



                            //往粉丝动态里添加自己操作记录

                            var light = '';

                            if (amount >= 10000) {

                                light = 'high-light';

                            }

                            $('#scrollDiv ul').append('<li class=' + light + '><em class="money"></em><a href="//me.qiyan.com/Index.aspx" target="_blank" title=' + userName + '>' + userName + '</a><span>打赏了</span>' + amount + '起点币</li>');



                            //打赏回调

                            if (that.voteRewardCallBack) that.voteRewardCallBack(userName, amount);

                        }

                    } else if (data.code === 1000) {

                        that.closePanel();

                        Login && Login.showLoginPopup && Login.showLoginPopup();

                    } else {

                        // code 0 以外的 消费异常情况

                        /*

                         *

                         * 参数1：后端返回的数据

                         * 参数2：前端发送给后端的数据

                         * 参数3：有几种模式会触发异常

                         */

                        that.payment.getPanel(that.panel);

                        that.payment.checkBadPaymentNoCode(data, that.requiredData, 4, '打赏', function () {

                            that.voteErrorTip($('#voteWrap'), '打赏失败！', data.msg);

                        });

                    }

                }

            });

        },

        /**

         * 消费验证码中触发验证按钮

         *

         */

        checkCode: function (e) {

            //点击

            this.payment.goCheckCode(e, this.goCheckCodeOk);

        },



        /**

         * 跳转打赏tab

         * @method goRewardTab

         */

        goRewardTab: function () {

            //获取弹窗切换容器，如果打赏窗口之前渲染过，则直接让其显示即可，否则重新请求余额来渲染打赏弹窗

            var voteWrap = $('#voteWrap');

            var rewardTab = $('.popup-tab a');

            if (this.hasRewardData) {

                rewardTab.eq(2).addClass('act').siblings().removeClass('act');

                voteWrap.find('.popup-content').eq(2).show().siblings('.popup-content').hide();

            } else {

                this.getRewardData(function (that, VoteData, pageJson) {

                    that.renderRewardPopup(that, VoteData, pageJson);

                    rewardTab.eq(2).addClass('act').siblings().removeClass('act');

                    voteWrap.find('.popup-content').eq(2).show().siblings('.popup-content').hide();

                });

            }

        },



        /*

         **点击绑定手机后投票弹窗内的显示进行更新

         * @method showPhoneBindProcess

         */

        showPhoneBindProcess: function () {

            if ($('#monthPopup .limit-wrap').length > 0) {

                $('#monthPopup .limit-wrap').hide();

                $('#monthPopup #bindPhoneProcess').show();

            }

        },



        /*

         **点击月票中出现的完成绑定，重新获取月票信息【若依然显示绑定手机的提示，则说明用户在绑定之前点击了完成绑定】

         * @method bindComplete

         */

        bindComplete: function () {

            this.hasMonthData = false;

            this.showMonthPopup();

        },





        /**

         * 关闭当前panel弹窗

         * @method closeCurrentPanel

         */

        closeCurrentPanel: function () {

            var that = this;

            that.panel.close();

            if (this.hasRecData) {

                this.hasRecData = false;

            }

            if (this.hasMonthData) {

                this.hasMonthData = false;

            }

            if (this.hasRewardData) {

                this.hasRewardData = false;

            }

        },



        /**

         * 重置弹窗内容，同时重置投票互动各请求标识

         * @method setPanelContent

         */

        closePanel: function () {

            this.panel.close();

            this.resetSigns();

        },



        /*

         **点击打赏中出现的完成绑定，则继续显示打赏弹窗【让用户继续尝试打赏】

         * @method continueProcess

         */

        continueProcess: function () {

            var VoteData = {};

            var visibilityObj = {monthVisibility: 'hidden', recVisibility: 'hidden'};

            var showtype = 3;

            //显示投票互动弹窗【此时各tab页内容都已初始化，必须重新获取数据才能正常显示】

            this.loadVotePanel(this, VoteData, showtype, visibilityObj);

            //重置显示各个tab的标识

            this.resetSigns();

            //获取打赏余额

            this.getRewardData(this.showVote);

        },



        /*

         **刷新去获取

         * @method retryReward

         */

        retryReward: function () {

            this.payment.checkBeforeQuick(amount, this.balance, '打赏', 4);

        }

    })

});

