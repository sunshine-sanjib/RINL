const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const SYSTEM_PROMPT = `You are VISHWA — RINL Visakhapatnam Steel Plant's intelligent Contract Management Assistant. You help contractors, coordinators, and EICs at Rashtriya Ispat Nigam Limited (RINL).

Your expertise covers:
- UPS Contract Management (ETL contracts, BOQ items, asset tracking)
- Complaint registration and tracking procedures
- Preventive Maintenance (PM) report submission guidelines
- RINL organizational structure (IT & ERP Department)
- SLA policies: Critical=4hrs, High=24hrs, Medium=72hrs, Low=168hrs
- Complaint categories: Hardware, Software, Network, UPS Failure, Battery, Power Supply
- Maintenance types: Preventive, Corrective, Breakdown, Annual
- Roles: Contractor (raises issues), Coordinator (manages zone), EIC (approves), Admin

Tone: Professional, helpful, concise. Use bullet points for lists. When users ask about status, guide them to the portal sections. Never share credentials or sensitive data. For escalations, direct to EIC or Admin.

Always respond in English unless asked otherwise. Keep answers relevant to RINL operations.`;

router.post('/', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array required.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      // Fallback responses when no API key
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = getFallbackResponse(lastMsg);
      return res.json({ success: true, message: reply });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10) // last 10 messages for context
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'AI API error');
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'I could not generate a response.';
    res.json({ success: true, message: reply });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.status(500).json({ success: false, message: 'AI service temporarily unavailable. Please try again.' });
  }
});

function getFallbackResponse(msg) {
  if (msg.includes('complaint') || msg.includes('issue') || msg.includes('problem')) {
    return '**Raising a Complaint:**\n\n1. Go to **Complaints → New Complaint**\n2. Fill ETL Asset Number, Location, Zone\n3. Select Category (Hardware/Software/UPS Failure etc.)\n4. Set Priority and describe the issue\n5. Submit to get your **Ticket ID**\n\nYour complaint will be tracked and assigned to the concerned team within SLA timelines.';
  }
  if (msg.includes('pm') || msg.includes('preventive') || msg.includes('maintenance')) {
    return '**Submitting a PM Report:**\n\n1. Go to **Maintenance → New PM Report**\n2. Enter UPS Serial Number, Location, PM Date\n3. Complete the checklist (visual inspection, battery check, etc.)\n4. Enter measurements (AC/DC voltages, currents)\n5. Add battery data and remarks\n6. Submit for coordinator/EIC approval';
  }
  if (msg.includes('sla') || msg.includes('deadline')) {
    return '**SLA Timelines:**\n\n- 🔴 **Critical** — 4 hours\n- 🟠 **High** — 24 hours\n- 🟡 **Medium** — 72 hours\n- 🟢 **Low** — 168 hours (7 days)\n\nBreached SLAs are flagged on the dashboard. Contact your EIC for escalation.';
  }
  if (msg.includes('status') || msg.includes('track')) {
    return 'To track your complaint/report status:\n\n1. Go to **My Complaints** or **My Reports**\n2. Use the **Ticket ID** to search\n3. View real-time timeline and approval status\n\nStatus flow: Open → Assigned → In Progress → Resolved → Closed';
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('help')) {
    return 'Hello! I\'m **VISHWA**, your RINL Contract Management Assistant. I can help you with:\n\n- 📋 Raising & tracking complaints\n- 🔧 Submitting PM reports\n- 📊 Understanding SLA policies\n- 🏗️ RINL operational procedures\n\nWhat do you need help with today?';
  }
  return 'I\'m here to help with RINL Contract Management. You can ask me about:\n- Complaint registration procedures\n- Preventive maintenance reports\n- SLA timelines and escalation\n- Portal navigation\n\nPlease configure your Anthropic API key in `.env` for full AI capabilities.';
}

module.exports = router;
