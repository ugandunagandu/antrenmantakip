import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Check, 
  Play, 
  Pause, 
  SkipForward 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { WorkoutDay, ExerciseProgress } from '@/types';
import { playCountdownBeeps, initAudioContext } from '@/utils/sound';

interface WorkoutPageProps {
  day: WorkoutDay;
  onFinish: (session: { 
    dayId: string; 
    startTime: number; 
    endTime: number; 
    exercises: ExerciseProgress[] 
  }) => void;
  onBack: () => void;
}

export function WorkoutPage({ day, onFinish, onBack }: WorkoutPageProps) {
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  const [waitingForRestSelection, setWaitingForRestSelection] = useState(false);
  
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTriggeredRef = useRef(false);

  useEffect(() => {
    const initialProgress = day.exercises.map(ex => ({
      exerciseId: ex.id,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        completed: false,
        weight: ex.startingWeight || 0,
        lastRep: undefined,
      })),
    }));
    setExerciseProgress(initialProgress);
  }, [day]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (isResting && restTime > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 3 && newTime > 0 && !countdownTriggeredRef.current) {
            countdownTriggeredRef.current = true;
            playCountdownBeeps();
          }
          if (newTime <= 0) {
            setIsResting(false);
            countdownTriggeredRef.current = false;
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); };
  }, [isResting, restTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = day.exercises[currentExerciseIndex];
  const currentProgress = exerciseProgress[currentExerciseIndex];
  
  const getNextSet = () => currentProgress?.sets.find(s => !s.completed);
  const getCompletedSetsCount = () => currentProgress?.sets.filter(s => s.completed).length || 0;
  const isLastSet = (setNumber: number) => setNumber === currentExercise?.sets;

  const startRest = (seconds: number) => {
    initAudioContext();
    setRestDuration(seconds);
    setRestTime(seconds);
    setIsResting(true);
    setWaitingForRestSelection(false);
    countdownTriggeredRef.current = false;
  };

  const completeSet = () => {
    if (!currentProgress) return;
    const nextSet = getNextSet();
    if (!nextSet) return;

    setExerciseProgress(prev => {
      const newProgress = [...prev];
      const setIndex = newProgress[currentExerciseIndex].sets.findIndex(s => s.setNumber === nextSet.setNumber);
      newProgress[currentExerciseIndex].sets[setIndex].completed = true;
      return newProgress;
    });

    setWaitingForRestSelection(true);
  };

  const updateSetWeight = (setNumber: number, weight: number) => {
    setExerciseProgress(prev => {
      const newProgress = [...prev];
      const setIndex = newProgress[currentExerciseIndex].sets.findIndex(s => s.setNumber === setNumber);
      newProgress[currentExerciseIndex].sets[setIndex].weight = weight;
      return newProgress;
    });
  };

  const updateLastRep = (setNumber: number, lastRep: number) => {
    setExerciseProgress(prev => {
      const newProgress = [...prev];
      const setIndex = newProgress[currentExerciseIndex].sets.findIndex(s => s.setNumber === setNumber);
      newProgress[currentExerciseIndex].sets[setIndex].lastRep = lastRep;
      return newProgress;
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col text-white">
      <header className="px-4 py-4 border-b border-[#2A2A2A] flex items-center justify-between sticky top-0 bg-[#0F0F0F]/80 backdrop-blur-md z-10">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400">
          <ChevronLeft className="w-5 h-5 mr-1" /> Geri
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-[#1A1A1A] rounded-full px-4 py-1.5 border border-[#2A2A2A]">
            <span className="text-lg font-mono font-bold text-[#10B981]">{formatTime(elapsedTime)}</span>
          </div>
          <Button
            variant="ghost" size="icon"
            onClick={() => setIsRunning(!isRunning)}
            className={`w-10 h-10 rounded-full text-white ${isRunning ? 'bg-orange-500' : 'bg-[#10B981]'}`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 overflow-auto pb-32">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-1">{currentExercise?.name}</h2>
          <p className="text-[#10B981] font-bold">{currentExerciseIndex + 1} / {day.exercises.length} HAREKET</p>
        </div>

        <div className="max-w-md mx-auto space-y-4 mb-10">
          {currentProgress?.sets.map((set, index) => {
            const isCurrent = index === getCompletedSetsCount() && !isResting && !waitingForRestSelection;
            return (
              <div key={set.setNumber} className={`p-4 rounded-2xl border transition-all ${
                set.completed ? 'bg-[#10B981]/5 border-[#10B981]/20 opacity-60' : 
                isCurrent ? 'bg-[#1A1A1A] border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[#1A1A1A] border-[#2A2A2A]'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${set.completed ? 'bg-[#10B981]' : 'bg-[#2A2A2A]'}`}>
                      {set.completed ? <Check className="w-5 h-5" /> : set.setNumber}
                    </div>
                    <span className="font-bold text-lg">SET {set.setNumber}</span>
                  </div>
                  {isLastSet(set.setNumber) && (
                    <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-black">SON SET</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Ağırlık (KG)</label>
                    <Input
                      type="number" value={set.weight || ''}
                      onChange={(e) => updateSetWeight(set.setNumber, Number(e.target.value))}
                      disabled={set.completed}
                      className="bg-[#0F0F0F] border-[#2A2A2A] h-12 text-center text-xl font-bold rounded-xl focus:border-[#10B981]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">
                        {isLastSet(set.setNumber) ? "Gerçek Tekrar" : "Hedef Tekrar"}
                    </label>
                    <Input
                      type="number" 
                      value={isLastSet(set.setNumber) ? (set.lastRep || '') : currentExercise?.reps}
                      onChange={(e) => isLastSet(set.setNumber) && updateLastRep(set.setNumber, Number(e.target.value))}
                      disabled={set.completed || !isLastSet(set.setNumber)}
                      className={`bg-[#0F0F0F] border-[#2A2A2A] h-12 text-center text-xl font-bold rounded-xl ${isLastSet(set.setNumber) ? 'border-orange-500/50 text-orange-500' : ''}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {waitingForRestSelection && (
          <div className="max-w-md mx-auto bg-[#1A1A1A] border-2 border-orange-500 rounded-3xl p-6 mb-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-center font-black text-orange-500 mb-4 uppercase tracking-widest">DİNLENME SÜRESİ SEÇ</h3>
            <div className="grid grid-cols-3 gap-3">
              {[60, 90, 180].map((sec) => (
                <Button key={sec} onClick={() => startRest(sec)} className="h-20 rounded-2xl bg-zinc-800 hover:bg-orange-500 flex flex-col gap-1 border border-zinc-700">
                  <span className="text-2xl font-black">{sec}</span>
                  <span className="text-[10px] opacity-60">SANİYE</span>
                </Button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setWaitingForRestSelection(false)} className="w-full mt-4 text-gray-500 text-xs">DİNLENMEDEN DEVAM ET</Button>
          </div>
        )}

        {isResting && (
          <div className="max-w-md mx-auto bg-[#10B981] rounded-3xl p-8 mb-8 text-black shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
            <div className="text-center">
              <p className="font-black text-xs uppercase tracking-widest mb-2 opacity-70">Sıradaki Set Hazırlan</p>
              <h3 className="text-7xl font-mono font-black mb-6">{formatTime(restTime)}</h3>
              <Progress value={((restDuration - restTime) / restDuration) * 100} className="h-2 bg-black/20 mb-6" />
              <Button onClick={() => setIsResting(false)} className="bg-black text-white rounded-full px-8 hover:bg-zinc-900 font-bold">
                <SkipForward className="w-4 h-4 mr-2" /> DİNLENMEYİ BİTİR
              </Button>
            </div>
          </div>
        )}

        {getNextSet() && !isResting && !waitingForRestSelection && (
          <Button onClick={completeSet} className="max-w-md mx-auto w-full h-20 bg-[#10B981] hover:bg-[#059669] rounded-2xl shadow-lg shadow-[#10B981]/20 flex flex-col gap-0">
            <span className="text-2xl font-black uppercase tracking-tighter">SETİ TAMAMLA</span>
            <span className="text-xs opacity-80 font-medium">Sıradaki: Set {getNextSet()?.setNumber}</span>
          </Button>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#0F0F0F]/90 backdrop-blur-lg border-t border-[#2A2A2A] z-20">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          {currentExerciseIndex < day.exercises.length - 1 ? (
            <Button variant="outline" onClick={() => setCurrentExerciseIndex(prev => prev + 1)} className="h-12 rounded-xl border-[#2A2A2A] font-bold">SONRAKİ HAREKET</Button>
          ) : (
            <div />
          )}
          <Button 
            onClick={() => onFinish({ 
              dayId: day.id, 
              startTime: Date.now() - elapsedTime * 1000, 
              endTime: Date.now(), 
              exercises: exerciseProgress 
            })} 
            className="h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold uppercase tracking-tight"
          >
            ANTRENMANI BİTİR
          </Button>
        </div>
      </footer>
    </div>
  );
}