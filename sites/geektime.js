//! annyang - Geektime.co.il
//! version : 0.1.0
//! author  : Tal Ater @TalAter
//! license : MIT
//! https://www.TalAter.com/annyang/

(function () {
  /*global annyang,jQuery */
  "use strict";
  var root = this;

  if (annyang) {
    annyang.debug();
    annyang.setLanguage('he');

    var nextPage = function() {
      root.location.href = jQuery('.next-page a').attr("href") || '/';
    };

    var prevPage = function() {
      root.location.href = jQuery('.prev-page a').attr("href") || '/';
    };

    var gotoHome = function() {
      root.location.href = '/';
    };

    var gotoGadgets = function() {
      root.location.href = '/category/gadgets/';
    };

    var gotoStartup = function() {
      root.location.href = '/category/startup/';
    };

    var gotoDevelopment = function() {
      root.location.href = '/category/development/';
    };

    var gotoInternet = function() {
      root.location.href = '/category/internet/';
    };

    var gotoHitech = function() {
      root.location.href = '/category/hi-tech/';
    };

    var gotoGames = function() {
      root.location.href = '/category/games1/';
    };

    var gotoScience = function() {
      root.location.href = '/category/science/';
    };

    var gotoEvents = function() {
      root.location.href = '/eventsboard/';
    };

    var gotoJobs = function() {
      root.location.href = 'http://geekjob.co.il/';
    };

    var gotoSearch = function(search) {
      root.location.href = '/?s='+search;
    };

    var scrollToTop = function() {
      jQuery("html, body").animate({ scrollTop: 0 }, 1500);
      return false;
    };

    annyang.addCommands({
      '(דף) (ה)בית':             gotoHome,
      '(דף) הבא':             nextPage,
      '(דף) (ה)קודם':             prevPage,

      'גאג׳טים*etc':               gotoGadgets,
      'מובייל*etc':           gotoGadgets,
      'mobile*etc':          gotoGadgets,

      'סטארט אפ*etc':        gotoStartup,
      ':etc סיכון':           gotoStartup,

      'פיתוח*etc':        gotoDevelopment,

      'אינטרנט*etc':        gotoInternet,

      'היי טק*etc':        gotoHitech,

      'משחקים*etc':        gotoGames,

      'מדע*etc':        gotoScience,

      'אירוע*etc':        gotoEvents,

      'משרות*etc':        gotoJobs,
      'דרושים*etc':        gotoJobs,

      ':geek me up scotty':        scrollToTop,

      'חפש *etc':        gotoSearch,
      'חפס *etc':        gotoSearch,
    });
    annyang.start();
  }

}).call(this);
