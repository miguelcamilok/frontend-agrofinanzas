import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { avocadoService } from '../services/avocadoService'
import type { Avocado } from '../services/avocadoService'
import './Avocado.css'

export default function AvocadoShow() {
    const { id } = useParams<{ id: string }>()
    const [avocado, setAvocado] = useState<Avocado | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        avocadoService.getAvocado(Number(id))
            .then(data => setAvocado(data.avocado))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="avocado-page"><div className="hato-loading"><i className="fas fa-spinner fa-spin"></i> Cargando...</div></div>
    if (!avocado) return <div className="avocado-page"><p className="text-danger">Registro no encontrado</p><Link to="/avocadocrops">Volver</Link></div>

    return (
        <div className="avocado-page">
            <div className="crops-header">
                <h1 style={{ color: '#e0e0e0', margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="fas fa-leaf" style={{ color: '#6b8e23' }}></i> {avocado.variety}
                </h1>
                <Link to="/avocadocrops" className="btn btn-outline-secondary btn-sm"><i className="fas fa-arrow-left"></i> Volver</Link>
            </div>
            <div className="table-responsive" style={{ marginTop: 20 }}>
                <table className="table table-dark table-bordered">
                    <tbody>
                        <tr><th>Variedad</th><td>{avocado.variety}</td></tr>
                        <tr><th>Área (ha)</th><td>{avocado.area}</td></tr>
                        <tr><th>Árboles</th><td>{avocado.trees_count || 'No registrado'}</td></tr>
                        <tr><th>Fecha de siembra</th><td>{avocado.planted_date}</td></tr>
                        <tr><th>Producción (kg)</th><td>{avocado.production_kg || 'No registrado'}</td></tr>
                        <tr><th>Estado</th><td><span className={`badge bg-${avocado.status === 'activo' ? 'success' : 'info'}`}>{avocado.status}</span></td></tr>
                        {avocado.notes && <tr><th>Notas</th><td>{avocado.notes}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
