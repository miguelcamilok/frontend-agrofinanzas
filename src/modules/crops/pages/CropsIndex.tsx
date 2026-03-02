import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cropsService } from '../services/cropsService'
import type { Crop } from '../services/cropsService'
import './Crops.css'

export default function CropsIndex() {
    const [crops, setCrops] = useState<Crop[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        cropsService.getCrops()
            .then(data => setCrops(data.crops || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="crops-page"><div className="hato-loading"><i className="fas fa-spinner fa-spin"></i> Cargando...</div></div>

    return (
        <div className="crops-page">
            <div className="crops-header">
                <h1><i className="fas fa-seedling"></i> Mis Cultivos</h1>
            </div>

            <div className="table-responsive">
                <table className="table table-dark table-striped table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cultivo</th>
                            <th>Área (ha)</th>
                            <th>Fecha Siembra</th>
                            <th>Fecha Cosecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crops.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-4">No hay cultivos registrados</td></tr>
                        ) : (
                            crops.map((crop, i) => (
                                <tr key={crop.id}>
                                    <td>{i + 1}</td>
                                    <td>{crop.name}</td>
                                    <td>{crop.area}</td>
                                    <td>{crop.planted_date}</td>
                                    <td>{crop.harvest_date || '—'}</td>
                                    <td>
                                        <span className={`badge bg-${crop.status === 'activo' ? 'success' : crop.status === 'cosechado' ? 'info' : 'secondary'}`}>
                                            {crop.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/crops/${crop.id}`} className="btn btn-sm btn-outline-success">
                                            <i className="fas fa-eye"></i> Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
