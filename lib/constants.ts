export const STATUSES = ['submitted', 'in_review', 'approved', 'fulfilled'] as const;
export type Status = typeof STATUSES[number];

export const STATUS_LABELS: Record<Status, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  fulfilled: 'Fulfilled',
};

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type Priority = typeof PRIORITIES[number];

export const REQUEST_TYPES = ['mailing', 'in_person', 'virtual', 'pickup'] as const;
export type RequestType = typeof REQUEST_TYPES[number];

export const REQUEST_TYPE_LABELS: Record<RequestType, { en: string; es: string }> = {
  mailing: {
    en: 'Mailing of education materials or safety devices',
    es: 'Envío de materiales educativos o aparatos de seguridad',
  },
  in_person: {
    en: 'Community Health In-Person Support at event',
    es: 'Apoyo en persona de Salud Comunitaria en el evento',
  },
  virtual: {
    en: 'Virtual Presentation',
    es: 'Presentación Virtual',
  },
  pickup: {
    en: 'Pickup of education materials or safety devices',
    es: 'Recogida de materiales educativos o aparatos de seguridad',
  },
};

export const TARGET_AUDIENCES = [
  { id: 'early_education', en: 'Early Education 3-5 year olds', es: 'Educación temprana niños de 3 a 5 años' },
  { id: 'children_k8', en: 'Children K-8th grade', es: 'Niños K-8vo grado' },
  { id: 'teens_9_12', en: 'Teens 9-12th grade', es: 'Adolescentes de 9º a 12º grado' },
  { id: 'families', en: 'Families', es: 'Familias' },
  { id: 'adults', en: 'Adults', es: 'Adultos' },
  { id: 'mixed_community', en: 'Mixed community event', es: 'Evento comunitario mixto' },
  { id: 'low_income', en: 'Low income', es: 'De bajos ingresos' },
  { id: 'new_parents', en: 'New parents', es: 'Nuevos padres' },
  { id: 'professionals', en: 'Professionals', es: 'Profesionales' },
  { id: 'underserved', en: 'Underserved', es: 'Comunidad de bajos recursos' },
] as const;

export const TOPICS = [
  { id: 'car_seats', en: 'Car Seat Safety', es: 'Seguridad de asientos de carro' },
  { id: 'spot_the_tot', en: 'Spot the Tot / Hot Cars Forget Me Not', es: 'Observame Siempre / Autos Calientes No Me Olvides' },
  { id: 'window_falls', en: 'Window Fall Prevention', es: 'Caídas de ventana' },
  { id: 'helmet', en: 'Wear Your Helmet', es: 'Usa tu casco' },
  { id: 'atv_safety', en: 'ATV Safety', es: 'Seguridad en vehículos todo terreno' },
  { id: 'water_safety', en: 'Water Safety', es: 'Seguridad del agua' },
  { id: 'pedestrian', en: 'Pedestrian Safety', es: 'Seguridad peatonal' },
  { id: 'emotional_wellbeing', en: 'Emotional Wellbeing', es: 'Bienestar emocional' },
  { id: 'firearm_safety', en: 'Firearm Safety', es: 'Seguridad de armas de fuego' },
  { id: 'vaping', en: 'Vaping Prevention', es: 'Prevención del vapeo' },
] as const;

export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri',
  'Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York',
  'North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington',
  'West Virginia','Wisconsin','Wyoming',
] as const;

export const UTAH_COUNTIES = [
  'Beaver','Box Elder','Cache','Carbon','Daggett','Davis','Duchesne','Emery',
  'Garfield','Grand','Iron','Juab','Kane','Millard','Morgan','Piute','Rich',
  'Salt Lake','San Juan','Sanpete','Sevier','Summit','Tooele','Uintah','Utah',
  'Wasatch','Washington','Wayne','Weber',
] as const;

export const DEFAULT_SERVICE_AREA = {
  states: ['Utah'],
  counties: [...UTAH_COUNTIES],
};
