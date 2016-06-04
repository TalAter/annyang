# Frequently Asked Questions

- [What languages are supported?](#what-languages-are-supported)
- [How can I contribute to annyang's development?](#how-can-i-contribute-to-annyangs-development)
- [Why does Speech Recognition repeatedly starts and stops?](#why-does-speech-recognition-repeatedly-starts-and-stops)

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

## How can I contribute to annyang's development?

There are three main ways for you to help. Check out the [CONTRIBUTING](https://github.com/TalAter/annyang/blob/master/CONTRIBUTING.md) file for more details.

## Why does Speech Recognition repeatedly starts and stops?

The most common reason for this is because you have opened more than one tab or window that uses Speech Recognition in your browser at the same time (e.g. if you open annyang's homepage in one tab, and the Speech Recognition app you are developing in another).

When a browser detects that one tab has started Speech Recognition, it aborts all other Speech Recognition processes in other tabs. annyang detects when it is aborted by an external process and restarts itself. If you have two windows aborting each other, and restarting themselves you may experience Speech Recognition starting and stopping over and over again.  

Another possible reason for this might be that you are offline.

## Can annyang work offline?
