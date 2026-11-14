import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Award, FileText, X } from 'lucide-react';
import sawrapLogo from '../assets/sawrap-logo.png';
import { loadCompletedSales } from '../lib/api';
import { salesDateRange, salesPeriods, summarizeSales } from '../lib/salesAnalytics';

const pesos = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const money = (centavos) => pesos.format(centavos / 100);
const sectionClass = 'rounded-2xl border border-gray-200 bg-gray-50 p-4';

function SalesTotals({ sales }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
    <div><p className="text-xs font-extrabold uppercase tracking-wide text-amber-800">Completed Sales</p>
      <p className="mt-1 text-2xl font-black text-amber-800">{money(sales.total)}</p></div>
    <p className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">{sales.count} {sales.count === 1 ? 'transaction' : 'transactions'}</p>
  </div>;
}

function CategoryBreakdown({ sales }) {
  return <section className="space-y-2">
    <h3 className="text-xs font-extrabold uppercase tracking-wide text-gray-700">Earnings Breakdown by Category</h3>
    <table className="w-full border-collapse text-left text-sm">
      <thead><tr className="bg-gray-100"><th scope="col" className="border border-gray-200 p-2">Category</th>
        <th scope="col" className="border border-gray-200 p-2 text-right">Sales before discounts</th></tr></thead>
      <tbody>{sales.categories.map(([name, subtotal]) => <tr key={name}>
        <th scope="row" className="border border-gray-200 p-2 font-medium">{name}</th>
        <td className="border border-gray-200 p-2 text-right tabular-nums">{money(subtotal)}</td>
      </tr>)}</tbody>
      <tfoot>
        <tr><th scope="row" className="border border-gray-200 p-2 text-left">Subtotal including add-ons</th><td className="border border-gray-200 p-2 text-right">{money(sales.subtotal)}</td></tr>
        <tr><th scope="row" className="border border-gray-200 p-2 text-left">Order discounts</th><td className="border border-gray-200 p-2 text-right">{money(sales.discounts)}</td></tr>
        <tr><th scope="row" className="border border-gray-200 p-2 text-left">Completed Sales</th><td className="border border-gray-200 p-2 text-right font-bold">{money(sales.total)}</td></tr>
      </tfoot>
    </table>
  </section>;
}

export default function SalesAnalytics({ onClose }) {
  const dialog = useRef(null);
  const [period, setPeriod] = useState('all');
  const [from, setFrom] = useState('');
  const [through, setThrough] = useState('');
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const { start, end } = salesDateRange(period, from, through) ?? {};
  const requestKey = `${start}|${end}|${attempt}`;

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  useEffect(() => {
    if (start === undefined) return;
    const request = new AbortController();
    loadCompletedSales({ start, end }, request.signal)
      .then((orders) => {
        if (!request.signal.aborted) setResult({ key: requestKey, sales: summarizeSales(orders) });
      })
      .catch(() => {
        if (!request.signal.aborted) setResult({ key: requestKey, error: true });
      });
    return () => request.abort();
  }, [start, end, requestKey]);

  const current = result?.key === requestKey ? result : null;
  const sales = current?.sales;
  const periodLabel = period === 'custom' ? `${from} through ${through}` : salesPeriods.find(({ id }) => id === period).label;

  return createPortal(<>
    <dialog ref={dialog} aria-labelledby="sales-analytics-title" onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="sales-analytics-dialog m-auto max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 text-gray-900 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-xs sm:p-7">
      <div className="space-y-5">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div><h2 id="sales-analytics-title" className="text-lg font-black">Sales &amp; Best-Selling Analytics</h2>
            <p className="mt-1 text-xs text-gray-600">Completed orders by order date (Philippine time).</p></div>
          <button type="button" aria-label="Close analytics" onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-full bg-gray-100 hover:bg-gray-200"><X className="size-4" /></button>
        </header>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sales period">
          {salesPeriods.map(({ id, label }) => <button key={id} type="button" aria-pressed={period === id} onClick={() => setPeriod(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${period === id ? 'bg-amber-400 text-gray-950' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{label}</button>)}
        </div>
        {period === 'custom' && <div className={`${sectionClass} grid gap-3 sm:grid-cols-2`}>
          <label className="text-xs font-bold">Start Date<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-200 bg-white p-2 text-base" /></label>
          <label className="text-xs font-bold">End Date<input type="date" min={from || undefined} value={through} onChange={(event) => setThrough(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-200 bg-white p-2 text-base" /></label>
        </div>}

        <button type="button" disabled={!sales} onClick={() => window.print()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"><FileText className="size-4" /> Generate Executive PDF Report</button>
        {start === undefined ? <p role="status" className={sectionClass}>Select a valid start and end date.</p>
          : !current ? <p role="status" className={sectionClass}>Loading completed sales…</p>
            : current.error && <div role="alert" className={sectionClass}>Could not load sales. <button type="button" className="font-bold text-amber-800 underline" onClick={() => setAttempt((previous) => previous + 1)}>Try again</button></div>}

        {sales && <>
          <SalesTotals sales={sales} />
          <section className={`${sectionClass} space-y-3`}>
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-gray-700"><Award className="size-4 text-amber-700" /> Best-Selling Flavors</h3>
            {sales.flavors.length ? <ol className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {sales.flavors.map(({ key, name, category, units }, index) => <li key={key} className="space-y-1">
                <div className="flex justify-between gap-2 text-xs"><span className="min-w-0 break-words font-bold"><span className={`mr-1 rounded px-1.5 py-0.5 ${index < 5 ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-700'}`}>#{index + 1}</span>{name} <span className="font-normal text-gray-600">({category})</span></span><span className="shrink-0 font-black text-amber-800">{units} {units === 1 ? 'unit' : 'units'}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-200" aria-hidden="true"><div className="h-full rounded-full bg-amber-500" style={{ width: `${units / sales.flavors[0].units * 100}%` }} /></div>
              </li>)}
            </ol> : <p className="text-sm text-gray-600">No completed orders in this period.</p>}
          </section>
          <CategoryBreakdown sales={sales} />
        </>}
      </div>
    </dialog>
    {sales && <article className="sales-print hidden space-y-5">
      <header><img src={sawrapLogo} alt="SaWrap" className="h-9 w-auto" />
        <h1 className="mt-2 text-2xl font-bold">Executive Sales Report</h1>
        <p className="mt-1 text-sm">{periodLabel} · Completed orders by order date (Philippine time)</p></header>
      <SalesTotals sales={sales} />
      <CategoryBreakdown sales={sales} />
      <section><h2 className="font-bold">Top 5 Best-Selling Flavors</h2>
        {sales.flavors.length ? <ol className="list-decimal pl-6 text-sm">{sales.flavors.slice(0, 5).map(({ key, name, category, units }) => <li key={key}>{name} ({category}) — {units} {units === 1 ? 'unit' : 'units'}</li>)}</ol>
          : <p className="text-sm">No completed orders in this period.</p>}</section>
    </article>}
  </>, document.body);
}
