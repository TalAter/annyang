//! annyang - facebook.com
//! version : 0.1.0
//! author  : Tal Ater @TalAter
//! license : MIT
//! https://www.TalAter.com/annyang/

(function () {
  /*global annyang,$ */
  "use strict";
  var root = this;

  if (annyang) {
    var chatToggle = function() {
      root.Chat.toggleSidebar();
    };

    var chatOnline = function() {
      root.ChatVisibility.goOnline();
    };

    var chatOffline = function() {
      root.ChatVisibility.goOffline();
    };

    var searchMore = function(term) {
      root.goURI('/search/more/?q='+term);
    };

    var gotoPage = function(term) {
      root.goURI('/'+term.replace(/[^\w]/ig, ''));
    };

    var stream = function() {
      root.goURI('/');
    };

    var appcenter = function() {
      root.goURI('/appcenter');
    };

    var messages = function() {
      root.goURI('/messages');
    };

    var friendRequests = function() {
      root.goURI('/friends/requests');
    };

    var friends = function() {
      root.goURI('/friends');
    };

    var profile = function() {
      root.goURI('/me');
    };

    var events = function() {
      root.goURI('/events/list');
    };

    var calendar = function() {
      root.goURI('/events/calendar');
    };

    var photos = function(name) {
      root.goURI('/'+(name || 'me').replace(/[^\w]/ig, '')+'/photos');
    };

    var albums = function(name) {
      root.goURI('/'+(name || 'me').replace(/[^\w]/ig, '')+'/photos_albums');
    };

    var goBack = function() {
      history.back();
    };

    var pageScroll = function(direction) {
      if (direction === 'up') {
        window.scrollBy(0, -(window.innerHeight-$('pageHead').offsetHeight));
      } else {
        window.scrollBy(0, window.innerHeight-$('pageHead').offsetHeight);
      }
    };

    annyang.addCommands({
      'back':                 goBack,
      'go back':              goBack,
      'go home':              stream,
      'home':                 stream,
      'news':                 stream,
      'profile':              profile,
      'me':                   profile,
      'games':                appcenter,
      'apps':                 appcenter,
      'messages':             messages,
      'inbox':                messages,
      'mail':                 messages,
      'email':                messages,
      'events':               events,
      'calendar':             calendar,
      'photos':               photos,
      'photos *page':         photos,
      'albums':               albums,
      'albums *page':         albums,
      'friend requests':      friendRequests,
      'friends':              friends,
      'chat':                 chatToggle,
      'chat online':          chatOnline,
      'go online':            chatOnline,
      'chat offline':         chatOffline,
      'go offline':           chatOffline,
      'scroll':               pageScroll,
      'scroll :direction':    pageScroll,
      'find *term':           searchMore,
      'search for *term':     searchMore,
      'search *term':         searchMore,
      'go to *page':          gotoPage,
      'go *page':             gotoPage,
    });
    annyang.start();
  }

}).call(this);
