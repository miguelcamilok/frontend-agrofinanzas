import { useState, useEffect } from 'react'
import './Cattles.css'

/* ═══════════════════════════════════════════════════════════════
   TIPOS
═══════════════════════════════════════════════════════════════ */
interface CattleTopic {
    id: string; title: string; category: string
    shortDesc: string; fullDesc: string; image: string
    stats: { label: string; value: string }[]; tags: string[]
}

/* ═══════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════ */
const MAIN_TABS = [
    { key: 'razas',         label: 'Razas',            icon: 'fa-paw' },
    { key: 'ciclo',         label: 'Ciclo Productivo',  icon: 'fa-route' },
    { key: 'alimentacion',  label: 'Alimentación',      icon: 'fa-leaf' },
    { key: 'sanidad',       label: 'Sanidad',           icon: 'fa-syringe' },
    { key: 'instalaciones', label: 'Instalaciones',     icon: 'fa-warehouse' },
    { key: 'economia',      label: 'Economía',          icon: 'fa-coins' },
]

/* ═══════════════════════════════════════════════════════════════
   DATA — RAZAS
═══════════════════════════════════════════════════════════════ */
const BREEDS: CattleTopic[] = [
    {
        id: 'angus', title: 'Angus', category: 'Carne Premium',
        shortDesc: 'Raza escocesa líder en calidad de carne. Excelente marmoleo, precocidad y adaptación a ladera. Base de los programas de carne certificada más importantes del mundo.',
        fullDesc: 'La raza Angus, originaria de Escocia, es reconocida mundialmente por la calidad superior de su carne. Su marmoleo (grasa intramuscular distribuida uniformemente) le otorga sabor, jugosidad y terneza únicos. Es la base de programas como Certified Angus Beef® en EE.UU. En Colombia se adapta bien a zonas de ladera entre 800 y 2.200 msnm. Ideal para cruzamientos con razas criollas para obtener heterosis en carne. Los machos adultos pueden superar los 900 kg con dietas intensivas.',
        image: 'https://asoangusbrangus.org.co/images/razas/raza_angus.jpg',
        stats: [{ label: 'Tipo', value: 'Cárnico' }, { label: 'Marmoleo', value: 'Excelente' }, { label: 'Peso Macho', value: '700–900 kg' }],
        tags: ['Escocia', 'Precocidad', 'Fertilidad', 'Sin Cuernos', 'Marmoleo', 'Ladera', 'Cruzamiento']
    },
    {
        id: 'holstein', title: 'Holstein', category: 'Alta Leche',
        shortDesc: 'La raza lechera por excelencia. Produce hasta 45 L/día con manejo nutricional riguroso. Base de la industria láctea formal en altiplanos colombianos.',
        fullDesc: 'La Holstein (Frisona) es la raza lechera más productiva del mundo, originaria de los Países Bajos. Requiere un nivel alto de manejo: alimentación balanceada, control de temperatura, sanidad estricta y confort en instalaciones para expresar su genética. En Colombia se adapta bien a altitudes superiores a 1.800 msnm. Sus manchas negras y blancas características son resultado de siglos de selección. Con genética de alto nivel y buenas prácticas, las mejores vacas superan los 40 L/día durante la lactancia pico.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Koe_zijaanzicht_2.JPG',
        stats: [{ label: 'Tipo', value: 'Lechero' }, { label: 'Leche/día', value: '25–45 L' }, { label: 'Altitud', value: '>1.800 msnm' }],
        tags: ['Holanda', 'Volumen', 'Trópico Alto', 'Especializada', 'Holstein-Friesian', 'Altiplano']
    },
    {
        id: 'brahman', title: 'Brahman (Cebú)', category: 'Trópico Bajo',
        shortDesc: 'El rey del trópico colombiano. Resistencia al calor, garrapatas y enfermedades. Base indispensable para la ganadería extensiva en Llanos y Costa Atlántica.',
        fullDesc: 'El Brahman (Bos indicus) es indispensable en el trópico bajo colombiano, especialmente en los Llanos Orientales y la Costa Atlántica. Su giba, orejas largas y piel oscura y pigmentada son adaptaciones al calor extremo. Produce enzimas específicas para digerir forrajes tropicales fibrosos. Excelente en cruzamientos F1 con razas europeas (Angus, Simmental) para obtener heterosis tanto en carne como en leche. Longevo y fértil bajo condiciones difíciles.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv3lIeK4cZ4g7u_3WHY4cRiyGjWIKeW4ammQ&s',
        stats: [{ label: 'Tipo', value: 'Doble Propósito' }, { label: 'Clima', value: '< 1.000 msnm' }, { label: 'Resistencia', value: 'Muy Alta' }],
        tags: ['Giba', 'Rusticidad', 'Cruzamiento', 'Longevidad', 'Garrapatas', 'Llanos', 'F1']
    },
    {
        id: 'simmental', title: 'Simmental', category: 'Doble Propósito',
        shortDesc: 'Uno de los bovinos más versátiles del mundo. Excelente GDP y producción láctea aceptable. Muy popular en sistemas semi-intensivos de ladera colombiana.',
        fullDesc: 'El Simmental, originario de Suiza, combina alta ganancia de peso diaria (>1.2 kg/día en confinamiento) con producción de leche aceptable para doble propósito (12–18 L/día). Su temperamento tranquilo facilita el manejo. Se adapta bien a zonas templadas entre 800 y 2.200 msnm. Es la base de muchos programas de cruzamiento en el Eje Cafetero y los Santanderes. Los toros Simmental son muy apreciados en Colombia para cruzamientos con vacas cebú.',
        image: 'https://zoovetesmipasion.com/wp-content/uploads/2021/07/Simmental-1024x681.webp',
        stats: [{ label: 'Tipo', value: 'Doble Propósito' }, { label: 'GDP', value: '>1.2 kg/día' }, { label: 'Leche', value: '12–18 L/día' }],
        tags: ['Suiza', 'Versátil', 'Ladera', 'Semi-intensivo', 'Crecimiento Rápido', 'Eje Cafetero']
    },
    {
        id: 'gyr', title: 'Gyr Lechero', category: 'Leche Tropical',
        shortDesc: 'Mayor producción láctea del grupo Cebú. Base del programa ProLEche y de los cruces F1 con Holstein para lechería tropical eficiente.',
        fullDesc: 'El Gyr Lechero (Gir) es una selección dentro de la raza Gir brasileña enfocada en producción de leche en el trópico. Puede producir 10–18 L/día sin el nivel de manejo que exige la Holstein, y con mucha mayor resistencia al calor y parásitos. Es la base para producir vacas F1 Holstein×Gyr, que en Colombia alcanzan 20–28 L/día con mucho mejor adaptación que la Holstein pura en pisos térmicos cálidos.',
        image: 'https://genexcolombia.com/wp-content/uploads/2017/04/GYR-SANSAO-CLON.jpg',
        stats: [{ label: 'Tipo', value: 'Lechero Tropical' }, { label: 'Leche/día', value: '10–18 L' }, { label: 'Clima', value: '< 1.200 msnm' }],
        tags: ['Brasil', 'Gir/Gyr', 'F1 Holstein', 'Calor', 'ProLEche', 'Eficiencia']
    },
    {
        id: 'f1', title: 'Cruces Comerciales F1', category: 'Cruzamiento Industrial',
        shortDesc: 'Máxima expresión de la heterosis: F1 Angus×Brahman, Simmental×Cebú. Los sistemas de ceba más rentables en trópico colombiano cuando se usan buenos reproductores.',
        fullDesc: 'El cruzamiento industrial busca la heterosis (vigor híbrido), que puede representar 10–25% más de producción vs. razas puras. El F1 Angus×Brahman combina calidad de carne Angus con rusticidad Cebú. El F1 Simmental×Cebú entrega mayor GDP y mejor conformación cárnica. En sistemas de ceba semi-intensiva tropical son los animales más rentables por su conversión alimenticia y velocidad de crecimiento. Exigen machos de alto valor genético comprobado.',
        image: 'https://a.storyblok.com/f/160385/271b3c0af3/angusxbrahman-brangus.jpg/m/filters:quality(70)/',
        stats: [{ label: 'Heterosis', value: '10–25%' }, { label: 'GDP', value: '>1.0 kg/día' }, { label: 'Sistema', value: 'Trópico' }],
        tags: ['F1', 'Heterosis', 'Ceba', 'Angus×Cebú', 'Simmental×Cebú', 'Rentabilidad']
    },
]

/* ═══════════════════════════════════════════════════════════════
   DATA — ALIMENTACIÓN
═══════════════════════════════════════════════════════════════ */
const FEEDING: CattleTopic[] = [
    {
        id: 'extensivo', title: 'Pastoreo Extensivo', category: 'Bajo Insumo',
        shortDesc: 'Animales en grandes áreas sin división. Bajo costo operativo pero limitada carga animal y GDP. Sistema tradicional de los Llanos Orientales y Costa Atlántica.',
        fullDesc: 'El pastoreo extensivo es el sistema más común en Colombia, especialmente en los Llanos Orientales. Los animales forrajean libremente en potreros sin división de cercas eléctricas. La baja inversión contrasta con productividad por área reducida y tiempos de ceba de 24–36 meses. La carga animal raramente supera 1 UA/ha y la GDP está entre 0.3–0.5 kg/día. Para ser viable económicamente requiere grandes extensiones y precios favorables en el mercado.',
        image: 'https://www.uoc.edu/content/dam/news/images/noticies/2023/200-la-tecnologia-dona-pas-al-pasturatge-digital.jpg',
        stats: [{ label: 'Carga/ha', value: '0.5–1 UA' }, { label: 'GDP', value: '0.3–0.5 kg' }, { label: 'Inversión', value: 'Baja' }],
        tags: ['Tradición', 'Grandes áreas', 'Llanos', 'Bajo costo', 'Extensión']
    },
    {
        id: 'rotacional', title: 'Pastoreo Rotacional Voisin', category: 'Alta Eficiencia',
        shortDesc: 'División de potreros con cercas eléctricas. Duplica o triplica la carga animal respetando el tiempo de descanso óptimo del pasto según las 4 leyes de Voisin.',
        fullDesc: 'Basado en las 4 leyes de André Voisin, divide la finca en potreros de 0.5–2 ha con cercas eléctricas de bajo costo. El tiempo de descanso del pasto (28–42 días en trópico) garantiza rebrota vigorosa y mayor valor nutritivo. La carga puede alcanzar 2–5 UA/ha y la GDP mejora notablemente. Este sistema es la base de la ganadería de precisión colombiana y puede implementarse en cualquier clima con las especies forrajeras adecuadas.',
        image: 'https://infopastosyforrajes.com/wp-content/uploads/2020/04/Sistemas-de-Pastoreo-2.jpg',
        stats: [{ label: 'Carga/ha', value: '2–5 UA' }, { label: 'GDP', value: '0.6–0.9 kg' }, { label: 'ROI', value: 'Alto' }],
        tags: ['Voisin', 'Cercas Eléctricas', 'Rebrota', 'Eficiencia', 'Rotación', '4 Leyes']
    },
    {
        id: 'feedlot', title: 'Confinamiento / Feedlot', category: 'Intensivo',
        shortDesc: 'Corrales con dieta de alta energía formulada. La GDP más alta posible: 1.2–1.8 kg/día. Finalización en 90–120 días. Alto conocimiento nutricional requerido.',
        fullDesc: 'Los animales se mantienen en corrales y reciben dietas balanceadas ricas en maíz, melaza, torta de soya y fibra de calidad. Es el sistema más rápido: GDP de 1.2–1.8 kg/día con conversión de 5–7 kg alimento/kg carne. Exige formulación de dietas precisa, manejo sanitario intensivo y control de costos riguroso. Rentable cuando el diferencial precio concentrado/precio novillo es favorable. Ideal para finalización de machos F1 en Colombia.',
        image: 'https://a.storyblok.com/f/160385/a33fe0d0ac/aumentar-espacio-vital-ganado-esta-confinamiento.jpg',
        stats: [{ label: 'GDP', value: '1.2–1.8 kg' }, { label: 'Conversión', value: '5–7 kg/kg' }, { label: 'Ceba', value: '90–120 días' }],
        tags: ['Corrales', 'Maíz', 'Alta Energía', 'Ceba Rápida', 'Control Total', 'F1']
    },
    {
        id: 'ssp', title: 'Sistema Silvopastoril (SSP)', category: 'Sostenible',
        shortDesc: 'Árboles, arbustos forrajeros y pasturas integradas. Bienestar animal, secuestro de carbono y 20–30% más de leche/ha según CIPAV. El futuro de la ganadería colombiana.',
        fullDesc: 'Los SSP integran árboles maderables o multipropósito (leucaena, matarratón, guácimo, teca) con pasturas mejoradas y animales. La sombra reduce el estrés calórico en 6–8°C, la leucaena aporta proteína de hasta 22% en materia seca y la biodiversidad mejora la resiliencia. El CIPAV ha documentado aumentos de 20–30% en producción láctea y mejoras en GDP en fincas SSP bien establecidas. Además permite acceso a pagos por servicios ambientales (carbono) en Colombia.',
        image: 'https://www.cipav.org.co/wp-content/uploads/2019/05/sistema-silvopastoril.jpg',
        stats: [{ label: 'Proteína', value: 'Hasta 22% MS' }, { label: 'Carga/ha', value: '1.5–3 UA' }, { label: 'CO₂', value: 'Secuestro activo' }],
        tags: ['Leucaena', 'Sostenible', 'CIPAV', 'Bienestar', 'Carbono', 'Diversidad', 'PSA']
    },
]

/* ═══════════════════════════════════════════════════════════════
   DATA — PRÁCTICAS
═══════════════════════════════════════════════════════════════ */
const PRACTICES: Record<string, CattleTopic> = {
    nutricion: {
        id: 'nutricion', title: 'Manejo Nutricional', category: 'Nutrición',
        shortDesc: 'Dietas por etapa productiva: energía, proteína degradable e indegradable, macro y microminerales.',
        fullDesc: 'La nutrición bovina debe contemplar energía (Mcal ENm y ENg), proteína degradable en rumen (PDR) e indegradable (PNDR), minerales macro (Ca, P, Mg, S) y microminerales (Cu, Zn, Se, Co). En pastoreo, el uso estratégico de sales mineralizadas, melaza-urea (80:20) y suplementos proteicos en época seca evita caídas del 40% en GDP. El análisis bromatológico de forrajes disponibles cada 6 meses es el punto de partida para cualquier dieta. No suministrar más del 1% del PV en urea al día.',
        image: 'https://desarrollorural.yucatan.gob.mx/files-content/galerias/5e35b133328bb9efa0466a7ee62e7606.jpg',
        stats: [{ label: 'Proteína req.', value: '12–16% MS' }, { label: 'Agua/día', value: '30–60 L' }, { label: 'Minerales', value: 'Macro + Micro' }],
        tags: ['PDR', 'PNDR', 'Energía', 'Minerales', 'Urea', 'Época Seca', 'Bromatología']
    },
    sanidad: {
        id: 'sanidad', title: 'Control Sanitario Integral', category: 'Salud Animal',
        shortDesc: 'Vacunación obligatoria ICA, desparasitación estratégica por FAMACHA y bioseguridad para un hato sano y rentable.',
        fullDesc: 'El calendario sanitario en Colombia incluye vacunación obligatoria contra Fiebre Aftosa (2 ciclos anuales) y Brucelosis (novillas). Adicionalmente: IBR, DVB, Leptospirosis, Carbón sintomático y Clostridiosis. Control de parásitos externos mediante rotación de acaricidas por grupo químico (piretroides, organofosforados, amidinas, macrólidos) para evitar resistencias. FAMACHA para control de Haemonchus contortus en individuos. SINIGAN actualizado es obligatorio para vender en subastas.',
        image: 'https://img.lalr.co/cms/2020/04/13165837/Eco_vacunacionAftosa_AGRO.jpg?r=4_3',
        stats: [{ label: 'Cobertura', value: '100% hato' }, { label: 'Mortalidad', value: '< 2%' }, { label: 'Aftosa', value: '2× año' }],
        tags: ['Aftosa', 'Brucelosis', 'ICA', 'FAMACHA', 'SINIGAN', 'Garrapatas', 'Bioseguridad']
    },
    bienestar: {
        id: 'bienestar', title: 'Bienestar Animal Bovino', category: 'Bienestar',
        shortDesc: 'Las 5 Libertades aplicadas al bovino. El estrés en el manejo reduce hasta 15% la GDP y eleva cortisol afectando calidad de carne.',
        fullDesc: 'El bienestar animal bovino se basa en las 5 Libertades (Farm Animal Welfare Council): libre de hambre/sed, de incomodidad, de dolor/enfermedad, de miedo/angustia y de expresar comportamiento natural. Aplicando los principios de Temple Grandin en el diseño de instalaciones (mangas curvas, piso antideslizante, sin sombras ni brillos) se reducen los tiempos de manejo y el estrés. Un animal tranquilo convierte mejor el alimento y produce carne de mayor calidad (pH correcto, sin DFD).',
        image: 'https://images.unsplash.com/photo-1547496613-4e193f0b830d?auto=format&fit=crop&q=80&w=800',
        stats: [{ label: 'Impacto GDP', value: '+10–15%' }, { label: 'Sombra', value: '4–6 m²/animal' }, { label: 'Agua', value: 'Ad libitum' }],
        tags: ['5 Libertades', 'Grandin', 'Sombra', 'Agua', 'DFD', 'Cortisol', 'Trato Ético']
    }
}

/* ═══════════════════════════════════════════════════════════════
   HERO IMAGES
═══════════════════════════════════════════════════════════════ */
const HERO_IMAGES = [
    "https://aurocha.com/wp-content/uploads/2021/12/vacas-angus-aberdeen-scaled.jpg",
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=80",
    "https://i.pinimg.com/736x/3d/3a/6e/3d3a6e311ff5e5285a84de5dc938cc42.jpg",
    "https://montanaweb-bucket.s3.amazonaws.com/web/blog/1/produccion-de-terneros.png",
]

/* ═══════════════════════════════════════════════════════════════
   NOTICIAS — 6 cards (2 filas × 3 columnas)
═══════════════════════════════════════════════════════════════ */
const NEWS = [
    {
        img: 'https://www.asoregan.co/wp-content/uploads/2024/09/Claves-para-la-Compra-Rentable-de-Ganado.jpg',
        badge: 'badge-market', bl: 'Mercado',
        h: 'Precios de subasta — referencia semanal',
        p: 'Los novillos F1 Angus×Cebú de 480 kg lideran la demanda esta semana. FEDEGÁN reporta estabilidad en precios del Magdalena Medio y los Llanos.'
    },
    {
        img: 'https://img.lalr.co/cms/2020/04/13165837/Eco_vacunacionAftosa_AGRO.jpg?r=4_3',
        badge: 'badge-health', bl: 'Sanidad',
        h: 'Primer ciclo de Aftosa 2025 abierto',
        p: 'El ICA activa el primer ciclo de vacunación contra fiebre aftosa. Todos los predios deben registrar cobertura en AgroNet antes del cierre del ciclo.'
    },
    {
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd4Ez5yfKD6A81dZd55Q1Cx2s1bi16_v30ug&s',
        badge: 'badge-tech', bl: 'Innovación',
        h: 'RFID bovino: trazabilidad individual en tiempo real',
        p: 'Los crotales RFID permiten registrar GDP individual, historial sanitario y trazabilidad completa. Requisito para frigoríficos de exportación y programas de carne premium.'
    },
    {
        img: 'https://asocarbono.org/wp-content/uploads/2024/02/impuesto-al-carbono-asocarbono.webp',
        badge: 'badge-eco', bl: 'Sostenibilidad',
        h: 'SSP con pago por carbono en Colombia',
        p: 'Fincas ganaderas con SSP certificados acceden a créditos de carbono. El CIPAV reporta que 12.000 ha ya están en proceso de certificación en el país.'
    },
    {
        img: 'https://infopastosyforrajes.com/wp-content/uploads/2020/04/Sistemas-de-Pastoreo-2.jpg',
        badge: 'badge-market', bl: 'Nutrición',
        h: 'Leucaena: la leguminosa que transforma la ganadería tropical',
        p: 'Estudios del CIAT confirman que integrar leucaena al sistema silvopastoril eleva la producción de leche hasta un 30% y reduce la emisión de metano por animal en pastoreo.'
    },
    {
        img: 'https://desarrollorural.yucatan.gob.mx/files-content/galerias/5e35b133328bb9efa0466a7ee62e7606.jpg',
        badge: 'badge-tech', bl: 'Genética',
        h: 'Semen sexado: más hembras de reemplazo en el hato',
        p: 'El uso de semen sexado en novillas de primer servicio reduce costos de reposición y acelera el mejoramiento genético. Disponible en centros de inseminación certificados en Colombia.'
    },
]

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function CattlesIndex() {
    const [activeTab, setActiveTab]         = useState('razas')
    const [selectedTopic, setSelectedTopic] = useState<CattleTopic | null>(null)
    const [heroIndex, setHeroIndex]         = useState(0)
    const [showScroll, setShowScroll]       = useState(false)

    useEffect(() => {
        const iv = setInterval(() => setHeroIndex(p => (p + 1) % HERO_IMAGES.length), 5500)
        return () => clearInterval(iv)
    }, [])

    useEffect(() => {
        const io = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
            { threshold: 0.07 }
        )
        document.querySelectorAll('.fade-up').forEach(el => io.observe(el))
        return () => io.disconnect()
    }, [activeTab])

    useEffect(() => {
        const onScroll = () => setShowScroll(window.scrollY > 400)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedTopic(null) }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    const SubLabel = ({ text }: { text: string }) => (
        <div className="cv-sublabel">
            <span className="cv-sublabel__text">{text}</span>
            <span className="cv-sublabel__line" />
        </div>
    )

    return (
        <div className="cattle-page">

            {/* ════ SCROLL TOP ════ */}
            {showScroll && (
                <button className="cv-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <i className="fas fa-arrow-up" />
                </button>
            )}

            {/* ════ HERO ════ */}
            <section className="cattle-hero">
                <div className="cattle-hero-text">
                    <div className="hero-eyebrow">
                        <i className="fas fa-cow" /> AgroFinanzas · Módulo Bovino
                    </div>
                    <h1>Producción<br /><em>Ganadera</em></h1>
                    <p>
                        Gestión integral del ganado bovino — genética, nutrición, sanidad e instalaciones
                        bajo un enfoque técnico, sostenible y rentable para el campo colombiano.
                    </p>

                    <div className="hero-stats-row">
                        {[
                            { num: '27M',  lbl: 'Cabezas Colombia' },
                            { num: '1.8kg', lbl: 'GDP máx. feedlot' },
                            { num: '45L',  lbl: 'Leche/día Holstein' },
                            { num: '5 UA', lbl: 'Carga SSP/ha' },
                        ].map(s => (
                            <div className="hero-stat-item" key={s.lbl}>
                                <span className="hero-stat-item__num">{s.num}</span>
                                <span className="hero-stat-item__lbl">{s.lbl}</span>
                            </div>
                        ))}
                    </div>

                    <div className="hero-actions">
                        <button className="btn-cattle btn-cattle-primary" onClick={() => setActiveTab('razas')}>
                            <i className="fas fa-paw" /> Razas bovinas
                        </button>
                        <button className="btn-cattle btn-cattle-outline" onClick={() => setActiveTab('ciclo')}>
                            <i className="fas fa-route" /> Ciclo productivo
                        </button>
                    </div>
                </div>

                <div className="cattle-hero-carousel">
                    <img key={heroIndex} src={HERO_IMAGES[heroIndex]} alt="Ganadería bovina"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/1200x820/0f1209/78bf50?text=Ganadería' }} />
                    <div className="carousel-indicators">
                        {HERO_IMAGES.map((_, i) => (
                            <button key={i} className={i === heroIndex ? 'active' : ''} onClick={() => setHeroIndex(i)} />
                        ))}
                    </div>
                </div>
            </section>

            <hr className="cattle-divider" />

            {/* ════ SECCIÓN PRINCIPAL CON TABS ════ */}
            <section className="cattle-section">
                <div className="container">

                    <nav className="cv-tabs-nav">
                        {MAIN_TABS.map(t => (
                            <button key={t.key}
                                className={`cv-tab-btn ${activeTab === t.key ? 'is-active' : ''}`}
                                onClick={() => setActiveTab(t.key)}>
                                <i className={`fas ${t.icon}`} />
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* ══ RAZAS ══ */}
                    {activeTab === 'razas' && (<>
                        <span className="section-eyebrow">Genética Bovina</span>
                        <h2 className="section-heading">Razas <em>Bovinas</em></h2>
                        <p className="section-sub">Elige la raza según tu objetivo productivo, altitud y sistema de manejo. La decisión genética es la más importante a largo plazo.</p>

                        <div className="cattle-cards-grid" style={{ marginTop: 36 }}>
                            {BREEDS.map(b => (
                                <div className="cattle-card-pro fade-up" key={b.id} onClick={() => setSelectedTopic(b)}>
                                    <div className="cattle-card-pro__accent-bar" />
                                    <div className="card-img-wrap">
                                        <img src={b.image} alt={b.title}
                                            onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x214/1f2a14/78bf50?text=${b.title}` }} />
                                        <span className="card-badge">{b.category}</span>
                                    </div>
                                    <div className="card-body-pro">
                                        <h5>{b.title}</h5>
                                        <p>{b.shortDesc}</p>
                                        <div className="card-stats">
                                            {b.stats.slice(0, 2).map((s, i) => (
                                                <div className="card-stat" key={i}><span>{s.label}</span><span>{s.value}</span></div>
                                            ))}
                                        </div>
                                        <button className="card-open-btn">Ver detalles técnicos <i className="fas fa-arrow-right" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <SubLabel text="Comparativa técnica de razas" />
                        <div className="cv-table-wrap fade-up">
                            <table className="cv-table">
                                <thead>
                                    <tr><th>Raza</th><th>Objetivo</th><th>GDP (kg/día)</th><th>Leche (L/día)</th><th>Altitud</th><th>Resistencia</th></tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Angus',        'Cárnico',          '1.0–1.4', '—',       'Templado 800–2.200m', <span className="cv-badge cv-badge--moss">Media</span>],
                                        ['Holstein',     'Lechero',          '0.6–0.9', '25–45',   '>1.800 msnm',         <span className="cv-badge cv-badge--sienna">Baja</span>],
                                        ['Brahman',      'Doble propósito',  '0.5–0.8', '4–7',     '<1.000 msnm',         <span className="cv-badge cv-badge--moss">Muy Alta</span>],
                                        ['Simmental',    'Doble propósito',  '1.0–1.3', '12–18',   '800–2.200 msnm',      <span className="cv-badge cv-badge--moss">Media–Alta</span>],
                                        ['Gyr Lechero',  'Lechero tropical', '0.5–0.7', '10–18',   '<1.200 msnm',         <span className="cv-badge cv-badge--moss">Alta</span>],
                                        ['F1 Comercial', 'Cruzamiento',      '0.9–1.5', 'Variable', 'Trópico',             <span className="cv-badge cv-badge--moss">Alta</span>],
                                    ].map(([name, type, gdp, milk, alt, res], i) => (
                                        <tr key={i}>
                                            <td><strong style={{ color: 'var(--cv-cream)' }}>{name}</strong></td>
                                            <td style={{ color: 'var(--cv-mist)' }}>{type}</td>
                                            <td style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', color: 'var(--cv-moss-lit)' }}>{gdp}</td>
                                            <td style={{ fontFamily: 'var(--mono)', fontSize: '.8rem' }}>{milk}</td>
                                            <td style={{ fontSize: '.8rem', color: 'var(--cv-mist)' }}>{alt}</td>
                                            <td>{res}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="reference-panel fade-up">
                            <h4>Criterios de Selección Racial</h4>
                            <p>La selección de razas bovinas debe basarse en datos objetivos, no en tendencias de mercado ni disponibilidad local. Una elección equivocada puede comprometer la rentabilidad durante años. Evalúa siempre estos factores antes de decidir:</p>
                            <ul className="reference-list">
                                <li><strong>Objetivo productivo:</strong> define primero si es carne, leche o doble propósito. Todo lo demás se deriva de esto.</li>
                                <li><strong>Altitud y clima:</strong> determinan qué razas pueden expresar su potencial genético. Una Holstein en trópico bajo fracasará.</li>
                                <li><strong>Sistema de manejo:</strong> intensivo (feedlot), semi-intensivo (rotacional) o extensivo. La raza debe adaptarse al sistema, no al revés.</li>
                                <li><strong>Genética verificada:</strong> exige DEPs/EPDs actualizados y registros de producción de las asociaciones (Asocebu, Asoangusbrangus, etc.).</li>
                            </ul>
                        </div>
                    </>)}

                    {/* ══ CICLO ══ */}
                    {activeTab === 'ciclo' && (<>
                        <span className="section-eyebrow">Ciclo Productivo</span>
                        <h2 className="section-heading">Del Nacimiento<br /><em>al Mercado</em></h2>
                        <p className="section-sub">Cada etapa exige un manejo específico. Optimizar la transición entre fases define la rentabilidad final del sistema bovino.</p>

                        <div className="cycle-layout" style={{ marginTop: 36 }}>
                            <div>
                                <ul className="timeline-clean">
                                    {[
                                        { icon: 'fa-star',       h: 'Nacimiento & Calostrado (0–6 h)',   p: 'Crítico. El ternero debe ingerir ≥10% de su peso en calostro en las primeras 6 horas. La inmunidad pasiva (IgG) se absorbe casi exclusivamente en este período. Mortalidad neonatal baja de 8% a <2% con buen calostrado.' },
                                        { icon: 'fa-seedling',   h: 'Crianza (0–3 meses)',               p: 'Desarrollo del rumen y sistema inmune. Leche o lactorreemplazante de calidad, introducción temprana de heno y concentrado de inicio desde la semana 2. Peso al destete debe ser mínimo 2.5× peso al nacer.' },
                                        { icon: 'fa-cut',        h: 'Destete (3–6 meses)',               p: 'Transición a dieta sólida. Destete temprano (60–70 días) en vacas con baja CC permite retorno más rápido al celo. Suplementar minerales en el peridestete. GDP objetivo post-destete: 0.5 kg/día mínimo.' },
                                        { icon: 'fa-chart-line', h: 'Levante / Recría (6–18 meses)',     p: 'Mayor crecimiento óseo y muscular. GDP objetivo: 0.6–0.9 kg/día. Define el frame y potencial productivo futuro. Para novillas de reemplazo: llegar al 65% del peso adulto al primer servicio (14–16 meses).' },
                                        { icon: 'fa-weight',     h: 'Ceba / Engorde (18–30 meses)',      p: 'Optimización GDP y conversión alimenticia. Peso de venta en Colombia: 450–500 kg en novillos cebú cruzado. Feedlot puede finalizar en 90–120 días desde levante con dieta de alta energía.' },
                                        { icon: 'fa-store',      h: 'Comercialización',                  p: 'Trazabilidad completa (SINIGAN), guía sanitaria ICA, transporte en vehículos certificados. FEDEGÁN publica precios de referencia semanales. El peso en pie, la conformación y la raza determinan el precio.' },
                                    ].map((s, i) => (
                                        <li key={i}>
                                            <div className="tl-dot-c"><i className={`fas ${s.icon}`} /></div>
                                            <div className="tl-body-c"><strong>{s.h}</strong><p>{s.p}</p></div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="video-embed" style={{ marginTop: 28 }}>
                                    <iframe src="https://www.youtube.com/embed/0b5iyRCG3P0" title="Ciclo Ganadero" allowFullScreen />
                                </div>
                            </div>

                            <div>
                                <div className="process-img-c" style={{ height: 260 }}>
                                    <img src="https://desarrollorural.yucatan.gob.mx/files-content/galerias/5e35b133328bb9efa0466a7ee62e7606.jpg" alt="Manejo ganadero" />
                                </div>

                                <SubLabel text="KPIs del hato" />
                                <div className="cv-kpi-list fade-up">
                                    {[
                                        { lbl: 'Tasa de natalidad ideal',   val: '>85%',      w: '85%', t: '' },
                                        { lbl: 'Intervalo entre partos',    val: '<13 meses', w: '75%', t: '' },
                                        { lbl: 'GDP ceba intensiva',        val: '1.5 kg/día',w: '80%', t: '' },
                                        { lbl: 'Condición corporal parto',  val: 'CC 3.0–3.5',w: '70%', t: '' },
                                        { lbl: 'Mortalidad máx. tolerable', val: '<2%',       w: '5%',  t: '--warn' },
                                    ].map(k => (
                                        <div key={k.lbl}>
                                            <span className="cv-kpi-label">{k.lbl}</span>
                                            <div className="cv-kpi-bar">
                                                <div className={`cv-kpi-fill${k.t ? ' cv-kpi-fill' + k.t : ''}`} style={{ width: k.w }}>{k.val}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <SubLabel text="Prácticas de manejo" />
                                <div className="practices-stack fade-up">
                                    {[
                                        { icon: 'fa-apple-alt', k: 'nutricion', h: 'Manejo Nutricional',        p: 'Dietas por etapa: energía, proteína, minerales, agua ad libitum.' },
                                        { icon: 'fa-syringe',   k: 'sanidad',   h: 'Control Sanitario Integral', p: 'Vacunas ICA, desparasitación FAMACHA y bioseguridad estricta.' },
                                        { icon: 'fa-heart',     k: 'bienestar', h: 'Bienestar Animal',           p: '5 Libertades. Sombra, agua, manga funcional, trato ético.' },
                                    ].map(m => (
                                        <div key={m.k} className="practice-card" onClick={() => setSelectedTopic(PRACTICES[m.k])}>
                                            <div className="practice-icon"><i className={`fas ${m.icon}`} /></div>
                                            <div className="practice-text"><h5>{m.h}</h5><p>{m.p}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>)}

                    {/* ══ ALIMENTACIÓN ══ */}
                    {activeTab === 'alimentacion' && (<>
                        <span className="section-eyebrow">Nutrición Bovina</span>
                        <h2 className="section-heading">Sistemas de <em>Alimentación</em></h2>
                        <p className="section-sub">El sistema forrajero es la base de la rentabilidad. Conocer las opciones y elegir según el contexto de la finca determina el éxito del negocio ganadero.</p>

                        <div className="cattle-cards-grid" style={{ marginTop: 36 }}>
                            {FEEDING.map(f => (
                                <div className="cattle-card-pro fade-up" key={f.id} onClick={() => setSelectedTopic(f)}>
                                    <div className="cattle-card-pro__accent-bar" />
                                    <div className="card-img-wrap">
                                        <img src={f.image} alt={f.title}
                                            onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x214/1f2a14/78bf50?text=${f.title}` }} />
                                        <span className="card-badge">{f.category}</span>
                                    </div>
                                    <div className="card-body-pro">
                                        <h5>{f.title}</h5>
                                        <p>{f.shortDesc}</p>
                                        <div className="card-stats">
                                            {f.stats.slice(0, 2).map((s, i) => (
                                                <div className="card-stat" key={i}><span>{s.label}</span><span>{s.value}</span></div>
                                            ))}
                                        </div>
                                        <button className="card-open-btn">Ver detalles <i className="fas fa-arrow-right" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <SubLabel text="Gramíneas y leguminosas recomendadas" />
                        <div className="cv-info-grid fade-up">
                            <div className="cv-info-box">
                                <i className="fas fa-leaf cv-info-box__icon" />
                                <strong>Gramíneas tropicales</strong>
                                <ul>
                                    <li>Brachiaria brizantha cv. Marandú — base del trópico bajo</li>
                                    <li>Tobiata (B. brizantha cv. Tobiata) — alta producción</li>
                                    <li>Pasto Kikuyo — zonas de altura 1.800 msnm</li>
                                    <li>Guinea (Panicum maximum) — trópico húmedo</li>
                                    <li>Pasto Estrella africana — trópico seco</li>
                                    <li>Ryegrass — climas fríos 2.000 msnm</li>
                                </ul>
                            </div>
                            <div className="cv-info-box cv-info-box--warn">
                                <i className="fas fa-seedling cv-info-box__icon" />
                                <strong>Leguminosas forrajeras</strong>
                                <ul>
                                    <li>Leucaena leucocephala — hasta 22% PC en MS</li>
                                    <li>Matarratón (Gliricidia sepium) — cerca viva</li>
                                    <li>Botón de oro (Tithonia diversifolia) — alta producción</li>
                                    <li>Cratylia argentea — tolera sequía</li>
                                    <li>Ramio (Boehmeria nivea) — corte y acarreo</li>
                                    <li>Kudzú tropical — cobertura en laderas</li>
                                </ul>
                            </div>
                        </div>

                        <div className="cv-tip fade-up">
                            <i className="fas fa-lightbulb" />
                            <div>
                                <strong>Suplementación estratégica en época seca:</strong> La melaza-urea (80:20) mezclada con sal mineralizada puede mantener la condición corporal del hato a muy bajo costo durante la sequía. No superar el 1% del PV en urea/día para evitar intoxicación. El ensilaje de maíz o sorgo (cosechado al 30–35% MS) es la mejor reserva forrajera para sistemas semi-intensivos. Analiza el forraje cada 6 meses con bromatología de laboratorio certificado.
                            </div>
                        </div>
                    </>)}

                    {/* ══ SANIDAD ══ */}
                    {activeTab === 'sanidad' && (<>
                        <span className="section-eyebrow">Salud Animal</span>
                        <h2 className="section-heading">Sanidad y <em>Bioseguridad</em></h2>
                        <p className="section-sub">Un hato sano es un hato rentable. La prevención siempre cuesta menos que el tratamiento. La bioseguridad empieza antes de que el animal entre a la finca.</p>

                        <SubLabel text="Enfermedades de control obligatorio y estratégico" />
                        <div className="cv-disease-list">
                            {[
                                { name: 'Fiebre Aftosa',           sev: 'Obligatorio ICA',  cls: 'high', sx: 'Vesículas en boca, rodete coronario y pezones. Salivación excesiva, cojera severa, anorexia. Caída brusca en producción de leche.',                                               prev: 'Vacunación 2 veces/año obligatoria para todo el hato. Notificación inmediata al ICA ante cualquier sospecha. Cuarentena estricta.' },
                                { name: 'Brucelosis Bovina',        sev: 'Obligatorio ICA',  cls: 'high', sx: 'Abortos en el último tercio de gestación (7–9 meses), retención de placenta, infertilidad temporal o permanente, orquitis en machos. Zoonosis (Fiebre de Malta en humanos).',  prev: 'Vacunación novillas 3–8 meses con cepa RB51 (oficial en Colombia). Diagnóstico semestral en reproductores. SINIGAN actualizado.' },
                                { name: 'Carbón Sintomático',       sev: 'Alta mortalidad',  cls: 'high', sx: 'Muerte súbita en animales jóvenes (6 meses–2 años). Crepitación muscular en piernas, cuello o cadera. Edema con gas, fiebre alta >41°C. Sin tratamiento, mortalidad >90%.',    prev: 'Vacunación anual con poliantigeno clostridial. Especialmente en tierras negras o épocas de lluvia.' },
                                { name: 'Mastitis Bovina',          sev: 'Pérdida económica',cls: 'med',  sx: 'Leche grumosa, acuosa o con sangre. Ubre caliente, inflamada y dolorosa. Reducción brusca de producción. CMT positivo.',                                                        prev: 'Test de California (CMT) mensual. Sellado post-ordeño con yodo glicerinado. Secado con antibiótico de larga acción.' },
                                { name: 'Leptospirosis',            sev: 'Zoonosis',         cls: 'med',  sx: 'Abortos en cualquier etapa, hemoglobinuria, ictericia, fiebre alta. Fallo renal en animales jóvenes. Puede ser subclínica en adultos.',                                         prev: 'Vacunación polivalente anual. Drenaje de aguas estancadas. Control de roedores en instalaciones.' },
                                { name: 'Garrapatosis / Babesiosis',sev: 'Manejo regular',   cls: 'low',  sx: 'Garrapatas visibles, anemia, disminución de GDP y leche. Babesiosis causa hemoglobinuria, ictericia y muerte si no se trata.',                                                   prev: 'Rotación de acaricidas por grupo químico cada 90 días. Monitoreo de resistencias. FAMACHA para control de Haemonchus.' },
                            ].map((d, i) => (
                                <div key={i} className="cv-disease fade-up">
                                    <div className="cv-disease__header">
                                        <span className="cv-disease__name">{d.name}</span>
                                        <span className={`cv-severity cv-severity--${d.cls}`}>{d.sev}</span>
                                    </div>
                                    <p><strong>Síntomas:</strong> {d.sx}</p>
                                    <p><strong>Prevención:</strong> {d.prev}</p>
                                </div>
                            ))}
                        </div>

                        <SubLabel text="Calendario sanitario anual Colombia" />
                        <div className="cv-vax fade-up">
                            {[
                                ['Ene · Jul',   'Fiebre Aftosa — vacunación masiva obligatoria, todo el hato'],
                                ['Mar · Sep',   'Brucelosis — novillas 3–8 meses edad, cepa RB51 oficial'],
                                ['Abril',       'Carbón sintomático + poliantigeno clostridial — bovinos <2 años'],
                                ['Mayo · Nov',  'IBR + DVB + Leptospirosis + Hemofilus somnus (según historial)'],
                                ['Agosto',      'Rabia paralítica bovina — zonas con murciélagos hematófagos'],
                                ['Todo el año', 'Desparasitación estratégica c/90 días según FAMACHA y carga'],
                                ['Semestral',   'Diagnóstico brucelosis en reproductores — machos y hembras adultas'],
                                ['Al ingreso',  'Cuarentena 21 días + vacunas de base a todo animal nuevo'],
                            ].map(([d, v]) => (
                                <div className="cv-vax-row" key={d as string}>
                                    <span className="cv-vax-day">{d}</span>
                                    <span className="cv-vax-name">{v}</span>
                                </div>
                            ))}
                        </div>

                        <div className="cv-tip cv-tip--warn fade-up">
                            <i className="fas fa-exclamation-triangle" />
                            <div>
                                <strong>SINIGAN obligatorio:</strong> Todo movimiento de ganado en Colombia requiere guía sanitaria expedida por el ICA y registro actualizado en SINIGAN. Las fincas sin SINIGAN al día no pueden vender en subastas formales, frigoríficos certificados ni exportar en pie.
                            </div>
                        </div>
                    </>)}

                    {/* ══ INSTALACIONES ══ */}
                    {activeTab === 'instalaciones' && (<>
                        <span className="section-eyebrow">Infraestructura Ganadera</span>
                        <h2 className="section-heading">Instalaciones y <em>Bienestar</em></h2>
                        <p className="section-sub">Las instalaciones funcionales reducen el estrés, facilitan el manejo y aumentan productividad. Invertir bien en infraestructura es invertir directamente en rentabilidad.</p>

                        <SubLabel text="Dimensionamiento por animal" />
                        <div className="cv-measure-grid fade-up">
                            {[['6 m²','espacio en corral por animal adulto'],['1 m','comedero lineal mínimo por animal'],['60 L','agua mínima en día de calor'],['4 m²','sombra mínima por cabeza']].map(([v, l]) => (
                                <div key={l as string} className="cv-measure">
                                    <span className="cv-measure__val">{v}</span>
                                    <span className="cv-measure__lbl">{l}</span>
                                </div>
                            ))}
                        </div>

                        <SubLabel text="Instalaciones esenciales" />
                        <div className="cv-info-grid fade-up">
                            <div className="cv-info-box">
                                <i className="fas fa-warehouse cv-info-box__icon" />
                                <strong>Manga y embudo</strong>
                                <ul>
                                    <li>Ancho manga: 70–80 cm (adultos), 50–60 cm (terneros)</li>
                                    <li>Altura: mínimo 1.5 m de barandas</li>
                                    <li>Piso con estrías antideslizantes cada 30 cm</li>
                                    <li>Curvas en vez de ángulos de 90° (Grandin)</li>
                                    <li>Cepo metálico con apertura rápida</li>
                                    <li>Pasillo elevado para operario (seguridad)</li>
                                </ul>
                            </div>
                            <div className="cv-info-box">
                                <i className="fas fa-tint cv-info-box__icon" />
                                <strong>Agua y alimentación</strong>
                                <ul>
                                    <li>Bebedero automático por cada 10–15 animales</li>
                                    <li>Borde a 70–80 cm del suelo (acceso fácil)</li>
                                    <li>Comedero elevado 20 cm del piso</li>
                                    <li>Sal mineralizada bajo cubierta permanente</li>
                                    <li>Limpieza bebederos cada 48h en calor</li>
                                    <li>Flujo mínimo: 20 L/minuto por bebedero</li>
                                </ul>
                            </div>
                            <div className="cv-info-box">
                                <i className="fas fa-sun cv-info-box__icon" />
                                <strong>Sombreado y ventilación</strong>
                                <ul>
                                    <li>SSP: ≥50 árboles/ha (teca, cachimbo, guácimo)</li>
                                    <li>Sombra artificial: polisombra al 60–80%</li>
                                    <li>Orientar galpones Norte–Sur</li>
                                    <li>Altura mínima de alero: 4.5 m en trópico</li>
                                    <li>Lámina galvalum + cielo raso aislante</li>
                                    <li>Reducción temperatura interior: 6–8°C</li>
                                </ul>
                            </div>
                            <div className="cv-info-box cv-info-box--warn">
                                <i className="fas fa-road cv-info-box__icon" />
                                <strong>Corrales y drenajes</strong>
                                <ul>
                                    <li>Corrales de manejo contiguos a manga</li>
                                    <li>Corral de cuarentena separado 50 m</li>
                                    <li>Piso en concreto con pendiente 2–3%</li>
                                    <li>Drenajes hacia biodigestor o laguna</li>
                                    <li>Vías de acceso para vehículo 4×4</li>
                                    <li>Iluminación nocturna en zona de parición</li>
                                </ul>
                            </div>
                        </div>

                        <div className="cv-tip fade-up">
                            <i className="fas fa-lightbulb" />
                            <div>
                                <strong>Principio de Grandin para mangas:</strong> Un animal que puede ver hacia dónde va se mueve con hasta 3× menos estrés. Diseña mangas curvas (radio 3–5 m), piso sólido sin brillos ni charcos, iluminación difusa sin deslumbramientos y sin ruidos metálicos innecesarios.
                            </div>
                        </div>
                    </>)}

                    {/* ══ ECONOMÍA ══ */}
                    {activeTab === 'economia' && (<>
                        <span className="section-eyebrow">Análisis Financiero</span>
                        <h2 className="section-heading">Economía y <em>Rentabilidad</em></h2>
                        <p className="section-sub">La ganadería rentable no depende solo de producir más, sino de reducir costos por unidad, mejorar la conversión y comercializar con inteligencia de mercado.</p>

                        <SubLabel text="Costos estimados — feedlot 100 novillos / 120 días" />
                        <div className="cv-table-wrap fade-up">
                            <table className="cv-table">
                                <thead><tr><th>Concepto</th><th>Costo estimado</th><th>% del total</th></tr></thead>
                                <tbody>
                                    {[
                                        ['Compra de novillos (base)',          '$55M – $72M',  '64%', false],
                                        ['Alimento (concentrado + forraje)',   '$16M – $22M',  '22%', false],
                                        ['Sanidad y veterinario',              '$1.2M – $2M',   '2%', false],
                                        ['Mano de obra (2 operarios)',         '$3.5M – $5M',   '5%', false],
                                        ['Servicios (agua, luz, combustible)', '$0.8M – $1.2M', '1%', false],
                                        ['Depreciación instalaciones',         '$1M – $1.5M',   '2%', false],
                                        ['Intereses capital (si aplica)',      '$2M – $3.5M',   '3%', false],
                                        ['Total inversión estimada / ciclo',   '$79M – $107M', '100%', true],
                                    ].map(([c, v, p, bold], i) => (
                                        <tr key={i}>
                                            <td style={{ color: bold ? 'var(--cv-cream)' : 'var(--cv-mist)' }}>{bold ? <strong>{c}</strong> : c}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: bold ? 'var(--cv-moss-lit)' : '#e8735a', fontSize: '.82rem' }}>{bold ? <strong>{v}</strong> : v}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: 'var(--cv-mist)', fontSize: '.78rem' }}>{p}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <SubLabel text="Ingresos y margen estimado" />
                        <div className="cv-table-wrap fade-up">
                            <table className="cv-table">
                                <thead><tr><th>Concepto</th><th>Ingreso estimado</th><th>Supuesto</th></tr></thead>
                                <tbody>
                                    {[
                                        ['Venta novillos en pié (100 ud.)',    '$96M – $126M', '480–500 kg × $4.000–$4.200/kg vivo'],
                                        ['Bonificación raza/certificación',    '$2M – $5M',    'Angus cert. o sistema trazado SINIGAN'],
                                        ['Subproductos (gallinaza/estiércol)', '$0.5M – $1M',  'Compost y biogás si hay biodigestor'],
                                        ['Margen bruto estimado',              '$17M – $19M',  '120 días de ceba, todos los animales'],
                                        ['ROI del ciclo (estimado)',           '18–24%',       'Sobre inversión total incluyendo novillos'],
                                    ].map(([c, v, s], i) => (
                                        <tr key={i}>
                                            <td style={{ color: i >= 3 ? 'var(--cv-cream)' : 'var(--cv-mist)' }}>{i >= 3 ? <strong>{c}</strong> : c}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: 'var(--cv-moss-lit)', fontSize: '.82rem' }}>{i >= 3 ? <strong>{v}</strong> : v}</td>
                                            <td style={{ fontSize: '.76rem', color: 'var(--cv-mist)' }}>{s}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <SubLabel text="Canales de comercialización" />
                        <div className="cattle-cards-grid cattle-cards-grid--2 fade-up">
                            {[
                                { icon: 'fa-gavel',     h: 'Subasta Ganadera',           p: 'Mayor transparencia. FEDEGÁN publica precios semanales de referencia. Requiere guía ICA y SINIGAN vigente. Las subastas certificadas pagan bonificación por raza y conformación.', badge: 'Precio mercado', cls: 'moss' },
                                { icon: 'fa-handshake', h: 'Frigorífico Directo',         p: 'Negociación directa por kilo canal o pié. Mayor margen si se tiene volumen constante y garantía de calidad. Algunos frigoríficos ofrecen contratos a futuro con precio fijo.',      badge: 'Mayor margen',  cls: 'moss' },
                                { icon: 'fa-truck',     h: 'Comisionista / Intermediario',p: 'Rápido pero con menor precio. El comisionista cobra 3–5% del valor. Útil para ventas urgentes o zonas sin subasta cercana. Negocia siempre el porcentaje antes de aceptar.',      badge: 'Precio bajo',   cls: 'sienna' },
                                { icon: 'fa-globe',     h: 'Exportación en Pié',          p: 'Venezuela, Medio Oriente, Líbano, Trinidad y Tobago. Exige certificación ICA, cuarentena 30 días, trazabilidad SINIGAN completa y aprobación del país destino. Precio premium.',   badge: 'Premium',       cls: 'moss' },
                            ].map(m => (
                                <div key={m.h} className="cattle-card-pro" style={{ cursor: 'default' }}>
                                    <div className="cattle-card-pro__accent-bar" />
                                    <div className="card-body-pro" style={{ padding: '26px 26px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                            <div className="practice-icon" style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 10 }}>
                                                <i className={`fas ${m.icon}`} />
                                            </div>
                                            <h5 style={{ margin: 0 }}>{m.h}</h5>
                                        </div>
                                        <p style={{ marginBottom: 16 }}>{m.p}</p>
                                        <span className={`cv-badge cv-badge--${m.cls}`}>{m.badge}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cv-tip fade-up">
                            <i className="fas fa-info-circle" />
                            <div>
                                <strong>Simula antes de invertir:</strong> El margen en feedlot colombiano varía enormemente con el precio del maíz y del novillo de compra. Usa el módulo de Finanzas de AgroFinanzas para proyectar flujo de caja, punto de equilibrio y ROI antes de comprometer capital en cada lote.
                            </div>
                        </div>
                    </>)}

                </div>
            </section>

            <hr className="cattle-divider" />

            {/* ════ NOTICIAS — 6 cards (2 filas × 3 columnas) ════ */}
            <section className="cattle-section cattle-section-alt">
                <div className="container">
                    <span className="section-eyebrow">Actualidad</span>
                    <h2 className="section-heading">Mercados y <em>Noticias</em></h2>
                    <p className="section-sub">Precios, sanidad, innovación y sostenibilidad para el sector pecuario colombiano.</p>

                    <div className="news-grid" style={{ marginTop: 36 }}>
                        {NEWS.map((n, i) => (
                            <div key={i} className="news-card-c fade-up">
                                <div className="news-card-img">
                                    <img src={n.img} alt={n.h}
                                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x190/161b0e/78bf50?text=Ganadería' }} />
                                </div>
                                <div className="news-card-body">
                                    <span className={`news-badge ${n.badge}`}>{n.bl}</span>
                                    <h5>{n.h}</h5>
                                    <p>{n.p}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════ MODAL ════ */}
            {selectedTopic && (
                <div className="cattle-modal-overlay open" onClick={() => setSelectedTopic(null)}>
                    <div className="cattle-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedTopic(null)}>
                            <i className="fas fa-times" />
                        </button>
                        <img className="modal-hero-img" src={selectedTopic.image} alt={selectedTopic.title}
                            onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/860x295/1f2a14/78bf50?text=${selectedTopic.title}` }} />
                        <div className="modal-body-c">
                            <span className="modal-eyebrow">{selectedTopic.category}</span>
                            <h2 className="modal-title-c">{selectedTopic.title}</h2>
                            <p className="modal-desc-c">{selectedTopic.fullDesc}</p>
                            <div className="modal-stats-grid">
                                {selectedTopic.stats.map((s, i) => (
                                    <div className="modal-stat" key={i}>
                                        <span>{s.label}</span><span>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                            <h4 className="modal-section-title-c">Conceptos clave</h4>
                            <div className="modal-tags">
                                {selectedTopic.tags.map(t => <span className="modal-tag" key={t}>{t}</span>)}
                            </div>
                            <div className="modal-links">
                                <h4>Recursos Técnicos</h4>
                                <ul>
                                    <li><a href="https://www.ica.gov.co"     target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt" /> ICA · Normativa Oficial</a></li>
                                    <li><a href="https://www.fedegan.org.co" target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt" /> FEDEGÁN · Precios</a></li>
                                    <li><a href="https://www.cipav.org.co"   target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt" /> CIPAV · SSP Colombia</a></li>
                                    <li><a href="https://www.agronet.gov.co" target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt" /> Agronet · SINIGAN</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}