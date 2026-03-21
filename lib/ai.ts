import Anthropic from '@anthropic-ai/sdk';
import { RequestRow } from './db';
const client = new Anthropic();

export interface AIClassification {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_reasoning: string;
  fulfillment_recommendation: 'mail' | 'staff_event' | 'virtual_staff' | 'pickup';
  fulfillment_reasoning: string;
  tags: string[];
  notes_analysis: string | null;
  geographic_eligible: boolean;
  geographic_reasoning: string;
  flags: string[];
}

export interface InventoryContext {
  item_id: string;
  name: string;
  quantity: number;
  low_stock_threshold: number;
}

const SYSTEM_PROMPT = `You are an intake processor for Children's Community Health at Intermountain Healthcare in Utah.
Analyze community health education requests and provide structured classification.

Today's date: ${new Date().toISOString().split('T')[0]}

## Priority Assessment Criteria

Evaluate ALL of the following factors holistically. Do not rely on a single factor — weigh them together to determine the final priority.

### 1. Staff Requirements
- In-person events require sending trained staff on-site (highest resource cost)
- Virtual events need a remote presenter (moderate resource cost)
- Mailing and pickup requests require no staff (lowest resource cost)
- Requests requiring staff should generally be prioritized higher

### 2. Time Urgency
- Within 3 days: CRITICAL — may not be fulfillable
- Within 7 days: Very urgent — minimal prep time
- Within 14 days: Elevated — limited scheduling flexibility
- 14–30 days: Standard lead time
- 30+ days: Comfortable lead time

### 3. Inventory & Material Availability
- You will be given current inventory levels for requested materials
- If key materials are OUT OF STOCK → flag and raise priority (team needs to act)
- If requested quantities exceed available stock → raise priority
- If materials are at LOW STOCK levels → moderate concern
- If all materials are well-stocked → no inventory pressure

### 4. Audience Scale
- 200+ attendees: Very high impact, significant material/prep needs
- 100–199 attendees: High impact
- 50–99 attendees: Moderate
- Under 50: Standard

### 5. Audience Vulnerability
- Foster families, refugee communities, tribal populations → elevated priority
- Low-income or Title I school populations → elevated priority
- Non-English-speaking communities (especially with language-specific material needs) → elevated priority
- Healthcare providers/professionals → elevated (they multiply community impact)
- General public → standard

### 6. Geographic Eligibility
- ONLY Utah-based events qualify for staff support (geographic_eligible: true)
- Out-of-state → mail materials only, mark geographic_eligible: false
- Outside US → not eligible, mark geographic_eligible: false
- For mailing requests: only Utah shipping addresses are in the service area

### 7. Topic Sensitivity
- Firearm safety, suicide prevention, substance abuse, abuse/neglect → require specialized presenters, raise priority
- Water safety, car seat safety → seasonal urgency (summer months)
- General wellness, nutrition → standard complexity

### 8. Special Requirements
- Accessibility needs, language-specific materials, AV equipment, interpreter needs → raise priority due to extra coordination

## Final Priority Determination
- "urgent": Multiple high-severity factors (e.g., staff needed + event within 7 days + inventory issues, or 200+ attendees within 14 days)
- "high": At least one strong factor (e.g., staff needed within 14 days, OR inventory shortages with tight deadline, OR vulnerable population + large audience)
- "medium": Standard requests with moderate factors (e.g., event in 2–4 weeks with adequate inventory, mailing with some inventory concerns)
- "low": Simple requests with no pressing factors (e.g., mailing with all materials in stock and flexible timeline, event 30+ days out with no complications)

## Fulfillment Rules
- Mailing requests → "mail"
- Pickup requests → "pickup"
- In-person events in Utah → "staff_event"
- In-person events outside Utah → "mail" (send materials only, flag this)
- Virtual events → "virtual_staff"

## Output

Tags: Generate relevant tags from the topics, audience types, and material categories.

Notes analysis: If additional notes are provided, extract any special requirements, accessibility needs, language preferences, or logistical concerns.

Flags: Note any data quality issues, inventory concerns, scheduling conflicts, or anything that requires human attention.

Respond ONLY with valid JSON matching this exact schema:
{
  "priority": "low" | "medium" | "high" | "urgent",
  "priority_reasoning": "string — explain which factors contributed and how they were weighed",
  "fulfillment_recommendation": "mail" | "staff_event" | "virtual_staff" | "pickup",
  "fulfillment_reasoning": "string",
  "tags": ["string"],
  "notes_analysis": "string or null",
  "geographic_eligible": boolean,
  "geographic_reasoning": "string",
  "flags": ["string"]
}`;

/** Exported so the admin UI can show what prompt the AI uses */
export const AI_SYSTEM_PROMPT = SYSTEM_PROMPT;

export async function classifyRequest(
  request: RequestRow,
  inventory?: InventoryContext[],
): Promise<AIClassification> {
  try {
    const requestData: Record<string, unknown> = {
      request_type: request.request_type,
      name: request.name,
      organization: request.organization,
      event_date: request.event_date,
      event_address: request.event_address,
      event_zip: request.event_zip,
      state: request.state,
      county: request.county,
      estimated_attendees: request.estimated_attendees,
      target_audience: request.target_audience ? JSON.parse(request.target_audience) : null,
      topics: request.topics ? JSON.parse(request.topics) : null,
      materials: request.materials ? JSON.parse(request.materials) : null,
      additional_notes: request.additional_notes,
      indoor_outdoor: request.indoor_outdoor,
      date_needed: request.date_needed,
    };

    // Build inventory context for the AI
    if (inventory && requestData.materials) {
      const materials = requestData.materials as { itemId: string; quantity: number }[];
      const inventoryCheck = materials.map(m => {
        const inv = inventory.find(i => i.item_id === m.itemId);
        return {
          item_id: m.itemId,
          requested_quantity: m.quantity,
          in_stock: inv?.quantity ?? 'not tracked',
          low_stock_threshold: inv?.low_stock_threshold ?? null,
          status: inv
            ? inv.quantity === 0
              ? 'OUT_OF_STOCK'
              : m.quantity > inv.quantity
                ? 'INSUFFICIENT'
                : inv.quantity <= inv.low_stock_threshold
                  ? 'LOW_STOCK'
                  : 'AVAILABLE'
            : 'NOT_TRACKED',
        };
      });
      requestData.inventory_check = inventoryCheck;
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Classify this community health request:\n\n${JSON.stringify(requestData, null, 2)}`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text) as AIClassification;
    return parsed;
  } catch (error) {
    console.error('AI classification error:', error);
    return getDefaultClassification(request, inventory);
  }
}

function getDefaultClassification(
  request: RequestRow,
  inventory?: InventoryContext[],
): AIClassification {
  const isMailOnly = request.request_type === 'mailing';
  const isPickup = request.request_type === 'pickup';
  const isVirtual = request.request_type === 'virtual';
  const addressText = (request.event_address || request.shipping_address || '').toLowerCase();
  const isUtah = request.state === 'Utah' || addressText.includes(', ut ') || addressText.includes(', utah');

  // Smarter default priority based on multiple factors
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  const reasons: string[] = [];

  // Factor: staff requirements
  if (isMailOnly || isPickup) {
    priority = 'low';
    reasons.push('No staff required (mailing/pickup)');
  } else {
    reasons.push(request.request_type === 'in_person' ? 'In-person staff required' : 'Virtual presenter required');
  }

  // Factor: time urgency
  const dateStr = request.event_date || request.date_needed;
  if (dateStr) {
    const daysOut = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysOut <= 3) {
      priority = 'urgent';
      reasons.push(`Only ${daysOut} day(s) until needed — critical`);
    } else if (daysOut <= 7) {
      if (priority !== 'urgent') priority = 'high';
      reasons.push(`${daysOut} days until needed — very urgent`);
    } else if (daysOut <= 14) {
      if (priority === 'low') priority = 'medium';
      reasons.push(`${daysOut} days until needed — elevated`);
    } else {
      reasons.push(`${daysOut} days until needed — comfortable lead time`);
    }
  }

  // Factor: inventory availability
  if (inventory && request.materials) {
    try {
      const materials: { itemId: string; quantity: number }[] = JSON.parse(request.materials);
      const outOfStock = materials.filter(m => {
        const inv = inventory.find(i => i.item_id === m.itemId);
        return inv && inv.quantity === 0;
      });
      const insufficient = materials.filter(m => {
        const inv = inventory.find(i => i.item_id === m.itemId);
        return inv && inv.quantity > 0 && m.quantity > inv.quantity;
      });
      if (outOfStock.length > 0) {
        if (priority === 'low') priority = 'medium';
        if (priority === 'medium') priority = 'high';
        reasons.push(`${outOfStock.length} item(s) out of stock`);
      } else if (insufficient.length > 0) {
        if (priority === 'low') priority = 'medium';
        reasons.push(`${insufficient.length} item(s) have insufficient stock`);
      }
    } catch { /* ignore parse errors */ }
  }

  // Factor: audience scale
  if (request.estimated_attendees) {
    if (request.estimated_attendees >= 200) {
      if (priority !== 'urgent') priority = 'high';
      reasons.push(`Large audience: ${request.estimated_attendees} attendees`);
    } else if (request.estimated_attendees >= 100) {
      if (priority === 'low') priority = 'medium';
      reasons.push(`${request.estimated_attendees} attendees`);
    }
  }

  return {
    priority,
    priority_reasoning: `Default classification (AI unavailable). Factors: ${reasons.join('; ')}`,
    fulfillment_recommendation: isMailOnly ? 'mail' : isPickup ? 'pickup' : isVirtual ? 'virtual_staff' : isUtah ? 'staff_event' : 'mail',
    fulfillment_reasoning: 'Default classification based on request type',
    tags: request.topics ? JSON.parse(request.topics) : [],
    notes_analysis: request.additional_notes || null,
    geographic_eligible: isUtah,
    geographic_reasoning: isUtah ? 'Within Utah service area' : 'Outside Utah service area',
    flags: ['AI classification unavailable - using rule-based defaults'],
  };
}
