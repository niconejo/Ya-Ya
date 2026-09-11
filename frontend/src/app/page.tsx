'use client';

import { useEffect, useState } from 'react';

type HealthStatus = {
  status: string;
  service: string;
  timestamp: string;
};

type ConnectionState = 'loading' | 'ok' | 'error';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function Home() {
  const [state, setState] = useState<ConnectionState>('loading');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error('Respuesta no OK');
        return res.json();
      })
      .then((data: HealthStatus) => {
        setHealth(data);
        setState('ok');
      })
      .catch(() => setState('error'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold text-brand-500">Ya-Ya</h1>
      <p className="max-w-md text-neutral-600">
        Esta pantalla confirma que el frontend puede comunicarse con el
        backend. Es solo un punto de partida — reemplacen esta página a
        medida que avancen con el resto de las funcionalidades del MVP.
      </p>

      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-5 text-left shadow-sm">
        {state === 'loading' && (
          <p className="text-neutral-500">Conectando con el backend…</p>
        )}

        {state === 'ok' && health && (
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />
            <div>
              <p className="font-medium text-neutral-900">
                Backend conectado
              </p>
              <p className="text-sm text-neutral-500">
                Servicio: {health.service}
              </p>
              <p className="text-sm text-neutral-500">
                Estado: {health.status}
              </p>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
            <div>
              <p className="font-medium text-neutral-900">
                No se pudo conectar con el backend
              </p>
              <p className="text-sm text-neutral-500">
                Verifiquen que el contenedor <code>yaya-backend</code> esté
                corriendo en {API_URL}.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
