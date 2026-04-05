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
  // 1. TÜM HAREKET KODLARININ KARŞILIĞI
  const formatName = (id: string) => {
    const names: Record<string, string> = {
      // 1. GÜN
      'd1e1': 'Bench Press',
      'd1e2': 'Incline DB Press',
      'd1e3': 'Cable Fly',
      'd1e4': 'Triceps Pushdown',
      'd1e5': 'Dips',
      'd1e6': 'Lateral Raise',
      // 2. GÜN
      'd2e1': 'Squat',
      'd2e2': 'Leg Press',
      'd2e3': 'Leg Extension',
      'd2e4': 'Lying Leg Curl',
      'd2e5': 'Calf Raise',
      'd2e6': 'Deadlift / RDL',
      // 3. GÜN
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
      {/* ÜST BAR VE GERİ TUŞU */}
      <header className="flex items-center gap-4 py-2">
        <button 
          type="button"
          onClick={() => onBack()} // Basit ve doğrudan tetikleme
          className="p-3 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] active:scale-95 active:bg-[#252525] transition-all cursor-pointer group"
          aria-label="Geri Dön"
        >
          <ChevronLeft size={28} className="text-[#10B981] group-active:text-white" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black uppercase italic tracking-tight">ANALİZ</h1>
          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Gelişim Takibi</span>
        </div>
      </header>

      {/* HAREKET SEÇİCİ */}
      <div className="space-y-2">
        <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Egzersiz Seç</label>
        <div className="relative">
          <select 
            value={selectedExercise} 
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-14 px-4 text-[#10B981] font-bold appearance-none outline-none focus:border-[#10B981] shadow-xl"
          >
            {exerciseNames.length > 0 ? (
              exerciseNames.map(name => (
                <option key={name} value={name}>{formatName(name)}</option>
              ))
            ) : (
              <option>Henüz Veri Yok</option>
            )}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#10B981]">
            ▼
          </div>
        </div>
      </div>

      {/* GRAFİK KARTI */}
      {chartData.length > 0 ? (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="pb-0 pt-4 px-6">
            <CardTitle className="text-[10px] text-gray-500 uppercase tracking-widest">Ağırlık Grafiği (KG)</CardTitle>
          </CardHeader>
          <CardContent className="p-2 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kg`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#10B981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#0F0F0F' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-3xl p-12 text-center">
           <p className="text-gray-500 text-sm font-medium">Grafik oluşturmak için en az 1 antrenman bitirmelisin.</p>
        </div>
      )}

      {/* ALT LİSTE (Opsiyonel: Hızlı Göz Atma) */}
      <div className="space-y-4">
