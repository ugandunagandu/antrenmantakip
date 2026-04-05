import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkoutSession } from '@/types';

interface HistoryPageProps {
  history: WorkoutSession[];
}

export function HistoryPage({ history }: HistoryPageProps) {
  const chartData = useMemo(() => {
    const data: any[] = [];
    
    // Geçmişteki tüm antrenmanları dön ve ağırlıkları topla
    history.forEach(session => {
      session.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.completed && set.weight) {
            data.push({
              date: new Date(session.endTime).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
              weight: set.weight,
              name: exercise.exerciseId
            });
          }
        });
      });
    });

    // Sadece son 10 veri noktasını al (grafik sıkışmasın)
    return data.slice(-10);
  }, [history]);

  return (
    <div className="p-4 pb-24 space-y-6 bg-[#0F0F0F] min-h-screen text-white">
      <h1 className="text-3xl font-black uppercase italic tracking-tighter">Gelişim Analizi</h1>

      {chartData.length > 0 ? (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-[#2A2A2A]/50">
            <CardTitle className="text-sm font-bold text-[#10B981] uppercase tracking-widest">
              Ağırlık Grafiği (KG)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kg`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px' }}
                  itemStyle={{ color: '#10B981' }}
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
      ) : (
        <div className="bg-[#1A1A1A] border-2 border-dashed border-[#2A2A2A] rounded-3xl p-12 text-center">
          <p className="text-gray-500 font-medium">Grafik için henüz veri yok.</p>
          <p className="text-xs text-gray-600 mt-2">Bir antrenman bitirdiğinde burada görünecek.</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase ml-2">Son Aktivite</h3>
        {history.slice().reverse().map((session, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex justify-between items-center">
            <p className="font-bold">{new Date(session.endTime).toLocaleDateString('tr-TR')}</p>
            <div className="text-[#10B981] font-black italic">TAMAMLANDI</div>
          </div>
        ))}
      </div>
    </div>
  );
}
