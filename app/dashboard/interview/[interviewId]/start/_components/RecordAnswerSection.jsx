"use client"

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import React from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import Webcam from 'react-webcam';
import { Mic, StopCircle } from 'lucide-react';
import { toast } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModal';
import { UserAnswer } from '@/utils/schema';
import moment from 'moment';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex ,interviewData}) {
  const [userAnswer, setUserAnswer] = useState('');
  const {user}=useUser();
  const [loading,setLoading]=useState(false);

  // Use a conditional check to ensure `window` is available before accessing it
  const isBrowser = typeof window !== 'undefined';

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,   

  });

  useEffect(()   => {
    if (isBrowser && results.length) {
      setUserAnswer((prevAns) => prevAns + results[results.length - 1]?.transcript);
    }
  }, [results, isBrowser]); // Add isBrowser to the dependency array

  useEffect(()=>{

    if(!isRecording&&userAnswer.length>10){
      UpdateUserAnswer();

    }

  },[userAnswer])

  const StartStopRecording = async () => {
    if (isRecording) {
      
      stopSpeechToText();
      
      if (userAnswer.length < 10) {
        setLoading(false);
        toast('Error while saving your answer, Please record again');
        return;
      }

      // const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}, User Answer: ${userAnswer}, Depends on question and user answer for given interview question. Please give us rating for answer and feedback as area of improvement if any in just 3to 5 lines to improve it in JSON format with rating field and feedback field.`;
      // const result = await chatSession.sendMessage(feedbackPrompt);

      // const mockJsonResp = result.response.text().replace('`json', '').replace('`', '');
      // console.log(mockJsonResp);

      // // Remove backticks from the string before parsing
      // const JsonFeedbackResp = JSON.parse(mockJsonResp.replace(/`/g, ''));

      // const resp=await db.insert(UserAnswer)
      // .values({
      //   mockIdRef :interviewData?.mockId,
      //   question:mockInterviewQuestion[activeQuestionIndex]?.Question,
      //   correctAns:mockInterviewQuestion[activeQuestionIndex]?.answer,
      //   userAns: userAnswer,
      //   feedback: JsonFeedbackResp?.feedback,
      //   rating: JsonFeedbackResp?.rating,
      //   userEmail: user?.primaryEmailAddress?.emailAddress,
      //   createdAt:moment().format('DD-MM-YYYY') ,
      // })

      // if(resp){
      //   toast('User Answer recorded successfully')
      // }
      
      // setUserAnswer('');
      // setLoading(false);
    } else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswer=async()=>{
    
    console.log(userAnswer)
    setLoading(true)
    const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}, User Answer: ${userAnswer}, Depends on question and user answer for given interview question. Please give us rating for answer and feedback as area of improvement if any in just 3to 5 lines to improve it in JSON format with rating field and feedback field.`;
      const result = await chatSession.sendMessage(feedbackPrompt);

      const mockJsonResp = result.response.text().replace('`json', '').replace('`', '');
      console.log(mockJsonResp);

      // Remove backticks from the string before parsing
      const JsonFeedbackResp = JSON.parse(mockJsonResp.replace(/`/g, ''));

      const resp=await db.insert(UserAnswer)
      .values({
        mockIdRef :interviewData?.mockId,
        question:mockInterviewQuestion[activeQuestionIndex]?.Question,
        correctAns:mockInterviewQuestion[activeQuestionIndex]?.Answer,
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback,
        rating: JsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt:moment().format('DD-MM-YYYY') ,
      })

      if(resp){
        toast('User Answer recorded successfully')
        setUserAnswer('');
        setResults([]);
      }
      
      //  setResults([]);
      setLoading(false);

  }

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center rounded-lg p-5 bg-black">
        <Image src={'/webcam.png'} width={200} height={200} className="absolute" />

        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: '100%',
            zIndex: 10,
          }}
        />
      </div>

      <Button disabled={loading} variant="outline" className="my-10" onClick={StartStopRecording}>
        {isRecording ? (
          <h2 className="text-red-600 animate-pulse flex gap-2 items-center">
            <StopCircle /> Stop Recording
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>

      
    </div>
  );
}

export default RecordAnswerSection;