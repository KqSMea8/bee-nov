/**
 * @fileOverview
 * @author liuwentao
 * Created: 16/10/11
 */
LBF.define('qd/js/read.qidian.com/ejsChinese.a35d9.js', function (require, exports, module) {

    var
        EJS = require('util.EJS');

    return (function (ejsUrl , ejsData ) {

        //异步加载指南弹窗模板
        var ejsDom = new EJS({
            url: ejsUrl
        }).render(ejsData);

        //判断简繁体
        require.async('qd/js/component/chinese.cafe9.js', function (S2TChinese) {

            ejsDom = S2TChinese.s2tString(ejsDom);

        });
        
        return ejsDom ;

    });

})
