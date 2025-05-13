# **App Name**: InvoiceFlow

## Core Features:

- CSV Product Import: Allows users to upload a CSV file containing product details including title, size, variant SKU, cost price, variant price, GST, and image source URL.
- Product Auto-fill: Search and select product by name. All product details are auto-populated upon selection.
- Customer Details Entry: Enables users to enter customer details (name, address, contact info) and stores it in memory for use in the invoice. Allows temporary storage (cookies, local storage) of customer details, so that the LLM tool does not keep a persistent copy.
- Invoice Generation: Generates invoices in a pre-designed HTML template that is compliant with standard invoice designs. This involves transforming data into the specified layout and producing HTML code which represents the invoice. Allows users to specify invoice details like invoice number, issue date and due date.
- AI Powered Clause Highlighting: As a tool, it makes intelligent decisions about highlighting specific clauses of the company's payment policy based on the payment history of the customer.  For example, new customers might get favorable payment terms or additional incentives, while it shows stringent payment clauses for delinquent customers.

## Style Guidelines:

- Primary color: Neutral white or light gray for a professional look.
- Secondary color: Shades of blue for trust and stability.
- Accent: Green (#4CAF50) for actions and key information highlighting.
- Clean, professional typography to ensure readability. Consider fonts optimized for digital displays.
- Simple, clear icons for easy navigation and visual cues.
- Clean, well-organized layout with clear sections for company info, client info, invoice details, and line items.
- Subtle transitions and animations for interactive elements.