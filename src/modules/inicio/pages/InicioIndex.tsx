import { useState, useEffect, useRef, useCallback } from 'react'
import { inicioService, type PrecioItem, type PreciosResponse } from '../services/inicioService'
import './InicioIndex.css'

/* ═══════════════════════════════════════════════════════════════
   AMIGO GANADERO — datos
═══════════════════════════════════════════════════════════════ */
const CATS = [
  { key: 'prices',             title: 'Elasticidad del precio',         icon: 'fa-tag',                  group: 'Economía'   },
  { key: 'costs',              title: 'Costos de producción',           icon: 'fa-coins',                group: 'Economía'   },
  { key: 'investment',         title: 'Inversión agrícola por país',    icon: 'fa-chart-line',           group: 'Economía'   },
  { key: 'subsidies',          title: 'Subsidios agrícolas',            icon: 'fa-hand-holding-dollar',  group: 'Economía'   },
  { key: 'agricultural_gdp',   title: 'PIB agrícola por país',          icon: 'fa-building-columns',     group: 'Economía'   },
  { key: 'exports',            title: 'Exportaciones por valor ($)',    icon: 'fa-ship',                 group: 'Comercio'   },
  { key: 'imports',            title: 'Importaciones por valor ($)',    icon: 'fa-plane-arrival',        group: 'Comercio'   },
  { key: 'trade_balance',      title: 'Balanza comercial agrícola',     icon: 'fa-scale-balanced',       group: 'Comercio'   },
  { key: 'competitiveness',    title: 'Índice de competitividad',       icon: 'fa-trophy',               group: 'Comercio'   },
  { key: 'market_access',      title: 'Mercados emergentes',            icon: 'fa-globe',                group: 'Comercio'   },
  { key: 'logistics',          title: 'Rutas comerciales',              icon: 'fa-route',                group: 'Comercio'   },
  { key: 'tariffs',            title: 'Aranceles internacionales',      icon: 'fa-file-invoice-dollar',  group: 'Comercio'   },
  { key: 'treaties',           title: 'Tratados de libre comercio',     icon: 'fa-handshake',            group: 'Comercio'   },
  { key: 'harvest_area',       title: 'Área cosechada',                 icon: 'fa-tractor',              group: 'Producción' },
  { key: 'planted_area',       title: 'Área sembrada',                  icon: 'fa-seedling',             group: 'Producción' },
  { key: 'yield_forecast',     title: 'Rendimiento proyectado',         icon: 'fa-chart-bar',            group: 'Producción' },
  { key: 'future_estimates',   title: 'Estimaciones futuras',           icon: 'fa-calendar-days',        group: 'Producción' },
  { key: 'postharvest_losses', title: 'Pérdidas postcosecha',           icon: 'fa-triangle-exclamation', group: 'Producción' },
  { key: 'stock',              title: 'Stock / inventarios',            icon: 'fa-boxes-stacked',        group: 'Producción' },
  { key: 'farmers_count',      title: 'Agricultores dedicados',         icon: 'fa-users',                group: 'Producción' },
  { key: 'pests_risk',         title: 'Riesgo de plagas por región',    icon: 'fa-bug',                  group: 'Sanidad'    },
  { key: 'diseases',           title: 'Enfermedades reportadas',        icon: 'fa-virus',                group: 'Sanidad'    },
  { key: 'pest_impact',        title: 'Impacto estimado en producción', icon: 'fa-chart-pie',            group: 'Sanidad'    },
]

const GM: Record<string, { color: string; bg: string; border: string }> = {
  'Economía':   { color: '#D4841A', bg: 'rgba(212,132,26,.09)',  border: 'rgba(212,132,26,.22)'  },
  'Comercio':   { color: '#5B8DB8', bg: 'rgba(91,141,184,.09)',  border: 'rgba(91,141,184,.22)'  },
  'Producción': { color: '#4A7C3F', bg: 'rgba(74,124,63,.09)',   border: 'rgba(74,124,63,.22)'   },
  'Sanidad':    { color: '#A0522D', bg: 'rgba(160,82,45,.09)',   border: 'rgba(160,82,45,.22)'   },
}

/* ── Banco Mundial indicators ── */
const WB_IND: Record<string, { ind: string; label: string; unit: string }> = {
  prices:             { ind: 'AG.PRD.FOOD.XD',       label: 'Índice de producción alimentaria Colombia',          unit: '(base 2004-2006)' },
  costs:              { ind: 'NY.GDP.PCAP.CD',        label: 'PIB per cápita USD Colombia',                        unit: 'USD'              },
  investment:         { ind: 'GC.XPN.TOTL.GD.ZS',    label: 'Gasto público total % PIB Colombia',                 unit: '%'                },
  subsidies:          { ind: 'GC.TAX.TOTL.GD.ZS',    label: 'Carga fiscal % PIB Colombia',                        unit: '%'                },
  agricultural_gdp:   { ind: 'NV.AGR.TOTL.ZS',       label: 'Valor agregado agrícola % del PIB Colombia',         unit: '%'                },
  exports:            { ind: 'TX.VAL.AGRI.ZS.UN',    label: 'Exportaciones agrícolas % del total Colombia',       unit: '%'                },
  imports:            { ind: 'TM.VAL.AGRI.ZS.UN',    label: 'Importaciones agrícolas % del total Colombia',       unit: '%'                },
  trade_balance:      { ind: 'BN.CAB.XOKA.CD',       label: 'Balanza cuenta corriente USD Colombia',              unit: ''                 },
  competitiveness:    { ind: 'GC.DOD.TOTL.GD.ZS',    label: 'Deuda pública % PIB Colombia',                       unit: '%'                },
  market_access:      { ind: 'NE.EXP.GNFS.ZS',       label: 'Exportaciones bienes y servicios % PIB Colombia',    unit: '%'                },
  logistics:          { ind: 'IC.EXP.COST.CD',       label: 'Costo exportar por contenedor USD Colombia',         unit: 'USD'              },
  tariffs:            { ind: 'TM.TAX.MANF.SM.AR.ZS', label: 'Arancel promedio bienes manufacturados Colombia',    unit: '%'                },
  treaties:           { ind: 'TM.TAX.MRCH.SM.AR.ZS', label: 'Arancel promedio todas las mercancías Colombia',     unit: '%'                },
  harvest_area:       { ind: 'AG.LND.CROP.ZS',       label: 'Tierras de cultivo % del área total Colombia',       unit: '%'                },
  planted_area:       { ind: 'AG.LND.ARBL.ZS',       label: 'Tierras arables % del área de tierra Colombia',      unit: '%'                },
  yield_forecast:     { ind: 'AG.YLD.CREL.KG',       label: 'Rendimiento cereales kg por hectárea Colombia',      unit: 'kg/ha'            },
  future_estimates:   { ind: 'SP.POP.GROW',          label: 'Crecimiento poblacional anual % Colombia',           unit: '%'                },
  postharvest_losses: { ind: 'AG.PRD.LVSK.XD',       label: 'Índice producción pecuaria Colombia',                unit: ''                 },
  stock:              { ind: 'FP.CPI.TOTL.ZG',       label: 'Inflación anual % Colombia',                        unit: '%'                },
  farmers_count:      { ind: 'SL.AGR.EMPL.ZS',       label: 'Empleo en agricultura % del empleo total Colombia',  unit: '%'                },
  pests_risk:         { ind: 'AG.PRD.CROP.XD',       label: 'Índice producción agrícola Colombia',                unit: ''                 },
  diseases:           { ind: 'SH.XPD.CHEX.GD.ZS',   label: 'Gasto en salud % PIB Colombia',                     unit: '%'                },
  pest_impact:        { ind: 'AG.PRD.FOOD.XD',       label: 'Índice producción alimentaria Colombia',             unit: ''                 },
}

/* ── Fuentes colombianas por categoría ── */
const FUENTES: Record<string, Array<{ ico: string; txt: string; url: string }>> = {
  prices:             [{ ico: 'fa-database',           txt: 'SIPSA-DANE — Precios semanales en 90+ plazas mayoristas',             url: 'www.dane.gov.co/sipsa'                  }, { ico: 'fa-seedling',         txt: 'Agronet MADR — Series históricas de precios por cultivo',             url: 'www.agronet.gov.co/estadistica'         }],
  costs:              [{ ico: 'fa-coins',              txt: 'Agronet MADR — Costos de producción por cultivo y región',            url: 'www.agronet.gov.co/estadistica'         }, { ico: 'fa-building',         txt: 'FINAGRO — Líneas de crédito y tasas vigentes',                        url: 'www.finagro.com.co'                     }],
  investment:         [{ ico: 'fa-landmark',           txt: 'ADR — Agencia de Desarrollo Rural · Proyectos productivos',           url: 'www.adr.gov.co'                         }, { ico: 'fa-building',         txt: 'FINAGRO — Incentivo a la Capitalización Rural (ICR)',                  url: 'www.finagro.com.co'                     }],
  subsidies:          [{ ico: 'fa-hand-holding-dollar',txt: 'FINAGRO — Programas: Mujer Rural, Jóvenes, PDET',                     url: 'www.finagro.com.co'                     }, { ico: 'fa-landmark',         txt: 'Banco Agrario — Créditos y subsidios oficiales',                      url: 'www.bancoagrario.gov.co'                }],
  agricultural_gdp:   [{ ico: 'fa-chart-line',         txt: 'DANE — Cuentas Nacionales trimestrales por sector',                   url: 'www.dane.gov.co'                        }, { ico: 'fa-seedling',         txt: 'Agronet MADR — Estadísticas del sector agropecuario',                 url: 'www.agronet.gov.co/estadistica'         }],
  exports:            [{ ico: 'fa-plane',              txt: 'PROCOLOMBIA — Inteligencia de mercados por producto y país',           url: 'www.procolombia.co'                     }, { ico: 'fa-seedling',         txt: 'Agronet MADR — Exportaciones por producto y destino',                 url: 'www.agronet.gov.co/estadistica'         }],
  imports:            [{ ico: 'fa-file-invoice',       txt: 'DIAN — Estadísticas de comercio exterior detalladas',                  url: 'www.dian.gov.co'                        }, { ico: 'fa-seedling',         txt: 'Agronet MADR — Importaciones por producto y origen',                  url: 'www.agronet.gov.co/estadistica'         }],
  trade_balance:      [{ ico: 'fa-scale-balanced',     txt: 'MinCIT — Estadísticas de comercio exterior agropecuario',             url: 'www.mincit.gov.co'                      }, { ico: 'fa-seedling',         txt: 'Agronet MADR — Balanza comercial por producto',                       url: 'www.agronet.gov.co/estadistica'         }],
  competitiveness:    [{ ico: 'fa-trophy',             txt: 'DNP — Índice de Competitividad Departamental',                        url: 'www.dnp.gov.co'                         }, { ico: 'fa-seedling',         txt: 'Agronet MADR — Rendimientos y productividad por cultivo',             url: 'www.agronet.gov.co/estadistica'         }],
  market_access:      [{ ico: 'fa-globe',              txt: 'PROCOLOMBIA — Perfil de mercados internacionales por producto',        url: 'www.procolombia.co'                     }, { ico: 'fa-handshake',        txt: 'MinCIT — TLC y acuerdos comerciales vigentes',                        url: 'www.tlc.gov.co'                         }],
  logistics:          [{ ico: 'fa-road',               txt: 'INVIAS — Estado de vías y proyectos de infraestructura',               url: 'www.invias.gov.co'                      }, { ico: 'fa-truck',            txt: 'MinTransporte — Transporte de carga y logística rural',                url: 'www.mintransporte.gov.co'               }],
  tariffs:            [{ ico: 'fa-file-invoice-dollar',txt: 'DIAN — Arancel MUISCA · consulta por producto específico',            url: 'www.dian.gov.co/aduana/tarifas'         }, { ico: 'fa-handshake',        txt: 'MinCIT — Acuerdos y preferencias arancelarias vigentes',              url: 'www.mincit.gov.co'                      }],
  treaties:           [{ ico: 'fa-handshake',          txt: 'MinCIT — TLC vigentes y en negociación Colombia',                     url: 'www.tlc.gov.co'                         }, { ico: 'fa-plane',            txt: 'PROCOLOMBIA — Guías de exportación por TLC y producto',               url: 'www.procolombia.co'                     }],
  harvest_area:       [{ ico: 'fa-map',                txt: 'Agronet MADR — EVA: Área cosechada por cultivo y municipio',          url: 'www.agronet.gov.co/estadistica'         }, { ico: 'fa-map-location-dot', txt: 'UPRA — Zonificación y aptitud agrícola del suelo colombiano',          url: 'www.upra.gov.co'                        }],
  planted_area:       [{ ico: 'fa-seedling',           txt: 'Agronet MADR — EVA: Área sembrada por cultivo y municipio',           url: 'www.agronet.gov.co/estadistica'         }, { ico: 'fa-database',         txt: 'SIPSA-DANE — Calendarios de cosecha por región productora',           url: 'www.dane.gov.co/sipsa'                  }],
  yield_forecast:     [{ ico: 'fa-flask',              txt: 'AGROSAVIA — Variedades mejoradas y paquetes tecnológicos por cultivo', url: 'www.agrosavia.co'                       }, { ico: 'fa-seedling',         txt: 'Agronet MADR — Rendimientos por cultivo, año y departamento',         url: 'www.agronet.gov.co/estadistica'         }],
  future_estimates:   [{ ico: 'fa-map-location-dot',   txt: 'UPRA — Ordenamiento productivo y prospectiva agrícola nacional',      url: 'www.upra.gov.co'                        }, { ico: 'fa-landmark',         txt: 'DNP — Plan Nacional de Desarrollo agropecuario',                      url: 'www.dnp.gov.co'                         }],
  postharvest_losses: [{ ico: 'fa-graduation-cap',     txt: 'SENA — Cursos gratuitos de manejo postcosecha para agricultores',     url: 'www.sena.edu.co'                        }, { ico: 'fa-boxes-stacked',    txt: 'ALMACAFÉ — Almacenamiento y financiamiento con producto como garantía', url: 'www.almacafe.com.co'                  }],
  stock:              [{ ico: 'fa-boxes-stacked',      txt: 'Bolsa Mercantil de Colombia — Certificados de depósito agropecuarios', url: 'www.bolsamercantil.com.co'              }, { ico: 'fa-warehouse',        txt: 'ALMACAFÉ — Red de silos y almacenamiento agropecuario en Colombia',   url: 'www.almacafe.com.co'                    }],
  farmers_count:      [{ ico: 'fa-users',              txt: 'DANE — Censo Nacional Agropecuario y Gran Encuesta Agropecuaria',     url: 'www.dane.gov.co'                        }, { ico: 'fa-tractor',          txt: 'SAC — Sociedad de Agricultores de Colombia · Gremios sectoriales',    url: 'www.sac.org.co'                         }],
  pests_risk:         [{ ico: 'fa-bug',                txt: 'ICA — SIVIFITO: Sistema de Vigilancia Fitosanitaria · Alertas',       url: 'www.ica.gov.co/alertas'                 }, { ico: 'fa-flask',            txt: 'AGROSAVIA — Manejo integrado de plagas por cultivo colombiano',       url: 'www.agrosavia.co'                       }],
  diseases:           [{ ico: 'fa-virus',              txt: 'ICA — Sanidad animal y vegetal · Registros y alertas oficiales',      url: 'www.ica.gov.co'                         }, { ico: 'fa-cow',              txt: 'FEDEGÁN — Programas de salud animal para ganaderos colombianos',     url: 'www.fedegan.org.co'                     }],
  pest_impact:        [{ ico: 'fa-shield-halved',      txt: 'FINAGRO — Seguro Agropecuario subsidiado contra plagas y clima',      url: 'www.finagro.com.co/seguro-agropecuario' }, { ico: 'fa-bug',              txt: 'ICA — Programas de erradicación subsidiados · Línea 018000111098',   url: 'www.ica.gov.co'                         }],
}

/* ── Contenido educativo ── */
const CONTENT: Record<string, { que_es: string; por_que: string; consejos: string[] }> = {
  prices:             { que_es: 'La elasticidad del precio mide cómo cambia la demanda de un producto agropecuario cuando su precio sube o baja.', por_que: 'Conocer la elasticidad te permite tomar mejores decisiones de venta y anticipar el comportamiento del mercado.', consejos: ['Monitorea precios semanales en SIPSA-DANE (www.dane.gov.co/sipsa).', 'En temporada alta los precios bajan — planifica almacenamiento previo.', 'Productos procesados tienen menor elasticidad que los frescos.', 'La Bolsa Mercantil publica precios de referencia para granos.'] },
  costs:              { que_es: 'Los costos de producción incluyen insumos, mano de obra, maquinaria y costos financieros.', por_que: 'Controlar los costos es la diferencia entre un negocio rentable y uno que pierde dinero temporada tras temporada.', consejos: ['Consulta costos por cultivo en Agronet (www.agronet.gov.co/estadistica).', 'FINAGRO tiene créditos a tasas preferenciales (DTF-2%).', 'Los fertilizantes representan hasta el 40% del costo total.', 'Agrupa compras de insumos para obtener descuentos por volumen.'] },
  investment:         { que_es: 'La inversión agrícola proviene de capital privado, crédito institucional e inversión pública dirigida al campo.', por_que: 'Una inversión bien planificada puede duplicar la productividad en 2-3 años con retorno sostenido.', consejos: ['ICR: el gobierno paga hasta el 40% de inversiones en equipos.', 'ADR financia proyectos productivos asociativos (www.adr.gov.co).', 'FINAGRO: líneas especiales para mujer rural y jóvenes agricultores.', 'DRE: subsidio a la tasa de interés para pequeños productores.'] },
  subsidies:          { que_es: 'Los subsidios incluyen ICR, seguro agropecuario subsidiado e incentivos a la asistencia técnica oficial.', por_que: 'Acceder a subsidios puede reducir costos hasta en un 40% si sabes cuáles aplican a tu finca.', consejos: ['Regístrate en el SISA del Ministerio de Agricultura — es gratuito.', 'Seguro agropecuario: el gobierno paga hasta el 80% de la prima vía FINAGRO.', 'Municipios PDET tienen prioridad en asignación de subsidios.', 'Banco Agrario: créditos con períodos de gracia hasta 2 años.'] },
  agricultural_gdp:   { que_es: 'El PIB agrícola colombiano equivale al 6-7% del PIB total pero genera el 16% del empleo nacional.', por_que: 'Entender el PIB agropecuario te dice en qué sectores está creciendo la economía rural y hacia dónde va el apoyo institucional.', consejos: ['DANE publica trimestralmente las Cuentas Nacionales (www.dane.gov.co).', 'Los sectores con mayor crecimiento reciben más apoyo institucional.', 'Agronet tiene estadísticas históricas de producción por cultivo.', 'Monitorea el Informe de Coyuntura Económica Regional del DANE.'] },
  exports:            { que_es: 'Las exportaciones agrícolas colombianas superan USD 7.000 millones anuales. Café, flores y banano lideran.', por_que: 'Exportar permite acceder a precios internacionales más altos que los del mercado local.', consejos: ['PROCOLOMBIA ofrece asesoría gratuita para exportadores (www.procolombia.co).', 'Para exportar necesitas registro ICA y certificado de origen.', 'Aguacate Hass, cacao y uchuva tienen las mejores perspectivas de precio.', 'Agronet publica estadísticas de exportaciones por producto y país.'] },
  imports:            { que_es: 'Colombia importa principalmente maíz, trigo, soya y algodón en grandes volúmenes anuales.', por_que: 'Las importaciones compiten directamente con la producción nacional y presionan los precios a la baja.', consejos: ['Diversifica hacia cultivos sustitutos de importaciones como maíz amarillo.', 'Las industrias de alimentos balanceados pagan buen precio por maíz nacional.', 'Monitorea el CBOT para anticipar movimientos del mercado local.', 'DIAN publica estadísticas detalladas de importaciones mensuales.'] },
  trade_balance:      { que_es: 'Colombia tiene balanza positiva en productos diferenciados (café, flores) pero negativa en cereales.', por_que: 'Una balanza positiva indica que el sector es competitivo y puede captar más divisas para reinversión.', consejos: ['Los sectores con balanza positiva y creciente son los más atractivos para invertir.', 'Frutas exóticas y productos orgánicos tienen alta demanda internacional sostenida.', 'MinCIT publica informes mensuales de comercio exterior agropecuario.'] },
  competitiveness:    { que_es: 'El índice de competitividad agrícola mide la eficiencia comparada con otros países productores.', por_que: 'Un sector competitivo puede ganar mercados internacionales y sostener precios favorables en el tiempo.', consejos: ['Asociarse con otros productores reduce costos y aumenta poder de negociación.', 'Las BPA son requisito para exportar y mejoran la competitividad real.', 'La logística puede representar el 30% del precio final al consumidor.', 'El DNP publica el Índice Departamental de Competitividad anualmente.'] },
  market_access:      { que_es: 'Los mercados emergentes para Colombia incluyen China, Emiratos Árabes Unidos y Corea del Sur.', por_que: 'Diversificar mercados reduce el riesgo de depender de un solo comprador o país destino.', consejos: ['China es el mayor importador mundial — gran oportunidad para frutas y café especial.', 'PROCOLOMBIA organiza misiones comerciales internacionales (www.procolombia.co).', 'El TLC con Corea del Sur tiene preferencias para más de 300 productos agropecuarios.'] },
  logistics:          { que_es: 'Los puertos principales son Buenaventura (Pacífico) y Barranquilla/Cartagena (Atlántico).', por_que: 'El costo logístico en Colombia representa hasta el 25% del valor del producto al llegar al mercado.', consejos: ['Organiza transporte colectivo con otros productores para reducir costos unitarios.', 'El transporte refrigerado aumenta el precio y reduce pérdidas postcosecha considerablemente.', 'INVIAS informa sobre el estado de vías en tu región (www.invias.gov.co).'] },
  tariffs:            { que_es: 'Los aranceles en Colombia van del 0% al 20% según el producto y su origen de importación.', por_que: 'Conocer los aranceles te permite identificar ventajas competitivas reales por TLC vigentes.', consejos: ['Consulta el arancel exacto en MUISCA de la DIAN para tu producto específico.', 'El SGP da acceso preferencial a mercados europeos para pequeños productores.', 'Los aranceles van a cero gradualmente — planifica con el cronograma del MinCIT.'] },
  treaties:           { que_es: 'Colombia tiene TLC vigentes con EEUU, UE, Alianza del Pacífico, Canadá, Israel y Corea del Sur.', por_que: 'Los TLC son una ventaja real que muchos competidores de la región no tienen disponible.', consejos: ['TLC con EEUU: aguacate, flores y cacao tienen preferencia arancelaria total.', 'TLC con UE: café especial y productos orgánicos tienen alta demanda creciente.', 'Consulta el portal TLC del MinCIT (www.tlc.gov.co) para tu producto.'] },
  harvest_area:       { que_es: 'El área cosechada en Colombia supera las 4 millones de hectáreas anuales en distintos cultivos.', por_que: 'El área cosechada determina la oferta total disponible y condiciona directamente el precio de mercado.', consejos: ['Consulta estadísticas EVA de Agronet por municipio y cultivo específico.', 'Los cultivos permanentes tienen menor volatilidad de precio que los transitorios.', 'La rotación de cultivos mejora el suelo y reduce la presión de plagas.', 'UPRA tiene mapas detallados de aptitud de suelos por región (www.upra.gov.co).'] },
  planted_area:       { que_es: 'Colombia tiene 114 millones de hectáreas totales, solo el 5% se cultiva activamente en la actualidad.', por_que: 'Conocer el área sembrada da señales tempranas de cuánta competencia habrá en la próxima cosecha.', consejos: ['SIPSA-DANE publica datos de área sembrada mensualmente por producto.', 'Agronet tiene calendarios de siembra por región y cultivo disponibles.', 'Antes de sembrar, revisa qué y cuánto siembran los productores vecinos.'] },
  yield_forecast:     { que_es: 'Colombia tiene rendimientos inferiores al promedio mundial en la mayoría de cultivos principales.', por_que: 'Aumentar el rendimiento sin ampliar el área es la forma más eficiente y rentable de crecer.', consejos: ['El uso de semilla certificada puede aumentar rendimientos entre 30% y 80%.', 'La fertilización técnica basada en análisis de suelo mejora rendimientos significativamente.', 'El riego tecnificado puede duplicar rendimientos en zonas con estrés hídrico.', 'AGROSAVIA ofrece asistencia técnica y variedades mejoradas (www.agrosavia.co).'] },
  future_estimates:   { que_es: 'Proyecciones: demanda de alimentos +25% para 2030, con mayor demanda de proteína animal en países emergentes.', por_que: 'Planificar con base en tendencias futuras permite posicionarse antes que la competencia regional.', consejos: ['Aguacate Hass, arándano y cacao tienen las mejores perspectivas de precio en 5 años.', 'La producción orgánica certificada tiene demanda creciente con precios premium sostenidos.', 'La acuicultura es uno de los sectores con mayor proyección en Colombia para esta década.', 'Consulta la UPRA para proyecciones de demanda y aptitud de suelos por región.'] },
  postharvest_losses: { que_es: 'Colombia pierde entre el 30% y el 40% de los alimentos producidos después de la cosecha por mal manejo.', por_que: 'Reducir pérdidas postcosecha es equivalente a aumentar la producción sin necesidad de sembrar más área.', consejos: ['Cosechar en horas frescas (madrugada o tarde) reduce el daño por calor en campo.', 'El preenfriamiento prolonga la vida útil de frutas y verduras varios días más.', 'Empaques adecuados reducen golpes, magullamiento y pérdidas en transporte.', 'SENA ofrece cursos gratuitos de manejo postcosecha (www.sena.edu.co).'] },
  stock:              { que_es: 'El stock agropecuario incluye productos almacenados en silos, bodegas certificadas y cámaras frías.', por_que: 'Quien puede almacenar estratégicamente, puede vender cuando el precio de mercado es más favorable.', consejos: ['ALMACAFÉ permite almacenar y recibir crédito con el producto como garantía real.', 'El certificado de depósito permite vender en la Bolsa Mercantil de Colombia.', 'Para granos, el silo metálico familiar tiene retorno en solo 1-2 temporadas de uso.', 'Monitorea precios históricos del SIPSA para identificar meses de precio alto.'] },
  farmers_count:      { que_es: 'Colombia tiene aproximadamente 2.7 millones de productores, el 70% con menos de 5 hectáreas activas.', por_que: 'Registrarse y ser visible como productor es el primer paso para acceder a todos los programas de apoyo.', consejos: ['Regístrate en el SISA para ser elegible a programas de apoyo gubernamental.', 'Las asociaciones tienen mayor poder de negociación y acceso a programas especiales.', 'El Censo Nacional Agropecuario del DANE es la base que usa el gobierno para asignar recursos.'] },
  pests_risk:         { que_es: 'Las plagas más críticas incluyen roya del café, sigatoka negra, gusano cogollero y mosca de la fruta.', por_que: 'Una plaga no controlada puede destruir entre el 30% y el 100% de una cosecha entera en días.', consejos: ['ICA tiene el SIVIFITO con alertas fitosanitarias por departamento actualizadas.', 'El MIP combina control biológico, cultural y químico, reduciendo costos hasta un 40%.', 'Reporta plagas nuevas al ICA — hay programas de erradicación subsidiados disponibles.', 'AGROSAVIA tiene paquetes tecnológicos de manejo de plagas por cultivo (www.agrosavia.co).'] },
  diseases:           { que_es: 'Las principales enfermedades incluyen Fiebre Aftosa, Brucelosis bovina, Newcastle y Antracnosis en cultivos.', por_que: 'Las enfermedades pueden devastar una explotación entera y generar restricciones severas de exportación.', consejos: ['Aftosa y Brucelosis: la vacunación es OBLIGATORIA — el ICA hace operativos gratuitos.', 'Registra tu predio en el ICA para acceder a asistencia técnica veterinaria oficial.', 'FEDEGÁN tiene programas de salud animal para ganaderos (www.fedegan.org.co).', 'Bioseguridad: controla estrictamente el ingreso de animales externos a tu finca.'] },
  pest_impact:        { que_es: 'El impacto económico de plagas y enfermedades en Colombia supera los COP 3 billones anuales en pérdidas.', por_que: 'Cuantificar el impacto económico real justifica invertir en prevención antes que en remedios costosos.', consejos: ['Seguros agropecuarios cubren pérdidas por plagas — el gobierno subsidia parte de la prima.', 'Haz un análisis costo-beneficio antes de aplicar pesticidas en cada ciclo productivo.', 'Lleva registro de incidencia de plagas por temporada para anticiparte año a año.', 'AGROSAVIA tiene paquetes tecnológicos de manejo integrado de plagas por cultivo.'] },
}

/* ── Tipos ── */
interface WBRow { [key: string]: string | undefined }
interface CatData { data: WBRow; fuentes: Array<{ ico: string; txt: string; url: string }> }

/* ── Cache en memoria ── */
const gdCache: Record<string, CatData> = {}

/* ── Fetch Banco Mundial ── */
async function gdFetch(key: string): Promise<CatData> {
  if (gdCache[key]) return gdCache[key]
  const wb = WB_IND[key]
  if (!wb) return { data: { nota: 'Consulte Agronet o DANE.' }, fuentes: FUENTES[key] || [] }
  try {
    const res  = await fetch(
      `https://api.worldbank.org/v2/country/COL/indicator/${wb.ind}?format=json&mrv=5&per_page=5`
    )
    const json = await res.json()
    const entries: Array<{ date: string; value: number | null }> = json[1] || []
    const data: WBRow = { fuente_wb: `Banco Mundial — ${wb.label}` }
    entries.forEach(e => {
      if (e.value !== null)
        data[`Año ${e.date}`] = parseFloat(String(e.value)).toFixed(2) + ' ' + wb.unit
    })
    const result: CatData = { data, fuentes: FUENTES[key] || [] }
    gdCache[key] = result
    return result
  } catch {
    return { data: {}, fuentes: FUENTES[key] || [] }
  }
}

/* ═══════════════════════════════════════════════════════════════
   AMIGO GANADERO — sub-componentes
═══════════════════════════════════════════════════════════════ */

/* ── Contenido del panel ── */
function GPanel({ catKey, catData, loading }: {
  catKey: string
  catData: CatData | null
  loading: boolean
}) {
  const info    = CONTENT[catKey]
  const fuentes = FUENTES[catKey] || []

  if (loading) return (
    <div className="gp-loading">
      <i className="fa-solid fa-circle-notch fa-spin"></i>
      Consultando fuentes colombianas…
    </div>
  )

  return (
    <div className="gpanel-body-inner">
      {/* ¿Qué es? / ¿Por qué importa? / Consejos */}
      {info && (
        <div className="ginfo-block">
          <div className="ginfo-section">
            <div className="ginfo-label"><i className="fa-solid fa-circle-question"></i> ¿Qué es?</div>
            <p className="ginfo-text">{info.que_es}</p>
          </div>
          <div className="ginfo-section">
            <div className="ginfo-label"><i className="fa-solid fa-lightbulb"></i> ¿Por qué importa?</div>
            <p className="ginfo-text">{info.por_que}</p>
          </div>
          <div className="ginfo-section">
            <div className="ginfo-label"><i className="fa-solid fa-list-check"></i> Consejos prácticos</div>
            <ul className="ginfo-tips">
              {info.consejos.map((c, i) => (
                <li key={i}><i className="fa-solid fa-leaf"></i>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Datos Banco Mundial */}
      {catData && Object.keys(catData.data).filter(k => k !== 'fuente_wb').length > 0 && (
        <div className="gdata-block">
          <div className="gdata-header">
            <i className="fa-solid fa-chart-bar"></i> Datos reales — Colombia (Banco Mundial)
          </div>
          {catData.data.fuente_wb && (
            <div className="gdata-source">
              <i className="fa-solid fa-globe"></i> {catData.data.fuente_wb}
            </div>
          )}
          <table className="gdata-table">
            <tbody>
              {Object.entries(catData.data)
                .filter(([k]) => k !== 'fuente_wb')
                .map(([k, v]) => (
                  <tr key={k}>
                    <td className="gd-k">{k.replace(/_/g, ' ')}</td>
                    <td className="gd-v">{v ?? '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fuentes colombianas */}
      <div className="gfuentes-block">
        <div className="gfuentes-header">
          <i className="fa-solid fa-database"></i> Fuentes colombianas especializadas
        </div>
        <p className="gfuentes-nota">
          Para precios exactos, áreas y rendimientos por cultivo y departamento:
        </p>
        {fuentes.map((f, i) => (
          <div className="gfuente-item" key={i}>
            <i className={`fa-solid ${f.ico}`}></i>
            <span>{f.txt} — <strong>{f.url}</strong></span>
          </div>
        ))}
        <div className="gfuente-item">
          <i className="fa-solid fa-store"></i>
          <span>SIPSA-DANE — Precios semanales en 90+ plazas mayoristas — <strong>www.dane.gov.co/sipsa</strong></span>
        </div>
        <div className="gfuente-item">
          <i className="fa-solid fa-seedling"></i>
          <span>Agronet MADR — Área, producción y precios por cultivo — <strong>www.agronet.gov.co/estadistica</strong></span>
        </div>
      </div>
    </div>
  )
}

/* ── Card de categoría en la grid ── */
function GCat({ cat, isActive, onOpen }: {
  cat: typeof CATS[0]
  isActive: boolean
  onOpen: (key: string) => void
}) {
  const m = GM[cat.group] || GM['Producción']
  return (
    <div
      className={`gcat ${isActive ? 'gcat-active' : ''}`}
      style={{ '--gc': m.color, '--gb': m.bg, '--gbr': m.border } as React.CSSProperties}
      onClick={() => onOpen(cat.key)}
    >
      <span className="gcat-icon">
        <i className={`fa-solid ${cat.icon}`}></i>
      </span>
      <span className="gcat-title">{cat.title}</span>
      <i className="fa-solid fa-chevron-right gcat-arrow"></i>
    </div>
  )
}

/* ── Resultado de búsqueda (acordeón) ── */
function GResult({ cat, query }: { cat: typeof CATS[0]; query: string }) {
  const m = GM[cat.group] || GM['Producción']
  const [open, setOpen]     = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [data, setData]     = useState<CatData | null>(null)
  const [ldg, setLdg]       = useState(false)

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && !loaded) {
      setLdg(true)
      const d = await gdFetch(cat.key)
      setData(d); setLoaded(true); setLdg(false)
    }
  }

  const re  = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const ttl = cat.title.replace(re, '<mark class="gmark">$1</mark>')

  return (
    <div className={`gresult ${open ? 'gresult-open' : ''}`}>
      <div className="gresult-hd" onClick={toggle}>
        <span className="gresult-ico"
              style={{ color: m.color, background: m.bg, borderColor: m.border }}>
          <i className={`fa-solid ${cat.icon}`}></i>
        </span>
        <div className="gresult-info">
          <span className="gresult-ttl" dangerouslySetInnerHTML={{ __html: ttl }} />
          <span className="gresult-grp" style={{ color: m.color }}>{cat.group}</span>
        </div>
        <button className={`gresult-btn ${open ? 'active' : ''}`}>
          Ver datos <i className={`fa-solid fa-chevron-down gresult-chev ${open ? 'open' : ''}`}></i>
        </button>
      </div>
      {open && (
        <div className="gresult-body" style={{ borderTop: `1px solid ${m.border}` }}>
          <GPanel catKey={cat.key} catData={data} loading={ldg} />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TIPOS PRECIOS
═══════════════════════════════════════════════════════════════ */
const PRECIO_META: Record<string, {
  icon: string; bandColor: string; iconBg: string; iconColor: string
}> = {
  cafe:  { icon: 'fa-mug-hot',       bandColor: 'linear-gradient(90deg,#6f3d1e,#c8813a)', iconBg: 'linear-gradient(135deg,#7c4a22,#b56b2c)', iconColor: '#fde4b8' },
  maiz:  { icon: 'fa-seedling',      bandColor: 'linear-gradient(90deg,#c8a400,#f0d060)', iconBg: 'linear-gradient(135deg,#b89200,#d4aa20)', iconColor: '#fffbe0' },
  leche: { icon: 'fa-droplet',       bandColor: 'linear-gradient(90deg,#4a7cb8,#8ab5d8)', iconBg: 'linear-gradient(135deg,#3a6aaa,#5a90c8)', iconColor: '#e0f0ff' },
  pollo: { icon: 'fa-drumstick-bite',bandColor: 'linear-gradient(90deg,#b04010,#e07040)', iconBg: 'linear-gradient(135deg,#a03800,#d06030)', iconColor: '#ffe8d8' },
  papa:  { icon: 'fa-circle',        bandColor: 'linear-gradient(90deg,#6b4010,#a87840)', iconBg: 'linear-gradient(135deg,#5a3408,#906428)', iconColor: '#faecd0' },
  carne: { icon: 'fa-cow',           bandColor: 'linear-gradient(90deg,#8c1818,#d05050)', iconBg: 'linear-gradient(135deg,#7a1414,#c03838)', iconColor: '#ffe0e0' },
}

const slides = [
  { img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=1600', tag: 'Tecnología',   caption: 'Drones e inteligencia artificial: la nueva frontera del campo colombiano.' },
  { img: 'https://images.unsplash.com/photo-1580570598977-4b2412d01bbc?auto=format&fit=crop&q=80&w=1600', tag: 'Mercados',     caption: 'Tasas de interés y su impacto en los precios de exportación agrícola.' },
  { img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1600', tag: 'Producción',   caption: 'Cosecha Récord en Granos: ¿Qué significa para el mercado colombiano?' },
  { img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1600', tag: 'Exportaciones',caption: 'Colombia consolida su posición en el mercado mundial del café especial.' },
]

const newsCards = [
  { img: 'https://images.unsplash.com/photo-1593023333594-487b2f7dd415?auto=format&fit=crop&q=80&w=600',  tag: 'Ganadería',  title: 'Cuidado integral de tu ganado',         desc: 'Cómo garantizar la salud y productividad de tus reses con protocolos veterinarios y manejo de potreros.' },
  { img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=600',   tag: 'Cultivos',   title: 'Cultivos sanos y productivos',          desc: 'Técnicas modernas y ecológicas para mantener tus siembras resistentes, sin depender de agroquímicos caros.' },
  { img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=600', tag: 'Finanzas',   title: 'Finanzas rurales que sí funcionan',      desc: 'Organiza ingresos, controla gastos y toma decisiones inteligentes para tu emprendimiento del campo.' },
  { img: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=600', tag: 'Tecnología', title: 'Riego inteligente para tu finca',        desc: 'Optimiza el agua y mejora la cosecha con sensores de humedad y sistemas de riego automatizado.' },
  { img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=600',   tag: 'Política',   title: 'Guía de Subsidios Agrarios 2025',       desc: 'Todos los programas de apoyo del Gobierno para pequeños y medianos productores del sector rural.' },
  { img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600', tag: 'Sanidad',    title: 'Prevención y control de plagas',        desc: 'Identifica y combate las plagas más comunes antes de que dañen tu producción y cosecha.' },
  { img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600', tag: 'Mercado',    title: 'Análisis de precios de semillas',       desc: 'Fluctuación en los precios de semillas clave para una siembra rentable esta temporada.' },
  { img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600', tag: 'Maquinaria', title: 'Mantenimiento de maquinaria agrícola', desc: 'Consejos esenciales para el cuidado preventivo de tractores y equipos de campo.' },
]

function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

function VariacionBadge({ v }: { v: number | null }) {
  if (v === null || v === undefined) return <span className="precio-var neutral">Sin datos</span>
  const up = v > 0; const eq = v === 0
  return (
    <span className={`precio-var ${eq ? 'neutral' : up ? 'up' : 'down'}`}>
      {!eq && <i className={`fa-solid fa-arrow-trend-${up ? 'up' : 'down'}`}></i>}
      {eq ? 'Sin variación' : `${up ? '+' : ''}${v.toFixed(1)}%`}
    </span>
  )
}

function PrecioCard({ id, item }: { id: string; item: PrecioItem }) {
  const meta   = PRECIO_META[id] ?? PRECIO_META['maiz']
  const isCafe = id === 'cafe'
  return (
    <div className="precio-card">
      <div className="precio-card-band" style={{ background: meta.bandColor }} />
      <div className="precio-card-body">
        <div className="precio-card-header">
          <div className="precio-icon-wrap" style={{ background: meta.iconBg }}>
            <i className={`fa-solid ${meta.icon}`} style={{ color: meta.iconColor }}></i>
          </div>
          <div className="precio-title-group">
            <h3 className="precio-nombre">{item.nombre}</h3>
            <span className="precio-unidad">{item.unidad}</span>
          </div>
          {item.en_vivo && (
            <span className="precio-live-badge"><span className="live-dot"></span> En vivo</span>
          )}
        </div>
        <div className="precio-main-value">
          <span className="precio-amount">{formatCOP(item.precio)}</span>
          <VariacionBadge v={item.variacion} />
        </div>
        {isCafe && item.precio_carga && (
          <div className="precio-extra-row">
            <div className="precio-extra-item">
              <span className="precio-extra-label">Carga 125 kg</span>
              <span className="precio-extra-val">{formatCOP(item.precio_carga)}</span>
            </div>
            {item.bolsa_ny != null && (
              <div className="precio-extra-item">
                <span className="precio-extra-label">Bolsa NY</span>
                <span className="precio-extra-val">{item.bolsa_ny} ¢/lb</span>
              </div>
            )}
            {item.tasa_cambio != null && (
              <div className="precio-extra-item">
                <span className="precio-extra-label">TRM</span>
                <span className="precio-extra-val">{formatCOP(item.tasa_cambio)}</span>
              </div>
            )}
          </div>
        )}
        <div className="precio-footer">
          <i className="fa-solid fa-circle-info"></i>
          <span>{item.fuente}</span>
          {item.fuente_url && (
            <a href={`https://${item.fuente_url}`} target="_blank" rel="noopener noreferrer"
               className="precio-fuente-link" onClick={e => e.stopPropagation()}>
              <i className="fa-solid fa-arrow-up-right-from-square"></i> Ver fuente
            </a>
          )}
        </div>
        <div className="precio-fecha"><i className="fa-regular fa-calendar"></i> {item.fecha}</div>
      </div>
    </div>
  )
}

function PreciosSection() {
  const [precios, setPrecios]           = useState<PreciosResponse | null>(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [lastUpdated, setLastUpdated]   = useState<string | null>(null)

  const skeletonBands = [
    'linear-gradient(90deg,#6f3d1e,#c8813a)',
    'linear-gradient(90deg,#c8a400,#f0d060)',
    'linear-gradient(90deg,#4a7cb8,#8ab5d8)',
    'linear-gradient(90deg,#b04010,#e07040)',
    'linear-gradient(90deg,#6b4010,#a87840)',
    'linear-gradient(90deg,#8c1818,#d05050)',
  ]

  const fetchPrecios = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const data = await inicioService.getPrecios()
      setPrecios(data); setLastUpdated(data.actualizado)
    } catch { setError('No se pudieron cargar los precios. Verifica tu conexión e intenta de nuevo.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPrecios() }, [fetchPrecios])

  const precioEntries = precios ? (Object.entries(precios.precios) as [string, PrecioItem][]) : []

  return (
    <section className="precios-section">
      <div className="precios-inner">
        <div className="precios-header">
          <div className="precios-title-group">
            <div className="precios-supertag">Mercado Agropecuario Colombiano</div>
            <h2>Precios de <em>Referencia</em></h2>
            <p className="precios-subtitle">
              Precios actualizados del sector. El café proviene en tiempo real de la Federación Nacional de Cafeteros;
              los demás de SIPSA-DANE, MADR y gremios sectoriales.
            </p>
          </div>
          <div className="precios-controls">
            {lastUpdated && (
              <span className="precios-updated">
                <i className="fa-regular fa-clock"></i> Actualizado: {lastUpdated}
              </span>
            )}
            <button className="precios-refresh-btn" onClick={fetchPrecios} disabled={loading}>
              <i className={`fa-solid fa-rotate${loading ? ' fa-spin' : ''}`}></i>
              {loading ? 'Cargando...' : 'Actualizar precios'}
            </button>
          </div>
        </div>

        {error && (
          <div className="precios-error">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
            <button onClick={fetchPrecios}>Reintentar</button>
          </div>
        )}

        {loading && !precios && (
          <div className="precios-skeleton-grid">
            {skeletonBands.map((band, i) => (
              <div className="precio-skeleton" key={i}>
                <div className="skel-band" style={{ background: band }} />
                <div className="skel-body">
                  <div className="skel skel-header"></div>
                  <div className="skel skel-value"></div>
                  <div className="skel skel-footer"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {precios && (
          <div className="precios-grid">
            {precioEntries.map(([id, item]) => (
              <PrecioCard key={id} id={id} item={item} />
            ))}
          </div>
        )}

        <div className="precios-disclaimer">
          <i className="fa-solid fa-shield-halved"></i>
          Precios de referencia informativa. Para operaciones comerciales consulte directamente con gremios y fuentes oficiales. Caché renovada cada 6 horas.
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
export default function InicioIndex() {
  const [curSlide, setCurSlide] = useState(0)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const panelRef  = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [modal, setModal]       = useState<{ title: string; desc: string; img: string; tag: string } | null>(null)
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [weather, setWeather] = useState({ temp: '--', humidity: '--', wind: '--', desc: '--' })
  const [weatherIcon, setWeatherIcon] = useState('fa-cloud-sun')

  /* ── Amigo Ganadero state ── */
  const [searchQuery, setSearchQuery] = useState('')
  const [showGrid, setShowGrid]       = useState(false)
  const [activeChip, setActiveChip]   = useState('')
  const [activePK, setActivePK]       = useState<string | null>(null)
  const [panelData, setPanelData]     = useState<CatData | null>(null)
  const [panelLoading, setPanelLoading] = useState(false)

  /* ── Carrusel ── */
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurSlide(p => (p + 1) % slides.length), 5500)
  }, [])

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [resetTimer])

  const goSlide = (n: number) => { setCurSlide((n + slides.length) % slides.length); resetTimer() }

  /* ── Scroll reveal ── */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((_, i) => setRevealed(p => new Set(p).add(i))); return
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = Array.from(els).indexOf(e.target)
          setRevealed(p => new Set(p).add(idx)); obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  /* ── Clima ── */
  const fetchWeather = () => {
    setWeatherOpen(p => !p)
    inicioService.getClima().then(d => {
      setWeather({ temp: `${d.main.temp} °C`, humidity: `${d.main.humidity}%`, wind: `${d.wind.speed} m/s`, desc: d.weather[0].description })
      const desc = (d.weather[0].description || '').toLowerCase()
      if (desc.includes('clear') || desc.includes('sun')) setWeatherIcon('fa-sun')
      else if (desc.includes('rain') || desc.includes('drizzle')) setWeatherIcon('fa-cloud-showers-heavy')
      else if (desc.includes('cloud')) setWeatherIcon('fa-cloud')
      else setWeatherIcon('fa-cloud-sun')
    }).catch(() => setWeather({ temp: 'Error', humidity: '--', wind: '--', desc: 'Error al obtener clima' }))
  }

  /* ── Amigo Ganadero: abrir panel en la grid ── */
  const openGridPanel = useCallback(async (key: string) => {
    if (activePK === key) { setActivePK(null); setPanelData(null); return }
    setActivePK(key)
    setPanelData(null)
    setPanelLoading(true)
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120)
    const d = await gdFetch(key)
    setPanelData(d); setPanelLoading(false)
  }, [activePK])

  const chips = [
    { label: 'Ver todas',    q: ''         },
    { label: 'Precios',      q: 'precio'   },
    { label: 'Exportaciones',q: 'exporta'  },
    { label: 'Subsidios',    q: 'subsidio' },
    { label: 'Plagas',       q: 'plaga'    },
    { label: 'Cosecha',      q: 'cosecha'  },
    { label: 'Mercados',     q: 'mercado'  },
  ]

  const filteredCats = searchQuery.trim()
    ? CATS.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.key.toLowerCase().includes(searchQuery.toLowerCase()))
    : CATS

  const groupedCats = CATS.reduce<Record<string, typeof CATS>>((acc, c) => {
    if (!acc[c.group]) acc[c.group] = []
    acc[c.group].push(c); return acc
  }, {})

  const activeCat = activePK ? CATS.find(c => c.key === activePK) : null
  const activeGM  = activeCat ? (GM[activeCat.group] || GM['Producción']) : null

  return (
    <div className="inicio-page">

      {/* ══ HERO ══ */}
      <div className="hero-principal">
        <div className="carrusel-track">
          {slides.map((s, i) => (
            <div className={`carrusel-slide ${i === curSlide ? 'active' : ''}`} key={i}>
              <img src={s.img} alt={s.tag} />
              <div className="carrusel-caption">
                <span className="caption-tag">{s.tag}</span>
                <h3>{s.caption}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-brand">
          <div className="hero-emblem">
            <div className="hero-emblem-line"></div>
            <div className="hero-emblem-dot"></div>
            <div className="hero-emblem-line"></div>
          </div>
          <h1>Agro<em>Finanzas</em></h1>
          <p>Decisiones inteligentes para el campo</p>
        </div>
        <button className="carrusel-btn prev" onClick={() => goSlide(curSlide - 1)} aria-label="Anterior">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button className="carrusel-btn next" onClick={() => goSlide(curSlide + 1)} aria-label="Siguiente">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
        <div className="carrusel-dots">
          {slides.map((_, i) => (
            <button key={i} className={`carrusel-dot ${i === curSlide ? 'active' : ''}`}
                    onClick={() => goSlide(i)} aria-label={`Slide ${i + 1}`}></button>
          ))}
        </div>
      </div>

      {/* ══ TICKER ══ */}
      <div className={`noticias-banner reveal ${revealed.has(0) ? 'revealed' : ''}`}>
        <div className="banner-inner">
          <div className="banner-badge">
            <i className="fa-solid fa-circle" style={{ fontSize: '.4rem' }}></i> En vivo
          </div>
          <div className="ticker-wrap">
            <div className="ticker">
              <span>
                Café: +3.2% &nbsp;·&nbsp; Maíz: −1.4% &nbsp;·&nbsp; Leche: sin variación &nbsp;·&nbsp;
                Pollo: +0.8% &nbsp;·&nbsp; Nuevos subsidios FINAGRO &nbsp;·&nbsp;
                Alerta sequía: Boyacá y Cundinamarca &nbsp;·&nbsp;
                Café: +3.2% &nbsp;·&nbsp; Maíz: −1.4% &nbsp;·&nbsp;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ PRECIOS ══ */}
      <PreciosSection />

      {/* ══ NOTICIAS ══ */}
      <section className="noticias-section">
        <div className={`section-header reveal ${revealed.has(1) ? 'revealed' : ''}`}>
          <div className="section-eyebrow">Artículos &amp; Guías</div>
          <h2 className="section-titulo">Noticias del <em>Campo</em></h2>
        </div>
        <div className="noticias-grid">
          {newsCards.map((card, i) => (
            <article
              className={`noticia-card reveal ${revealed.has(i + 2) ? 'revealed' : ''}`}
              key={i}
              onClick={() => setModal(card)}
            >
              <div className="noticia-img">
                <img src={card.img} alt={card.title} />
                <span className="noticia-tag">{card.tag}</span>
              </div>
              <div className="noticia-body">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <span className="noticia-link">Leer más <i className="fa-solid fa-arrow-right"></i></span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ══ AMIGO GANADERO ══ */}
      <section className="ganadero-section" id="amigo-ganadero">
        <div className="ganadero-inner">

          {/* Layout intro + buscador */}
          <div className="ganadero-layout">
            <div className="ganadero-intro">
              <div className="section-eyebrow">Base de Conocimiento</div>
              <h2 className="section-titulo">Amigo <em>Ganadero</em></h2>
              <p className="section-sub">
                Busca cualquier tema del sector agropecuario y accede a datos
                actualizados: precios, mercados, subsidios, plagas y mucho más.
              </p>
              <div className="gstats">
                <div className="gstat"><span className="gstat-n">23</span><span className="gstat-l">Categorías</span></div>
                <div className="gstat"><span className="gstat-n">4</span><span className="gstat-l">Grupos</span></div>
                <div className="gstat"><span className="gstat-n">API</span><span className="gstat-l">Datos en vivo</span></div>
              </div>
            </div>

            {/* Buscador */}
            <div className="gsearch-box">
              <div className="gsearch-row">
                <i className="fa-solid fa-magnifying-glass gsearch-ico"></i>
                <input
                  type="text"
                  className="gsearch-input"
                  placeholder="Ej: subsidios, exportaciones, plagas..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowGrid(false); setActivePK(null) }}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button className="gsearch-clear"
                          onClick={() => { setSearchQuery(''); setShowGrid(false); setActivePK(null) }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
              <div className="gchips-row">
                <span className="gchip-label">Búsquedas rápidas:</span>
                {chips.map(chip => (
                  <button
                    key={chip.label}
                    className={`gchip ${activeChip === chip.label ? 'active' : ''}`}
                    onClick={() => {
                      setActiveChip(chip.label)
                      setActivePK(null)
                      if (chip.q === '') { setSearchQuery(''); setShowGrid(true) }
                      else { setSearchQuery(chip.q); setShowGrid(false) }
                    }}
                  >{chip.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Grid: TODAS las categorías ── */}
          {showGrid && !searchQuery && (
            <>
              <div className="ganadero-grid">
                {Object.entries(groupedCats).map(([group, cats]) => {
                  const m = GM[group] || GM['Producción']
                  return (
                    <div className="ggroup" key={group}>
                      <h3 className="ggroup-title" style={{ color: m.color }}>
                        <span className="ggroup-dot" style={{ background: m.color }}></span>
                        {group}
                      </h3>
                      <div className="gcards">
                        {cats.map(cat => (
                          <GCat
                            key={cat.key}
                            cat={cat}
                            isActive={activePK === cat.key}
                            onOpen={openGridPanel}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Panel de detalle (grid) */}
              {activePK && activeCat && activeGM && (
                <div
                  ref={panelRef}
                  className="ganadero-panel"
                  style={{ borderColor: activeGM.border }}
                >
                  <div className="gpanel-hdr">
                    <div className="gpanel-ttl">
                      <span className="gpanel-ico-wrap"
                            style={{ color: activeGM.color, background: activeGM.bg, border: `1px solid ${activeGM.border}` }}>
                        <i className={`fa-solid ${activeCat.icon}`}></i>
                      </span>
                      <h3>{activeCat.title}</h3>
                    </div>
                    <button className="gpanel-cls" onClick={() => { setActivePK(null); setPanelData(null) }}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  <GPanel catKey={activePK} catData={panelData} loading={panelLoading} />
                </div>
              )}
            </>
          )}

          {/* ── Resultados búsqueda (acordeones) ── */}
          {searchQuery.trim() && (
            <div className="gsearch-results-wrap">
              <div className="gsearch-status">
                {filteredCats.length > 0
                  ? <><i className="fa-solid fa-check-circle" style={{ color: '#4A7C3F' }}></i>
                      {' '}<strong>{filteredCats.length}</strong> resultado{filteredCats.length !== 1 ? 's' : ''} para{' '}
                      &ldquo;<strong>{searchQuery}</strong>&rdquo;</>
                  : <><i className="fa-solid fa-circle-info"></i>
                      {' '}Sin resultados para &ldquo;<strong>{searchQuery}</strong>&rdquo;</>
                }
              </div>
              {filteredCats.map(cat => (
                <GResult key={cat.key} cat={cat} query={searchQuery} />
              ))}
            </div>
          )}

          {/* ── Hint inicial ── */}
          {!showGrid && !searchQuery.trim() && (
            <div className="gsearch-hint">
              <i className="fa-solid fa-seedling"></i>
              <p>Escribe en el buscador o selecciona una búsqueda rápida para explorar las{' '}
                <strong>23 categorías</strong> del sector agropecuario colombiano.</p>
            </div>
          )}

        </div>
      </section>

      {/* ══ MODAL ══ */}
      {modal && (
        <div className="modal-overlay visible" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img className="modal-img" src={modal.img} alt={modal.title} />
            <div className="modal-body">
              <span className="modal-cat">{modal.tag}</span>
              <h2>{modal.title}</h2>
              <p className="modal-resumen">{modal.desc}</p>
              <div className="modal-contenido">
                <p>{modal.desc} En los últimos meses el sector agropecuario colombiano ha evidenciado cambios
                  significativos que impactan la rentabilidad de los productores. Expertos del DANE y del
                  Ministerio de Agricultura destacan la importancia de modernizar las prácticas tradicionales.</p>
                <p>Se recomienda mantenerse informado sobre las fluctuaciones del mercado y aprovechar los
                  programas disponibles a través de FINAGRO y el Banco Agrario de Colombia.</p>
                <p className="modal-fecha">
                  <i className="fa-regular fa-calendar"></i> Publicado el 17 de Febrero, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ WEATHER ══ */}
      <div className={`weather-widget ${weatherOpen ? 'show' : ''}`} onClick={fetchWeather}>
        <div className="weather-icon-wrap">
          <i className={`fa-solid ${weatherIcon}`} style={{ color: '#D4841A' }}></i>
        </div>
        <div className="weather-tooltip">
          <h4>Clima Actual</h4>
          <hr />
          <p><i className="fa-solid fa-location-dot"></i> Bogotá, Colombia</p>
          <p><i className="fa-solid fa-temperature-half"></i> Temperatura: {weather.temp}</p>
          <p><i className="fa-solid fa-droplet"></i> Humedad: {weather.humidity}</p>
          <p><i className="fa-solid fa-wind"></i> Viento: {weather.wind}</p>
          <p><i className="fa-solid fa-magnifying-glass"></i> {weather.desc}</p>
        </div>
      </div>

    </div>
  )
}