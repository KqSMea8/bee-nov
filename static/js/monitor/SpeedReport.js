/**
 * Created by rainszhang on 14-1-16.
 */
LBF.define('monitor.SpeedReport', function(require){
    var report = require('util.report'),
        Class = require('lang.Class'),
        serialize = require('util.serialize'),
        Attribute = require('util.Attribute');

    var defaults = {
        url: '//isdspeed.qq.com/cgi-bin/r.cgi',
        rate: 1,
        calGap: false
    };

    var PointReport = Class.inherit(Attribute, {
        initialize: function(options){
            this
                .set(defaults)
                .set({
                    points: [],
                    start: +new Date()
                })
                .set(options);
        },

        add: function(time, pos){
            var points = this.get('points');

            time = time || +new Date();
            pos = pos || points.length;

            points[pos] = time;

            return this;
        },

        send: function(){
            // clear points
            var points = this.get('points').splice(0);

            if(Math.random() > this.get('rate')){
                return this;
            }

            var start = this.get('start'),
                f1 = this.get('flag1'),
                f2 = this.get('flag2'),
                f3 = this.get('flag3'),
                url = this.get('url') + '?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&',
                proxy = this.get('proxy'),
                i;

            if(this.get('calGap')){
                for(i= points.length - 1; i> 0; i--){
                    points[i-1] = points[i-1] || 0;
                    points[i] -= points[i-1];
                }
            } else {
                for(i= points.length - 1; i> 0; i--){
                    if(points[i]){
                        points[i] -= start;
                    }
                }
            }

            url = url + serialize(points);

            // when use proxy mode
            if(proxy){
                url = proxy.replace('{url}', encodeURIComponent(url));
            }

            report(url);
        }
    });

    /**
     * 上报Performance timing数据；
     * 如果某个时间点花费时间为0，则此时间点数据不上报。
     *
     * @param {Object} options
     *
     * @param {String} options.flag1，测速系统中的业务ID，譬如校友业务为164
     *
     * @param {String} options.flag2，测速的站点ID
     *
     * @param {String} options.flag3IE，测速的页面ID
     *（因为使用过程中我们发现IE9的某些数据存在异常，
     * 如果IE9和chrome合并统计，会影响分析结果，所以这里建议分开统计）
     *
     * @param {String} [options.flag3Chrome]，测速的页面ID
     * （如果为空，则IE9和chrome合并统计）
     *
     * @param {Number} [options.initTime] 统计页面初始化时的时间
     *
     */
    var reportPerformance = function(options){
        var f1 = options.flag1,
            f2 = options.flag2,
            f3_ie = options.flag3IE,
            f3_c = options.flag3Chrome,
            d0 = options.initTime,
            proxy = options.proxy,
            defaultUrl = '//isdspeed.qq.com/cgi-bin/r.cgi';

        var _t, _p = window.performance || window.webkitPerformance || window.msPerformance, _ta = ["navigationStart","unloadEventStart","unloadEventEnd","redirectStart","redirectEnd","fetchStart","domainLookupStart","domainLookupEnd","connectStart","connectEnd","requestStart",/*10*/"responseStart","responseEnd","domLoading","domInteractive","domContentLoadedEventStart","domContentLoadedEventEnd","domComplete","loadEventStart","loadEventEnd"], _da = [], _t0, _tmp, f3 = f3_ie;

        if(Math.random() > options.rate){
            return this;
        }

        if (_p && (_t = _p.timing)) {

            if (typeof(_t.msFirstPaint) != 'undefined') {	//ie9
                _ta.push('msFirstPaint');
            } else {
                if (f3_c) {
                    f3 = f3_c;
                }
            }

            _t0 = _t[_ta[0]];
            for (var i = 1, l = _ta.length; i < l; i++) {
                _tmp = _t[_ta[i]];
                _tmp = (_tmp ? (_tmp - _t0) : 0);
                if (_tmp > 0) {
                    _da.push( i + '=' + _tmp);
                }
            }

            if (d0) {//统计页面初始化时的d0时间
                _da.push('30=' + (d0 - _t0));
            }

            //如果业务侧传递了url，则使用此url
            var url = options.url || defaultUrl;
            var url = url + '?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + _da.join('&');

            // when use proxy mode
            if(proxy){
                url = proxy.replace('{url}', encodeURIComponent(url));
            }

            report(url);
        }

    };

    /**
     * 上报Performance timing数据；
     * 如果某个时间点花费时间为0，则此时间点数据不上报。
     *
     * @param {Object} options
     *
     * @param {String} options.flag1，测速系统中的业务ID，譬如校友业务为164
     *
     * @param {String} options.flag2，测速的站点ID
     *
     * @param {String} options.flag3IE，测速的页面ID
     *（因为使用过程中我们发现IE9的某些数据存在异常，
     * 如果IE9和chrome合并统计，会影响分析结果，所以这里建议分开统计）
     *
     * @param {String} [options.flag3Chrome]，测速的页面ID
     * （如果为空，则IE9和chrome合并统计）
     *
     * @param {Number} [options.initTime] 统计页面初始化时的时间
     *
     */
    var reportPerform = function(options){
        var f1 = options.flag1,
            f2 = options.flag2,
            f3_ie = options.flag3IE,
            f3_c = options.flag3Chrome,
            d0 = options.initTime,
            proxy = options.proxy,
            defaultUrl = location.protocol.indexOf('https') !== -1 ? '//huatuospeed.weiyun.com/cgi-bin/r.cgi' : '//isdspeed.qq.com/cgi-bin/r.cgi';

        var _t, _p = window.performance || window.webkitPerformance || window.msPerformance, _ta = ["navigationStart","unloadEventStart","unloadEventEnd","redirectStart","redirectEnd","fetchStart","domainLookupStart","domainLookupEnd","connectStart","connectEnd","requestStart",/*10*/"responseStart","responseEnd","domLoading","domInteractive","domContentLoadedEventStart","domContentLoadedEventEnd","domComplete","loadEventStart","loadEventEnd"], _da = [], _t0, _tmp, f3 = f3_ie;

        if(Math.random() > this.get('rate')){
            return this;
        }

        if (_p && (_t = _p.timing)) {

            if (typeof(_t.msFirstPaint) != 'undefined') {   //ie9
                _ta.push('msFirstPaint');
            } else {
                if (f3_c) {
                    f3 = f3_c;
                }
            }

            _t0 = _t[_ta[0]];
            for (var i = 1, l = _ta.length; i < l; i++) {
                _tmp = _t[_ta[i]];
                _tmp = (_tmp ? (_tmp - _t0) : 0);
                if (_tmp > 0) {
                    _da.push( i + '=' + _tmp);
                }
            }

            if (d0) {//统计页面初始化时的d0时间
                _da.push('30=' + (d0 - _t0));
            }

            var url = options.url || defaultUrl;

            url += '?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + _da.join('&');

            // when use proxy mode
            if(proxy){
                url = proxy.replace('{url}', encodeURIComponent(url));
            }

            report(url);
        }

    };

    return {
        create: function(options){
            return new PointReport(options);
        },

        reportPerformance: reportPerformance,

        reportPerform: reportPerform
    }
});