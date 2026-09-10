import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Compass, Loader2 } from 'lucide-react';
import { reverseGeocode } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export default function AddFieldWizard({ isOpen, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [geolocating, setGeolocating] = useState(false);
  const [locMsg, setLocMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    area_hectares: 2.0,
    location_name: '',
    latitude: 17.1856,
    longitude: 81.9685,
    soil_type: 'Loamy',
    irrigation_method: 'Drip',
    flow_rate_lpm: 120,
    available_water_liters: 50000,
    field_capacity_pct: 32.0,
    wilting_point_pct: 14.0,
    root_depth_cm: 35.0,
    crop_name: 'Wheat',
    growth_stage: 'Mid-Season',
    manual_soil_moisture_pct: 25.0
  });

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const rev = await reverseGeocode(lat, lon);
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            location_name: rev.location_name || `${rev.district}, ${rev.state}`
          }));
          setLocMsg('GPS acquired successfully!');
        } catch {
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lon, location_name: `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E` }));
        } finally {
          setGeolocating(false);
        }
      },
      () => setGeolocating(false),
      { timeout: 8000 }
    );
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="drawer-right">
        {/* Drawer Header */}
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold">Add New Field</h3>
            <p className="text-xs text-cyan-400 font-medium">AI-powered field configuration</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="bg-slate-900 p-3 border-b border-slate-200 flex items-center justify-between text-xs font-extrabold px-6">
          <span className={step >= 1 ? 'text-cyan-400' : 'text-slate-400'}>01 Basics</span>
          <span className="text-slate-300">───</span>
          <span className={step >= 2 ? 'text-cyan-400' : 'text-slate-400'}>02 Soil & Water</span>
          <span className="text-slate-300">───</span>
          <span className={step >= 3 ? 'text-cyan-400' : 'text-slate-400'}>03 Crop</span>
          <span className="text-slate-300">───</span>
          <span className={step >= 4 ? 'text-cyan-400' : 'text-slate-400'}>04 AI Calibration</span>
        </div>

        {/* Step Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">Step 01: Field Basics</h4>
              <div className="form-group">
                <label className="form-label">Field Name</label>
                <input 
                  type="text" className="form-control" 
                  placeholder="e.g. North Wheat Field"
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Field Area (Acres)</label>
                <input 
                  type="number" step="0.1" className="form-control" 
                  value={formData.area_hectares} 
                  onChange={(e) => setFormData({ ...formData, area_hectares: parseFloat(e.target.value) })} 
                />
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label">Location / Village</label>
                  <button 
                    type="button" 
                    onClick={handleGetCurrentLocation} 
                    disabled={geolocating}
                    className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30"
                  >
                    {geolocating ? <Loader2 size={11} className="animate-spin" /> : <Compass size={11} />}
                    <span>📍 Use My Location</span>
                  </button>
                </div>
                <input 
                  type="text" className="form-control" 
                  placeholder="e.g. West Godavari, AP"
                  value={formData.location_name} 
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })} 
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">Step 02: Soil & Water Specifications</h4>
              <div className="form-group">
                <label className="form-label">Soil Type</label>
                <select 
                  className="form-control font-bold" 
                  value={formData.soil_type} 
                  onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                >
                  <option value="Loamy">Loamy Soil (Balanced & Fertile)</option>
                  <option value="Sandy">Sandy Soil (Light & Fast Draining)</option>
                  <option value="Clay">Clay Soil (Heavy Water Retaining)</option>
                  <option value="Silt">Silt Soil (Moisture Retentive)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Irrigation Method</label>
                <select 
                  className="form-control font-bold" 
                  value={formData.irrigation_method} 
                  onChange={(e) => setFormData({ ...formData, irrigation_method: e.target.value })}
                >
                  <option value="Drip">Drip Irrigation (High Savings)</option>
                  <option value="Sprinkler">Sprinkler System</option>
                  <option value="Flood">Flood / Surface Irrigation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Available Stored Water (Liters)</label>
                <input 
                  type="number" className="form-control font-bold" 
                  value={formData.available_water_liters} 
                  onChange={(e) => setFormData({ ...formData, available_water_liters: parseInt(e.target.value) })} 
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">Step 03: Crop Parameters</h4>
              <div className="form-group">
                <label className="form-label">Crop Name</label>
                <select 
                  className="form-control font-bold" 
                  value={formData.crop_name} 
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice (Paddy)</option>
                  <option value="Corn">Corn (Maize)</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Growth Stage (Kc Factor)</label>
                <select 
                  className="form-control font-bold" 
                  value={formData.growth_stage} 
                  onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                >
                  <option value="Initial">Initial / Seedling Stage</option>
                  <option value="Vegetative">Vegetative Development Stage</option>
                  <option value="Mid-Season">Mid-Season / Peak Flowering Stage</option>
                  <option value="Late-Season">Late-Season / Harvest Stage</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">Step 04: AI Model Calibration</h4>
              <div className="form-group">
                <label className="form-label">Manual Soil Moisture Fallback (%)</label>
                <input 
                  type="number" step="0.5" className="form-control font-bold" 
                  value={formData.manual_soil_moisture_pct} 
                  onChange={(e) => setFormData({ ...formData, manual_soil_moisture_pct: parseFloat(e.target.value) })} 
                />
              </div>

              <div className="bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-xl space-y-2 text-[11px] text-emerald-900 font-medium">
                <p className="font-extrabold text-emerald-950">AgriCrop AI will estimate soil moisture using:</p>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-600" /> Soil characteristics (FC/WP)</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-600" /> Crop growth stage & Kc coefficients</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-600" /> Live satellite ET0 weather</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-600" /> Irrigation log patterns</div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step > 1 ? (
            <button 
              type="button" 
              onClick={() => setStep(step - 1)}
              className="btn btn-outline text-xs font-bold"
            >
              <ChevronLeft size={15} /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button 
              type="button" 
              onClick={() => setStep(step + 1)}
              className="btn btn-emerald text-xs font-bold"
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleFinalSubmit}
              className="btn btn-emerald text-xs font-extrabold"
            >
              Analyze Field with AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
}