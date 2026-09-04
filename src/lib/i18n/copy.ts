export type Locale = "en" | "es";

const en = {
  skip: "Skip to content",
  notFoundEyebrow: "404",
  notFoundTitle: "This page has left the frame.",
  notFoundBack: "Back to the studio",
  langEn: "EN",
  langEs: "ES",
  langSwitch: "Language",
  nav: {
    studio: "Studio",
    gallery: "Gallery",
    pricing: "Pricing",
    team: "Team",
    faq: "FAQ",
    contact: "Contact",
    event: "Event",
  },
  cta: {
    shoot: "Book a Shoot",
    rent: "Rent now",
    peerspace: "Book with Peerspace",
  },
  footer: {
    blurb:
      "In-house photography and a rentable cyclorama in Lawrenceville, Georgia. Book the team — or take the room.",
    visit: "Visit",
    studio: "Studio",
    inquire: "Inquire",
    rentalInquiry: "Studio rental inquiry",
    rights: "All rights reserved.",
  },
  hero: {
    eyebrow: "In-house photography",
    title: "A studio made of light.",
    lede: "Directed sessions on the cyclorama — maternity, newborns, families, brands, headshots, celebrations. Or take the room yourself.",
  },
  home: {
    studioEyebrow: "The studio",
    studioTitle: "An infinity wall. Controlled light. A floor that stays out of the way.",
    studioP1:
      "Lighthill is a 1,200 square-foot photography studio in Lawrenceville — just outside Atlanta. We built it first for our own sessions: maternity, newborns, brands, headshots, families, seasonals, celebrations, and podcasts. The cyclorama and the strobes are the reason the work looks the way it does.",
    studioP2:
      "When we are not on set, the room is available to other photographers, videographers, and small productions. Book the in-house team, or rent the space.",
    seeSpace: "See the space",
    bookTeam: "Book the team",
    inHouse: "In-house",
    inHouseTitle: "Directed sessions, in a room we know.",
    inHouseLede: "Start with the team. If you already have a photographer, rent the studio by the hour.",
    tour: "Tour the studio",
    selectedEyebrow: "Selected work",
    selectedTitle: "Quiet direction. Light that does the talking.",
    viewGallery: "View the gallery",
    readyTitle: "Ready when you are.",
    readyLede:
      "Tell us about the session. We will come back with dates, a brief, and a clear next step — in-house or a rental.",
    startInquiry: "Start an inquiry",
    eventBanner: "The Colorful Experience — September 26",
    eventCta: "Get tickets",
  },
  studio: {
    eyebrow: "The studio",
    amenities: "Amenities",
    amenitiesTitle: "Built for working creatives, not for Instagram alone.",
    introTitle: "A quiet floor with a true infinity wall.",
    introBody:
      "Lighthill is a 1,200 square-foot studio in Lawrenceville — built for photographers, videographers, and small productions who want a cyclorama, controlled strobe lighting, and enough room to work without a warehouse echo.",
    features: {
      cyclorama: {
        title: "White infinity wall",
        description:
          "A full cyclorama that disappears the horizon. Portraits, maternity, branding, and talking-head video all sit cleanly on the cove — no wrinkled muslin, no visible floor line.",
      },
      lighting: {
        title: "Studio lighting",
        description:
          "Godox strobes, octas, and modifiers ready as add-ons. The base rental is the room and the cyclorama — bring your own kit, or use ours. No guessing at the weather.",
      },
      podcast: {
        title: "Podcast set",
        description:
          "A finished interview corner: channel-tufted chairs, a wood-slat wall, and a round table already dressed. Sit down and record — or photograph the hosts in place.",
      },
      sets: {
        title: "Built-in sets",
        description:
          "A navy paneled desk for branding, a lounge chair against warm slats, and a peacock chair with pampas for portraits. Change the story without building a set from scratch.",
      },
      dressing: {
        title: "Changing room & restroom",
        description:
          "A private, accessible restroom on the floor with a sink, mirror, and room to change. Clients can settle in without living out of a duffel on the studio floor.",
      },
    },
    amenitiesList: {
      wifi: { title: "High-speed Wi-Fi", detail: "Tethering and uploads without hunting for a hotspot." },
      parking: { title: "Free parking", detail: "On-site spaces. No garage run, no meters." },
      climate: { title: "Air conditioning", detail: "The floor stays comfortable through Georgia summers." },
      access: { title: "Street-level access", detail: "No freight elevator. Roll a cart straight in." },
      restrooms: { title: "Restrooms", detail: "On the floor, not down a hallway in another suite." },
      paper: { title: "Color paper rolls", detail: "A rack of seamless colors when white isn’t the story." },
      power: { title: "Clean power", detail: "Outlets placed for stands, packs, and a tether station." },
      capacity: { title: "20 people", detail: "Crew, talent, and clients — up to twenty on the floor." },
    },
    specs: {
      Floor: "Floor",
      Capacity: "Capacity",
      Cyclorama: "Cyclorama",
      Light: "Light",
      Access: "Access",
      Hours: "Hours",
      Parking: "Parking",
    },
  },
  gallery: {
    eyebrow: "Gallery",
    title: "The work, and the room it was made in.",
    lede: "Sessions made here — maternity, newborns, families, brands, headshots, seasonals, celebrations. Tap any frame.",
    all: "All",
    cats: {
      Studio: "Studio",
      Maternity: "Maternity",
      Newborn: "Newborn",
      Branding: "Branding",
      Headshots: "Headshots",
      Family: "Family",
      Seasonals: "Seasonals",
      Celebrations: "Celebrations",
      Podcasts: "Podcasts",
    },
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Packages for the work. A rate for the room.",
    lede: "In-house sessions are directed by the Lighthill team. Write us for a quote. Studio rental is the room — bring your own photographer.",
    inHouse: "Section A — In-house",
    inHouseTitle: "Photography with the studio team.",
    inquire: "Inquire",
    writeUs: "Write us",
    rental: "Section B — Studio rental",
    rentalTitle: "The cyclorama, by the hour.",
    rentalLede:
      "Bring your own photographer. Instant-book on this site with a 50% deposit, or keep using Peerspace.",
    addons: "Add-ons",
    notes: [
      "In-house sessions are quoted for one photographer and include the studio. Travel days are separate. Write us for availability and a number that fits the work.",
      "Studio rental is $55 / hour with a two-hour minimum. Book on this site with a 50% deposit, or on Peerspace.",
      "A retainer confirms in-house dates. The balance is due the day of the session. We will send terms with the quote.",
      "Additional retouching and rush delivery can be added after the gallery lands.",
    ],
  },
  services: {
    maternity: {
      title: "Maternity",
      kicker: "Portraits",
      description: "Quiet, filmic sessions on the cyclorama. Made to feel like stills, not setups.",
    },
    newborn: {
      title: "Newborn",
      kicker: "Portraits",
      description:
        "Slow, warm sessions for the first days. Wrapped, posed, and lit with studio strobes — never rushed.",
    },
    branding: {
      title: "Branding",
      kicker: "Commercial",
      description:
        "Personal brand and small-business imagery with room to move. Portrait and lifestyle in one space.",
    },
    headshots: {
      title: "Headshots",
      kicker: "Corporate",
      description:
        "Clean, directed portraits for teams, LinkedIn, and the press page — lit on the infinity wall.",
    },
    family: {
      title: "Family",
      kicker: "Portraits",
      description:
        "Unhurried family sessions. Neutral wardrobe, directed posing, and a floor the kids can actually use.",
    },
    seasonals: {
      title: "Seasonals",
      kicker: "Mini sessions",
      description:
        "Holiday and seasonal sets that change with the calendar — Easter, fall, Christmas, and the in-between.",
    },
    celebrations: {
      title: "Celebrations",
      kicker: "Events",
      description: "Birthdays, cake smash, and the little productions that still deserve a real set.",
    },
    podcasts: {
      title: "Podcasts",
      kicker: "Production",
      description:
        "A dedicated interview set — slat wall, lounge chairs, and light already built for talking-head video.",
    },
  },
  packages: {
    maternity: "Maternity",
    newborn: "Newborn",
    branding: "Brand Studio",
    headshots: "Corporate / Headshots",
    family: "Family Session",
    seasonals: "Seasonals",
    celebrations: "Celebrations",
    podcasts: "Podcast Session",
  },
  team: {
    eyebrow: "The people",
    title: "Co-owners, side by side.",
    body: "Luz Reyes and Hillary Urgelles built Lighthill together, and they still shoot it that way — two photographers, one floor, working every session as a pair. Book the in-house team, or rent the space and bring your own.",
    coOwner: "Co-owner",
    workWithUs: "Work with us",
    luz: "Luz is a co-owner of Lighthill. She and Hillary work every session side by side — maternity, newborns, families, and personal brands — sharing the directing and the light. She treats the cyclorama like a set, not a box.",
    hillary:
      "Hillary is a co-owner of Lighthill. She and Luz work the floor together on seasonal sets, celebrations, branding, and podcast days — keeping the room moving and the light consistent, from a toddler on the cove to a founder at the desk.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "What to know before you step on the floor.",
    lede: "Sessions, rentals, and the house rules we keep so the cyclorama stays white.",
    still: "Still have a question",
    groups: {
      Sessions: "Sessions",
      Rentals: "Rentals",
      "House rules": "House rules",
    },
    items: {
      "what-to-expect": {
        q: "What should I expect at an in-house shoot?",
        a: "You’ll be met by the photographer, walked through the floor, and given time in the dressing area. Sessions are directed but unhurried — we light, we shoot, we recast if a look isn’t working. Galleries typically land within seven days.",
      },
      wardrobe: {
        q: "What should I wear?",
        a: "Bring two or three looks in a tight palette — cream, black, navy, earth. Avoid giant logos and neon. We keep a few studio pieces on the rack if something isn’t sitting right. A planning note goes out after you book.",
      },
      "plus-ones": {
        q: "Can I bring my partner, kids, or a stylist?",
        a: "Yes. Capacity is twenty people including crew. Tell us who is coming when you book so we can plan the floor. Children are welcome; we just keep snacks and markers off the cyclorama.",
      },
      "session-cancel": {
        q: "What is the cancellation policy for in-house sessions?",
        a: "A retainer holds the date. Cancel or reschedule seven or more days out and the retainer transfers to a new date within six months. Inside seven days the retainer is forfeited. Inside 24 hours the full session fee is due. Terms come with your quote.",
      },
      usage: {
        q: "How can I use the photographs?",
        a: "Personal sessions include personal usage and social sharing. Brand and commercial packages include web and print usage for the commissioning business. Extended licensing, paid ads, and third-party usage can be added in writing.",
      },
      "how-to-rent": {
        q: "How do I rent the studio?",
        a: "Book on this site with Rent now — live availability, 50% deposit, instant confirmation. Lighting, paper, and an assistant are add-ons at checkout. Peerspace stays open as a second door.",
      },
      "rental-minimum": {
        q: "Is there a minimum rental?",
        a: "Yes. Two hours, at $55 per hour. Bookings of eight hours or more receive 20% off. The studio is available 24 hours — the shopping plaza doesn’t close.",
      },
      "rental-gear": {
        q: "Does the rental include lights?",
        a: "No. The base rate is the room, the cyclorama, Wi-Fi, parking, and the dressing area. Bring your own kit, or add flashes, modifiers, and paper through the host. We are happy to walk first-time renters through the wall.",
      },
      "rental-cancel": {
        q: "What is the rental cancellation policy?",
        a: "A 50% deposit confirms the time. Full refund of the deposit if you cancel at least 48 hours before start. Inside 48 hours the deposit is held. Write us if you need to move the date. Peerspace bookings still follow Peerspace’s policy.",
      },
      "leave-it": {
        q: "How should I leave the studio?",
        a: "As you found it. Trash out, furniture and props back, spills wiped, cyclorama scuffs reported. Excessive cleaning or damage beyond normal use may be billed. Tape and clamps are fine; no drilling, no paint, no glitter.",
      },
      food: {
        q: "Is food and drink allowed?",
        a: "Yes, off the cyclorama. Water on set is fine with a cap. Coffee, oil, red sauces, and anything that stains stay in the dressing area. Alcohol is allowed for talent only, not for a party — this is a working floor.",
      },
      parking: {
        q: "Where do I park, and how do I get in?",
        a: "Free on-site parking and street-level access. The exact address and entry notes go out with your confirmation.",
      },
    },
  },
  contact: {
    eyebrow: "Contact",
    title: "Tell us what you are making.",
    lede: "In-house sessions start with a note — we’ll send a quote. Studio rentals book instantly on Rent now — or ask us anything first.",
    studio: "Studio",
    preferRent: "Prefer to rent? Rent now",
    name: "Name",
    email: "Email",
    phone: "Phone",
    projectType: "Project type",
    shoot: "In-House Shoot",
    rental: "Studio Rental Inquiry",
    message: "Message",
    placeholder: "Tell us the date, the kind of session, and anything we should know.",
    send: "Send inquiry",
    sending: "Sending…",
    received: "Message received.",
    thanks:
      "Thank you. We read every note and will reply within one business day with next steps — dates, a brief, or a quote.",
    another: "Send another",
    error: "Something went sideways. Email us directly, or try again in a moment.",
  },
  rent: {
    eyebrow: "Studio rental",
    title: "The cyclorama, by the hour.",
    lede: "Instant book. $55 an hour, two-hour minimum, 50% deposit due now. The floor stays in step with the studio calendar.",
    cancelled: "Checkout was cancelled. Nothing was charged — pick a time again when you are ready.",
    paused: "Direct checkout is paused. Book the room on Peerspace, or write us.",
    write: "Write the studio",
    hours: "Hours",
    minNote: "Two-hour minimum. 20% off at 8 hours.",
    dayNote: "8+ hour day includes 20% off.",
    date: "Date",
    checking: "Checking the floor…",
    noOpenings: "No openings of that length in the next 60 days. Try a shorter block.",
    startTime: "Start time",
    addons: "Add-ons",
    flashes: "Studio flashes · $40",
    softboxes: "Softboxes & modifiers · $30",
    paper: "Paper roll colors",
    assistant: "Assistant hours",
    yourName: "Your name",
    guests: "Guests",
    email: "Email",
    phone: "Phone",
    notes: "Notes for the studio (optional)",
    pay: "Pay 50% deposit",
    paying: "Opening checkout…",
  },
  event: {
    eyebrow: "September 26, 2026",
    title: "The Colorful Experience",
    lede: "A night of color at Lighthill Studio. Pick a ticket, pay on Stripe, and you’re in.",
    whenLabel: "When",
    when: "Saturday, September 26, 2026",
    whereLabel: "Where",
    where: "Lighthill Studio, Lawrenceville, Georgia",
    tickets: "Tickets",
    ticketsLede: "Choose a ticket. Stripe takes the payment. Your receipt is the confirmation.",
    qty: "Quantity",
    buy: "Buy ticket",
    buying: "Opening checkout…",
    loading: "Loading tickets…",
    empty: "Tickets will appear here as soon as they are live in Stripe.",
    emptyHint: "If you just switched to live mode, paste the live keys in Desk → Settings.",
    cancelled: "Checkout was cancelled. Nothing was charged.",
    confirmedTitle: "You’re in.",
    confirmedLede: "The Colorful Experience — September 26. Stripe emailed your receipt.",
    confirmedBody: "Bring the receipt to the door. We’ll send arrival notes to the email on the ticket.",
    backHome: "Back to the studio",
  },
};

const es: typeof en = {
  skip: "Saltar al contenido",
  notFoundEyebrow: "404",
  notFoundTitle: "Esta página salió de cuadro.",
  notFoundBack: "Volver al estudio",
  langEn: "EN",
  langEs: "ES",
  langSwitch: "Idioma",
  nav: {
    studio: "Estudio",
    gallery: "Galería",
    pricing: "Precios",
    team: "Equipo",
    faq: "Preguntas",
    contact: "Contacto",
    event: "Evento",
  },
  cta: {
    shoot: "Reservar sesión",
    rent: "Rentar ahora",
    peerspace: "Reservar en Peerspace",
  },
  footer: {
    blurb:
      "Fotografía de casa y un ciclorama para rentar en Lawrenceville, Georgia. Reserva al equipo — o toma la sala.",
    visit: "Visitar",
    studio: "Estudio",
    inquire: "Consultar",
    rentalInquiry: "Consulta de renta",
    rights: "Todos los derechos reservados.",
  },
  hero: {
    eyebrow: "Fotografía de casa",
    title: "Un estudio hecho de luz.",
    lede: "Sesiones dirigidas en el ciclorama — maternidad, recién nacidos, familias, marca, retratos, celebraciones. O toma la sala tú.",
  },
  home: {
    studioEyebrow: "El estudio",
    studioTitle: "Un muro infinito. Luz controlada. Un piso que no se interpone.",
    studioP1:
      "Lighthill es un estudio de 1,200 pies cuadrados en Lawrenceville — a un paso de Atlanta. Lo construimos primero para nuestras propias sesiones: maternidad, recién nacidos, marca, retratos, familias, temporadas, celebraciones y podcasts. El ciclorama y los flashes son la razón de que el trabajo se vea así.",
    studioP2:
      "Cuando no estamos en set, la sala está disponible para otros fotógrafos, videógrafos y producciones pequeñas. Reserva al equipo de casa, o renta el espacio.",
    seeSpace: "Ver el espacio",
    bookTeam: "Reservar al equipo",
    inHouse: "De casa",
    inHouseTitle: "Sesiones dirigidas, en una sala que conocemos.",
    inHouseLede: "Empieza con el equipo. Si ya tienes fotógrafo, renta el estudio por hora.",
    tour: "Recorrer el estudio",
    selectedEyebrow: "Trabajo seleccionado",
    selectedTitle: "Dirección quieta. Luz que habla.",
    viewGallery: "Ver la galería",
    readyTitle: "Cuando tú quieras.",
    readyLede:
      "Cuéntanos la sesión. Respondemos con fechas, un brief y el siguiente paso — de casa o una renta.",
    startInquiry: "Empezar una consulta",
    eventBanner: "The Colorful Experience — 26 de septiembre",
    eventCta: "Boletos",
  },
  studio: {
    eyebrow: "El estudio",
    amenities: "Amenidades",
    amenitiesTitle: "Hecho para creativos que trabajan, no solo para Instagram.",
    introTitle: "Un piso quieto con un verdadero muro infinito.",
    introBody:
      "Lighthill es un estudio de 1,200 pies cuadrados en Lawrenceville — para fotógrafos, videógrafos y producciones pequeñas que quieren un ciclorama, luz de estudio y espacio para trabajar sin eco de bodega.",
    features: {
      cyclorama: {
        title: "Muro infinito blanco",
        description:
          "Un ciclorama completo que desaparece el horizonte. Retratos, maternidad, marca y video se sientan limpios en la cove — sin muselina arrugada, sin línea de piso.",
      },
      lighting: {
        title: "Iluminación de estudio",
        description:
          "Flashes Godox, octas y modificadores como extras. La renta base es la sala y el ciclorama — trae tu equipo, o usa el nuestro. Sin adivinar el clima.",
      },
      podcast: {
        title: "Set de podcast",
        description:
          "Una esquina de entrevista lista: sillas capitoné, muro de listones y mesa redonda. Siéntate a grabar — o fotografía a los hosts en su lugar.",
      },
      sets: {
        title: "Sets fijos",
        description:
          "Un escritorio de paneles navy para marca, un lounge contra listones cálidos, y una silla pavo real con pampas. Cambia la historia sin armar un set desde cero.",
      },
      dressing: {
        title: "Vestidor y baño",
        description:
          "Un baño privado y accesible en el piso, con lavabo, espejo y espacio para cambiarse. Los clientes no tienen que vivir de una maleta en el piso.",
      },
    },
    amenitiesList: {
      wifi: { title: "Wi-Fi de alta velocidad", detail: "Tether y cargas sin buscar un hotspot." },
      parking: { title: "Estacionamiento gratis", detail: "Espacios en el sitio. Sin cochera, sin parquímetro." },
      climate: { title: "Aire acondicionado", detail: "El piso se mantiene fresco en el verano de Georgia." },
      access: { title: "Acceso a nivel de calle", detail: "Sin elevador de carga. Entra el carrito directo." },
      restrooms: { title: "Baños", detail: "En el piso, no al fondo de otro local." },
      paper: { title: "Fondos de papel", detail: "Un rack de colores seamless cuando el blanco no es la historia." },
      power: { title: "Energía limpia", detail: "Contactos para stands, packs y una estación de tether." },
      capacity: { title: "20 personas", detail: "Crew, talento y clientes — hasta veinte en el piso." },
    },
    specs: {
      Floor: "Piso",
      Capacity: "Capacidad",
      Cyclorama: "Ciclorama",
      Light: "Luz",
      Access: "Acceso",
      Hours: "Horario",
      Parking: "Estacionamiento",
    },
  },
  gallery: {
    eyebrow: "Galería",
    title: "El trabajo, y la sala donde se hizo.",
    lede: "Sesiones hechas aquí — maternidad, recién nacidos, familias, marca, retratos, temporadas, celebraciones. Toca cualquier cuadro.",
    all: "Todo",
    cats: {
      Studio: "Estudio",
      Maternity: "Maternidad",
      Newborn: "Recién nacido",
      Branding: "Marca",
      Headshots: "Retratos",
      Family: "Familia",
      Seasonals: "Temporadas",
      Celebrations: "Celebraciones",
      Podcasts: "Podcasts",
    },
  },
  pricing: {
    eyebrow: "Precios",
    title: "Paquetes para el trabajo. Una tarifa para la sala.",
    lede: "Las sesiones de casa las dirige el equipo de Lighthill. Escríbenos por una cotización. La renta es la sala — trae tu fotógrafo.",
    inHouse: "Sección A — De casa",
    inHouseTitle: "Fotografía con el equipo del estudio.",
    inquire: "Consultar",
    writeUs: "Escríbenos",
    rental: "Sección B — Renta del estudio",
    rentalTitle: "El ciclorama, por hora.",
    rentalLede:
      "Trae tu fotógrafo. Reserva aquí con un depósito del 50%, o sigue usando Peerspace.",
    addons: "Extras",
    notes: [
      "Las sesiones de casa se cotizan para un fotógrafo e incluyen el estudio. Los días de viaje son aparte. Escríbenos por fechas y un número que se ajuste al trabajo.",
      "La renta es $55 / hora con un mínimo de dos horas. Reserva en este sitio con un depósito del 50%, o en Peerspace.",
      "Un anticipo confirma las fechas de casa. El resto se paga el día de la sesión. Mandamos los términos con la cotización.",
      "El retoque extra y la entrega urgente se pueden sumar cuando llega la galería.",
    ],
  },
  services: {
    maternity: {
      title: "Maternidad",
      kicker: "Retratos",
      description: "Sesiones quietas, de cine, en el ciclorama. Hechas para sentirse como stills, no como setups.",
    },
    newborn: {
      title: "Recién nacido",
      kicker: "Retratos",
      description:
        "Sesiones lentas y cálidas para los primeros días. Envueltos, posados y con strobes — nunca con prisa.",
    },
    branding: {
      title: "Marca",
      kicker: "Comercial",
      description:
        "Imagen de marca personal y de negocio pequeño, con espacio para moverse. Retrato y lifestyle en una sola sala.",
    },
    headshots: {
      title: "Retratos",
      kicker: "Corporativo",
      description:
        "Retratos limpios y dirigidos para equipos, LinkedIn y la página de prensa — en el muro infinito.",
    },
    family: {
      title: "Familia",
      kicker: "Retratos",
      description:
        "Sesiones familiares sin prisa. Guardarropa neutro, dirección suave y un piso que los niños pueden usar.",
    },
    seasonals: {
      title: "Temporadas",
      kicker: "Minis",
      description:
        "Sets de temporada que cambian con el calendario — Pascua, otoño, Navidad, y lo de en medio.",
    },
    celebrations: {
      title: "Celebraciones",
      kicker: "Eventos",
      description: "Cumpleaños, cake smash y las producciones chicas que igual merecen un set de verdad.",
    },
    podcasts: {
      title: "Podcasts",
      kicker: "Producción",
      description:
        "Un set de entrevista dedicado — muro de listones, lounge y luz ya puesta para talking-head.",
    },
  },
  packages: {
    maternity: "Maternidad",
    newborn: "Recién nacido",
    branding: "Estudio de marca",
    headshots: "Corporativo / Retratos",
    family: "Sesión familiar",
    seasonals: "Temporadas",
    celebrations: "Celebraciones",
    podcasts: "Sesión de podcast",
  },
  team: {
    eyebrow: "Las personas",
    title: "Co-dueñas, lado a lado.",
    body: "Luz Reyes y Hillary Urgelles construyeron Lighthill juntas, y todavía lo disparan así — dos fotógrafas, un piso, cada sesión en pareja. Reserva al equipo de casa, o renta el espacio y trae el tuyo.",
    coOwner: "Co-dueña",
    workWithUs: "Trabaja con nosotras",
    luz: "Luz es co-dueña de Lighthill. Ella y Hillary trabajan cada sesión juntas — maternidad, recién nacidos, familias y marca personal — compartiendo la dirección y la luz. Trata el ciclorama como un set, no como una caja.",
    hillary:
      "Hillary es co-dueña de Lighthill. Ella y Luz recorren el piso juntas en sets de temporada, celebraciones, marca y días de podcast — manteniendo la sala en movimiento y la luz constante, de un toddler en la cove a una founder en el escritorio.",
  },
  faq: {
    eyebrow: "Preguntas",
    title: "Qué saber antes de pisar el piso.",
    lede: "Sesiones, rentas y las reglas de casa para que el ciclorama se quede blanco.",
    still: "¿Otra pregunta?",
    groups: {
      Sessions: "Sesiones",
      Rentals: "Rentas",
      "House rules": "Reglas de casa",
    },
    items: {
      "what-to-expect": {
        q: "¿Qué espero en una sesión de casa?",
        a: "Te recibe la fotógrafa, te recorre el piso y te da tiempo en el vestidor. Las sesiones son dirigidas pero sin prisa — iluminamos, disparamos, recasteamos si un look no está. Las galerías suelen llegar en siete días.",
      },
      wardrobe: {
        q: "¿Qué me pongo?",
        a: "Trae dos o tres looks en una paleta cerrada — crema, negro, navy, tierra. Evita logos enormes y neón. Tenemos algunas piezas de estudio en el rack si algo no sienta. Después de reservar te llega una nota de planning.",
      },
      "plus-ones": {
        q: "¿Puedo llevar a mi pareja, hijos o una estilista?",
        a: "Sí. La capacidad es veinte personas incluyendo crew. Dinos quién viene al reservar para armar el piso. Los niños son bienvenidos; solo mantenemos snacks y plumones fuera del ciclorama.",
      },
      "session-cancel": {
        q: "¿Cuál es la política de cancelación de las sesiones de casa?",
        a: "Un anticipo sostiene la fecha. Si cancelas o reagendas con siete días o más, el anticipo pasa a una nueva fecha dentro de seis meses. Dentro de siete días se pierde. Dentro de 24 horas se cobra la sesión completa. Los términos van con tu cotización.",
      },
      usage: {
        q: "¿Cómo puedo usar las fotos?",
        a: "Las sesiones personales incluyen uso personal y redes. Los paquetes de marca incluyen web e impresión para el negocio que encarga. Licencias extendidas, ads de pago y uso de terceros se agregan por escrito.",
      },
      "how-to-rent": {
        q: "¿Cómo rento el estudio?",
        a: "Reserva en este sitio con Rentar ahora — disponibilidad en vivo, depósito del 50%, confirmación al instante. Luces, papel y asistente son extras en el checkout. Peerspace sigue abierto como segunda puerta.",
      },
      "rental-minimum": {
        q: "¿Hay un mínimo de renta?",
        a: "Sí. Dos horas, a $55 por hora. Reservas de ocho horas o más reciben 20% de descuento. El estudio está disponible 24 horas — la plaza no cierra.",
      },
      "rental-gear": {
        q: "¿La renta incluye luces?",
        a: "No. La tarifa base es la sala, el ciclorama, Wi-Fi, estacionamiento y el vestidor. Trae tu kit, o suma flashes, modificadores y papel con el host. Con gusto recorremos el muro con quien renta por primera vez.",
      },
      "rental-cancel": {
        q: "¿Cuál es la política de cancelación de la renta?",
        a: "Un depósito del 50% confirma el horario. Reembolso completo si cancelas al menos 48 horas antes. Dentro de 48 horas se retiene el depósito. Escríbenos si necesitas mover la fecha. Las reservas de Peerspace siguen su política.",
      },
      "leave-it": {
        q: "¿Cómo dejo el estudio?",
        a: "Como lo encontraste. Basura fuera, muebles y props en su lugar, derrames limpios, rayones del ciclorama reportados. Limpieza excesiva o daño fuera del uso normal se puede cobrar. Cinta y clamps sí; sin taladro, sin pintura, sin glitter.",
      },
      food: {
        q: "¿Se permite comida y bebida?",
        a: "Sí, fuera del ciclorama. Agua en set está bien con tapa. Café, aceite, salsas rojas y todo lo que mancha se queda en el vestidor. Alcohol solo para el talento, no para fiesta — este es un piso de trabajo.",
      },
      parking: {
        q: "¿Dónde estaciono y cómo entro?",
        a: "Estacionamiento gratis en el sitio y acceso a nivel de calle. La dirección exacta y las notas de entrada salen con tu confirmación.",
      },
    },
  },
  contact: {
    eyebrow: "Contacto",
    title: "Cuéntanos qué estás haciendo.",
    lede: "Las sesiones de casa empiezan con una nota — te mandamos una cotización. La renta se reserva al instante en Rentar ahora — o pregúntanos primero.",
    studio: "Estudio",
    preferRent: "¿Prefieres rentar? Rentar ahora",
    name: "Nombre",
    email: "Correo",
    phone: "Teléfono",
    projectType: "Tipo de proyecto",
    shoot: "Sesión de casa",
    rental: "Consulta de renta",
    message: "Mensaje",
    placeholder: "Dinos la fecha, el tipo de sesión y lo que debamos saber.",
    send: "Enviar consulta",
    sending: "Enviando…",
    received: "Mensaje recibido.",
    thanks:
      "Gracias. Leemos cada nota y respondemos en un día hábil con el siguiente paso — fechas, un brief o una cotización.",
    another: "Enviar otra",
    error: "Algo salió mal. Escríbenos directo, o intenta de nuevo en un momento.",
  },
  rent: {
    eyebrow: "Renta del estudio",
    title: "El ciclorama, por hora.",
    lede: "Reserva al instante. $55 la hora, mínimo de dos horas, depósito del 50% ahora. El piso sigue el calendario del estudio.",
    cancelled: "Se canceló el checkout. No se cobró nada — elige otra hora cuando quieras.",
    paused: "El checkout directo está pausado. Reserva en Peerspace, o escríbenos.",
    write: "Escribir al estudio",
    hours: "Horas",
    minNote: "Mínimo de dos horas. 20% de descuento a las 8 horas.",
    dayNote: "El día de 8+ horas incluye 20% de descuento.",
    date: "Fecha",
    checking: "Revisando el piso…",
    noOpenings: "No hay huecos de esa duración en los próximos 60 días. Prueba un bloque más corto.",
    startTime: "Hora de inicio",
    addons: "Extras",
    flashes: "Flashes de estudio · $40",
    softboxes: "Softboxes y modificadores · $30",
    paper: "Colores de papel",
    assistant: "Horas de asistente",
    yourName: "Tu nombre",
    guests: "Invitados",
    email: "Correo",
    phone: "Teléfono",
    notes: "Notas para el estudio (opcional)",
    pay: "Pagar depósito del 50%",
    paying: "Abriendo checkout…",
  },
  event: {
    eyebrow: "26 de septiembre, 2026",
    title: "The Colorful Experience",
    lede: "Una noche de color en Lighthill Studio. Elige un boleto, paga en Stripe, y ya estás dentro.",
    whenLabel: "Cuándo",
    when: "Sábado 26 de septiembre, 2026",
    whereLabel: "Dónde",
    where: "Lighthill Studio, Lawrenceville, Georgia",
    tickets: "Boletos",
    ticketsLede: "Elige un boleto. Stripe cobra. El recibo es la confirmación.",
    qty: "Cantidad",
    buy: "Comprar boleto",
    buying: "Abriendo checkout…",
    loading: "Cargando boletos…",
    empty: "Los boletos aparecen aquí en cuanto estén vivos en Stripe.",
    emptyHint: "Si acabas de pasar a modo live, pega las llaves live en Desk → Settings.",
    cancelled: "Se canceló el checkout. No se cobró nada.",
    confirmedTitle: "Ya estás dentro.",
    confirmedLede: "The Colorful Experience — 26 de septiembre. Stripe te mandó el recibo.",
    confirmedBody: "Lleva el recibo a la puerta. Mandaremos notas de llegada al correo del boleto.",
    backHome: "Volver al estudio",
  },
};

export const dictionaries = { en, es };
export type Copy = typeof en;
