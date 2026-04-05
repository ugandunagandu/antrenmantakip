import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react'; 
import type { WorkoutSession } from '@/types';

interface HistoryPageProps {
  history: WorkoutSession[];
  // react-router-dom yerine ana sayfaya dönmek için props kullanacağız
  onBack: () => void; 
}

export function HistoryPage({ history, onBack }: HistoryPageProps) {
  // ID'leri gerçek isimlere çeviren sözlük
  const formatName = (id: string) => {
    const names: Record<string, string> = {
      'd1e1': 'Bench Press',
      'd1e2': 'Incline DB Press',
      'd1e3': 'Flyes',
      'd2e1': 'Squat',
      'd2e2': 'Leg Press',
      'd2e3': 'Leg Extension'
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
      <header className="flex items-center gap-4">
        <button 
          onClick={onBack} // Tarayıcıyı kırmayan geri tuşu
          className="p-2 bg-[#1A1A1A] rounded-full border border-[#2A2A2A] hover:bg-[#252525] transition-colors"
        >
          <ChevronLeft size={24} className="text-[#10B981]" />
        </button>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Gelişim Analizi</h1>
      </header>

      {/* Geri kalan grafik ve liste kodları aynı... */}
      <div className="relative">
         <select 
            value={selectedExercise} 
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-12 px-4 text-[#10B981] font-bold appearance-none outline-none focus:border-[#10B981]"
          >
            {exerciseNames.map(name => (
              <option key={name} value={name}>{formatName(name)}</option>
            ))}
          </select>
      </div>

      {chartData.length > 0 ? (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-2 h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kg`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={4} dot={{ r: 5, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-3xl p-8 text-center text-gray-500 text-sm">
          Bu hareket için veri bulunamadı.
        </div>
      )}
    </div>
  );
}
