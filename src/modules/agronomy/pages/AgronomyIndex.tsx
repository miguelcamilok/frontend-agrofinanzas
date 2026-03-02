import { Link } from 'react-router-dom'
import './AgronomyIndex.css'

interface AgronomyCard {
    title: string
    image: string
    route: string
}

const cards: AgronomyCard[] = [
    {
        title: 'Hato Ganadero',
        image: 'https://images.unsplash.com/photo-1593023333594-487b2f7dd415?auto=format&fit=crop&q=80&w=600',
        route: '/hato',
    },
    {
        title: 'Gallinas',
        image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=600',
        route: '/hens',
    },
    {
        title: 'Cultivos',
        image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=600',
        route: '/crops',
    },
    {
        title: 'Aguacate',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600',
        route: '/avocadocrops',
    },
    {
        title: 'Café',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600',
        route: '/coffecrops',
    },
    {
        title: 'Ganadería',
        image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600',
        route: '/cattles',
    },
]

export default function AgronomyIndex() {
    return (
        <main className="Agronomia">
            <div className="header-produccion">
                <h1 className="titulo-principal">PRODUCCIÓN</h1>
                <p className="subtitulo-principal">Explora las diferentes áreas de producción agropecuaria</p>
            </div>

            <div className="Agronomia-container">
                {cards.map((card, i) => (
                    <Link to={card.route} className="card-link" key={i}>
                        <div className="Agronomia-card">
                            <img className="img-card" src={card.image} alt={card.title} />
                            <div className="card-text">{card.title}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    )
}
