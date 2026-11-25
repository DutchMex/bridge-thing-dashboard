import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BridgethingClient } from '@bridgething/client';

const client = new BridgethingClient();

function Icon({ name, size = 20 }) {
  const paths = {
    previous: <path d="M6 5v14M18.5 6.5 10 12l8.5 5.5z" />,
    next: <path d="M18 5v14M5.5 6.5 14 12l-8.5 5.5z" />,
    pause: <path d="M8 5v14M16 5v14" />,
    play: <path d="m8 5 11 7-11 7z" />,
    search: <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 4 4" /></>,
    location: <><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === 'play' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function weatherIcon(code) {
  if (code === 0) return '☀';
  if (code <= 2) return '🌤';
  if (code === 3) return '☁';
  if (code >= 45 && code <= 48) return '≋';
  if (code >= 51 && code <= 67) return '☂';
  if (code >= 71 && code <= 77) return '❄';
  if (code >= 80) return '☔';
  return '◌';
}

function clockText(date) {
  const hour = date.getHours();
  if (hour < 5) return 'deep night';
  if (hour < 8) return 'early morning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function Clock({ face }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (face === 'analog') {
    const seconds = now.getSeconds() * 6;
    const minutes = now.getMinutes() * 6 + now.getSeconds() * 0.1;
    const hours = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
    return (
      <div className="analog-wrap">
        <svg className="analog" viewBox="0 0 220 220">
          {Array.from({ length: 60 }, (_, i) => (
            <line key={i} x1="110" y1={i % 5 === 0 ? 11 : 17} x2="110" y2={i % 5 === 0 ? 25 : 22}
              transform={`rotate(${i * 6} 110 110)`} className={i % 5 === 0 ? 'tick major' : 'tick'} />
          ))}
          <line x1="110" y1="110" x2="110" y2="58" transform={`rotate(${hours} 110 110)`} className="hand hour" />
          <line x1="110" y1="110" x2="110" y2="38" transform={`rotate(${minutes} 110 110)`} className="hand minute" />
          <line x1="110" y1="126" x2="110" y2="28" transform={`rotate(${seconds} 110 110)`} className="hand second" />
          <circle cx="110" cy="110" r="5" className="pin" />
        </svg>
      </div>
    );
  }

  if (face === 'binary') {
    const values = [now.getHours(), now.getMinutes(), now.getSeconds()];
    return (
      <div className="binary-clock" aria-label={`${now.toLocaleTimeString()}`}>
        {values.map((value, column) => (
          <div className="binary-column" key={column}>
            {Array.from({ length: 4 }, (_, row) => {
              const tens = Math.floor(value / 10);
              const ones = value % 10;
              return (
                <React.Fragment key={row}>
                  <span className={(tens >> (3 - row)) & 1 ? 'on' : ''} />
                  <span className={(ones >> (3 - row)) & 1 ? 'on' : ''} />
                </React.Fragment>
              );
            })}
            <b>{String(value).padStart(2, '0')}</b>
          </div>
        ))}
      </div>
    );
  }

  if (face === 'pixel') {
    const digits = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '');
    const patterns = {
      '0': ['111','101','101','101','111'], '1': ['010','110','010','010','111'],
      '2': ['111','001','111','100','111'], '3': ['111','001','111','001','111'],
      '4': ['101','101','111','001','001'], '5': ['111','100','111','001','111'],
      '6': ['111','100','111','101','111'], '7': ['111','001','010','010','010'],
      '8': ['111','101','111','101','111'], '9': ['111','101','111','001','111'],
    };
    return (
      <div className="pixel-clock">
        {digits.split('').map((digit, i) => (
          <div className="pixel-digit" key={i}>{patterns[digit].flatMap((row, y) => row.split('').map((pixel, x) => <span key={`${y}-${x}`} className={pixel === '1' ? 'on' : ''} />))}</div>
        ))}
      </div>
    );
  }

  if (face === 'fuzzy') {
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return <div className="fuzzy-clock"><span>it is</span><strong>{clockText(now)}</strong><em>{time}</em></div>;
  }

  return (
    <div className="digital-clock">
      <strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>
      <span>{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
    </div>
  );
}

async function netFetch(url, { redirect = 'follow', allowBrowserFallback = true } = {}) {
  let result;
  try {
    result = await client.net.fetch({
      request: { url, method: 'GET', headers: [], body: null, timeoutMs: 15000, redirect },
    });
  } catch (error) {
    if (!allowBrowserFallback) throw error;
  }
  if (result?.ok) {
    const { status, body } = result.response.response;
    if (status < 200 || status >= 300) throw new Error(`Request failed: ${status}`);
    const bytes = body;
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  if (!allowBrowserFallback) throw new Error('Request was rejected by the host network service');
  const response = await fetch(url, { redirect });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function parseSoundtrackUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Use an HTTP(S) URL without embedded credentials.');
  }
  return url.href;
}

function Weather({ unit, location, sharingEnabled, onSearch }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!sharingEnabled) {
      setWeather(null);
      setLoading(false);
      setError('');
      return () => { cancelled = true; };
    }

    async function load() {
      setLoading(true);
      try {
        let place = null;
        if (location) {
          const found = await netFetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
          place = found.results?.[0];
        }
        if (!place) throw new Error('Location not found');
        const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
        const data = await netFetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,is_day,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}`);
        if (!data.current) throw new Error('Weather forecast is unavailable');
        if (!cancelled) {
          setWeather({ ...data, placeName: place.name || place.admin1 || location });
          setError('');
        }
      } catch (error) {
        if (!cancelled) {
          setWeather(null);
          setError(error instanceof Error ? error.message : 'Weather is unavailable');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const timer = window.setInterval(load, 15 * 60 * 1000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [location, sharingEnabled, unit]);

  const temperature = weather?.current?.temperature_2m;
  const code = weather?.current?.weather_code;
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return (
    <button className="weather glass" onClick={onSearch} type="button" aria-label="Change weather location">
      <div className="weather-main">
        <span className="weather-icon">{weather ? weatherIcon(code) : '—'}</span>
        <div>
          <strong>{loading ? '…' : temperature != null ? `${Math.round(temperature)}${symbol}` : '--'}</strong>
          <span>{weather?.placeName || (sharingEnabled ? error || 'Weather' : 'Weather sharing is off')}</span>
        </div>
      </div>
      <div className="weather-detail"><Icon name="location" size={15} /> <span>{weather ? `${weather.current?.relative_humidity_2m ?? '--'}% humidity` : sharingEnabled ? 'Tap to search' : 'Enable weather sharing in settings'}</span></div>
    </button>
  );
}

function LocationSearch({ location, sharingEnabled, onClose, onSelect }) {
  const [query, setQuery] = useState(location);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  useEffect(() => { setQuery(location); }, [location]);

  useEffect(() => {
    const term = query.trim();
    if (!sharingEnabled || term.length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError('');
      return undefined;
    }

    let cancelled = false;
    setResults([]);
    setSearching(false);
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const data = await netFetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=6&language=en&format=json`);
        if (!cancelled) setResults(Array.isArray(data.results) ? data.results : []);
      } catch (error) {
        if (!cancelled) {
          setResults([]);
          setSearchError(error instanceof Error ? error.message : 'Location search failed');
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, sharingEnabled]);

  return (
    <div className="search-backdrop" role="dialog" aria-modal="true" aria-label="Choose weather location">
      <div className="location-search glass">
        <form onSubmit={(event) => event.preventDefault()}>
          <Icon name="search" size={18} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a city name" disabled={!sharingEnabled} />
          <span className="search-status" aria-live="polite">{searching ? 'Searching…' : ''}</span>
        </form>
        <p className="search-disclosure">
          {sharingEnabled
            ? 'City searches and forecast coordinates are sent to Open-Meteo.'
            : 'Enable weather data sharing in settings before searching. No location is sent while it is off.'}
        </p>
        <div className="search-results">
          {results.map((place) => (
            <button type="button" key={`${place.id}-${place.latitude}`} onClick={() => onSelect(place)}>
              <span>{place.name}</span><small>{[place.admin1, place.country].filter(Boolean).join(', ')}</small>
            </button>
          ))}
          {searchError && <p role="status">{searchError}</p>}
          {!results.length && !searching && !searchError && sharingEnabled && <p>{query.trim().length >= 2 ? 'No matching locations found.' : 'Type at least two characters to search.'}</p>}
        </div>
        <button type="button" className="close-search" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

function Player({ state, onAction, sourceLabel }) {
  const track = state?.track;
  const playback = state?.playback;
  const [artUrl, setArtUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';
    async function loadArt() {
      setArtUrl('');
      if (track?.artworkUrl) {
        setArtUrl(track.artworkUrl);
        return;
      }
      if (!track?.artworkId) return;
      const result = await client.asset.get({ id: track.artworkId, requestId: crypto.randomUUID() }).catch(() => null);
      if (!cancelled && result?.ok && result.response?.bytes) {
        const blob = new Blob([result.response.bytes], { type: result.response.mime || 'image/jpeg' });
        objectUrl = URL.createObjectURL(blob);
        setArtUrl(objectUrl);
      }
    }
    loadArt();
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [track?.artworkId]);

  const playing = playback?.state === 'playing';
  const position = (playback?.positionMs || 0) / 1000;
  const duration = (track?.durationMs || 0) / 1000;
  const progress = duration ? Math.min(100, position / duration * 100) : 0;

  return (
    <div className="player glass">
      <div className="album" style={artUrl ? { backgroundImage: `url(${artUrl})` } : undefined}>{!artUrl && <span>♪</span>}</div>
      <div className="track">
        <div className="track-copy">
          <strong>{track?.title || (sourceLabel ? `${sourceLabel} monitor` : 'Nothing playing')}</strong>
          <span>{track?.artist || (sourceLabel ? 'Waiting for status update' : 'Waiting for music')}</span>
        </div>
        <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="controls">
        <button type="button" onClick={() => onAction('previous')} aria-label="Previous"><Icon name="previous" size={19} /></button>
        <button type="button" className="play-button" onClick={() => onAction(playing ? 'pause' : 'play')} aria-label={playing ? 'Pause' : 'Play'}>
          <Icon name={playing ? 'pause' : 'play'} size={21} />
        </button>
        <button type="button" onClick={() => onAction('next')} aria-label="Next"><Icon name="next" size={19} /></button>
      </div>
    </div>
  );
}

export default function App() {
  const [clockFace, setClockFace] = useState('digital');
  const [unit, setUnit] = useState('celsius');
  const [location, setLocation] = useState('Amsterdam');
  const [dashboardLayout, setDashboardLayout] = useState('balanced');
  const [widgetSpacing, setWidgetSpacing] = useState('balanced');
  const [clockSize, setClockSize] = useState('balanced');
  const [weatherSize, setWeatherSize] = useState('balanced');
  const [playerSize, setPlayerSize] = useState('balanced');
  const [showClock, setShowClock] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [showPlayback, setShowPlayback] = useState(true);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [weatherSharingEnabled, setWeatherSharingEnabled] = useState(false);
  const [alwaysPlayer, setAlwaysPlayer] = useState(false);
  const [playerState, setPlayerState] = useState(null);
  const [soundtrackEnabled, setSoundtrackEnabled] = useState(false);
  const [soundtrackUrl, setSoundtrackUrl] = useState('');
  const [soundtrackTrack, setSoundtrackTrack] = useState(null);
  const [soundtrackError, setSoundtrackError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = client.player.onSnapshot((reply) => setPlayerState(reply.state));
    client.player.stateGet().then((reply) => { if (reply.ok) setPlayerState(reply.response.state); });

    async function readConfig() {
      const reply = await client.config.list();
      if (!reply.ok) return;
      const entries = Object.fromEntries(reply.response.entries.map(({ key, value }) => [key, value]));
      if (entries.clockFace) setClockFace(entries.clockFace);
      if (entries.temperatureUnit) setUnit(entries.temperatureUnit);
      if (entries.weatherLocation) setLocation(entries.weatherLocation);
      if (entries.dashboardLayout) setDashboardLayout(entries.dashboardLayout);
      if (entries.widgetSpacing) setWidgetSpacing(entries.widgetSpacing);
      if (entries.clockSize) setClockSize(entries.clockSize);
      if (entries.weatherSize) setWeatherSize(entries.weatherSize);
      if (entries.playerSize) setPlayerSize(entries.playerSize);
      if (Object.hasOwn(entries, 'showClock')) setShowClock(entries.showClock === 'true' || entries.showClock === true);
      if (Object.hasOwn(entries, 'showWeather')) setShowWeather(entries.showWeather === 'true' || entries.showWeather === true);
      if (Object.hasOwn(entries, 'showPlayback')) setShowPlayback(entries.showPlayback === 'true' || entries.showPlayback === true);
      if (Object.hasOwn(entries, 'lowPowerMode')) setLowPowerMode(entries.lowPowerMode === 'true' || entries.lowPowerMode === true);
      if (Object.hasOwn(entries, 'weatherSharingEnabled')) setWeatherSharingEnabled(entries.weatherSharingEnabled === 'true' || entries.weatherSharingEnabled === true);
      if (entries.alwaysShowPlayback) setAlwaysPlayer(entries.alwaysShowPlayback === 'true');
      if (entries.soundtrackEnabled) setSoundtrackEnabled(entries.soundtrackEnabled === 'true');
      if (entries.soundtrackUrl) setSoundtrackUrl(entries.soundtrackUrl);
    }
    readConfig();
    const offConfig = client.config.onChanged(({ key, value }) => {
      if (key === 'clockFace') setClockFace(value || 'digital');
      if (key === 'temperatureUnit') setUnit(value || 'celsius');
      if (key === 'weatherLocation') setLocation(value || 'Amsterdam');
      if (key === 'dashboardLayout') setDashboardLayout(value || 'balanced');
      if (key === 'widgetSpacing') setWidgetSpacing(value || 'balanced');
      if (key === 'clockSize') setClockSize(value || 'balanced');
      if (key === 'weatherSize') setWeatherSize(value || 'balanced');
      if (key === 'playerSize') setPlayerSize(value || 'balanced');
      if (key === 'showClock') setShowClock(value === 'true' || value === true);
      if (key === 'showWeather') setShowWeather(value === 'true' || value === true);
      if (key === 'showPlayback') setShowPlayback(value === 'true' || value === true);
      if (key === 'lowPowerMode') setLowPowerMode(value === 'true' || value === true);
      if (key === 'weatherSharingEnabled') setWeatherSharingEnabled(value === 'true' || value === true);
      if (key === 'alwaysShowPlayback') setAlwaysPlayer(value === 'true');
      if (key === 'soundtrackEnabled') setSoundtrackEnabled(value === 'true');
      if (key === 'soundtrackUrl') setSoundtrackUrl(value || '');
    });
    return () => { unsubscribe(); offConfig(); };
  }, []);

  useEffect(() => {
    if (!soundtrackEnabled || !soundtrackUrl.trim()) {
      setSoundtrackTrack(null);
      setSoundtrackError('');
      return;
    }
    let endpoint;
    try {
      endpoint = parseSoundtrackUrl(soundtrackUrl.trim());
    } catch (error) {
      setSoundtrackTrack(null);
      setSoundtrackError(error.message);
      return;
    }

    let cancelled = false;
    async function poll() {
      try {
        const data = await netFetch(endpoint, { redirect: 'error', allowBrowserFallback: false });
        if (cancelled) return;
        const item = data?.track || data?.currentTrack || data?.nowPlaying || data?.now_playing || data;
        const title = item?.title || item?.name || item?.song || item?.trackName;
        const artist = item?.artist || item?.artistName || item?.author;
        if (title || artist) {
          setSoundtrackTrack({
            title: title || 'Unknown track',
            artist: artist || 'Unknown artist',
          });
        } else {
          setSoundtrackTrack(null);
        }
        setSoundtrackError('');
      } catch {
        if (!cancelled) {
          setSoundtrackTrack(null);
          setSoundtrackError('Soundtrack status unavailable. Check the URL and host permissions.');
        }
      }
    }
    poll();
    const timer = window.setInterval(poll, 5000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [soundtrackEnabled, soundtrackUrl]);

  async function playbackAction(action) {
    if (action === 'pause') await client.player.pause();
    else if (action === 'play') await client.player.resume();
    else if (action === 'previous') await client.player.skipPrev({ allowSeeking: true });
    else if (action === 'next') await client.player.skipNext();
  }

  const soundtrackConfigured = soundtrackEnabled && Boolean(soundtrackUrl.trim());
  const showPlayer = showPlayback && (alwaysPlayer || playerState?.playback?.state === 'playing' || Boolean(soundtrackTrack) || soundtrackConfigured);
  const displayPlayerState = soundtrackTrack
    ? { ...playerState, track: soundtrackTrack, playback: { state: 'playing', positionMs: 0 } }
    : playerState;

  return (
    <main className="dashboard" data-layout={dashboardLayout} data-spacing={widgetSpacing} data-performance={lowPowerMode ? 'low' : 'full'}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {showClock && <section className="clock-panel glass" data-size={clockSize}><Clock face={clockFace} /></section>}
      {showWeather && <aside className="side-column" data-size={weatherSize}>
        <Weather unit={unit} location={location} sharingEnabled={weatherSharingEnabled} onSearch={() => setSearchOpen(true)} />
      </aside>}
      {showPlayer && <div className="player-slot" data-size={playerSize}><Player state={displayPlayerState} onAction={playbackAction} sourceLabel={soundtrackConfigured ? 'Soundtrack' : ''} /></div>}
      {soundtrackError && <p className="dashboard-message" role="status">{soundtrackError}</p>}
      {searchOpen && <LocationSearch location={location} sharingEnabled={weatherSharingEnabled} onClose={() => setSearchOpen(false)} onSelect={(place) => {
        setLocation([place.name, place.admin1, place.country].filter(Boolean).join(', '));
        setSearchOpen(false);
      }} />}
    </main>
  );
}
