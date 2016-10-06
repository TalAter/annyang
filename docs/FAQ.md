# Frequently Asked Questions

- [What languages are supported?](#what-languages-are-supported)
- [Why does the browser repeatedly ask for permission to use the microphone?](#why-does-the-browser-repeatedly-ask-for-permission-to-use-the-microphone)
- [How can I contribute to annyang's development?](#how-can-i-contribute-to-annyangs-development)
- [Why does Speech Recognition repeatedly starts and stops?](#why-does-speech-recognition-repeatedly-starts-and-stops)
- [Can annyang work offline?](#can-annyang-work-offline)
- [Can annyang be used to capture the full text spoken by the user?](#can-annyang-be-used-to-capture-the-full-text-spoken-by-the-user)
- [Can I detect when the user starts and stops speaking?](#can-i-detect-when-the-user-starts-and-stops-speaking)
- [Can annyang be used in Chromium or Electron?](#can-annyang-be-used-in-chromium-or-electron)
- [Can annyang be used in Cordova?](#can-annyang-be-used-in-cordova)

## What languages are supported?

Language support is up to each browser. While there isn't an official list of supported languages in Chrome, here is a list based on [anecdotal evidence](http://stackoverflow.com/a/14302134/338039).

* Afrikaans `af`
* Basque `eu`
* Bulgarian `bg`
* Catalan `ca`
* Arabic (Egypt) `ar-EG`
* Arabic (Jordan) `ar-JO`
* Arabic (Kuwait) `ar-KW`
* Arabic (Lebanon) `ar-LB`
* Arabic (Qatar) `ar-QA`
* Arabic (UAE) `ar-AE`
* Arabic (Morocco) `ar-MA`
* Arabic (Iraq) `ar-IQ`
* Arabic (Algeria) `ar-DZ`
* Arabic (Bahrain) `ar-BH`
* Arabic (Lybia) `ar-LY`
* Arabic (Oman) `ar-OM`
* Arabic (Saudi Arabia) `ar-SA`
* Arabic (Tunisia) `ar-TN`
* Arabic (Yemen) `ar-YE`
* Czech `cs`
* Dutch `nl-NL`
* English (Australia) `en-AU`
* English (Canada) `en-CA`
* English (India) `en-IN`
* English (New Zealand) `en-NZ`
* English (South Africa) `en-ZA`
* English(UK) `en-GB`
* English(US) `en-US`
* Finnish `fi`
* French `fr-FR`
* Galician `gl`
* German `de-DE`
* Hebrew `he`
* Hungarian `hu`
* Icelandic `is`
* Italian `it-IT`
* Indonesian `id`
* Japanese `ja`
* Korean `ko`
* Latin `la`
* Mandarin Chinese `zh-CN`
* Traditional Taiwan `zh-TW`
* Simplified China zh-CN `?`
* Simplified Hong Kong `zh-HK`
* Yue Chinese (Traditional Hong Kong) `zh-yue`
* Malaysian `ms-MY`
* Norwegian `no-NO`
* Polish `pl`
* Pig Latin `xx-piglatin`
* Portuguese `pt-PT`
* Portuguese (Brasil) `pt-BR`
* Romanian `ro-RO`
* Russian `ru`
* Serbian `sr-SP`
* Slovak `sk`
* Spanish (Argentina) `es-AR`
* Spanish (Bolivia) `es-BO`
* Spanish (Chile) `es-CL`
* Spanish (Colombia) `es-CO`
* Spanish (Costa Rica) `es-CR`
* Spanish (Dominican Republic) `es-DO`
* Spanish (Ecuador) `es-EC`
* Spanish (El Salvador) `es-SV`
* Spanish (Guatemala) `es-GT`
* Spanish (Honduras) `es-HN`
* Spanish (Mexico) `es-MX`
* Spanish (Nicaragua) `es-NI`
* Spanish (Panama) `es-PA`
* Spanish (Paraguay) `es-PY`
* Spanish (Peru) `es-PE`
* Spanish (Puerto Rico) `es-PR`
* Spanish (Spain) `es-ES`
* Spanish (US) `es-US`
* Spanish (Uruguay) `es-UY`
* Spanish (Venezuela) `es-VE`
* Swedish `sv-SE`
* Turkish `tr`
* Zulu `zu`

## Why does the browser repeatedly ask for permission to use the microphone?

![](http://i.imgur.com/Z3zooUC.png)

Chrome's speech recognition behaves differently based on the protocol used:

- `https://` Asks for permission once and remembers the choice.

- `http://`  Asks for permission repeatedly **on every page load**. Results are also returned significantly slower in HTTP.

For a great user experience, don't compromise on anything less than HTTPS (available free with CloudFlare and Let's Encrypt).

## How can I contribute to annyang's development?

There are three main ways for you to help. Check out the [CONTRIBUTING](https://github.com/TalAter/annyang/blob/master/CONTRIBUTING.md) guide for more details.

## Why does Speech Recognition repeatedly starts and stops?

The most common reason for this is because you have opened more than one tab or window that uses Speech Recognition in your browser at the same time (e.g. if you open annyang's homepage in one tab, and the Speech Recognition app you are developing in another).

When a browser detects that one tab has started Speech Recognition, it aborts all other Speech Recognition processes in other tabs. annyang detects when it is aborted by an external process and restarts itself. If you have two windows aborting each other, and restarting themselves you may experience Speech Recognition starting and stopping over and over again.  

Another possible reason for this might be that you are offline.

## Can annyang work offline?

No. annyang relies on the browser's own speech recognition engine. In Chrome, this engine performs the recognition in the cloud.

## Can annyang be used to capture the full text spoken by the user?

Yes. You can listen to the `result` event which is triggered whenever speech is recognized. This event will fire with a list of possible phrases the user may have said, regardless of whether any of them matched an annyang command or not. You can even do this without registering any commands:

````javascript
annyang.addCallback('result', function(phrases) {
  console.log("I think the user said: ", phrases[0]);
  console.log("But then again, it could be any of the following: ", phrases);
});
````

Alternatively, you may choose to only capture what the user said when it matches an annyang command (`resultMatch`), or when it does not match a command (`resultNoMatch`).

````javascript
annyang.addCallback('resultMatch', function(userSaid, commandText, phrases) {
  console.log(userSaid); // sample output: 'hello'
  console.log(commandText); // sample output: 'hello (there)'
  console.log(phrases); // sample output: ['hello', 'halo', 'yellow', 'polo', 'hello kitty']
});

annyang.addCallback('resultNoMatch', function(phrases) {
  console.log("I think the user said: ", phrases[0]);
  console.log("But then again, it could be any of the following: ", phrases);
});
````

## Can I detect when the user starts and stops speaking?

Yes. Sometimes.

You can detect when a sound is first detected by the microphone with the `soundstart` event. Unfortunately, due to a [bug in Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=572697&thanks=572697&ts=1451323087), this event will only fire once in every speech recognition session. If you are in non-continuous mode and annyang is restarting after every sentence recognized (the default in HTTPS), this will not be a problem. Because speech recognition will abort and restart, soundstart will fire again correctly.

The following code will detect when a user starts and stops speaking.

````javascript
annyang.addCallback('soundstart', function() {
  console.log('sound detected');
});

annyang.addCallback('result', function() {
  console.log('sound stopped');
});

````

*Note*: The `soundstart` event is only available in annyang v2.6.0 and up.

## Can annyang be used in Chromium or Electron?

Yes, however you must create your own Chromium keys and are limited to 50 requests/day. To do this you'll need to provide your own keys at runtime by following the instructions for [Acquiring Keys](https://www.chromium.org/developers/how-tos/api-keys) in the Chromium developer docs.

## Can annyang be used in Cordova?

Yes. In order to use `webKitSpeechRecognition` you will need to use [Crosswalk](https://github.com/crosswalk-project/cordova-plugin-crosswalk-webview) and the [Cordova Media Plugin](https://github.com/apache/cordova-plugin-media). These can be added to an existing cordova project with the following commands:

```
cordova plugin add cordova-plugin-crosswalk-webview
cordova plugin add cordova-plugin-media
```
**Known issues:**
 - This has only been verified to work on Android.
 - This will not work on a device without a SpeechRecognizer ([like the Kindle Fire](https://forums.developer.amazon.com/questions/13597/does-speech-recognition-work-in-kindle-fire-hd-tab.html)) unless you sideload the [Google Now Launcher](https://play.google.com/store/apps/details?id=com.google.android.launcher).
 - Your app will ding with the native speech recognition sound, you have no control over this. See [#194](https://github.com/TalAter/annyang/issues/194).
