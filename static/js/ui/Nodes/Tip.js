/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-12-5 上午11:44
 */
LBF.define('ui.Nodes.Tip', function(require){
    var $ = require('lib.jQuery'),
        extend = require('lang.extend'),
        zIndexGenerator = require('util.zIndexGenerator'),
        Node = require('ui.Nodes.Node'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');

    require('{theme}/lbfUI/css/Tip.css');

    var Tip = Dropdown.inherit({
        /**
         * 缓存，快捷访问，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {
            '$content': '.lbf-tip-content',
            '$arrow': '.lbf-tip-arrow',
            '$arrowBefore': '.lbf-tip-arrow-before',
            '$arrowAfter': '.lbf-tip-arrow-after'
        },

        /**
         * Tip default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'click .lbf-tip-button-close': '_close'
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var that = this,
                wrapTemplate = that.get('wrapTemplate'),
                attributes = that.attributes(),
                trigger = that.get('trigger'),
                isSingle = this.get('isSingle'),
                direction = that.get('direction'),
                align = that.get('align'),
                sort = this.get('sort'),
                adjust = that.get('adjust'),
                show = that.get('show');

            //非单例模式
            if(!isSingle) {
                if(!trigger) {
                    return;
                }

                //缓存
                that.$trigger = $(trigger);
                that.adjust = adjust;
                that.direction = direction;

                Dropdown.prototype.render.apply(this, arguments);

                //Dropdown不支持follow模式
                if(show.mode === 'follow'){
                    that._follow();
                }else{
                    //1、调整arrow带来的位置偏差
                    //2、调整Dropdown从0,0计算，tip默认居中对齐
                    that._adjustArrow();
                }
            } else {
                that.adjust = adjust;
                that.direction = direction;

                Dropdown.prototype.render.apply(this, arguments);
            }

            sort && this.addClass('lbf-tip-'+sort);

            this.hide();

            return this;
        },

        _follow: function(){
            var y0,
                x0,
                that = this,
                triggerPos = {
                    top: that.$trigger.offset().top + $(window).scrollTop(),
                    left: that.$trigger.offset().left + $(window).scrollLeft()
                };

                that.adjust = {
                    x: 12,
                    y: 12
                };


            that.$trigger.hover(
                function(e){
                    y0 = e.pageY,
                    x0 = e.pageX;
                    containerOffset =that.$trigger.offsetParent().offset();

                    that.css({
                        top: y0 - containerOffset.top + that.adjust.y,
                        left: x0 - containerOffset.left + that.adjust.x,
                        visibility: 'visible',
                        zIndex: that.get('zIndex') || zIndexGenerator(),
                        overflow: 'hidden'
                    });

                    that.open();

                    //避免重复绑定
                    $('body').bind('mousemove.tip', watchHover);
                },
                function(e){
                    that.close();
                    $('body').unbind('mousemove.tip', watchHover);
                }
            );

            function watchHover(e){
                var top = e.pageY - containerOffset.top + that.adjust.y,
                    left = e.pageX - containerOffset.left + that.adjust.x;

                that.css({
                    top: top,
                    left: left
                });
            }
        },

        /**
         * reset superclass's _adjustPos
         * @private
         */
        _adjustPos: function() {
            var $ = this.$,
                container = this.get('container'),
                show = this.get('show'),
                direction = this.get('direction'),
                adjust = this.get('adjust'),
                $trigger = this.$trigger,
                $win = this.$(window),
                winHeight = $win.height(),
                winWidth = $win.width(),
                scrollTop = $win.scrollTop(),
                scrollLeft = $win.scrollLeft(),
                popupWidth = this.outerWidth(),
                popupHeight = this.outerHeight(),
                offsetParent = $trigger.offsetParent(),
                outerPosition = $trigger.outerPosition(),
                offset = $trigger.offset(),
                pos = {};

            // container = $trigger.parent()
            if(container[0] !== $('body')[0] && container !== 'body') {
                triggerPos = {
                    top: outerPosition.top + offsetParent.scrollTop(),
                    left: outerPosition.left + offsetParent.scrollLeft()
                };
            } else {
                /**
                 * container = body
                 */
                triggerPos = {
                    top: offset.top,
                    left: offset.left
                }
            }

            // 按照默认方向显示popup
            switch(direction){
                case 'top':
                    pos = {
                        top: triggerPos.top - popupHeight,
                        left: triggerPos.left
                    };
                    break;
                case 'right':
                    pos = {
                        top: triggerPos.top,
                        left: triggerPos.left + $trigger.outerWidth()
                    };
                    break;
                case 'bottom':
                    pos = {
                        top: triggerPos.top + $trigger.outerHeight(),
                        left: triggerPos.left
                    };
                    break;
                case 'left':
                    pos = {
                        top: triggerPos.top,
                        left: triggerPos.left - popupWidth
                    };
                    break;
            }

            //adjust微调值
            pos.top += adjust.y;
            pos.left += adjust.x;

            /*
             * 视窗适配 (tip因为append到同级，不再判断)
             */
            /*
            var moveX, moveY;

            // Y adjust. Tip过大，这种情况属于设计问题了
            if(winHeight < popupHeight){
                moveY = 0;
            } else {
                //两边都secured，不动，基本也只能调整Tip高度来解决了
                if(winHeight + scrollTop - triggerPos.top - $trigger.outerHeight() < popupHeight && triggerPos.top < popupHeight){
                    moveY = 0;
                }else{
                    //下secured
                    if(direction === 'bottom' && winHeight + scrollTop - triggerPos.top - $trigger.outerHeight() < popupHeight){
                        moveY = $trigger.outerHeight() + popupHeight
                    }else if(direction === 'top' && triggerPos.top < popupHeight){
                        //上secured
                        moveY = -$trigger.outerHeight() - popupHeight
                    }else if(triggerPos.top + popupHeight > winHeight + scrollTop){
                        moveY = triggerPos.top + popupHeight - winHeight - scrollTop;
                    } else {
                        moveY = 0;
                    }
                }
            }

            //X adjust. Tip过大，这种情况属于设计问题了
            if(winWidth < popupWidth){
                moveX = 0;
            } else {
                //两边都secured，不动，基本也只能调整Tip宽度来解决了
                if(winWidth + scrollLeft - triggerPos.left - $trigger.outerWidth() < popupWidth && triggerPos.left < popupWidth){
                    moveX = 0;
                }else{
                    //右secured
                    if(direction === 'right' && winWidth - triggerPos.left - $trigger.outerWidth() < popupWidth){
                        moveX = $trigger.outerWidth() + popupWidth
                    }else if(direction === 'left' && triggerPos.left < popupWidth){
                        //左secured
                        moveX = -$trigger.outerWidth() - popupWidth
                    }else{
                        moveX = 0;
                    }
                }
            }

            pos.top -= moveY;
            pos.left -= moveX;
            */

            //设置位置样式
            this.css(pos);
        },

        _adjustArrow: function() {
            var that = this,
                width = that.outerWidth(),
                height = that.outerHeight(),
                triggerWidth = that.$trigger.outerWidth(),
                triggerHeight = that.$trigger.outerHeight(),
                direction = this.get('direction'),
                align = this.get('align'),
                $trigger = this.$trigger,
                $win = $(window),
                winHeight = $win.height(),
                winWidth = $win.width(),
                tipWidth = this.outerWidth(),
                tipHeight = this.outerHeight(),
                triggerPos = {
                    top: $trigger.offset().top,
                    left: $trigger.offset().left
                },
                scrollTop = $win.scrollTop(),
                scrollLeft = $win.scrollLeft(),
                arrowHeight = this.$arrowBefore.outerHeight(),
                arrowWidth = this.$arrowBefore.outerWidth();

            switch(direction){
                case 'top':
                    if(triggerPos.top < tipHeight){
                        this.removeClass('lbf-tip-top').addClass('lbf-tip-bottom');
                        this.css('marginTop', arrowHeight);
                    }else{
                        this.removeClass('lbf-tip-bottom').addClass('lbf-tip-top');
                        this.css('marginTop', -arrowHeight);
                    }

                    // 调整tip align方向和arrow的位置
                    if(align === 'left'){
                        this.$arrow.css('marginLeft', -(width/2)+this.$arrowAfter.outerWidth());
                    }else if(align === 'right'){
                        this.$arrow.css('marginLeft', Math.abs(width/2)-this.$arrowAfter.outerWidth());
                        this.css('marginLeft', (triggerWidth - width));
                    }else{
                        this.css('marginLeft', (triggerWidth - width)/2);
                    }

                    break;
                case 'right':
                    if(winWidth + scrollLeft - triggerPos.left - $trigger.outerWidth() < tipWidth){
                        this.removeClass('lbf-tip-right').addClass('lbf-tip-left');
                        this.css('marginLeft', -arrowWidth);
                    }else{
                        this.removeClass('lbf-tip-left').addClass('lbf-tip-right');
                        this.css('marginLeft', arrowWidth);
                    }

                    // 调整tip align方向和arrow的位置
                    if(align === 'top'){
                        this.$arrow.css('marginTop', -(height/2)+this.$arrowAfter.outerHeight());
                    }else if(align === 'bottom'){
                        this.$arrow.css('marginTop', Math.abs(height/2)-this.$arrowAfter.outerHeight());
                        this.css('marginTop', (triggerHeight - height));
                    }else{
                        this.css('marginTop', (triggerHeight - height)/2);
                    }

                    break;
                case 'bottom':
                    if(winHeight + scrollTop - triggerPos.top - $trigger.outerHeight() < tipHeight){
                        this.removeClass('lbf-tip-bottom').addClass('lbf-tip-top');
                        this.css('marginTop', -arrowHeight);
                    }else{
                        this.removeClass('lbf-tip-top').addClass('lbf-tip-bottom');
                        this.css('marginTop', arrowHeight);
                    }

                    // 调整tip align方向和arrow的位置
                    if(align === 'left'){
                        this.$arrow.css('marginLeft', -(width/2)+this.$arrowAfter.outerWidth());
                    }else if(align === 'right'){
                        this.$arrow.css('marginLeft', Math.abs(width/2)-this.$arrowAfter.outerWidth());
                        this.css('marginLeft', (triggerWidth - width));
                    }else{
                        this.css('marginLeft', (triggerWidth - width)/2);
                    }

                    break;
                case 'left':
                    if(triggerPos.left < tipWidth){
                        this.removeClass('lbf-tip-left').addClass('lbf-tip-right');
                        this.css('marginLeft', arrowWidth);
                    }else{
                        this.removeClass('lbf-tip-right').addClass('lbf-tip-left');
                        this.css('marginLeft', -arrowWidth);
                    }

                    // 调整tip align方向和arrow的位置
                    if(align === 'top'){
                        this.$arrow.css('marginTop', -(height/2)+this.$arrowAfter.outerHeight());
                    }else if(align === 'bottom'){
                        this.$arrow.css('marginTop', Math.abs(height/2)-this.$arrowAfter.outerHeight());
                        this.css('marginTop', (triggerHeight - height));
                    }else{
                        this.css('marginTop', (triggerHeight - height)/2);
                    }

                    break;
            }
        },

        /**
         * Click close button to hide tip
         * @method close
         * @protect
         * @chainable
         */
        _close: function(e){
            e.stopPropagation();

            this.close();

            return this;
        },

        /**
        * open Tip
        * @method open
        * @chainable
        */
        open: function(){
            if(this.get('show').mode == 'follow'){
                this.get('show').effect.apply(this, arguments);
                this.show();

                /**
                 * Fire when open Tip
                 * @event open
                 * @param {Event}
                 */
                this.trigger('open');
            }else{
                this._adjustArrow();

                Dropdown.prototype.open.apply(this, arguments);
            }

            return this;
        },

        /**
         * close Tip
         * @method close
         * @chainable
         */
        close: function(){
            if(this.get('show').mode === 'follow'){
                this.get('hide').effect.apply(this, arguments);

                /**
                 * Fire when hide Tip
                 * @event show
                 * @param {Event}
                 */
                this.trigger('close.Tip');
            }else{
                Dropdown.prototype.close.apply(this, arguments);
            }

            return this;
        },

        /**
         * Toggle Tip
         * @chainable
         */
        toggle: function(){
            Dropdown.prototype.toggle.apply(this, arguments);

            return this;
        },

        /**
         * Set Tip content
         * @method setContent
         * @param {String} html
         * @chainable
         */
        setContent: function(html){
            this.$content.html(html);
            return this;
        }
    });

    Tip.include(extend(true, {}, Dropdown, {
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            //模板定制
            wrapTemplate: [
                '<div class="lbf-popup lbf-dropdown lbf-tip lbf-tip-<%== direction %>">',
                    '<div class="lbf-tip-content"><%== content %></div>',
                    '<% if(closable){ %>',
                    '<a href="javascript:;" class="lbf-tip-button-close lbf-icon lbf-icon-close"></a>',
                    '<% } %>',
                    '<div class="lbf-tip-arrow">',
                        '<div class="lbf-tip-arrow-before"></div>',
                        '<div class="lbf-tip-arrow-after"></div>',
                    '</div>',
                '</div>'
            ].join(''),

            show: {
                mode: 'hover'
            },

            //Tip方向
            direction: 'top', // top right bottom left

            align: 'center', // left center right top middle bottom

            sort: '', // error | warning

            //是否显示关闭按钮，closable=true时mouseout事件不触发
            closable: false
        }
    }));

    return Tip;
});