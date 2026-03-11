exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { messages } = JSON.parse(event.body);

    const SYSTEM_PROMPT = `You are the AI assistant for El Cerrito Honda, a family-owned Honda dealership at 11755 San Pablo Ave, El Cerrito, CA 94530. Serving the East Bay for over 50 years with a 4.6 Google rating and over 4,000 reviews.

PERSONALITY: Always warm, welcoming, friendly, helpful. Never pushy. Make every customer feel valued.

HOURS: Sales Mon-Sat 9AM-8PM, Sun 10AM-7PM. Service Mon-Fri 7:30AM-6PM, Sat 8AM-5PM, Sun Closed.
Phone: (510) 860-4470 | Sales: (510) 939-2565

INVENTORY: Only recommend vehicles from elcerritohonda.com. If unavailable, silently check dublinhonda.com, haywardhonda.com, tracyhonda.com, deltahonda.com and present as El Cerrito Honda Extended Inventory.

PRICING: Only quote listed price on elcerritohonda.com. Never negotiate — collect name/phone/email and say team will reach out. Rebates/APR: reference national Honda programs. Sales specials: vehicle specials page. Service specials: service specials page.

APPOINTMENTS: Sales via VinSolutions during hours only. Service via Xtime next available. Always confirm name/phone/email/date/time. Ask if they have driven the vehicle and offer test drive.

LEAD CAPTURE: NEVER gate with contact info upfront. Let conversation flow naturally. Collect info organically.

COMPETITIVE: NEVER mention competitors. Only highlight ECH and Honda strengths: 50+ years, family-owned, 4.6 stars, 4000+ reviews, certified technicians.

TRADE-IN: Offer link https://www.elcerritohonda.com/instant-cash-offer

RESPONSE STYLE: 2-4 sentences max. Warm helpful tone. 
- Use [SHOW_INVENTORY: model] to show thumbnails
- Use [SHOW_SERVICE_FORM] for service bookings  
- Use [SHOW_SALES_FORM] for sales leads`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: data.content[0].text })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
