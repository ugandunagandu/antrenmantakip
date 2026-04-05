import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react'; // Geri tuşu için
import { useNavigate } from 'react-router-dom';
import type { WorkoutSession } from '@/types';

interface HistoryPageProps {
  history: WorkoutSession[];
}

export function HistoryPage({ history }: HistoryPageProps) {
  const navigate = useNavigate();

  // ID'leri gerçek isimlere çeviren basit bir sözlük (Kendi isimlerini buraya ekleyebilirsin)
  const formatName = (id: string) => {
    const names: Record<string, string> = {
      'd1e1': 'Bench Press',
      'd1e2': 'Incline DB Press',
      'd1e3': 'Flyes',
      'd2e1': 'Squat',
      'd2e2': 'Leg Press',
      // Buraya d1e1, d1e2 gibi kodların karşılığını ekleyebilirsin
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
        {/* GERİ TUŞU GERİ GELDİ */}
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-[#1A1A1A] rounded-full border border-[#2A2A2A]"
        >
          <ChevronLeft size={24} className="text-[#10B981]" />
        </button>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Analiz</h1>
      </header>

      {exerciseNames.length > 0 && (
        <div className="relative">
          <select 
            value={selectedExercise} 
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-12 px-4 text-[#10B981] font-bold appearance-none"
          >
            {exerciseNames.map(name => (
              <option key={name} value={name}>{formatName(name)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Grafiğin olduğu kısım aynı kalabilir... */}
      {/* (Kalan grafik kodlarını buraya ekleyebilirsin veya mevcut olanı koruyabilirsin) */}
    </div>
  );
}
