<?php
/**
 * This is the main web entry point for MediaWiki.
 *
 * If you are reading this in your web browser, your server is probably
 * not configured correctly to run PHP applications!
 *
 * See the README, INSTALL, and UPGRADE files for basic setup instructions
 * and pointers to the online documentation.
 *
 * https://www.mediawiki.org/
 *
 * ----------
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 */

# Bail on old versions of PHP.  Pretty much every other file in the codebase
# has structures (try/catch, foo()->bar(), etc etc) which throw parse errors in
# PHP 4. Setup.php and ObjectCache.php have structures invalid in PHP 5.0 and
# 5.1, respectively.
if ( !function_exists( 'version_compare' ) || version_compare( PHP_VERSION, '5.3.2' ) < 0 ) {
	// We need to use dirname( __FILE__ ) here cause __DIR__ is PHP5.3+
	require dirname( __FILE__ ) . '/includes/PHPVersionError.php';
	wfPHPVersionError( 'index.php' );
}

require __DIR__ . '/includes/WebStart.php';

$mediaWiki = new MediaWiki();
$mediaWiki->run();



?>

<html>
<head>
  <script>
    var annyangScript = document.createElement('script');
    if (/localhost/.exec(window.location)) {
      annyangScript.src = "/../../extensions/voice/js/annyang.js"
    } else {
      annyangScript.src = "/../../extensions/voice/js/annyang.min.js"
    }
    document.write(annyangScript.outerHTML)
  </script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
  <script>
  "use strict";

  // first we make sure annyang started succesfully
  if (annyang) {

    // define the functions our commands will run.
    var hello = function() {
      $("#hello").slideDown("slow");
      scrollTo("#section_hello");
    };

    var showFlickr = function(tag) {
      $('#flickrGallery').show();
      $('#flickrLoader p').text('Searching for '+tag).fadeIn('fast');
      var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=a828a6571bb4f0ff8890f7a386d61975&sort=interestingness-desc&per_page=9&format=json&callback=jsonFlickrApi&tags='+tag;
      $.ajax({
        type: 'GET',
        url: url,
        async: false,
        jsonpCallback: 'jsonFlickrApi',
        contentType: "application/json",
        dataType: 'jsonp'
      });
      scrollTo("#section_image_search");
    };

    var jsonFlickrApi = function(results) {
      $('#flickrLoader p').fadeOut('slow');
      var photos = results.photos.photo;
      $.each(photos, function(index, photo) {
        $(document.createElement("img"))
          .attr({ src: '//farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_s.jpg' })
          .addClass("flickrGallery")
          .appendTo(flickrGallery);
      });
    };

    var showTPS = function(type) {
      $('#tpsreport').show().animate({
        bottom: '-100px'
      }).delay('2000').animate({
        bottom: '-500px'
      });
    };

    var getStarted = function() {
      window.location.href = 'https://github.com/TalAter/annyang';
    }

    // define our commands.
    // * The key is what you want your users to say say.
    // * The value is the action to do.
    //   You can pass a function, a function name (as a string), or write your function as part of the commands object.
    var commands = {
      'hello (there)':        hello,
      'show me *search':      showFlickr,
      'show :type report':    showTPS,
      'let\'s get started':   getStarted,
    };

    // OPTIONAL: activate debug mode for detailed logging in the console
    annyang.debug();

    // Add voice commands to respond to
    annyang.addCommands(commands);

    // OPTIONAL: Set a language for speech recognition (defaults to English)
    annyang.setLanguage('en');

    // Start listening. You can call this here, or attach this call to an event, button, etc.
    annyang.start();
  } else {
    $(document).ready(function() {
      $('#unsupported').fadeIn('fast');
    });
  }

  var scrollTo = function(identifier, speed) {
    $('html, body').animate({
        scrollTop: $(identifier).offset().top
    }, speed || 1000);
  }
  </script>
  <link rel="stylesheet" href="/../../extensions/voice/css/main.min.css" />
</head>
<body>

  <section>
    <p><em>Voice Search Commands</em></p>
	<p class="voice_instructions">Say,"lets get started". Your browser should open a page git repository profile page of where we fork the source code.</p>
  </section>
  
  </body>
</html>

<?php
?>