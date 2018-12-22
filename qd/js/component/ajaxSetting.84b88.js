/**
 * @fileOverview
 * @author rainszhang
 * Created: 16-03-18
 */
LBF.define('qd/js/component/ajaxSetting.84b88.js', function (require, exports, module) {
    var JSON = require('lang.JSON');
    var Cookie = require('util.Cookie');

    (function(){
        $.ajaxSetup({
            data: {
                "_csrfToken": Cookie.get('_csrfToken') || ''
            },
            dataType: 'json',
            dataFilter: function(data, type){
                var data = data;
                if(Cookie.get('lang') == 'zht'){
                    var str = JSON.stringify(data);

                    require.async('qd/js/component/chinese.cafe9.js', function (S2TChinese) {
                        str = S2TChinese.s2tString(str);
                    });

                    data = JSON.parse(str) || data;
                }

                return data;
            },
            statusCode: {
                401: function () {
                    Login && Login.showLoginPopup && Login.showLoginPopup();
                }
            }
            /*
            error: function(){
                new LightTip({
                    content: '服务器发生异常，请重试'
                }).error();
            }
            */
        });
    })();
});
