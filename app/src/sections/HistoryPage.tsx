import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Target } from 'lucide-react'; 
import type { WorkoutSession } from '@/types';

interface HistoryPageProps {
  history: WorkoutSession[];
  onBack: () => void; 
}

export function HistoryPage({ history, onBack }: HistoryPageProps) {
  // Hareket ID'lerini isme çeviren sözlük
  const formatName = (id: string) => {
    const names: Record<string, string> = {
      'd1e1': 'Bench Press', 'd1e2': 'Incline DB Press', 'd1e3': 'Cable Fly', 'd1e4': 'Triceps Pushdown', 'd1e5': 'Dips', 'd1e6': 'Lateral Raise',
      'd2e1': 'Squat', 'd2e2': 'Leg Press', 'd2e3': 'Leg Extension', 'd2e4': 'Lying Leg Curl', 'd2e5': 'Calf Raise', 'd2e6': 'Deadlift / RDL',
      'd3e1': 'Lat Pulldown', 'd3e2': 'Seated Row', 'd3e3': 'Face Pull', 'd3e4': 'Biceps Curl', 'd3e5': 'Hammer Curl', 'd3e6': 'Shrug'
    };
    return names[id] || id.toUpperCase();
  };

  // Geçmişteki tüm hareketleri bulur
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    history.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.exerciseId) names.add(ex.exerciseId);
      });
    });
    return Array.from(names);
  }, [history]);

  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseNames[0] || "");

  // Seçili hareketin verilerini filtreler (Sadece SON SET)
  const exerciseHistory = useMemo(() => {
    const data: any[] = [];
    [...history].reverse().forEach(session => {
      const foundExercise = session.exercises.find(ex => ex.exerciseId === selectedExercise);
      if (foundExercise && foundExercise.sets.length > 0) {
        // Dizideki en son seti alıyoruz
        const lastSet = foundExercise.sets[foundExercise.sets.length - 1];
        data.push({
          date: new Date(session.endTime).toLocaleDateString('tr-TR'),
          weight: lastSet.weight || 0,
          reps: lastSet.lastRep || 0
        });
      }
    });
    return data;
  }, [history, selectedExercise]);

  const chartData = useMemo(() => {
    return [...exerciseHistory].reverse().map(d => ({
      date: d.date.split('.')[0] + '/' + d.date.split('.')[1],
      weight: d.weight
    }));
  }, [exerciseHistory]);

  return (
    <div className="p-4 pb-24 space-y-6 bg-[#0F0F0F] min-h-screen text-white font-sans">
      {/* GERİ TUŞU VE BAŞLIK */}
      <header className="flex items-center gap-4 py-2">
        <button 
          onClick={() => onBack()}
          className="p-3 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] active:scale-95 transition-all"
        >
          <ChevronLeft size={28} className="text-[#10B981]" />
        </button>
        <h1 className="text-2xl font-black uppercase italic tracking-tight text-[#10B981]">ANALİZ</h1>
      </header>

      {/* SEÇİCİ */}
      <div className="relative">
        <select 
          value={selectedExercise} 
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-14 px-4 text-[#10B981] font-bold appearance-none outline-none focus:border-[#10B981]"
        >
          {exerciseNames.length > 0 ? (
            exerciseNames.map(name => (
              <option key={name} value={name}>{formatName(name)}</option>
            ))
          ) : (
            <option>Henüz Kayıt Yok</option>
          )}
        </select>
      </div>

      {/* GRAFİK */}
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

      {/* SON SET LİSTESİ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 ml-1">
          <Target size={16} className="text-[#10B981]" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Performans Özeti</h3>
        </div>

        {exerciseHistory.map((item, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Tarih</span>
              <span className="font-bold text-gray-200">{item.date}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#10B981] font-bold uppercase block mb-1">Son Set</span>
              <div className="text-lg font-black text-white">
                {item.weight}kg <span className="text-gray-600 mx-1">|</span> {item.reps} Tekrar
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
