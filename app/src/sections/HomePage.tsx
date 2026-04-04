import { Dumbbell, History, Ruler, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkoutDay, View } from '@/types';

interface HomePageProps {
  program: WorkoutDay[];
  onSelectDay: (dayId: string) => void;
  onNavigate: (view: View) => void;
}

export function HomePage({ program, onSelectDay, onNavigate }: HomePageProps) {
  const getTotalSets = (day: WorkoutDay) => {
    return day.exercises.reduce((total, ex) => total + ex.sets, 0);
  };

  const getTotalExercises = (day: WorkoutDay) => {
    return day.exercises.length;
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-6 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Dumbbell className="w-8 h-8 text-[#10B981]" />
          <h1 className="text-3xl font-bold text-white tracking-wider">
            ANTRENMANIM
          </h1>
        </div>
        <p className="text-gray-400 text-sm">Fitness Programın</p>
      </header>

      {/* Main Content - Day Buttons */}
      <main className="flex-1 px-6 py-4">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {program.map((day, index) => (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className="group relative bg-[#1A1A1A] hover:bg-[#252525] active:bg-[#10B981] 
                         rounded-2xl p-6 transition-all duration-300 
                         border border-[#2A2A2A] hover:border-[#10B981]/50
                         flex flex-col items-center justify-center gap-3
                         min-h-[140px]"
            >
              <span className="absolute top-3 right-3 text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                GÜN {index + 1}
              </span>
              
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
                <span className="text-2xl font-bold text-[#10B981]">{index + 1}</span>
              </div>
              
              <div className="text-center">
                <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-white transition-colors">
                  {day.name}
                </h3>
                <p className="text-gray-500 text-xs group-hover:text-gray-300 transition-colors">
                  {getTotalExercises(day)} hareket • {getTotalSets(day)} set
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="px-6 py-6 border-t border-[#2A2A2A]">
        <div className="flex justify-center gap-4 max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={() => onNavigate('history')}
            className="flex-1 bg-transparent border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#1A1A1A] hover:border-[#10B981]/50"
          >
            <History className="w-4 h-4 mr-2" />
            Geçmiş
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('measurements')}
            className="flex-1 bg-transparent border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#1A1A1A] hover:border-[#10B981]/50"
          >
            <Ruler className="w-4 h-4 mr-2" />
            Ölçüler
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('edit')}
            className="flex-1 bg-transparent border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#1A1A1A] hover:border-[#10B981]/50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
        </div>
      </footer>
    </div>
  );
}
