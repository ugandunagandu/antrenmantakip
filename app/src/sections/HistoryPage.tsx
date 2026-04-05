import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WorkoutSession } from '@/types';

interface HistoryPageProps {
  history: WorkoutSession[];
}

export function HistoryPage({ history }: HistoryPageProps) {
  // 1. Mevcut tüm benzersiz egzersiz isimlerini bul (Dropdown için)
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    history.forEach(session => {
      session.exercises.forEach(ex => {
        // Not: Programındaki isim neyse onu alır (Bench Press vb.)
        if (ex.exerciseId) names.add(ex.exerciseId);
      });
    });
    return Array.from(names);
  }, [history]);

  // Varsayılan olarak listedeki ilk hareketi seç
  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseNames[0] || "");

  // 2. Seçili harekete göre grafik verisini filtrele
  const chartData = useMemo(() => {
    const data: any[] = [];
    history.forEach(session => {
      session.exercises.forEach(exercise => {
        if (exercise.exerciseId === selectedExercise) {
          // O hareketin en ağır (PR) setini veya ortalamasını alalım
          const maxWeight = Math.max(...exercise.sets.map(s => s.weight || 0));
          if (maxWeight > 0) {
            data.push({
              date: new Date(session.endTime).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
              weight: maxWeight,
              fullDate: new Date(session.endTime).toLocaleDateString('tr-TR')
            });
          }
        }
      });
    });
    return data;
  }, [history, selectedExercise]);

  return (
    <div className="p-4 pb-24 space-y-6 bg-[#0F0F0F] min-h-screen text-white">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Gelişim Analizi</h1>
        
        {/* HAREKET SEÇİCİ DROPDOWN */}
        {exerciseNames.length > 0 && (
          <div className="mt-2">
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">İzlenecek Hareket</label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-full bg-[#1A1A1A] border-[#2A2A2A] rounded-xl h-12 text-[#10B981] font-bold">
                <SelectValue placeholder="Hareket seçin" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                {exerciseNames.map(name => (
                  <SelectItem key={name} value={name} className="focus:bg-[#10B981] focus:text-black">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </header>

      {/* GRAFİK KARTI */}
      {chartData.length > 0 ? (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase">
              {selectedExercise} Ağırlık Artışı (KG)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px' }}
                  labelStyle={{ color: '#888', fontSize: '10px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#0F0F0F' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-3xl p-8 text-center text-gray-500 text-sm">
          Bu hareket için henüz yeterli veri yok.
        </div>
      )}

      {/* DETAYLI GEÇMİŞ LİSTESİ */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase ml-2 flex justify-between items-center">
          Antrenman Günlüğü
          <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded-full">SON KAYITLAR</span>
        </h3>
        
        {history.slice().reverse().map((session, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="bg-[#252525] px-4 py-2 flex justify-between items-center border-b border-[#2A2A2A]">
              <span className="font-bold text-sm">{new Date(session.endTime).toLocaleDateString('tr-TR')}</span>
              <span className="text-[10px] text-gray-400 font-mono">
                {Math.floor((session.endTime - session.startTime) / 60000)} DK SÜRDÜ
              </span>
            </div>
            <div className="p-4 space-y-3">
              {session.exercises.map((ex, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-black text-[#10B981] uppercase">{ex.exerciseId}</span>
                    <div className="flex gap-1">
                      {ex.sets.map((set, sIdx) => (
                        <span key={sIdx} className="text-[10px] bg-[#0F0F0F] border border-[#2A2A2A] px-1.5 py-0.5 rounded">
                          {set.weight}x{set.lastRep || '?' }
                        </span>
                      ))}
                    </div>
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
