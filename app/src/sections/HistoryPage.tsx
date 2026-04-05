import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react'; 
import type { WorkoutSession } from '@/types';

interface HistoryPageProps {
  history: WorkoutSession[];
  onBack: () => void; // Geri dönme fonksiyonu
}

export function HistoryPage({ history, onBack }: HistoryPageProps) {
  // 1. İsim Sözlüğü: ID'leri gerçek isimlere çevirir (Eksikleri buraya ekleyebilirsin)
  const formatName = (id: string) => {
    const names: Record<string, string> = {
      'd1e1': 'Bench Press',
      'd1e2': 'Incline DB Press',
      'd1e3': 'Cable Fly',
      'd1e4': 'Triceps Pushdown',
      'd2e1': 'Squat',
      'd2e2': 'Leg Press',
      'd2e3': 'Leg Extension',
      'd2e4': 'Lying Leg Curl',
      'd3e1': 'Lat Pulldown',
      'd3e2': 'Seated Row',
      'd3e3': 'Face Pull',
      'd3e4': 'Biceps Curl'
      // Yeni hareket eklediğinde sadece buraya ID ve İsim ekle
    };
    return names[id] || id.toUpperCase();
  };

  // 2. TÜM HAREKETLERİ OTOMATİK BUL: Geçmişteki tüm benzersiz ID'leri listeler
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    history.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.exerciseId) names.add(ex.exerciseId);
      });
    });
    return Array.from(names);
  }, [history]);

  // İlk hareketi varsayılan seç
  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseNames[0] || "");

  // 3. Seçili harekete göre grafiği filtrele
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
      <header className="flex items-center gap-4 sticky top-0 bg-[#0F0F0F]/80 backdrop-blur-md py-2 z-10">
        <button 
          onClick={() => {
            console.log("Geri tuşuna basıldı"); // Tarayıcı konsolunda kontrol için
            onBack(); 
          }}
          className="p-2 bg-[#1A1A1A] rounded-full border border-[#2A2A2A] active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} className="text-[#10B981]" />
        </button>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Gelişim Analizi</h1>
      </header>

      {/* HAREKET SEÇİCİ */}
      {exerciseNames.length > 0 ? (
        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Hareket Değiştir</label>
          <div className="relative">
            <select 
              value={selectedExercise} 
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-14 px-4 text-[#10B981] font-bold appearance-none outline-none focus:border-[#10B981] text-lg"
            >
              {exerciseNames.map(name => (
                <option key={name} value={name}>{formatName(name)}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#10B981]">
              ▼
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-10">Henüz kayıtlı hareket bulunamadı.</p>
      )}

      {/* GRAFİK */}
      {chartData.length > 0 && (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase">Ağırlık İlerlemesi (KG)</CardTitle>
          </CardHeader>
          <CardContent className="p-2 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px' }}
                  itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#0F0F0F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* GEÇMİŞ LİSTESİ */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase ml-2">Antrenman Kayıtları</h3>
        {history.slice().reverse().map((session, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-[#10B981]">{new Date(session.endTime).toLocaleDateString('tr-TR')}</span>
              <span className="text-[10px] text-gray-500">{Math.floor((session.endTime - session.startTime) / 60000)} dk</span>
            </div>
            <div className="space-y-2">
              {session.exercises.map((ex, idx) => (
                <div key={idx} className="flex justify-between items-center border-t border-[#2A2A2A] pt-2 mt-2 first:border-0 first:pt-0 first:mt-0">
                  <span className="text-xs font-bold uppercase">{formatName(ex.exerciseId)}</span>
                  <div className="flex gap-1">
                    {ex.sets.map((set, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-black px-1.5 py-0.5 rounded text-gray-400">
                        {set.weight}x{set.lastRep || '?'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
