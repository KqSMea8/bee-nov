/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-27 下午6:59
 */
LBF.define('ui.Nodes.TextInput', function(require){
    var forEach = require('lang.forEach'),
        browser = require('lang.browser'),
        isArray = require('lang.isArray'),
        Node = require('ui.Nodes.Node');

    var isIE = browser.msie,
        IEVerison = parseInt(browser.version, 10),
        isIE9 = isIE && IEVerison === 9;

    /**
     * Base text input component
     * @class TextInput
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
     * @param {Number} [opts.width] Node's width
     * @param {Number} [opts.height] Node's height
     * @param {String} [opts.value] Node's value
     * @param {Number} [opts.maxlength] Node's maxlength
     * @param {String} [opts.placeholder] Node's placeholder
     * @param {Boolean} [opts.readonly] Node is readonly or not
     * @param {Boolean} [opts.disabled] Node is disabled or not
     * @example
     *      new TextInput({
     *          container: 'someContainerSelector',
     *          disabled: true,
     *          maxlength: 100,
     *          placeholder: 'i am placeholder',
     *          validate: function(event, value){
     *              if(!value){
     *                  return new Error('empty is not allowed');
     *              }
     *          },
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
     *      new TextInput({
     *          selector: 'input[name=abc]',
     *          value: 'hello',
     *          readonly: true,
     *          disabled: true
     *      });
     */
    var TextInput = Node.inherit({
        /**
         * Nodes default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'cut': '_inputPropertychange',
            'paste': '_inputPropertychange',
            'keyup': '_inputPropertychange'
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            // render dom
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
            this.prop('placeholder', placeholder);
        },

        /**
         * Remove not only the node itself, but the whole wrap including placeholder label
         * @method remove
         * @chainable
         */
        remove: function(){
            this.trigger('remove', [this]);
            this.$placeholder && this.$placeholder.remove();

            return Node.prototype.remove.apply(this, arguments);
        },

        /**
         * Propertychange the input
         * @method _inputPropertychange
         * @protected
         * @chainable
         */
        _inputPropertychange: function(){
            isIE9 && this.trigger('propertychange');
        },

        /**
         * Set placeholder property. For early version of IE, use label to simulate placeholder
         * @method _setPlaceholder
         * @private
         * @param placeholder
         * @chainable
         */
        _setPlaceholder: function(placeholder){
            var node = this,
            // this.el.getAttribute('placeholder') JQ bug
                placeholder = this.get('placeholder') || this.el.getAttribute('placeholder') || '',
                $placeholder = this.$('<span class="lbf-text-input-placeholder">'+ placeholder +'</span>'),
                pos = node.position();

            if(browser.isIE10Below){
                // new placeholder
                var update = function(){
                    if(node.val() === ''){
                        $placeholder.show();
                        return;
                    }
                    $placeholder.hide();
                };

                if(this.val() !== ''){
                    $placeholder.hide();
                }

                $placeholder
                    .click(function(){
                        node.focus();
                    });

                setTimeout(function(){
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

                this.bind('input propertychange change focus', update);
            }else{
                this.get('placeholder') && this.prop('placeholder', this.get('placeholder'));
            }

            return this;
        }
    });

    var proto = TextInput.prototype;

    /*
     forEach(['bind', 'unbind', 'trigger', 'val', 'focus', 'blur'], function(method){
     proto[method] = function(){
     var $input = this,
     ret = this[method].apply(this, arguments);

     return ret === $input ? this : ret;
     };
     });
     */

    TextInput.include({
        /**
         * @method renderAll
         * @static
         * @param {String|documentElement|jQuery|Node} [selector='input[type=text], input[type=password], input[type=email], input[type=email], input[type=search], input[type=tel], input[type=url]'] Selector of node
         * @param {Object} opts options for node
         * @return {Array} Array of nodes that is rendered
         * @example
         *      var nodeArray = TextInput.renderAll();
         *
         * @example
         *      var nodeArray = TextInput.renderAll('.textinput');
         *
         * @example
         *      var nodeArray = TextInput.renderAll({
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         *
         * @example
         *      var nodeArray = TextInput.renderAll('.textinput', {
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         */
        renderAll: function(selector, opts){
            var SELECTOR = 'input[type=text], input[type=password], input[type=email], input[type=email], input[type=search], input[type=tel], input[type=url]';

            var nodes = [],
                Class = this,
                $ = this.prototype.$;
            if(selector.nodeType || selector.length || typeof selector === 'string') {
                opts = opts || {};
            } else if (selector) {
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
            // input结构模板
            wrapTemplate: [
                '<input class="lbf-text-input" type="<%==type%>" value="<%==value%>" hideFocus="true" />'
            ].join(''),

            // input的类型
            type: 'text',

            // 是否readonly状态
            readonly: false,

            // 是否disabled状态
            disabled: false
        }
    });

    return TextInput;
});
