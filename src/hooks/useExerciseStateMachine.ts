import { useState, useRef, useEffect } from "react";

export type ExerciseType = "squat" | "bench" | "dead" | "";

type MotionState = "READY" | "UP" | "DOWN";
type PhaseState = "WORK" | "REST" | "DONE";

export function useExerciseStateMachine(
  targetReps: number = 10,
  targetSets: number = 3
) {
  const [exercise, setExercise] = useState<ExerciseType>("");
  const [motionState, setMotionState] = useState<MotionState>("READY");
  const [phase, setPhase] = useState<PhaseState>("WORK");

  const [repCount, setRepCount] = useState(0);
  const [setCount, setSetCount] = useState(1);

  const setLockRef = useRef(false);
  const doneTimeoutRef = useRef<number | null>(null);
  const restTimeoutRef = useRef<number | null>(null);

  const labelMap: Record<number, string> = {
    0: "squat_up",
    1: "squat_down",
    2: "bench_up",
    3: "bench_down",
    4: "dead_up",
    5: "dead_down",
  };

  const resetAll = (newExercise: ExerciseType = "") => {
    // 모든 타이머 정리
    if (doneTimeoutRef.current) {
      clearTimeout(doneTimeoutRef.current);
      doneTimeoutRef.current = null;
    }
    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }

    setExercise(newExercise);
    setMotionState("READY");
    setPhase("WORK");
    setRepCount(0);
    setSetCount(1);
    setLockRef.current = false;
  };

  const startNextSet = () => {
    setPhase("WORK");
    setMotionState("READY");
    setRepCount(0);
    setLockRef.current = false;
  };

  /* =========================
     ✅ REST 타이머 관리 (phase가 REST로 바뀔 때만 실행)
     ========================= */
  useEffect(() => {
    if (phase !== "REST") return;

    // 3초 후 다음 세트 시작
    restTimeoutRef.current = window.setTimeout(() => {
      startNextSet();
    }, 3000);

    return () => {
      if (restTimeoutRef.current) {
        clearTimeout(restTimeoutRef.current);
        restTimeoutRef.current = null;
      }
    };
  }, [phase]);

  /* =========================
     ✅ DONE 상태 감지 → 10초 후 초기화
     ========================= */
  useEffect(() => {
    if (phase !== "DONE") {
      if (doneTimeoutRef.current) {
        clearTimeout(doneTimeoutRef.current);
        doneTimeoutRef.current = null;
      }
      return;
    }

    // DONE 상태일 때만 10초 타이머 시작
    doneTimeoutRef.current = window.setTimeout(() => {
      resetAll("");
    }, 10000);

    return () => {
      if (doneTimeoutRef.current) {
        clearTimeout(doneTimeoutRef.current);
        doneTimeoutRef.current = null;
      }
    };
  }, [phase]);

  const updateByClassIndex = (cls: number) => {
    // WORK 상태일 때만 카운트
    if (phase !== "WORK") return;

    const label = labelMap[cls];
    if (!label) return;

    const [detectedExercise, motion] = label.split("_") as [
      ExerciseType,
      "up" | "down"
    ];

    // 운동 종류가 바뀌면 리셋 (단, 초기 상태("")에서는 리셋하지 않음)
    if (exercise !== "" && exercise !== detectedExercise) {
      resetAll(detectedExercise);
      return;
    }

    // 초기 상태("")에서는 운동 종류만 설정
    if (exercise === "") {
      setExercise(detectedExercise);
    }

    if (motion === "up") {
      if (motionState === "READY") {
        setMotionState("UP");
      } else if (motionState === "DOWN") {
        setMotionState("UP");

        setRepCount((prev) => {
          const next = prev + 1;

          // 목표 횟수 달성 시
          if (next === targetReps && !setLockRef.current) {
            setLockRef.current = true;

            // 마지막 세트인 경우 → DONE
            if (setCount === targetSets) {
              setPhase("DONE");
            }
            // 아직 세트가 남은 경우 → REST로 전환 후 다음 세트로
            else {
              setSetCount((s) => s + 1);
              setPhase("REST");
            }

            return targetReps;
          }

          return next > targetReps ? targetReps : next;
        });
      }
    }

    if (motion === "down" && motionState === "UP") {
      setMotionState("DOWN");
    }
  };

  return {
    exercise,
    motionState,
    phase,
    repCount,
    setCount,
    targetReps,
    targetSets,
    updateByClassIndex,
  };
}