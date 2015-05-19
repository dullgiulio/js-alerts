jQuery = jQuery.noConflict();

(function($) {
    $(document).ready(function() {
        var checkEveryMillis = 20*1000; // Check every five minutes.
        var jsonUrl = '/uploads/alerts/latest.json';
        var cookieName = 'bcastmessage';
        var levelClasses = ['message-notice', 'message-information', 'message-ok', 'message-warning', 'message-error'];

        var cancelID = null;
        var showMessage = function(message, levelClass, callback) {
            var div = $('#bcastmessage');
            var inner = null;

            if (div.length <= 0) {
                inner = $("<div>").attr('class', 'inner')
                            .css('margin', '0 auto')
                            .css('width', '906px')
                            .css('min-height', '15px')
                            .addClass('typo3-message')
                            .html('<span class="message"></span> [<a href="#">Close</a>]')
                div = $("<div>").attr('id', 'bcastmessage')
                            .css('position', 'fixed')
                            .css('width', '100%')
                            .css('z-index', '1000')
                            .css('bottom', '0')
                            .css('display', 'none')
                            .append(inner);
                $('body').append(div);
            }

            div.css('display', 'block');
            div.find('.message').html(message);

            if (!inner) {
                inner = div.find('.inner');
            }

            for (i = 0; i < levelClasses.length; ++i) {
                inner.removeClass(levelClasses[i]);
            }

            div.find('.inner').addClass(levelClass);
            div.find('.inner a').click(function() {
                callback();

                div.css('display', 'none');
            });
        }

        var checkForMessage = function() {
            $.getJSON(jsonUrl + '?rand=' + Math.floor(Math.random() * 99999999) + 1, null,
            function(data) {
                var show = true;
                var levelClass = 'message-error';

                if (parseInt(data.sticky) != 0) {
                    if (parseInt($.cookie(cookieName)) == parseInt(data.uid)) {
                        show = false;
                    }
                }

                if (data.from != '') {
                    var fromDate = Date.prototype.setISO8601(data.from);

                    if (fromDate > Date.now()) {
                        show = false;
                    }
                }

                if (data.to != '') {
                    var toDate = Date.prototype.setISO8601(data.to);

                    if (toDate < Date.now()) {
                        show = false;
                    }
                }

                if (data.interval != '') {
                    var newIntervalSeconds = parseInt(data.interval);
                    
                    if (newIntervalSeconds > 0 && (newIntervalSeconds * 1000) != checkEveryMillis) {
                        if (cancelID) {
                            window.clearTimeout(cancelID);
                        }
                        checkEveryMillis = parseInt(data.interval) * 1000;
                        cancelID = window.setInterval(checkForMessage, checkEveryMillis);
                    }
                }

                if (data.level != '') {
                    levelClass = data.level    
                }

                if (show) {
                    showMessage(data.message, levelClass, function() {
                        if (parseInt(data.cookie) != 0) {
                            $.cookie(cookieName, data.uid);
                        }
                    });
                }
            });
        }

        checkForMessage();
        cancelID = window.setInterval(checkForMessage, checkEveryMillis);
    });
})(jQuery);

/*!
 * jQuery Cookie Plugin v1.3.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
       if (typeof define === 'function' && define.amd && define.amd.jQuery) {
               // AMD. Register as anonymous module.
               define(['jquery'], factory);
       } else {
               // Browser globals.
               factory(jQuery);
       }
}(function ($) {

       var pluses = /\+/g;

       function raw(s) {
               return s;
       }

       function decoded(s) {
               return decodeURIComponent(s.replace(pluses, ' '));
       }

       function converted(s) {
               if (s.indexOf('"') === 0) {
                       // This is a quoted cookie as according to RFC2068, unescape
                       s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
               }
               try {
                       return config.json ? JSON.parse(s) : s;
               } catch(er) {}
       }

       var config = $.cookie = function (key, value, options) {

               // write
               if (value !== undefined) {
                       options = $.extend({}, config.defaults, options);

                       if (typeof options.expires === 'number') {
                               var days = options.expires, t = options.expires = new Date();
                               t.setDate(t.getDate() + days);
                       }

                       value = config.json ? JSON.stringify(value) : String(value);

                       return (document.cookie = [
                               encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
                               options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                               options.path    ? '; path=' + options.path : '',
                               options.domain  ? '; domain=' + options.domain : '',
                               options.secure  ? '; secure' : ''
                       ].join(''));
               }

               // read
               var decode = config.raw ? raw : decoded;
               var cookies = document.cookie.split('; ');
               var result = key ? undefined : {};
               for (var i = 0, l = cookies.length; i < l; i++) {
                       var parts = cookies[i].split('=');
                       var name = decode(parts.shift());
                       var cookie = decode(parts.join('='));

                       if (key && key === name) {
                               result = converted(cookie);
                               break;
                       }

                       if (!key) {
                               result[name] = converted(cookie);
                       }
               }

               return result;
       };

       config.defaults = {};

       $.removeCookie = function (key, options) {
               if ($.cookie(key) !== undefined) {
                       $.cookie(key, '', $.extend(options, { expires: -1 }));
                       return true;
               }
               return false;
       };

}));
Date.prototype.setISO8601 = function (timestamp) {
 var match = timestamp.match(
  "^([-+]?)(\\d{4,})(?:-?(\\d{2})(?:-?(\\d{2})" +
  "(?:[Tt ](\\d{2})(?::?(\\d{2})(?::?(\\d{2})(?:\\.(\\d{1,3})(?:\\d+)?)?)?)?" +
  "(?:[Zz]|(?:([-+])(\\d{2})(?::?(\\d{2}))?)?)?)?)?)?$");
 if (match) {
  for (var ints = [2, 3, 4, 5, 6, 7, 8, 10, 11], i = ints.length - 1; i >= 0; --i)
   match[ints[i]] = (typeof match[ints[i]] != "undefined"
    && match[ints[i]].length > 0) ? parseInt(match[ints[i]], 10) : 0;
  if (match[1] == '-') // BC/AD
   match[2] *= -1;
  var ms = Date.UTC(
   match[2], // Y
   match[3] - 1, // M
   match[4], // D
   match[5], // h
   match[6], // m
   match[7], // s
   match[8] // ms
  );
  if (typeof match[9] != "undefined" && match[9].length > 0) // offset
   ms += (match[9] == '+' ? -1 : 1) *
    (match[10]*3600*1000 + match[11]*60*1000); // oh om
  if (match[2] >= 0 && match[2] <= 99) // 1-99 AD
   ms -= 59958144000000;
  this.setTime(ms);
  return this;
 }
 else
  return null;
}

