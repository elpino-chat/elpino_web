export const DEMO_USER_ID = "demo@elpino.local";

export function isDemoUser(userId: string) {
  return userId === DEMO_USER_ID;
}

function atHour(dayOffset: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function demoEmails() {
  return [
    {
      id: "demo-email-1",
      summary:
        "Email from Elena Torres (Seed round data room): Elena from Meridian Ventures asked for the latest revenue snapshot, security notes, and a short founder update before Friday.",
      category: "investor_update",
      tab: "business" as const,
      person: "Elena Torres",
      dueDate: atHour(1, 17),
      createdAt: atHour(0, 9, 12),
      messageId: "demo-msg-001",
      sample: true,
    },
    {
      id: "demo-email-2",
      summary:
        "Email from Jordan Lee (Move onboarding call): Jordan from Acme Ops wants to move tomorrow's onboarding call to 3:30 PM and asked whether the same invite can be updated.",
      category: "meeting_request",
      tab: "business" as const,
      person: "Jordan Lee",
      dueDate: atHour(1, 15, 30),
      createdAt: atHour(0, 8, 48),
      messageId: "demo-msg-002",
      sample: true,
    },
    {
      id: "demo-email-3",
      summary:
        "Email from Priya Shah (Invoice approval needed): Priya sent a 4,800 dollar vendor invoice and needs approval before finance closes this week.",
      category: "payment_due",
      tab: "business" as const,
      person: "Priya Shah",
      dueDate: atHour(2, 12),
      createdAt: atHour(0, 8, 5),
      messageId: "demo-msg-003",
      sample: true,
    },
    {
      id: "demo-email-4",
      summary:
        "Email from Marcus Reed (Customer expansion follow-up): Marcus asked for the revised rollout timeline and wants a concise reply before his internal review.",
      category: "follow_up_needed",
      tab: "business" as const,
      person: "Marcus Reed",
      dueDate: atHour(1, 11),
      createdAt: atHour(-1, 18, 35),
      messageId: "demo-msg-004",
      sample: true,
    },
    {
      id: "demo-email-5",
      summary:
        "Email from Linear (Workspace security alert): Linear flagged a new admin login and recommends reviewing workspace access settings.",
      category: "account_alert",
      tab: "updates" as const,
      person: "Linear",
      dueDate: "",
      createdAt: atHour(-1, 15, 10),
      messageId: "demo-msg-005",
      sample: true,
    },
  ];
}

export function demoEmailTasks() {
  return [
    {
      id: "demo-task-email-1",
      summary: "Follow up with Marcus Reed about rollout timeline",
      source: "email",
      status: "active",
      createdAt: atHour(0, 10, 20),
    },
    {
      id: "demo-task-email-2",
      summary: "Review Priya Shah invoice before finance close",
      source: "gmail",
      status: "active",
      createdAt: atHour(0, 9, 40),
    },
  ];
}

export function demoPeople() {
  return [
    {
      id: "demo-person-elena",
      type: "person" as const,
      canonicalName: "Elena Torres",
      createdAt: atHour(-2, 14),
      emails: ["elena@meridian.ventures"],
      phones: [],
      urls: ["meridian.ventures"],
      sample: true,
    },
    {
      id: "demo-person-jordan",
      type: "person" as const,
      canonicalName: "Jordan Lee",
      createdAt: atHour(-1, 16),
      emails: ["jordan@acmeops.co"],
      phones: ["+1 415 555 0198"],
      urls: ["acmeops.co"],
      sample: true,
    },
    {
      id: "demo-person-priya",
      type: "person" as const,
      canonicalName: "Priya Shah",
      createdAt: atHour(-3, 11),
      emails: ["priya@northlane.finance"],
      phones: [],
      urls: ["northlane.finance"],
      sample: true,
    },
    {
      id: "demo-person-marcus",
      type: "person" as const,
      canonicalName: "Marcus Reed",
      createdAt: atHour(-4, 10),
      emails: ["marcus@brightdesk.ai"],
      phones: ["+1 646 555 0134"],
      urls: ["brightdesk.ai"],
      sample: true,
    },
  ];
}

export function demoMeetings() {
  return [
    {
      id: "demo-meeting-standup",
      title: "Founder ops standup",
      start: atHour(0, 10, 30),
      end: atHour(0, 11),
      allDay: false,
      location: "Google Meet",
      meetingUrl: "https://meet.google.com/demo-ops",
      attendees: ["Elena Torres", "Jordan Lee"],
      source: "google" as const,
      status: "confirmed",
    },
    {
      id: "demo-meeting-customer",
      title: "BrightDesk expansion review",
      start: atHour(0, 14),
      end: atHour(0, 14, 45),
      allDay: false,
      location: "Zoom",
      meetingUrl: "https://cal.com/demo/brightdesk",
      attendees: ["Marcus Reed"],
      source: "calcom" as const,
      status: "accepted",
    },
    {
      id: "demo-meeting-investor",
      title: "Meridian Ventures partner sync",
      start: atHour(1, 11),
      end: atHour(1, 11, 45),
      allDay: false,
      location: "Google Meet",
      meetingUrl: "https://meet.google.com/demo-meridian",
      attendees: ["Elena Torres"],
      source: "google" as const,
      status: "confirmed",
    },
    {
      id: "demo-meeting-finance",
      title: "Invoice approval review",
      start: atHour(2, 15),
      end: atHour(2, 15, 30),
      allDay: false,
      location: "Google Meet",
      attendees: ["Priya Shah"],
      source: "google" as const,
      status: "confirmed",
    },
  ];
}

export function demoReminders() {
  return [
    {
      id: "demo-reminder-1",
      message: "Send Elena the updated founder brief",
      recurring: false,
      state: "upcoming" as const,
      runAt: atHour(0, 16, 30),
    },
    {
      id: "demo-reminder-2",
      message: "Check whether Marcus replied to rollout timeline",
      recurring: false,
      state: "upcoming" as const,
      runAt: atHour(1, 10),
    },
  ];
}

export function demoContacts() {
  return [
    {
      id: "demo-contact-sara",
      name: "Sara Whitman",
      email: "sara.whitman@brightloop.com",
      phone: "+1 512 555 0142",
      createdAt: atHour(-2, 9, 15),
      updatedAt: atHour(-2, 9, 15),
      sourceCount: 2,
      customerIds: ["demo-contact-sara"],
      customFields: { company: "Brightloop", teamSize: "11-50" },
    },
    {
      id: "demo-contact-devon",
      name: "Devon Park",
      email: "devon@parkstudio.co",
      phone: null,
      createdAt: atHour(-1, 13, 40),
      updatedAt: atHour(-1, 13, 40),
      sourceCount: 1,
      customerIds: ["demo-contact-devon"],
      customFields: {},
    },
    {
      id: "demo-contact-nadia",
      name: "Nadia Iqbal",
      email: null,
      phone: "+44 7700 900123",
      createdAt: atHour(0, 8, 5),
      updatedAt: atHour(0, 8, 5),
      sourceCount: 1,
      customerIds: ["demo-contact-nadia"],
      customFields: {},
    },
  ];
}

export function demoContactSessions(contactId: string) {
  const bySara = [
    {
      id: "demo-session-sara-1",
      topic: "Billing",
      status: "resolved" as const,
      handledBy: "ai" as const,
      preview: "Can you refund my last invoice? It was double charged.",
      time: atHour(-2, 9, 20),
    },
    {
      id: "demo-session-sara-2",
      topic: "Billing",
      status: "open" as const,
      handledBy: "human" as const,
      preview: "Thanks, following up on the refund from last week.",
      time: atHour(0, 11, 5),
    },
  ];
  const byDevon = [
    {
      id: "demo-session-devon-1",
      topic: "Technical support",
      status: "waiting" as const,
      handledBy: "ai" as const,
      preview: "The widget isn't loading on our pricing page.",
      time: atHour(-1, 13, 45),
    },
  ];
  const byNadia = [
    {
      id: "demo-session-nadia-1",
      topic: "Sales",
      status: "open" as const,
      handledBy: "human" as const,
      preview: "Interested in the team plan, can we get a demo?",
      time: atHour(0, 8, 10),
    },
  ];

  if (contactId === "demo-contact-sara") return bySara;
  if (contactId === "demo-contact-devon") return byDevon;
  if (contactId === "demo-contact-nadia") return byNadia;
  return [];
}

export function demoSessionMessages(sessionId: string) {
  const scripts: Record<string, { senderType: "customer" | "agent" | "ai"; body: string }[]> = {
    "demo-session-sara-1": [
      { senderType: "customer", body: "Hi, I think I was charged twice for my last invoice." },
      { senderType: "ai", body: "I'm sorry about that! Let me check your billing history — one moment." },
      { senderType: "ai", body: "You're right, there's a duplicate charge from the 12th. I've flagged it for a refund." },
      { senderType: "customer", body: "Great, thank you!" },
    ],
    "demo-session-sara-2": [
      { senderType: "customer", body: "Hey, just following up on the refund from last week." },
      { senderType: "agent", body: "Hi Sara, sorry for the delay — I can see the refund was processed yesterday." },
      { senderType: "customer", body: "Perfect, I see it now. Thanks for confirming!" },
    ],
    "demo-session-devon-1": [
      { senderType: "customer", body: "The chat widget isn't loading on our pricing page, only on the homepage." },
      { senderType: "ai", body: "Thanks for flagging — could you share the exact URL where it's not showing up?" },
      { senderType: "customer", body: "https://parkstudio.co/pricing" },
    ],
    "demo-session-nadia-1": [
      { senderType: "customer", body: "Hi, we're a team of 12 and interested in the team plan. Can we get a demo?" },
      { senderType: "agent", body: "Absolutely! I'll send over a scheduling link so you can pick a time that works." },
    ],
  };
  return (scripts[sessionId] ?? []).map((message, index) => ({
    id: `${sessionId}-${index}`,
    senderType: message.senderType,
    body: message.body,
    createdAt: atHour(-1, 9 + index),
  }));
}
