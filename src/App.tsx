import WebcamCapture from "./components/WebcamCapture";
import { useModel } from "./hooks/useModel";
import { useExerciseStateMachine } from "./hooks/useExerciseStateMachine";

/* 운동 가이드 데이터 */
type ExerciseGuideData = {
  title: string;
  description: string;
  image: string;
};

const EXERCISE_GUIDE_MAP: Record<
  Exclude<ExerciseType, "">,
  ExerciseGuideData
> = {
  squat: {
    title: "스쿼트",
    description: "허리를 곧게 펴고 엉덩이를 뒤로 빼며 앉았다 일어납니다.",
    image: "/images/squat.jpg",
  },
  bench: {
    title: "벤치 프레스",
    description: "가슴을 열고 바를 천천히 내렸다 밀어 올립니다.",
    image: "/images/bench.jpg",
  },
  dead: {
    title: "데드리프트",
    description: "바벨을 몸에 붙인 채 허리를 고정하고 들어 올립니다.",
    image: "/images/deadlift.jpg",
  },
};

const ExerciseGuide = ({ exercise }: { exercise: ExerciseType }) => {
  if (!exercise) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        width: '320px',
      }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
          }}>
            🤖
          </div>
          <p style={{ fontSize: '14px' }}>운동을 시작하면 가이드가 표시됩니다</p>
        </div>
      </div>
    );
  }

  const guide = EXERCISE_GUIDE_MAP[exercise];
  if (!guide) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      width: '320px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '100%',
          height: '200px',
          margin: '0 auto 16px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'rgba(59, 130, 246, 0.1)',
        }}>
          <img
            src={guide.image}
            alt={guide.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // 이미지 로드 실패 시 대체 아이콘 표시
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px;">🏋️</div>';
              }
            }}
          />
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '12px',
        }}>
          {guide.title}
        </h3>
        <p style={{
          color: '#93c5fd',
          fontSize: '14px',
          lineHeight: '1.6',
        }}>
          {guide.description}
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const { model, loading, error } = useModel("/model/model.json");

  const {
    exercise,
    repCount,
    setCount,
    phase,
    targetReps,
    targetSets,
    updateByClassIndex,
  } = useExerciseStateMachine(10, 3);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            border: '4px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <p style={{ color: '#60a5fa', fontSize: '18px' }}>모델 로딩 중...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: 'rgba(153, 27, 27, 0.2)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '24px',
          color: '#f87171',
        }}>
          <p style={{ textAlign: 'center' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: 'white',
      padding: '48px 16px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 제목 */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '48px',
          background: 'linear-gradient(to right, #60a5fa, #2563eb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          🏋️ AI Fitness Coach
        </h1>

        {/* 메인 컨텐츠 */}
        {model && (
          <div style={{
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
              <WebcamCapture
                model={model}
                onPrediction={(pred) => updateByClassIndex(pred.class)}
              />
            </div>
            <ExerciseGuide exercise={exercise} />
          </div>
        )}

        {/* 통계 카드 */}
        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          flexWrap: 'wrap',
        }}>
          {/* 횟수 카드 */}
          <div style={{
            flex: '1 1 300px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#60a5fa',
                fontSize: '25px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '8px',
              }}>
                Count
              </p>
              <p style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '4px',
              }}>
                {repCount}<span style={{ fontSize: '24px', color: '#9ca3af' }}>/{targetReps}</span>
              </p>
              <div style={{
                marginTop: '16px',
                height: '8px',
                background: '#1f2937',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                  width: `${(repCount / targetReps) * 100}%`,
                  transition: 'width 0.3s',
                }}></div>
              </div>
            </div>
          </div>

          {/* 세트 카드 */}
          <div style={{
            flex: '1 1 300px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#60a5fa',
                fontSize: '25px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '8px',
              }}>
                Set
              </p>
              <p style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '4px',
              }}>
                {setCount}<span style={{ fontSize: '24px', color: '#9ca3af' }}>/{targetSets}</span>
              </p>
              <div style={{
                marginTop: '16px',
                height: '8px',
                background: '#1f2937',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                  width: `${(setCount / targetSets) * 100}%`,
                  transition: 'width 0.3s',
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 상태 표시 */}
        {phase === "REST" && (
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(113, 63, 18, 0.5), rgba(217, 119, 6, 0.5))',
              border: '1px solid rgba(234, 179, 8, 0.5)',
              borderRadius: '12px',
              padding: '16px 32px',
            }}>
              <p style={{ color: '#fcd34d', fontSize: '20px', fontWeight: '600' }}>
                ⏸ 휴식 중...
              </p>
            </div>
          </div>
        )}

        {phase === "DONE" && (
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(20, 83, 45, 0.5), rgba(22, 163, 74, 0.5))',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              borderRadius: '12px',
              padding: '16px 32px',
            }}>
              <p style={{ color: '#86efac', fontSize: '20px', fontWeight: '600' }}>
                🎉 운동 완료!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}