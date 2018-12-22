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

