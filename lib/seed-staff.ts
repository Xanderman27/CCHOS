import { getDb } from './db';

const STAFF_MEMBERS = [
  { name: 'Sarah Mitchell', email: 'sarah.mitchell@imail.org', role: 'manager', phone: '801-555-0101', specialties: 'Program oversight, community partnerships, event planning' },
  { name: 'David Chen', email: 'david.chen@imail.org', role: 'coordinator', phone: '801-555-0102', specialties: 'Water safety, car seat safety, in-person presentations' },
  { name: 'Maria Rodriguez', email: 'maria.rodriguez@imail.org', role: 'coordinator', phone: '801-555-0103', specialties: 'Bilingual (Spanish), emotional wellbeing, virtual presentations' },
  { name: 'James Wilson', email: 'james.wilson@imail.org', role: 'coordinator', phone: '801-555-0104', specialties: 'Firearm safety, vaping prevention, school outreach' },
  { name: 'Emily Nakamura', email: 'emily.nakamura@imail.org', role: 'specialist', phone: '801-555-0105', specialties: 'Pedestrian safety, helmet safety, early childhood education' },
  { name: 'Tyler Sorensen', email: 'tyler.sorensen@imail.org', role: 'coordinator', phone: '801-555-0106', specialties: 'Rural outreach, mailing fulfillment, inventory management' },
  { name: 'Rachel Patel', email: 'rachel.patel@imail.org', role: 'specialist', phone: '801-555-0107', specialties: 'Data analysis, virtual presentations, window falls prevention' },
  { name: 'Brandon Kimball', email: 'brandon.kimball@imail.org', role: 'logistics', phone: '801-555-0108', specialties: 'Shipping, pickup coordination, warehouse operations' },
  { name: 'Lisa Trujillo', email: 'lisa.trujillo@imail.org', role: 'coordinator', phone: '801-555-0109', specialties: 'Bilingual (Spanish), community health fairs, car seat installations' },
  { name: 'Kevin Park', email: 'kevin.park@imail.org', role: 'specialist', phone: '801-555-0110', specialties: 'Poison prevention, medication safety, healthcare provider education' },
];

export function seedStaff() {
  const db = getDb();
  const existing = db.prepare('SELECT COUNT(*) as count FROM staff').get() as { count: number };
  if (existing.count > 0) return;

  const insert = db.prepare(
    'INSERT INTO staff (name, email, role, phone, specialties) VALUES (@name, @email, @role, @phone, @specialties)'
  );

  const tx = db.transaction(() => {
    for (const member of STAFF_MEMBERS) {
      insert.run(member);
    }
  });
  tx();
  console.log(`Seeded ${STAFF_MEMBERS.length} staff members`);
}
