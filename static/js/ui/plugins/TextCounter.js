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
});