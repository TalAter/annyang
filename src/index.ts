export {
  isSpeechRecognitionSupported,
  addCommands,
  removeCommands,
  start,
  abort,
  pause,
  resume,
  addCallback,
  removeCallback,
  isListening,
  setLanguage,
  trigger,
  debug,
  getSpeechRecognizer,
  getState,
} from './annyang';

export type { CallbackType, CallbackMap, StartOptions, CommandsList, AnnyangState } from './annyang';

import {
  isSpeechRecognitionSupported,
  addCommands,
  removeCommands,
  start,
  abort,
  pause,
  resume,
  addCallback,
  removeCallback,
  isListening,
  setLanguage,
  trigger,
  debug,
  getSpeechRecognizer,
  getState,
} from './annyang';

const annyang = {
  isSpeechRecognitionSupported,
  addCommands,
  removeCommands,
  start,
  abort,
  pause,
  resume,
  addCallback,
  removeCallback,
  isListening,
  setLanguage,
  trigger,
  debug,
  getSpeechRecognizer,
  get state() {
    return getState();
  },
} as const;

export default annyang;
