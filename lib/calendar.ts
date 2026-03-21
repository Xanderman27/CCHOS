import ical, { ICalCalendarMethod } from 'ical-generator';
import { RequestRow } from './db';

export function generateCalendarInvite(request: RequestRow): string {
  const calendar = ical({
    method: ICalCalendarMethod.REQUEST,
    name: 'Children\'s Community Health Event',
  });

  const topics = request.topics ? JSON.parse(request.topics) : [];
  const audience = request.target_audience ? JSON.parse(request.target_audience) : [];

  const startDate = new Date(`${request.event_date}T${request.start_time || '09:00'}`);
  const endDate = new Date(`${request.event_date}T${request.end_time || '17:00'}`);

  // Handle invalid dates
  if (isNaN(startDate.getTime())) {
    startDate.setTime(Date.now());
  }
  if (isNaN(endDate.getTime())) {
    endDate.setTime(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
  }

  calendar.createEvent({
    start: startDate,
    end: endDate,
    summary: `CCH Event: ${request.organization} - ${topics.join(', ') || 'Community Health'}`,
    location: request.event_address || 'TBD',
    description: [
      `Organization: ${request.organization}`,
      `Contact: ${request.name} (${request.email})`,
      `Estimated Attendees: ${request.estimated_attendees || 'N/A'}`,
      `Target Audience: ${audience.join(', ') || 'N/A'}`,
      `Topics: ${topics.join(', ') || 'N/A'}`,
      `Indoor/Outdoor: ${request.indoor_outdoor || 'N/A'}`,
      request.parking_instructions ? `Parking: ${request.parking_instructions}` : '',
      request.additional_notes ? `Notes: ${request.additional_notes}` : '',
    ].filter(Boolean).join('\n'),
    organizer: {
      name: 'Children\'s Community Health',
      email: 'communityhealth@intermountain.org',
    },
  });

  return calendar.toString();
}
