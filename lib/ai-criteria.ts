/**
 * AI priority criteria — shared between server (prompt) and client (display).
 * Kept in a separate file so importing it in client components doesn't pull in
 * the Anthropic SDK.
 */
export const AI_PRIORITY_CRITERIA = [
  {
    id: 'staff_required',
    label: 'Staff Requirements',
    description:
      'In-person events require sending trained staff on-site. These are the most resource-intensive requests and are weighted heavily. Virtual events need a presenter but with less logistical overhead. Mailing and pickup requests require no staff.',
  },
  {
    id: 'time_urgency',
    label: 'Time Urgency',
    description:
      'How soon the event or need date is relative to today. Requests needed within 3 days are critical. Within 7 days is urgent. Within 14 days is elevated. Beyond 30 days is low urgency.',
  },
  {
    id: 'inventory_availability',
    label: 'Inventory & Material Availability',
    description:
      'Whether requested materials are in stock and sufficient. Out-of-stock or insufficient inventory for requested items raises priority so the team can reorder or find alternatives before the deadline.',
  },
  {
    id: 'audience_scale',
    label: 'Audience Scale',
    description:
      'The number of people the request will serve. Larger audiences (100+ attendees) represent greater community impact and require more preparation, raising priority.',
  },
  {
    id: 'audience_vulnerability',
    label: 'Audience Vulnerability',
    description:
      'Requests targeting vulnerable populations — foster families, refugee communities, tribal communities, low-income families, or non-English-speaking groups — receive elevated priority to ensure equitable access.',
  },
  {
    id: 'geographic_eligibility',
    label: 'Geographic Eligibility',
    description:
      'Only requests within Utah qualify for staff support. Out-of-state requests are limited to mailed materials, which affects fulfillment path and can lower priority.',
  },
  {
    id: 'topic_sensitivity',
    label: 'Topic Sensitivity',
    description:
      'Certain topics like firearm safety, suicide prevention, or substance abuse require specially trained presenters and careful material selection, which raises coordination complexity and priority.',
  },
  {
    id: 'special_requirements',
    label: 'Special Requirements',
    description:
      'Requests with accessibility needs, language-specific materials, AV requirements, or other special accommodations require additional coordination time and raise priority.',
  },
];
