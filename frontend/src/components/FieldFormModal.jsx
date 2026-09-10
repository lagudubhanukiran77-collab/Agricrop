import React, { useState, useEffect } from 'react';
import { X, Save, Sprout, MapPin, Compass, Search, Loader2, ShieldCheck } from 'lucide-react';
import { reverseGeocode, searchLocation } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

const SOIL_PHYSICS_DEFAULTS = {
  'Sandy Soil (FC ~18%, WP ~8%)': { type: 'Sandy', fc: 18.0, wp: 8.0 },
  'Loamy Soil (FC ~32%, WP ~14%)': { type: 'Loamy', fc: 32.0, wp: 14.0 },
  'Clay Soil (FC ~42%, WP ~22%)': { type: 'Clay', fc: 42.0, wp: 22.0 },
  'Silt Soil (FC ~35%, WP ~16%)': { type: 'Silt', fc: 35.0, wp: 16.0 },
  'Peat Soil (FC ~48%, WP ~25%)': { type: 'Peat', fc: 48.0, wp: 25.0 }
};

const CROP_DEFAULTS = {
  'Wheat': 30,
  'Rice (Paddy)': 40,
  'Corn (Maize)': 45,
  'Cotton': 50,
  'Sugarcane': 60,
  'Tomato': 30,
  'Potato': 25,
  'Soybean': 35
};

export default function FieldFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    area_hectares: 1.5,
    location_name: 'D. Yerravaram, East Godavari',
    latitude: 17.1856,
    longitude: 81.9685,
    soil_type_option: 'Loamy Soil (FC ~32%, WP ~14%)',
    irrigation_method_option: 'Drip Irrigation (92% Efficiency)',
    flow_rate_lpm: 80,
    available_water_liters: 50000,
    crop_name: 'Wheat',
    growth_stage_option: 'Mid-Season Peak (Kc ~ 1.15)',
    field_capacity_pct: 32,
    wilting_point_pct: 14,
    root_depth_cm: 30,
    soil_moisture_fallback: 24
  });

  const [geolocating, setGeolocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [locMsg, setLocMsg] = useState(null);

  useEffect(() => {
    if (initialData) {
      const crop = initialData.crop || {};
      const env = initialData.latest_environment || {};
      setFormData({
        name: initialData.name || '',
        area_hectares: initialData.area_hectares || 1.5,
        location_name: initialData.location_name || initialData.location || 'D. Yerravaram, East Godavari',
        latitude: initialData.latitude || 17.1856,
        longitude: initialData.longitude || 81.9685,
        soil_type_option: initialData.soil_type ? `${initialData.soil_type} Soil` : 'Loamy Soil (FC ~32%, WP ~14%)',
        irrigation_method_option: initialData.irrigation_method ? `${initialData.irrigation_method} Irrigation` : 'Drip Irrigation (92% Efficiency)',
        flow_rate_lpm: initialData.flow_rate_lpm !== undefined ? initialData.flow_rate_lpm : 80,
        available_water_liters: initialData.available_water_liters || 50000,
        crop_name: crop.crop_name || 'Wheat',
        growth_stage_option: crop.growth_stage ? `${crop.growth_stage} Stage` : 'Mid-Season Peak (Kc ~ 1.15)',
        field_capacity_pct: initialData.field_capacity || 32,
        wilting_point_pct: initialData.wilting_point || 14,
        root_depth_cm: initialData.root_zone_depth || 30,
        soil_moisture_fallback: env.soil_moisture_pct || 24
      });
    }
  }, [initialData, isOpen]);

  // Update FC and WP when soil type changes
  const handleSoilChange = (val) => {
    const defaultData = SOIL_PHYSICS_DEFAULTS[val] || SOIL_PHYSICS_DEFAULTS['Loamy Soil (FC ~32%, WP ~14%)'];
    setFormData(prev => ({
      ...prev,
      soil_type_option: val,
      field_capacity_pct: defaultData.fc,
      wilting_point_pct: defaultData.wp
    }));
  };

  // Update root depth when crop changes
  const handleCropChange = (val) => {
    const depth = CROP_DEFAULTS[val] || 30;
    setFormData(prev => ({
      ...prev,
      crop_name: val,
      root_depth_cm: depth
    }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocMsg({ type: 'error', text: 'Geolocation not supported.' });
      return;
    }
    setGeolocating(true);
    setLocMsg({ type: 'info', text: 'Acquiring GPS...' });

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
            location_name: rev.location_name
          }));
          setLocMsg({ type: 'success', text: `GPS: ${rev.location_name}` });
        } catch {
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            location_name: `GPS (${lat.toFixed(3)}N, ${lon.toFixed(3)}E)`
          }));
          setLocMsg({ type: 'success', text: `GPS Acquired` });
        } finally {
          setGeolocating(false);
        }
      },
      () => {
        setLocMsg({ type: 'info', text: 'Using default coordinates.' });
        setGeolocating(false);
      }
    );
  };

  const handleSearchLoc = async (q) => {
    setSearchQuery(q);
    if (!q || q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchLocation(q);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const soilTypeSimple = formData.soil_type_option.includes('Sandy') ? 'Sandy' :
                           formData.soil_type_option.includes('Clay') ? 'Clay' :
                           formData.soil_type_option.includes('Silt') ? 'Silt' :
                           formData.soil_type_option.includes('Peat') ? 'Peat' : 'Loamy';

    const irrMethodSimple = formData.irrigation_method_option.includes('Sprinkler') ? 'Sprinkler' :
                            formData.irrigation_method_option.includes('Flood') ? 'Flood' :
                            formData.irrigation_method_option.includes('Sub') ? 'Sub-irrigation' : 'Drip';

    const stageSimple = formData.growth_stage_option.includes('Initial') ? 'Initial' :
                        formData.growth_stage_option.includes('Development') ? 'Development' :
                        formData.growth_stage_option.includes('Late') ? 'Late-Season' : 'Mid-Season';

    const payload = {
      name: formData.name,
      area_hectares: parseFloat(formData.area_hectares) || 1.5,
      location: formData.location_name,
      location_name: formData.location_name,
      latitude: formData.latitude,
      longitude: formData.longitude,
      soil_type: soilTypeSimple,
      irrigation_method: irrMethodSimple,
      flow_rate_lpm: parseFloat(formData.flow_rate_lpm) || 80,
      available_water_liters: parseFloat(formData.available_water_liters) || 50000,
      crop_name: formData.crop_name,
      growth_stage: stageSimple,
      field_capacity: parseFloat(formData.field_capacity_pct) || 32,
      wilting_point: parseFloat(formData.wilting_point_pct) || 14,
      root_zone_depth: parseFloat(formData.root_depth_cm) || 30,
      soil_moisture_pct: parseFloat(formData.soil_moisture_fallback) || 24
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(6, 182, 212, 0.45)',
          borderRadius: '20px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(6, 182, 212, 0.25)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(6, 182, 212, 0.25)', paddingBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.45rem', borderRadius: '10px', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <Sprout size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                {initialData ? t('editFieldTitle', 'Edit Field & Crop Details') : t('createFieldTitle', 'Create New Farm Field')}
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>AgriCrop AI Automated FAO-56 Calibration Engine</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Single-Block Form Body - 2 Columns */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* COLUMN 1: FIELD IDENTITY & LOCATION */}
            <div style={{ background: 'rgba(6, 182, 212, 0.04)', padding: '0.9rem 1rem', borderRadius: '14px', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <h4 style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#06b6d4', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <MapPin size={14} /> FIELD IDENTITY & LOCATION
              </h4>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd', display: 'block', marginBottom: '3px' }}>Field Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                  minLength={3}
                  placeholder="e.g. North Field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd', display: 'block', marginBottom: '3px' }}>Area (Acres)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-control" 
                    style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    value={formData.area_hectares} 
                    onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd', display: 'block', marginBottom: '3px' }}>Stored Water (L)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    value={formData.available_water_liters} 
                    onChange={(e) => setFormData({ ...formData, available_water_liters: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd' }}>Location / Village</label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={geolocating}
                    style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', color: '#38bdf8', borderRadius: '6px', fontSize: '0.68rem', padding: '2px 6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    {geolocating ? <Loader2 size={10} className="animate-spin" /> : <Compass size={10} />}
                    <span>{geolocating ? 'GPS...' : '📍 Auto GPS'}</span>
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    placeholder="Search village or city..."
                    value={formData.location_name}
                    onChange={(e) => {
                      setFormData({ ...formData, location_name: e.target.value });
                      handleSearchLoc(e.target.value);
                    }}
                    required
                  />

                  {searchResults.length > 0 && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: '2px', background: '#09131d', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '8px', zIndex: 100, maxHeight: '130px', overflowY: 'auto' }}>
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, latitude: item.latitude, longitude: item.longitude, location_name: item.name }));
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
                          style={{ padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#bae6fd' }}
                        >
                          <div style={{ fontWeight: 700 }}>{item.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{item.formatted}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {locMsg && (
                <div style={{ fontSize: '0.7rem', padding: '3px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  {locMsg.text}
                </div>
              )}
            </div>

            {/* COLUMN 2: SOIL, CROP & IRRIGATION PARAMETERS */}
            <div style={{ background: 'rgba(6, 182, 212, 0.04)', padding: '0.9rem 1rem', borderRadius: '14px', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <h4 style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#06b6d4', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <Sprout size={14} /> SOIL, CROP & IRRIGATION
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd', display: 'block', marginBottom: '3px' }}>Soil Type</label>
                  <select 
                    className="form-control" 
                    style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    value={formData.soil_type_option} 
                    onChange={(e) => handleSoilChange(e.target.value)}
                  >
                    <option value="Loamy Soil (FC ~32%, WP ~14%)">Loamy Soil</option>
                    <option value="Sandy Soil (FC ~18%, WP ~8%)">Sandy Soil</option>
                    <option value="Clay Soil (FC ~42%, WP ~22%)">Clay Soil</option>
                    <option value="Silt Soil (FC ~35%, WP ~16%)">Silt Soil</option>
                    <option value="Peat Soil (FC ~48%, WP ~25%)">Peat Soil</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd', display: 'block', marginBottom: '3px' }}>Irrigation Method</label>
                  <select 
                    className="form-control" 
                    style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    value={formData.irrigation_method_option} 
                    onChange={(e) => setFormData({ ...formData, irrigation_method_option: e.target.value })}
                  >
                    <option value="Drip Irrigation (92% Efficiency)">Drip Irrigation</option>
                    <option value="Sprinkler System (75% Efficiency)">Sprinkler System</option>
                    <option value="Flood Irrigation (50% Efficiency)">Flood Irrigation</option>
                    <option value="Sub-irrigation (85% Efficiency)">Sub-irrigation</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd', display: 'block', marginBottom: '3px' }}>Crop Name</label>
                  <select 
                    className="form-control" 
                    style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    value={formData.crop_name} 
                    onChange={(e) => handleCropChange(e.target.value)}
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Corn (Maize)">Corn (Maize)</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                    <option value="Soybean">Soybean</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd', display: 'block', marginBottom: '3px' }}>Growth Stage</label>
                  <select 
                    className="form-control" 
                    style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    value={formData.growth_stage_option} 
                    onChange={(e) => setFormData({ ...formData, growth_stage_option: e.target.value })}
                  >
                    <option value="Mid-Season Peak (Kc ~ 1.15)">Mid-Season Peak</option>
                    <option value="Initial / Seedling Stage (Kc ~ 0.40)">Initial Stage</option>
                    <option value="Vegetative Development Stage (Kc ~ 0.80)">Vegetative Stage</option>
                    <option value="Late-Season / Ripening Stage (Kc ~ 0.50)">Late-Season</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#bae6fd', display: 'block', marginBottom: '3px' }}>Soil Moisture Fallback (%)</label>
                <input 
                  type="number" 
                  step="0.5"
                  className="form-control" 
                  style={{ background: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(6, 182, 212, 0.35)', color: '#ffffff', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                  value={formData.soil_moisture_fallback} 
                  onChange={(e) => setFormData({ ...formData, soil_moisture_fallback: e.target.value })} 
                />
              </div>
            </div>

          </div>

          {/* Footer Banner & Buttons - 1 ROW */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(6, 182, 212, 0.25)', paddingTop: '0.75rem', marginTop: '0.2rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="#34d399" />
              <span>AgriCrop AI automatically calculates soil physics & FAO-56 Penman-Monteith ET0.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={onClose} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
                {t('cancel', 'Cancel')}
              </button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.8rem', padding: '0.45rem 1.25rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                <Save size={15} />
                <span>{initialData ? t('saveChanges', 'Save Changes') : t('createFieldBtn', 'Create Field')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}