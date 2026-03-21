import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'requests.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const insert = db.prepare(`
  INSERT INTO requests (
    created_at, status, name, organization, email, request_type,
    materials, shipping_address, state, county, date_needed,
    event_date, start_time, end_time, event_address, event_zip,
    indoor_outdoor, parking_instructions, target_audience,
    estimated_attendees, topics, requestor_attending, additional_notes,
    ai_priority, ai_tags, ai_fulfillment_recommendation,
    ai_notes_analysis, ai_geographic_eligible,
    admin_notes, fulfillment_path, approved_by, approved_at
  ) VALUES (
    @created_at, @status, @name, @organization, @email, @request_type,
    @materials, @shipping_address, @state, @county, @date_needed,
    @event_date, @start_time, @end_time, @event_address, @event_zip,
    @indoor_outdoor, @parking_instructions, @target_audience,
    @estimated_attendees, @topics, @requestor_attending, @additional_notes,
    @ai_priority, @ai_tags, @ai_fulfillment_recommendation,
    @ai_notes_analysis, @ai_geographic_eligible,
    @admin_notes, @fulfillment_path, @approved_by, @approved_at
  )
`);

// Helper: pick random element
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], min: number, max: number): T[] {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function randInt(min: number, max: number) { return min + Math.floor(Math.random() * (max - min + 1)); }

const firstNames = [
  'Maria', 'James', 'Sofia', 'Liam', 'Emma', 'Noah', 'Olivia', 'William',
  'Ava', 'Benjamin', 'Isabella', 'Elijah', 'Mia', 'Lucas', 'Charlotte',
  'Henry', 'Amelia', 'Alexander', 'Harper', 'Daniel', 'Evelyn', 'Matthew',
  'Luna', 'Joseph', 'Camila', 'Samuel', 'Aria', 'David', 'Scarlett', 'Andrew',
  'Penelope', 'Nathan', 'Layla', 'Ryan', 'Riley', 'Gabriel', 'Zoey', 'Anthony',
  'Nora', 'Dylan', 'Lily', 'Christopher', 'Eleanor', 'Joshua', 'Hannah', 'Ethan',
  'Lillian', 'Caleb', 'Addison', 'Owen', 'Aubrey', 'Sebastian', 'Ellie', 'Jack',
  'Stella', 'Aiden', 'Natalie', 'Isaiah', 'Zoe', 'Michael', 'Leah', 'Connor',
  'Hazel', 'Jayden', 'Violet', 'Adrian', 'Aurora', 'Miles', 'Savannah', 'Leo',
  'Audrey', 'Thomas', 'Brooklyn', 'Eli', 'Bella', 'Aaron', 'Claire', 'Landon',
  'Skylar', 'Cooper', 'Lucy', 'Ezra', 'Paisley', 'Carson', 'Everly', 'Xavier',
  'Anna', 'Jose', 'Caroline', 'Jaxon', 'Nova', 'Dominic', 'Genesis', 'Kevin',
  'Emilia', 'Brandon', 'Kennedy', 'Alejandro', 'Maya',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
  'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans',
  'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart',
  'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan',
  'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim',
  'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James',
  'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo',
  'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell',
];

const organizations = [
  'Boys & Girls Club of Utah', 'YMCA Salt Lake', 'United Way of Salt Lake',
  'Utah Community Action', 'Crossroads Urban Center', 'Neighborhood House',
  'South Valley Sanctuary', 'Valley Mental Health', 'The Road Home',
  'Utah Food Bank', 'Ronald McDonald House Utah', 'Make-A-Wish Utah',
  'Big Brothers Big Sisters of Utah', 'Junior League of Salt Lake City',
  'Catholic Community Services', 'International Rescue Committee SLC',
  'Volunteers of America Utah', 'Habitat for Humanity Utah',
  'Ogden Weber Community Action', 'Bear River Health Department',
  'Summit County Health Department', 'Wasatch County Health',
  'Utah County Health Department', 'Southwest Utah Public Health',
  'TriCounty Health Department', 'Davis Behavioral Health',
  'Weber-Morgan Health Department', 'Central Utah Public Health',
  'San Juan County Health', 'Uintah Basin Medical Center',
  'Moab Regional Hospital', 'Castleview Hospital',
  'Logan Regional Hospital', 'McKay-Dee Hospital',
  'Intermountain Medical Center', 'American Fork Hospital',
  'Cedar City Hospital', 'Riverton Hospital',
  'Park City Medical Center', 'Layton Hospital',
  'St. George Regional Medical', 'Orem Community Hospital',
  'Brigham City Community Hospital', 'Heber Valley Medical Center',
  'Salt Lake Elementary #12', 'Murray School District',
  'Alpine School District', 'Provo School District',
  'Jordan School District', 'Canyons School District',
  'Nebo School District', 'Iron County School District',
  'Wasatch School District', 'Park City School District',
  'Tooele County School District', 'Box Elder School District',
  'Cache County School District', 'Sevier School District',
  'Millard School District', 'Juab School District',
  'South Sanpete School District', 'North Sanpete School District',
  'Grand County School District', 'San Juan School District',
  'Duchesne County School District', 'Daggett School District',
  'Utah State University Extension', 'BYU Community Outreach',
  'University of Utah Health', 'Weber State Community Programs',
  'Salt Lake Community College', 'Utah Valley University',
  'Dixie State Community Health', 'Snow College Outreach',
  'LDS Humanitarian Services', 'Promise South Salt Lake',
  'West Valley City Parks & Rec', 'Sandy City Recreation',
  'Lehi City Community Services', 'Eagle Mountain Rec Center',
  'Saratoga Springs City', 'South Jordan Community Center',
  'Taylorsville Community Center', 'Kearns Community Center',
  'Magna Community Council', 'Midvale Community Center',
  'Murray City Parks', 'Cottonwood Heights Rec Center',
  'Holladay City', 'Millcreek Community Council',
  'Draper City Parks', 'Herriman City Rec',
  'Bluffdale Community Center', 'Riverton City Parks',
  'Spanish Fork Community Center', 'Payson City Recreation',
  'Springville Community Programs', 'Mapleton Community Center',
  'Salem City', 'Santaquin Town', 'Nephi Community Center',
];

const utahCounties = [
  'Salt Lake', 'Utah', 'Davis', 'Weber', 'Washington', 'Cache', 'Tooele',
  'Summit', 'Iron', 'Box Elder', 'Wasatch', 'Sanpete', 'Uintah', 'Duchesne',
  'Carbon', 'Emery', 'Grand', 'San Juan', 'Sevier', 'Millard', 'Juab',
  'Beaver', 'Garfield', 'Kane', 'Wayne', 'Piute', 'Rich', 'Morgan', 'Daggett',
];

const utahCities: Record<string, { city: string; zip: string }[]> = {
  'Salt Lake': [
    { city: 'Salt Lake City', zip: '84101' }, { city: 'West Valley City', zip: '84120' },
    { city: 'South Salt Lake', zip: '84115' }, { city: 'Murray', zip: '84107' },
    { city: 'Taylorsville', zip: '84129' }, { city: 'Kearns', zip: '84118' },
    { city: 'Magna', zip: '84044' }, { city: 'Midvale', zip: '84047' },
    { city: 'Sandy', zip: '84070' }, { city: 'Draper', zip: '84020' },
    { city: 'Riverton', zip: '84065' }, { city: 'Herriman', zip: '84096' },
  ],
  'Utah': [
    { city: 'Provo', zip: '84601' }, { city: 'Orem', zip: '84057' },
    { city: 'Lehi', zip: '84043' }, { city: 'American Fork', zip: '84003' },
    { city: 'Pleasant Grove', zip: '84062' }, { city: 'Spanish Fork', zip: '84660' },
    { city: 'Springville', zip: '84663' }, { city: 'Eagle Mountain', zip: '84005' },
    { city: 'Saratoga Springs', zip: '84045' }, { city: 'Payson', zip: '84651' },
  ],
  'Davis': [
    { city: 'Layton', zip: '84041' }, { city: 'Bountiful', zip: '84010' },
    { city: 'Clearfield', zip: '84015' }, { city: 'Kaysville', zip: '84037' },
    { city: 'Syracuse', zip: '84075' }, { city: 'Farmington', zip: '84025' },
  ],
  'Weber': [
    { city: 'Ogden', zip: '84401' }, { city: 'Roy', zip: '84067' },
    { city: 'North Ogden', zip: '84414' }, { city: 'Riverdale', zip: '84405' },
  ],
  'Washington': [
    { city: 'St. George', zip: '84770' }, { city: 'Hurricane', zip: '84737' },
    { city: 'Washington', zip: '84780' }, { city: 'Ivins', zip: '84738' },
  ],
  'Cache': [
    { city: 'Logan', zip: '84321' }, { city: 'Smithfield', zip: '84335' },
    { city: 'North Logan', zip: '84341' }, { city: 'Hyrum', zip: '84319' },
  ],
  'Tooele': [
    { city: 'Tooele', zip: '84074' }, { city: 'Grantsville', zip: '84029' },
    { city: 'Stansbury Park', zip: '84074' },
  ],
  'Summit': [
    { city: 'Park City', zip: '84060' }, { city: 'Coalville', zip: '84017' },
  ],
  'Iron': [
    { city: 'Cedar City', zip: '84720' }, { city: 'Enoch', zip: '84721' },
  ],
  'Box Elder': [
    { city: 'Brigham City', zip: '84302' }, { city: 'Tremonton', zip: '84337' },
  ],
  'Wasatch': [{ city: 'Heber City', zip: '84032' }],
  'Sanpete': [{ city: 'Ephraim', zip: '84627' }, { city: 'Manti', zip: '84642' }],
  'Uintah': [{ city: 'Vernal', zip: '84078' }],
  'Duchesne': [{ city: 'Roosevelt', zip: '84066' }],
  'Carbon': [{ city: 'Price', zip: '84501' }],
  'Grand': [{ city: 'Moab', zip: '84532' }],
  'Sevier': [{ city: 'Richfield', zip: '84701' }],
};

const outOfStateLocations = [
  { state: 'Idaho', city: 'Boise', zip: '83702' },
  { state: 'Idaho', city: 'Pocatello', zip: '83201' },
  { state: 'Idaho', city: 'Twin Falls', zip: '83301' },
  { state: 'Wyoming', city: 'Evanston', zip: '82930' },
  { state: 'Nevada', city: 'Elko', zip: '89801' },
  { state: 'Colorado', city: 'Grand Junction', zip: '81501' },
  { state: 'Arizona', city: 'Page', zip: '86040' },
  { state: 'Montana', city: 'Billings', zip: '59101' },
  { state: 'New Mexico', city: 'Farmington', zip: '87401' },
];

const topicIds = [
  'car_seats', 'spot_the_tot', 'window_falls', 'helmet', 'atv_safety',
  'water_safety', 'pedestrian', 'emotional_wellbeing', 'firearm_safety', 'vaping',
];

const audienceIds = [
  'early_education', 'children_k8', 'teens_9_12', 'families', 'adults',
  'mixed_community', 'low_income', 'new_parents', 'professionals', 'underserved',
];

const materialItems = [
  'car_seat_cards', 'spot_tot_cards_en', 'spot_tot_cards_es', 'spot_tot_clings_en',
  'spot_tot_clings_es', 'window_falls_cards', 'window_falls_clings', 'helmet_cards',
  'atv_cards', 'water_safety_cards', 'water_watcher_card', 'pedestrian_cards',
  'ew_cards_en', 'ew_cards_es', 'ew_magnets_en', 'ew_magnets_es', 'ew_workbooks_en',
  'ew_workbooks_es', 'firearm_cards', 'vaping_cards',
];

const statuses: Array<'submitted' | 'in_review' | 'approved' | 'fulfilled'> = ['submitted', 'in_review', 'approved', 'fulfilled'];
const statusWeights = [35, 15, 20, 30]; // realistic distribution
const requestTypes: Array<'mailing' | 'in_person' | 'virtual' | 'pickup'> = ['mailing', 'in_person', 'virtual', 'pickup'];
const typeWeights = [35, 35, 20, 10];
const priorities = ['low', 'medium', 'high', 'urgent'];
const priorityWeights = [20, 40, 25, 15];

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

const spanishNotes = [
  'Necesitamos materiales en español para nuestras familias hispanas.',
  'La mayoría de nuestras familias hablan español. Por favor envíen materiales bilingües.',
  'Evento para la comunidad latina. Se necesitan presentadores bilingües.',
  'Todos los materiales deben estar en español por favor.',
  'Nuestra comunidad es principalmente hispanohablante. Necesitamos apoyo en español.',
  'Solicitamos materiales en español para distribución en nuestros centros comunitarios.',
  'Este evento es para familias de habla hispana. Se requiere intérprete.',
  'Por favor incluyan materiales sobre seguridad en el agua en español.',
  'Necesitamos voluntarios bilingües para nuestro evento de seguridad infantil.',
  'Evento comunitario en español. Tema principal: bienestar emocional de los niños.',
];

const englishNotes = [
  'Annual safety fair for our community. Expecting good turnout this year.',
  'Need materials for our after-school program across 5 locations.',
  'First time hosting a safety event. Any guidance appreciated.',
  'Ongoing monthly distribution at our clinic waiting rooms.',
  'Back-to-school safety event. Want to focus on pedestrian and bike safety.',
  'Summer kickoff event. Water safety is our main focus.',
  'PTA-organized event. Parents very interested in emotional wellbeing resources.',
  'Training session for our volunteer staff on child safety topics.',
  'Need materials for our health screening event next month.',
  'Community resource fair. Multiple organizations will be present.',
  'Our organization runs a monthly parent education night. This month: car seat safety.',
  'We serve rural communities with limited access to health education.',
  'Daycare provider training on safety. About 25 providers expected.',
  'Would like to set up a permanent safety resource corner in our lobby.',
  'Event co-sponsored with local fire department. Focus on home safety.',
  'We partner with WIC to distribute materials during appointments.',
  'Our school nurse needs resources for health education classes.',
  'Looking for materials to include in our new parent welcome packets.',
  'Youth sports league safety day. Need helmet and concussion info.',
  'Senior center event — grandparents raising grandchildren. Car seat + emotional wellbeing focus.',
  'Refugee resettlement program needs multilingual safety materials.',
  'Looking for interactive presentation for our teen health class.',
  'Free community clinic day. All ages welcome. Need broad coverage of topics.',
  'Part of our county injury prevention initiative.',
  'We are a tribal health program serving the Navajo Nation in San Juan County.',
  null, null, null, null, null, // some with no notes
];

const parkingInstructions = [
  'Free parking in the main lot. Enter through the front doors.',
  'Street parking available. Look for event signs.',
  'Use the north parking lot. Overflow parking across the street.',
  'Limited parking — carpooling recommended.',
  'Parking garage on the east side. First 2 hours free.',
  'Park in the school lot. Enter through gymnasium entrance.',
  'Follow signs to event parking. Handicap accessible spots near entrance.',
  'Visitor parking in Lot C. Check in at the front desk.',
  'Free parking available. Shuttle from overflow lot every 15 minutes.',
  'Park along Main Street. Event is at the pavilion in the park.',
];

// Generate dates spread across Jan 2026 - May 2026
function randomDate(startMonth: number, endMonth: number): string {
  const month = randInt(startMonth, endMonth);
  const day = randInt(1, 28);
  const hour = randInt(7, 17);
  const minute = pick([0, 15, 30, 45]);
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

function futureDate(afterMonth: number): string {
  const month = randInt(afterMonth, Math.min(afterMonth + 2, 7));
  const day = randInt(1, 28);
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const extraData: any[] = [];

for (let i = 0; i < 100; i++) {
  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const name = `${firstName} ${lastName}`;
  const org = pick(organizations);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${org.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}.org`;

  const status = weightedPick(statuses, statusWeights);
  const requestType = weightedPick(requestTypes, typeWeights);
  const priority = weightedPick(priorities, priorityWeights);

  // 85% Utah, 15% out of state
  const isOutOfState = Math.random() < 0.15;
  let state: string | null = null;
  let county: string | null = null;
  let cityInfo: { city: string; zip: string } | null = null;

  if (isOutOfState) {
    const loc = pick(outOfStateLocations);
    state = loc.state;
    cityInfo = { city: loc.city, zip: loc.zip };
  } else {
    // Weight toward larger counties
    const countyWeights = utahCounties.map(c =>
      c === 'Salt Lake' ? 30 : c === 'Utah' ? 25 : c === 'Davis' ? 15 :
      c === 'Weber' ? 10 : c === 'Washington' ? 8 : c === 'Cache' ? 5 : 2
    );
    county = weightedPick(utahCounties, countyWeights);
    state = 'Utah';
    const cities = utahCities[county];
    if (cities) cityInfo = pick(cities);
  }

  const isMailing = requestType === 'mailing' || requestType === 'pickup';
  const isEvent = requestType === 'in_person' || requestType === 'virtual';

  // Created date: spread across Jan–Mar 2026
  const createdAt = randomDate(1, 3);
  const createdMonth = parseInt(createdAt.split('-')[1]);

  // 20% chance of Spanish notes
  const useSpanish = Math.random() < 0.20;
  const notes = useSpanish ? pick(spanishNotes) : pick(englishNotes);

  // Materials for mailing/pickup
  let materials: string | null = null;
  if (isMailing) {
    const mats = pickN(materialItems, 1, 5).map(id => ({
      itemId: id,
      quantity: pick([25, 50, 75, 100, 150, 200, 250, 300]),
    }));
    materials = JSON.stringify(mats);
  }

  // Event details
  let eventDate: string | null = null;
  let startTime: string | null = null;
  let endTime: string | null = null;
  let eventAddress: string | null = null;
  let eventZip: string | null = null;
  let indoorOutdoor: string | null = null;
  let parkingInstr: string | null = null;
  let targetAudience: string | null = null;
  let estimatedAttendees: number | null = null;
  let topics: string | null = null;

  if (isEvent) {
    eventDate = futureDate(createdMonth + 1);
    const startHour = randInt(8, 16);
    startTime = `${String(startHour).padStart(2, '0')}:00`;
    endTime = `${String(Math.min(startHour + randInt(1, 4), 20)).padStart(2, '0')}:00`;
    if (requestType === 'in_person') {
      const addr = cityInfo ? `${randInt(100, 9999)} ${pick(['N', 'S', 'E', 'W'])} ${pick(['Main', 'State', 'Center', 'University', 'Temple', 'Highland', 'Canyon', 'Redwood', 'Bangerter', 'Mountain View'])} ${pick(['St', 'Ave', 'Blvd', 'Dr', 'Rd'])}` : '100 Main St';
      eventAddress = cityInfo ? `${addr}, ${cityInfo.city}, ${state} ${cityInfo.zip}` : addr;
      eventZip = cityInfo?.zip || '84101';
      indoorOutdoor = pick(['indoor', 'outdoor', 'indoor', 'indoor']); // mostly indoor
      parkingInstr = pick(parkingInstructions);
    }
    targetAudience = JSON.stringify(pickN(audienceIds, 1, 3).map(a => a));
    estimatedAttendees = pick([15, 20, 25, 30, 40, 50, 60, 75, 80, 100, 120, 150, 175, 200, 250, 300, 400, 500]);
    topics = JSON.stringify(pickN(topicIds, 1, 4).map(t => t));
  }

  // Shipping for mailing/pickup
  let shippingAddress: string | null = null;
  let dateNeeded: string | null = null;
  if (isMailing) {
    if (cityInfo) {
      shippingAddress = `${randInt(100, 9999)} ${pick(['N', 'S', 'E', 'W'])} ${pick(['Main', 'State', 'Center', 'University'])} St, ${cityInfo.city}, ${state || 'UT'} ${cityInfo.zip}`;
    }
    dateNeeded = futureDate(createdMonth + 1);
  }

  // AI tags
  const tags: string[] = [requestType.replace('_', '-')];
  if (isOutOfState) tags.push('out-of-state');
  if (useSpanish) tags.push('spanish-language');
  if (estimatedAttendees && estimatedAttendees >= 150) tags.push('high-attendance');
  if (priority === 'urgent') tags.push('urgent');

  // Fulfillment for approved/fulfilled
  let adminNotes: string | null = null;
  let fulfillmentPath: string | null = null;
  let approvedBy: string | null = null;
  let approvedAt: string | null = null;

  if (status === 'approved' || status === 'fulfilled') {
    approvedBy = 'Admin';
    const createdDate = new Date(createdAt.replace(' ', 'T') + 'Z');
    createdDate.setDate(createdDate.getDate() + randInt(1, 3));
    approvedAt = createdDate.toISOString().replace('T', ' ').slice(0, 19);
    fulfillmentPath = isMailing ? 'mail' : isEvent ? (requestType === 'virtual' ? 'virtual_staff' : 'staff_event') : 'pickup';
    adminNotes = status === 'fulfilled'
      ? pick(['Completed successfully.', 'All materials shipped.', 'Event staffed. Good feedback.', 'Fulfilled on schedule.', 'Materials delivered. Receipt confirmed.'])
      : pick(['Assigned staff.', 'Coordinating logistics.', 'Materials being prepared.', 'Confirmed with requestor.', null]);
  } else if (status === 'in_review') {
    adminNotes = pick(['Reviewing request details.', 'Checking staff availability.', 'Verifying materials stock.', 'Awaiting additional info.', null]);
  }

  extraData.push({
    created_at: createdAt,
    status,
    name,
    organization: org,
    email,
    request_type: requestType,
    materials,
    shipping_address: shippingAddress,
    state,
    county,
    date_needed: dateNeeded,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    event_address: eventAddress,
    event_zip: eventZip,
    indoor_outdoor: indoorOutdoor,
    parking_instructions: parkingInstr,
    target_audience: targetAudience,
    estimated_attendees: estimatedAttendees,
    topics,
    requestor_attending: isEvent ? (Math.random() < 0.8 ? 1 : 0) : 0,
    additional_notes: notes,
    ai_priority: priority,
    ai_tags: JSON.stringify(tags),
    ai_fulfillment_recommendation: isMailing ? 'mail' : requestType === 'virtual' ? 'virtual_staff' : requestType === 'pickup' ? 'pickup' : 'staff_event',
    ai_notes_analysis: notes ? `Request from ${org}. ${priority} priority.` : null,
    ai_geographic_eligible: isOutOfState ? 0 : 1,
    admin_notes: adminNotes,
    fulfillment_path: fulfillmentPath,
    approved_by: approvedBy,
    approved_at: approvedAt,
  });
}

const insertMany = db.transaction(() => {
  for (const data of extraData) {
    insert.run(data);
  }
});

insertMany();
console.log(`Inserted ${extraData.length} additional requests. Total requests now in DB.`);
db.close();
