/**
 * Starting points for the one-off email composer. Text in [square brackets]
 * is for the sender to replace before sending.
 */

export interface ExampleMessage {
  id: string;
  label: string;
  subject: string;
  preheader: string;
  bodyHtml: string;
}

export const EXAMPLE_MESSAGES: ExampleMessage[] = [
  {
    id: "generic-outreach",
    label: "Generic outreach",
    subject: "A quick hello from Momentum Logistics",
    preheader: "Shipping from Poland to the UK and Europe, made simple",
    bodyHtml: [
      "<h2>Shipping made simple, from Poland to Europe</h2>",
      "<p>Hello [Name],</p>",
      "<p>I'm [Your name] from <strong>Momentum Logistics Services</strong>. We help people and businesses in Poland send parcels to the UK and across Europe, with DHL and FedEx at prices agreed upfront.</p>",
      "<p>Here is what you get with us:</p>",
      "<ul>",
      "<li><p>Instant quotes from several carriers in one place</p></li>",
      "<li><p>Collection from your address, or drop-off at a nearby point</p></li>",
      "<li><p>Tracking and VAT invoices for every shipment</p></li>",
      "</ul>",
      "<p>If you have a shipment coming up, simply reply to this email and I'll help you find the best option.</p>",
      '<p><a class="btn" href="https://[your-website]">Get a quote</a></p>',
    ].join(""),
  },
  {
    id: "service-update",
    label: "Service update",
    subject: "An update about your shipments",
    preheader: "What is changing and what it means for you",
    bodyHtml: [
      "<h2>[What is changing]</h2>",
      "<p>Hello [Name],</p>",
      "<p>We want to let you know that [describe the change and when it happens].</p>",
      "<blockquote><p>Shipments already in transit are not affected.</p></blockquote>",
      "<p>If you have any questions, reply to this email and our team will help.</p>",
    ].join(""),
  },
  {
    id: "blank",
    label: "Blank message",
    subject: "",
    preheader: "",
    bodyHtml: "<p>Hello [Name],</p><p></p>",
  },
];
