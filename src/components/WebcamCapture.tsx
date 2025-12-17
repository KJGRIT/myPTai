import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';

interface PredictionResult {
  class: number;
  probability: number;
  allProbabilities: number[];
}

interface WebcamCaptureProps {
  onFrame?: (video: HTMLVideoElement) => void;
  model: tf.LayersModel | null;
  onPrediction?: (predictions: PredictionResult) => void;
}

const WebcamCapture = ({ onFrame, model, onPrediction }: WebcamCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!model) return;

    const processFrame = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        !isProcessing
      ) {
        setIsProcessing(true);
        const video = webcamRef.current.video;

        try {
          // 비디오에서 텐서 생성
          const tensor = tf.browser.fromPixels(video)
            .resizeBilinear([224, 224])
            .expandDims(0)
            .toFloat()
            .div(255.0);

          // 모델 예측
          const predictions = await model.predict(tensor) as tf.Tensor;
          const probabilities = await predictions.data();

          // 결과 처리
          const predArray = Array.from(probabilities);
          const maxProb = Math.max(...predArray);
          const predictedClass = predArray.indexOf(maxProb);

          if (onPrediction) {
            onPrediction({
              class: predictedClass,
              probability: maxProb,
              allProbabilities: predArray
            });
          }

          // 메모리 해제
          tensor.dispose();
          predictions.dispose();

        } catch (error) {
          console.error('예측 에러:', error);
        }

        if (onFrame) {
          onFrame(video);
        }

        setIsProcessing(false);
      }
    };

    const interval = setInterval(processFrame, 500);
    return () => clearInterval(interval);
  }, [model, isProcessing, onFrame, onPrediction]);

  return (
    <div style={{ position: 'relative', width: '640px', height: '480px' }}>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user"
        }}
        style={{
           alignItems: 'center',
           height: '100%', // 화면 전체 높이
           width: '100%',   // 화면 전체 너비
        }}
      />
    </div>
  );
};

export default WebcamCapture;