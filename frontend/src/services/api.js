const BASE_URL = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function getFields() {
  const res = await fetch(`${BASE_URL}/fields`);
  return handleResponse(res);
}

export async function getFieldDetail(fieldId) {
  const res = await fetch(`${BASE_URL}/fields/${fieldId}`);
  return handleResponse(res);
}

export async function createField(fieldData) {
  const res = await fetch(`${BASE_URL}/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fieldData)
  });
  return handleResponse(res);
}

export async function updateField(fieldId, fieldData) {
  const res = await fetch(`${BASE_URL}/fields/${fieldId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fieldData)
  });
  return handleResponse(res);
}

export async function deleteField(fieldId) {
  const res = await fetch(`${BASE_URL}/fields/${fieldId}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

export async function submitEnvironment(envData) {
  const res = await fetch(`${BASE_URL}/environment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envData)
  });
  return handleResponse(res);
}

export async function sendIoTReading(iotData) {
  const res = await fetch(`${BASE_URL}/environment/iot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(iotData)
  });
  return handleResponse(res);
}

export async function analyzeIrrigation(payload) {
  const res = await fetch(`${BASE_URL}/analyze-irrigation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function predictSoilMoisture(payload) {
  const res = await fetch(`${BASE_URL}/ml/predict-soil-moisture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function getMLModelInfo() {
  const res = await fetch(`${BASE_URL}/ml/model-info`);
  return handleResponse(res);
}

export async function getSchedule() {
  const res = await fetch(`${BASE_URL}/schedule`);
  return handleResponse(res);
}

export async function getAlerts() {
  const res = await fetch(`${BASE_URL}/alerts`);
  return handleResponse(res);
}

export async function resolveAlert(alertId) {
  const res = await fetch(`${BASE_URL}/alerts/${alertId}/resolve`, {
    method: 'PUT'
  });
  return handleResponse(res);
}

export async function getHistory(fieldId = null) {
  const url = fieldId ? `${BASE_URL}/irrigation-history?field_id=${fieldId}` : `${BASE_URL}/irrigation-history`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function logIrrigation(payload) {
  const res = await fetch(`${BASE_URL}/irrigation-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function getMLMetrics() {
  const res = await fetch(`${BASE_URL}/ml/metrics`);
  return handleResponse(res);
}

export async function retrainML() {
  const res = await fetch(`${BASE_URL}/ml/retrain`, {
    method: 'POST'
  });
  return handleResponse(res);
}

export async function getWeather(location = 'Farm Sector 1') {
  const res = await fetch(`${BASE_URL}/weather?location=${encodeURIComponent(location)}`);
  return handleResponse(res);
}

// --- New Location & Hyper-Local Weather & Water Resources Services ---

export async function reverseGeocode(latitude, longitude) {
  const res = await fetch(`${BASE_URL}/location/reverse-geocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude })
  });
  return handleResponse(res);
}

export async function searchLocation(query) {
  const res = await fetch(`${BASE_URL}/location/search?query=${encodeURIComponent(query)}`);
  return handleResponse(res);
}

export async function getFieldWeather(fieldId, forceRefresh = false) {
  const res = await fetch(`${BASE_URL}/weather/${fieldId}?refresh=${forceRefresh}`);
  return handleResponse(res);
}

export async function refreshFieldWeather(fieldId) {
  const res = await fetch(`${BASE_URL}/weather/refresh/${fieldId}`, {
    method: 'POST'
  });
  return handleResponse(res);
}

export async function getWeatherForecast(fieldId) {
  const res = await fetch(`${BASE_URL}/weather/${fieldId}/forecast`);
  return handleResponse(res);
}

export async function getWaterResources(fieldId) {
  const res = await fetch(`${BASE_URL}/water-resources/${fieldId}`);
  return handleResponse(res);
}

export async function sendAgentMessage(payload) {
  const res = await fetch(`${BASE_URL}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function getAgentSuggestedPrompts() {
  const res = await fetch(`${BASE_URL}/agent/suggested-prompts`);
  return handleResponse(res);
}


export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid credentials. Login failed.');
  }
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Registration failed.');
  }
  return response.json();
};
