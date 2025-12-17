import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

interface UseModelReturn {
  model: tf.LayersModel | null;
  loading: boolean;
  error: string | null;
}

export const useModel = (modelUrl: string): UseModelReturn => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        console.log('모델 로딩 시도:', modelUrl);

        // 절대 경로로 시도
        const fullUrl = window.location.origin + modelUrl;
        console.log('전체 경로:', fullUrl);

        const loadedModel = await tf.loadLayersModel(fullUrl);
        setModel(loadedModel);
        console.log('모델 로딩 완료');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '모델 로딩 실패';
        setError(errorMessage);
        console.error('모델 로딩 에러:', err);
      } finally {
        setLoading(false);
      }
    };

    if (modelUrl) {
      loadModel();
    }
  }, [modelUrl]);

  return { model, loading, error };
};