import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, Cpu, Droplets, CloudRain, ShieldCheck, ChevronRight, Play } from 'lucide-react';
import { sendAgentMessage } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export default function AIAgentWidget({ selectedField, onSelectField, setActiveTab, onOpenMLModal }) {
  const { currentLang, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getInitialBotMessage = () => ({
    id: 1,
    sender: 'bot',
    text: t('agentGreeting', '👋 Hello! I am AgriBot, your Autonomous Irrigation & Soil Intelligence AI Agent. Ask me anything in your preferred language!'),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    data_card: null,
    suggested_prompts: [
      t('promptWhichFields', '🌾 Which fields need water right now?'),
      t('promptWeather', '🌤️ Get live hyper-local weather forecast'),
      t('promptMLModel', '🤖 Inspect ML Soil Moisture Model performance'),
      t('promptRecalculate', '🧠 Recalculate AI decision for active field')
    ]
  });

  const [messages, setMessages] = useState([getInitialBotMessage()]);

  // Update initial greeting & initial prompts when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 1) {
        return [getInitialBotMessage()];
      }
      return prev;
    });
  }, [currentLang]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await sendAgentMessage({
        message: query,
        context_field_id: selectedField?.id || null,
        language: currentLang
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.text,
        intent: res.intent,
        data_card: res.data_card,
        suggested_prompts: res.suggested_prompts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) setUnreadCount(prev => prev + 1);

    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: `⚠️ Agent connection error: ${err.message}. Please check if AgriCrop backend is active on port 5000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      return (
        <div key={idx} style={{ marginBottom: line === '' ? '0.4rem' : '0.15rem' }}>
          {line}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Agent Launch Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-glow), #1b4332)',
          border: '2px solid rgba(82, 183, 136, 0.6)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 0 20px rgba(82, 183, 136, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        title={t('agentTitle', 'AgriBot AI Agent')}
      >
        <Bot size={28} color="#ffffff" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 800,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px #ef4444'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Expandable Agent Drawer Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '95px',
          right: '24px',
          width: '420px',
          maxWidth: '92vw',
          height: '620px',
          maxHeight: '80vh',
          background: 'rgba(9, 19, 14, 0.96)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(82, 183, 136, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          overflow: 'hidden'
        }}>
          {/* Agent Header */}
          <div style={{
            padding: '0.9rem 1.1rem',
            background: 'linear-gradient(90deg, rgba(27, 67, 50, 0.8), rgba(6, 182, 212, 0.2))',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                background: 'var(--primary-glow)',
                padding: '0.45rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px var(--primary-glow)'
              }}>
                <Bot size={20} color="#09130e" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {t('agentTitle', 'AgriBot AI Agent')} <Sparkles size={14} color="var(--water-cyan)" />
                </h3>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                  {t('agentSubtitle', 'Autonomous Farm Intelligence Active')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {/* Message Bubble */}
                <div style={{
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, var(--primary-emerald), #1b4332)'
                    : 'rgba(17, 34, 25, 0.85)',
                  border: msg.sender === 'user' ? '1px solid var(--primary-glow)' : '1px solid var(--border-light)',
                  color: '#ffffff',
                  padding: '0.75rem 0.95rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.84rem',
                  lineHeight: '1.45',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  {renderFormattedText(msg.text)}

                  {/* Render Data Cards inside Agent Chat */}
                  {msg.data_card && msg.data_card.type === 'DECISION_CARD' && (
                    <div style={{ marginTop: '0.6rem', padding: '0.6rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--water-cyan)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--water-cyan)' }}>
                          {msg.data_card.field_name}
                        </span>
                        <span className="badge badge-low">{msg.data_card.decision}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Volume: {msg.data_card.volume_liters ? `${msg.data_card.volume_liters.toLocaleString()} L` : 'N/A'} • Duration: {msg.data_card.duration_minutes || 0} mins
                      </div>
                    </div>
                  )}

                  {msg.data_card && msg.data_card.type === 'ML_METRICS_CARD' && (
                    <div style={{ marginTop: '0.6rem', padding: '0.6rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--primary-glow)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '4px' }}>
                        Production Model: {msg.data_card.model_name}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem' }}>
                        <span style={{ color: 'var(--primary-glow)', fontWeight: 700 }}>R²: {msg.data_card.r2_score}</span>
                        <span>MAE: {msg.data_card.mae}</span>
                        <span>RMSE: {msg.data_card.rmse}</span>
                      </div>
                      {onOpenMLModal && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={onOpenMLModal}
                          style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.7rem', padding: '2px 6px' }}
                        >
                          <Cpu size={12} /> {t('inspectModelMetrics', 'Inspect Model Metrics')}
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                    {msg.timestamp}
                  </div>
                </div>

                {/* Suggested Follow-up Prompts */}
                {msg.suggested_prompts && msg.suggested_prompts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.5rem' }}>
                    {msg.suggested_prompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(prompt)}
                        style={{
                          background: 'rgba(6, 182, 212, 0.1)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          color: 'var(--water-cyan)',
                          fontSize: '0.73rem',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span>{prompt}</span>
                        <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(17, 34, 25, 0.85)', padding: '0.6rem 0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={14} className="spin" color="var(--primary-glow)" />
                {t('agentAnalyzing', 'AgriBot is analyzing telemetry & running ML engine...')}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Scroll Bar */}
          <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleSendMessage(t('promptWhichFields', 'Which fields need water right now?'))}
              style={{ fontSize: '0.68rem', padding: '2px 8px', whitespace: 'nowrap', flexShrink: 0 }}
            >
              🌾 {t('quickPrompts', 'Quick Actions')} 1
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleSendMessage(t('promptWeather', 'Get live hyper-local weather forecast'))}
              style={{ fontSize: '0.68rem', padding: '2px 8px', whitespace: 'nowrap', flexShrink: 0 }}
            >
              🌤️ {t('quickPrompts', 'Quick Actions')} 2
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleSendMessage(t('promptMLModel', 'Inspect ML Soil Moisture Model performance'))}
              style={{ fontSize: '0.68rem', padding: '2px 8px', whitespace: 'nowrap', flexShrink: 0 }}
            >
              🤖 {t('quickPrompts', 'Quick Actions')} 3
            </button>
          </div>

          {/* Input Footer */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              placeholder={t('agentPlaceholder', 'Ask AgriBot about fields, weather, ML...')}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMsg.trim()}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
