import { ChevronLeft, Calendar, Clock, Dumbbell, Trophy, TrendingUp, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkoutSession, WorkoutDay } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoryPageProps {
  history: WorkoutSession[];
  program: WorkoutDay[];
  onBack: () => void;
}

export function HistoryPage({ history, program, onBack }: HistoryPageProps) {
  const sortedHistory = [...history].sort((a, b) => (b.endTime || 0) - (a.endTime || 0));

  const getDayName = (dayId: string) => {
    const day = program.find(d => d.id === dayId);
    return day?.name || 'Bilinmeyen Gün';
  };

  const formatDuration = (startTime: number, endTime: number) => {
    const duration = Math.floor((endTime - startTime) / 1000);
    const mins = Math.floor(duration / 60);
    return `${mins} Dakika`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getChartData = (exerciseName: string) => {
    return history
      .filter(session => session.endTime)
      .map(session => {
        const exercise = session.exercises.find(ex => {
          const original = program.flatMap(d => d.exercises).find(e => e.id === ex.exerciseId);
          return original?.name === exerciseName;
        });

        if (!exercise) return null;

        const lastSet = exercise.sets[exercise.sets.length - 1];
        if (!lastSet?.completed) return null;

        return {
          date: new Date(session.endTime!).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          weight: lastSet.weight,
        };
      })
      .filter((item): item is { date: string; weight: number } => item !== null)
      .reverse();
  };

  const benchData = getChartData('Bench Press');

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col text-white">
      <header className="px-4 py-4 border-b border-[#2A2A2A] flex items-center justify-between sticky top-0 bg-[#0F0F0F]/90 backdrop-blur-md z-20">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400">
          <ChevronLeft className="w-5 h-5 mr-1" /> Geri
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-sm font-black uppercase tracking-widest">Antrenman Geçmişi</h1>
        </div>
        <div className="w-12" />
      </header>

      <main className="flex-1 px-4 py-6 overflow-auto">
        {sortedHistory.length > 0 ? (
          <div className="max-w-md mx-auto space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] flex flex-col items-center">
                <Trophy className="w-5 h-5 text-orange-500 mb-2" />
                <span className="text-xl font-black">{sortedHistory.length}</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Seans</span>
              </div>
              <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] flex flex-col items-center">
                <Clock className="w-5 h-5 text-[#10B981] mb-2" />
                <span className="text-xl font-black">
                  {Math.floor(sortedHistory.reduce((t, s) => t + ((s.endTime || 0) - s.startTime) / 60000, 0))}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Dakika</span>
              </div>
              <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] flex flex-col items-center">
                <Weight className="w-5 h-5 text-blue-500 mb-2" />
                <span className="text-xl font-black">
                  {sortedHistory.reduce((total, s) => 
                    total + s.exercises.reduce((exTotal, ex) => 
                      exTotal + ex.sets.filter(set => set.completed).length, 0
                    ), 0)}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Toplam Set</span>
              </div>
            </div>

            {benchData.length > 1 && (
              <div className="bg-[#1A1A1A] rounded-3xl p-5 border border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                    <h3 className="text-xs font-black uppercase tracking-tighter">Bench Press Gelişimi</h3>
                  </div>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={benchData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {sortedHistory.map((session, idx) => (
                <div key={idx} className="bg-[#1A1A1A] rounded-3xl p-5 border border-[#2A2A2A]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-[#10B981]">
                        {getDayName(session.dayId)}
                      </h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(session.endTime || 0)}
                      </p>
                    </div>
                    <div className="bg-zinc-800 px-3 py-1 rounded-full">
                      <span className="text-[10px] font-black text-white">
                        {formatDuration(session.startTime, session.endTime || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4 pt-4 border-t border-zinc-800">
                    {session.exercises.map((exProgress, exIdx) => {
                      const originalExercise = program.flatMap(d => d.exercises).find(e => e.id === exProgress.exerciseId);
                      const completedSets = exProgress.sets.filter(s => s.completed);
                      const lastSet = completedSets[completedSets.length - 1];
                      return (
                        <div key={exIdx} className="bg-[#0F0F0F] rounded-xl p-3 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">
                              {originalExercise?.name || 'Hareket'}
                            </span>
                            <span className="text-[10px] text-zinc-600 font-medium italic">
                              {completedSets.length} Set Tamamlandı
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs font-black text-[#10B981] block">
                                {lastSet?.weight || 0} <span className="text-[8px] text-zinc-500">KG</span>
                              </span>
                            </div>
                            <div className="bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20 text-right min-w-[45px]">
                              <span className="text-xs font-black text-orange-500">
                                {lastSet?.lastRep || originalExercise?.reps || 0} <span className="text-[8px] opacity-70 ml-0.5">TKR</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Dumbbell className="w-10 h-10 text-zinc-700 mb-4" />
            <h2 className="text-xl font-black uppercase">Kayıt Bulunamadı</h2>
          </div>
        )}
      </main>
    </div>
  );
}
