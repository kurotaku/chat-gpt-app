import { useEffect, useRef, useState, useCallback } from "react";

interface ISpeechRecognitionEvent {
  isTrusted?: boolean;
  resultIndex: number;
  results: {
    isFinal: boolean;
    [key: number]:
    | undefined
    | {
      transcript: string;
    };
  }[];
}

interface ISpeechRecognition extends EventTarget {
  grammars: string;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI: string;
  onaudiostart: () => void;
  onaudioend: () => void;
  onend: () => void;
  onerror: () => void;
  onnomatch: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onsoundstart: () => void;
  onsoundend: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
  onstart: () => void;
  abort(): void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: any | { webkitSpeechRecognition: any };
  }
}
declare var webkitSpeechRecognition: any;

interface IUseSpeechRecognition {
  enabled: boolean;
  lang: "ja" | "en";
  continuous: boolean; // 連続的に音声認識
  interimResults: boolean; // 途中結果の出力
}

interface ISpeechRecognitionResult {
  finishText: string;
  interimText: string;
}

/**
 * 音声認識ReactHook
 * @param props 
 * @returns 
 */
const useSpeechRecognition = (props: IUseSpeechRecognition): [ISpeechRecognitionResult, () => void, () => void] => {
  const ref = useRef<ISpeechRecognitionResult>({
    finishText: '',
    interimText: ''
  });
  const [text, setText] = useState<string>();
  const [isStarted, setIsStarted] = useState(false);
  window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  var recognition: ISpeechRecognition = new webkitSpeechRecognition();
  recognition.lang = props.lang;
  recognition.interimResults = props.interimResults;
  recognition.continuous = props.continuous;

  recognition.onresult = (event: ISpeechRecognitionEvent) => {
    if (props.enabled) {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          ref.current.finishText = finalTranscript;
        } else {
          interimTranscript += transcript;
          ref.current.interimText = interimTranscript;
        }
      }
    }
    else {
      ref.current.interimText = "";
      ref.current.finishText = "";
    }
  };

  const startRecognition = useCallback(() => {
    if (!isStarted) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          recognition.start();
          setIsStarted(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [isStarted]);

  const stopRecognition = useCallback(() => {
    if (isStarted) {
      recognition.stop();
      setIsStarted(false);
    }
  }, [isStarted]);

  useEffect(() => {
    return () => stopRecognition(); // Cleanup function to stop recognition when the component is unmounted
  }, [stopRecognition]);

  return [ref.current, startRecognition, stopRecognition];
}

export default useSpeechRecognition;
