//Cài đặt cho audio Mới
;(function($, window, document, undefined) {
	if (!$('#ppq-audio-player-style').length) {
			var style = '<style id="ppq-audio-player-style" type="text/css">\
				html{font-size:14px}\				body{margin:0;padding:0;border:0;word-wrap:break-word;word-break:break-all;-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;-ms-text-size-adjust:100%;text-size-adjust:100%;}\
				a, button, input, select, textarea{-webkit-tap-highlight-color:transparent}\
				ol, ul {list-style:none;}\
				.audio-hidden{width:0;height:0;visibility:hidden}\
				.ppq-audio-player .play-pause-btn .play-pause-icon:after{position:absolute;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}\
				.ppq-audio-player .play-pause-btn .play-pause-icon:after,.ppq-audio-player.player-playing .play-pause-icon:after{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAASCAMAAADrP+ckAAABNVBMVEUAAAAAmIcAmYgAm4sAnIsAnIwAnI0AnY0AnY4Ano4Ano8An5AAoJEAoZEAoZIAopMBn5ABoJABoJEBoZEBoZIBoZMBopMCoZICopMCopQCo5QDoJEDoZEDo5QDo5UFopMGo5QKpJYLpJYMpZcMppgNpZcNppgNp5gOppcOppgOp5gOp5kQqJoSp5kSqJoTqZsbrJ4drJ8irZ8mrqEnsKMrsqUtsqYytKg0tak5t6tHvLJJvbNLvbNqycBrysFsycFwy8Jwy8N3zsZ+0MiA0cqD0suH1M2L1c6P1tCk3tmm39mv4t285+PE6ebH6ufN7erS7+zV7+3W8O3X8O7a8u/k9fPs+Pft+Pfx+fjx+fnx+vny+vr1+/v2+/v5/fz7/f38/f38/v38/v79/v7+/v7+//////+ALAV1AAAAAXRSTlMAQObYZgAAATxJREFUKM+F0tlWwjAQBuAgQgHTRFFrqaK4IALiiuKugPsKrqUo0DbO+z+CDYHIFZ279nznP3P+DHLh4+L8HWybAQM+qDdlUgGXMRcqpIwYnIwoG7ct6LjAfgdUKlZoAmPQLMRSCBrLZH4idPAEbqcb11eamm1w1ciqGgJrFVPNiMydfkLH8X5LhXMWV1YOc7WCKSGGHty6A9Z2ZRbFGaEymApFKaHJceXoFRxnmPKcZoQXL79huPLijKng/ouP4nFJZcdXUWJML/gpLyo6du2zPTUmQ3uPw7cnWiK8dPUDzn+rUvVaFXUdv4Fjy+51nBcqj3XxQl71o9v33eqlipO0yZWZJnEE5pqqJZTZsy/xjHKvYqBk82+7FCgiaO1GZqKHz/2TkKpWrYv7qldryIGH9c2bFrR75yXV4PwBrZh1OjRqx9oAAAAASUVORK5CYII=);background-size:37px 18px}\
				.ppq-audio-player{line-height:31px;position:relative;overflow:hidden;height:31px;margin:0 auto;background:#f4f4f4}\
				.ppq-audio-player audio{position:absolute;vertical-align:baseline}\
				.ppq-audio-player .play-pause-btn{float:left;margin:1px 0 0 3px}\
				.ppq-audio-player .play-pause-btn .play-pause-icon{position:relative;display:block;width:25px;height:25px;border:2px solid #00a293;border-radius:100%;background-color:#fff}\
				.ppq-audio-player .play-pause-btn .play-pause-icon:after{display:block;content:"";background-position:0 0;width:17px;height:18px}\
				.ppq-audio-player.player-playing .play-pause-icon:after{background-position:-25px 0;width:12px;height:17px}\
				.ppq-audio-player .player-time{float:left;width:51px;margin-right:8px;text-align:right}\
				.ppq-audio-player .player-time-duration{float:right;margin:0 0 0 8px;text-align:left}\
				.ppq-audio-player .player-bar{position:relative;overflow:hidden;height:5px;margin-top:13px;background-color:#fff}\
				.ppq-audio-player .player-bar .player-bar-loaded{position:absolute;top:0;left:0;width:100%;height:100%;border-radius:3px;background:#ddd}\
				.ppq-audio-player .player-bar .player-bar-played{position:absolute;top:0;left:0;width:0;height:100%;border-radius:3px;background:#00a293}\
				</style>';
		$('body').prepend(style);
	}

	var onMobile = 'ontouchstart' in window,
		eStart = onMobile ? 'touchstart' : 'mousedown',
		eMove = onMobile ? 'touchmove' : 'mousemove',
		eCancel = onMobile ? 'touchcancel' : 'mouseup',
		hackPrefixes = ['webkit', 'moz', 'ms', 'o'],
		hackHiddenProperty = getHackHidden();
	//Audio thường không hidden
	$.fn.initAudioPlayer = function() {
		this.each(function() {
			if ($(this).prop('tagName').toLowerCase() !== 'audio') {
				return;
			}

			var $this = $(this),
				file = $this.attr('src'),
				isSupport = false;

			if (canFilePlay(file)) {
				isSupport = true;
			} else {
				$this.find('source').each(function() {
					if (canFilePlay($(this).attr('src'))) {
						isSupport = true;
						return false;
					}
				});
			}

			if (!isSupport) {
				return;
			}
			
			var $player = $('<div class="ppq-audio-player">' + $('<div>').append($this.eq(0).clone()).html() + '<div class="play-pause-btn"><a href="javascript: void(0);" class="play-pause-icon"></a></div></div>'),
				audioEle = $player.find('audio')[0];

			$player.find('audio').addClass('audio-hidden');
			
			//var audiosrc = $player.find('audio').attr('src').replace('donotdownload', ''); 
			//$player.find('audio').attr('src', audiosrc); 
			
			$player.append('<div class="player-time player-time-current"></div>\
				<div class="player-time player-time-duration"></div>\
				<div class="player-bar">\
					<div class="player-bar-loaded"></div>\
					<div class="player-bar-played"></div>\
				</div>');

			var $bar = $player.find('.player-bar'),
				$played = $player.find('.player-bar-played'),
				$loaded = $player.find('.player-bar-loaded'),
				$current = $player.find('.player-time-current'),
				$duration = $player.find('.player-time-duration');

			$current.html('00:00');
			$duration.html('&hellip;');

			initAudioEvents();
			bindPageEvents();
			$this.replaceWith($player);

			function initAudioEvents() {
				audioEle.addEventListener('loadeddata', function() {
					var loadTimer = setInterval(function() {
						if (audioEle.buffered.length < 1) {
							return true;
						}
						$loaded.width((audioEle.buffered.end(0) / audioEle.duration) * 100 + '%');
						if (Math.floor(audioEle.buffered.end(0)) >= Math.floor(audioEle.duration)) {
							clearInterval(loadTimer);
						}
					}, 100);
					$duration.html($.isNumeric(audioEle.duration) ? convertTimeStr(audioEle.duration) : '&hellip;');
				});

				audioEle.addEventListener('timeupdate', function() {
					$current.html(convertTimeStr(audioEle.currentTime));
					$played.width((audioEle.currentTime / audioEle.duration) * 100 + '%');
				});

				audioEle.addEventListener('ended', function() {
					$player.removeClass('player-playing').addClass('player-paused');
				});
			}

			function bindPageEvents() {
				$bar.on(eStart, function(e) {
					audioEle.currentTime = getCurrentTime(e);
					$bar.on(eMove, function(e) {
						audioEle.currentTime = getCurrentTime(e);
					});
				}).on(eCancel, function() {
					$bar.unbind(eMove);
				});
				$player.find('.play-pause-btn').on('click', function() {
					if ($player.hasClass('player-playing')) {
						$player.removeClass('player-playing').addClass('player-paused');
						audioEle.pause();
					} else {
						$player.addClass('player-playing').removeClass('player-paused');
						audioEle.play();
					}					
					return false;
				});
			}
			
			function getCurrentTime(e) {
				var et = onMobile ? e.originalEvent.touches[0] : e;
				return Math.round((audioEle.duration * (et.pageX - $bar.offset().left)) / $bar.width());
			}

			if (hackHiddenProperty) {
				var evtname = hackHiddenProperty.replace(/[H|h]idden/, '') + 'visibilitychange';
				document.addEventListener(evtname, function() {
					if (isHidden() || getHackVisibilityState() === 'hidden') {
						$player.removeClass('player-playing').addClass('player-paused');
						audioEle.pause();
					}
				}, false);
			}

			window.addEventListener('beforeunload', function() {
				$player.removeClass('player-playing').addClass('player-paused');
				audioEle.pause();
			}, false);
		});
		return this;
	}
	
	function convertTimeStr(secs) {
		var m = Math.floor(secs / 60),
            s = Math.floor(secs - m * 60);
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
	}

	function canFilePlay(file) {
		if (!file) {
			return false;
		}
		var media = document.createElement('audio');
		if (typeof media.canPlayType !== 'function') {
			return false;
		}

		var res = media.canPlayType('audio/' + file.split('.').pop().toLowerCase());
		return res === 'probably' || res === 'maybe';
	}

	function getHackHidden() {
	    if ('hidden' in document) {
	    	return 'hidden';
	    }
	    for (var i = 0; i < hackPrefixes.length; i++) {
	        if ((hackPrefixes[i] + 'Hidden') in document) {
	            return hackPrefixes[i] + 'Hidden';
	        }
	    }
	    return null;
	}
	
	function getHackVisibilityState() {
	    if ('visibilityState' in document) {
	    	return 'visibilityState';
	    }
	    for (var i = 0; i < hackPrefixes.length; i++) {
	        if ((hackPrefixes[i] + 'VisibilityState') in document) {
	            return hackPrefixes[i] + 'VisibilityState';
	        }
	    }
	    return null;
	}
	
	function isHidden() {
	    var hide = getHackHidden();
	    if (!hide) {
	    	return false;
	    }
	
	    return document[hide];
	}
})(jQuery, window, document);
//End audio


jQuery.noConflict();
var j$ = jQuery;

var n = 0;

j$.extend({URLEncode:function(c){var o='';var x=0;c=c.toString();var r=/(^[a-zA-Z0-9_.]*)/;

  while(x<c.length){var m=r.exec(c.substr(x));

    if(m!=null && m.length>1 && m[1]!=''){o+=m[1];x+=m[1].length;

    }else{if(c[x]==' ')o+='+';else{var d=c.charCodeAt(x);var h=d.toString(16);

    o+='%'+(h.length<2?'0':'')+h.toUpperCase();}x++;}}return o;},

URLDecode:function(s){var o=s;var binVal,t;var r=/(%[^%]{2})/;

  while((m=r.exec(o))!=null && m.length>1 && m[1]!=''){b=parseInt(m[1].substr(1),16);

  t=String.fromCharCode(b);o=o.replace(m[1],t);}return o;}

});

j$(document).ready(function(){	

	//Code for slide

	j$('.slide-title').click(function(){

		if(j$(this).parent().find('.slide-content').css('display') == 'none'){

			j$(this).addClass('active');

			j$(this).parent().find('.slide-content:first').slideDown(200);

		}else{

			j$(this).parent().find('.slide-content:first').slideUp(300);

			j$(this).removeClass('active');

		};
		
	//Cai dat audio mới	
		j$('audio').map(function () {
			if (j$(this).is(":visible") && j$(this).hasClass('tvplay')){
						j$(this).init_tv_AudioPlayer();				
			}
			if (j$(this).is(":visible") && !j$(this).hasClass('tvplay')){
						j$(this).initAudioPlayer();				
			}		
		});			

	}); 

	j$('.tab_container').each(function(){

		if(j$(this).find('.tab_content h2').length >=1){

			var tablink = '';

			j$(this).find('.tab_content h2').each(function(){

					tablink += ('<li>' + j$(this).html() + '</li>' );

			})


			tabul = '<ul class="tabs">' + tablink + '</ul>';

			j$(this).find(".tab_content:first").before(tabul);

			j$(this).find('.tab_content h2').remove();

			}

		var location = j$.URLEncode(window.location);	

		var cook = j$.cookie(location);

		j$(this).find(".tab_content").hide(); //Hide all content

		if(cook==null) {

			j$(this).find("ul.tabs li:first").addClass("active").show(); //Activate first tab

			j$(this).find(".tab_content:first").show(); //Show first tab content


		}else {

			j$(cook).show();

			j$(this).find('ul.tabs li a').each(function(){

			 if(j$(this).attr('rel')==cook) j$(this).parent().addClass('active');

			});

		}

		//On Click Event

		j$("ul.tabs li").click(function() {

			j$(this).parent().parent().find("ul.tabs li").removeClass("active"); //Remove any "active" class

			j$(this).addClass("active"); //Add "active" class to selected tab

			j$(this).parent().parent().find(".tab_content").hide(); //Hide all tab content

			var location = j$.URLEncode(window.location);

			//alert(location);

			var act = j$(this).find('a').attr('rel');

			//alert (location);

			j$.cookie(location,act);

			var activeTab = j$(this).find("a").attr("rel"); //Find the href attribute value to identify the active tab + content

			j$(activeTab).show(); 
			
			//console.log("da chay roi tab");
			
		//Cai dat audio mới	
			j$('audio').map(function () {
				if (j$(this).is(":visible") && j$(this).hasClass('tvplay')){
							j$(this).init_tv_AudioPlayer();				
				}
				if (j$(this).is(":visible") && !j$(this).hasClass('tvplay')){
							j$(this).initAudioPlayer();				
				}		
			});				

			return false;

		});

	});
//Tab end

//dich

	j$('.kqdich').css('opacity','0');

	j$('.kqdich').hide();

	j$('.candich').hover(function(){

		j$(this).css('background','#EDFFBE');

		j$(this).css('color','#000');

		j$(this).parent().find('.kqdich').show()

		j$(this).parent().find('.kqdich').stop().animate({opacity:'0.9'},1000);},

		function(){j$(this).parent().find('.kqdich').stop().animate({opacity:'0'},1000);

		j$(this).parent().find('.kqdich').hide();

		j$(this).css('background','none');

		j$(this).css('color','#333');

	});

	j$('.item').hover(function(){

		j$(this).parent().find('.kqdich').show()

		j$(this).parent().find('.kqdich').stop().animate({opacity:'0.9'},1000);},

		function(){j$(this).parent().find('.kqdich').stop().animate({opacity:'0'},1000);

		j$(this).parent().find('.kqdich').hide();

	});

	j$('.candich').mousemove(function(e){
     if (j$(window).width() > 750) {
		var ngang = e.pageX - 150;
		var doc = e.pageY - 120 ;
     } else {
    	var ngang = e; 
		var doc = e + 1;
     }
		j$(this).parent().find('.kqdich').css('top',doc + 'px');
		j$(this).parent().find('.kqdich').css('left',ngang + 'px');
	}); 

	j$('.item').mousemove(function(e){
     if (j$(window).width() > 750) {
		var ngang = e.pageX - 150;
		var doc = e.pageY - 120;
     } else {
    	var ngang = e; 
		var doc = e + 1;
	 }
		j$(this).parent().find('.kqdich').css('top',doc + 'px');
		j$(this).parent().find('.kqdich').css('left',ngang + 'px');

	}); 
	
// Tự thêm vào

	j$('.motaicho').click(function(event){
        return false;
        });
    j$('.motaicho720').click(function(event){
          return false;
        });

	var windowWidth = j$(window).width();
	//console.log(windowWidth);
	
	if(windowWidth <= 760){
		// Truong hop mang hinh nho
		var itemIDs = '';
		j$('.khung tr').map(function () {
			//itemIDs += j$(this).children('td:first').text().trim() + ',';
			
			if(j$(this).children('td:first').text().trim() == ""){
				j$(this).children('td:first').remove();
			}
			if(j$(this).children('td:first').text().trim() == "☞"){
				j$(this).children('td:first').remove();
			}
			//Tăng độ rộng cho STT ví dụ phần ngữ pháp
			if(j$(this).children('td:first').text().trim() == "1."){
				j$(this).children('td:first').remove();
			}
			if(j$(this).children('td:first').text().trim() == "2."){
				j$(this).children('td:first').remove();
			}
			if(j$(this).children('td:first').text().trim() == "3."){
				j$(this).children('td:first').remove();
			}
			if(j$(this).children('td:first').text().trim() == "4."){
				j$(this).children('td:first').remove();
			}
			if(j$(this).children('td:first').text().trim() == "1"){
				j$(this).children('td:first').remove();
			}
			if(j$(this).children('td:first').text().trim() == "2"){
				j$(this).children('td:first').remove();
			}
			if(j$(this).children('td:first').text().trim() == "3"){
				j$(this).children('td:first').remove();
			}
			if(j$(this).children('td:first').text().trim() == "4"){
				j$(this).children('td:first').remove();
			}
			//Thay đổi cho Phần Cấu trúc trong Ngữ pháp
			var colspan = j$(this).children('td:first').attr("colspan");
			colspan = Number(colspan);
			if(colspan == 2){
				j$(this).children('td:first').removeAttr("colspan");
				j$(this).children('td:first').removeAttr('style');
				j$(this).children('td:first').css('background-color', 'rgb(205, 227, 235)');
			}
		});
		
		//Cài đặt phần luyện đọc Minna, phần menu trên không bị lệch xuống
        if(j$('a[rel="#tab1"]').text() == "Đọc 文型(ぶんけい) (văn mẫu)"){
            j$('a[rel="#tab1"]').text("文型")
        }
        if(j$('a[rel="#tab3"]').text() == "Đọc 例文(れいぶん) (ví dụ)"){
            j$('a[rel="#tab3"]').text("例文")
        }
        if(j$('a[rel="#tab4"]').text() == "Đọc 練習(れんしゅう) A(Luyện tập A)"){
            j$('a[rel="#tab4"]').text("練習A")
        }

		
		j$('.khung').removeAttr('style');
		j$('.khung').css('width', '100%');
		
		j$('.khung2').removeAttr('style');
		j$('.khung2').css('width', '100%');
		j$('.khung2 td').removeAttr('style');
		
		j$('table').removeAttr('style');
		j$('table').css('width', '100%');

		
		j$('img').removeAttr('style');
		
		j$('#rt-transition').css("margin", "0px -10px 0px -10px");
	}

//Cai dat audio mới	
	j$('audio').map(function () {
		if (j$(this).is(":visible") && j$(this).hasClass('tvplay')){
					j$(this).init_tv_AudioPlayer();				
		}
		if (j$(this).is(":visible") && !j$(this).hasClass('tvplay')){
					j$(this).initAudioPlayer();				
		}		
	});	
	
});//kết thúc document ready

(function($) {

    $.cookie = function(key, value, options) {

        // key and at least value given, set cookie...


        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {

            options = $.extend({}, options);

            if (value === null || value === undefined) {


                options.expires = -1;

            }

            if (typeof options.expires === 'number') {


                var days = options.expires, t = options.expires = new Date();


                t.setDate(t.getDate() + days);

            }

            value = String(value);

            return (document.cookie = [


                encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),


                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE


                options.path ? '; path=' + options.path : '',


                options.domain ? '; domain=' + options.domain : '',


                options.secure ? '; secure' : ''


            ].join(''));


        }

        // key and possibly options given, get cookie...


        options = value || {};


        var decode = options.raw ? function(s) { return s; } : decodeURIComponent;


        var pairs = document.cookie.split('; ');


        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {


            if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined

        }

        return null;

    };
	

})(jQuery);