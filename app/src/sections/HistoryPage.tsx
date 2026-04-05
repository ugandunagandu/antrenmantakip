import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Target, Clock, Trash2, Edit3, AlertTriangle } from 'lucide-react'; 
import type { WorkoutSession, WorkoutDay } from '@/types';

interface HistoryPageProps {
  history: WorkoutSession[];
  program: WorkoutDay[];
  onBack: () => void; 
  onDeleteSession: (timestamp: string) => void;
  onUpdateSession: (session: WorkoutSession) => void;
  onClearAllHistory: () => void; // Yeni prop
}

export function HistoryPage({ history, program, onBack, onDeleteSession, onUpdateSession, onClearAllHistory }: HistoryPageProps) {
  
  const getNameFromId = (id: string) => {
    for (const day of program) {
      const exercise = day.exercises.find(ex => ex.id === id);
      if (exercise) return exercise.name;
    }
    return id.toUpperCase();
  };

  const exerciseNamesList = useMemo(() => {
    const names = new Set<string>();
    history.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.exerciseId) names.add(getNameFromId(ex.exerciseId));
      });
    });
    return Array.from(names).sort();
  }, [history, program]);

  const [selectedExerciseName, setSelectedExerciseName] = useState<string>(exerciseNamesList[0] || "");

  const handleEdit = (sessionDate: string, currentWeight: number, currentReps: number) => {
    const newWeight = prompt(`${sessionDate} tarihi için yeni KİLO:`, currentWeight.toString());
    const newReps = prompt(`Yeni TEKRAR:`, currentReps.toString());

    if (newWeight && newReps) {
      const sessionToUpdate = history.find(s => new Date(s.endTime).toLocaleDateString('tr-TR') === sessionDate);
      if (sessionToUpdate) {
        const updatedExercises = sessionToUpdate.exercises.map(ex => {
          if (getNameFromId(ex.exerciseId) === selectedExerciseName) {
            const updatedSets = [...ex.sets];
            updatedSets[updatedSets.length - 1] = {
              ...updatedSets[updatedSets.length - 1],
              weight: Number(newWeight),
              lastRep: Number(newReps)
            };
            return { ...ex, sets: updatedSets };
          }
          return ex;
        });
        onUpdateSession({ ...sessionToUpdate, exercises: updatedExercises });
      }
    }
  };

  const exerciseHistory = useMemo(() => {
    const data: any[] = [];
    [...history].reverse().forEach(session => {
      const foundExercise = session.exercises.find(ex => getNameFromId(ex.exerciseId) === selectedExerciseName);
      if (foundExercise && foundExercise.sets.length > 0) {
        const lastSet = foundExercise.sets[foundExercise.sets.length - 1];
        data.push({
          date: new Date(session.endTime).toLocaleDateString('tr-TR'),
          timestamp: session.endTime,
          weight: lastSet.weight || 0,
          reps: lastSet.lastRep || 0,
          duration: session.startTime && session.endTime 
            ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
            : null
        });
      }
    });
    return data;
  }, [history, selectedExerciseName, program]);

  const chartData = useMemo(() => {
    return [...exerciseHistory].reverse().map(d => ({
      date: d.date.split('.')[0] + '/' + d.date.split('.')[1],
      weight: d.weight
    }));
  }, [exerciseHistory]);

  return (
    <div className="p-4 pb-24 space-y-6 bg-[#0F0F0F] min-h-screen text-white font-sans">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] active:scale-95 transition-all">
            <ChevronLeft size={28} className="text-[#10B981]" />
          </button>
          <h1 className="text-2xl font-black uppercase italic tracking-tight text-[#10B981]">ANALİZ</h1>
        </div>

        {/* TÜMÜNÜ SİL BUTONU (Sadece veri varsa görünür) */}
        {history.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('DİKKAT: Tüm antrenman geçmişin kalıcı olarak silinecek. Emin misin?')) {
                onClearAllHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase hover:bg-red-500/20 transition-all"
          >
            <AlertTriangle size={12} />
            Tümünü Sil
          </button>
        )}
      </header>

      {exerciseNamesList.length > 0 ? (
        <>
          <select 
            value={selectedExerciseName} 
            onChange={(e) => setSelectedExerciseName(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-14 px-4 text-[#10B981] font-bold outline-none focus:border-[#10B981]"
          >
            {exerciseNamesList.map(name => <option key={name} value={name}>{name}</option>)}
          </select>

          {chartData.length > 0 && (
            <Card className="bg-[#1A1A1A] border-none rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-2 h-[220px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                    <XAxis dataKey="date" stroke="#666" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {exerciseHistory.map((item, i) => (
              <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group">
                {item.duration && (
                  <div className="absolute top-0 right-0 bg-[#10B981]/10 text-[#10B981] text-[9px] font-black px-2 py-0.5 rounded-bl-lg border-l border-b border-[#10B981]/20 uppercase flex items-center gap-1">
                    <Clock size={10} /> {item.duration} DK
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Tarih</span>
                  <span className="font-bold text-gray-200">{item.date}</span>
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => handleEdit(item.date, item.weight, item.reps)} className="text-gray-500 hover:text-[#10B981] flex items-center gap-1 text-[10px] font-bold uppercase transition-colors">
                      <Edit3 size={12} /> Düzenle
                    </button>
                    <button onClick={() => confirm('Kaydı silmek istediğine emin misin?') && onDeleteSession(item.timestamp)} className="text-gray-500 hover:text-red-500 flex items-center gap-1 text-[10px] font-bold uppercase transition-colors">
                      <Trash2 size={12} /> Sil
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#10B981] font-bold uppercase block mb-1">Son Set</span>
                  <div className="text-lg font-black text-white italic">
                    {item.weight}kg <span className="text-gray-600 mx-1">|</span> {item.reps}T
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-3xl p-16 text-center text-gray-600 font-medium italic">
          Analiz edilecek veri bulunamadı.
        </div>
      )}
    </div>
  );
}
