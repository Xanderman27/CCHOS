export interface MaterialItem {
  id: string;
  nameEn: string;
  nameEs: string;
}

export interface MaterialCategory {
  id: string;
  nameEn: string;
  nameEs: string;
  items: MaterialItem[];
}

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: 'car_seat',
    nameEn: 'Car Seat Safety',
    nameEs: 'Seguridad para asientos de automóviles',
    items: [
      { id: 'car_seat_cards', nameEn: 'Car Seat safety cards', nameEs: 'Tarjetas de seguridad para asientos de automóviles' },
    ],
  },
  {
    id: 'spot_the_tot',
    nameEn: 'Spot the Tot & Forget Me Not',
    nameEs: 'Spot the Tot y No Me Olvides',
    items: [
      { id: 'spot_tot_cards_en', nameEn: 'Spot the Tot & Forget Me Not safety cards', nameEs: 'Tarjeta de seguridad de Spot the Tot y No Me Olvides' },
      { id: 'spot_tot_cards_es', nameEn: 'Spot the Tot & Forget Me Not safety cards (SPANISH)', nameEs: 'Tarjeta de seguridad de Spot the Tot y No Me Olvides (Español)' },
      { id: 'spot_tot_clings_en', nameEn: 'Spot the Tot & Forget Me Not window clings', nameEs: 'Pegatinas para ventanas de Spot the Tot y No Me Olvides' },
      { id: 'spot_tot_clings_es', nameEn: 'Spot the Tot & Forget Me Not window clings (SPANISH)', nameEs: 'Pegatinas para ventanas de Spot the Tot y No Me Olvides (Español)' },
    ],
  },
  {
    id: 'window_falls',
    nameEn: 'Window Falls Prevention',
    nameEs: 'Prevención de caídas de ventanas',
    items: [
      { id: 'window_falls_cards', nameEn: 'Window Falls safety cards', nameEs: 'Tarjetas de seguridad contra caídas de ventanas' },
      { id: 'window_falls_clings', nameEn: 'Window Falls window clings', nameEs: 'Pegatinas para ventanas de caídas de ventanas' },
    ],
  },
  {
    id: 'helmet',
    nameEn: 'Helmet Safety',
    nameEs: 'Seguridad de cascos',
    items: [
      { id: 'helmet_cards', nameEn: 'Wear Your Helmet safety cards', nameEs: 'Usa tu casco tarjetas de seguridad' },
    ],
  },
  {
    id: 'atv',
    nameEn: 'ATV Safety',
    nameEs: 'Seguridad para vehículos todo terreno',
    items: [
      { id: 'atv_cards', nameEn: 'ATV Safety cards', nameEs: 'Tarjetas de seguridad para vehículos todo terreno' },
    ],
  },
  {
    id: 'water',
    nameEn: 'Water Safety',
    nameEs: 'Seguridad en el agua',
    items: [
      { id: 'water_safety_cards', nameEn: 'Water Safety cards', nameEs: 'Tarjetas de seguridad en el agua' },
      { id: 'water_watcher_card', nameEn: 'Water Watcher Card', nameEs: 'Tarjeta de observador de agua' },
    ],
  },
  {
    id: 'pedestrian',
    nameEn: 'Pedestrian Safety',
    nameEs: 'Seguridad peatonal',
    items: [
      { id: 'pedestrian_cards', nameEn: 'Pedestrian Safety cards', nameEs: 'Tarjetas de seguridad para peatones' },
    ],
  },
  {
    id: 'emotional_wellbeing',
    nameEn: 'Emotional Wellbeing',
    nameEs: 'Bienestar emocional',
    items: [
      { id: 'ew_cards_en', nameEn: 'Emotional Wellbeing safety cards', nameEs: 'Tarjetas de seguridad para el bienestar emocional' },
      { id: 'ew_cards_es', nameEn: 'Emotional Wellbeing safety cards (SPANISH)', nameEs: 'Tarjetas de seguridad para el bienestar emocional (Español)' },
      { id: 'ew_magnets_en', nameEn: 'Emotional Wellbeing magnets (Feelings Wheel)', nameEs: 'Imanes de bienestar emocional (rueda de sentimientos)' },
      { id: 'ew_magnets_es', nameEn: 'Emotional Wellbeing magnets (Feelings Wheel) (SPANISH)', nameEs: 'Imanes de bienestar emocional (rueda de sentimientos) (Español)' },
      { id: 'ew_workbooks_en', nameEn: 'Emotional Wellbeing workbooks', nameEs: 'Cuadernos de bienestar emocional' },
      { id: 'ew_workbooks_es', nameEn: 'Emotional Wellbeing workbooks (SPANISH)', nameEs: 'Cuadernos de bienestar emocional (Español)' },
    ],
  },
  {
    id: 'firearm',
    nameEn: 'Firearm Safety',
    nameEs: 'Seguridad de armas de fuego',
    items: [
      { id: 'firearm_cards', nameEn: 'Firearm Safety cards', nameEs: 'Tarjetas de seguridad de armas de fuego' },
    ],
  },
  {
    id: 'vaping',
    nameEn: 'Vaping Prevention',
    nameEs: 'Prevención del vapeo',
    items: [
      { id: 'vaping_cards', nameEn: 'Vaping Prevention cards', nameEs: 'Tarjetas de la prevención del vapeo' },
    ],
  },
];

export function getAllMaterialIds(): string[] {
  return MATERIAL_CATEGORIES.flatMap(cat => cat.items.map(item => item.id));
}

export function getMaterialById(id: string): MaterialItem | undefined {
  for (const cat of MATERIAL_CATEGORIES) {
    const item = cat.items.find(i => i.id === id);
    if (item) return item;
  }
  return undefined;
}
