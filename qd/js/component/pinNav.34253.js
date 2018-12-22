/**
 * @fileOverview
 * @author yangye
 * Created: 16-04-13
 */
LBF.define('qd/js/component/pinNav.34253.js', function (require, exports, module) {
    var
        Node = require('ui.Nodes.Node');

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
        elements: {
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

            // 导航交互：固定、显示隐藏
            this.pinTopNav();

        },
        /**
         * 处理导航交互：固定、显示隐藏
         * @methed pinTopNav
         */
        pinTopNav: function () {
            var that = this;
            var PinNav = $('#pin-nav');
            var PinSearch = $('#pin-search');
            var PinInput = $('#pin-input');

            //滚动事件显示固定导航
            $(window).scroll(function () {
                that.showPinNav();
            });

            //页面刷新后再次判断显示顶部导航
            that.showPinNav();

            //固定滚动条hover事件
            var pinTimer = null;
            PinNav.on('mouseenter', '.site-nav li, li.sign-in', function () {
                $('#pin-nav').find('li').removeClass('act');
                $(this).addClass('act');
            });
            PinNav.on('mouseleave', 'li', function () {
                $(this).removeClass('act');
            });

            PinSearch.mouseenter(function () {
                //延时触发
                //pinTimer = setTimeout(function () {
                //    if (PinInput.hasClass('hide')) {
                //        PinInput.animate({width: '150px', opacity: '1'}, 'fast').removeClass('hide');
                //    }
                //}, 200);
            }).click(function () {
                if (PinInput.val() == '') {
                    PinInput.val(PinInput.attr('placeholder'))
                }
                //判断域名是否是搜索页，是的话当前页面搜索，否则跳转带值跳搜索页
                if (g_data.domainSearch == location.hostname) {
                    location.href = '//' + g_data.domainSearch + '?kw=' + encodeURIComponent(PinInput.val());
                }
                return true;
            })
            //    .mouseleave(function () {
            //    清除定时器
            //    clearTimeout(pinTimer);
            //});

            // 支持enter键搜索
            PinInput.on('keydown', function (evt) {
                if (evt.keyCode == 13) {
                    //判断值是否是空，是空去取placeholder值后带着值传给搜索页
                    if (PinInput.val() == '') {
                        PinInput.val(PinInput.attr('placeholder'))
                    }
                    //判断域名是否是搜索页，是的话当前页面搜索，否则跳转带值跳搜索页
                    if (g_data.domainSearch == location.hostname) {
                        location.href = '//' + g_data.domainSearch + '?kw=' + encodeURIComponent(PinInput.val());
                    }
                }
            });

            //简单搜索失去焦点时滑动隐藏
            //$(document).on("click", function (e) {
            //    var target = $(e.target);
            //    if (target.closest('#pin-input, #pin-search').length == 0) {
            //        PinInput.stop().animate({width: "40px", opacity: '0'}, 'fast').addClass('hide');
            //    }
            //});
        },
        /**
         * 判断滚动条位置显示固定导航
         * @method showPinNav
         */
        showPinNav: function () {
            var that = this;
            var PinNav = $('#pin-nav');
            if ($(window).scrollTop() > 500) {
                PinNav.addClass('show');
            } else {
                PinNav.removeClass('show');
            }
        }
    });
});
