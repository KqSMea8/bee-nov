/**
 * @overview
 * @author rainszhang
 * @create 15-1-6
 */

LBF.define('ui.widget.RegionSelector.RegionSelector', function(require, exports, module){
    var Node = require('ui.Nodes.Node'),
        ComboBox = require('ui.widget.ComboBox.ComboBox'),
        RegionDB = require('util.regionData'),
        each = require('lang.each'),
        isArray = require('lang.isArray');

    var REGION_LEVEL_MAP = ['nation', 'province', 'city', 'district'],
        REGION_LEVEL_DEF_OPTION = [{
            text: '不限国家',
            value: -1
        }, {
            text: '不限省份',
            value: -1
        }, {
            text: '不限城市',
            value: -1
        }, {
            text: '不限区县',
            value: -1
        }],
        NATION = 49;


    module.exports = exports = Node.inherit({
        events: {
            'unload': 'remove'
        },

        render: function(){
            var that = this,
                selector = this.get('selector'),
                container = this.get('container'),
                region = this.get('region'),
                $ = this.jQuery,
                comboboxArr = this.comboboxArr = [],
                currentCode = this.currentCode = [-1, -1, -1, -1],
                $select;

            if(!selector || ($select = $(selector)).length === 0){
                // todo
                // container mode
            }

            // init comboboxes
            $select.each(function(i) {
                var combobox = new ComboBox({
                    selector: this,
                    optionsContainer: $(this).parent()
                });
                combobox.data('name', REGION_LEVEL_MAP[i]);
                comboboxArr.push(combobox);
            });

            // init comboboxes
            for(var i=1; i<comboboxArr.length; i++){
                (function(j){
                    comboboxArr[i]
                        .bind('select', function(event, key){

                            var next = $(this).next('.lbf-combobox'),
                                arr = [];

                            $(this).nextAll('.lbf-combobox').addClass('lbf-hidden');

                            // set values map
                            that.currentCode[j] = key;
                            // low level set value to -1
                            for(var m = j+1; m < that.currentCode.length; m++){
                                that.currentCode[m] = -1;
                            }

                            if(next.length == 1 && key > 0){

                                if(next.data('name') == 'city'){
                                    var options = that.getAllCity(key);

                                    options && comboboxArr[2].reset(options);
                                }else{
                                    var options = that.getAllRegion(that.currentCode[j-1], key);

                                    options && comboboxArr[3].reset(options);
                                }

                                options.length > 1 &&  next.removeClass('lbf-hidden');
                            }
                        })
                })(i);
            };

            // 默认中国，隐藏国家，组件也暂时不支持
            comboboxArr[0].addClass('lbf-hidden');

            // init region
            this.selectRegion(region);
        },

        /**
         * Set region by code
         * @method selectRegion
         * @param {Object} region Region codes to be selected
         * @param {String} [region.nation] Code of nation to be selected
         * @param {String} [region.province] Code of province to be selected
         * @param {String} [region.city] Code of city to be selected
         * @param {String} [region.district] Code of district to be selected
         * @chainable
         */
        selectRegion: function(region){
            var that = this,
                comboboxArr = this.comboboxArr,
                provinceOptions;

            // init with province list
            provinceOptions = this.getAllProvince(NATION);
            comboboxArr[1].reset(provinceOptions);
            if(region.province){
                comboboxArr[1].select(comboboxArr[1].index(region.province.toString()));
            }

            // init with city list
            if(region.city){
                comboboxArr[2].select(comboboxArr[2].index(region.city.toString()));
            }

            // init with  list
            if(region.district){
                comboboxArr[3].select(comboboxArr[3].index(region.district.toString()));
            }
        },

        /**
         * Enable region select based on the arguments
         * @enableProvinceAndCity
         * e.g: disable all the four region selects:
         * option: {
         *       nation: true,
         *       province: true,
         *       city: true,
         *       district: true
         *   }
         */
        enable: function(options){
            var comboboxArr = this.comboboxArr;
            options.nation && comboboxArr[0] ? comboboxArr[0].enable() : '';//nation
            options.province && comboboxArr[1] ? comboboxArr[1].enable() : '';//province
            options.city && comboboxArr[2] ? comboboxArr[2].enable() : '';//city
            options.district && comboboxArr[3] ? comboboxArr[3].enable() : '';//district
        },

        /**
         * Disable region select based on the arguments
         * @disableProvinceAndCity
         * e.g: disable all the four region selects:
         * option: {
         *       nation: true,
         *       province: true,
         *       city: true,
         *       district: true
         *   }
         */
        disable: function(options){
            var comboboxArr = this.comboboxArr;
            options.nation && comboboxArr[0] ? comboboxArr[0].disable() : '';//nation
            options.province && comboboxArr[1] ? comboboxArr[1].disable() : '';//province
            options.city && comboboxArr[2] ? comboboxArr[2].disable() : '';//city
            options.district && comboboxArr[3] ? comboboxArr[3].disable() : '';//district
        },

        /**
         * Get selected region info
         * @method getSelectedRegion
         * @return {Array}
         *      [49, 13107, 49, 330102]
         */
        getSelectedRegion: function(){
            return this.currentCode;
        },

        /**
         * remove the comboboxArr to avoid memory leak
         */
        remove: function() {
            each(this.comboboxArr, function(index, combobox) {
                combobox.remove();
            });

            this.comboboxArr = [];
        },

        /**
         * 获取所有省份数据
         */
        getAllProvince: function(key){

            // china
            var key = key || 49;
            var arr = [REGION_LEVEL_DEF_OPTION[1]];

            for(var i in RegionDB.countryregion[key].stat){
                arr.push(this.format(RegionDB.countryregion[key].stat[i]));
            }

            return arr;
        },

        /**
         * 获取所有城市数据
         * @param province code
         */
        getAllCity: function(key){
            var that = this;
            var arr = [REGION_LEVEL_DEF_OPTION[2]];

            if(key < 0){
                return;
            }

            if(key > 0){
                for(var i in RegionDB.countryregion[NATION].stat[key].city){
                    arr.push(that.format(RegionDB.countryregion[NATION].stat[key].city[i]));
                }
            }

            return arr;
        },

        /**
         * 获取所有县区数据
         * @param province code
         * @param city code
         */
        getAllRegion: function(province, city){
            var that = this;
            var arr = [REGION_LEVEL_DEF_OPTION[3]];

            if(province > 0 && city > 0){
                for(var i in RegionDB.countryregion[NATION].stat[province].city[city].region){
                    arr.push(this.format(RegionDB.countryregion[NATION].stat[province].city[city].region[i]));
                }
            }

            return arr;
        },


        /**
         * 从数据文件转换成select option json
         */
        format: function(item){
            return {
                text: item.name,
                value: item.code
            }
        },

        /**
         * 获取国家、省份、城市、区域的值
         * @method val
         */
        val: function(){
            return this.currentCode;
        }
    });

    // default properties to be merged from constructor options
    exports.settings = {
        region: null
    };
});