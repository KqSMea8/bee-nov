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
 * @fileOverview
 * @author rainszhang
 * Created: 16-08-24
 */
(function(global, factory) {
    if (typeof define === 'function') {
        // 支持LBF加载
        if(typeof LBF === 'object'){
            LBF.define('qiyan.report', function(){
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
 * @author rainszhang
 * @version 1
 * Created: 13-7-8 上午11:04
 */
LBF.define('ui.Nodes.Radio', function (require) {
    var $ = require('lib.jQuery'),
        Node = require('ui.Nodes.Node'),
        each = require('lang.each'),
        extend = require('lang.extend');

    var IRadio = Node.inherit({
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
                if ($selector.is('.lbf-radio')) {
                    this.setElement($selector);
                } else if ($selector.parent().is('.lbf-radio')) {

                    //无跳动结构
                    this.setElement($selector.parent());
                } else {

                    //二次渲染
                    $selector.wrap('<span class="lbf-radio"></span>')
                    this.setElement($selector.parent());
                }
            } else {

                //container渲染模式
                this.setElement(wrapTemplate(this.attributes()));
                this.$el.appendTo(this.get('container'));
            }

            //缓存
            this.set('$selector', this.$el.find('input'));

            //赋值给组件
            this._setValue();

            this.pro($, 'iCheck', 'checkbox', 'radio', 'checked', 'disabled', 'type', 'click', 'touchbegin.i touchend.i', 'addClass', 'removeClass', 'cursor');

            this.$el.iCheck.apply(this, arguments);

            checked && this.$el.iCheck("check");
            disabled && this.$el.iCheck("disable");

            return this;
        },

        _setValue: function () {
            var value;

            value = this.get('$selector').val();

            this.set('value', value);

            return value;
        },

        isChecked: function () {
            return this.get('$selector').prop('checked');
        },

        isDisabled: function () {
            return this.get('$selector').prop('disabled');
        },

        value: function(){
            return this._setValue();
        },

        check: function () {
            this.$el.iCheck('check');

            return this;
        },

        uncheck: function () {
            this.$el.iCheck('uncheck');

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

        pro: function ($, _iCheck, _checkbox, _radio, _checked, _disabled, _type, _click, _touch, _add, _remove, _cursor) {
            var iradio = this;

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
                                checkedClass: 'lbf-radio-' + _checked,
                                disabledClass: 'lbf-radio-' + _disabled,
                                labelHover: true
                            }, options),

                            selector = settings.handle,
                            hoverClass = settings.hoverClass || 'lbf-radio-hover',
                            focusClass = settings.focusClass || 'lbf-radio-focus',
                            activeClass = settings.activeClass || 'lbf-radio-active',
                            labelHover = !!settings.labelHover,
                            labelHoverClass = settings.labelHoverClass || 'lbf-radio-hover',

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
                                className = node[_type] == _checkbox ? settings.checkboxClass || 'i' + _checkbox : settings.className || 'i' + _radio,

                        // Find assigned labels
                                label = $('label[for="' + id + '"]').add(self.closest('label')),

                        // Wrap input
                                parent,

                        // Layer addition
                                helper;

                        //rains
                        if (!$(self).parent().is('.lbf-radio')) {
                            parent = self.wrap('<span class="' + className + '"/>').trigger('ifCreated').parent().append(settings.insert);
                        } else {
                            parent = $(self).parent();
                        }

                        helper = $('<ins class="lbf-radio-helper"/>').css(layer).appendTo(parent);


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
                        iradio.trigger('click', [iradio]);
                    }
                    ;

                    // Toggle checked state
                    if (active) {
                        if (node[_type] !== _radio) {
                            off(input, state);
                            iradio.trigger('uncheck', [iradio]);
                        }
                        ;
                    } else {
                        on(input, state);
                        iradio.trigger('check', [iradio]);
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
                    iradio.trigger('change', [iradio]);

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
                    parent.find('.lbf-radio-helper').css(_cursor, 'default');
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
                    iradio.trigger('change', [iradio]);
                }
                ;

                // Add proper cursor
                if (!node[_disabled] && !!option(input, _cursor, true)) {
                    parent.find('.lbf-radio-helper').css(_cursor, 'pointer');
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

    IRadio.include({
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
                '<span class="lbf-radio',
                '<% if(checked) { %> ',
                'lbf-radio-checked',
                '<% } %>',
                '<% if(disabled) { %> ',
                'lbf-radio-disabled',
                '<% } %>',
                '">',
                '<input type="radio"',
                '<% if(id) { %> ',
                'id="<%=id%>"',
                '<% } %>',
                '<% if(name) { %> ',
                'name="<%=name%>"',
                '<% } %>',
                '<% if(checked) { %> ',
                'checked',
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

            disabled: false
        }
    });

    return IRadio;
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
        report = require('qiyan.report'),
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
/**
 * @fileOverview
 * @author  yangye & liuwentao
 * Created: 2016-9-19
 */
LBF.define('qd/js/read.qiyan.com/common.014c7.js', function (require, exports, module) {
    var
        Node = require('ui.Nodes.Node'),
        ajaxSetting = require('qd/js/component/ajaxSetting.84b88.js'),
        report = require('qd/js/component/report.00ef2.js'),
        Cookie = require('util.Cookie'),
        Login = require('qd/js/component/login.a4de6.js'),
        Panel = require('ui.widget.Panel.Panel'),
        Addbook = require('qd/js/free/addBook.83d23.js'),
        LightTip = require('ui.widget.LightTip.LightTip'),
        Url = require('qd/js/component/url.c4960.js'),
        ejsChinese = require('qd/js/read.qiyan.com/ejsChinese.a35d9.js');

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
            //打开指南
            'click #j_guideBtn': 'openGuide',
            //最近阅读ajax
            'mouseenter #j_nearRead': 'nearReadAjax',
            //加载左侧导航目录弹窗
            'mouseenter #j_navCatalogBtn': 'loadCatalog',
            //加载左侧导航目录弹窗
            'click #j_navCatalogBtn': 'navCatalog',
            //目录、书签tab
            'click #j_catalogTab span': 'catalogSwitchTab',
            //点击加载书签list
            'click #j_markerBtn': 'addMarker',
            //目录卷节显示收起
            'click #j_catalogListWrap h3': 'extendCatalogList',
            //删除书签
            'click #j_bookMarkList .delete': 'removeBookMark',
            //加载左侧导航设置弹窗
            'click #j_navSettingBtn': 'navSetting',
            //阅读主题选择、正文字体切换
            'click #j_themeList span, #j_fontFamily span, #j_readMode span': 'switchStyle',
            //阅读字体设置
            'click #j_fontSize span': 'fontSizeSet',
            //阅读正文宽度设置
            'click #j_pageWidth span': 'widthSet',
            //阅读设置保存
            'click #j_setSave': 'readSetSave',
            //阅读设置取消,不保存
            'click #j_setCancel , .setting-close': 'readSetCancel',
            //加入书架
            'click .add-book': 'addToBookShelf',
            //加载游戏弹窗
            'click #j_navGameBtn': 'navGame',
            //自动订阅开关
            'click #j_autoSwitch': 'subscribeSwitch',
            //关闭左侧面板浮层
            'click #j_leftBarList .close-panel': 'closeLeftPanel',
            //手机阅读
            'click #j_phoneRead': 'mobilePhoneRead',
            //返回顶部
            'click #j_goTop': 'goPageTop'
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
            //左侧导航box
            that.leftNav = $('#j_leftBarList');
            //获取内容区域box
            that.readMainWrap = $('#j_readMainWrap');
            //游戏弹窗dom

            that.gameDom = '<div class="panel-wrap game" id="j_game"><a class="iconfont close-panel" href="javascript:">&#xe61f;</a><iframe id="j_qdGame" src="https://game.qiyan.com/Home/Ad/readPageWindow" scrolling="0" frameborder="0"></iframe></div>';
            //获取body
            that.bodyDom = $('body');
            //最近阅读是否存在标识
            that.navNearRead = false;
            //目录是否存在的标识
            that.leftNavCatalog = false;
            //书签是否存在的标识
            that.leftNavmarker = false;
            //是否已经获取订阅状态
            that.subscribeBool = false;
            //用户之前是否有订阅本书vip章节标识
            that.subscribeBookChapter = 0;
            //定义暂时存储setting参数
            that.zanshiSetting = {};
            //获取屏幕的高度
            that.winHeight = $(window).height();

            //检查是否进行过简繁体转换
            that.checkLang();

            //头部
            that.readHeader();

            //阅读设置cookie set
            that.setReadCookie();

            //阅读左右导航虚浮
            that.readNav();

            //窗口resize触发
            that.windowResize();

            //判断用户是否是第一次进入阅读页
            that.firstRead();

            //切换月票、推荐票
            that.switchTicket();

            //登录回调
            Login.setSuccess(that, function () {
                window.location.reload();
            });

            //标识目录是否已经发送ajax , 默认为false , 未发送
            that.catalogAjaxbool = false;

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
                    S2TChinese.trans2Tradition('html');
                    $('.lang').addClass('zht');
                });
            }
        },
        /**
         * 关闭左侧浮层面板
         * @method closeLeftPanel
         * @param e 事件对象
         */
        closeLeftPanel: function (e) {

            var target = $(e.currentTarget);
            //当前面板关闭
            $(target).parents('.panel-wrap').hide();
            //去除左侧点击后的当前样式
            $('#j_leftBarList dd').removeClass('act');

        },
        /*
         * 判断用户是否是第一次进入阅读页
         * @method firstRead
         * */
        firstRead: function () {

            if (!Cookie.get('qdgd')) {
                this.openGuide();
                //qdgd
                Cookie.set('qdgd', '1', 'qiyan.com', '/', 86400000 * 365);
            }
        },
        /*
         * 阅读设置cookie set
         * @method setReadCookie
         */
        setReadCookie: function () {

            //判断qdrs是否存在,不存在种植cookie
            if (!Cookie.get('qdrs')) {

                var cookieSetData = g_data.readSetting.t + '|' + g_data.readSetting.fs + '|' + g_data.readSetting.ft + '|' + g_data.readSetting.rt + '|' + g_data.readSetting.w;
                //设置保存cookie,不包括是否订阅配置 ,时长 1年 365天
                Cookie.set('qdrs', cookieSetData, 'qiyan.com', '/', 86400000 * 365);
            }


        },
        /**
         * 阅读页头部logo下拉框
         * @method readHeader
         */
        readHeader: function () {
            var readHeader = $('#readHeader');
            var PinSearch = $('#pin-search');
            var PinInput = $('#pin-input');

            readHeader.on('mouseenter', '.left-nav li, .sign-in', function () {
                readHeader.find('li').removeClass('act');
                $(this).addClass('act');
            }).on('mouseleave', 'li', function () {
                $(this).removeClass('act');
            });

            PinSearch.click(function () {
                if (PinInput.val() == '') {
                    PinInput.val(PinInput.attr('placeholder'))
                }
                //kw 埋点
                PinSearch.data('kw', PinInput.val());
                //判断域名是否是搜索页，是的话当前页面搜索，否则跳转带值跳搜索页
                if (g_data.domainSearch == location.hostname) {
                    location.href = '//' + g_data.domainSearch + '?kw=' + encodeURIComponent(PinInput.val());
                }
            });

            // 支持enter键搜索
            PinInput.on('keydown', function (evt) {
                if (evt.keyCode == 13) {
                    //判断值是否是空，是空去取placeholder值后带着值传给搜索页
                    if (PinInput.val() == '') {
                        PinInput.val(PinInput.attr('placeholder'))
                    }
                    //kw 埋点
                    $('#searchSubmit').data('kw', PinInput.val());
                    //判断域名是否是搜索页，是的话当前页面搜索，否则跳转带值跳搜索页
                    if (g_data.domainSearch == location.hostname) {
                        location.href = '//' + g_data.domainSearch + '?kw=' + encodeURIComponent(PinInput.val());
                    }
                }
            });

        },
        /*
         * 最近阅读
         * @method nearReadAjax
         * @param e 事件对象
         * */
        nearReadAjax: function (e) {

            var that = this,
                target = $(e.currentTarget);

            //获取最新阅读
            if (that.navNearRead == false) {
                $.ajax({
                    type: 'GET',
                    url: '/ajax/chapter/getReadRecord',
                    dataType: 'json',
                    success: function (response) {
                        if (response.code === 0) {
                            //异步加载目录弹窗模板
                            var nearReadPopup = ejsChinese('/ejs/qd/js/read.qiyan.com/readRecord.7099a.ejs', response.data);
                            //加入弹窗中
                            target.append(nearReadPopup);
                            //改变最近阅读标识
                            that.navNearRead = true;
                        }
                    }
                });
            }
        },
        /* 
         * 阅读左右导航虚浮 
         * @method readNav 
         * */
        readNav: function () {

            var that = this,
                win = $(window),
                doc = $(document);

            // 左侧导航定参
            var leftBar = $('#j_leftBarList'),
                nowLeftTop = leftBarTop = 119;

            //右侧导航定参
            var rightBar = $('#j_rightBarList'),
                nowRightBottom = rightBarBottom = 120,
                pageHeight,
                bottomTo;

            var goTop = $('#j_goTop');

            win.on('scroll', function () {

                //获取滚动条距顶部的位置 
                winScrollTop = win.scrollTop();
                //获取页面高度、屏幕高度
                pageHeight = doc.height();

                //当滚动条位置大于leftBar距顶部的位置时,并且 nowLeftTop != 0 
                if (winScrollTop >= leftBarTop && nowLeftTop != 0) {
                    nowLeftTop = 0;
                    leftBar.css('top', nowLeftTop);
                } else if (winScrollTop < leftBarTop) {
                    nowLeftTop = leftBarTop - winScrollTop;
                    leftBar.css('top', nowLeftTop);
                }

                //获取滚动条距底部的距离
                bottomTo = pageHeight - that.winHeight - rightBarBottom;
                //当滚动条位置大于rightBar距底部的位置时,并且 nowRightBottom != 0 
                if (winScrollTop <= bottomTo && nowRightBottom != 0) {
                    nowRightBottom = 0;
                    rightBar.css('bottom', nowRightBottom);
                } else if (winScrollTop > bottomTo) {
                    nowRightBottom = rightBarBottom - pageHeight + that.winHeight + winScrollTop;
                    rightBar.css('bottom', nowRightBottom);
                }

                //回到顶部按钮是否出现
                if (winScrollTop > 0) {
                    goTop.show();
                } else {
                    goTop.hide();
                }

            }).trigger('scroll');
        },
        /**
         * 打开指南
         * @method openGuide
         */
        openGuide: function () {

            var that = this;
            var guideBox = $('.guide-box'),
                body = $('body'),
                panelWrap = $('#j_leftBarList'),
                leftBarList = panelWrap.find('dd');
            //关闭左侧
            leftBarList.removeClass('act');
            panelWrap.find('.panel-wrap').hide();
            guideBox.fadeIn();
            //添加上层和底层遮罩
            body.append('<div class="guide-mask top"></div>');
            body.append('<div class="guide-mask bottom"></div>');

            //异步加载指南弹窗模板
            var guidePopup = new EJS({
                url: '/ejs/qd/js/component/template/guidePopup.5ccc8.ejs'
            }).render();

            //关闭指南弹窗
            function closeGuide() {
                panel.close();
                guideBox.fadeOut(200);
                //提升章节box的z-index
                $('#j_readMainWrap').css('z-index', '101');
                $('.guide-mask').remove();
            }

            $('.setting-close').trigger('click');

            //显示指南弹窗
            var panel = new Panel({
                drag: false,
                headerVisible: false,
                width: 520,
                footerVisible: false,
                content: guidePopup,
                events: {
                    close: function () {
                        closeGuide();
                    }
                }
            });
            //提升章节box的z-index
            $('#j_readMainWrap').css('z-index', '104');
            panel.confirm();
            that.panel = panel;

            //移除lbf原生遮罩，防止遮挡
            $('.lbf-overlay').remove();

            //关闭指南按钮绑定事件
            $('#j_closeGuide').on('click', function () {
                closeGuide();

            });

        },
        /**
         * 左侧工具栏按钮 各自执行的方法
         * @method leftBtnMethod
         * @param e 事件对象
         */
        leftBtnMethod: function (e) {

            var that = this,
                target = $(e.currentTarget),
                bool = 0;

            // 阅读设置的弹窗单独逻辑
            if($('#j_navSettingBtn').hasClass('act') &&  target.attr('id') != 'j_navSettingBtn'  ) {
                that.readSetCancel(e);
            }

            if (target.hasClass('act')) {
                target.removeClass('act').siblings().removeClass('act');
                bool = 1;
            } else {
                target.addClass('act').siblings().removeClass('act');
            }

            that.leftNav.find('.panel-wrap').hide();

            return bool;

        },
        /*
         * hover上去，提前拉取目录
         * @method   loadCatalog
         */
        loadCatalog: function (e) {

            var that = this,
                target = $(e.currentTarget);

            if (that.leftNavCatalog || target.hasClass('act')) return false;
            //页面js执行完之后拉取目录
            that.catalogAjax();
            //隐藏目录弹窗
            $('#j_catalog').hide();

        },
        /*
         * 左侧获取目录按钮
         * @method navCatalog
         *  @param e 事件对象
         * */
        navCatalog: function (e) {

            var that = this;
            //调用选中func
            if (that.leftBtnMethod(e)) return false;
            //加载目录
            that.catalogAjax();

        },
        /*
         * 发送请求拉取目录
         * @method catalogAjax
         * */
        catalogAjax: function () {

            var that = this,
                catalogPop = $('#j_catalog');
            //如果没有
            if (catalogPop.length == 0) {

                //获取用户是否登陆
                var data = {
                    loginStatus: Login.isLogin() ? 1 : 0
                }

                //获取目录弹窗
                catalogPop = ejsChinese('/ejs/qd/js/read.qiyan.com/navCatalogBox.5876b.ejs', data);
                //把弹窗加入左侧导航中
                that.leftNav.append(catalogPop);

            } else {
                catalogPop.show();
            }

            var catalogBox = $('#j_catalogListWrap');

            //如果是第一次加载目录tab
            if (!that.leftNavCatalog) {

                //判断是否已经发送ajax请求,
                if (!that.catalogAjaxbool) {

                    //标识目录已经发送ajax
                    that.catalogAjaxbool = true;
                    $.ajax({
                        type: 'GET',
                        url: '/ajax/book/category',
                        dataType: 'json',
                        data: {
                            bookId: that.bookId
                        },
                        success: function (response) {
                            if (response.code === 0) {
                                //加入bookid 参数
                                $.extend(response.data, {
                                    bId: that.bookId,
                                    envType: g_data.envType,
                                    authorId: g_data.bookInfo.authorId
                                });
                                //异步加载目录弹窗模板
                                var guidePopup = ejsChinese('/ejs/qd/js/read.qiyan.com/navCatalog.515b9.ejs', response.data);
                                //加入弹窗中
                                catalogBox.html(guidePopup);
                                //标识目录已经加载
                                that.leftNavCatalog = true;
                                //设置展开区域的最大高度
                                $('.left-bar-list .panel-list-wrap').css('max-height', (that.winHeight - 250 ) + 'px');
                                //目录定位到章节
                                showChapter();
                            } else {
                                //标识目录未完成加载
                                that.leftNavCatalog = false;
                                that.catalogAjaxbool = false;
                            }
                        }
                    });

                }

            } else {
                //目录定位到章节
                showChapter();
            }

            //目录定位到章节
            function showChapter() {
                if (g_data.lastPage) return false;
                //获取页面当前显示的章节id
                var nowChapterId = ( g_data.readSetting.rt == 0 ) ? g_data.chapter.id : that.scrollChapter(),
                    chapterDom = $('#nav-chapter-' + nowChapterId),
                    volumeList = chapterDom.parents('.volume-list');
                //移除li选中样式
                catalogBox.find('li.on').removeClass('on');
                //给新的目录章节添加选中样式
                chapterDom.addClass('on');
                //给新的选中章节做展开样式
                volumeList.prev('h3').addClass('cur').siblings('h3').removeClass('cur');
                volumeList.show().siblings('.volume-list').hide();
                //滚动到选中章节区域
                catalogBox.scrollTop(0).scrollTop(chapterDom.offset().top - catalogBox.offset().top);
            }

        },
        /**
         * 目录书签切换
         * @method catalogSwitchTab
         */
        catalogSwitchTab: function (e) {

            var catalogTab = $('#j_catalogTab span'),
                target = $(e.currentTarget),
                catalogTabWrap = $('#j_catalogTabWrap');

            target.addClass('act').siblings().removeClass('act');
            catalogTabWrap.find('.panel-list-wrap').eq(catalogTab.index(target)).show().siblings().hide();

        },
        /**
         * 展开收起目录列表
         * @method extendCatalogList
         */
        extendCatalogList: function (e) {

            //获取目标元素
            var target = $(e.currentTarget);

            //给卷标题绑定事件
            if (target.hasClass('cur')) {
                //收起
                target.removeClass('cur').next('.volume-list').hide();
            } else {
                //展开
                target.addClass('cur').next('.volume-list').show();
            }
        },
        /*
         * 左侧导航获取书签按钮
         * @method addMarker
         * */
        addMarker: function () {

            var that = this,
                markerItem = $('#j_bookMarkList');

            if (!that.leftNavmarker) {
                //标示已经发送ajax求情
                that.leftNavmarker = true;
                //获取是否订阅状态
                $.ajax({
                    type: 'GET',
                    url: '/ajax/chapter/getBookMarkList',
                    dataType: 'json',
                    data: {
                        bookId: that.bookId
                    },
                    success: function (response) {
                        if (response.code === 0) {

                            //加入bookid 参数
                            $.extend(response.data, {
                                bId: that.bookId,
                                authorId: g_data.bookInfo.authorId
                            });
                            //异步加载书签模板
                            var guidePopup = ejsChinese('/ejs/qd/js/read.qiyan.com/navMarker.38dd9.ejs', response.data);
                            //加入弹窗中
                            markerItem.html(guidePopup);
                        } else {
                            //标识目录未加载成功
                            that.leftNavmarker = false;
                        }
                    }
                });
            }
        },
        /**
         * 删除书签
         * @method removeBookMark
         * @param e 事件对象
         */
        removeBookMark: function (e) {
            var target = $(e.currentTarget),
                chapterId = target.data('chapid');

            //删除后下面开始发请求
            $.ajax({
                type: 'GET',
                url: '/ajax/chapter/delBookMark',
                dataType: 'json',
                data: {
                    chapterId: chapterId
                },
                success: function (response) {

                    if (response.code == 0) {
                        $(target).parent('li').remove();
                        //删除章节上书签选中样式，如果dom存在的话
                        var chapterBox = $('#chapter-' + chapterId);
                        if (chapterBox.length != 0) chapterBox.find('.book-mark').removeClass('on');
                        //判断原先书签个数，为0是，显示无书签标识
                        var navMarkList = $('#j_bookMarkList');
                        if (navMarkList.find('li').length == 0) navMarkList.find('.no-data').show();
                        //请求成功后执行提示
                        new LightTip({
                            content: '<div class="simple-tips"><span class="iconfont success">&#xe61d;</span><h3>书签删除成功</h3></div>'
                        }).success();
                        $('.lbf-light-tip-success').prev('.lbf-overlay').remove();
                    } else {
                        //请求失败后执行提示
                        new LightTip({
                            content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>书签删除失败</h3></div>'
                        }).success();
                    }
                }
            });
        },
        /*
         * 加载setiing弹窗
         * @method navSetting
         * @param e 事件对象
         * */
        navSetting: function (e) {

            //获取配置数组
            var that = this,
                settingPop = $('#j_setting');

            //调用选中func
            if (that.leftBtnMethod(e)) {
                that.readSetCancel(e);
                return false;
            }

            //当设置弹窗不存在时,发请求加载,否则显示出来就好
            if (settingPop.length == 0) {

                //异步加载指南弹窗模板
                g_data.readSetting.isPublication = g_data.isPublication;
                g_data.readSetting.salesMode = g_data.salesMode;
                settingPop = ejsChinese('/ejs/qd/js/read.qiyan.com/navSetting.72f7f.ejs', g_data.readSetting);
                that.leftNav.append(settingPop);
                that.subscribeBool = true;

                //赋值
                $.extend(that.zanshiSetting, g_data.readSetting);

                // 判断用户是否登录
                if (Login.isLogin()) {
                    //获取是否订阅状态
                    $.ajax({
                        type: 'GET',
                        url: '/ajax/chapter/getSubscribeSet',
                        dataType: 'json',
                        data: {
                            bookId: that.bookId
                        },
                        success: function (response) {
                            if (response.code === 0) {
                                g_data.readSetting.autoBuy = response.data.autoBuy;
                                that.zanshiSetting.autoBuy = response.data.autoBuy;
                                //用户之前是否订阅过本书标识
                                that.subscribeBookChapter = response.data.isSubscriber;
                                if (response.data.autoBuy == 1 && that.subscribeBookChapter == 1) {
                                    $('#j_autoSwitch').trigger('click');
                                }
                            }
                        }
                    });
                }

            } else {
                settingPop.show();
            }

        },
        /**
         *  切换主题、字体、阅读方式时的高亮效果
         *  @method switchStyle
         *  @param e 事件对象
         */
        switchStyle: function (e) {

            var that = this,
                target = $(e.currentTarget),
                targetNum = parseInt(target.data('st')),
                wList = ['640', '800', '900', '1280'],
                parentId = target.parents('li').attr('id');

            target.addClass('act').siblings().removeClass('act');

            //判断父亲节点的id
            switch (parentId) {
                case 'j_themeList':
                    //修改页面整体样式
                    that.bodyDom.attr('class', 'theme-' + targetNum + ' w' + wList[that.zanshiSetting.w]);
                    that.zanshiSetting.t = parseInt(target.data('stc'));
                    break;
                case 'j_fontFamily':
                    //修改正文字体
                    that.readMainWrap.attr('class', 'read-main-wrap font-family0' + ( targetNum + 1 ));
                    that.zanshiSetting.ft = targetNum;
                    break;
                case 'j_readMode':
                    //设置阅读模式
                    that.zanshiSetting.rt = targetNum;
                    break;
            }

        },
        /*
         * 阅读字体设置
         * @method fontSizeSet
         * @param e 事件对象
         * */
        fontSizeSet: function (e) {

            var that = this,
                target = $(e.currentTarget),
                sizeBox = target.parents('#j_fontSize');
            sizeDom = target.parents('#j_fontSize').find('.lang'),
                sizeNum = parseInt(sizeDom.text());

            if (target.hasClass('prev') && sizeNum > 12) {
                sizeNum = sizeNum - 2;
            } else if (target.hasClass('next') && sizeNum < 48) {
                sizeNum = sizeNum + 2;
            } else {
                return false;
            }
            that.readMainWrap.css('font-size', sizeNum + 'px');
            sizeDom.text(sizeNum);
            that.zanshiSetting.fs = (sizeNum - 12 ) / 2;


            //数据绑定
            var fs = that.zanshiSetting.fs;
            report.send(e, {
                eid: (fs == 0 ) ? 'qd_R48' : 'qd_R' + ( 55 + fs )
            }, 'l1');
        },
        /*
         * 阅读正文宽度设置
         * @method WidthSet
         * @param e 事件对象
         * */
        widthSet: function (e) {

            var that = this,
                target = $(e.currentTarget),
                widthDom = target.parents('#j_pageWidth').find('.lang'),
                widthNum = parseInt(widthDom.text()),
                wList = ['640', '800', '900', '1280'],
                screenWidth = $(window).width(),
                numId;

            //获取宽度排序
            switch (widthNum) {
                case 640 :
                    numId = 0;
                    break;
                case 800 :
                    numId = 1;
                    break;
                case 900 :
                    numId = 2;
                    break;
                case 1280 :
                    numId = 3;
                    break;
            }

            //宽度为减小时,且w>640执行
            if (target.hasClass('prev') && numId > 0) {
                that.zanshiSetting.w = numId - 1;
                //宽度为加大,不为最大宽度限时,且判断屏幕宽度+100 大于下次需要增加到的宽度时,
            } else if (target.hasClass('next') && numId < 3 && wList[numId + 1] <= screenWidth - 180) {
                that.zanshiSetting.w = numId + 1;
            } else {
                return false;
            }
            //主题
            var themeTypeList = [0, 2, 0, 3, 5, 5, 4, 6, 1],
                themeType = themeTypeList[that.zanshiSetting.t];
            //设置宽度
            that.bodyDom.attr('class', 'theme-' + themeType + ' w' + wList[that.zanshiSetting.w]);
            widthDom.text(wList[that.zanshiSetting.w]);

            $(window).trigger('resize');

            //数据绑定
            var w = that.zanshiSetting.w;
            report.send(e, {
                eid: 'qd_R' + ( 52 + w )
            }, 'l1');

        },
        /*
         * 阅读设置保存
         * @method readSetSave
         * @param e 事件对象
         * */
        readSetSave: function (e) {
            var that = this;
            //是否自动订阅
            if ($('#j_SubscribeAuto').hasClass('off')) {
                that.zanshiSetting.autoBuy = 0;
            } else {
                that.zanshiSetting.autoBuy = 1;
            }
            //如果设置对比有修改,发送ajax请求,并显示保存设置
            if (g_data.readSetting != that.zanshiSetting) {
                var zsSet = that.zanshiSetting,
                    cookieSetData = zsSet.t + '|' + zsSet.fs + '|' + zsSet.ft + '|' + zsSet.rt + '|' + zsSet.w;
                //判断阅读模式是否变化,是否为阅读页
                var readTypeBool = 0;
                if (g_data.readSetting.rt != zsSet.rt && g_data.chapter != undefined) {
                    readTypeBool = 1;
                }

                //设置保存cookie,不包括是否订阅配置 ,时长 1年 365天
                Cookie.set('qdrs', cookieSetData, 'qiyan.com', '/', 86400000 * 365);
                // 判断用户是否登录,登录,发送ajax在服务器保存用户设置,包括是否订阅
                if (Login.isLogin()) {
                    $.ajax({
                        type: 'POST',
                        url: '/ajax/chapter/saveUserSetting',
                        dataType: 'json',
                        data: {
                            setting: cookieSetData,
                            autoBuy: that.zanshiSetting.autoBuy,
                            bookId: that.bookId
                        },
                        success: function (response) {
                            if (response.code === 0) {
                                //服务器端保存成功
                            }
                        }
                    });
                }
                //把暂存配置存入保存设置中
                $.extend(g_data.readSetting, that.zanshiSetting);

                if (readTypeBool) {
                    if (that.readTypeCallBack) that.readTypeCallBack(zsSet.rt);
                }
            }
            that.closeLeftPanel(e);
        },
        /*
         * 阅读设置取消,不保存
         * @method readSetSave
         * */
        readSetCancel: function (e) {
            var that = this,
                setWidth = ['640', '800', '900', '1280'];
            //暂存设置重置回保存设置
            $.extend(that.zanshiSetting, g_data.readSetting);

            //主题
            var themeTypeList = [0, 2, 0, 3, 5, 5, 4, 6, 1],
                themeType = themeTypeList[that.zanshiSetting.t];
            //页面重置
            that.bodyDom.attr('class', 'theme-' + themeType + ' w' + setWidth[that.zanshiSetting.w]);
            that.readMainWrap.attr('class', 'read-main-wrap font-family0' + ( that.zanshiSetting.ft + 1 ));
            that.readMainWrap.css('font-size', ( 12 + that.zanshiSetting.fs * 2 ) + 'px');
            //设置弹窗重置回系统保存的设置配置
            $('#j_themeList span').eq(themeType).addClass('act').siblings().removeClass('act');
            $('#j_fontFamily span').eq(that.zanshiSetting.ft).addClass('act').siblings().removeClass('act');
            $('#j_fontSize .lang').text(12 + that.zanshiSetting.fs * 2);
            $('#j_pageWidth .lang').text(setWidth[that.zanshiSetting.w]);
            $('#j_readMode span').eq(that.zanshiSetting.rt).addClass('act').siblings().removeClass('act');
            //判断是否自动订阅有改变
            var nowAutoBuy = ( $('#j_SubscribeAuto').hasClass('off') ) ? 0 : 1;
            if (nowAutoBuy != that.zanshiSetting.autoBuy) {
                $('#j_autoSwitch').trigger('click');
            }
            that.closeLeftPanel(e);
        },
        /**
         * 开启关闭自动订阅
         * @method subscribeSwitch
         * @param e 事件对象
         */
        subscribeSwitch: function (e) {
            var that = this;
            // 判断用户是否登录
            if (Login.isLogin()) {
                //订阅过本书章节，可以操作
                if (that.subscribeBookChapter == 1) {

                    var target = $(e.currentTarget),
                        targetBox = target.parent(),
                        targetVoice = target.parents('.remind').find('.remind-voice');

                    if (targetBox.hasClass('off')) {
                        targetBox.addClass('on').removeClass('off');
                        target.css({left: "20px"});
                        if (Cookie.get('lang') == 'zht') {
                            target.text('開啟');
                            target.attr('title', '關閉自動訂閱下壹章');
                            targetVoice.text('關閉自動訂閱下壹章');
                        } else {
                            target.text('开启');
                            target.attr('title', '关闭自动订阅下一章');
                            targetVoice.text('关闭自动订阅下一章');
                        }
                        //数据绑定
                        report.send(e, {
                            eid: 'qd_R74'
                        }, 'l1');
                    } else {
                        targetBox.addClass('off').removeClass('on');
                        target.css({left: "0"});
                        if (Cookie.get('lang') == 'zht') {
                            target.text('關閉');
                            target.attr('title', '不再展示訂閱提醒,自動訂閱下壹章');
                            targetVoice.text('不再展示訂閱提醒,自動訂閱下壹章');
                        } else {
                            target.text('关闭');
                            target.attr('title', '不再展示订阅提醒,自动订阅下一章');
                            targetVoice.text('不再展示订阅提醒,自动订阅下一章');
                        }
                        //数据绑定
                        report.send(e, {
                            eid: 'qd_R75'
                        }, 'l1');
                    }
                    //您尚未订阅过本书章节，无法操作！
                } else {
                    new LightTip({
                        content: '<div class="simple-tips"><p>您尚未订阅过本书章节，无法操作</p></div>'
                    }).success();
                }
                //未登录,弹出登录弹窗
            } else {
                Login.showLoginPopup();
            }
        },
        /**
         * 加入书架
         * @method addToBookShelf
         * @param e 事件对象
         */
        addToBookShelf: function (e) {
            //引用Addbook.js中的加入书架方法
            Addbook.addToBookShelf(e, 'blue-btn', 'in-shelf');
        },
        /*
         * 游戏弹窗
         * @method navGame
         * @param e 事件对象
         * */
        navGame: function (e) {

            var that = this,
                gamePop = $('#j_game'),
                navGameBtn = $('#j_navGameBtn'),
                redPoint = navGameBtn.find('.red-point'),
                redEndTime = parseInt(redPoint.attr('data-endtime'));

            //点击后消除红点
            redPoint.remove();

            var env = g_data.envType == 'pro' ? '' : g_data.envType;
            //设置红点cookie
            Cookie.set('redPoint', 1, env + 'read.qiyan.com', '', redEndTime);

            //调用选中func
            if (that.leftBtnMethod(e)) return false;

            //如果没有
            if (gamePop.length == 0) {
                //把弹窗加入左侧导航中
                that.leftNav.append(that.gameDom);
            } else {
                gamePop.show();
            }
        },
        /**
         * 返回页面顶部
         * @method goPageTop
         */
        goPageTop: function () {
            $('body,html').animate({scrollTop: 0}, 220);
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
        /*
         * 判断滚动条滚到哪一章节
         * @method scrollChapter
         * @return (num) 章节id
         * */
        scrollChapter: function () {

            //获取所有章节list
            var chapterList = $('.text-wrap'),
                win = $(window),
                scHeight = win.height(),
                scrollTop = win.scrollTop() + scHeight / 2;
            //章节遍历
            var chapterIdList = chapterList.map(function () {
                var that = $(this),
                //获取当前章节距离页面顶部的距离
                    chapterItem = that.offset().top;
                //当章节scrollTop 小于 当前屏幕显示距顶部距离时,获取返回改章节id
                if (chapterItem < scrollTop) return that.data('cid');
            });
            //返回当前显示的章节id
            return chapterIdList[chapterIdList.length - 1];

        },
        /*
         * 窗体改变时,改变高度
         * @method windowResize
         * */
        windowResize: function () {

            var that = this;

            $(window).on('resize', function () {

                var screenWidth = parseInt($(this).width()),
                    ChapterWidth = parseInt($('#j_readMainWrap').width());

                if (screenWidth < ChapterWidth + 136) {
                    $('#j_floatWrap').addClass('fix-float-wrap');
                } else {
                    $('#j_floatWrap').removeClass('fix-float-wrap');
                }

                if (screenWidth < ChapterWidth + 42) {
                    $('#j_floatWrap').addClass('left-bar-guide');
                } else {
                    $('#j_floatWrap').removeClass('left-bar-guide');
                }

                //当高度改变,去重置
                if (that.winHeight != $(this).height()) {
                    //重置
                    that.winHeight = $(this).height();
                    //主动触发窗体滚动
                    $(this).trigger('scroll');
                    //设置展开区域的最大高度
                    $('.left-bar-list .panel-list-wrap').css('max-height', (that.winHeight - 250 ) + 'px');
                }

            }).trigger('resize');
        },
        /*
         * 对左侧导航增加书签操作
         * @method navMarkAddReset
         * @param  chapterId  章节id
         * @param  chapterUrl  章节url
         * @param  chapterName  章节名称
         */
        navMarkAddReset: function (chapterId, chapterUrl, chapterName) {

            var that = this;
            //判断用户是否已经拉取,没有拉取不更新数据
            if (that.leftNavmarker) {
                //获取年月日
                var d = new Date(),
                    monthNum = d.getMonth() + 1,
                    monthNum = ( monthNum > 9 ) ? monthNum : ('0' + monthNum ),
                    dayNum = d.getDate(),
                    dayNum = ( dayNum > 9 ) ? dayNum : ('0' + dayNum );
                var dateStr = d.getFullYear() + '-' + monthNum + '-' + dayNum;

                var navMarkBox = $('#j_bookMarkList'),
                    navMarkList = navMarkBox.find('ul');
                //判断原先书签个数，为0是，隐藏无书签标识
                if (navMarkList.find('li').length == 0) navMarkBox.find('.no-data').hide();
                //添加书签
                navMarkList.append('<li id="nav-mark-' + chapterId + '"><a class="iconfont delete" href="javascript:"  data-chapid="' + chapterId + '" data-cid="' + chapterUrl + '" data-bid="' + that.bookId + '" data-auid="' + g_data.bookInfo.authorId + '" data-eid="qd_R44">&#xe659;</a><div class="mark-info"><a href="' + chapterUrl + '" class="bookmark-link">' + chapterName + '<cite>' + dateStr + '</cite></a></div></li>');
            }

        },
        /*
         * 对左侧导航删除书签操作
         * @method navMarkDelReset
         * @param  chapterId  章节id
         */
        navMarkDelReset: function (chapterId) {
            var that = this;
            //判断用户是否已经拉取,没有拉取不更新数据
            if (that.leftNavmarker) {
                //删除书签
                $('#nav-mark-' + chapterId).remove();
                //获取书签列表
                var navMarkBox = $('#j_bookMarkList'),
                    navMarkList = navMarkBox.find('ul');
                //判断原先书签个数，为0是，显示无书签标识
                if (navMarkList.find('li').length == 0) navMarkBox.find('.no-data').show();
            }
        },
        /*
         * 手机阅读
         * @method mobilePhoneRead
         * @param e
         */
        mobilePhoneRead: function (e) {

            var that = this,
                phoneReadPop = $('#j_cellphone'),
                chapterId = ( g_data.lastPage ) ? 0 : ( g_data.readSetting.rt == 0) ? g_data.chapter.id : that.scrollChapter();

            //调用选中func
            if (that.leftBtnMethod(e)) return false;

            //判断弹窗是否存在
            if (phoneReadPop.length != 0) {
                //书末页
                if (g_data.lastPage) {
                    //显示弹窗
                    phoneReadPop.show();
                } else {

                    phoneReadPop.show();

                    if (that.readPhoneChapterId != chapterId) {
                        phoneReadPop.find('.j_codeImg').attr('src', '');
                        //调用2维码接口
                        that.mobilePhoneReadAjax(chapterId);
                    }
                }
                //页面中无该dom时
            } else {
                //ejs模版加载
                phoneReadPop = ejsChinese('/ejs/qd/js/read.qiyan.com/navPhoneRead.ea24c.ejs', null);
                that.leftNav.append(phoneReadPop);
                //调用2维码接口
                that.mobilePhoneReadAjax(chapterId);
            }

        },
        /*
         * 手机阅读接口
         * @method mobilePhoneReadAjax
         * @param chapterId 章节id
         */
        mobilePhoneReadAjax: function (chapterId) {

            var that = this;
            //获取手机阅读二维码
            $.ajax({
                type: 'GET',
                url: '/ajax/chapter/getChapterQRCode',
                dataType: 'json',
                data: {
                    bookId: that.bookId,
                    chapterId: chapterId
                },
                success: function (response) {
                    if (response.code == 0) {
                        //显示2维码
                        $('#j_cellphone .j_codeImg').attr('src', response.data.qrCode);
                        that.readPhoneChapterId = chapterId;
                    }

                }
            });
        }
    })
});


/**
 * @fileOverview
 * @author liuwentao
 * Created: 16/10/11
 */
LBF.define('qd/js/read.qiyan.com/ejsChinese.a35d9.js', function (require, exports, module) {

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
        ejsChinese = require('qd/js/read.qiyan.com/ejsChinese.a35d9.js'),
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
 * @fileOverview
 * @author  yangye & liuwentao
 * Created: 2016-9-19
 */
LBF.define('qd/js/read.qiyan.com/discussTalk.fbd5e.js', function (require, exports, module) {

    var
        Node = require('ui.Nodes.Node'),
        ajaxSetting = require('qd/js/component/ajaxSetting.84b88.js'),
        Cookie = require('util.Cookie'),
        Loading = require('qd/js/component/loading.aa676.js'),
        LightTip = require('ui.widget.LightTip.LightTip'),
        Login = require('qd/js/component/login.a4de6.js'),
        ejsChinese = require('qd/js/read.qiyan.com/ejsChinese.a35d9.js');

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
            //打开即时讨论
            'click #j_hongbao': 'openDiscussWrap',
            //关闭即时讨论
            'click #j_discussWrap .close-panel': 'closeDiscussWrap',
            //选择红包
            'click #j_chooseRedPacketBtn' : 'chooseRedPacketPop',
            //点击去编辑发红包按钮
            'click .j_toEditredPacket':'isGetRedPacketSetting',
            //查看讨论list历史记录
            'click #j_discussHistory' : 'historyDiscuss',
            //刷新讨论list
            'click #j_discussReload' : 'reloadDiscuss',
            //关闭选择红包按钮pop
            'click .j_closeRedPop' : 'closeRedPop',
            //移除选择红包按钮pop
            'click .j_removeRedPop' : 'removeRedPop',
            //限制只能输入数字
            'keyup .j_RpNum , .j_RpPrice' : 'rpNumKeyUp',
            //红包数量判断
            'blur .j_RpNum' : 'rpNumJudge',
            //红包金额判断
            'blur .j_RpPrice' : 'rpPriceJudge',
            //红包文字
            'blur .j_RpDesc' : 'rpDescJudge',
            //发红包校验(先获取uuid , then 再提交发红包 )
            'click .j_sendRedPacketBtn' : 'getRedPacketUuid',
            //点击红包状态
            'click .j_redPacketShow' : 'redPacketStatusPop',
            //点击拆红包
            'click .j_grabRedPacket' : 'openRedPacket',
            //获取红包详情
            'click .j_rpInfoBtn' : 'getRedPacketInfo',
            //加载更多红包详情
            'click #j_rpInfoload' : 'reloadRedPacketInfo'
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

            //分类id
            that.chanId = $('#j_chanId').data('chanid'); 

            //红包相关信息  红包种类 type  红包数量 num  红包总额 price 红包文案desc
            that.redPacket = {};

            that.redPageIndex = 1 ;

            //实例化loading.js
            this.loading = new Loading({});

            //判断是否已经拉取了红包配置参数
            that.redSettingBool = false ;

            //初始化红包配置
            that.redPacketSet = {
                "cntMin": {
                    com: 5,
                    monthTicket: 5,
                    recTicket : 5
                },
                cntMax: {
                    com : 300,
                    monthTicket : 100,
                    recTicket : 300
                },
                priceSingleMin : {
                    com : 10,
                    monthTicket : 500,
                    recTicket : 20
                },
                priceSingleMax : {
                    com : 20000,
                    monthTicket : 20000,
                    recTicket : 20000
                },
                poundage : {
                    com: 0 ,
                    comDesc : "活动期间免手续费",
                    monthTicket : 0,
                    monthTicketDesc : "活动期间免手续费",
                    recTicket : 0,
                    recTicketDesc : "活动期间免手续费"
                },
                desc : "有钱就是任性|请和我土豪做朋友|大小红包都是爱|子曰：有红包的书不断更|红包发的好，章节更新早|红包发的勤，追更不会停|楼下继续发红包"
            }

        },
        /**
         * 打开讨论浮层
         * @method openDiscussWrap
         */
        openDiscussWrap: function (e) {

            var that = this,
                target = $(e.currentTarget);
            //判断用户是否登录
            if (Login.isLogin()) {
                if( target.hasClass('discussShow') ){
                    that.closeDiscussWrap(e);
                    target.removeClass('discussShow');
                }else{
                    target.addClass('discussShow');
                    var discussPop = $('#j_discussWrap');
                    //如果没有加载讨论浮层,拉去ejs模版加载
                    if( discussPop.length == 0 ){
                        //异步加载书签模板
                        var discussPop = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/discussTalk.6fb9a.ejs' , null);
                        //加入页面中
                        $('body').append(discussPop);
                        //首次拉取数据
                        that.loadRedPacket( 0 , 0 );
                        //拉取红包配置
                        that.redpacketSet();
                    } else {
                        discussPop.fadeIn(200);
                        //更新最新数据
                        that.reloadDiscuss();
                    }
                }
            }else{
                Login.showLoginPopup() ;
            }

        },
        /**
        * 拉取红包配置
        * @method redpacketSet
        * @param callBack 回调函数
        */
        redpacketSet : function( callBack ){

            var that = this;
            
            if( that.redSettingBool ) return false;
            //拉取红包配置
            $.ajax({
                method: 'GET',
                url: '/ajax/luckyMoney/getConf',
                dataType: 'json',
                success: function (response) {
                    if( response.code == 0 ){
                        //获取系统配置，覆盖默认值
                        $.extend( that.redPacketSet , response.data );
                        that.redSettingBool = true ;
                    }
                    if( callBack ) callBack( response );
                }

            })
        },
        /**
         * 关闭讨论浮层
         * @method closeDiscussWrap
         */
        closeDiscussWrap: function () {
            $('#j_discussWrap').hide();
            $('#j_hongbao').removeClass('discussShow');
        },
        /**
        * 加载讨论红包列表信息
        * @method loadRedPacket
        * @param  redPacketTime   上次拉去数据的时间戳  第一次拉取为0
        * @param  type   第一次调用 :0  , 刷新: 1  ,  历史记录: 2
        * @param  pageIndex    当前书页index
        * @param  callBack
        * */
        loadRedPacket : function ( redPacketTime , type , pageIndex ,  callBack) {

            var that = this ;

            $.ajax({
                method: 'GET',
                url: '/ajax/luckyMoney/getLuckyMoneyList',
                dataType: 'json',
                data: {
                    bookId : that.bookId ,
                    pageSize : 50 ,
                    pageIndex : pageIndex ,
                    timeSpan : redPacketTime
                },
                success: function (response) {
                    if( response.code == 0 ){
                        var data = response.data;
                        //当首次加载 或者 获取有新的信息,渲染ejs
                        var chartLen = data.chartList.length ;
                        var discussTalkList = '';
                        if( type == 0 || type == 1 || chartLen != 0 ){
                            //获取ejs所需要的参数
                            data.mePreFix = g_data.pageJson.mePreFix;
                            //异步加载讨论区list模板
                            discussTalkList = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/discussTalkList.bad51.ejs' , data );
                        }

                        switch(type){
                            //第一次拉取数据
                            case 0 :
                                $('#j_discussMesBox').show();
                                $('#j_discussWrap').find('.loading').hide();
                            //刷新
                            case 1:
                                //加入讨论列表中
                                $('#j_discussMesList').html(discussTalkList);
                                $('.j_discussReloading').hide();
                                if( chartLen < 50 ) $('#j_discussHistory').hide();
                                that.redPageIndex = 1;
                                $('.discuss-list-wrap').scrollTop($('#j_discussMesBox').outerHeight(true) );
                                break;
                            //查看历史调用
                            case 2:
                                var oldHeight = $('#j_discussMesBox').outerHeight(true) ;
                                //加入讨论列表中
                                $('#j_discussMesList').prepend(discussTalkList);
                                //加载load隐藏
                                $('.j_discussHistoryLoad').hide();
                                //拉去数据时,判断拉去数据是否大于需要拉取的数据条数,小于查看历史不显示
                                if( chartLen < 50 ) $('#j_discussHistory').hide();
                                setTimeout(function () {
                                    $('.discuss-list-wrap').scrollTop($('#j_discussMesBox').outerHeight(true) - oldHeight );
                                }, 20);
                                break;
                        }

                    }
                    //回调函数
                    if( callBack ) callBack(response);
                }

            })
        },
        /**
        * 刷新讨论list
        * @method reloadDiscuss
        */
        reloadDiscuss : function (){
            //获取当前第一条信息的时间戳
            var that= this;
            //显示loading
            $('.j_discussReloading').show();
            //拉去讨论区数据
            that.loadRedPacket( 0 , 1 , 1 );

        },
        /**
        * 查看讨论list历史记录
        * @method historyDiscuss
        */
        historyDiscuss : function (e){
            //获取当前最后一条信息的时间戳
            var that= this,
                target = $(e.currentTarget);

            if( !target.hasClass('disabled') ){

                target.addClass('disabled');
                //加载load显示
                $('.j_discussHistoryLoad').show();
                //拉去讨论区数据
                ++that.redPageIndex ;
                that.loadRedPacket( 0 , 2 , that.redPageIndex ,function(response){
                    target.removeClass('disabled');
                });
            }   

        },
        /**
        * 选择红包
        * @method chooseRedPacketPop
        * */
        chooseRedPacketPop : function () {
            //判断用户是否登录
            if (Login.isLogin()) {

                //如果没有加载讨论浮层,拉去ejs模版加载
                if ($('#selectRedPacket').length == 0) {
                    //判断书籍是否为 签约 && vip书籍 ,是否可以投月票
                    var data = {
                        signAndVip :  g_data.pageJson.isVip && g_data.pageJson.isSign
                    };
                    //异步加载选择红包模板
                    var selectRedPacketPop = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/selectRedPacket.9938d.ejs', data );
                    //加入页面中
                    $('body').append(selectRedPacketPop);
                }
                //显示弹窗
                $('.red-overlay').fadeIn(200);
                $('#selectRedPacket').fadeIn(200);

            //未登录显示登录框
            } else {
                Login.showLoginPopup();
            }
        },
        /**
        * 判断是否获取了系统配置
        * @method isGetRedPacketSetting
        */
        isGetRedPacketSetting : function (e){
            
            var that = this;

            if( that.redSettingBool ){
                //执行显示就弹窗
                that.editRedPacketPop(e);
            }else{
                that.redpacketSet(function(response){
                    if(response.code == 0 ){
                        //执行显示就弹窗
                        that.editRedPacketPop(e);
                    }
                });
            }
        
        },
        /**
        * 点击去编辑发红包按钮
        * @method  editRedPacketPop
        */
        editRedPacketPop :function(e) {
            var that = this,
                target = $(e.currentTarget);
                redPacketTalkList = that.redPacketSet.desc.split('|');

            //红包种类
            that.redPacket.type = target.data('redtype');
            //随机生成红包寄语
            var num = Math.round(Math.random()*6);

            //红包数量编辑框正确与否判断
            that.rpNumBool = false ;
            //红包金额编辑框正确与否判断
            that.rpPriceBool = false ;
            //判断金额是否已经输入
            that.firstInput = false;
            //红包文案编辑框正确与否判断
            that.rpDescBool = true ;

            //传入ejs的数据
            //红包手续费提示文案
            var poundageTxt = ( that.redPacket.type == 0 ) ? that.redPacketSet.poundage.comDesc :  ( that.redPacket.type == 1 ) ? that.redPacketSet.poundage.monthTicketDesc : that.redPacketSet.poundage.recTicketDesc ;
            var data = $.extend( {} , that.redPacketSet, {
                //红包类型
                redType : that.redPacket.type ,
                desc : redPacketTalkList[num] ,
                poundageTxt : poundageTxt,
                envType: g_data.envType == 'pro' ? '': g_data.envType
            });
            //默认初始化desc
            that.redPacket.desc = redPacketTalkList[num];
            //初始化红包限制
            that.redPacketMinNum = ( that.redPacket.type == 0 ) ? that.redPacketSet.cntMin.com  : ( that.redPacket.type == 1 ) ? that.redPacketSet.cntMin.monthTicket : that.redPacketSet.cntMin.recTicket ;
            that.redPacketMaxNum = ( that.redPacket.type == 0 ) ? that.redPacketSet.cntMax.com  : ( that.redPacket.type == 1 ) ? that.redPacketSet.cntMax.monthTicket : that.redPacketSet.cntMax.recTicket ;
            that.redPacketMinPrice = ( that.redPacket.type == 0 ) ? that.redPacketSet.priceSingleMin.com :  ( that.redPacket.type == 1 ) ? that.redPacketSet.priceSingleMin.monthTicket : that.redPacketSet.priceSingleMin.recTicket ;
            that.redPacketMaxPrice = ( that.redPacket.type == 0 ) ? that.redPacketSet.priceSingleMax.com :  ( that.redPacket.type == 1 ) ? that.redPacketSet.priceSingleMax.monthTicket : that.redPacketSet.priceSingleMax.recTicket ;
            that.poundage = ( that.redPacket.type == 0 ) ? that.redPacketSet.poundage.com :  ( that.redPacket.type == 1 ) ? that.redPacketSet.poundage.monthTicket : that.redPacketSet.poundage.recTicket ;

            //渲染弹窗
            $('#j_editRedPacket').remove();
            var editRedPacketPop = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/editRedPacket.fbd3f.ejs' , data );
            //加入页面中
            $('body').append(editRedPacketPop);
            $('#selectRedPacket').hide();
            $('#j_editRedPacket').fadeIn(200);

            // 判断浏览器是否支持 placeholder
            if (!('placeholder' in document.createElement('input'))) {
                $('[placeholder]').focus(function () {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                        input.removeClass('placeholder');
                    }
                }).blur(function () {
                    var input = $(this);
                    if (input.val() == '' || input.val() == input.attr('placeholder')) {
                        input.addClass('placeholder');
                        input.val(input.attr('placeholder'));
                    }
                }).blur();
            }

            //获取uuid,渲染弹窗
            /*that.getRedPacketUuid( function( response ){

                $('#j_editRedPacket').remove();
                var editRedPacketPop = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/editRedPacket.fbd3f.ejs' , data );
                //加入页面中
                $('body').append(editRedPacketPop);
                $('#selectRedPacket').hide();
                $('#j_editRedPacket').fadeIn(200);

                // 判断浏览器是否支持 placeholder
                if (!('placeholder' in document.createElement('input'))) {
                    $('[placeholder]').focus(function () {
                        var input = $(this);
                        if (input.val() == input.attr('placeholder')) {
                            input.val('');
                            input.removeClass('placeholder');
                        }
                    }).blur(function () {
                        var input = $(this);
                        if (input.val() == '' || input.val() == input.attr('placeholder')) {
                            input.addClass('placeholder');
                            input.val(input.attr('placeholder'));
                        }
                    }).blur();
                }
            
            });*/

        },
        /**
        * 获取红包uuid
        * @method getRedPacketUuid
        * @param callBack 回调函数
        */
        getRedPacketUuid : function( e ){

            var that = this;

            //初始化uuid
            that.redPacketUuid = '';

            //获取uuid
            $.ajax({
                method: 'GET',
                url: '/ajax/luckyMoney/getUUID',
                dataType: 'json',
                data: {
                    bookId : that.bookId
                },
                success: function (response) {
                    if( response.code == 0 ){
                        that.redPacketUuid = response.data.uuid ;
                        //校验完成，发红包
                        that.sendRedPacket(e);
                    }else{
                        new LightTip({
                            content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>' + response.msg + '</h3></div>'
                        }).success();
                    }
                }

            });

        },
        /**
        * 通用关闭红包弹窗
        * @method closeRedPop
        * */
        closeRedPop:function (e) {
            var target = $(e.currentTarget);
            $('.red-overlay').fadeOut(200);
            target.parents('.red-packet-pop').fadeOut(200);
        },
        /**
        * 移除红包弹窗
        * @method j_removeRedPop
        */
        removeRedPop : function(e){
            var target = $(e.currentTarget);
            $('.red-overlay').fadeOut(200);
            target.parents('.red-packet-pop').fadeOut(200,function(){
                $(this).remove();
            });
        },
        /**
        * 红包数量判断
        * @method RpNumJudge
        *
        */
        rpNumJudge : function(e){

            var that = this,
                target = $(e.currentTarget);

            //红包数量
            that.redPacket.num = target.val();
            //当输入为空时,为0
            that.redPacket.num = ( that.redPacket.num == '' ) ? 0 : parseInt(that.redPacket.num) ;

            //设置红包最大最小值
            var minNum = that.redPacketMinNum,
                maxNum = that.redPacketMaxNum;
            //如果输入为空时,或红包数量不符合要求
            if( that.redPacket.num < minNum || that.redPacket.num > maxNum ){
                target.parents('.input-box').addClass('error').next('p').addClass('tip');
                that.rpNumBool = false ;
            }else{
                target.parents('.input-box').removeClass('error').next('p').removeClass('tip');
                that.rpNumBool = true ;
            }

            //红包金额判断
            if( that.firstInput ) $('.j_RpPrice').trigger('blur');
            //判断是否可以发红包按钮
            that.isSendRedPacket();


        },
        /**
        * 红包金额判断
        * @method rpPriceJudge
        */
        rpPriceJudge : function(e){

            var that = this,
                target = $(e.currentTarget);

            that.firstInput = true;    

            that.redPacket.price = target.val();
            //当输入为空时,为0
            that.redPacket.price = ( that.redPacket.price == '' ) ? 0 : parseInt(that.redPacket.price) ;
            //设置红包最大最小值
            var averageMinPrice = that.redPacketMinPrice;
            var averageMaxPrice = that.redPacketMaxPrice;
            //获取红包个数
            var redMinNum =  that.redPacketMinNum ;
            var redPacketNum = ( that.redPacket.num == '' || that.redPacket.num < redMinNum ) ? redMinNum : parseInt(that.redPacket.num) ;

            //如果输入为空时,或红包数量不符合要求
            if( that.redPacket.price < averageMinPrice * redPacketNum || that.redPacket.price > averageMaxPrice * redPacketNum ){
                target.parents('.input-box').addClass('error').next('p').addClass('tip');
                 that.rpPriceBool = false ;
            }else{
                target.parents('.input-box').removeClass('error').next('p').removeClass('tip');
                 that.rpPriceBool = true ;
            }

            //判断是否可以发红包按钮
            that.isSendRedPacket();

        },
        /**
        * 红包文案验证
        * @method rpDescJudge
        */
        rpDescJudge : function(e){

            var that = this,
                target = $(e.currentTarget);

            that.redPacket.desc = $.trim(target.val());

            //当文案为空或者大于25个字时，提示error
            if( that.redPacket.desc == '' || that.redPacket.desc.length > 25 ){
                target.parents('.input-box').addClass('error').next('p').show();
                that.rpDescBool = false ;
            }else{
                target.parents('.input-box').removeClass('error').next('p').hide();
                that.rpDescBool = true ;
            }
            //判断是否可以发红包按钮
            that.isSendRedPacket();
        },
        /**
        * 限制只能输入数字
        * @method rpNumKeyUp
        */
        rpNumKeyUp : function(e){

            var that = this ,
                target = $(e.currentTarget),
                targetVal = target.val();
            //判断发现输入的不为数字,立马删除
            targetVal = targetVal.replace(/\D/g, "");
            target.val(targetVal);

            if(target.hasClass('j_RpPrice')){
                var redPacketBox = target.parents('.red-packet-pop'),
                    priceTotal = (targetVal == '') ? 0 : parseInt(targetVal),
                    poundPrice = 0 ;

                if( that.poundage != 0 ){
                    poundPrice = Math.ceil( priceTotal *  that.poundage ) ;
                    priceTotal = priceTotal + poundPrice ;
                    //显示
                    var poundPriceTxt = ( poundPrice == 0 ) ? '': '(含手续费' + poundPrice + ')';
                    redPacketBox.find('.j_totalPoundage').text( poundPriceTxt );
                }
                //重置总金额
                redPacketBox.find('.j_totalCion').text( priceTotal );
            }

        },
        /**
        ＊ 触发是否可以发红包按钮
        ＊ @method isSendRedPacket
        */
        isSendRedPacket:function(){

            $('.j_goRecharge').hide().prev('p').show();
            //当输入信息全部满足要求时，发红包按钮可以触发
            if(this.rpNumBool && this.rpPriceBool && this.rpDescBool ){
                $('.j_sendRedPacketBtn').removeClass('disabled');
            }else{
                $('.j_sendRedPacketBtn').addClass('disabled');
            }
        },

        /**
        * 校验完成，发红包
        * @method  sendRedPacket
        * 
        */
        sendRedPacket : function(e){

            //当前为发红包的表示
            g_data.isScribe = 2;

            var that = this ,
                target = $(e.currentTarget);

            if(!target.hasClass('disabled')){
                var getOrderSucceed;
                //在按钮loading的时候再次点击则不执行逻辑
                if(target.hasClass('btn-loading')){
                    return;
                }
                //显示按钮loading样式
                that.loading.startLoading( target , function(){
                    return getOrderSucceed;
                },200);

                //获取当前阅读章节id
                var nowChapterId = 0 ;
                if( typeof g_data.lastPage == 'undefined' || !g_data.lastPage ){
                    nowChapterId = that.scrollChapter();
                }

                var requiredData =  {
                    //bookId
                    bookId : that.bookId ,
                    // chapterId 阅读页当前视窗内显示的章节id 书末页为 0
                    chapterId : nowChapterId ,
                    //金额类型
                    type : 1,
                    ////红包领取条件类型（0见者有份、1月票专享、2推荐票）
                    ruleType : that.redPacket.type ,
                    //红包金额
                    amount: that.redPacket.price ,
                    //红包数量个数
                    cnt: that.redPacket.num ,
                    //红包文案
                    desc: that.redPacket.desc,
                    //书名
                    bookName : g_data.bookInfo.bookName,
                    //chanId
                    chanId : that.chanId,
                    //红包规则
                    rules : that.redPacket.type ,
                    //???
                    uuid : that.redPacketUuid  ,
                    //作者id
                    authorId : g_data.bookInfo.authorId
                };

                //判断用户是否可以发红包
                $.ajax({
                    method: 'POST',
                    url: '/ajax/luckyMoney/addLuckyMoney',
                    dataType: 'json',
                    data: requiredData ,
                    success: function (response) {

                        switch(response.code){
                            //可以发红包
                            case 0:
                                //获取红包id
                                var data = {
                                        chartList : [],
                                        mePreFix : g_data.pageJson.mePreFix
                                    },
                                    chartItem = response.data;

                                chartItem.isMine = 1;
                                chartItem.isSelf = 1;
                                chartItem.type = 1;
                                chartItem.hongbaoType = that.redPacket.type ;
                                chartItem.hongbaoTitle = that.redPacket.desc;
                                //array add 
                                data.chartList.push(chartItem);
                                //异步加载讨论区list模板
                                var discussTalkList = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/discussTalkList.bad51.ejs' , data );
                                $('#j_discussMesList').append(discussTalkList);
                                $('.discuss-list-wrap').scrollTop($('#j_discussMesBox').outerHeight(true) );
                                //移除弹窗
                                that.removeRedPop(e);
                                break;
                            //余额不足
                            case 2006 :
                                $('.j_goRecharge').show().prev('p').hide();
                                break;
                            case 1070:
                            case 1074:
                            case 1076:
                                $('#j_editRedPacket').hide();
                                $('.red-overlay').hide();
                                //参数1：panel【将当前页面的全局弹窗传递到payment.js中，当前弹窗在VotePopup.js中】
                                that.payment.getPanel(that.panel);
                                //风控
                                that.payment.checkBadPayment( response , {} , 6 ,undefined ,undefined ,function(){});
                                break;
                            default:
                                //请求成功后执行提示
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>' + response.msg + '</h3></div>'
                                }).success();
                                break;
                        }
                        //设置loading结束标识
                        getOrderSucceed = true;
                        that.loading.clearLoading(target);

                    }

                });
            }

        },
        /**
        * 查看红包状态
        * @method  redPacketStatusPop
        *  
        */
        redPacketStatusPop : function(e){

            var that = this ,
                target = $(e.currentTarget),

                redPacketId = target.data('hbid'),
                redPacketType = target.data('hbtype');
            //获取红包文案
            var redPacketDescBox = target.find('.j_redPacketTitle'),
                redPacketDesc = (redPacketDescBox.length == 0) ? target.data('hbt') : redPacketDescBox.text() ;

            var ticketsNum = 0;
            
            $.ajax({
                method: 'GET',
                url: '/ajax/luckyMoney/lookLuckyMoney',
                dataType: 'json',
                data: {
                    hongbaoId : redPacketId ,
                    bookId : that.bookId 
                },
                success: function (response) {

                    if( response.code == 0 ){

                        // 拼接ejs所需要的数据
                        var data = response.data;
                        //只有当红包还可以抢的时候才去判断推荐票，月票可用张数
                        if(data.hongbaoStatus == 2 ){
                            //判断红包类型
                            if( redPacketType == 1 ){
                               that.getMonthTicketNum(function(ticketNum){
                                    ticketsNum = ticketNum;
                                    showGetRedPacket(data);
                               });
                            //为推荐票红包
                            } else if( redPacketType == 2 ){
                                that.getRecomTicketNum(function(ticketNum){
                                    ticketsNum = ticketNum;
                                    showGetRedPacket(data);
                                });
                            //普通红包
                            }else{
                                showGetRedPacket(data);
                            }
                            
                        }else{
                            showGetRedPacket(data);
                        }
                    }else{
                        new LightTip({
                            content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>' + response.msg + '</h3></div>'
                        }).success();
                    }
                }

            });
            //显示红包状态
            function showGetRedPacket(data){
                
                data.redPacketId = redPacketId ;
                data.redPacketDesc = redPacketDesc ;
                data.redPacketType = redPacketType ;
                data.ticketsNum = ticketsNum ;
                data.bookName = g_data.bookInfo.bookName;
                data.showTxt = ( data.hongbaoStatus == 2 ) ? redPacketDesc : ( data.hongbaoStatus == 3 ) ? '手慢了，红包抢完了' : '红包已过期';

                //ejs
                var lookRedPacketPop = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/getRedPacket.64e5a.ejs' , data );
                $('body').append(lookRedPacketPop); 
                $('.red-overlay').fadeIn(200); 
                $('#j_openRedPacket').fadeIn(200);
            }

        },

        /**
        * 获取可用月票张数
        * @method getMonthTicketNum
        * @param callBack 回调方法
        */
        getMonthTicketNum : function( callBack ){

            var that = this ;
            //拉取月票张数信息
             $.ajax({
                method: 'GET',
                url: '/ajax/book/GetUserMonthTicket',
                dataType: 'json',
                data: {
                    //bookId
                    bookId : that.bookId ,
                    //用户等级
                    userLevel : $('#userLevel').text(),
                    //作者id
                    authorId : g_data.bookInfo.authorId
                },
                success: function (response) {

                    if( response.code == 0 ){
                        //处理是否目前还有可用的月票
                        var monthNum = 0 ;
                        if( response.data.status == 0 && response.data.enableCnt > 0){
                            monthNum = response.data.enableCnt ; 
                        }
                        if( callBack ) callBack(monthNum);
                    //获取失败
                    }else{
                        if( callBack ) callBack(0);
                    }
                   
                }
            });
        },
        /**
        * 获取可用推荐票张数
        * @method getRecomTicketNum
        * @param callBack 回调方法
        */
        getRecomTicketNum : function(callBack){

            var that = this ;
            //拉取推荐票张数信息
            $.ajax({
                method: 'GET',
                url: '/ajax/book/GetUserRecomTicket',
                dataType: 'json',
                data: {
                    //bookId
                    bookId : that.bookId ,
                    //用户等级
                    userLevel : $('#userLevel').text()
                },
                success: function (response) {
                    if( response.code == 0 ){
                        //处理是否目前还有可用的推荐票
                        var recomNum = 0 ;
                        if( response.data.status == 0 && response.data.enableCnt > 0){
                            recomNum = response.data.enableCnt ; 
                        }
                          if( callBack ) callBack(recomNum);
                    //获取失败
                    }else{
                        if( callBack ) callBack(0);
                    }
                }

            });
        },
        /**
        * 获取红包详情
        * @method getRedPacketInfo
        * @param e
        */
        getRedPacketInfo : function(e){

            //红包翻转效果
            var that = this ;
            var target = $(e.currentTarget);

            //红包翻转效果
            $('.j_redPacketSatus, .bg-wrap').hide();
            $('.j_redPacketInfo').show();
            //target.parents('.bg-wrap').addClass('filpY');
            
            if( $('.j_redPacketInfo ul li').length == 0 ){
                that.loadRedPacketAjaxInfo(0);
            }
            
        },
        /**
        * 加载红包详情
        * @method loadRedPacketInfoAjax 
        * @param  pageIndex  加载第几页
        * @param callBack  回调函数
        */
        loadRedPacketAjaxInfo : function( pageIndex , callBack ){

            var that = this,
                redPacketBox = $('#j_openRedPacket'),
                redPacketId = redPacketBox.data('hbid');

            $.ajax({
                method: 'GET',
                url: '/ajax/luckyMoney/getLuckyMoneyInfo',
                dataType: 'json',
                data: {
                    hongbaoId : redPacketId ,
                    bookId : that.bookId,
                    pageIndex : pageIndex ,
                    pageNum : 10,
                    authorId : g_data.bookInfo.authorId
                },
                success: function (response) {
                    if( response.code == 0 ){
                        //如果没有红包领取信息
                        if( response.data.hongbaoList.length == 0 ){
                            $('.j_redPacketInfo ul').append('<li class="no-data">无人领取该红包</li>');
                            //loading hide
                            $('.j_redPacketInfo .loading').hide();
                            $('.j_redPacketInfo .j_rpListLoading').hide();
                            $('#j_rpInfoload').addClass('hidden');
                            return false;
                        }
                        //加载ejs模版
                        response.data.mePreFix = g_data.pageJson.mePreFix;
                        var redPacketDetailList = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/redPacketList.913dc.ejs' , response.data );
                        $('.j_redPacketInfo ul').append(redPacketDetailList);
                        //loading hide
                        $('.j_redPacketInfo .loading').hide();
                        $('.j_redPacketInfo .j_rpListLoading').hide();
                        //加载按钮是否显示
                        if( response.data.total > 10 *( pageIndex + 1 )  ){
                            $('#j_rpInfoload').removeClass('hidden');
                        }else{
                            $('#j_rpInfoload').addClass('hidden');
                        }
                        if( callBack ) callBack();

                    }
                }
            });
        } ,
        /**
        * 加载更多红包详情
        * @method reloadRedPacketInfo    
        */
        reloadRedPacketInfo :function(e){

            var that = this,
                target = $(e.currentTarget),
                pageIndex = target.data('pi') + 1 ;

            if(!target.hasClass('disabled')) {

                target.addClass('disabled');

                $('.j_rpListLoading').show();

                that.loadRedPacketAjaxInfo( pageIndex , function(){

                    $('#j_rpInfoload').data('pi',pageIndex);

                    target.removeClass('disabled');  
                
                });
            
            }

        },
        /**
        * 返回抢红包状态
        * @method returnRedPacketStatusPop
        * */
        returnRedPacketStatusPop : function(){
            //红包翻转效果
            $('.j_redPacketSatus').show();
            $('.j_redPacketInfo').hide();
        },
        /**
        * 点击拆红包
        * @method openRedPacket 
        * @param e
        */
        openRedPacket : function(e){

            var that = this ,
                target = $(e.currentTarget),
                sign = target.data('sign'),
                btnBox = target.parents('.btn'),
                redPacketBox = $('.j_redPacketSatus'),
                redPacketId = $('#j_openRedPacket').data('hbid'),
                redPacketDesc = redPacketBox.find('h3').text();

            //当按钮无不可点击标示时，进行请求开红包
            if( !btnBox.hasClass('disabled') ){

                var getOrderSucceed;
                //在按钮loading的时候再次点击则不执行逻辑
                if(target.hasClass('btn-loading')){
                    return;
                }
                //显示按钮loading样式
                that.loading.startLoading( target , function(){
                    return getOrderSucceed;
                },200);
            
                $.ajax({
                    method: 'POST',
                    url: '/ajax/luckyMoney/openLuckyMoneyInfo',
                    dataType: 'json',
                    data: {
                        hongbaoId : redPacketId ,
                        bookId : that.bookId ,
                        chanId : that.chanId , 
                        bookName : g_data.bookInfo.bookName,
                        sign : sign ,
                        authorId : g_data.bookInfo.authorId
                    },
                    success: function (response) {

                        //设置loading结束标识
                        getOrderSucceed = true;
                        that.loading.clearLoading(target);
                        //移除当前弹窗    
                        $('#j_openRedPacket').remove();

                        //处理数据
                        var data = {
                            redPacketId : redPacketId ,
                            redPacketDesc : redPacketDesc ,
                            bookName : g_data.bookInfo.bookName,
                            avatar : redPacketBox.find('.avatar img').attr('src'),
                            userName : redPacketBox.find('.avatar h6').text(),
                            //红包已经抢完
                            hongbaoStatus : 1
                        };

                        switch(response.code){
                            case 0 : 
                                data.isGet = 1 ;
                                data.priceNum = response.data.pieceMoney ; 
                                break;
                            case 1074 :
                                //未绑定手机号,
                                data.isGet = 0 ;
                                data.showTxt = '您未绑定手机号<br><a href="//anquan.qiyan.com/AccountSet/UpdateMoblie.php" target="_blank" class="mobile-bind">去安全中心绑定手机号</a>';
                                break;
                            default:
                                data.isGet = 0 ;
                                data.showTxt = response.msg;
                                break;
                        }
                        //显示用户是否抢到了红包，金额多少
                        var getRedPacketPop = ejsChinese('/ejs/qd/js/read.qiyan.com/redPacket/getRedPacket.64e5a.ejs' , data );
                        $('body').append(getRedPacketPop);  
                        $('#j_openRedPacket').show();

                    }

                });
            }

        }
    })
});























