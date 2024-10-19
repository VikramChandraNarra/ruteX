import React, { useState, useRef } from 'react';
import axios from 'axios';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToDeepgram(audioBlob);
        audioChunksRef.current = []; // Clear the audio chunks
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const sendAudioToDeepgram = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    try {
      const response = await axios.post('https://api.deepgram.com/v1/listen', formData, {
        headers: {
          'Authorization': `Token 4e5fba3a70b31cd5e060580028430781c372ad7a`,
          'Content-Type': 'multipart/form-data',
        },
        params: {
          model: 'nova-2', // Specify the nova-2 model
          language: 'en',  // Set language to English
          smart_format: true, // Enable smart formatting for better punctuation and spacing
        },
      });

      const { transcript } = response.data.results.channels[0].alternatives[0];
      setTranscript(transcript);
    } catch (error) {
      console.error('Error sending audio to Deepgram:', error);
    }
  };

  return (
    <div>
      <h1>Speech to Text with Deepgram</h1>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>Transcript: {transcript}</p>
    </div>
  );
};

export default SpeechToText;
