import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { closeSettings, ConfigForm } from '@bridgething/client/form';
import { settings } from '@bridgething/client/settings';
import './styles.css';

function SettingsPage() {
  const form = useRef(null);
  const [query, setQuery] = useState('');
  const [placeSelected, setPlaceSelected] = useState(false);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [savingPlace, setSavingPlace] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const [fields, entries] = await Promise.all([
          settings.config.fields(),
          settings.config.list(),
        ]);
        if (!active) return;
        const values = Object.fromEntries(entries.map(({ key, value }) => [key, value]));
        const defaults = Object.fromEntries(fields.map(({ data }) => [data.key, data.default == null ? '' : String(data.default)]));
        setSharingEnabled((values.weatherSharingEnabled ?? defaults.weatherSharingEnabled) === 'true');
        setQuery(values.weatherLocation ?? defaults.weatherLocation ?? 'Amsterdam');
      } catch (error) {
        if (active) setStatus(error instanceof Error ? error.message : String(error));
      }
    }
    const offRefresh = settings.onRefresh(refresh);
    refresh();
    return () => {
      active = false;
      offRefresh();
    };
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!sharingEnabled || term.length < 2 || placeSelected) {
      setResults([]);
      setSearching(false);
      setSearchError('');
      return undefined;
    }

    let cancelled = false;
    setResults([]);
    setSearchError('');
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await settings.fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=6&language=en&format=json`,
          { timeoutMs: 15000 },
        );
        if (!response.ok) throw new Error(`Location search failed: ${response.status}`);
        const data = await response.json();
        if (!cancelled) setResults(Array.isArray(data.results) ? data.results : []);
      } catch (error) {
        if (!cancelled) setSearchError(error instanceof Error ? error.message : 'Location search failed.');
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, sharingEnabled, placeSelected]);

  async function enableWeatherSharing() {
    try {
      await settings.config.set('weatherSharingEnabled', 'true');
      setSharingEnabled(true);
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  async function selectPlace(place) {
    const value = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
    setSavingPlace(`${place.id}-${place.latitude}`);
    setSelectionError('');
    try {
      await form.current?.flush();
      await settings.config.set('weatherLocation', value);
      setPlaceSelected(true);
      setQuery(place.name);
      setResults([]);
      setStatus(`Weather location set to ${value}.`);
    } catch (error) {
      setSelectionError(error instanceof Error ? error.message : String(error));
    } finally {
      setSavingPlace('');
    }
  }

  async function done() {
    setStatus('');
    try {
      await closeSettings(form.current);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <main className="settings-page">
      <header className="page-heading">
        <p className="eyebrow">GLASS DASHBOARD</p>
        <h1>Choose your weather location</h1>
        <p>Search for a city and choose the matching place. Your dashboard updates as soon as you select it.</p>
      </header>

      <section className="city-search" aria-labelledby="city-search-title">
        <div className="section-heading">
          <div>
            <h2 id="city-search-title">Find a city</h2>
            <p>Type at least two characters to see matching locations.</p>
          </div>
          <span className={sharingEnabled ? 'sharing-state enabled' : 'sharing-state'}>
            {sharingEnabled ? 'LOCATION SHARING ON' : 'LOCATION SHARING OFF'}
          </span>
        </div>
        <label className="search-field">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setPlaceSelected(false);
              setQuery(event.target.value);
              setStatus('');
            }}
            placeholder="Search city or town"
            disabled={!sharingEnabled}
            aria-label="Search for a city"
          />
          {searching && <span className="searching" role="status">Searching…</span>}
        </label>
        <p className="privacy-note">
          {sharingEnabled
            ? 'City names are sent to Open-Meteo to find locations and return local forecasts.'
            : 'No location is sent while sharing is off. Enable weather data sharing below to search.'}
        </p>
        {!sharingEnabled && (
          <button className="enable-sharing" type="button" onClick={enableWeatherSharing}>
            Enable weather data sharing
          </button>
        )}
        {sharingEnabled && query.trim().length >= 2 && !searching && !results.length && !searchError && (
          <p className="empty-results">No matching places found.</p>
        )}
        {searchError && <p className="form-error" role="alert">{searchError}</p>}
        {selectionError && <p className="form-error" role="alert">{selectionError}</p>}
        {results.length > 0 && (
          <div className="search-results" role="listbox" aria-label="Matching locations">
            {results.map((place) => {
              const id = `${place.id}-${place.latitude}`;
              return (
                <button
                  className="place-option"
                  type="button"
                  role="option"
                  aria-selected="false"
                  key={id}
                  disabled={Boolean(savingPlace)}
                  onClick={() => selectPlace(place)}
                >
                  <span className="place-name">{place.name}</span>
                  <span className="place-region">{[place.admin1, place.country].filter(Boolean).join(', ')}</span>
                  {savingPlace === id && <span className="place-saving">Saving…</span>}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="all-settings" aria-labelledby="settings-title">
        <div className="section-heading">
          <div>
            <h2 id="settings-title">Dashboard settings</h2>
            <p>Layout, clock, playback, privacy and weather preferences.</p>
          </div>
        </div>
        <ConfigForm
          ref={form}
          onChange={(values) => setSharingEnabled(values.weatherSharingEnabled === 'true')}
        />
      </section>

      <footer className="page-footer">
        <p role="status" aria-live="polite">{status}</p>
        <button className="done-button" type="button" onClick={done}>Done</button>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<SettingsPage />);
