import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Save, Dumbbell, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WorkoutDay, Exercise } from '@/types';

interface EditPageProps {
  program: WorkoutDay[];
  onSave: (program: WorkoutDay[]) => void;
  onBack: () => void;
}

export function EditPage({ program, onSave, onBack }: EditPageProps) {
  const [editedProgram, setEditedProgram] = useState<WorkoutDay[]>(program);
  const [activeTab, setActiveTab] = useState(program[0]?.id || 'day1');

  // Antrenman Günü İsmini Güncelleme (GÖĞÜS & SIRT gibi)
  const updateDayName = (dayId: string, newName: string) => {
    setEditedProgram(prev =>
      prev.map(day => (day.id === dayId ? { ...day, name: newName } : day))
    );
  };

  const updateExercise = (dayId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setEditedProgram(prev =>
      prev.map(day =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, ...updates } : ex
              ),
            }
          : day
      )
    );
  };

  const addExercise = (dayId: string) => {
    const newExercise: Exercise = {
      id: `new_${Date.now()}`,
      name: 'Yeni Hareket',
      sets: 3,
      reps: 10,
      startingWeight: 0,
    };
    setEditedProgram(prev =>
      prev.map(day =>
        day.id === dayId
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    );
  };

  const removeExercise = (dayId: string, exerciseId: string) => {
    setEditedProgram(prev =>
      prev.map(day =>
        day.id === dayId
          ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
          : day
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col text-white">
      {/* Header */}
      <header className="px-4 py-4 border-b border-[#2A2A2A] flex items-center justify-between sticky top-0 bg-[#0F0F0F]/80 backdrop-blur-md z-20">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-sm font-black uppercase tracking-widest">Programı Düzenle</h1>
        </div>
        
        <Button
          onClick={() => onSave(editedProgram)}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-full px-6"
          size="sm"
        >
          <Save className="w-4 h-4 mr-2" />
          KAYDET
        </Button>
      </header>

      <main className="flex-1 px-4 py-6 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-[#1A1A1A] mb-8 p-1 rounded-xl h-12">
            {editedProgram.map((day, index) => (
              <TabsTrigger
                key={day.id}
                value={day.id}
                className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white text-[10px] font-black uppercase rounded-lg transition-all"
              >
                GÜN {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {editedProgram.map((day) => (
            <TabsContent key={day.id} value={day.id} className="mt-0 animate-in fade-in-50 duration-300">
              {/* Antrenman Günü İsmi Düzenleme Bölümü */}
              <div className="mb-8 p-4 bg-[#1A1A1A] rounded-2xl border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2 text-orange-500">
                  <Edit3 className="w-4 h-4" />
                  <label className="text-[10px] font-black uppercase tracking-widest">Antrenman Başlığı</label>
                </div>
                <Input
                  value={day.name}
                  onChange={(e) => updateDayName(day.id, e.target.value)}
                  placeholder="Örn: GÖĞÜS & SIRT"
                  className="bg-transparent border-none text-2xl font-black p-0 h-auto focus-visible:ring-0 placeholder:text-zinc-700"
                />
                <p className="text-zinc-500 text-[10px] mt-1 italic">Ana ekranda görünecek isim</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase text-zinc-500 tracking-tighter">Hareket Listesi ({day.exercises.length})</h3>
                </div>

                {day.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A] relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] flex items-center justify-center font-black">
                          {index + 1}
                        </span>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Hareket Ayarları</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(day.id, exercise.id)}
                        className="w-8 h-8 text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Input
                          value={exercise.name}
                          onChange={(e) => updateExercise(day.id, exercise.id, { name: e.target.value })}
                          className="bg-[#0F0F0F] border-[#2A2A2A] text-lg font-bold rounded-xl h-12 focus:border-[#10B981]"
                          placeholder="Hareket Adı"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Set</label>
                          <Input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(day.id, exercise.id, { sets: Number(e.target.value) })}
                            className="bg-[#0F0F0F] border-[#2A2A2A] text-center font-bold rounded-xl h-10"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Tekrar</label>
                          <Input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(day.id, exercise.id, { reps: Number(e.target.value) })}
                            className="bg-[#0F0F0F] border-[#2A2A2A] text-center font-bold rounded-xl h-10"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Başlangıç KG</label>
                          <Input
                            type="number"
                            value={exercise.startingWeight || ''}
                            onChange={(e) => updateExercise(day.id, exercise.id, { startingWeight: Number(e.target.value) })}
                            className="bg-[#0F0F0F] border-[#2A2A2A] text-center font-bold rounded-xl h-10 text-[#10B981]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => addExercise(day.id)}
                  className="w-full h-16 bg-transparent border-2 border-dashed border-[#2A2A2A] rounded-2xl text-zinc-500 hover:text-[#10B981] hover:border-[#10B981]/50 transition-all flex flex-col gap-1"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Yeni Hareket Ekle</span>
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}