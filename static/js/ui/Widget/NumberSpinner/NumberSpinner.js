/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 14-5-15 上午11:14
 */
LBF.define('ui.widget.NumberSpinner.NumberSpinner', function(require){
    var isNumber = require('lang.isNumber'),
        extend = require('lang.extend'),
        Node = require('ui.Nodes.Node');

    /**
     * NumberSpinner tools
     * @class NumberSpinner
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Node
     * @constructor
     */
    var NumberSpinner = Node.inherit({
        /**
         * Nodes default UI element，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {
            '$input': '.lbf-numberspinner-input',
            '$decrease': '.lbf-numberspinner-decrease',
            '$increase': '.lbf-numberspinner-increase'
        },

        /**
         * Widget default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'cut .lbf-numberspinner-input': '_inputPropertychange',
            'paste .lbf-numberspinner-input': '_inputPropertychange',
            'keyup .lbf-numberspinner-input': '_inputPropertychange',
            'click .lbf-numberspinner-increase': 'increase',
            'click .lbf-numberspinner-decrease': 'decrease'
        },

        /**
         * Render pagination and append it to it's container if assigned
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var selector = this.get('selector'),
                wrapTemplate = this.template(this.get('wrapTemplate')),
                $selector = this.$(selector),
                disabled = this.get('disabled');

            if(this.get('selector')){
                this.setElement($selector);

                var defualtValue = this.$input.val();

                if(isNumber(defualtValue)){
                    this.set('defaultValue', defualtValue);
                }

            } else {

                // container渲染模式
                this.setElement(wrapTemplate(this.attributes()));
                this.$el.appendTo(this.get('container'));
            }

            // value property
            this.get('defaultValue') && this.val(this.get('defaultValue'));

            // maxlength property
            if(this.get('maxlength')){
                this.$textarea.attr('maxlength', this.get('maxlength'));
                this.$textarea.val((this.$textarea.val() + '').substr(0, this.get('maxlength')));
            }

            // 组件初始状态是够可用
            if(disabled){
                this.disable();
            }

            return this;
        },

        _inputPropertychange: function(){
            var value = parseInt(this.val(), 10);

            // 值为空
            if(this.val() === '') {
                this.$decrease.addClass('lbf-button-disabled');

                this.trigger('error', [this]);
                return;
            }

            // 值为非数字
            if(!value){
                this.val(this.get('min'));
                this.$decrease.addClass('lbf-button-disabled');

                this.trigger('error', [this]);
                return;
            }

            // 值小于最小值，取最小值
            if(value < this.get('min')){
                this.$decrease.addClass('lbf-button-disabled');

                this.trigger('error', [this]);
                return;
            }

            // 值大于最大，取最大值
            if(this.get('max') && value > this.get('max')){
                this.$input.select();
                this.$decrease.removeClass('lbf-button-disabled');
                this.$increase.addClass('lbf-button-disabled');

                this.trigger('error', [this]);
                return;
        }


            if(value == this.get('min')){
                this.$decrease.addClass('lbf-button-disabled');
                this.$increase.removeClass('lbf-button-disabled');
                return;
            }

            if(this.get('max') && value == this.get('max')){
                this.$decrease.removeClass('lbf-button-disabled');
                this.$increase.addClass('lbf-button-disabled');
                return;
            }

            this.$decrease.removeClass('lbf-button-disabled');
            this.$increase.removeClass('lbf-button-disabled');

            this.trigger('change', [this]);

            this.$decrease.removeClass('lbf-button-disabled');

            this.trigger('success', [this]);
        },

        increase: function(){

            // 初始不可用，直接返回
            if(this.disabled){
                return;
            }

            if(this.$increase.is('.lbf-button-disabled')){
                return;
            }

            var value = this.val();

            if(value === ''){
                value = 0;
            }

            value = parseInt(value, 10);

            value = value + this.get('step');

            this.val(value);

            this.trigger('increase', [this]);

            return this;
        },

        decrease: function(){

            // 初始不可用，直接返回
            if(this.disabled){
                return;
            }

            if(this.$decrease.is('.lbf-button-disabled')){
                return;
            }

            var value = parseInt(this.val(), 10);

            value = value - this.get('step');

            this.val(value);

            this.trigger('decrease', [this]);

            return this;
        },

        /**
         * let numberspinner enable
         * @method enable
         */
        enable: function(){
            this.$input.removeAttr("disabled");
            this.$input.removeClass('lbf-text-input-disabled');
            this.$decrease.removeClass('lbf-button-disabled');
            this.$increase.removeClass('lbf-button-disabled');
            this.disabled = false;

            return this;
        },

        /**
         * let numberspinner disable
         * @method disable
         */
        disable: function(){
            this.$input.attr("disabled","disabled");
            this.$input.addClass('lbf-text-input-disabled');
            this.$decrease.addClass('lbf-button-disabled');
            this.$increase.addClass('lbf-button-disabled');
            this.disabled = true;

            return this;
        },

        /**
         * get or set value
         * @method value
         */
        val: function(){
            if(arguments.length === 1){
                this.set('value', arguments[0]);
                this.$input.val(arguments[0]);

                //判断按钮是否可点
                if(this.get('min')){
                    if(arguments[0] > this.get('min')){
                        this.$decrease.removeClass('lbf-button-disabled');
                    }else{
                        this.$decrease.addClass('lbf-button-disabled');
                        //arguments[0] < this.get('min') && this.$input.select();
                    }
                }

                if(this.get('max')){
                    if(arguments[0] < this.get('max')){
                        this.$increase.removeClass('lbf-button-disabled');
                    }else{
                        this.$increase.addClass('lbf-button-disabled');
                        //arguments[0] > this.get('max') &&  this.$input.select();
                    }
                }

                return this;
            }else{
                return this.$input.val();
            }
        }
    });

    NumberSpinner.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            wrapTemplate: [
                '<span class="lbf-numberspinner">',
                    '<input class="lbf-text-input lbf-numberspinner-input" hideFocus="true" value=<%=defaultValue%>>',
                    '<span class="lbf-numberspinner-button">',
                            '<span class="lbf-button lbf-button-disabled lbf-numberspinner-decrease lbf-icon" unselectable="on">&#xe6c6;</span>',
                            '<span class="lbf-button lbf-numberspinner-increase lbf-icon" unselectable="on">&#xe6bf;</span>',
                    '</span>',
                '</span>'
            ].join(''),

            className: false,

            defaultValue: 1,

            min: 1,

            max: false,

            step: 1,

            disabled: false
        }
    });

    return NumberSpinner;
});