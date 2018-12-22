/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 16-2-23 下午1:35
 */
LBF.define('ui.widget.CheckboxGroup.CheckboxGroup', function(require){
    var $ = require('lib.jQuery'),
        Node = require('ui.Nodes.Node'),
        Checkbox = require('ui.Nodes.Checkbox');

    var CheckboxGroup = Node.inherit({
        /**
         * Render panel and initialize events and elements
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var list = [];
            var selectorHeader = this.get('selector').header;
            var selectorList = this.get('selector').list;

            var head = new Checkbox({
                selector: selectorHeader,
                events: {
                    check: function(){
                        for(var i=0; i<list.length; i++){
                            list[i].check();
                        }
                        this.trigger('checkAll', [this]);
                    },
                    uncheck: function(){
                        for(var i=0; i<list.length; i++){
                            list[i].uncheck();
                        }
                        this.trigger('uncheckAll', [this]);
                    }
                }
            });

            $(selectorList).each(function(i){
                var that = this;
                var length = $(selectorList).length;

                var checkbox = new Checkbox({
                    selector: $(that),
                    events: {
                        check: function(){
                            var j = 0;

                            for(var i=0; i<length; i++){
                                if(list[i].isChecked()){
                                    j++;
                                }
                            }

                            if(j === length){
                                head.check();
                            }else{
                                head.halfCheck();
                            }
                        },
                        uncheck: function(){
                            var j = 0;

                            for(var i=0; i<length; i++){
                                if(!list[i].isChecked()){
                                    j++;
                                }
                            }

                            if(j === length){
                                head.uncheck();
                            }else{
                                head.halfCheck();
                            }
                        }
                    }
                });

                list.push(checkbox);
            });

            this.head = head;
            this.list = list;

            return this;
        },

        /**
         * selected all checkbox
         * @method checkAll
         */
        checkAll: function(){
            this.head.check();
            for(var i=0; i<this.list.length; i++){
                this.list[i].check();
            }
        },

        /**
         * selected all checkbox
         * @method uncheckAll
         */
        uncheckAll: function() {
            this.head.uncheck();
            for(var i=0; i<this.list.length; i++){
                this.list[i].uncheck();
            }
        }
    });

    CheckboxGroup.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            selector: {
                header: null,
                list: []
            }
        }
    });

    return CheckboxGroup;
});