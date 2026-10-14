import React, { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { Sun, AlertCircle, CheckCircle2, ArrowRight, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { calculateSolarFeasibility, SOLAR_BENCHMARKS } from '../utils/calculatorUtils';

export default function SolarCalculatorSection({ id = "calculator" }) {
  const [bill, setBill] = useState(15000);
  const [tariff, setTariff] = useState(SOLAR_BENCHMARKS.TARIFFS.commercial.rate);
  const [roofArea, setRoofArea] = useState(1500);

  const billId = useId();
  const tariffId = useId();
  const roofId = useId();

  const result = calculateSolarFeasibility({
    monthlyBill: bill,
    tariff: tariff,
    roofArea: roofArea
  });

  return (
    <section className="section" id={id} style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Interactive Feasibility Engine</span>
          <h2 className="section-title">Commercial Solar Capacity &amp; Savings Estimator</h2>
          <p className="section-desc">
            Calculate estimated rooftop solar capacity, annual power generation, and payback timeline calibrated to Guwahati and Northeast India solar irradiance.
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'start'
          }}
        >
          {/* Inputs Card */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--solar-amber)'
                }}
              >
                <Sun size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Premise Parameters</h3>
            </div>

            {/* Input 1: Monthly Bill */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor={billId} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Average Monthly Electricity Bill
                </label>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--soft-blue)' }}>
                  ₹{Number(bill).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                id={billId}
                type="range"
                min="3000"
                max="150000"
                step="1000"
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--soft-blue)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {[6000, 15000, 35000, 75000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBill(preset)}
                    style={{
                      background: bill === preset ? 'var(--soft-blue)' : 'var(--bg-surface)',
                      color: bill === preset ? '#0B132B' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input 2: Tariff Category */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor={tariffId} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                APDCL Tariff Category
              </label>
              <select
                id={tariffId}
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(SOLAR_BENCHMARKS.TARIFFS).map(([key, item]) => (
                  <option key={key} value={item.rate}>
                    {item.label} (₹{item.rate.toFixed(2)}/kWh)
                  </option>
                ))}
              </select>
            </div>

            {/* Input 3: Available Rooftop Area */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor={roofId} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Shadow-Free Rooftop Area (Sq. Ft.)
                </label>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--soft-blue)' }}>
                  {Number(roofArea).toLocaleString('en-IN')} sq. ft.
                </span>
              </div>
              <input
                id={roofId}
                type="range"
                min="200"
                max="25000"
                step="100"
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--soft-blue)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Rule of thumb: High-efficiency solar arrays require ~100 sq. ft. per 1 kWp installed.
              </div>
            </div>

            {/* Roof Constraint Notice */}
            {result.isValid && result.outputs.isRoofConstrained && (
              <div 
                style={{
                  display: 'flex',
                  gap: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  color: 'var(--solar-amber)',
                  lineHeight: 1.5
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Roof Area Constrained:</strong> Your electricity consumption suggests a higher capacity, but your available shadow-free area ({roofArea} sq. ft.) caps installation at {result.outputs.recommendedKw} kWp.
                </span>
              </div>
            )}
          </div>

          {/* Results Summary Card */}
          <div 
            className="card" 
            style={{ 
              padding: '32px',
              border: '1px solid rgba(158, 202, 214, 0.35)',
              background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-card) 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--soft-blue)' }}>
                Indicative Sizing Model
              </div>
              <span 
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--energy-green)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontWeight: 600
                }}
              >
                APDCL Sized
              </span>
            </div>

            {result.isValid && (
              <>
                {/* Hero Stat: Recommended Plant Size */}
                <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Recommended Solar Plant Size
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--soft-blue)', letterSpacing: '-0.02em' }}>
                    {result.outputs.recommendedKw} <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>kWp</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Utilizes ~{result.outputs.areaUtilizedSqFt.toLocaleString('en-IN')} sq. ft. of shadow-free rooftop space
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Annual Bill Savings
                    </div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--energy-green)', marginTop: '4px' }}>
                      ₹{result.outputs.annualFinancialSavings.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ~₹{result.outputs.monthlyFinancialSavings.toLocaleString('en-IN')} / month
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Estimated Payback
                    </div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {result.outputs.paybackYears} <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Years</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      25-year panel lifecycle
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Annual Clean Power
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {result.outputs.annualGenerationKwh.toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kWh</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ~{result.outputs.monthlyGenerationKwh.toLocaleString('en-IN')} Units/month
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Turnkey CapEx Est.
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                      ₹{(result.outputs.estimatedCapexAvg / 100000).toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lakhs</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Benchmark commercial turnkey
                    </div>
                  </div>
                </div>

                {/* CTA to Consultation */}
                <div style={{ marginTop: 'auto' }}>
                  <Link
                    to="/contact"
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: '16px' }}
                  >
                    <span>Request Verified Site Assessment</span>
                    <ArrowRight size={16} />
                  </Link>

                  {/* Explicit Disclaimer */}
                  <div 
                    style={{
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                      color: 'var(--text-muted)',
                      background: 'rgba(0, 0, 0, 0.15)',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <strong>Engineering Disclaimer:</strong> {result.disclaimer}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
