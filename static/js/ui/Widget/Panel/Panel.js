/**
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
});