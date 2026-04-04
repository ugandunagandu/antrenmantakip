import { useState } from 'react';
import { ChevronLeft, Ruler, Save, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Measurement } from '@/types';

interface MeasurementsPageProps {
  measurements: Measurement[];
  onSave: (measurement: Measurement) => void;
  onBack: () => void;
}

export function MeasurementsPage({ measurements, onSave, onBack }: MeasurementsPageProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    waist: '',
    chest: '',
    arm: '',
    leg: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMeasurement: Measurement = {
      id: Date.now().toString(),
      date: formData.date,
      weight: Number(formData.weight) || 0,
      waist: Number(formData.waist) || 0,
      chest: Number(formData.chest) || 0,
      arm: Number(formData.arm) || 0,
      leg: Number(formData.leg) || 0,
    };
    
    onSave(newMeasurement);
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      waist: '',
      chest: '',
      arm: '',
      leg: '',
    });
  };

  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestMeasurements = sortedMeasurements.slice(0, 5);

  const getComparison = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: 'text-red-500', value: `+${diff.toFixed(1)}` };
    if (diff < 0) return { icon: TrendingDown, color: 'text-[#10B981]', value: diff.toFixed(1) };
    return { icon: Minus, color: 'text-gray-500', value: '0' };
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
          Geri
        </Button>
        
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold text-white">Ölçüler</h1>
        </div>
        
        <div className="w-16" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 overflow-auto">
        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] mb-4">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <Ruler className="w-4 h-4 text-[#10B981]" />
              </span>
              Yeni Ölçü
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-xs mb-1 block">Tarih</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-[#0F0F0F] border-[#2A2A2A] text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Kilo (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="85.5"
                    className="bg-[#0F0F0F] border-[#2A2A2A] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Bel (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    placeholder="85"
                    className="bg-[#0F0F0F] border-[#2A2A2A] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Göğüs (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.chest}
                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                    placeholder="100"
                    className="bg-[#0F0F0F] border-[#2A2A2A] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Kol (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.arm}
                    onChange={(e) => setFormData({ ...formData, arm: e.target.value })}
                    placeholder="35"
                    className="bg-[#0F0F0F] border-[#2A2A2A] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Bacak (cm)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.leg}
                    onChange={(e) => setFormData({ ...formData, leg: e.target.value })}
                    placeholder="55"
                    className="bg-[#0F0F0F] border-[#2A2A2A] text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl"
          >
            <Save className="w-5 h-5 mr-2" />
            Kaydet
          </Button>
        </form>

        {/* Recent Measurements */}
        {latestMeasurements.length > 0 && (
          <div>
            <h2 className="text-white font-semibold mb-4">Son Kayıtlar</h2>
            
            <div className="space-y-3">
              {latestMeasurements.map((measurement, index) => {
                const prevMeasurement = latestMeasurements[index + 1];
                
                return (
                  <div
                    key={measurement.id}
                    className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#10B981] text-sm font-medium">
                        {new Date(measurement.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div>
                        <p className="text-gray-500 text-xs">Kilo</p>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-white font-semibold">{measurement.weight}</p>
                          {prevMeasurement && (
                            (() => {
                              const comp = getComparison(measurement.weight, prevMeasurement.weight);
                              if (!comp) return null;
                              const Icon = comp.icon;
                              return <Icon className={`w-3 h-3 ${comp.color}`} />;
                            })()
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Bel</p>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-white font-semibold">{measurement.waist}</p>
                          {prevMeasurement && (
                            (() => {
                              const comp = getComparison(measurement.waist, prevMeasurement.waist);
                              if (!comp) return null;
                              const Icon = comp.icon;
                              return <Icon className={`w-3 h-3 ${comp.color}`} />;
                            })()
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Göğüs</p>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-white font-semibold">{measurement.chest}</p>
                          {prevMeasurement && (
                            (() => {
                              const comp = getComparison(measurement.chest, prevMeasurement.chest);
                              if (!comp) return null;
                              const Icon = comp.icon;
                              return <Icon className={`w-3 h-3 ${comp.color}`} />;
                            })()
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Kol</p>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-white font-semibold">{measurement.arm}</p>
                          {prevMeasurement && (
                            (() => {
                              const comp = getComparison(measurement.arm, prevMeasurement.arm);
                              if (!comp) return null;
                              const Icon = comp.icon;
                              return <Icon className={`w-3 h-3 ${comp.color}`} />;
                            })()
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Bacak</p>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-white font-semibold">{measurement.leg}</p>
                          {prevMeasurement && (
                            (() => {
                              const comp = getComparison(measurement.leg, prevMeasurement.leg);
                              if (!comp) return null;
                              const Icon = comp.icon;
                              return <Icon className={`w-3 h-3 ${comp.color}`} />;
                            })()
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {latestMeasurements.length === 0 && (
          <div className="text-center py-8">
            <Ruler className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Henüz ölçü kaydı yok</p>
            <p className="text-gray-600 text-sm">İlk ölçünüzü yukarıdan ekleyin</p>
          </div>
        )}
      </main>
    </div>
  );
}
