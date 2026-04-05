import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Check, 
  Flag,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [waitingForRestSelection, setWaitingForRestSelection] = useState(false);
  
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTriggeredRef = useRef(false);

  // Başlangıç verilerini hazırla
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

  // Antrenman süresini say
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Dinlenme süresini yönet
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

  const handleFinish = () => {
    const endTime = Date.now();
    const startTime = Date.now() - elapsedTime * 1000;
    
    onFinish({ 
      dayId: day.id, 
      startTime, 
      endTime, 
      exercises: exerciseProgress 
    });
  };

  const currentExercise = day.exercises[currentExerciseIndex];
  const currentProgress = exerciseProgress[currentExerciseIndex];
  
  const getNextSet = () => currentProgress?.sets.find(s => !s.completed);
  const getCompletedSetsCount = () => currentProgress?.sets.filter(s => s.completed).length || 0;
  const isLastSet = (setNumber: number) => setNumber === currentExercise?.sets;

  const startRest = (seconds: number) => {
    initAudioContext();
    setRestTime(seconds);
    setIsResting(true);
    setWaitingForRestSelection(false);
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
          <ChevronLeft className="w-5 h-5 mr-1" /> İptal
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="bg-[#1A1A1A] rounded-full px-3 py-1 border border-[#2A2A2A]">
            <span className="text-sm font-mono font-bold text-[#10B981]">{formatTime(elapsedTime)}</span>
          </div>
          <Button 
            onClick={handleFinish}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-4 h-8 text-xs"
          >
            <Flag className="w-3 h-3 mr-1" /> BİTİR
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">KG</label>
                    <Input
                      type="number" value={set.weight || ''}
                      onChange={(e) => updateSetWeight(set.setNumber, Number(e.target.value))}
                      disabled={set.completed}
                      className="bg-[#0F0F0F] border-[#2A2A2A] h-12 text-center text-xl font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">TEKRAR</label>
                    <Input
                      type="number" 
                      value={isLastSet(set.setNumber) ? (set.lastRep || '') : currentExercise?.reps}
                      onChange={(e) => isLastSet(set.setNumber) && updateLastRep(set.setNumber, Number(e.target.value))}
                      disabled={set.completed || !isLastSet(set.setNumber)}
                      className="bg-[#0F0F0F] border-[#2A2A2A] h-12 text-center text-xl font-bold rounded-xl"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DİNLENME SEÇİMİ - 180S EKLENDİ VE GRID DÜZENLENDİ */}
        {waitingForRestSelection && (
          <div className="max-w-md mx-auto bg-[#1A1A1A] border-2 border-[#10B981] rounded-3xl p-6 mb-8 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 mb-4 text-[#10B981]">
                <Clock className="w-4 h-4" />
                <h3 className="font-black uppercase text-sm">Dinlenme Süresi Seç</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[60, 90, 120, 180].map((sec) => (
                <Button key={sec} onClick={() => startRest(sec)} className="h-14 rounded-xl bg-zinc-800 hover:bg-[#10B981] hover:text-black font-black text-lg transition-colors">
                  {sec}s
                </Button>
              ))}
            </div>
          </div>
        )}

        {isResting && (
          <div className="max-w-md mx-auto bg-[#10B981] rounded-3xl p-6 mb-8 text-black text-center shadow-lg shadow-[#10B981]/20">
            <p className="text-[10px] font-black uppercase mb-1 opacity-70">Dinleniyorsun...</p>
            <h3 className="text-5xl font-mono font-black mb-4">{formatTime(restTime)}</h3>
            <Button onClick={() => setIsResting(false)} className="bg-black text-white rounded-full px-8 font-bold hover:bg-zinc-900">
              ATLA
            </Button>
          </div>
        )}

        {getNextSet() && !isResting && !waitingForRestSelection && (
          <div className="max-w-md mx-auto w-full flex justify-center mt-4">
            <Button 
              onClick={completeSet} 
              className="w-full h-16 bg-[#10B981] hover:bg-[#059669] rounded-2xl text-xl font-black uppercase shadow-lg shadow-[#10B981]/20 transition-transform active:scale-95"
            >
              SETİ TAMAMLA
            </Button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#0F0F0F]/90 backdrop-blur-lg border-t border-[#2A2A2A] z-20">
        <div className="max-w-md mx-auto flex gap-3">
          <Button 
            variant="outline" 
            disabled={currentExerciseIndex === 0}
            onClick={() => setCurrentExerciseIndex(prev => prev - 1)} 
            className="flex-1 h-12 rounded-xl border-[#2A2A2A] font-bold"
          >
            ÖNCEKİ
          </Button>
          <Button 
            variant="outline" 
            disabled={currentExerciseIndex === day.exercises.length - 1}
            onClick={() => setCurrentExerciseIndex(prev => prev + 1)} 
            className="flex-1 h-12 rounded-xl border-[#2A2A2A] font-bold"
          >
            SONRAKİ
          </Button>
        </div>
      </footer>
    </div>
  );
}
