/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-10-27 下午4:27
 */

/**
 * UI Components
 * @main ui
 * @module ui
 */

/**
 * Single node components
 * @module ui
 * @submodule ui-Nodes
 */

LBF.define('ui.Nodes.Node', function(require){
    var each = require('lang.each'),
        defaults = require('util.defaults'),
        extend = require('lang.extend'),
        proxy = require('lang.proxy'),
        Inject = require('lang.Inject'),
        template = require('util.template'),
        Attributes = require('util.Attribute'),
        trim = require('lang.trim'),
        isString = require('lang.isString'),
        jQuery = require('lib.jQuery'),
        Class = require('lang.Class');

    var PLUGINS = '_PLUGINS';

    var methods = {},
        fn = jQuery.fn;

	// this.method = this.$el.method
    // bind jQuery fn into Node, we can consider a ui Nodes is a dom element
    for(var methodName in fn){
        if(fn.hasOwnProperty(methodName)){
            (function(methodName){
                methods[methodName] = function(){
                    if(!this.$el){
                        this.setElement('<div></div>');
                    }

                    var result = this.$el[methodName].apply(this.$el, arguments);
                    return this.$el === result ? this : result;
                }
            })(methodName);
        }
    }

    delete methods.constructor;

    /**
     * All ui components' base. All jQuery methods and template engine are mixed in.
     * @class Node
     * @namespace ui.Nodes
     * @extends lang.Class
     * @uses lib.jQuery
     * @uses util.Attributes
     * @uses lang.Inject
     * @constructor
     * @param {String|jQuery|documentElement|ui.Nodes.Node} selector Node selector
     * @example
     *      new Node('#someElement'); // Turn element, which id is 'someElement', into a node
     *
     * @example
     *      // jQuery object or Node object or document element object are all acceptable
     *      new Node($('#someElement'));
     *      new Node(new Node('#someElement'));
     *      new Node(document.getElementById('someElement'));
     */
    return Class.inherit(methods, Attributes, Inject, {
        initialize: function(opts){

			//merge options
            this.mergeOptions(opts);

			//render structure
            this.render();

            /**
             * Fire when node initialized
             * @event load
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             */
            this.trigger('load', [this]);
        },

        /**
         * @method $
         * @uses lib.jQuery
         */
        $: jQuery,

        /**
         * @method jQuery
         * @uses lib.jQuery
         */
        jQuery: jQuery,

        /**
         * @method template
         * @uses util.template
         */
        template: template,

        // todo
        // copy static property settings when inheriting

        /**
         * Merge options with defaults and cache to node.opts
         * @method mergeOptions
         * @param {Object} opts Options to be merged
         * @protected
         * @chainable
         * @example
         *      node.mergeOptions({
         *          //options
         *      });
         */
        mergeOptions: function(opts){
            var data = {};

            // selector mode，merge element's data-params, if there's settings's value, options will be covered by settings's value
            // for example <span class="lbf-button" data-size="small"></span>
            opts && opts.selector && function(){
                data = this.jQuery(opts.selector).data();
            }();

            opts && opts.trigger && function(){
                data = this.jQuery(opts.trigger).data();
            }();

            // merge data & this.constructor.settings
            var options = extend(true, {}, this.constructor.settings, data);

            // use this.defaults before fall back to constructor.settings
            // which enables default settings to be inherited
            options = defaults( true, opts || (opts = {}), this.defaults || options);

            // set to attributes, keep silent to avoid firing change event
            this.set(options, { silence: true });

            return this;
        },

        /**
         * Render node
         * Most node needs overwritten this method for own logic
         * @method render
         * @chainable
         */
        render: function(){
            this.setElement(this.get('selector'));
            return this;
        },

        /**
         * Set node's $el. $el is the base of a node ( UI component )
         * Cautious: direct change of node.$el may be dangerous
         * @method setElement
         * @param {String|documentElement|jQuery|Node} el The element to be core $el of the node
         * @chainable
         */
        setElement: function(el){
            var $el = this.jQuery(el.node || el);

            if(this.$el){
                this.$el.replaceWith($el);
            }

            this.$el = $el;
            this.el = $el.get(0);

            // customize className
            if(this.get('className')) {
                this.$el.addClass(this.get('className'));
            };

            // Initialization of common elements for the component
            this.initElements();

            // Component default events
            this.delegateEvents();

            // Instance events
            this.initEvents();

            // Component's default actions, should be placed after initElements
            this.defaultActions();

            return this;
        },

        /**
         * Delegate events to node
         * @method delegateEvents
         * @param {Object} [events=this.events] Events to be delegated
         * @chainable
         * @example
         *      node.delegateEvents({
         *          'click .child': function(){
         *              alert('child clicked');
         *          }
         *      });
         */
        delegateEvents: function(events){
            events = events || this.events;
            if(!events){
                return this;
            }

            // delegate events
            var node = this;
            each(events, function(delegate, handler){
                var args = (delegate + '').split(' '),
                    eventType = args.shift(),
                    selector = args.join(' ');

                if(trim(selector).length > 0){
                    // has selector
                    // use delegate
                    node.delegate(selector, eventType, function(){
                        return node[handler].apply(node, arguments);
                    });

                    return;
                }

                node.bind(eventType, function(){
                    return node[handler].apply(node, arguments);
                });
            });

            return this;
        },

        /**
         * All default actions bound to node's $el
         * @method defaultActions
         * @protected
         */
        defaultActions: function(){

        },

        /**
         * Bind options.events
         * @method initEvents
         * @param {Object} [delegate=this] Object to be apply as this in callback
         * @chainable
         * @protected
         */
        initEvents: function(delegate){
            var node = this,
                events = this.get('events');

            if(!events){
                return this;
            }

            delegate = delegate || node;
            for(var eventName in events){
                if(events.hasOwnProperty(eventName)){
                    node.bind(eventName, proxy(events[eventName], delegate));
                }
            }

            return this;
        },

        /**
         * Find this.elements, wrap them with jQuery and cache to this, like this.$name
         * @method initElements
         * @chainable
         * @protected
         */
        initElements: function(){
            var elements = this.elements;

            if(elements){
                for(var name in elements){
                    if(elements.hasOwnProperty(name)){
                        this[name] = this.find(elements[name]);
                    }
                }
            }

            return this;
        },

        /**
         * Init plugins in initialization options
         * @chainable
         * @protected
         */
        initPlugins: function(){
            var plugins = this.get('plugins'),
                plugin;

            if(plugins){
                for(var i= 0, len= plugins.length; i< len; i++){
                    plugin = plugins[i];
                    this.plug(plugin.plugin, plugin.options);
                }
            }

            return this;
        },

        /**
         * Node element's property getter and setter
         * @method prop
         * @param {String} name Property name
         * @param [value] Property value, if you are using getter mode, leave it blank
         */
        prop: function(name, value){
            return typeof value === 'undefined' ? this.getProp(name) : this.setProp(name, value);
        },

        /**
         * Node element's property setter
         * @param {String} name Property name
         * @param value Property value
         * @chainable
         */
        setProp: function(name, value){
            this.$el.prop(name, value);
            return this;
        },

        /**
         * Node element's property getter
         * @param {String} name Property name
         * @returns {*} Property value
         */
        getProp: function(name){
            return this.$el.prop(name);
        },

        /**
         * Event trigger
         * @method trigger
         * @param {String} type Event type
         * @param {jQuery.Event} [event] Original event
         * @param {Object} [data] Additional data as arguments for event handlers
         * @returns {Boolean} Prevent default actions or not
         */
//        trigger: function( type, data, event ) {
//            var prop, orig;
//
//            data = data || {};
//            event = this.jQuery.Event( event );
//            event.type = type.toLowerCase();
//            // the original event may come from any element
//            // so we need to reset the target on the new event
//            this.$el && (event.target = this.$el[ 0 ]);
//
//            // copy original event properties over to the new event
//            orig = event.originalEvent;
//            if ( orig ) {
//                for ( prop in orig ) {
//                    if ( !( prop in event ) ) {
//                        event[ prop ] = orig[ prop ];
//                    }
//                }
//            }
//
//            this.$el.trigger( event, data );
//            return !event.isDefaultPrevented();
//        },

        /**
         * Plug a plugin to node
         * @method plug
         * @param {Plugin} Plugin Plugin class, not instance of Plugin
         * @param {Object} opts Options for plugin
         * @param {String} opts.ns Namespace of Plugin
         * @chainable
         * @example
         *      node.plug(Drag);
         *
         * @example
         *      node.plug(Drag, {
         *          //plugin options
         *          handler: '.handler',
         *          proxy: true
         *      });
         */
        plug: function(Plugin, opts){
            var plugin = new Plugin(this, opts || {});
            !this[PLUGINS] && (this[PLUGINS] = {});
            this[PLUGINS][Plugin.ns] = plugin;
            return this;
        },

        /**
         * Unplug a plugin
         * @method unplug
         * @param {String|Object} ns Namespace of Plugin or Plugin object
         * @chainable
         * @example
         *      node.unplug('Drag'); || node.unplug(Drag);
         */
        unplug: function(ns){
            if(isString(ns)){
                if(this[PLUGINS][ns]){
                    this[PLUGINS][ns].unplug();
                    this[PLUGINS][ns] = null;
                }
            }else{
                this[PLUGINS][ns.ns] && this[PLUGINS][ns.ns].unplug();
            }
            return this;
        },

        /**
         * Remove node and unplug all plugins. 'unload' event will be triggered.
         * @method remove
         * @chainable
         */
        remove: function(){
            // trigger before node is removed
            // otherwise, event bound will be remove before trigger
            /**
             * Fire when node removed
             * @event unload
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             */
            this.trigger('unload', [this]);

            this.$el.remove();

            var plugins = this[PLUGINS];
            if(plugins){
                each(plugins, function(){
                    this.unplug();
                });
            }

            return this;
        }
    });
});
/**
 * @fileOverview
 * @author rainszhang
 * Created: 16-03-18
 */
LBF.define('qd/js/component/ajaxSetting.84b88.js', function (require, exports, module) {
    var JSON = require('lang.JSON');
    var Cookie = require('util.Cookie');

    (function(){
        $.ajaxSetup({
            data: {
                "_csrfToken": Cookie.get('_csrfToken') || ''
            },
            dataType: 'json',
            dataFilter: function(data, type){
                var data = data;
                // 简体转繁体的逻辑在底层实现掉，如果是繁体
                if(Cookie.get('lang') == 'zht'){
                    var str = JSON.stringify(data);

                    require.async('qd/js/component/chinese.cafe9.js', function (S2TChinese) {
                        str = S2TChinese.s2tString(str);
                    });

                    data = JSON.parse(str) || data;
                }

                return data;
            },
            statusCode: {
                401: function () {
                    //此处Login为Window下的全局属性,如果Login找不到则说明该页面未引用
                    Login && Login.showLoginPopup && Login.showLoginPopup();
                }
            }
            /*
            error: function(){
                new LightTip({
                    content: '服务器发生异常，请重试'
                }).error();
            }
            */
        });
    })();
});
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
}));/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 13-3-28 下午8:14
 */
LBF.define('ui.Nodes.Pagination', function(require){
    var isNumber = require('lang.isNumber'),
        extend = require('lang.extend'),
        Node = require('ui.Nodes.Node');

    /**
     * Extensive pagination with plenty options, events and flexible template
     * @class Pagination
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {String|jQuery|documentElement} [opts.container] Container of node
     * @param {Number} [opts.total=opts.endPage - opts.startPage + 1] Total page count
     * @param {Number} [opts.maxDisplay=opts.total] Max num of pages to be displayed
     * @param {Number} [opts.page] Current page
     * @param {Number} [opts.startPage] Start of available pages. Caution: available pages is sub set of all pages.
     * @param {Number} [opts.endPage] End of available pages. Caution: available pages is sub set of all pages.
     * @param {Object} [opts.events] Events to be bound to the node
     * @param {Function} [opts.events.change] Callback when attribute changed
     * @param {Function} [opts.events.]
     * @param {String} [opts.ellipsis='...'] Ellipsis string ( chars for replacing large page range)
     * @param {String} [opts.pageTemplate] Template for pagination. Caution: options are complex and no easy replacement.
     * @example
     *      new Pagination({
     *          container: 'someContainerSelector',
     *          page: 2,
     *          startPage: 1,
     *          endPage: 10
     *      });
     *
     * @example
     *      new Pagination({
     *          container: 'someContainerSelector',
     *          page: 2,
     *          startPage: 1,
     *          endPage: 10,
     *          headDisplay: 2,
     *          tailDisplay: 2,
     *          maxDisplay: 3,
     *          prevText: '&lt;上页',
     *          nextText: '下页&gt;',
     *          ellipsis: '--',
     *          events: {
     *              change: function(e, options){
     *                  alert('changed');
     *              }
     *          }
     *      });
     */
    var Pagination = Node.inherit({
        /**
         * Widget default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'click .lbf-pagination-first': 'firstPage',
            'click .lbf-pagination-prev': 'prePage',
            'click .lbf-pagination-next': 'nextPage',
            'click .lbf-pagination-last': 'lastPage',
            'keypress .lbf-pagination-input': 'jumpBykeyboard',
            'click .lbf-pagination-input': 'focusInput',
            'click .lbf-pagination-go': 'jump',
            'click .lbf-pagination-page': 'page'
        },

        /**
         * Overwritten mergeOptions method
         * @method mergeOptions
         * @chainable
         */
        mergeOptions: function(opts){
            this.superclass.prototype.mergeOptions.apply(this, arguments);

            if(!this.get('total')){
                this.set('total', this.get('endPage') - this.get('startPage') + 1);
            }
            if(!this.get('maxDisplay') && this.get('maxDisplay') !== 0){
                this.set('maxDisplay', this.get('total'));
            }
            this.set('isInit', true);

            return this;
        },

        /**
         * Render pagination and append it to it's container if assigned
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            if(!this.get('isInit')){
                return this;
            }

            var selector = this.get('selector');
            var container =this.get('container');

            this.pageTemplate = this.template(this.get('pageTemplate'));
            var html = this.pageTemplate(extend({
                Math: Math
            }, this.attributes()));

            this.setElement(html);

            if(selector && this.$(selector).is('.lbf-pagination')){
                this.$(selector).replaceWith( this.$el );
            }else{
                this.$el.appendTo(container);
            }

            return this;
        },

        /**
         * Overwritten setElement method to bind default validator and event action before setting up attributes
         */
        setElement: function(){
            this.superclass.prototype.setElement.apply(this, arguments);

            this.defaultValidate();

            return this;
        },

        /**
         *  Default validate for attribute
         *  @protected
         *  @chainable
         */
        defaultValidate: function(){
            this.addValidate(function(attrs){
                var page = attrs.page;

                if(!isNumber(page)){
                    this.trigger && this.trigger('error', [new TypeError('Pagination: page number should be numeric')]);
                    return false;
                }

                if(attrs.startPage > page || attrs.endPage < page){
                    return false;
                }
            });

            return this;
        },

        /**
         * Default option change actions
         * @protected
         * @chainable
         */
        defaultActions: function(){
            var node = this;

            this
                .bind('change:page', function(){
                    node.render();
                })
                .bind('change:startPage', function(event, value){
                    if(value > node.get('page')){
                        node.set('page', value);
                    }
                    node.render();
                })
                .bind('change:endPage', function(event, value){
                    if(value < node.get('page')){
                        node.set('page', value);
                    }
                    node.render();
                })
                .bind('change:pageTemplate', function(){
                    node.pageTemplate = node.template(node.get('pageTemplate'));
                })
                .bind('change:container', function(){
                    node.appendTo(node.get('container'));
                });

            return this;
        },

        /**
         * Page redirection
         * @method page
         * @param {Number} page Target page
         * @chainable
         */
        page: function(page){
            if(page && page.currentTarget){
                page = this.$(page.currentTarget).data('page');
            }

            this.set('page', page);

            return this;
        },

        /**
         * Jump to page
         * @method jump
         * @param {Object} events object
         */
        jump: function(e){
            var $input = this.$el.find('.lbf-pagination-input'),
                page = $input.val();

            if(page === ''){
                $input.val('');
                $input.focus();
                return this;
            }

            if(typeof parseInt(page, 10) == 'unefined'){
                $input.val('');
                $input.focus();
                return this;
            }

            page = parseInt(page, 10);

            if(page < this.get('startPage') || page > this.get('endPage')) {
                $input.val('');
                $input.focus();
                return this;
            }

            this.set('page', page);

            return this;
        },

        /**
         * Select the input's value
         * @method focusInput
         * @chainable
         */
        focusInput: function(){
            this.$el.find('.lbf-pagination-input').select();
        },

        /**
         * Bind the keyboard events
         * @method jumpBykeyboard
         * @chainable
         */
        jumpBykeyboard: function(e){
            if(e.keyCode === 13){
                this.jump();
            };
        },

        /**
         * Redirect to first page
         * @method prePage
         * @chainable
         */
        firstPage: function(){
            return this.page(this.get('startPage'));
        },

        /**
         * Redirect to previous page
         * @method prePage
         * @chainable
         */
        prePage: function(){
            return this.page(this.get('page') - 1);
        },

        /**
         * Redirect to next page
         * @method nextPage
         * @chainable
         */
        nextPage: function(){
            return this.page(this.get('page') + 1);
        },

        /**
         * Redirect to last page
         * @method lastPage
         * @chainable
         */
        lastPage: function(){
            return this.page(this.get('endPage'));
        }
    });

    Pagination.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {

            //是否初始化
            isInit: false,

            //是否显示跳转模块
            isShowJump: false,

            //是否显示首页按钮
            isShowFirst: false,

            //是否显示尾页按钮
            isShowLast: false,

            //当前页码，默认从第一页开始展示
            page: 1,

            //起始页码
            startPage: 1,

            //结尾页码
            endPage: 1,

            //头部显示按钮数
            headDisplay: 1,

            //尾部显示按钮数
            tailDisplay: 1,

            //分页分隔符
            ellipsis: '...',

            //默认最大显示分页数，不包括“首页 上一页 下一页 尾页”按钮
            maxDisplay: 5,

            //首页按钮默认文案
            firstText: '首页',

            //上一页按钮默认文案
            prevText: '&lt;&lt;',

            //下一页按钮默认文案
            nextText: '&gt;&gt;',

            //尾页按钮默认文案
            lastText: '尾页',

            //默认结构模板
            pageTemplate: [
                '<% var ahead = Math.min(Math.round((maxDisplay - 1) / 2), page - 1);%>',
                '<% var after = Math.min(maxDisplay - 1 - ahead, total - page);%>',
                '<% ahead = Math.max(ahead, maxDisplay - 1 - after)%>',
                '<div class="lbf-pagination">',
					'<ul class="lbf-pagination-item-list">',

						//is show first button
                        '<% if(isShowFirst) { %>',
                            '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-first <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==firstText%></a></li>',
                        '<% } %>',

						//prev button
						'<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-prev <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==prevText%></a></li>',

						//headDisplay
						'<% for(var i=1; i<=headDisplay && i<=total; i++){ %>',
							'<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a></li>',
						'<% } %>',

						//prev ellipsis
						'<% if(page - ahead > i && maxDisplay > 0) { %>',
								'<li class="lbf-pagination-item"><span class="lbf-pagination-ellipsis"><%==ellipsis%></span></li>',
						'<% } %>',

						//all pages
						'<% for(i = Math.max(page - ahead, i); i < page + after + 1 && i <= total && maxDisplay > 0; i++){ %>',
							'<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a></li>',
						'<% } %>',

						//next ellipsis
						'<% if(page + after < total - tailDisplay && maxDisplay > 0) { %>',
							'<li class="lbf-pagination-item"><span class="lbf-pagination-ellipsis"><%==ellipsis%></span></li>',
						'<% } %>',

						//tailDisplay
						'<% for(i = Math.max(total - tailDisplay + 1, i); i<=total; i++){ %>',
							'<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a>',
						'<% } %>',

						//next button
						'<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-next <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==nextText%></a></li>',

						//is show last button
                        '<% if(isShowLast) { %>',
                            '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-last <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==lastText%></a></li>',
                        '<% } %>',
                    '</ul>',

					//isShowJump
                    '<% if(isShowJump) { %>',
                        '<div class="lbf-pagination-jump"><input type="text" class="lbf-pagination-input" value="<%==page%>" /><a href="javascript:;" class="lbf-pagination-go">GO</a></div>',
                    '<% } %>',
				'</div>'
            ].join('')
        }
    });

    return Pagination;
});
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
/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 16-2-26 上午10:04
 */
LBF.define('ui.widget.Switchable.Switchable', function (require, exports, module) {
    var jQuery = $ = require('lib.jQuery');
    var Node = require('ui.Nodes.Node');
    var isAnimation = typeof history.pushState == "function";

    var Switchable = Node.inherit({
        /**
         * Render pagination and append it to it's container if assigned
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var selector = $(this.get('selector'));
            var options = this.attributes();

            this.pro(selector, options);
        },

        /**
         * get eelative element
         * @method getRelative
         * @protected
         */
        _getRelative: function (trigger, params) {
            trigger = $(trigger);

            // 没有数据源，回家带孩子
            if (trigger.length == 0) return $();

            // 元素数组
            var arrTarget = [], isMoreToOne = false;
            trigger.each(function (index, element) {
                var selector = $(this).attr(params.attribute) || ($(this).attr("href") || "").split("#")[1];
                if (selector && arrTarget[selector] != true) {
                    var target = $();
                    if (/^\w+$/.test(selector)) {
                        target = $("#" + selector);
                        // 如果属性值作为id没有对应元素，就作为类名选择器使用
                        if (target.length === 0) {
                            target = $("." + selector);
                        }
                        // 如果类名选择器也没有对应的元素，作为选择器使用
                        if (target.length === 0) {
                            target = $(selector);
                        }
                    } else {
                        // 纯选择器
                        target = $(selector);
                    }

                    target.each(function (index, element) {
                        arrTarget.push(element);
                    });

                    // 设置标志量，避免重复
                    arrTarget[selector] = true;
                } else if (arrTarget[selector] == true) {
                    isMoreToOne = true;
                }
            });

            // 顺便判断下是否是多对一的关系
            trigger.data("isMoreToOne", isMoreToOne);

            // selector name 不能包含横线啊 - ，亲，害死人

            return $(arrTarget);
        },

        _transition: function (target, duration, isReset) {
            var transform = "transform " + duration + "ms linear";
            if (isAnimation == false) return;
            // CSS3 transition设置
            if (isReset == true) {
                target.css("webkitTransition", "none").css("transition", "none")
                    .data("hasTransition", false);
            } else if (!target.data("hasTransition")) {
                target.css({
                    webkitTransition: "-webkit-" + transform,
                    webkitBackfaceVisibility: "hidden",
                    transition: transform,
                    BackfaceVisibility: "hidden"
                }).data("hasTransition", true);
            }
        },

        _translate: function (target, key, value) {
            // 偏移值设置
            var valueTransform = "translate" + key + "(" + value + ")";
            isAnimation ?
                target.css("webkitTransform", valueTransform).css("transform", valueTransform) :
                target.css(key == "X" ? {left: value} : {top: value});
        },

        _animation: function (targetHide, targetShow, params) {
            var container = null, that = this, noAnimate = params.animation == "none";

            // 动画相关的几个小方法
            var funTransform = function (target, key, value) {
                // 如果value是纯数值
                if (parseInt(value) === value) value += "px";
                // IE10+等现代浏览器
                if (isAnimation) {
                    // CSS3驱动动画
                    that._transition(target, params.duration, noAnimate);
                    // 动画触发等
                    that._translate(target, key, value);
                    // console.log(value);
                } else {
                    // IE6-IE9这些老弱病残
                    // left/top
                    target[noAnimate ? "css" : "animate"](key == "X" ? {
                        left: value
                    } : {
                        top: value
                    }, params.duration);
                }
            };

            // 以下方法旨在解决动画进行中仍然可以点击的问题
            if (params.duration && params.animation != "none") {
                params.isAnimating = true;
                // 为了简便，不走回调，直接定时器还原点击
                var durationObj = {
                    "slow": 200,
                    "normal": 400,
                    "fast": 600
                }, durationMs = durationObj[params.duration] || params.duration;

                if (params.direction == "sync") {
                    if (targetHide && targetShow) {
                        durationMs = 800;
                    } else if (targetHide || targetShow) {
                        durationMs = 400;
                    } else {
                        durationMs = 0;
                    }
                }

                setTimeout(function () {
                    params.isAnimating = false;
                }, durationMs);
            }

            // 因为是万能切换，显然情况就比较复杂
            // 可以是列表元素动画，也可以是容器元素动画
            // 容器元素动画又分为两种，scroll和transform(IE6-9 left/top代替)，自动判断
            // 列表元素动画也有几种，transform, fade, 和slide(toggle模式下专用)
            // 根据是否有target这个参数，决定是容器动画还是列表动画
            // 为了智能，容器动画根据一定的机制自动判断动画类型，这在Carousel模式下很有用
            // 智能判断的条件是：params.animation == "auto"
            // 动画的终点值与动画类型相关
            // 列表元素动画使用百分比，是定制无需关心
            // 容器元素动画的最终位置通过"data-position"存储访问
            if ((targetShow && targetShow.length) || (targetHide && targetHide.length)) {
                // 列表动画
                // 一般用在选项卡，手风琴效果
                // 有一些限制规则：
                // 1. 如果是多选模式，即一次可以有多个面板展开（手风琴效果），不支持transform移动动画
                //    因此，此时，无动画显示
                if (params.toggle == true && params.animation == "translate") {
                    params.animation = "none";
                }

                switch (params.animation) {
                    case "translate":
                    {
                        // 移动
                        // 比较前后移动元素的索引大小确定前后位置，
                        // 用来决定移动的方向
                        var indexHide = targetHide.data("index"),
                            indexShow = targetShow.data("index");

                        var objDirection = {
                            "vertical": "Y",
                            "horizontal": "X"
                        };

                        if (indexHide != undefined && indexShow != undefined) {
                            // 确定动画起点或终点位置是正的100%还是负的100%
                            var hundred = 100, isNext = true;
                            // 共存在三种切换情况
                            // 1. 定时
                            // 2. 点击选项卡触发
                            // 3. 点击前进后退按钮触发
                            if (params.prevOrNext) {
                                switch (params.prevOrNext.attr("data-type")) {
                                    case "prev":
                                    {
                                        isNext = false;
                                        break;
                                    }
                                    case "next":
                                    {
                                        isNext = true;
                                        break;
                                    }
                                    default:
                                    {
                                        // 这是点击选项卡
                                        // 根据前后的位置确定方向
                                        isNext = indexHide < indexShow;
                                    }
                                }
                            }

                            hundred = (isNext * 2 - 1 ) * 100;

                            // 清除可能的transition
                            // 因为动画的需要元素要改一下起始位置
                            // 由于之前CSS3 transition的设置，这种位置变化会有动画效果，而我们需要的是瞬间移动（用户看不到的那种）
                            that._transition(targetShow.show(), params.duration, true);
                            // 要显示的元素乾坤大挪移到我们希望的位置
                            that._translate(targetShow, objDirection[params.direction], hundred + "%");
                            // 动画触发了，一个移走，一个移入
                            setTimeout(function () {
                                funTransform(targetHide, objDirection[params.direction], -1 * hundred + "%");
                                funTransform(targetShow, objDirection[params.direction], "0%");
                            }, 17);

                            // 清除触发源
                            params.prevOrNext = null;
                        } else {
                            // 索引缺失，直接显示隐藏
                            targetHide.hide();
                            targetShow.show();
                        }

                        break;
                    }
                    case "slide":
                    {
                        // 手风琴slideup/slidedown效果
                        if (params.duration != "sync") {
                            if (targetHide) targetHide.slideUp(params.duration);
                            if (targetShow) targetShow.slideDown(params.duration);
                        } else {
                            if (targetHide) {
                                targetHide.slideUp("normal", function () {
                                    if (targetShow) targetShow.slideDown();
                                });
                            } else if (targetShow) {
                                targetShow.slideDown();
                            }
                        }
                        break;
                    }
                    case  "fade":
                    {
                        // 淡入淡出效果
                        if (params.duration != "sync") {
                            if (targetHide) targetHide.fadeOut(params.duration);
                            if (targetShow) targetShow.fadeIn(params.duration);
                        } else {
                            if (targetHide) {
                                targetHide.fadeOut("normal", function () {
                                    if (targetShow) targetShow.fadeIn();
                                });
                            } else if (targetShow) {
                                targetShow.fadeIn();
                            }
                        }
                        break;
                    }
                    case  "visibility":
                    {
                        // visibility隐藏与显示
                        if (targetHide) targetHide.css("visibility", "hidden");
                        if (targetShow) targetShow.css("visibility", "visible");
                        break;
                    }
                    default:
                    {
                        // "auto", "none" 或其他乱七八糟类型直接display显隐
                        if (targetHide) targetHide.hide();
                        if (targetShow) targetShow.show();
                    }
                }
            } else if (params.container && params.container.length) {
                var position = params.container.data("position");
                container = params.container.get(0);

                // 容器动画
                // 各种模式都可能出现
                // 以下为各种动画类型的条件处理
                if (params.direction == "vertical") {
                    // 根据容器是否存在滚动高度
                    if (container.scrollHeight - container.clientHeight >= Math.max(position.top, 1)) {
                        // scroll模式
                        params.animation == "auto" ?
                            params.container.animate({scrollTop: position.top}) :
                            params.container.scrollTop(position.top);
                    } else {
                        // transform模式
                        funTransform(params.container, "Y", -1 * position.top)
                    }
                } else {
                    // 水平方向
                    if (container.scrollWidth - container.clientWidth >= Math.max(position.left, 1)) {
                        // scroll模式
                        params.animation == "auto" ?
                            params.container.animate({"scrollLeft": position.left}) :
                            params.container.scrollLeft(position.left);
                    } else {
                        // transform模式
                        funTransform(params.container, "X", -1 * position.left)
                    }
                }
            }
        },

        /**
         * powerSwitch.js by zhangxinxu(.com)
         * under MIT License
         * you can use powerSwitch to switch anything
         */
        pro: function (selector, options) {
            var switchable = this;
            // 默认参数
            var defaults = {
                direction: "horizontal",
                eventType: "click",   // 其他可选参数：hover
                classAdd: "",         // 如果没有样式变化，请使用任意类名代替
                classRemove: "",
                classPrefix: "",      // eg. "prefix" → prefix_disabled, prefix_prev, prefix_play, prefix_pause, prefix_next
                attribute: "data-rel",
                animation: "auto",	  // 其他可选值："none|display", "visibility", "translate", "fade", "slide"
                duration: 250,        // 动画持续时间，单位毫秒, 如果使用"sync"则表示同步
                container: null,
                autoTime: 0,          // 自动播放时间
                number: "auto",       // 每次切换的数目
                hoverDelay: 200,
                toggle: false,
                onSwitch: $.noop
            };
            // 最终参数
            var params = $.extend({}, defaults, options || {});

            // 动画是否正在进行
            params.isAnimating = false;

            // 一些全局类名
            $.each(["disabled", "prev", "play", "pause", "next"], function (index, key) {
                key = $.trim(key);
                var upperKey = key.slice(0, 1).toUpperCase() + key.slice(1),
                    paramsKey = "class" + upperKey,
                    lastChar = params.classPrefix.slice(-1);
                if (params[paramsKey] === undefined) {
                    if (params.classPrefix) {
                        // 根据classPrefix中是否含关键字符（下划线或短横线）做判断
                        if (/\-/g.test(params.classPrefix)) {
                            params[paramsKey] = lastChar == "-" ?
                                (params.classPrefix + key) : [params.classPrefix, key].join("-");
                        } else if (/_/g.test(params.classPrefix)) {
                            params[paramsKey] = lastChar == "_" ?
                                (params.classPrefix + key) : [params.classPrefix, key].join("_");
                        } else {
                            // 驼峰-大小写组合
                            params[paramsKey] = params.classPrefix + upperKey;
                        }
                    } else {
                        params[paramsKey] = key;
                    }
                }
            });


            // 一些全局变量 some global variables
            // 选中的触发项 the selected item
            var indexSelected = params.indexSelected || -1,
                numSwitch = parseInt(params.number) || 1,
            // hover延时处理的计时器 the timer for hover delay
                hoverTimer = null,
            // 自动播放的定时器
                autoPlayTimer = null,
            // 切换主体元素们
                eleRelatives = $(),
            // 主体元素的长度
                lenRelatives = 0;


            // 据说搞个变量速度更快~
            var self = $(selector);

            // 无触发源，两种可能性
            // 1. 选择器挂掉了
            // 2. 单纯的自动播放，例如滚动新闻功能
            if (self.length == 0) {
                // 如果是情况1，直接回家
                if (params.container == null || params.autoTime == 0) return self;
            }

            eleRelatives = switchable._getRelative(self, params);

            if ((lenRelatives = eleRelatives.length) == 0) return self;

            // 确定indexSelected
            // 只有当未设定，或者不是toggle模式的时候
            if (indexSelected == -1 && params.toggle == false) {
                if (params.classAdd) {
                    // 通过添加类名确定
                    self.each(function (index, element) {
                        if (indexSelected != -1) return;
                        if ($(element).hasClass(params.classAdd)) indexSelected = index;
                    });
                } else {
                    // 通过关联面板的显隐确定
                    eleRelatives.each(function (index, element) {
                        if (indexSelected != -1) return;
                        if (params.animation == "visibility") {
                            if ($(element).css("visibility") != "hidden") indexSelected = index;
                        } else if ($(element).css("display") != "none") {
                            indexSelected = index;
                        }
                    });
                }
            }

            var isMoreToOne = false, elePrev = $(), eleNext = $(), elePrevOrNext = $();
            var funStatePrevNext = function (indexWill) {
                // 后退按钮的状态
                if (indexWill <= 0) {
                    elePrev.addClass(params.classDisabled).removeAttr("title").attr("disabled", "disabled");
                } else {
                    elePrev.removeClass(params.classDisabled).attr("title", elePrev.data("title")).removeAttr("disabled");
                }
                // 前进按钮的状态
                // 规则如下：
                // (总条目 - indexSelected位置值) / 每次切换的条数 是否大于 1
                if ((lenRelatives - indexWill) / numSwitch > 1) {
                    eleNext.removeClass(params.classDisabled).attr("title", eleNext.data("title")).removeAttr("disabled");
                } else {
                    eleNext.addClass(params.classDisabled).removeAttr("title").attr("disabled", "disabled");
                }
            }
            // 判断是否是多对一的关系
            if (self.eq(0).data("isMoreToOne") == true) {
                isMoreToOne = true;
                // 如果不是无限滚动
                if (params.classDisabled) {
                    elePrev = self.eq(0), eleNext = self.eq(1);
                    elePrev.data("title", elePrev.attr("title"));
                    eleNext.data("title", eleNext.attr("title"));
                    // 初始按钮的状态
                    funStatePrevNext(indexSelected);
                    // 滚动位置
                    if (indexSelected <= 0 && params.container) {
                        $(params.container).scrollLeft(0).scrollTop(0);
                    }
                } else if (params.container) {
                    // 无限滚动
                    // 克隆并载入
                    eleRelatives.clone().insertAfter(eleRelatives.eq(lenRelatives - 1));
                    // 重新确定关联元素们
                    eleRelatives = switchable._getRelative(self, params);
                    // more → one下之前点击的按钮
                    // 用来确定自动播放(如果有)的方向
                    // 默认是next方向
                    elePrevOrNext = self.eq(1);
                } else {
                    // 伪多对1，动画只能是fade或普通显隐
                    elePrev = self.eq(0), eleNext = self.eq(1);
                    elePrevOrNext = eleNext;
                }
            }
            // 判断是否1对多
            var isOneToMore = false;
            if (self.length == 1 && lenRelatives > 1) {
                isOneToMore = true;
            }

            // 切换的核心，所有的切换都要走这一步
            // 面向切换面板元素设计的切换方法
            var funSwitchable = function (indexWill) {
                // 判断是否需要切换
                if (indexWill == indexSelected) {
                    return;
                }
                // 总的切换项目数，每次切换的项目数
                var eleWillRelative = eleRelatives.slice(indexWill, indexWill + numSwitch);
                var eleSelected = null, eleWillSelect = null, eleRelative = null;

                // 如果是toggle切换
                if (params.toggle == false) {
                    // 在多对1模式下，我们关心的是触发按钮的临界状态	（disabled）等
                    // 而不是选中与不选中的样式切换状态
                    if (isMoreToOne == true) {
                        // 偏移元素就是 eleWillRelative
                        if (params.container) {
                            // 获取相对父元素的偏移
                            var position = eleWillRelative.position();
                            // 定位
                            params.container = $(params.container);
                            // 位置存储（动画终点位置）
                            params.container.data("position", position);
                            // 容器动画
                            switchable._animation(null, null, params);
                            // 按钮状态
                            params.classDisabled && funStatePrevNext(indexWill);
                        } else {
                            // 容器动画
                            switchable._animation(eleRelatives.eq(indexSelected, indexSelected + numSwitch), eleWillRelative, params);
                        }

                        // 回调
                        params.onSwitch.call(this, eleWillRelative);
                    } else if (isOneToMore == true) {
                        // 1对多模式
                        // 也存在按钮的临界状态
                        // 只能显示，不能收起
                        // 对应元素的显隐控制
                        switchable._animation(null, eleWillRelative, params);
                        // 回调
                        params.onSwitch.call(this, eleWillRelative);
                    } else if (indexSelected !== indexWill) {
                        // 1 vs 1
                        // 关心按钮选中与不选中的样子
                        eleWillSelect = self.eq(indexWill);
                        if (indexSelected >= 0) {
                            eleSelected = self.eq(indexSelected);
                            eleRelative = eleRelatives.eq(indexSelected, indexSelected + numSwitch);
                        } else {
                            eleSelected = $();
                            eleRelative = $();
                        }

                        // 触发元素的类名状态改变
                        eleWillSelect.addClass(params.classAdd).removeClass(params.classRemove);
                        // 已选元素的改变
                        eleSelected.addClass(params.classRemove).removeClass(params.classAdd);
                        // 对应元素的显隐控制
                        switchable._animation(eleRelative, eleWillRelative, params);
                        // 回调
                        params.onSwitch.call(this, eleWillRelative, eleSelected, eleRelative);

                    }
                    indexSelected = indexWill;
                } else {
                    // 如果多选
                    // 如果只能展开
                    // 能伸能屈
                    if ((params.animation == "visibility" && eleWillRelative.css("visibility") == "hidden") ||
                        (params.animation != "visibility" && eleWillRelative.css("display") == "none")) {
                        // 显示
                        switchable._animation(null, eleWillRelative, params);
                        display = true;
                    } else {
                        switchable._animation(eleWillRelative, null, params);
                        display = false;
                    }
                    // 回调
                    params.onSwitch.call(this, eleWillRelative, display);
                }
            };


            // 遍历 loop
            var anchorSplit = location.href.split("#")[1];

            self.each(function (index, element) {
                // 存储索引
                // 存储title以及index
                $(element).data("index", index);

                if (isMoreToOne == true) {
                    $(element).bind("click", function () {
                        var indexWill, eleWill;
                        if (params.isAnimating == true) return false;
                        if (params.classDisabled) {
                            if ($(this).attr("disabled")) return false;
                            if (index == 0) {
                                indexWill = indexSelected - numSwitch;
                                indexWill = Math.max(0, indexWill);
                            } else if (index == 1) {
                                indexWill = indexSelected + numSwitch;
                                indexWill = Math.min(indexWill, lenRelatives - 1);
                            }
                            funSwitchable.call(this, indexWill);
                        } else if (params.container && lenRelatives > numSwitch) {
                            // 无限滚动
                            if (index == 0) {
                                indexWill = indexSelected - numSwitch;
                                if (indexWill < 0) {
                                    // 瞬间无感重定位
                                    eleWill = eleRelatives.eq(indexSelected + lenRelatives);
                                    $(params.container).data("position", eleWill.position());
                                    switchable._animation(null, null, $.extend({}, params, {animation: "none"}));
                                    indexWill = indexSelected + lenRelatives - numSwitch;
                                }
                            } else if (index == 1) {
                                indexWill = indexSelected + numSwitch;
                                if (indexWill > lenRelatives * 2 - numSwitch) {
                                    // 末位数量不够了
                                    eleWill = eleRelatives.eq(indexSelected - lenRelatives);
                                    $(params.container).data("position", eleWill.position());
                                    switchable._animation(null, null, $.extend({}, params, {animation: "none"}));
                                    // 新的索引位置
                                    indexWill = indexSelected - lenRelatives + numSwitch;
                                }
                            }
                            funSwitchable.call(this, indexWill);
                            elePrevOrNext = $(this);
                        } else {
                            index ? funPlayNext(this) : funPlayPrev(this);
                            elePrevOrNext = $(this);
                        }
                        if (element && element.href) return false;
                    });
                } else if (isOneToMore == true) {
                    $(element).bind("click", function () {
                        var indexWill;
                        // 动画进行，则不能连续执行
                        if (params.isAnimating == true) return false;

                        if (params.number == "auto") {
                            numSwitch = lenRelatives;
                        }
                        if (!$(this).attr("disabled")) {
                            if (indexSelected == -1) {
                                indexWill = 0;
                            } else {
                                indexWill = indexSelected + numSwitch;
                            }

                            funSwitchable.call(this, indexWill);
                            if (indexWill >= lenRelatives - 1) {
                                $(this).addClass(params.classDisabled).attr("disabled", "disabled").removeAttr("title");
                            }
                        }
                        if (element && element.href) return false;
                    });
                } else if (params.eventType == "click") {
                    $(element).bind("click", function () {
                        // 动画进行，则不能连续执行
                        if (params.isAnimating == true) return false;
                        // 设置标志量，根据位置判断方向
                        params.prevOrNext = $(this);
                        // 点击事件 click events
                        funSwitchable.call(this, index);
                        // 如果不是指向自身，或者带有href属性，阻止默认行为
                        if (this.id !== $(this).attr(params.attribute) && (element && element.href)) {
                            return false;
                        }
                    });

                    if (anchorSplit && element.href && anchorSplit == element.href.split("#")[1]) {
                        $(element).trigger("click");
                    }
                } else if (/^hover|mouseover$/.test(params.eventType)) {
                    $(element).hover(function () {
                        if (params.isAnimating == true) return false;
                        params.prevOrNext = $(this);
                        // 鼠标经过 hover events
                        clearTimeout(hoverTimer);
                        hoverTimer = setTimeout(function () {
                            funSwitchable.call(element, index);
                        }, parseInt(params.hoverDelay) || 0);
                    }, function () {
                        // 鼠标移开
                        clearTimeout(hoverTimer);
                    });
                }
            });

            eleRelatives.each(function (index, element) {
                $(element).data("index", index);
            });

            // 自动播放
            var funPlayNext = function (trigger) {
                var indexWill = indexSelected + 1;
                if (indexWill >= lenRelatives) {
                    indexWill = 0;
                }
                funSwitchable.call(trigger || self.get(indexWill), indexWill);
            }, funPlayPrev = function (trigger) {
                var indexWill = indexSelected - 1;
                if (indexWill < 0) {
                    indexWill = lenRelatives - 1;
                }
                funSwitchable.call(trigger || self.get(indexWill), indexWill);
            }, funPlayPrevOrNext = function () {
                elePrevOrNext.trigger("click");
            }, funAutoPlay = function () {
                clearTimeout(autoPlayTimer);
                if (funAutoPlay.flagAutoPlay == true) {
                    autoPlayTimer = setTimeout(function () {
                        isMoreToOne == false ? funPlayNext() : funPlayPrevOrNext();
                        funAutoPlay();
                    }, params.autoTime);
                }
            };


            // 单对单模式，或者无限切换的多对一模式支持自动播放
            if ((isOneToMore == false && params.toggle == false && isMoreToOne == false) || (isMoreToOne == true && !params.classDisabled)) {
                // 创建前进、后退、以及暂停按钮
                if (params.container && isMoreToOne == false) {
                    var htmlTempOperate = '';
                    self.length && $.each(["Prev", "Pause", "Next"], function (index, key) {
                        if (params.autoTime == 0 && key == "Pause") return;
                        // 自动播放模式时候需要
                        htmlTempOperate = htmlTempOperate + '<a href="javascript:" class="' + params["class" + key] + '" data-type="' + key.toLowerCase() + '"></a>';
                    });

                    params.container.append(htmlTempOperate).delegate("a", "click", function () {
                        if (params.isAnimating == true) return false;
                        var type = $(this).attr("data-type"), classType = params["class" + type.slice(0, 1).toUpperCase() + type.slice(1)],
                            indexWill = indexSelected;
                        switch (type) {
                            case "prev":
                            {
                                params.prevOrNext = $(this);
                                funPlayPrev();
                                if (params.autoTime) funAutoPlay();
                                break;
                            }
                            case "play":
                            {
                                funAutoPlay.flagAutoPlay = true;
                                $(this).attr("data-type", "pause").removeClass(classType).addClass(params.classPause);

                                funAutoPlay();
                                break;
                            }
                            case "pause":
                            {
                                funAutoPlay.flagAutoPlay = false;
                                $(this).attr("data-type", "play").removeClass(classType).addClass(params.classPlay);
                                funAutoPlay();
                                break;
                            }
                            case "next":
                            {
                                params.prevOrNext = $(this);
                                funPlayNext();
                                if (params.autoTime) funAutoPlay();
                                break;
                            }
                        }

                        return false;
                    });
                }

                if (params.autoTime) {
                    // 定时播放相关事件绑定
                    // 自定义按钮容器，选项卡，以及切换面板鼠标经过停止自动播放
                    // 如果容器存在，且是包含关系
                    // 只要绑定容器就可以
                    if (params.hoverStop !== false) {
                        var arrHoverPlay = [self, eleRelatives, params.container];
                        if (isMoreToOne == true || (document.body.contains && params.container && params.container.get(0).contains(eleRelatives.get(0)))) {
                            arrHoverPlay = [self, params.container];
                        }
                        $.each(arrHoverPlay, function (index, hoverTarget) {
                            if (hoverTarget) hoverTarget.hover(function (event) {
                                if (event.pageX !== undefined || params.eventType == "click") clearTimeout(autoPlayTimer);
                            }, function (event) {
                                if (event.pageX !== undefined || params.eventType == "click") funAutoPlay();
                            });
                        });
                    }

                    funAutoPlay.flagAutoPlay = true;
                    funAutoPlay();
                }
            }

            return self;
        }
    });

    Switchable.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            direction: "horizontal",
            eventType: "click",   // 其他可选参数：hover
            classAdd: "",         // 如果没有样式变化，请使用任意类名代替
            classRemove: "",
            classPrefix: "",      // eg. "prefix" → prefix_disabled, prefix_prev, prefix_play, prefix_pause, prefix_next
            attribute: "data-rel",
            animation: "auto",	  // 其他可选值："none|display", "visibility", "translate", "fade", "slide"
            duration: 250,        // 动画持续时间，单位毫秒, 如果使用"sync"则表示同步
            container: null,
            autoTime: 0,          // 自动播放时间
            number: "auto",       // 每次切换的数目
            hoverDelay: 200,
            toggle: false,
            onSwitch: $.noop
        }
    });

    return Switchable;
});
/**
 * @fileOverview
 * @author rainszhang
 * @version
 * Created: 16-3-11 上午10:16
 */
LBF.define('util.EJS', function (require, exports) {

    // 未添加view.js  EJS.helper部分方法未添加进去

    var rsplit = function (string, regex) {
            var result = regex.exec(string), retArr = new Array(), first_idx, last_idx, first_bit;
            while (result != null) {
                first_idx = result.index;
                last_idx = regex.lastIndex;
                if ((first_idx) != 0) {
                    first_bit = string.substring(0, first_idx);
                    retArr.push(string.substring(0, first_idx));
                    string = string.slice(first_idx);
                }
                retArr.push(result[0]);
                string = string.slice(result[0].length);
                result = regex.exec(string);
            }
            if (!string == '') {
                retArr.push(string);
            }
            return retArr;
        },
        chop = function (string) {
            return string.substr(0, string.length - 1);
        },
        extend = function (d, s) {
            for (var n in s) {
                if (s.hasOwnProperty(n))  d[n] = s[n]
            }
        }


    EJS = function (options) {
        options = typeof options == "string" ? {view: options} : options
        this.set_options(options);
        if (options.precompiled) {
            this.template = {};
            this.template.process = options.precompiled;
            EJS.update(this.name, this);
            return;
        }
        if (options.element) {
            if (typeof options.element == 'string') {
                var name = options.element
                options.element = document.getElementById(options.element)
                if (options.element == null) throw name + 'does not exist!'
            }
            if (options.element.value) {
                this.text = options.element.value
            } else {
                this.text = options.element.innerHTML
            }
            this.name = options.element.id
            this.type = '['
        } else if (options.url) {
            options.url = EJS.endExt(options.url, this.extMatch);
            this.name = this.name ? this.name : options.url;
            var url = options.url
            //options.view = options.absolute_url || options.view || options.;
            var template = EJS.get(this.name /*url*/, this.cache);
            if (template) return template;
            if (template == EJS.INVALID_PATH) return null;
            try {
                this.text = EJS.request(url + (this.cache ? '' : '?' + Math.random() ));
            } catch (e) {
            }

            if (this.text == null) {
                throw( {type: 'EJS', message: 'There is no template at ' + url}  );
            }
            //this.name = url;
        }
        var template = new EJS.Compiler(this.text, this.type);

        template.compile(options, this.name);


        EJS.update(this.name, this);
        this.template = template;
    };
    /* @Prototype*/
    EJS.prototype = {
        /**
         * Renders an object with extra view helpers attached to the view.
         * @param {Object} object data to be rendered
         * @param {Object} extra_helpers an object with additonal view helpers
         * @return {String} returns the result of the string
         */
        render: function (object, extra_helpers) {
            object = object || {};
            this._extra_helpers = extra_helpers;
            var v = new EJS.Helpers(object, extra_helpers || {});
            return this.template.process.call(object, object, v);
        },
        update: function (element, options) {
            if (typeof element == 'string') {
                element = document.getElementById(element)
            }
            if (options == null) {
                _template = this;
                return function (object) {
                    EJS.prototype.update.call(_template, element, object)
                }
            }
            if (typeof options == 'string') {
                params = {}
                params.url = options
                _template = this;
                params.onComplete = function (request) {
                    var object = eval(request.responseText)
                    EJS.prototype.update.call(_template, element, object)
                }
                EJS.ajax_request(params)
            } else {
                element.innerHTML = this.render(options)
            }
        },
        out: function () {
            return this.template.out;
        },
        /**
         * Sets options on this view to be rendered with.
         * @param {Object} options
         */
        set_options: function (options) {
            this.type = options.type || EJS.type;
            this.cache = options.cache != null ? options.cache : EJS.cache;
            this.text = options.text || null;
            this.name = options.name || null;
            this.ext = options.ext || EJS.ext;
            this.extMatch = new RegExp(this.ext.replace(/\./, '\.'));
        }
    };
    EJS.endExt = function (path, match) {
        if (!path) return null;
        match.lastIndex = 0
        return path + (match.test(path) ? '' : this.ext )
    }


    /* @Static*/
    EJS.Scanner = function (source, left, right) {

        extend(this,
            {
                left_delimiter: left + '%',
                right_delimiter: '%' + right,
                double_left: left + '%%',
                double_right: '%%' + right,
                left_equal: left + '%=',
                left_comment: left + '%#'
            })

        this.SplitRegexp = left == '[' ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : new RegExp('(' + this.double_left + ')|(%%' + this.double_right + ')|(' + this.left_equal + ')|(' + this.left_comment + ')|(' + this.left_delimiter + ')|(' + this.right_delimiter + '\n)|(' + this.right_delimiter + ')|(\n)');

        this.source = source;
        this.stag = null;
        this.lines = 0;
    };

    EJS.Scanner.to_text = function (input) {
        if (input == null || input === undefined)
            return '';
        if (input instanceof Date)
            return input.toDateString();
        if (input.toString)
            return input.toString();
        return '';
    };

    EJS.Scanner.prototype = {
        scan: function (block) {
            scanline = this.scanline;
            regex = this.SplitRegexp;
            if (!this.source == '') {
                var source_split = rsplit(this.source, /\n/);
                for (var i = 0; i < source_split.length; i++) {
                    var item = source_split[i];
                    this.scanline(item, regex, block);
                }
            }
        },
        scanline: function (line, regex, block) {
            this.lines++;
            var line_split = rsplit(line, regex);
            for (var i = 0; i < line_split.length; i++) {
                var token = line_split[i];
                if (token != null) {
                    try {
                        block(token, this);
                    } catch (e) {
                        throw {type: 'EJS.Scanner', line: this.lines};
                    }
                }
            }
        }
    };


    EJS.Buffer = function (pre_cmd, post_cmd) {
        this.line = new Array();
        this.script = "";
        this.pre_cmd = pre_cmd;
        this.post_cmd = post_cmd;
        for (var i = 0; i < this.pre_cmd.length; i++) {
            this.push(pre_cmd[i]);
        }
    };
    EJS.Buffer.prototype = {

        push: function (cmd) {
            this.line.push(cmd);
        },

        cr: function () {
            this.script = this.script + this.line.join('; ');
            this.line = new Array();
            this.script = this.script + "\n";
        },

        close: function () {
            if (this.line.length > 0) {
                for (var i = 0; i < this.post_cmd.length; i++) {
                    this.push(pre_cmd[i]);
                }
                this.script = this.script + this.line.join('; ');
                line = null;
            }
        }

    };


    EJS.Compiler = function (source, left) {
        this.pre_cmd = ['var ___ViewO = [];'];
        this.post_cmd = new Array();
        this.source = ' ';
        if (source != null) {
            if (typeof source == 'string') {
                source = source.replace(/\r\n/g, "\n");
                source = source.replace(/\r/g, "\n");
                this.source = source;
            } else if (source.innerHTML) {
                this.source = source.innerHTML;
            }
            if (typeof this.source != 'string') {
                this.source = "";
            }
        }
        left = left || '<';
        var right = '>';
        switch (left) {
            case '[':
                right = ']';
                break;
            case '<':
                break;
            default:
                throw left + ' is not a supported deliminator';
                break;
        }
        this.scanner = new EJS.Scanner(this.source, left, right);
        this.out = '';
    };
    EJS.Compiler.prototype = {
        compile: function (options, name) {
            options = options || {};
            this.out = '';
            var put_cmd = "___ViewO.push(";
            var insert_cmd = put_cmd;
            var buff = new EJS.Buffer(this.pre_cmd, this.post_cmd);
            var content = '';
            var clean = function (content) {
                content = content.replace(/\\/g, '\\\\');
                content = content.replace(/\n/g, '\\n');
                content = content.replace(/"/g, '\\"');
                return content;
            };
            this.scanner.scan(function (token, scanner) {
                if (scanner.stag == null) {
                    switch (token) {
                        case '\n':
                            content = content + "\n";
                            buff.push(put_cmd + '"' + clean(content) + '");');
                            buff.cr();
                            content = '';
                            break;
                        case scanner.left_delimiter:
                        case scanner.left_equal:
                        case scanner.left_comment:
                            scanner.stag = token;
                            if (content.length > 0) {
                                buff.push(put_cmd + '"' + clean(content) + '")');
                            }
                            content = '';
                            break;
                        case scanner.double_left:
                            content = content + scanner.left_delimiter;
                            break;
                        default:
                            content = content + token;
                            break;
                    }
                }
                else {
                    switch (token) {
                        case scanner.right_delimiter:
                            switch (scanner.stag) {
                                case scanner.left_delimiter:
                                    if (content[content.length - 1] == '\n') {
                                        content = chop(content);
                                        buff.push(content);
                                        buff.cr();
                                    }
                                    else {
                                        buff.push(content);
                                    }
                                    break;
                                case scanner.left_equal:
                                    buff.push(insert_cmd + "(EJS.Scanner.to_text(" + content + ")))");
                                    break;
                            }
                            scanner.stag = null;
                            content = '';
                            break;
                        case scanner.double_right:
                            content = content + scanner.right_delimiter;
                            break;
                        default:
                            content = content + token;
                            break;
                    }
                }
            });
            if (content.length > 0) {
                // Chould be content.dump in Ruby
                buff.push(put_cmd + '"' + clean(content) + '")');
            }
            buff.close();
            this.out = buff.script + ";";
            var to_be_evaled = '/*' + name + '*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {' + this.out + " return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";

            try {
                eval(to_be_evaled);
            } catch (e) {
                if (typeof JSLINT != 'undefined') {
                    JSLINT(this.out);
                    for (var i = 0; i < JSLINT.errors.length; i++) {
                        var error = JSLINT.errors[i];
                        if (error.reason != "Unnecessary semicolon.") {
                            error.line++;
                            var e = new Error();
                            e.lineNumber = error.line;
                            e.message = error.reason;
                            if (options.view)
                                e.fileName = options.view;
                            throw e;
                        }
                    }
                } else {
                    throw e;
                }
            }
        }
    };


//type, cache, folder
    /**
     * Sets default options for all views
     * @param {Object} options Set view with the following options
     * <table class="options">
     <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
     <tr>
     <td>type</td>
     <td>'<'</td>
     <td>type of magic tags.  Options are '&lt;' or '['
     </td>
     </tr>
     <tr>
     <td>cache</td>
     <td>true in production mode, false in other modes</td>
     <td>true to cache template.
     </td>
     </tr>
     </tbody></table>
     *
     */
    EJS.config = function (options) {
        EJS.cache = options.cache != null ? options.cache : EJS.cache;
        EJS.type = options.type != null ? options.type : EJS.type;
        EJS.ext = options.ext != null ? options.ext : EJS.ext;

        var templates_directory = EJS.templates_directory || {}; //nice and private container
        EJS.templates_directory = templates_directory;
        EJS.get = function (path, cache) {
            if (cache == false) return null;
            if (templates_directory[path]) return templates_directory[path];
            return null;
        };

        EJS.update = function (path, template) {
            if (path == null) return;
            templates_directory[path] = template;
        };

        EJS.INVALID_PATH = -1;
    };
    EJS.config({cache: true, type: '<', ext: '.ejs'});


    /**
     * @constructor
     * By adding functions to EJS.Helpers.prototype, those functions will be available in the
     * views.
     * @init Creates a view helper.  This function is called internally.  You should never call it.
     * @param {Object} data The data passed to the view.  Helpers have access to it through this._data
     */
    EJS.Helpers = function (data, extras) {
        this._data = data;
        this._extras = extras;
        extend(this, extras);
    };
    /* @prototype*/
    EJS.Helpers.prototype = {
        /**
         * Renders a new view.  If data is passed in, uses that to render the view.
         * @param {Object} options standard options passed to a new view.
         * @param {optional:Object} data
         * @return {String}
         */
        view: function (options, data, helpers) {
            if (!helpers) helpers = this._extras
            if (!data) data = this._data;
            return new EJS(options).render(data, helpers);
        },
        /**
         * For a given value, tries to create a human representation.
         * @param {Object} input the value being converted.
         * @param {Object} null_text what text should be present if input == null or undefined, defaults to ''
         * @return {String}
         */
        to_text: function (input, null_text) {
            if (input == null || input === undefined) return null_text || '';
            if (input instanceof Date) return input.toDateString();
            if (input.toString) return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
            return '';
        }
    };
    EJS.newRequest = function () {
        var factories = [function () {
            return new ActiveXObject("Msxml2.XMLHTTP");
        }, function () {
            return new XMLHttpRequest();
        }, function () {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }];
        for (var i = 0; i < factories.length; i++) {
            try {
                var request = factories[i]();
                if (request != null)  return request;
            }
            catch (e) {
                continue;
            }
        }
    }

    EJS.request = function (path) {
        var request = new EJS.newRequest()
        request.open("GET", path, false);

        try {
            request.send(null);
        }
        catch (e) {
            return null;
        }

        if (request.status == 404 || request.status == 2 || (request.status == 0 && request.responseText == '')) return null;

        return request.responseText
    }
    EJS.ajax_request = function (params) {
        params.method = ( params.method ? params.method : 'GET')

        var request = new EJS.newRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    params.onComplete(request)
                } else {
                    params.onComplete(request)
                }
            }
        }
        request.open(params.method, params.url)
        request.send(null)
    }

    return EJS;

});/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-13 下午5:35
 */
LBF.define('ui.widget.Panel.Panel', function(require){
    var $ = require('lib.jQuery'),
        forEach = require('lang.forEach'),
        proxy = require('lang.proxy'),
        extend = require('lang.extend'),
        Inject = require('lang.Inject'),
        zIndexGenerator = require('util.zIndexGenerator'),
        Shortcuts = require('util.Shortcuts'),
        Node = require('ui.Nodes.Node'),
        Popup = require('ui.Nodes.Popup'),
        Button = require('ui.Nodes.Button'),
        Drag = require('ui.Plugins.Drag'),
        Overlay = require('ui.Plugins.Overlay');

    require('{theme}/lbfUI/css/Panel.css');

    /**
     * Base panel component
     * @class Panel
     * @namespace ui.widget.Panel
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Popup
     * @uses ui.Plugin.Drag
     * @uses ui.Plugin.Overlay
     * @constructor
     * @param {Object} opts Options of node
     * @param {String|jQuery|documentElement} [opts.container='body'] Panel's container
     * @param {String|jQuery|documentElement} [opts.title] Title text
     * @param {String|jQuery|documentElement} [opts.content] Panel's content
     * @param {Object[]} [opts.buttons] Panel button options, each one in array for a button.
     * @param {Object} [opts.events] Events to be bound to panel
     * @param {Object} [opts.events.close] Event when click close button
     * @param {Boolean|Object} [opts.modal=false] Whether to use modal(overlay/mask), and modal opts can be assigned to this option
     * @param {Boolean|Object} [opts.drag=false] Whether to make panel draggable, and drag opts can be assigned to this option
     * @param {Number} [opts.zIndex] The zIndex value of node
     * @param {Boolean} [opts.centered=false] If set node to be centered to it's container
     * @param {String} [opts.wrapTemplate] Node's wrapTemplate
     * @param {Boolean} [opts.disposable=true] Delete panel or not after use
     * @example
     *      // simple demo
     *      new Panel({
     *          container: 'someContainerSelector',
     *          title: 'hello',
     *          msg: 'hello LBF'
     *      });
     *
     * @example
     *      // full options demo
     *      new Panel({
     *          title: 'hello',
     *          content: 'hello LBF',
     *          modal: false,
     *          drag: false,
     *          zIndex: 10,
     *          centered: true,
     *          buttons: [
     *              // button option @see ui.Nodes.Button
     *              {
     *                  value: 'confirm',
     *                  type: 'strong',
     *                  events: {
     *                      click: function(){
     *                          // context here is panel itself
     *                          // feel free to use this
     *                          this.remove();
     *                      }
     *                  }
     *              }
     *          ],
     *          events: {
     *              close: function(){
     *                  alert('close');
     *              }
     *          }
     *      });
     */
    var Panel = Popup.inherit({
        /**
         * 快捷访问，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {
            $header: '.lbf-panel-head',
            $content: '.lbf-panel-body',
            $footer: '.lbf-panel-foot',
            $buttonBox: '.lbf-panel-foot-r',
            $footerMsg: '.lbf-panel-foot-l',
            $closeButton: '.lbf-panel-close'
        },

        initialize: function(opts){
            this.mergeOptions(opts);

            this.buttons = [];

            this.render();
        },

        /**
         * Render panel and initialize events and elements
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var panel = this,
                title = this.get('title'),
                content = this.get('content'),
                buttons = this.get('buttons'),
                headerVisible = this.get('headerVisible'),
                footerVisible = this.get('footerVisible'),
                $container = this.$container = this.$(this.get('container')),
                $el = this.$( this.get('wrapTemplate')),
                $document = $(document),
                $headerWrap = $el.find('.lbf-panel-head'),
                $contentWrap = $el.find('.lbf-panel-body');

            this.setElement($el);

            $headerWrap.html(title);

            $contentWrap.html(content);

            if(buttons.length > 0){
                forEach(buttons, function(button, index){
                    panel.addButton(button);

                    if(index == 0){
                        panel.buttons[index].$el.click(function(){
                            if(panel.get('events').beforeClose.apply(panel, arguments)) {
                                panel.trigger('yes');
                            }
                        });
                    }
                    if(index == 1){
                        panel.buttons[index].$el.click(function(){
                            if(panel.get('events').beforeClose.apply(panel, arguments)) {
                                panel.trigger('no');
                            }
                        });
                    }
                    if(index == 2){
                        panel.buttons[index].$el.click(function(){
                            if(panel.get('events').beforeClose.apply(panel, arguments)) {
                                panel.trigger('cancel');
                            }
                        });
                    }
                });

                this.$footer.hide();
            }

            !headerVisible && this.$header.hide();

            this.$closeButton.click(proxy(function(){
                if(this.get('events').beforeClose.apply(this, arguments)){
                    this.trigger('close', [this]);
                }
				return false;
            }, this));

            // update z-index later than overlay plugin
            $container.append($el.css({
                zIndex: this.get('zIndex') || zIndexGenerator()
            }));

            //基本认为宽度界面上是可控的
            if(this.get('width') !== 'auto'){
                this.width(this.get('width'));
            }

            //对高度进行处理
            if(this.get('height') !== 'auto'){
                var height = this.get('height') < $(window).outerHeight() ? this.get('height') : $(window).outerHeight();
                var heightHeader = headerVisible ? this.$header.outerHeight() : 0;
                var heightFooter = footerVisible ? this.$footer.outerHeight() : 0;

                //对panel高度赋值
                this.height(height);

                //content区域的高度也要重新赋值
                this.$content.height(height - heightHeader - heightFooter);
            }

            // element should be in the DOM when set to center, otherwise will cause wrong position
            this.get('centered') && this.setToCenter();

            this.offsetTop = panel.offset().top;
            this.scrollTop = $document.scrollTop();
            this.currentTop = this.offsetTop - this.scrollTop;
            $(window).on('scroll', function(e){
                panel.css({
                    top: $document.scrollTop() + panel.currentTop
                });
            })

            // overlay should be added to DOM before $el
            if(this.get('modal')){
                var modalOpts = this.get('modal');

                if(modalOpts === true){
                    modalOpts = {
                        opacity: 0.3,
                        backgroundColor: 'black',
                        zIndex: zIndexGenerator()-2
                    }
                }

                modalOpts.container = this.get('container');

                this.plug(Overlay, modalOpts);
            }

            this.get('drag') && this.plug(Drag, {
                handler: headerVisible ? $headerWrap : $contentWrap,
                area: $('body'),
                events: {
                    drag: function(e, obj, x0, y0, left, top){
                        // 鼠标移出窗体时记录一下位置
                        $(document).mouseout(function(e){
                            e = e ? e : window.event;
                            var from = e.relatedTarget || e.toElement;
                            if (!from || from.nodeName == "HTML") {
                                // stop your drag event here
                                panel.currentTop = panel.offset().top - $document.scrollTop();
                            }
                        })
                    },
                    afterDrag: function(){
                        panel.currentTop = panel.offset().top - $document.scrollTop();
                    }
                }
            });

            // todo marked by amos
            // bind esc globally may cause problems

            // add shorcut 'esc' for cancel operation
            Shortcuts.bind('esc', proxy(function(){
                /**
                 * Fired when esc is pressed as the panel is shown
                 * @event exit
                 */
                if(this.get('events').beforeClose.apply(this, arguments)) {
                    this.trigger('exit');
                }
            }, panel));

            // if container is body, then auto reset to it's center when window resized
            if($container.is('body')){
                $(window).bind('resize', proxy(function(){
                    this.setToCenter();

                    if(this.get('drag')){
                        this.setDragArea($('body'));
                    }

                }, this));
            }

            this.trigger('load', [this]);

            return this;
        },

        /**
         * Add a button to panel's buttons
         * @method addButton
         * @param {Object} [opts] @see ui.Nodes.Button
         * @return {ui.Nodes.Button}
         * @example
         *      // button option @see ui.Nodes.Button
         *      node.addButton({
         *          text: 'confirm',
         *          type: 'strong',
         *          events: {
         *              click: function(){
         *                  // context here is panel itself
         *                  // feel free to use this
         *                  this.remove();
         *              }
         *          }
         *      });
         */
        addButton: function(opts){
            var panel = this;
            opts.delegate = this;

            // proxy all events' context to panel
            if(opts.events){
                var events = opts.events,
                    proxyEvents = {};
                for(var i in events){
                    if(events.hasOwnProperty(i)){
                        proxyEvents[i] = proxy(events[i], this);
                    }
                }

                opts.events = proxyEvents;
            }

            var button = new Button(opts);
            this.$buttonBox.append(button.$el);
            this.buttons.push(button);

            return button;
        },

        // add overlay controll
        show: function(){
            if(this.get('modal')){
                this._PLUGINS.Overlay.show();
            }

            return Popup.prototype.show.apply(this, arguments);
        },

        // add overlay controll
        hide: function(){
            if(this.get('modal')){
                this._PLUGINS.Overlay.hide();
            }

            return Popup.prototype.hide.apply(this, arguments);
        },

        /**
         * Remove node and it's buttons
         * @method remove
         * @chainable
         */
        remove: function(){
            $(window).unbind('scroll.Panel');

            return Popup.prototype.remove.apply(this, arguments);
        },

        /**
         * close node and it's buttons
         * @method close
         */
        close: function(){
            this[ this.get('disposable') ? 'remove' : 'hide' ]();

            return this;
        },

        /**
         * Show all Buttons
         * @method panel
         */
        panel: function(){
            var footerVisible = this.get('footerVisible');

            footerVisible && this.$footer.show();

            return this;
        },

        /**
         * Show yes Button
         * @method alert
         */
        alert: function(){
            var footerVisible = this.get('footerVisible');

            this.buttons[1] && this.buttons[1].$el.hide();
            this.buttons[2] && this.buttons[2].$el.hide();
            footerVisible && this.$footer.show();

            return this;
        },

        /**
         * Show yes & cancel Button
         * @method alert
         */
        confirm: function(){
            var footerVisible = this.get('footerVisible');

            if(this.buttons.length === 3){
                this.buttons[1] && this.buttons[1].$el.hide();
            }

            footerVisible && this.$footer.show();

            return this;
        },

        /**
         * set panel's content
         * @method setContent
         */
        setContent: function(html){
            this.$content.html(html);

            return this;
        },

        /**
         * set panel's width
         * @method setWidth
         */
        setWidth: function(value){
            this.css({
                width: value
            });
            this.setToCenter();

            return this;
        },

        /**
         * set panel's height
         * @method setHeight
         */
        setHeight: function(value){
            this.css({
                height: value
            });
            this.setToCenter();

            return this;
        }

        /*
        options: function(){
            if(arguments.length === 2){
                this.set(arguments[0], arguments[1]);
            }else{
                for (var name in arguments[0]){
                    this.set(name, arguments[0][name]);
                }
            }

            return this;
        }
        */
    });

    Panel.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend(true, {}, Popup.settings, {
            wrapTemplate: [
                '<div class="lbf-panel">',
                    '<a href="javascript:;" class="lbf-panel-close lbf-icon lbf-icon-close">&#xe603;</a>',
                    '<div class="lbf-panel-head"></div>',
                    '<div class="lbf-panel-body"></div>',
                    '<div class="lbf-panel-foot">' +
                    '   <div class="lbf-panel-foot-l"></div>' +
                    '   <div class="lbf-panel-foot-r"></div>' +
                    '</div>',
                '</div>'
            ].join(''),

            width: 360,

            title: '提示',

            centered: true,

            modal: true,

            drag: true,

            disposable: true,

            headerVisible: true,

            footerVisible: true,

            buttons: [
                {
                    className: 'lbf-button-primary',
                    content: '确定'
                },
                {
                    className: 'lbf-button',
                    content: '否定'
                },
                {
                    className: 'lbf-button',
                    content: '取消'
                }
            ],

            plugins: [],

            events: {
                'yes': function(){
                },

                'no': function(){
                },

                'cancel': function(){
                    this.close();
                },

                'beforeClose': function(){
                    return true;
                },

                'close': function(){
                    this.close();
                },

                'exit': function(){
                    this.close();
                }
            }
        })
    });

    return Panel;
});/**
 * @fileOverview test
 * @author amoschen
 * @version 1
 * Created: 12-11-28 下午2:44
 */
LBF.define('ui.Nodes.Textarea', function(require){
    var browser = require('lang.browser'),
        Node = require('ui.Nodes.Node');

    var isIE = browser.msie,
        IEVerison = parseInt(browser.version, 10),
        isIE9 = isIE && IEVerison === 9,
        isIE9Below = isIE && IEVerison <= 9;

    /**
     * Base textarea component
     * @class Textarea
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {Object} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Object} [opts.events] Node's events
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes.
     * @param {String} [opts.name] Form name
     * @param {String} [opts.value] Node's value
     * @param {String} [opts.className] Node's style
     * @param {Number} [opts.maxlength] Node's maxlength
     * @param {String} [opts.placeholder] Node's placeholder
     * @param {Boolean} [opts.readonly] Node is readonly or not
     * @param {Boolean} [opts.disabled] Node is disabled or not
     * @example
     *      new Textarea({
     *          container: 'someContainerSelector',
     *          disabled: true,
     *          maxlength: 100,
     *          placeholder: 'i am placeholder',
     *          events: {
     *              click: function(){
     *                  alert('clicked');
     *              },
     *              error: function(e, validateResult){
     *                  // handle error
     *                  alert(validateResult.message);
     *              }
     *          }
     *      });
     *
     * @example
     *      new Textarea({
     *          selector: 'textarea[name=abc]',
     *          value: 'hello',
     *          readonly: true,
     *          disabled: true
     *      });
     */
    var Textarea = Node.inherit({
        /**
         * Nodes default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'cut': '_textareaPropertychange',
            'paste': '_textareaPropertychange',
            'keyup': '_textareaPropertychange'
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var selector = this.get('selector'),
                placeholder = this.get('placeholder'),
                wrapTemplate = this.template(this.get('wrapTemplate')),
                $selector = this.$(selector);

            if(this.get('selector')){
                this.setElement($selector);
            } else {
                // container渲染模式
                this.setElement(wrapTemplate(this.attributes()));
                this.$el.appendTo(this.get('container'));
            }

            // width property
            this.get('width') && this.width(this.get('width'));

            // height property
            this.get('height') && this.height(this.get('height'));

            // value property
            this.get('value') && this.val(this.get('value'));

            // maxlength property
            if(this.get('maxlength')){
                this.prop('maxlength', this.get('maxlength'));
                this.val((this.val() + '').substr(0, this.get('maxlength')));

            }

            // 设置placeholder
            this._setPlaceholder();

            // readonly property
            this.get('readonly') && this.readonly(true);

            // disabled property
            this.get('disabled') && this.disable();

            return this;
        },

        /**
         * Show error style
         * @method error
         * @chainable
         */
        enable: function(){
            this.trigger('enable', [this]);

            this.prop('disabled', false);

            return this;
        },

        /**
         * Show error style
         * @method error
         * @chainable
         */
        disable: function(){
            this.trigger('disable', [this]);

            this.prop('disabled', true);

            return this;
        },

        readonly: function(flag){
            this.trigger('readonly', [this]);

            if(flag){
                this.prop('readonly', true);
            }else{
                this.prop('readonly', false);
            }

            return this;
        },

        /**
         * Remove not only the node itself, but the whole wrap including placeholder label
         * @method remove
         * @chainable
         */
        remove: function(){
            this.placeholder && this.placeholder.remove();
            return Node.prototype.remove.apply(this, arguments);
        },

        /**
         * Count content string's length
         * @method count
         * @return {Number} Length of content string
         * @example
         *      node.count(); // returns value string's length
         */
        count: function(){
            return (this.val() || '').length;
        },

        /**
         * modify placeholder
         * @method placeholder
         */
        placeholder: function(placeholder){
            this.text(placeholder);
        },

        /**
         * Prepend text
         * @method prepend
         * @param {String} text Text to be prepended
         * @chainable
         */
        prepend: function(text){
            return this.val(text + this.val());
        },

        /**
         * Append text
         * @method append
         * @param {String} text Text to be appended
         * @chainable
         */
        append: function(text){
            return this.val(this.val() + text);
        },

        /**
         * Insert text to assigned position
         * @method insert
         * @param {Number} position Position to insert text
         * @param {String} text Text to be inserted
         * @chainable
         */
        insert: function(position, text){
            var str = this.val(),
                str1 = str.slice(0, position),
                str2 = str.slice(position, str.length);

            this.val(str1 + text + str2);

            return this;
        },

        /**
         * Propertychange the textarea
         * @method _textareaPropertychange
         * @protected
         * @chainable
         */
        _textareaPropertychange: function(){
            isIE9 && this.trigger('propertychange');
        },

        /**
         * Set placeholder property
         * @method _setPlaceholder
         * @private
         * @param {String} placeholder
         * @chainable
         */
        _setPlaceholder: function(placeholder){
            var node = this,
            // this.el.getAttribute('placeholder') JQ bug
                placeholder = this.get('placeholder') || this.attr('placeholder') || '',
                $placeholder = this.$('<span class="lbf-textarea-placeholder">'+ placeholder +'</span>'),
                pos = node.position();

            if(browser.isIE10Below) {
                // new placeholder
                var update = function () {
                    if (node.val() === '') {
                        $placeholder.show();
                        return;
                    }
                    $placeholder.hide();
                };

                if (this.val() !== '') {
                    $placeholder.hide();
                }

                $placeholder
                    .click(function () {
                        node.focus();
                    });

                setTimeout(function () {
                    update();

                    //如果是container方式，还需要以下处理
                    //先调整好位置再展示，不让placeholder发生抖动
                    node.$el.after($placeholder);

                    this.$placeholder = $placeholder;

                    this.$placeholder.css({
                        top: pos.top,
                        left: pos.left
                    })
                }, 0);
            }

            this.bind('input propertychange change focus', update);

            return this;
        },

        /**
         * Set maxlength property. For early version of IE and opera, manually limit string length
         * @method _setMaxlength
         * @param {Number} maxlength
         * @private
         * @chainable
         */
        _setMaxlength: function(maxlength){
            // ie10以下不支持textarea的maxlength
            //chrome对maxlength的支持有点错误，换行会当成2个字符算;
            if(browser.mozilla || isIE && !isIE9Below){
                this.prop('maxlength', maxlength);
                return this;
            }

            // new placeholder
            var node = this,
                substr = function(){
                    var str = node.val() + ''; // in case node.val() returns number
                    str.length > maxlength && node.val(str.substr(0, maxlength));
                };

            if(isIE && isIE9Below) {
                node
                    .data('maxlength', maxlength)
                    .bind('input propertychange keyup', substr);

                //chrome下设置maxlength后，输入最后一个文字时，拼音只能输入一个字母就不能输入了;
            } else {
                node
                    .data('maxlength', maxlength)
                    .bind('blur change', substr);
            }

            return this;
        }
    });

    Textarea.include({
        /**
         * @method renderAll
         * @static
         * @param {String|documentElement|jQuery|Node} [selector='textarea'] Selector of node
         * @param {Object} [opts] options for node
         * @return {Array} Array of nodes that is rendered
         * @example
         *      var nodeArray = Textarea.renderAll();
         *
         * @example
         *      var nodeArray = Textarea.renderAll('.textarea');
         *
         * @example
         *      var nodeArray = Textarea.renderAll({
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         *
         * @example
         *      var nodeArray = Textarea.renderAll('.textarea', {
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         */
        renderAll: function(selector, opts){
            var SELECTOR = 'textarea';

            var nodes = [],
                Class = this,
                $ = this.prototype.$;
            if(selector.nodeType || selector.length || typeof selector === 'string'){
                opts = opts || {};
            } else if(selector){
                selector = selector;
                opts = opts || {};
            } else {
                opts = selector || {};
                selector = SELECTOR;
            }

            opts._SELECTOR = opts.selector;

            $(selector).each(function(){
                if(!$(this).is(SELECTOR)){
                    return;
                }
                opts.selector = this;
                nodes.push(new Class(opts));
            });

            opts.selector = opts._SELECTOR;
            opts._SELECTOR = null;

            return nodes;
        },

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {

            //textarea结构模板
            wrapTemplate: [
                '<textarea class="lbf-textarea" hideFocus="true" maxlength="<%==maxlength%>"></textarea>'
            ].join(''),

            //是否textarea状态
            readonly: false,

            //是否textarea状态
            disabled: false
        }
    });

    return Textarea;
});
/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 16-3-9 下午1:04
 */
LBF.define('ui.Plugins.TextCounter', function (require) {
    var Plugin = require('ui.Plugins.Plugin');
    var $ = require('lib.jQuery');

    /*
     * jQuery Simply Countable plugin
     * Provides a character counter for any text input or textarea
     *
     * @version  0.4.2
     * @homepage http://github.com/aaronrussell/jquery-simply-countable/
     * @author   Aaron Russell (http://www.aaronrussell.co.uk)
     *
     * Copyright (c) 2009-2010 Aaron Russell (aaron@gc4.co.uk)
     * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
     * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
     */

    /**
     * Add text's counter methods to host. Usually useful to input and textarea.
     * @class TextCounter
     * @namespace ui.Plugins
     * @module ui
     * @submodule ui-Plugins
     * @extends ui.Plugins.Plugin
     * @constructor
     * @param {ui.Nodes.Node} node Node instance of classes extended from ui.Nodes.Node. Usually textarea and input need the plugin most.
     * @param {Object} [opts] Options of node
     * @example
     *      hostNode.plug(TextCounter);
     */
    var TextCounter = Plugin.inherit({
        initialize: function(node, opts){
            this.node = node;
            this.setElement(node.$el);
            this.mergeOptions(opts);
            this.addMethods(this.constructor.methods);
            this.render();
            this.bindEventsToHost(this.constructor.bindEventsToHost);
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var navKeys = [33, 34, 35, 36, 37, 38, 39, 40];
            var that = this;
            var options = this.attributes();
            var countable = this.$el;
            var counter = $(options.counter);

            this.options = options;
            this.countable = countable;
            this.counter = counter;

            if (!counter.length) {
                return false;
            }

            this._countCheck();

            countable.on('keyup blur paste', function (e) {
                switch (e.type) {
                    case 'keyup':
                        // Skip navigational key presses
                        if ($.inArray(e.which, navKeys) < 0) {
                            that._countCheck.apply(that);
                        }
                        break;
                    case 'paste':
                        // Wait a few miliseconds if a paste event
                        setTimeout(function(){
                            that._countCheck.apply(that);
                        }, (e.type === 'paste' ? 5 : 0));
                        break;
                    default:
                        that._countCheck.apply(that);
                        break;
                }
            });
        },

        _countCheck: function () {
            var options = this.options;
            var countable = this.countable;
            var counter = $(options.counter);
            var count;
            var revCount;

            var reverseCount = function (ct) {
                return ct - (ct * 2) + options.maxCount;
            }

            var countInt = function () {
                return (options.countDirection === 'up') ? revCount : count;
            }

            var numberFormat = function (ct) {
                var prefix = '';
                if (options.thousandSeparator) {
                    ct = ct.toString();
                    // Handle large negative numbers
                    if (ct.match(/^-/)) {
                        ct = ct.substr(1);
                        prefix = '-';
                    }
                    for (var i = ct.length - 3; i > 0; i -= 3) {
                        ct = ct.substr(0, i) + options.thousandSeparator + ct.substr(i);
                    }
                }
                return prefix + ct;
            }

            var changeCountableValue = function (val) {
                countable.val(val).trigger('change');
            }

            /* Calculates count for either words or characters */
            if (options.countType === 'words') {
                count = options.maxCount - $.trim(countable.val()).split(/\s+/).length;
                if (countable.val() === '') {
                    count += 1;
                }
            }
            else {
                count = options.maxCount - countable.val().length;
            }
            revCount = reverseCount(count);

            /* If strictMax set restrict further characters */
            if (options.strictMax && count <= 0) {
                var content = countable.val();
                if (count < 0) {
                    this.trigger('maxCount', [countInt(), countable, counter]);
                    options.events.maxCount(countInt(), countable, counter);
                }
                if (options.countType === 'words') {
                    var allowedText = content.match(new RegExp('\\s?(\\S+\\s+){' + options.maxCount + '}'));
                    if (allowedText) {
                        changeCountableValue(allowedText[0]);
                    }
                }
                else {
                    changeCountableValue(content.substring(0, options.maxCount));
                }
                count = 0, revCount = options.maxCount;
            }

            counter.text(numberFormat(countInt()));

            /* Set CSS class rules and API callbacks */
            if (!counter.hasClass(options.safeClass) && !counter.hasClass(options.overClass)) {
                if (count < 0) {
                    counter.addClass(options.overClass);
                }
                else {
                    counter.addClass(options.safeClass);
                }
            }
            else if (count < 0 && counter.hasClass(options.safeClass)) {
                counter.removeClass(options.safeClass).addClass(options.overClass);
                this.trigger('overCount', [countInt(), countable, counter]);
                options.events.overCount(countInt(), countable, counter);
            }
            else if (count >= 0 && counter.hasClass(options.overClass)) {
                counter.removeClass(options.overClass).addClass(options.safeClass);
                this.trigger('safeCount', [countInt(), countable, counter]);
                options.events.safeCount(countInt(), countable, counter);
            }
        },

        options: function(option, value){
            this.set(option, value);
            // trigger
            this.focus().blur();
        }
    });

    TextCounter.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'TextCounter',

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            // 显示当前字数的容器
            counter: null,

            // 计算类型
            countType: 'characters',

            // 默认最大值
            maxCount: 140,

            // 是否支持负数值，如果true，则自动截断
            strictMax: false,

            // 计数方向，从大到小
            countDirection: 'down', // up

            // 正常范围的样式名
            safeClass: '',

            // 超出范围的样式名
            overClass: '',

            // 数字的千位分隔符，如默认是 1,084
            thousandSeparator: ',',

            events: {
                // 正常范围回调
                safeCount: function(){},

                // 超出范围回调
                overCount: function(){},

                // 到达最大值回调
                maxCount: function(){}
            }
        },

        /**
         * Events to be mix in host node
         * @property events
         * @type Array
         * @static
         */
        bindEventsToHost: ['safeCount', 'overCount', 'maxCount'],

        /**
         * Methods to be mix in host node
         * @property methods
         * @type Array
         * @static
         */
        methods: ['options']
    });

    return TextCounter;
});/**
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
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 13-7-8 上午00:54
 */
LBF.define('ui.Nodes.Checkbox', function (require) {
    var $ = require('lib.jQuery'),
        Node = require('ui.Nodes.Node'),
        each = require('lang.each'),
        extend = require('lang.extend');

    var ICheckbox = Node.inherit({
        /**
         * Render scrollspy's attribute
         * @method render
         * @chainable
         * @protected
         */
        render: function () {
            var selector = this.get('selector'),
                checked = this.get('checked'),
                disabled = this.get('disabled'),
                events = this.get('events'),
                wrapTemplate = this.template(this.get('template')),
                $selector = $(selector);

            if (this.get('selector')) {
                if($selector.is('.lbf-checkbox')){
                    this.setElement($selector);
                } else {
                    if($selector.parent().is('.lbf-checkbox')){
                        //无跳动结构
                        this.setElement($selector.parent());
                    }else{
                        //二次渲染
                        $selector.wrap('<span class="lbf-checkbox"></span>')
                        this.setElement($selector.parent());
                    }
                }

            } else {

                //container渲染模式
                this.setElement(wrapTemplate(this.attributes()));
                this.$el.appendTo(this.get('container'));
            }

            //缓存
            this.set('$selector', this.$el.find('input'));

            //赋值
            this._setValue();

            //添加定制样式
            this.get('halfchecked') && this.addClass('lbf-checkbox-halfchecked');

            this.pro($, 'iCheck', 'checkbox', 'radio', 'checked', 'disabled', 'type', 'click', 'touchbegin.i touchend.i', 'addClass', 'removeClass', 'cursor', 'halfchecked');

            this.$el.iCheck.apply(this, arguments);

            checked && this.$el.iCheck("check");
            disabled && this.$el.iCheck("disable");

            return this;
        },

        _setValue: function(){
            var value;

            value = this.get('$selector').val();

            this.set('value', value);

            return value;
        },

        isChecked: function () {
            return this.get('$selector').prop('checked');
        },

        isHalfChecked: function () {
            return this.$el.is('.lbf-checkbox-halfchecked');
        },

        isDisabled: function () {
            return this.get('$selector').prop('disabled');
        },

        value: function(){
            return this._setValue();
        },

        check: function () {
            this.$el.iCheck('check');

            //去除半选态
            this.$el.removeClass('lbf-checkbox-halfchecked');

            return this;
        },


        halfCheck: function(){
            this.$el.iCheck('uncheck');

            this.$el.prop('halfchecked', 'halfchecked');
            this.$el.addClass('lbf-checkbox-halfchecked');

            return this;
        },

        uncheck: function () {
            this.$el.iCheck('uncheck');

            //去除半选态
            this.$el.removeClass('lbf-checkbox-halfchecked');

            return this;
        },

        disable: function () {
            this.trigger('disable', [this]);
            this.$el.iCheck('disable');

            return this;
        },

        enable: function () {
            this.trigger('enable', [this]);
            this.$el.iCheck('enable');

            return this;
        },

        destroy: function () {
            this.trigger('destroy', [this]);
            this.$el.iCheck('destroy');

            return this;
        },

        remove: function(){
            this.trigger('remove', [this]);
            this.superclass.prototype.remove.apply(this, arguments);

            return this;
        },

        /*!
         * iCheck v0.9, http://git.io/uhUPMA
         * =================================
         * Powerful jQuery plugin for checkboxes and radio buttons customization
         *
         * (c) 2013 Damir Foy, http://damirfoy.com
         * MIT Licensed
         */

        pro: function ($, _iCheck, _checkbox, _radio, _checked, _disabled, _type, _click, _touch, _add, _remove, _cursor, _halfchecked) {
            var icheckbox = this;

            // Create a plugin
            $.fn[_iCheck] = function (options, fire) {

                // Cached vars
                var user = navigator.userAgent,
                    mobile = /ipad|iphone|ipod|android|blackberry|windows phone|opera mini/i.test(user),
                    handle = ':' + _checkbox + ', :' + _radio,
                    stack = $(),
                    walker = function (object) {
                        object.each(function () {
                            var self = $(this);

                            if (self.is(handle)) {
                                stack = stack.add(self);
                            } else {
                                stack = stack.add(self.find(handle));
                            }
                            ;
                        });
                    };

                // Check if we should operate with some method
                if (/^(check|uncheck|toggle|disable|enable|update|destroy)$/.test(options)) {

                    // Find checkboxes and radio buttons
                    walker(this);

                    return stack.each(function () {
                        var self = $(this);

                        if (options == 'destroy') {
                            tidy(self, 'ifDestroyed');
                        } else {
                            operate(self, true, options);
                        }
                        ;

                        // Fire method's callback
                        if ($.isFunction(fire)) {
                            fire();
                        }
                        ;
                    });

                    // Customization
                } else if (typeof options == 'object' || !options) {

                    //  Check if any options were passed
                    var settings = $.extend({
                            checkedClass: 'lbf-checkbox-'+ _checked,
                            disabledClass: 'lbf-checkbox-'+ _disabled,
                            halfcheckedClass: 'lbf-checkbox-'+ _halfchecked,
                            labelHover: true
                        }, options),

                        selector = settings.handle,
                        hoverClass = settings.hoverClass || 'lbf-checkbox-hover',
                        focusClass = settings.focusClass || 'lbf-checkbox-focus',
                        activeClass = settings.activeClass || 'lbf-checkbox-active',
                        labelHover = !!settings.labelHover,
                        labelHoverClass = settings.labelHoverClass || 'lbf-checkbox-hover',

                    // Setup clickable area
                        area = ('' + settings.increaseArea).replace('%', '') | 0;

                    // Selector limit
                    if (selector == _checkbox || selector == _radio) {
                        handle = ':' + selector;
                    }
                    ;

                    // Clickable area limit
                    if (area < -50) {
                        area = -50;
                    }
                    ;

                    // Walk around the selector
                    walker(this);

                    return stack.each(function () {
                        var self = $(this);

                        // If already customized
                        tidy(self);

                        var node = this,
                            id = node.id,

                        // Layer styles
                            offset = -area + '%',
                            size = 100 + (area * 2) + '%',
                            layer = {
                                position: 'absolute',
                                top: offset,
                                left: offset,
                                display: 'block',
                                width: size,
                                height: size,
                                margin: 0,
                                padding: 0,
                                background: '#fff',
                                border: 0,
                                opacity: 0
                            },

                        // Choose how to hide input
                            hide = mobile ? {
                                position: 'absolute',
                                visibility: 'hidden'
                            } : area ? layer : {
                                position: 'absolute',
                                opacity: 0
                            },

                        // Get proper class
                            className = node[_type] == _checkbox ? settings.className || 'i' + _checkbox : settings.className || 'i' + _radio,

                        // Find assigned labels
                            label = $('label[for="' + id + '"]').add(self.closest('label')),

                        // Wrap input
                            parent = icheckbox.$el,

                        // Layer addition
                            helper;

                        //rains

                        helper = $('<ins class="lbf-checkbox-helper"/>').css(layer).appendTo(parent);

                        // Finalize customization
                        self.data(_iCheck, {o: settings, s: self.attr('style')}).css(hide);
                        !!settings.inheritClass && parent[_add](node.className);
                        !!settings.inheritID && id && parent.attr('id', _iCheck + '-' + id);
                        parent.css('position') == 'static' && parent.css('position', 'relative');
                        operate(self, true, 'update');

                        // Label events
                        if (label.length) {
                            label.on(_click + '.i mouseenter.i mouseleave.i ' + _touch, function (event) {
                                var type = event[_type],
                                    item = $(this);

                                // Do nothing if input is disabled
                                if (!node[_disabled]) {

                                    // Click
                                    if (type == _click) {
                                        operate(self, false, true);
                                        parent.removeClass('lbf-checkbox-halfchecked');

                                        // Hover state
                                    } else if (labelHover) {
                                        if (/ve|nd/.test(type)) {
                                            // mouseleave|touchend
                                            parent[_remove](hoverClass);
                                            item[_remove](labelHoverClass);
                                        } else {
                                            parent[_add](hoverClass);
                                            item[_add](labelHoverClass);
                                        }
                                        ;
                                    }
                                    ;

                                    if (mobile) {
                                        event.stopPropagation();
                                    } else {
                                        return false;
                                    }
                                    ;
                                }
                                ;
                            });
                        }
                        ;

                        // Input events
                        self.on(_click + '.i focus.i blur.i keyup.i keydown.i keypress.i', function (event) {
                            var type = event[_type],
                                key = event.keyCode;

                            // Click
                            if (type == _click) {
                                parent.removeClass('lbf-checkbox-halfchecked');
                                return false;

                                // Keydown
                            } else if (type == 'keydown' && key == 32) {
                                if (!(node[_type] == _radio && node[_checked])) {
                                    if (node[_checked]) {
                                        off(self, _checked);
                                    } else {
                                        on(self, _checked);
                                    }
                                    ;
                                }
                                ;

                                return false;

                                // Keyup
                            } else if (type == 'keyup' && node[_type] == _radio) {
                                !node[_checked] && on(self, _checked);

                                // Focus/blur
                            } else if (/us|ur/.test(type)) {
                                parent[type == 'blur' ? _remove : _add](focusClass);
                            }
                            ;
                        });

                        // Helper events
                        helper.on(_click + ' mousedown mouseup mouseover mouseout ' + _touch, function (event) {
                            var type = event[_type],

                            // mousedown|mouseup
                                toggle = /wn|up/.test(type) ? activeClass : hoverClass;

                            // Do nothing if input is disabled
                            if (!node[_disabled]) {

                                // Click
                                if (type == _click) {
                                    operate(self, false, true);
                                    parent.removeClass('lbf-checkbox-halfchecked');

                                    // Active and hover states
                                } else {

                                    // State is on
                                    if (/wn|er|in/.test(type)) {
                                        // mousedown|mouseover|touchbegin
                                        parent[_add](toggle);

                                        // State is off
                                    } else {
                                        parent[_remove](toggle + ' ' + activeClass);
                                    }
                                    ;

                                    // Label hover
                                    if (label.length && labelHover && toggle == hoverClass) {

                                        // mouseout|touchend
                                        label[/ut|nd/.test(type) ? _remove : _add](labelHoverClass);
                                    }
                                    ;
                                }
                                ;

                                if (mobile) {
                                    event.stopPropagation();
                                } else {
                                    return false;
                                }
                                ;
                            }
                            ;
                        });
                    });
                } else {
                    return this;
                }
                ;
            };

            // Do something with inputs
            function operate(input, direct, method) {
                var node = input[0];

                // disable|enable
                state = /ble/.test(method) ? _disabled : _checked,
                    active = method == 'update' ? {checked: node[_checked], disabled: node[_disabled]} : node[state];

                // Check and disable
                if (/^ch|di/.test(method) && !active) {
                    on(input, state);

                    // Uncheck and enable
                } else if (/^un|en/.test(method) && active) {
                    off(input, state);

                    // Update
                } else if (method == 'update') {

                    // Both checked and disabled states
                    for (var state in active) {
                        if (active[state]) {
                            on(input, state, true);
                        } else {
                            off(input, state, true);
                        }
                        ;
                    }
                    ;

                } else if (!direct || method == 'toggle') {

                    // Helper or label was clicked
                    if (!direct) {
                        input.trigger('ifClicked');
                        icheckbox.trigger('click', [icheckbox]);
                    }
                    ;

                    // Toggle checked state
                    if (active) {
                        if (node[_type] !== _radio) {
                            off(input, state);
                            icheckbox.trigger('uncheck', [icheckbox]);
                        }
                        ;
                    } else {
                        on(input, state);
                        icheckbox.trigger('check', [icheckbox]);
                    }
                    ;
                }
                ;
            };

            // Set checked or disabled state
            function on(input, state, keep) {
                var node = input[0],
                    parent = input.parent(),
                    remove = state == _disabled ? 'enabled' : 'un' + _checked,
                    regular = option(input, remove + capitalize(node[_type])),
                    specific = option(input, state + capitalize(node[_type]));

                // Prevent unnecessary actions
                if (node[state] !== true && !keep) {

                    // Toggle state
                    node[state] = true;

                    // Trigger callbacks
                    input.trigger('ifChanged').trigger('if' + capitalize(state));
                    icheckbox.trigger('change', [icheckbox]);

                    // Toggle assigned radio buttons
                    if (state == _checked && node[_type] == _radio && node.name) {
                        var form = input.closest('form'),
                            stack = 'input[name="' + node.name + '"]';

                        stack = form.length ? form.find(stack) : $(stack);

                        stack.each(function () {
                            if (this !== node && $(this).data(_iCheck)) {
                                off($(this), state);
                            }
                            ;
                        });
                    }
                    ;
                }
                ;

                // Add proper cursor
                if (node[_disabled] && !!option(input, _cursor, true)) {
                    parent.find('.lbf-checkbox-helper').css(_cursor, 'default');
                }
                ;

                // Add state class
                parent[_add](specific || option(input, state));

                // Remove regular state class
                parent[_remove](regular || option(input, remove) || '');
            };

            // Remove checked or disabled state
            function off(input, state, keep) {
                var node = input[0],
                    parent = input.parent(),
                    callback = state == _disabled ? 'enabled' : 'un' + _checked,
                    regular = option(input, callback + capitalize(node[_type])),
                    specific = option(input, state + capitalize(node[_type]));

                // Prevent unnecessary actions
                if (node[state] !== false && !keep) {

                    // Toggle state
                    node[state] = false;

                    // Trigger callbacks
                    input.trigger('ifChanged').trigger('if' + capitalize(callback));
                    icheckbox.trigger('change', [icheckbox]);
                }
                ;

                // Add proper cursor
                if (!node[_disabled] && !!option(input, _cursor, true)) {
                    parent.find('.lbf-checkbox-helper').css(_cursor, 'pointer');
                }
                ;

                // Remove state class
                parent[_remove](specific || option(input, state) || '');

                // Add regular state class
                parent[_add](regular || option(input, callback));
            };

            // Remove all traces of iCheck
            function tidy(input, callback) {
                if (input.data(_iCheck)) {

                    // Remove everything except input
                    input.parent().html(input.attr('style', input.data(_iCheck).s || '').trigger(callback || ''));

                    // Unbind events
                    input.off('.i').unwrap();
                    $('label[for="' + input[0].id + '"]').add(input.closest('label')).off('.i');
                }
                ;
            };

            // Get some option
            function option(input, state, regular) {
                if (input.data(_iCheck)) {
                    return input.data(_iCheck).o[state + (regular ? '' : 'Class')];
                }
                ;
            };

            // Capitalize some string
            function capitalize(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            };
        }
    });

    ICheckbox.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            selector: null,

            container: null,

            template: [
                '<span class="lbf-checkbox',
                '<% if(checked) { %> ',
                'lbf-checkbox-checked',
                '<% } %>',
                '<% if(halfchecked) { %> ',
                'lbf-checkbox-halfchecked',
                '<% } %>',
                '<% if(disabled) { %> ',
                'lbf-checkbox-disabled',
                '<% } %>',
                '">',
                '<input type="checkbox"',
                '<% if(id) { %> ',
                'id="<%=id%>"',
                '<% } %>',
                '<% if(name) { %> ',
                'name="<%=name%>"',
                '<% } %>',
                '<% if(checked) { %> ',
                'checked',
                '<% } %>',
                '<% if(halfchecked) { %> ',
                'halfchecked',
                '<% } %>',
                '<% if(disabled) { %> ',
                'disabled',
                '<% } %>',
                ' />',
                '</span>'
            ].join(''),

            id: false,

            name: false,

            checked: false,

            disabled: false,

            halfchecked: false
        }
    });

    return ICheckbox;
});
/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 13-12-28 上午9:35
 */
LBF.define('ui.widget.LightTip.LightTip', function(require){
    var $ = require('lib.jQuery'),
        extend = require('lang.extend'),
        Node = require('ui.Nodes.Node'),
        Popup = require('ui.Nodes.Popup'),
        Overlay = require('ui.Plugins.Overlay'),
        zIndexGenerator = require('util.zIndexGenerator');

    require('{theme}/lbfUI/css/LightTip.css');

    /**
     * Base popup component
     * @class Popup
     * @namespace ui.Success
     * @module Success
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {String} [opts.className] className of node
     * @param {String} [opts.width] Width of node
     * @param {String} [opts.height] Height of node
     * @param {Object} [opts.hide] Param of node when hide
     * @param {Object} [opts.hide.delay] 组件展示时间
     * @param {Object} [opts.hide.effect] 隐藏时的效果
     * @param {Object} [opts.modal] 是否采用模态层，默认开启，莫忒曾透明度为0，Overlay的参数透传
     * @param {Object} [opts.events] Node's events
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes
     * @param {Boolean} [opts.centered=false] If set node to be centered to it's container
     * @example
     *      new Success({
     *          content: '提交成功'
     *      });
     */
    var LightTip = Popup.inherit({
        /**
         * Render
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var success = this,
                wrapTemplate = this.template(this.get('wrapTemplate')),
                $el = this.$(wrapTemplate({
                    content: this.get('content')
                })),
                $container = this.$container = this.$(this.get('container'));

            this.setElement($el);

            // overlay should be added to DOM before $el
            if(this.get('modal')){
                var modal = this.get('modal');
                //写死body， by rains
                modal.container = this.get('container');
                this.plug(Overlay, modal);
            }

            // update z-index later than overlay plugin
            // update z-index later than overlay plugin
            $container.append($el.css({
                zIndex: this.get('zIndex') || zIndexGenerator()
            }));

            //基本认为宽度界面上是可控的
            if(this.get('width') !== 'auto'){
                this.width(this.get('width'));
            }

            //对高度进行处理
            if(this.get('height') !== 'auto'){
                var height = this.get('height') < $(window).outerHeight() ? this.get('height') : $(window).outerHeight();

                //对success高度赋值
                this.height(height);
            }

            // element should be in the DOM when set to center
            this.get('centered') && this.setToCenter();

            //这里不能直接this.hide(); 不然Overlay Plugin也会受影响，看有没其他方法 by rains
            this.$el.hide();

            return this;
        },

        /**
         * Render Success
         * @method success
         */
        success: function(){
            var lighttip = this;

            lighttip
                .removeClass('lbf-light-tip-error')
                .addClass('lbf-light-tip-success');

            //显示效果定制
            setTimeout(function(){
                lighttip.get('show').effect.apply(lighttip, [lighttip]);
            }, lighttip.get('show').delay);

            //隐藏（删除）效果定制
            setTimeout(function(){
                lighttip.get('hide').effect.apply(lighttip, [lighttip]);
            }, lighttip.get('hide').delay);

            return lighttip;
        },

        /**
         * Render Success
         * @method error
         */
        error: function(){
            var lighttip = this;

            lighttip
                .removeClass('lbf-light-tip-success')
                .addClass('lbf-light-tip-error');

            //显示效果定制
            setTimeout(function(){
                lighttip.get('show').effect.apply(lighttip, [lighttip]);
            }, lighttip.get('show').delay);

            //隐藏（删除）效果定制
            setTimeout(function(){
                lighttip.get('hide').effect.apply(lighttip, [lighttip]);
            }, lighttip.get('hide').delay);

            return lighttip;
        }
    });

    LightTip.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend(true, {}, Popup.settings, {

            //success popup 结构模板
            wrapTemplate: [
                '<div class="lbf-light-tip"><%== content %></div>'
            ].join(''),

            //默认装载容器
            container: 'body',

            //定制样式接口
            className: '',

            //success popup width
            width: 'auto',

            //success popup height
            height: 'auto',

            show: {
                delay: 0,
                effect: function(success){
                    this.fadeIn('normal', function(){
                        success.trigger('show', [success]);
                    });
                }
            },

            //隐藏时的参数定制，延时多久关闭、隐藏效果，定制此参数时，请trigger close。 建议不修改，一致讨论最佳实践。
            hide: {
                delay: 2000,
                effect: function(success){
                    this.fadeOut('normal', function(){
                        success.trigger('hide', [success]);
                    });
                }
            },

            //success popup 是否居中
            centered: true,

            //success popup 是否使用模态层
            modal: {
                opacity: 0,
                backgroundColor: 'black'
            },

            events: {
                hide: function(e, success){
                    success.remove();
                }
            }
        })
    });

    return LightTip;
});/**
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
/**
 * Created by renjiale on 2016-6-27.
 */
/**
 * @fileOverview
 * @author  renjiale
 * Created: 2016-6-27
 */
LBF.define('qd/js/book_details/catalog.1bf23.js', function (require, exports, module) {
    var
        Node = require('ui.Nodes.Node'),
        ajaxSetting = require('qd/js/component/ajaxSetting.84b88.js'),
        Pagination = require('ui.Nodes.Pagination'),
        Cookie = require('util.Cookie'),
        EJS = require('util.EJS');


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
            'click .j_catalog_block': 'showCatalogInfo',
            'click .j_subscribe': 'goSubPage'

        },
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
            this.catalogHasLoaded = false;
            this.bookId = $('#bookImg').data('bid');

            //获取url中目录页的标识
            var directCatalog = location.hash;

            //如果hash中有catalog，则优先展示目录页
            if (directCatalog.indexOf('Catalog') > 0) {
                this.showCatalogInfo();
            }
        },


        /**
         * 向后端请求目录章节数据并更新ejs模板
         */
        showCatalogInfo: function () {
            //处理作用域问题
            var that = this;
            var catalogTag = $('.content-nav-wrap li');
            catalogTag.removeClass('act');
            catalogTag.eq(1).addClass('act');
            $('.book-content-wrap').addClass('hidden');
            $('.catalog-content-wrap').removeClass('hidden');
        },

        /*
         **发送获取目录信息的请求
         * @method getCatalogInfo
         */
        getCatalogInfo: function (resolve) {
            var that = this;
            var volumesList = {};
            var bid = $('#bookImg').data('bid');

            //如果已经发过请求
            if(that.catalogHasLoaded){
                return;
            }

            //目录信息加载完毕后，将标识设置为true
            that.catalogHasLoaded = true;
            $.ajax({
                type: 'GET',
                url: '/ajax/book/category',
                dataType: 'json',
                data: {
                    //防止登录回调后拿不到this.bookId，所以直接再获取
                    bookId: bid
                },
                success: function (data) {
                    //目录章节信息获取成功后，将返回的数据付给变量volumesList
                    if (data.code === 0) {
                        //更新免费试读的章节Url

                       if(data.data.hasRead ==0 && data.data.firstChapterJumpurl){
                           $('.J-getJumpUrl').attr('href',data.data.firstChapterJumpurl);
                       }
                        //获取目录有多少章，如果目录章节不是空，填入有多少章
                        volumesList.catalogInfo = data.data;
                        var chapterTotalCnt = volumesList.catalogInfo.chapterTotalCnt;
                        if (chapterTotalCnt != 0) {
                            //更新tab上目录总章节数
                            $('#J-catalogCount').html('(' + chapterTotalCnt + '章)');
                        }

                        volumesList.salesMode = data.salesMode || 1;

                        //获取当前第一部分需要展示的卷数，同时渲染第一批卷
                        var n = that.separateVolumes(volumesList.catalogInfo.vs);
                        $.extend(volumesList.catalogInfo, {
                            bId: bid,
                            volF: 0,
                            volT: n + 1,
                            hasShownProgress: false
                        });
                        var template = new EJS({
                            url: '/ejs/qd/js/book_details/catalog.71714.ejs'
                        }).render(volumesList);

                        //操作目录区块节点，将第一批目录数据append到对应节点中
                        var catalogWrap = $('.catalog-content-wrap');
                        //if (catalogWrap.find('.loading').length > 0) {
                        //    catalogWrap.children('.loading').remove();
                        //}
                        catalogWrap.html(template);

                        //获取剩下需要展示的卷,同时append到第一批目录数据后
                        setTimeout(function () {
                            volumesList.catalogInfo.volF = n + 1;
                            volumesList.catalogInfo.volT = volumesList.catalogInfo.vs.length;
                            if (volumesList.catalogInfo.volF != volumesList.catalogInfo.volT) {
                                volumesList.catalogInfo.hasShownProgress = true;
                                var template = new EJS({
                                    url: '/ejs/qd/js/book_details/catalog.71714.ejs'
                                }).render(volumesList);
                                catalogWrap.append(template);
                            }
                        }, 0);
                    } else {
                        //code非0状态
                        $('#j-catalogWrap').children().remove().end().append('<div class="no-data"><div class="null"></div><p>暂无目录数据，请稍后查看</p></div>');
                    }
                    resolve();
                }
            });
        },

        /**
         * 获取前100章的卷
         * @method separateVolumes
         * @param volumeArr 需要分段的数组
         */
        separateVolumes: function (volumeArr) {
            var limit = 100;
            var chapterLenArr = [];
            for (var i = 0; i < volumeArr.length; i++) {
                chapterLenArr.push(volumeArr[i]['cs'].length);
            }
            for (var n = 0, cnt = 0; n < chapterLenArr.length; n++) {
                cnt = cnt + chapterLenArr[n];
                if (cnt >= limit) {
                    break;
                }
            }
            //如果总和小于阀值，则返回最后一卷的index值
            if (cnt < limit) {
                return n - 1;
            }
            //如果当前index为0，则直接跳出本函数，输出第一卷即可
            if (n == 0) {
                return n;
            }
            //当前总数比阀值多出的数量
            var over1 = cnt % limit;
            //去除当前index对应的值后，总数比阀值多出的数量
            var over2;
            //n大于0的时候需要对比chapterLenArr[n]及chapterLenArr[n-1]
            if (n > 0) {
                //chapterLenArr[n]之前的sum
                var cnt2 = cnt - chapterLenArr[n];
                if (cnt2 > limit) {
                    over2 = cnt2 % limit;
                } else {
                    over2 = limit % cnt2;
                }
                if (over2 < over1) {
                    return n - 1;
                } else {
                    return n;
                }
            }
        },

        /*
         **@method goSubPage 跳转订阅页
         */
        goSubPage: function (e) {
            //_focusVol的值对应卷相关checkbox的正常排序序号，第一卷为1
            var env = g_data.envType == 'pro' ? '' : g_data.envType;
            var subPageUrl = "//" + env + 'book.qiyan.com/subscribe/' + this.bookId + '?volNo=' + $(e.currentTarget).attr('data-volumenum');
            $(e.currentTarget).attr('href', subPageUrl);
        }
    })
});
/**
 * @fileOverview
 * @author liuwentao
 * Created: 16/10/11
 */
LBF.define('qd/js/read.qidian.com/ejsChinese.a35d9.js', function (require, exports, module) {

    var
        EJS = require('util.EJS');

    return (function (ejsUrl , ejsData ) {

        //异步加载指南弹窗模板
        var ejsDom = new EJS({
            url: ejsUrl
        }).render(ejsData);

        //判断简繁体
        require.async('qd/js/component/chinese.cafe9.js', function (S2TChinese) {

            ejsDom = S2TChinese.s2tString(ejsDom);

        });
        
        return ejsDom ;

    });

})
/**
 * Created by renjiale on 2016-6-27.
 */
/**
 * @fileOverview
 * @author  renjiale
 * Created: 2016-6-27
 */
LBF.define('qd/js/component/loading.aa676.js', function (require, exports, module) {
    var
        Node = require('ui.Nodes.Node'),
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

            // 设置UI Node proxy对象，chainable method，勿删
            this.setElement(this.el);

            // 页面逻辑入口
            this.init();

            // 返回组件
            return this;
        },

        init:function(){

        },

        /**
         * 按钮显示loading效果
         * targetBtn 当前点击的元素
         * getSign delayTime后动态抓取标识是否得到请求数据的变量值
         * delayTime 延迟多长时间后显示Loading
         */
        startLoading: function (targetBtn,getSign,delayTime) {
            var target = targetBtn;
            this.loadingTimer = setTimeout(function(){
                if(getSign()){
                    clearTimeout(this.loadingTimer);
                }else{
                    target.append('<cite class="la-ball-spin-clockwise la-sm"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></cite>');
                    target.addClass('btn-loading');
                }
            },delayTime);
        },

        /**
         * 获得loading的timer，以便随时清除
         */
        clearLoading:function(targetBtn){
            var target = targetBtn;
            if(target.hasClass('btn-loading')){
                target.children('cite').remove();
                target.removeClass('btn-loading');
                clearTimeout(this.loadingTimer);
            }
        },

        /**
         * loading计时，如果超过60s，则不显示loading
         */
        loadingTimer:function(){

        }
    })
});