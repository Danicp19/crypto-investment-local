'use client';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [cryptos, setCryptos] = useState([]);
  const [term, setTerm] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState('BTC');
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState(['BTC', 'ETH', 'XRP']);
  const [range, setRange] = useState('24h'); // 👈 Nuevo estado para rango

  const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchTerm(term);
    }, 2000); // 2 segundo

    return () => clearTimeout(delay);
  }, [term]);
  // Cargar lista inicial de la watchlist y actualizar cada 5 minutos
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/cryptos?symbols=${watchlist.join(',')}`);
        const data = await res.json();
        const uniqueData = Array.from(new Map(data.map(c => [c.symbol, c])).values());
        setCryptos(uniqueData);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      }
    };

    fetchWatchlist(); // primer fetch inmediato

    const interval = setInterval(fetchWatchlist, 300000); // cada 5 minutos (300,000 ms)

    return () => clearInterval(interval); // limpiar intervalo al desmontar
  }, [watchlist]);


  // Buscar nueva cripto si no está en la lista y actualizar cripto seleccionada
  useEffect(() => {
    if (!searchTerm) return;

    const termUpper = searchTerm.toUpperCase();

    fetch(`http://localhost:4000/api/cryptos/${searchTerm}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCryptos(prev => {
            // Agregar nueva cripto y eliminar duplicados por symbol
            const updated = [...prev, data];
            const unique = Array.from(new Map(updated.map(c => [c.symbol, c])).values());
            return unique;
          });

          // Actualizar cripto seleccionada para mostrar gráfico
          setSelected(termUpper);
        }
      });
  }, [searchTerm]);




  // Cargar y actualizar histórico cada 30s para la cripto seleccionada
  // Cargar y actualizar histórico cada 30s para la cripto seleccionada
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/history/${selected}?range=${range}`);
        let data = await res.json();

        // Si no hay historial, inicializamos con precio actual
        if (!Array.isArray(data) || data.length === 0) {
          const cryptoRes = await fetch(`http://localhost:4000/api/cryptos/${selected}`);
          const cryptoData = await cryptoRes.json();
          if (cryptoData) {
            data = [{
              timestamp: new Date().toISOString(),
              price: cryptoData.price
            }];
          }
        }

        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistory([]);
      }
    };

    fetchHistory();

    const interval = setInterval(() => {
      if (!document.hidden) fetchHistory();
    }, 300000); // cada 5 minutos

    return () => clearInterval(interval);
  }, [selected, range]);


  // Filtrar criptos para la tabla
  const filteredCryptos = cryptos.filter(c => {
    if (searchTerm.trim()) {
      // Si hay búsqueda, filtrar por nombre o símbolo
      return (
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (selected) {
      // Si no hay búsqueda pero hay seleccionada en dropdown, filtrar por esa
      return c.symbol?.toLowerCase() === selected.toLowerCase();
    }
    // Si no hay búsqueda ni selección, mostrar todas
    return true;
  });


  const chartData = {
    labels: history.map(h => new Date(h.timestamp).toLocaleTimeString()), // formato legible
    datasets: [
      {
        label: `${selected} Price`,
        data: history.map(h => h.price),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        pointRadius: 3,
        tension: 0.2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `$${context.formattedValue}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };


  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">CryptoInvestment</h1>

      {/* Buscador */}
      <div>

        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar cripto..."
          className="border px-3 py-2 w-full max-w-sm rounded-md mb-4"

        />
      </div>

      {/* Vista cards en móvil */}
      <div className="grid grid-cols-1 sm:hidden gap-4">
        {filteredCryptos.map((c, idx) => (
          <div
            key={c.symbol ?? idx}
            className="border rounded-lg p-4 shadow bg-white"
          >
            <div className="flex justify-between mb-2">
              <span className="font-bold">{c.name} ({c.symbol})</span>
              <span className={Number(c.percent_change_24h) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Number(c.percent_change_24h).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Price:</span>
              <span>${fmt.format(c.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Volume:</span>
              <span>{fmt.format(c.volume)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Vista tabla en desktop */}
      <div className="hidden sm:block">
        <table className="table-auto min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Symbol</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Volume</th>
              <th className="border border-gray-300 px-4 py-2 text-right">% 24h</th>
            </tr>
          </thead>
          <tbody>
            {filteredCryptos.map((c, idx) => (
              <tr key={c.symbol ?? idx} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{c.symbol}</td>
                <td className="border border-gray-300 px-4 py-2">{c.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">${fmt.format(c.price)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{fmt.format(c.volume)}</td>
                <td
                  className={`border border-gray-300 px-4 py-2 text-right ${Number(c.percent_change_24h) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {Number(c.percent_change_24h).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Selector de cripto */}
      <div>
        <label className="mr-2 font-medium">Select crypto:</label>
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setSearchTerm(''); // ← limpia el buscador para que la tabla ya no se quede filtrada
          }}
          className="border px-2 py-1 rounded"
        >
          {cryptos
            .filter(c => c.name) // Solo los que tengan nombre
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c, idx) => (
              <option key={c.symbol ?? idx} value={c.symbol}>{c.name}</option>
            ))
          }

        </select>





      </div>
      <div className="flex gap-2 mb-4">
        {['1h', '24h', '7d', '1m', 'YTD'].map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded ${range === r ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Price History ({range})</h2>
        <Line data={chartData} options={chartOptions} />
      </div>
    </main>
  );
}
