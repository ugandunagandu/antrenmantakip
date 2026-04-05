import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react'; 
import type { WorkoutSession } from '@/types';

interface HistoryPageProps {
  history: WorkoutSession[];
  onBack: () => void; 
}

export function HistoryPage({ history, onBack }: HistoryPageProps) {
  // 1. TÜM KODLARIN KARŞILIĞI (Eksik olanları buraya ekledim)
  const formatName = (id: string) => {
    const names: Record<string, string> = {
      // 1. GÜN (GÖĞÜS-KOL VEYA A)
      'd1e1': 'Bench Press',
      'd1e2': 'Incline DB Press',
      'd1e3': 'Cable Fly',
      'd1e4': 'Triceps Pushdown',
      'd1e5': 'Dips',
      'd1e6': 'Lateral Raise',
      // 2. GÜN (BACAK VEYA B)
      'd2e1': 'Squat',
      'd2e2': 'Leg Press',
      'd2e3': 'Leg Extension',
      'd2e4': 'Lying Leg Curl',
      'd2e5': 'Calf Raise',
      'd2e6': 'Deadlift / RDL', // Senin sorduğun d2e6 burası
      // 3. GÜN (SIRT-BİCEPS VEYA C)
      'd3e1': 'Lat Pulldown',
      'd3e2': 'Seated Row',
      'd3e3': 'Face Pull',
      'd3e4': 'Biceps Curl',
      'd3e5': 'Hammer Curl',
      'd3e6': 'Shrug'
    };
    return names[id] || id.toUpperCase();
  };

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

  const chartData = useMemo(() => {
    const data: any[] = [];
    history.forEach(session => {
      session.exercises.forEach(exercise => {
        if (exercise.exerciseId === selectedExercise) {
          const maxWeight = Math.max(...exercise.sets.map(s => s.weight || 0));
          if (maxWeight > 0) {
            data.push({
              date: new Date(session.endTime).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
              weight: maxWeight
            });
          }
        }
      });
    });
    return data;
  }, [history, selectedExercise]);

  return (
    <div className="p-4 pb-24 space-y-6 bg-[#0F0F0F] min-h-screen text-white">
      {/* GERİ TUŞU - TIKLANABİLİR ALAN GENİŞLETİLDİ */}
      <header className="flex items-center gap-4 py-2">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onBack(); // App.tsx'e geri git komutu gönderir
          }}
          className="p-3 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] active:bg-[#10B981] transition-all"
        >
          <ChevronLeft size={28} className="text-[#10B981]" />
        </button>
        <h1 className="text-2xl font-black uppercase italic italic tracking-tight">ANALİZ</h1>
      </header>

      {/* SEÇİCİ VE GRAFİK... (Aynı kalabilir) */}
      <div className="relative">
         <select 
            value={selectedExercise} 
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-14 px-4 text-[#10B981] font-bold appearance-none outline-none"
          >
            {exerciseNames.map(name => (
              <option key={name} value={name}>{formatName(name)}</option>
            ))}
          </select>
      </div>

      {chartData.length > 0 ? (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-2 h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kg`} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={4} dot={{ r: 6, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10 text-gray-500">Veri henüz yok.</div>
      )}
    </div>
  );
}
