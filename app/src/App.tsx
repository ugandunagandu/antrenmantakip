import { useState, useEffect } from 'react';
import { HomePage } from '@/sections/HomePage';
import { WorkoutPage } from '@/sections/WorkoutPage';
import { EditPage } from '@/sections/EditPage';
import { MeasurementsPage } from '@/sections/MeasurementsPage';
import { HistoryPage } from '@/sections/HistoryPage';
import type { WorkoutDay, View, Measurement, WorkoutSession } from '@/types';
import { defaultProgram, STORAGE_KEYS } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  
  // LocalStorage states
  const [program, setProgram] = useLocalStorage<WorkoutDay[]>(STORAGE_KEYS.PROGRAM, defaultProgram);
  const [measurements, setMeasurements] = useLocalStorage<Measurement[]>(STORAGE_KEYS.MEASUREMENTS, []);
  const [history, setHistory] = useLocalStorage<WorkoutSession[]>(STORAGE_KEYS.HISTORY, []);

  // Initialize program if empty
  useEffect(() => {
    if (program.length === 0) {
      setProgram(defaultProgram);
    }
  }, [program.length, setProgram]);

  // VERİ YEDEKLEME VE PAYLAŞMA FONKSİYONLARI
  const exportData = () => {
    const allData = {
      program,
      measurements,
      history,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness_yedek_${new Date().toLocaleDateString()}.json`;
    a.click();
    toast.success('Veriler dışa aktarıldı!', { description: 'Dosyayı arkadaşınızla paylaşabilirsiniz.' });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.program) setProgram(json.program);
        if (json.measurements) setMeasurements(json.measurements);
        if (json.history) setHistory(json.history);
        toast.success('Veriler içe aktarıldı!', { description: 'Tüm bilgiler güncellendi.' });
      } catch (err) {
        toast.error('Hata!', { description: 'Geçersiz dosya formatı.' });
      }
    };
    reader.readAsText(file);
  };

  const handleSelectDay = (dayId: string) => {
    setSelectedDayId(dayId);
    setCurrentView('workout');
  };

 const handleFinishWorkout = (session: WorkoutSession) => {
  setHistory(prev => [...prev, session]); // Geçmişe yeni seansı ekliyor
  toast.success('Antrenman tamamlandı!', {
    description: 'Harika iş çıkardın! 💪',
  });
  setCurrentView('home');
  setSelectedDayId(null);
};

  const handleSaveProgram = (newProgram: WorkoutDay[]) => {
    setProgram(newProgram);
    toast.success('Program kaydedildi!', {
      description: 'Değişiklikleriniz başarıyla kaydedildi.',
    });
  };

  const handleSaveMeasurement = (measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
    toast.success('Ölçü kaydedildi!', {
      description: 'Vücut ölçünüz başarıyla kaydedildi.',
    });
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="relative pb-20">
            <HomePage
              program={program}
              onSelectDay={handleSelectDay}
              onNavigate={handleNavigate}
            />
            {/* Yedekleme Butonları Alt Kısma Eklendi */}
            <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-4 px-4 pointer-events-none">
               <button 
                onClick={exportData}
                className="pointer-events-auto bg-zinc-800 text-xs text-zinc-400 px-3 py-2 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors"
               >
                 Yedekle (Dışa Aktar)
               </button>
               <label className="pointer-events-auto bg-zinc-800 text-xs text-zinc-400 px-3 py-2 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer">
                 Yükle (İçe Aktar)
                 <input type="file" accept=".json" onChange={importData} className="hidden" />
               </label>
            </div>
          </div>
        );
      
      case 'workout':
        if (!selectedDayId) return null;
        const selectedDay = program.find(d => d.id === selectedDayId);
        if (!selectedDay) return null;
        return (
          <WorkoutPage
            day={selectedDay}
            onFinish={handleFinishWorkout}
            onBack={() => {
              setCurrentView('home');
              setSelectedDayId(null);
            }}
          />
        );
      
      case 'edit':
        return (
          <EditPage
            program={program}
            onSave={handleSaveProgram}
            onBack={() => setCurrentView('home')}
          />
        );
      
      case 'measurements':
        return (
          <MeasurementsPage
            measurements={measurements}
            onSave={handleSaveMeasurement}
            onBack={() => setCurrentView('home')}
          />
        );
      
      case 'history':
        return (
          <HistoryPage
            history={history}
            program={program}
            onBack={() => setCurrentView('home')}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {renderView()}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #2A2A2A',
          },
        }}
      />
    </>
  );
}

export default App;
