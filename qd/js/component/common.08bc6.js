/**
 * Created by renjiale on 2016-6-27.
 */
/**
 * @fileOverview
 * @author  renjiale
 * Created: 2016-6-27
 */
LBF.define('qd/js/component/common.08bc6.js', function (require, exports, module) {
    var
        Node = require('ui.Nodes.Node'),
        BrowserSupport = require('qd/js/component/browserSupport.1ad6c.js'),
        Login = require('qd/js/component/login.a4de6.js'),
        report = require('qidian.report'),
        Cookie = require('util.Cookie');


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
        events: {},
        /**
         * Nodes default UI element，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {},

        /**
         * Render node
         * Most node needs overwritten this method for own logic
         * @method render
         * @chainable
         */
        render: function () {
            var that = this;
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

            //环境变量
            var env = g_data.envType == 'pro' ? '' : g_data.envType;

            //判断是主站还是女生网，并不是所有页面后台都会传data.bookInfo.bookType，所以需要做容错，默认是主站 === 0 是女生网
            if (typeof (g_data.isWebSiteType) === 'undefined' || g_data.isWebSiteType === 1) {
                //非线上环境方便调试查看
                if (env != '') {
                    if (typeof (g_data.isWebSiteType) === 'undefined') {
                        console.log('目前是' + env + '环境，站点类型变量是' + g_data.isWebSiteType + '，后台没有给bookType值，目前是男生网主站')
                    }
                    if (g_data.isWebSiteType === 1) {
                        console.log('目前是' + env + '环境，站点类型变量是' + g_data.isWebSiteType + '，后台给了bookType值，目前是男生网主站')
                    }
                }
                //主站上报参数siteId
                report.init({
                    isQD: true,
                    cname: 'QDpclog'
                });
            } else if (g_data.isWebSiteType === 0) {
                //女生站上报参数siteId
                //非线上环境方便调试查看
                if (env != '') {
                    console.log('目前是' + env + '环境，站点类型变量是女生网，变量值是' + g_data.isWebSiteType)
                }
                report.init({
                    isQD: true,
                    cname: 'QDmmlog'
                });
            }


            // 检查是否进行过简繁体转换
            this.checkLang();

            //页面DOM loaded完毕后执行的逻辑
            this.pageLoaded();


            // 更新提交建议链接
            $.ajax({
                url: '/ajax/Help/getCode'
            }).done(function (data) {
                if (data.code === 0) {
                    $('.footer .advice').prop('href', 'http://123.206.70.240/online/?cid=0&uid=10&code=' + data.data);
                }
            });
        },
        /**
         * 页面DOM loaded完毕后执行的逻辑
         * @method pageLoaded
         */
        pageLoaded: function () {
            //给html加上class后，所有锚点有过渡效果
            $('html').addClass('loaded');
        },
        /*
         **@method createSender 所有页面通用请求
         */
        createSender: function (url) {
            var img = new Image();
            img.onload = img.onerror = function () {
                img = null;
            };
            img.src = url;
        },
        /**
         * 检查是否进行过简繁体转换
         * @method checkLang
         */
        checkLang: function () {
            //如果页面get不到lang或者lang是zht 繁体的话，异步请求繁体字体和转换js，把html转换成繁体
            if (Cookie.get('lang') == 'zht') {
                require.async('qd/css/tradition_font.59b13.css');
                require.async('qd/js/component/chinese.cafe9.js', function (S2TChinese) {
                    $('#switchEl').html('简体版');
                    //所有需要变字体的使用js重置（后加载的也会生效）
                    $('.lang').css('fontFamily', 'T_FZZCYSK');
                    S2TChinese.trans2Tradition('html');
                });
            }
        }
    })
});
