import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { cropsService } from '../services/cropsService'
import type { Crop } from '../services/cropsService'
import './Crops.css'

export default function CropShow() {
    const { id } = useParams<{ id: string }>()
    const [crop, setCrop] = useState<Crop | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        cropsService.getCrop(Number(id))
            .then(data => setCrop(data.crop))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="crops-page"><div className="hato-loading"><i className="fas fa-spinner fa-spin"></i> Cargando...</div></div>
    if (!crop) return <div className="crops-page"><p className="text-danger">Cultivo no encontrado</p><Link to="/crops">Volver</Link></div>

    return (
        <div className="crops-page">
            <div className="crops-header">
                <h1><i className="fas fa-seedling"></i> {crop.name}</h1>
                <Link to="/crops" className="btn btn-outline-secondary btn-sm"><i className="fas fa-arrow-left"></i> Volver</Link>
            </div>
            <div className="table-responsive">
                <table className="table table-dark table-bordered">
                    <tbody>
                        <tr><th>Cultivo</th><td>{crop.name}</td></tr>
                        <tr><th>Área (ha)</th><td>{crop.area}</td></tr>
                        <tr><th>Fecha de siembra</th><td>{crop.planted_date}</td></tr>
                        <tr><th>Fecha de cosecha</th><td>{crop.harvest_date || 'Pendiente'}</td></tr>
                        <tr><th>Rendimiento</th><td>{crop.yield_amount || 'No registrado'}</td></tr>
                        <tr><th>Estado</th><td><span className={`badge bg-${crop.status === 'activo' ? 'success' : 'info'}`}>{crop.status}</span></td></tr>
                        {crop.notes && <tr><th>Notas</th><td>{crop.notes}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
