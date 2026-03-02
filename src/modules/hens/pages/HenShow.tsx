import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { hensService } from '../services/hensService'
import type { Hen } from '../services/hensService'
import './HensIndex.css'

export default function HenShow() {
    const { id } = useParams<{ id: string }>()
    const [hen, setHen] = useState<Hen | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        hensService.getHen(Number(id))
            .then(data => setHen(data.hen))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="hens-container">
            <div className="main-content-container">
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--accent)' }}>
                    <i className="fas fa-spinner fa-spin fa-3x"></i>
                    <p style={{ marginTop: '20px' }}>Cargando información técnica...</p>
                </div>
            </div>
        </div>
    )

    if (!hen) return (
        <div className="hens-container">
            <div className="main-content-container">
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <i className="fas fa-exclamation-triangle fa-3x" style={{ color: 'var(--warn)', marginBottom: '20px' }}></i>
                    <h3>Registro no encontrado</h3>
                    <p>No se pudo localizar la información de este lote de gallinas.</p>
                    <Link to="/hens" className="tab-btn active" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>
                        Volver al Índice
                    </Link>
                </div>
            </div>
        </div>
    )

    return (
        <div className="hens-container">
            <div className="main-content-container">
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <Link to="/hens" className="tab-btn" style={{ textDecoration: 'none', padding: '10px 15px' }}>
                        <i className="fas fa-arrow-left"></i>
                    </Link>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>Detalle de Lote Técnico</h1>
                </div>

                <div className="content-grid">
                    {/* MAIN INFO */}
                    <div className="main-column">
                        <div className="card">
                            <h3><i className="fas fa-egg"></i> Información del Lote: {hen.breed}</h3>
                            <div className="breed-table-wrapper">
                                <table className="breed-table">
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '250px', color: 'var(--accent)', fontWeight: 'bold' }}>ID Interno</td>
                                            <td>#00{hen.id}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Raza / Línea Genética</td>
                                            <td>{hen.breed}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Población (Aves)</td>
                                            <td>{hen.quantity} aves</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Edad Actual</td>
                                            <td>{hen.age_weeks} semanas</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Propósito Productivo</td>
                                            <td>{hen.purpose}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Producción Diaria</td>
                                            <td>{hen.egg_production} huevos</td>
                                        </tr>
                                        <tr>
                                            <td style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Estado del Lote</td>
                                            <td>
                                                <span className={`kpi-fill`} style={{
                                                    width: 'auto',
                                                    padding: '2px 10px',
                                                    background: hen.status === 'active' ? 'var(--accent)' : 'var(--warn)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {hen.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {hen.notes && (
                            <div className="card">
                                <h3><i className="fas fa-sticky-note"></i> Observaciones Técnicas</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{hen.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR KPI SIMULATED */}
                    <div className="aside-column">
                        <div className="comm-widget">
                            <h3 className="comm-widget__title"><i className="fas fa-chart-line"></i> Eficiencia Estimada</h3>
                            <div className="kpi-list">
                                <div className="kpi-item">
                                    <span className="kpi-label">% Postura (Basado en cantidad)</span>
                                    <div className="kpi-bar">
                                        <div className="kpi-fill" style={{ width: `${Math.min((hen.egg_production / hen.quantity) * 100, 100)}%` }}>
                                            {Math.round((hen.egg_production / hen.quantity) * 100)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="comm-widget">
                            <h3 className="comm-widget__title"><i className="fas fa-info-circle"></i> Ayuda</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Este panel muestra los datos individuales capturados para este lote. Use el botón superior para regresar al índice general de avicultura.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
