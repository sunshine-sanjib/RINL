import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ZONES = ['Zone-A','Zone-B','Zone-C','Zone-D','Zone-E','Zone-F'];
const CHECKLIST_ITEMS = [
  { key:'visualInspection', label:'Visual Inspection Completed' },
  { key:'cleaningDone', label:'Cleaning Done' },
  { key:'connectionsTight', label:'Connections Tight & Secure' },
  { key:'batteryCheck', label:'Battery Check Performed' },
  { key:'fanOperation', label:'Fan Operation Verified' },
  { key:'bypassTest', label:'Bypass Test Completed' },
  { key:'earthingCheck', label:'Earthing Check OK' },
  { key:'loadTest', label:'Load Test Performed' },
];

export default function NewMaintenancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [form, setForm] = useState({
    etlUpsSn:'', location:'', pmDate: new Date().toISOString().split('T')[0],
    pmDoneBy: user?.name || '', boqItem:'', ratings:'',
    maintenanceType:'preventive',
    checklist:{ visualInspection:false, cleaningDone:false, connectionsTight:false, batteryCheck:false, fanOperation:false, bypassTest:false, earthingCheck:false, loadTest:false },
    measurements:{ acInputVolts:{r:'',y:'',b:''}, acInputCurrent:{r:'',y:'',b:''}, inputFreq:'', dcRectifier:'', dcSmps:'', acSmps:'', acOutputVolt:{r:'',y:'',b:''}, acOutputCurrent:{r:'',y:'',b:''} },
    batteryData:[{ bankNo:'Bank 1', voltage:'', current:'', condition:'good' }],
    sparesReplaced:'', remarks:''
  });

  const setF = (k,v) => setForm(f => ({...f,[k]:v}));
  const setM = (k,subk,v) => setForm(f => ({...f, measurements:{...f.measurements,[k]:{...f.measurements[k],[subk]:v}}}));
  const setMDirect = (k,v) => setForm(f => ({...f, measurements:{...f.measurements,[k]:v}}));
  const toggleCheck = (k) => setForm(f => ({...f, checklist:{...f.checklist,[k]:!f.checklist[k]}}));
  const addBattery = () => setForm(f => ({...f, batteryData:[...f.batteryData,{bankNo:`Bank ${f.batteryData.length+1}`,voltage:'',current:'',condition:'good'}]}));
  const setBattery = (i,k,v) => setForm(f => {const d=[...f.batteryData]; d[i]={...d[i],[k]:v}; return {...f,batteryData:d};});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.etlUpsSn || !form.location || !form.pmDoneBy) {
      toast.error('Please fill all required fields.'); return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/maintenance', form);
      setSubmitted(data.report);
      toast.success(data.message || 'PM Report submitted!');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally { setLoading(false); }
  };

  const SectionLabel = ({children}) => (
    <div style={{borderLeft:'3px solid var(--rinl-steel)',paddingLeft:8,marginBottom:16,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--rinl-gold)',fontWeight:700}}>
      {children}
    </div>
  );

  if (submitted) return (
    <div className="app-layout"><Sidebar />
      <div className="main-content"><Header title="PM Report Submitted"/>
        <div className="page-wrapper" style={{display:'flex',justifyContent:'center',paddingTop:60}}>
          <div className="card" style={{maxWidth:480,width:'100%',textAlign:'center',padding:48}}>
            <div style={{fontSize:64,marginBottom:16}}>🔧</div>
            <h2 style={{fontFamily:'var(--font-heading)',fontSize:28,color:'#4ade80',marginBottom:8}}>PM Report Submitted!</h2>
            <p style={{color:'var(--text-secondary)',marginBottom:24}}>Your Preventive Maintenance report is pending approval.</p>
            <div style={{background:'var(--bg-elevated)',borderRadius:'var(--radius-lg)',padding:'20px 32px',marginBottom:28,border:'1px solid var(--border)'}}>
              <div style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>Report ID</div>
              <div style={{fontFamily:'var(--font-heading)',fontSize:32,fontWeight:700,color:'var(--rinl-gold)'}}>{submitted.reportId}</div>
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <button className="btn btn-secondary" onClick={() => navigate('/maintenance')}>← All Reports</button>
              <button className="btn btn-primary" onClick={() => navigate(`/maintenance/${submitted._id}`)}>View Report →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="New PM Report" />
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">Preventive Maintenance Report</h1>
              <p className="page-subtitle">Submit UPS maintenance record for approval</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/maintenance')}>← Back</button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="card" style={{marginBottom:20}}>
              <SectionLabel>UPS & Location Details</SectionLabel>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">ETL UPS Serial No. *</label>
                  <input className="form-input" placeholder="e.g. SN-2024-001" value={form.etlUpsSn} onChange={e=>setF('etlUpsSn',e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" placeholder="Building / Room" value={form.location} onChange={e=>setF('location',e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">PM Date *</label>
                  <input className="form-input" type="date" value={form.pmDate} onChange={e=>setF('pmDate',e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">PM Done By *</label>
                  <input className="form-input" placeholder="Technician name" value={form.pmDoneBy} onChange={e=>setF('pmDoneBy',e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">BOQ Item</label>
                  <input className="form-input" placeholder="BOQ reference" value={form.boqItem} onChange={e=>setF('boqItem',e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Maintenance Type</label>
                  <select className="form-input" value={form.maintenanceType} onChange={e=>setF('maintenanceType',e.target.value)}>
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="breakdown">Breakdown</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="card" style={{marginBottom:20}}>
              <SectionLabel>Maintenance Checklist</SectionLabel>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {CHECKLIST_ITEMS.map(item => (
                  <label key={item.key} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'8px 12px',background:'var(--bg-input)',borderRadius:'var(--radius-sm)',border:`1px solid ${form.checklist[item.key]?'var(--rinl-green)':'var(--border)'}`}}>
                    <input type="checkbox" checked={form.checklist[item.key]} onChange={()=>toggleCheck(item.key)} style={{width:16,height:16,accentColor:'var(--rinl-green)'}} />
                    <span style={{fontSize:13,color:'var(--text-primary)'}}>{item.label}</span>
                    {form.checklist[item.key] && <span style={{marginLeft:'auto',color:'#4ade80',fontSize:14}}>✓</span>}
                  </label>
                ))}
              </div>
              <div style={{marginTop:12,fontSize:12,color:'var(--text-secondary)'}}>
                {Object.values(form.checklist).filter(Boolean).length} / {CHECKLIST_ITEMS.length} items completed
              </div>
            </div>

            {/* Measurements */}
            <div className="card" style={{marginBottom:20}}>
              <SectionLabel>Electrical Measurements</SectionLabel>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr style={{background:'var(--bg-elevated)'}}>
                      <th style={{padding:'8px 12px',textAlign:'left',color:'var(--text-secondary)',fontWeight:600}}>Parameter</th>
                      <th style={{padding:'8px 12px',color:'var(--text-secondary)',fontWeight:600}}>R Phase</th>
                      <th style={{padding:'8px 12px',color:'var(--text-secondary)',fontWeight:600}}>Y Phase</th>
                      <th style={{padding:'8px 12px',color:'var(--text-secondary)',fontWeight:600}}>B Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[['AC Input Volts','acInputVolts'],['AC Input Current','acInputCurrent'],['AC Output Volt','acOutputVolt'],['AC Output Current','acOutputCurrent']].map(([label,key]) => (
                      <tr key={key} style={{borderTop:'1px solid var(--border)'}}>
                        <td style={{padding:'8px 12px',color:'var(--text-primary)',fontWeight:500}}>{label}</td>
                        {['r','y','b'].map(phase => (
                          <td key={phase} style={{padding:'6px 8px'}}>
                            <input className="form-input" style={{textAlign:'center',padding:'6px 8px'}} placeholder="--"
                              value={form.measurements[key][phase]} onChange={e=>setM(key,phase,e.target.value)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="form-grid-3" style={{marginTop:16}}>
                {[['inputFreq','Input Frequency (Hz)'],['dcRectifier','DC Rectifier (V)'],['dcSmps','DC SMPS (V)'],['acSmps','AC SMPS (V)']].map(([k,l]) => (
                  <div className="form-group" key={k}>
                    <label className="form-label">{l}</label>
                    <input className="form-input" placeholder="--" value={form.measurements[k]} onChange={e=>setMDirect(k,e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Battery Data */}
            <div className="card" style={{marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <SectionLabel>Battery Data</SectionLabel>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addBattery}>+ Add Bank</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                {form.batteryData.map((b,i) => (
                  <div key={i} style={{background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:14}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--rinl-gold)',marginBottom:10}}>{b.bankNo}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <div className="form-group" style={{marginBottom:0}}>
                        <label className="form-label" style={{fontSize:11}}>Voltage (V)</label>
                        <input className="form-input" style={{padding:'6px 10px'}} placeholder="--" value={b.voltage} onChange={e=>setBattery(i,'voltage',e.target.value)} />
                      </div>
                      <div className="form-group" style={{marginBottom:0}}>
                        <label className="form-label" style={{fontSize:11}}>Current (A)</label>
                        <input className="form-input" style={{padding:'6px 10px'}} placeholder="--" value={b.current} onChange={e=>setBattery(i,'current',e.target.value)} />
                      </div>
                      <div className="form-group" style={{marginBottom:0,gridColumn:'1/-1'}}>
                        <label className="form-label" style={{fontSize:11}}>Condition</label>
                        <select className="form-input" style={{padding:'6px 10px'}} value={b.condition} onChange={e=>setBattery(i,'condition',e.target.value)}>
                          <option value="good">✅ Good</option>
                          <option value="fair">⚠ Fair</option>
                          <option value="replace">🔴 Replace</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div className="card" style={{marginBottom:24}}>
              <SectionLabel>Spares & Remarks</SectionLabel>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Spares Replaced</label>
                  <textarea className="form-input" rows={3} placeholder="List any parts/spares replaced..." value={form.sparesReplaced} onChange={e=>setF('sparesReplaced',e.target.value)} style={{resize:'vertical'}} />
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks / Observations</label>
                  <textarea className="form-input" rows={3} placeholder="General observations, recommendations..." value={form.remarks} onChange={e=>setF('remarks',e.target.value)} style={{resize:'vertical'}} />
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/maintenance')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner-sm"/> Submitting...</> : '✓ Submit PM Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
