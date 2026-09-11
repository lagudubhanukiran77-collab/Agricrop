import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FieldsPage from './pages/FieldsPage';
import IntelligencePage from './pages/IntelligencePage';
import SchedulePage from './pages/SchedulePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

import FieldFormModal from './components/FieldFormModal';
import EnvironmentInputModal from './components/EnvironmentInputModal';
import MLMetricsModal from './components/MLMetricsModal';
import AIAgentWidget from './components/AIAgentWidget';
import LoginPage from './pages/LoginPage';
import LogoSplashPage from './components/LogoSplashPage';
import { useLanguage } from './i18n/LanguageContext';

import {
  getFields, createField, updateField, deleteField,
  submitEnvironment, sendIoTReading, getSchedule, getAlerts,
  resolveAlert, getHistory, logIrrigation, getMLMetrics, retrainML, getWeather
} from './services/api';

export default function App() {
  const { t } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('agricrop_user') || 'null');
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historySummary, setHistorySummary] = useState({});
  const [mlMetrics, setMlMetrics] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  // Modals
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [targetEnvField, setTargetEnvField] = useState(null);
  const [isMLModalOpen, setIsMLModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [fData, aData, sData, hData, mData, wData] = await Promise.all([
        getFields().catch(() => []),
        getAlerts().catch(() => []),
        getSchedule().catch(() => []),
        getHistory().catch(() => ({ logs: [], summary: {} })),
        getMLMetrics().catch(() => []),
        getWeather().catch(() => null)
      ]);

      setFields(fData);
      setAlerts(aData);
      setSchedule(sData);
      setHistoryLogs(hData.logs || []);
      setHistorySummary(hData.summary || {});
      setMlMetrics(mData);
      setWeatherData(wData);

      if (fData.length > 0 && !selectedField) {
        setSelectedField(fData[0]);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveField = async (formData) => {
    try {
      if (editingField) {
        await updateField(editingField.id, formData);
      } else {
        await createField(formData);
      }
      setIsFieldModalOpen(false);
      setEditingField(null);
      await loadData();
    } catch (err) {
      alert(`${t('errorSavingField', 'Error saving field:')} ${err.message}`);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (window.confirm(t('confirmDeleteField', 'Are you sure you want to delete this field?'))) {
      try {
        await deleteField(fieldId);
        await loadData();
      } catch (err) {
        alert(`${t('errorDeletingField', 'Error deleting field:')} ${err.message}`);
      }
    }
  };

  const handleSubmitEnv = async (envData) => {
    try {
      await submitEnvironment(envData);
      setIsEnvModalOpen(false);
      await loadData();
      setActiveTab('intelligence');
    } catch (err) {
      alert(`${t('errorSubmittingEnv', 'Error submitting environmental reading:')} ${err.message}`);
    }
  };

  const handleTriggerIoT = async (iotData) => {
    try {
      await sendIoTReading(iotData);
      setIsEnvModalOpen(false);
      await loadData();
      setActiveTab('intelligence');
    } catch (err) {
      alert(`${t('errorIotStream', 'IoT Stream error:')} ${err.message}`);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: true } : a));
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleRetrainML = async () => {
    try {
      const res = await retrainML();
      setMlMetrics(res.metrics || []);
      alert(t('mlRetrainedSuccess', 'ML models retrained successfully!'));
    } catch (err) {
      alert(`${t('retrainingError', 'Retraining error:')} ${err.message}`);
    }
  };

  const handleLogIrrigation = async () => {
    const fieldId = selectedField ? selectedField.id : (fields[0] ? fields[0].id : 1);
    const amount = prompt(t('promptWaterQuantity', 'Enter applied water quantity (Liters):'), '10000');
    if (amount) {
      try {
        await logIrrigation({
          field_id: fieldId,
          water_quantity_liters: parseFloat(amount),
          duration_minutes: 60,
          actual_action: 'Irrigated',
          water_saved_liters: 1200
        });
        await loadData();
      } catch (err) {
        alert(`${t('errorLoggingIrrigation', 'Error logging irrigation:')} ${err.message}`);
      }
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('agricrop_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agricrop_user');
  };

  if (showSplash) {
    return <LogoSplashPage onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user}
            fields={fields}
            alerts={alerts}
            schedule={schedule}
            historySummary={historySummary}
            onSelectField={setSelectedField}
            onOpenEnvModal={(f) => { setTargetEnvField(f); setIsEnvModalOpen(true); }}
            onOpenFieldModal={() => { setEditingField(null); setIsFieldModalOpen(true); }}
            onResolveAlert={handleResolveAlert}
            setActiveTab={setActiveTab}
          />
        );
      case 'fields':
        return (
          <FieldsPage 
            fields={fields}
            onSelectField={setSelectedField}
            onOpenEnvModal={(f) => { setTargetEnvField(f); setIsEnvModalOpen(true); }}
            onOpenFieldModal={(f) => { setEditingField(f || null); setIsFieldModalOpen(true); }}
            onDeleteField={handleDeleteField}
            setActiveTab={setActiveTab}
          />
        );
      case 'intelligence':
        return (
          <IntelligencePage 
            fields={fields}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />
        );
      case 'schedule':
        return (
          <SchedulePage 
            schedule={schedule}
            onSelectField={(id) => {
              const f = fields.find(field => field.id === id);
              if (f) setSelectedField(f);
            }}
            setActiveTab={setActiveTab}
          />
        );
      case 'history':
        return (
          <HistoryPage 
            historyLogs={historyLogs}
            historySummary={historySummary}
            onLogNewIrrigation={handleLogIrrigation}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            mlMetrics={mlMetrics}
            onRetrain={handleRetrainML}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: '#0b0f19',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 50%, rgba(16, 185, 129, 0.06) 0%, transparent 50%), linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0f172a 100%)',
      backgroundAttachment: 'fixed',
      color: '#ffffff'
    }}>
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alerts.filter(a => !a.is_resolved).length}
        onOpenFieldModal={() => { setEditingField(null); setIsFieldModalOpen(true); }}
        onOpenMLModal={() => setIsMLModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, width: '100%', maxWidth: '100%', padding: '1.25rem 1.5rem' }}>
        {renderActivePage()}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.85rem 1.25rem', width: '100%', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.85)' }}>
        {t('appFooter', 'AgriCrop Intelligent Irrigation Platform • Scikit-Learn ML + FAO-56 Agronomic Decision Architecture')}
      </footer>

      {/* Modals */}
      <FieldFormModal 
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        onSubmit={handleSaveField}
        initialData={editingField}
      />

      <EnvironmentInputModal 
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        field={targetEnvField}
        onSubmitEnv={handleSubmitEnv}
        onTriggerIoT={handleTriggerIoT}
      />

      <MLMetricsModal 
        isOpen={isMLModalOpen}
        onClose={() => setIsMLModalOpen(false)}
        onRetrain={handleRetrainML}
      />

      {/* Autonomous AI Agent Interactive Widget */}
      <AIAgentWidget 
        selectedField={selectedField}
        onSelectField={setSelectedField}
        setActiveTab={setActiveTab}
        onOpenMLModal={() => setIsMLModalOpen(true)}
      />
    </div>
  );
}