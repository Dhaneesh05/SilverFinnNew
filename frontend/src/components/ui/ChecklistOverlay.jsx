import React, { useState, useMemo } from 'react';
import { useStore, ZONE_SEQUENCE, ZONE_LABELS } from '../../store/useStore';
import { Check, X, Minus, Camera, ChevronRight, FileText, DollarSign, Wrench, Upload, Package, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ── Part Autocomplete Suggestions (demo data) ────────────────────── */
const PART_SUGGESTIONS = [
  'Brake Pad Set', 'Brake Disc Rotor', 'Air Filter', 'Oil Filter',
  'Spark Plug Set', 'Drive Belt', 'Radiator Hose', 'Coolant Reservoir',
  'Battery (AGM 80Ah)', 'Alternator', 'Starter Motor', 'Ignition Coil',
  'Wiper Blade Set', 'Headlight Bulb', 'Tail Light Assembly',
  'Shock Absorber', 'Control Arm', 'Tie Rod End', 'CV Joint Boot',
  'Transmission Fluid', 'Power Steering Fluid', 'Cabin Air Filter',
];

/* ── Part Replacement Form Component ──────────────────────────────── */
function PartReplacementForm({ itemId, existingPart, onSave, onCancel }) {
  const [partName, setPartName] = useState(existingPart?.partName || '');
  const [partNumber, setPartNumber] = useState(existingPart?.partNumber || '');
  const [brand, setBrand] = useState(existingPart?.brand || '');
  const [cost, setCost] = useState(existingPart?.cost || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!partName || partName.length < 2) return [];
    return PART_SUGGESTIONS.filter(s =>
      s.toLowerCase().includes(partName.toLowerCase())
    ).slice(0, 5);
  }, [partName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!partName.trim() || !cost) return;
    onSave({
      partName: partName.trim(),
      partNumber: partNumber.trim(),
      brand: brand.trim(),
      cost: parseFloat(cost) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Wrench size={12} className="text-red-400" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">Part Replacement Required</span>
      </div>

      {/* Part Name with Autocomplete */}
      <div className="relative">
        <input
          type="text"
          placeholder="Part Name *"
          value={partName}
          onChange={(e) => { setPartName(e.target.value); setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => setShowSuggestions(true)}
          className="w-full bg-metallic-900/80 border border-metallic-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 placeholder-slate-600"
          required
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-metallic-800 border border-metallic-700 rounded-lg shadow-xl overflow-hidden">
            {filteredSuggestions.map((s) => (
              <button
                type="button"
                key={s}
                onMouseDown={() => { setPartName(s); setShowSuggestions(false); }}
                className="w-full text-left text-xs text-slate-300 px-3 py-2 hover:bg-metallic-700 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Part Number"
          value={partNumber}
          onChange={(e) => setPartNumber(e.target.value)}
          className="bg-metallic-900/80 border border-metallic-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500/50 placeholder-slate-600"
        />
        <input
          type="text"
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="bg-metallic-900/80 border border-metallic-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500/50 placeholder-slate-600"
        />
      </div>

      {/* Cost (MYR) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <span className="text-[10px] font-bold">MYR</span>
        </div>
        <input
          type="number"
          placeholder="Cost *"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          min="0"
          step="0.01"
          className="w-full bg-metallic-900/80 border border-metallic-700 text-white text-xs rounded-lg pl-12 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500/50 placeholder-slate-600"
          required
        />
      </div>

      {/* Photo Upload Prompt */}
      <div className="flex items-center gap-2 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
        <Upload size={14} className="text-amber-400 shrink-0" />
        <span className="text-[10px] text-amber-400">Photo evidence required for failed items</span>
        <button type="button" className="ml-auto text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded text-amber-400 hover:bg-amber-500/20 transition-colors">
          UPLOAD
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2 text-[11px] font-bold bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
        >
          <Package size={12} /> SAVE PART
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-[11px] font-bold bg-metallic-800 border border-metallic-700 text-slate-400 rounded-lg hover:bg-metallic-700 transition-colors"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

/* ── Main Checklist Overlay ──────────────────────────────────────── */
export default function ChecklistOverlay() {
  const {
    currentSession,
    activeZone,
    setActiveZone,
    recordResult,
    addReplacedPart,
    endSession,
    token,
    setActiveView,
    selectVehicle,
    currentStepIndex,
    advanceToNextZone,
    predictions,
  } = useStore();

  const [submitting, setSubmitting] = useState(false);
  const [expandedFailForms, setExpandedFailForms] = useState({}); // { itemId: true }

  // ── Running total of replaced parts (MUST BE BEFORE EARLY RETURN) ──
  const runningTotal = useMemo(() => {
    return (currentSession?.replacedParts || []).reduce((sum, p) => sum + (p.cost || 0), 0);
  }, [currentSession?.replacedParts]);

  if (!currentSession) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6 text-center">
        <p className="text-metallic-500 font-medium">Select a vehicle and start inspection to view checklist.</p>
      </div>
    );
  }

  // ── Safely access template items ───────────────────────────────────
  const templateItems = currentSession.template?.items || [];

  // ── Zone-scoped items ──────────────────────────────────────────────
  const zoneItems = activeZone === 'overview'
    ? templateItems
    : templateItems.filter(item => item.zone === activeZone);

  // ── Progress calculations ──────────────────────────────────────────
  const totalItems = templateItems.length;
  const completedItems = Object.keys(currentSession.results).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // ── Navigation guard: all items in the CURRENT zone must have a result ─
  const currentZoneItems = templateItems.filter(
    item => item.zone === ZONE_SEQUENCE[currentStepIndex]
  );
  const allCurrentZoneDone = currentZoneItems.length > 0 &&
    currentZoneItems.every(item => !!currentSession.results[item.id]);

  // ── Is this the final zone? ────────────────────────────────────────
  const isLastZone = currentStepIndex >= ZONE_SEQUENCE.length - 1;

  const failedPartsCount = (currentSession.replacedParts || []).length;

  // ── Handlers ───────────────────────────────────────────────────────
  const handleResult = (itemId, result) => {
    recordResult(itemId, result);

    // If FAIL → auto-expand the part form
    if (result === 'FAIL') {
      setExpandedFailForms(prev => ({ ...prev, [itemId]: true }));
    } else {
      // Collapse form if switched away from FAIL
      setExpandedFailForms(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  const handleSavePart = (itemId, partDetails) => {
    addReplacedPart(itemId, partDetails);
    // Collapse the form after saving
    setExpandedFailForms(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleNextZone = () => {
    if (isLastZone) {
      submitInspection();
    } else {
      advanceToNextZone();
    }
  };

  /**
   * Generate a professional branded PDF report for this inspection session.
   */
  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const vehicle = currentSession;
    const templateItems = currentSession.template?.items || [];
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });

    // ── Colour palette ──
    const GOLD   = [212, 175, 55];   // #D4AF37
    const DARK   = [18,  18,  24];   // #121218
    const MID    = [40,  40,  50];   // #282832
    const LIGHT  = [220, 220, 230];  // text
    const GREEN  = [34,  197, 94];   // pass
    const RED    = [239, 68,  68];   // fail
    const GREY   = [100, 100, 120];  // N/A

    const W = 210;
    const MARGIN = 14;

    // ── HEADER BANNER ──────────────────────────────────────────────────
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 42, 'F');

    // Gold accent bar
    doc.setFillColor(...GOLD);
    doc.rect(0, 0, 5, 42, 'F');

    // Logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...GOLD);
    doc.text('SILVER FINN', MARGIN + 4, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT);
    doc.text('Vehicle Service Inspection Report', MARGIN + 4, 22);

    // Date / time block (top-right)
    doc.setFontSize(8);
    doc.setTextColor(...GREY);
    doc.text(`${dateStr}  ${timeStr}`, W - MARGIN, 16, { align: 'right' });
    doc.text(`Session ID: ${currentSession.backendSessionId || 'DEMO'}`, W - MARGIN, 22, { align: 'right' });

    // ── VEHICLE INFO BLOCK ─────────────────────────────────────────────
    let y = 50;
    doc.setFillColor(...MID);
    doc.roundedRect(MARGIN, y, W - MARGIN * 2, 30, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...LIGHT);
    doc.text(vehicle.plateNumber || 'N/A', MARGIN + 5, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text(`${vehicle.make || ''} ${vehicle.model || ''} · ${vehicle.year || ''}`, MARGIN + 5, y + 16);
    doc.text(`Mileage at Visit: ${vehicle.currentMileage?.toLocaleString() || '—'} km`, MARGIN + 5, y + 22);

    const serviceLabel = currentSession.template?.serviceType || currentSession.template?.name || 'Inspection';
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(serviceLabel, W - MARGIN - 5, y + 9, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.setFontSize(8);
    doc.text(currentSession.template?.name || '', W - MARGIN - 5, y + 16, { align: 'right' });

    y += 38;

    // ── CHECKLIST RESULTS TABLE ────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...GOLD);
    doc.text('INSPECTION CHECKLIST', MARGIN, y);
    y += 4;

    // Build rows grouped by zone
    const groupedByZone = {};
    templateItems.forEach(item => {
      if (!groupedByZone[item.zone]) groupedByZone[item.zone] = [];
      groupedByZone[item.zone].push(item);
    });

    const tableRows = [];
    Object.entries(groupedByZone).forEach(([zone, items]) => {
      items.forEach(item => {
        const res = currentSession.results[item.id]?.result || 'PENDING';
        tableRows.push([
          ZONE_LABELS[zone] || zone,
          item.category,
          item.itemName,
          res,
        ]);
      });
    });

    autoTable(doc, {
      startY: y,
      head: [['Zone', 'Category', 'Check Item', 'Result']],
      body: tableRows,
      margin: { left: MARGIN, right: MARGIN },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.5,
        fillColor: [28, 28, 36],
        textColor: LIGHT,
        lineColor: [50, 50, 65],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: MID,
        textColor: GOLD,
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [22, 22, 30] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 32 },
        2: { cellWidth: 90 },
        3: {
          cellWidth: 20,
          halign: 'center',
          fontStyle: 'bold',
        },
      },
      didDrawCell: (data) => {
        if (data.column.index === 3 && data.section === 'body') {
          const val = data.cell.raw;
          if (val === 'PASS') {
            doc.setTextColor(...GREEN);
          } else if (val === 'FAIL') {
            doc.setTextColor(...RED);
          } else {
            doc.setTextColor(...GREY);
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(
            val,
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2 + 1,
            { align: 'center' }
          );
        }
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── REPLACED PARTS TABLE ───────────────────────────────────────────
    const parts = currentSession.replacedParts || [];
    if (parts.length > 0) {
      // Check for page space
      if (y > 230) { doc.addPage(); y = 20; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...GOLD);
      doc.text('REPLACED PARTS & BILLING', MARGIN, y);
      y += 4;

      const partRows = parts.map(p => [
        p.partName,
        p.brand || '—',
        p.partNumber || '—',
        p.quantity || 1,
        `MYR ${Number(p.cost || 0).toFixed(2)}`,
        `MYR ${(Number(p.cost || 0) * (p.quantity || 1)).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Part Name', 'Brand', 'Part No.', 'Qty', 'Unit Cost', 'Total']],
        body: partRows,
        margin: { left: MARGIN, right: MARGIN },
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2.5,
          fillColor: [28, 28, 36],
          textColor: LIGHT,
          lineColor: [50, 50, 65],
          lineWidth: 0.2,
        },
        headStyles: { fillColor: MID, textColor: GOLD, fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [22, 22, 30] },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 28 },
          2: { cellWidth: 30 },
          3: { cellWidth: 12, halign: 'center' },
          4: { cellWidth: 24, halign: 'right' },
          5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
        },
      });

      y = doc.lastAutoTable.finalY + 6;

      // Grand total box
      doc.setFillColor(...MID);
      doc.roundedRect(W - MARGIN - 65, y, 65, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text('TOTAL REPLACEMENT COST', W - MARGIN - 5, y + 5, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...GOLD);
      doc.text(`MYR ${runningTotal.toFixed(2)}`, W - MARGIN - 5, y + 11, { align: 'right' });
      y += 20;
    }

    // ── SUMMARY STATS ──────────────────────────────────────────────────
    if (y > 240) { doc.addPage(); y = 20; }

    const passCount = Object.values(currentSession.results).filter(r => r.result === 'PASS').length;
    const failCount = Object.values(currentSession.results).filter(r => r.result === 'FAIL').length;
    const naCount   = Object.values(currentSession.results).filter(r => r.result === 'NA').length;
    const total     = Object.values(currentSession.results).length;

    doc.setFillColor(22, 22, 30);
    doc.roundedRect(MARGIN, y, W - MARGIN * 2, 22, 3, 3, 'F');

    const cols = [MARGIN + 16, MARGIN + 57, MARGIN + 98, MARGIN + 135];
    const labels = ['Total Checked', 'Passed', 'Failed', 'N/A'];
    const values = [total, passCount, failCount, naCount];
    const colors = [LIGHT, GREEN, RED, GREY];

    labels.forEach((label, i) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text(label, cols[i], y + 8, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...colors[i]);
      doc.text(String(values[i]), cols[i], y + 17, { align: 'center' });
    });

    y += 30;

    // ── FOOTER ────────────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFillColor(...DARK);
      doc.rect(0, 287, W, 10, 'F');
      doc.setFillColor(...GOLD);
      doc.rect(0, 287, 5, 10, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text('Silver Finn Workshop Management · Confidential Service Record', MARGIN + 4, 293);
      doc.text(`Page ${p} of ${pageCount}`, W - MARGIN, 293, { align: 'right' });
    }

    // ── SAVE ──────────────────────────────────────────────────────────
    const filename = `SilverFinn_${vehicle.plateNumber || 'Report'}_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.pdf`;
    doc.save(filename);
  };

  /**
   * Submit all inspection data to the backend, generate the PDF, then close the session.
   */
  const submitInspection = async () => {
    const backendSessionId = currentSession.vehicle?.backendSessionId || currentSession.backendSessionId;
    if (!backendSessionId || !token) {
      // Offline / demo mode — still generate PDF
      generatePDF();
      endSession();
      setActiveView('customers');
      selectVehicle(null);
      return;
    }

    setSubmitting(true);
    try {
      const sid = backendSessionId;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // 1. Submit checklist results
      const items = Object.entries(currentSession.results).map(([templateItemId, val]) => ({
        templateItemId,
        result: val.result,
        notes: val.notes || null,
      }));

      if (items.length > 0) {
        await fetch(`/api/sessions/${sid}/check-items`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ items }),
        });
      }

      // 2. Submit replaced parts
      const parts = (currentSession.replacedParts || []).map(p => ({
        partName: p.partName,
        partNumber: p.partNumber || null,
        brand: p.brand || null,
        category: p.category || null,
        costMyr: Number(p.cost) || 0,
        quantity: p.quantity || 1,
      }));

      if (parts.length > 0) {
        await fetch(`/api/sessions/${sid}/replaced-parts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ parts }),
        });
      }

      // 3. Mark session complete with total cost
      await fetch(`/api/sessions/${sid}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ totalCostMyr: runningTotal }),
      });

      // 4. Generate & download PDF
      generatePDF();

    } catch (e) {
      console.error('Failed to submit inspection:', e);
      // Still generate PDF even if network fails
      generatePDF();
    } finally {
      setSubmitting(false);
      endSession();
      setActiveView('history');
      // Do not clear the selected vehicle so HistoryView can filter by it
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col gap-4">
      {/* ── Progress Header ──────────────────────────────────────────── */}
      <div className="glass-panel rounded-2xl p-5 shrink-0">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Inspection Progress</h3>
            <div className="text-2xl font-display font-bold text-white">{progressPercent}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-500">
              {completedItems} / {totalItems} items
            </div>
            <div className="text-[10px] font-bold tracking-wider text-amber-400/70 uppercase mt-1">
              Zone {currentStepIndex + 1} of {ZONE_SEQUENCE.length}
            </div>
          </div>
        </div>
        <div className="w-full h-1.5 bg-metallic-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Zone Step Indicators */}
        <div className="flex gap-1 mt-3">
          {ZONE_SEQUENCE.map((zone, idx) => {
            const zoneItemsForIndicator = templateItems.filter(i => i.zone === zone);
            const allDone = zoneItemsForIndicator.length > 0 && zoneItemsForIndicator.every(i => !!currentSession.results[i.id]);
            const hasFail = zoneItemsForIndicator.some(i => currentSession.results[i.id]?.result === 'FAIL');
            const isCurrent = idx === currentStepIndex;
            const isFuture = idx > currentStepIndex;

            return (
              <div
                key={zone}
                className={clsx("flex-1 h-1.5 rounded-full transition-all duration-300", {
                  "bg-amber-400 animate-pulse": isCurrent,
                  "bg-emerald-500": allDone && !hasFail && !isCurrent,
                  "bg-red-500": allDone && hasFail && !isCurrent,
                  "bg-metallic-700": isFuture || (!allDone && !isCurrent),
                })}
                title={ZONE_LABELS[zone]}
              />
            );
          })}
        </div>
      </div>

      {/* ── Running Cost Total (shown if any parts added) ────────────── */}
      {failedPartsCount > 0 && (
        <div className="glass-panel rounded-2xl p-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <DollarSign size={14} className="text-red-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 block">Replacement Total</span>
              <span className="text-lg font-display font-bold text-white">MYR {runningTotal.toFixed(2)}</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500">{failedPartsCount} part{failedPartsCount > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* ── Active Zone Checklist ─────────────────────────────────────── */}
      <div className="glass-panel-active rounded-2xl p-1 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-4 border-b border-metallic-700/50 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-display font-bold text-gold-400">
            {ZONE_LABELS[activeZone] || 'Zone Checklist'}
          </h2>
          <span className="text-xs font-semibold bg-metallic-800 px-2 py-1 rounded text-slate-300">
            {zoneItems.length} items
          </span>
        </div>

        <div className="overflow-y-auto p-2 flex-1 scroll-smooth">
          {zoneItems.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-500">No items for this zone.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {zoneItems.map(item => {
                const isDone = !!currentSession.results[item.id];
                const res = currentSession.results[item.id]?.result;
                const existingPart = (currentSession.replacedParts || []).find(p => p.itemId === item.id);
                const showPartForm = expandedFailForms[item.id] && res === 'FAIL';

                // Check if this item has a high-probability prediction warning
                const predictionWarning = predictions?.find(p => p.partName.toLowerCase() === item.itemName.toLowerCase());

                return (
                  <div key={item.id} className={clsx(
                    "p-4 rounded-xl border transition-all duration-200",
                    isDone ? "bg-metallic-800/40 border-metallic-700" : "bg-metallic-800/80 border-metallic-600 shadow-md"
                  )}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        {predictionWarning && predictionWarning.probability >= 0.3 && (
                          <div className="mb-2 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-red-400 max-w-fit">
                            <AlertTriangle size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Predicted Failure: {Math.round(predictionWarning.probability * 100)}% Risk
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 mb-1 block">{item.category}</span>
                        <h4 className="font-semibold text-white text-sm">{item.itemName}</h4>
                      </div>
                      <button className="text-slate-500 hover:text-gold-400 p-1 bg-metallic-900 rounded-md">
                        <Camera size={14} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-4">{item.guideline}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResult(item.id, 'PASS')}
                        className={clsx(
                          "flex-1 py-2 flex justify-center items-center rounded-lg border text-xs font-bold transition-colors",
                          res === 'PASS' 
                            ? "bg-green-500/20 border-green-500 text-green-400" 
                            : "bg-metallic-900 border-metallic-700 text-slate-500 hover:border-green-500/50 hover:text-green-400"
                        )}
                      >
                        <Check size={14} className="mr-1" /> PASS
                      </button>
                      <button 
                        onClick={() => handleResult(item.id, 'FAIL')}
                        className={clsx(
                          "flex-1 py-2 flex justify-center items-center rounded-lg border text-xs font-bold transition-colors",
                          res === 'FAIL' 
                            ? "bg-red-500/20 border-red-500 text-red-400" 
                            : "bg-metallic-900 border-metallic-700 text-slate-500 hover:border-red-500/50 hover:text-red-400"
                        )}
                      >
                        <X size={14} className="mr-1" /> FAIL
                      </button>
                      <button 
                        onClick={() => handleResult(item.id, 'NA')}
                        className={clsx(
                          "w-12 flex justify-center items-center rounded-lg border text-xs font-bold transition-colors",
                          res === 'NA' 
                            ? "bg-slate-500/20 border-slate-500 text-slate-400" 
                            : "bg-metallic-900 border-metallic-700 text-slate-500 hover:border-slate-500/50 hover:text-slate-400"
                        )}
                      >
                        <Minus size={14} />
                      </button>
                    </div>

                    {/* ── FAIL Branch: Part Replacement Form ──────────────── */}
                    {showPartForm && (
                      <PartReplacementForm
                        itemId={item.id}
                        existingPart={existingPart}
                        onSave={(details) => handleSavePart(item.id, details)}
                        onCancel={() => setExpandedFailForms(prev => {
                          const next = { ...prev };
                          delete next[item.id];
                          return next;
                        })}
                      />
                    )}

                    {/* Show saved part details if form was completed */}
                    {res === 'FAIL' && existingPart && !showPartForm && (
                      <div className="mt-3 p-2.5 bg-red-500/5 border border-red-500/15 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package size={12} className="text-red-400" />
                          <span className="text-xs text-white font-medium">{existingPart.partName}</span>
                          {existingPart.brand && (
                            <span className="text-[10px] text-slate-500">({existingPart.brand})</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-red-400">MYR {existingPart.cost?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom Navigation Button ─────────────────────────────────── */}
        <div className="p-3 border-t border-metallic-700/50 bg-metallic-900/30 shrink-0">
          <button 
            disabled={submitting || !allCurrentZoneDone}
            onClick={handleNextZone}
            className={clsx(
              "w-full py-3 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border",
              submitting || !allCurrentZoneDone
                ? "bg-metallic-800 text-slate-500 border-metallic-700 cursor-not-allowed"
                : isLastZone
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-400 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
                  : "bg-metallic-800 hover:bg-metallic-700 text-white border-metallic-600"
            )}
          >
            {submitting
              ? 'SUBMITTING...'
              : isLastZone
                ? <><FileText size={16} /> FINALIZE & EXPORT PDF</>
                : !allCurrentZoneDone
                  ? 'COMPLETE ALL ITEMS TO CONTINUE'
                  : <>NEXT ZONE <ChevronRight size={16} /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
