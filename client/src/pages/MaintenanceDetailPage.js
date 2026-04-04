import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEIC } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReport = () => {
    API.get(`/maintenance/${id}`)
      .then(r => setReport(r.data.report))
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchReport(); }, [id]);

  const handleApproval = async (status) => {
    setSubmitting(true);
    try {
      await API.put(`/maintenance/${id}/approve`, { status, remarks });
      toast.success(`Report ${status}!`); fetchReport();
    } catch(e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="app-layout"><Sidebar/><div className="main-content"><div className="app-loading"><div className="spinner"/></div></div></div>;
  if (!report) return <div className="app-layout"><Sidebar/><div className="main-content"><div className="page-wrapper"><div className="alert alert-danger">Report not found.</div></div></div></div>;

  const CHECKLIST = [
    ['visualInspection','Visual Inspection'],['cleaningDone','Cleaning Done'],
    ['connectionsTight','Connections Tight'],['batteryCheck','Battery Check'],
    ['fanOperation','Fan Operation'],['bypassTest','Bypass Test'],
    ['earthingCheck','Earthing Check'],['loadTest','Load Test'],
  ];

  return (
    <div className="app-layout">
      <Sidebar/>
      <div className="main-content">
        <Header title={`PM Report: ${report.reportId}`}/>
        <div className="page-wrapper">
          <div className="page-header">
            <div>
              <h1 className="page-title">PM Report Details</h1>
              <p className="page-subtitle"><code style={{background:'var(--bg-elevated)',padding:'2px 8px',borderRadius:4,color:'var(--rinl-gold)'}}>{report.reportId}</code></p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/maintenance')}>← Back</button>
          </div>

          {/* Status */}
          <div className="card" style={{marginBottom:20,padding:'14px 24px'}}>
            <div style={{display:'flex',gap:24,alignItems:'center',flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Approval Status</div>
                <span className={`badge badge-${report.approvalStatus}`} style={{marginTop:4}}>{report.approvalStatus}</span>
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Type</div>
                <div style={{fontSize:14,fontWeight:500,marginTop:4,textTransform:'capitalize'}}>{report.maintenanceType}</div>
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>PM Date</div>
                <div style={{fontSize:14,fontWeight:500,marginTop:4}}>{new Date(report.pmDate).toLocaleDateString('en-IN')}</div>
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Submitted</div>
                <div style={{fontSize:14,fontWeight:500,marginTop:4}}>{new Date(report.createdAt).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20}}>
            <div>
              {/* Details */}
              <div className="card" style={{marginBottom:20}}>
                <h3 style={{fontFamily:'var(--font-heading)',fontSize:16,marginBottom:16,color:'var(--rinl-gold)'}}>🔧 Report Details</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px 24px',fontSize:14}}>
                  {[['ETL UPS Serial',report.etlUpsSn],['Location',report.location],['PM Done By',report.pmDoneBy],['BOQ Item',report.boqItem||'-'],['Ratings',report.ratings||'-'],['Submitted By',report.submittedBy?.name+' ('+report.submittedBy?.employeeId+')']].map(([k,v])=>(
                    <div key={k}><div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{k}</div><div style={{fontWeight:500}}>{v}</div></div>
                  ))}
                </div>
              </div>

              {/* Measurements */}
              <div className="card" style={{marginBottom:20}}>
                <h3 style={{fontFamily:'var(--font-heading)',fontSize:16,marginBottom:16,color:'var(--rinl-gold)'}}>⚡ Measurements</h3>
                <div style={{overflowX:'auto'}}>
                  <table>
                    <thead><tr><th>Parameter</th><th>R Phase</th><th>Y Phase</th><th>B Phase</th></tr></thead>
                    <tbody>
                      {[['AC Input Volts','acInputVolts'],['AC Input Current','acInputCurrent'],['AC Output Volt','acOutputVolt'],['AC Output Current','acOutputCurrent']].map(([label,key])=>(
                        <tr key={key}><td style={{fontWeight:500}}>{label}</td><td>{report.measurements?.[key]?.r||'-'}</td><td>{report.measurements?.[key]?.y||'-'}</td><td>{report.measurements?.[key]?.b||'-'}</td></tr>
                      ))}
                      <tr><td style={{fontWeight:500}}>Input Frequency</td><td colSpan={3}>{report.measurements?.inputFreq||'-'}</td></tr>
                      <tr><td style={{fontWeight:500}}>DC Rectifier</td><td colSpan={3}>{report.measurements?.dcRectifier||'-'}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Battery */}
              {report.batteryData?.length > 0 && (
                <div className="card" style={{marginBottom:20}}>
                  <h3 style={{fontFamily:'var(--font-heading)',fontSize:16,marginBottom:16,color:'var(--rinl-gold)'}}>🔋 Battery Data</h3>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
                    {report.batteryData.map((b,i)=>(
                      <div key={i} style={{background:'var(--bg-input)',border:`1px solid ${b.condition==='replace'?'var(--rinl-red)':b.condition==='fair'?'var(--rinl-gold)':'var(--border)'}`,borderRadius:'var(--radius-md)',padding:14}}>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--rinl-gold)',marginBottom:8}}>{b.bankNo}</div>
                        <div style={{fontSize:13,color:'var(--text-secondary)'}}>Voltage: <span style={{color:'var(--text-primary)'}}>{b.voltage||'-'} V</span></div>
                        <div style={{fontSize:13,color:'var(--text-secondary)'}}>Current: <span style={{color:'var(--text-primary)'}}>{b.current||'-'} A</span></div>
                        <div style={{marginTop:8}}><span className={`badge badge-${b.condition==='good'?'approved':b.condition==='fair'?'pending':'rejected'}`}>{b.condition}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {(report.sparesReplaced || report.remarks) && (
                <div className="card" style={{marginBottom:20}}>
                  <h3 style={{fontFamily:'var(--font-heading)',fontSize:16,marginBottom:16,color:'var(--rinl-gold)'}}>📝 Notes</h3>
                  {report.sparesReplaced && <div><div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',marginBottom:6}}>Spares Replaced</div><p style={{fontSize:14,color:'var(--text-primary)',background:'var(--bg-input)',padding:'10px 14px',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)'}}>{report.sparesReplaced}</p></div>}
                  {report.remarks && <div style={{marginTop:12}}><div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',marginBottom:6}}>Remarks</div><p style={{fontSize:14,color:'var(--text-primary)',background:'var(--bg-input)',padding:'10px 14px',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)'}}>{report.remarks}</p></div>}
                </div>
              )}
            </div>

            <div>
              {/* Checklist */}
              <div className="card" style={{marginBottom:16}}>
                <h3 style={{fontFamily:'var(--font-heading)',fontSize:15,marginBottom:14,color:'var(--rinl-gold)'}}>✅ Checklist</h3>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {CHECKLIST.map(([key,label])=>(
                    <div key={key} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 10px',background:'var(--bg-input)',borderRadius:'var(--radius-sm)',border:`1px solid ${report.checklist?.[key]?'rgba(22,163,74,0.3)':'var(--border)'}`}}>
                      <span style={{fontSize:16}}>{report.checklist?.[key]?'✅':'⬜'}</span>
                      <span style={{fontSize:13,color:report.checklist?.[key]?'var(--text-primary)':'var(--text-muted)'}}>{label}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12,fontSize:12,color:'var(--text-secondary)',textAlign:'center'}}>
                  {Object.values(report.checklist||{}).filter(Boolean).length}/{CHECKLIST.length} completed
                </div>
              </div>

              {/* EIC Approval */}
              {isEIC && report.approvalStatus === 'pending' && (
                <div className="card" style={{borderColor:'rgba(124,58,237,0.4)',background:'rgba(124,58,237,0.04)'}}>
                  <h3 style={{fontFamily:'var(--font-heading)',fontSize:15,marginBottom:12,color:'#a78bfa'}}>🔐 EIC Approval</h3>
                  <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <textarea className="form-input" rows={3} placeholder="Approval remarks..." value={remarks} onChange={e=>setRemarks(e.target.value)} style={{resize:'vertical'}}/>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button className="btn btn-success" onClick={()=>handleApproval('approved')} disabled={submitting}>✓ Approve</button>
                    <button className="btn btn-danger" onClick={()=>handleApproval('rejected')} disabled={submitting}>✗ Reject</button>
                  </div>
                </div>
              )}

              {report.approvedBy && (
                <div className="card" style={{borderColor:'rgba(22,163,74,0.3)',marginTop:12}}>
                  <h3 style={{fontFamily:'var(--font-heading)',fontSize:14,marginBottom:10,color:'#4ade80'}}>✅ Approved By</h3>
                  <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.8}}>
                    <div>By: <span style={{color:'var(--text-primary)'}}>{report.approvedBy.name}</span></div>
                    <div>At: {new Date(report.approvedAt).toLocaleString('en-IN')}</div>
                    {report.approverRemarks && <div style={{marginTop:8,padding:'8px 12px',background:'var(--bg-input)',borderRadius:'var(--radius-sm)',color:'var(--text-primary)'}}>{report.approverRemarks}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
