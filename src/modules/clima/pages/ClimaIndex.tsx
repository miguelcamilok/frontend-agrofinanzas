import { useState, useEffect } from 'react'
import { climaService } from '../services/climaService'
import type { WeatherData } from '../services/climaService'
import './ClimaIndex.css'

export default function ClimaIndex() {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        climaService.getWeather()
            .then(data => setWeather(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    const getWeatherIcon = (desc: string): string => {
        const d = desc.toLowerCase()
        if (d.includes('clear') || d.includes('sun') || d.includes('despejado')) return 'fa-sun'
        if (d.includes('rain') || d.includes('lluvia') || d.includes('drizzle')) return 'fa-cloud-showers-heavy'
        if (d.includes('cloud') || d.includes('nub')) return 'fa-cloud'
        if (d.includes('storm') || d.includes('tormenta')) return 'fa-bolt'
        if (d.includes('snow') || d.includes('nieve')) return 'fa-snowflake'
        if (d.includes('fog') || d.includes('niebla')) return 'fa-smog'
        return 'fa-cloud-sun'
    }

    if (loading) return <div className="clima-page"><div className="hato-loading"><i className="fas fa-spinner fa-spin"></i> Cargando clima...</div></div>
    if (error || !weather) return <div className="clima-page"><div className="hato-alert error"><i className="fas fa-exclamation-circle"></i> Error al cargar datos del clima</div></div>

    return (
        <div className="clima-page">
            <div className="clima-card">
                <i className={`fas ${getWeatherIcon(weather.description)} clima-icon`}></i>
                <h1 className="clima-city">{weather.city || 'Bogotá, Colombia'}</h1>
                <p className="clima-desc">{weather.description}</p>
                <div className="clima-temp">
                    {Math.round(weather.temperature)}<sup>°C</sup>
                </div>
                <div className="clima-details">
                    <div className="clima-detail">
                        <i className="fas fa-droplet"></i>
                        <span className="clima-detail-label">Humedad</span>
                        <span className="clima-detail-value">{weather.humidity}%</span>
                    </div>
                    <div className="clima-detail">
                        <i className="fas fa-wind"></i>
                        <span className="clima-detail-label">Viento</span>
                        <span className="clima-detail-value">{weather.wind_speed} m/s</span>
                    </div>
                    <div className="clima-detail">
                        <i className="fas fa-temperature-half"></i>
                        <span className="clima-detail-label">Sensación</span>
                        <span className="clima-detail-value">{weather.feels_like ? `${Math.round(weather.feels_like)}°C` : '—'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
