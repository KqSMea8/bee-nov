/**

 * @fileOverview

 * @author yangye & rainszhang

 * Created: 16-03-14

 */

LBF.define('qd/js/component/login.a4de6.js', function (require, exports, module) {

    var

        Cookie = require('util.Cookie'),

        JSON = require('lang.JSON'),

        QLogin = require('common.login.qidian');



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



