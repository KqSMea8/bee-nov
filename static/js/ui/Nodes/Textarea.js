/**
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
