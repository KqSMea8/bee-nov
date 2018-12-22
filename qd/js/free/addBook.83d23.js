/**
 * Created by renjiale on 2016/4/22.
 */
/**
 * @fileOverview
 * @author  renjiale
 * Created: 2016-4-11
 */
LBF.define('qd/js/free/addBook.83d23.js', function (require, exports, module) {
    var
        Node = require('ui.Nodes.Node'),
        ajaxSetting = require('qd/js/component/ajaxSetting.84b88.js'),
        Checkbox = require('ui.Nodes.Checkbox'),
        Pagination = require('ui.Nodes.Pagination'),
        Cookie = require('util.Cookie'),
        Login = require('qd/js/component/login.a4de6.js'),
        LightTip = require('ui.widget.LightTip.LightTip'),
        Loading = require('qd/js/component/loading.aa676.js');

    function addToBookShelf(e, oldClassName, newClassName) {
        var that = this;
        var getResponse;
        var targetBook = $(e.currentTarget);
        //如果书已在书架中，则不需要发请求加入书架
        if (targetBook.hasClass(newClassName)) {
            return;
        }

        //如果是弱登录状态，则显示登录框
        if(!Login.isLogin()){
            Login && Login.showLoginPopup && Login.showLoginPopup();
            return;
        }

        //在按钮loading的时候再次点击则不执行逻辑
        if(targetBook.hasClass('btn-loading')){
            return;
        }

        //显示loading
        var loading = new Loading({});
        loading.startLoading(targetBook,function(){
            return getResponse;
        },200);

        //超时情况
        setTimeout(function(){
            loading.clearLoading(targetBook);
        }, 10 * 1000);

        //如果是未登录状态，则弹出登录弹窗
        if (!Login.isLogin()) {
            Login.showLoginPopup();
        } else {
            //已登录状态下，点击加入书架则直接向后端发送请求
            var bookId = targetBook.attr('data-bookId');
            $.ajax({
                type: 'GET',
                url: '/ajax/BookShelf/add',
                dataType: 'json',
                data: {
                    bookId: bookId
                },
                success: function (data) {
                    getResponse = true;
                    loading.clearLoading(targetBook);
                    if (data.code === 0) {
                        targetBook.removeClass(oldClassName);
                        targetBook.addClass(newClassName);
                        targetBook.html('已在书架');
                        new LightTip({
                            content: '<div class="simple-tips"><span class="iconfont success">&#xe61d;</span><h3>成功加入书架</h3></div></div>'
                        }).success();
                    } else {
                        switch (parseInt(data.code)) {
                            case 1002:
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>已经在书架中</h3></div>'
                                }).error();
                                targetBook.removeClass(oldClassName);
                                targetBook.addClass(newClassName);
                                targetBook.html('已在书架');
                                break;
                            case 1003:
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>书架已满</h3></div>'
                                }).error();
                                break;
                            case 1004:
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>加入失败</h3></div>'
                                }).error();
                                break;
                            default:
                                new LightTip({
                                    content: '<div class="simple-tips"><span class="iconfont error">&#xe61e;</span><h3>'+ data.msg +'</h3></div>'
                                }).error();
                                break;

                        }
                    }
                }
            })
        }
    }

    /**
     * 关闭登录弹窗
     * @method hideLoginPopup
     */
    $('body').on('click', '.close-popup', function () {
        Login.hideLoginPopup();
    });

    return {
        addToBookShelf: addToBookShelf
    }

});