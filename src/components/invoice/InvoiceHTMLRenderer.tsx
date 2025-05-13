import type { Invoice, InvoiceItem } from '@/types';

interface InvoiceHTMLRendererProps {
  invoice: Invoice;
}

// This function returns the HTML string for an invoice.
// It's not a React component itself but a utility to generate HTML.
export default function InvoiceHTMLRenderer({ invoice }: InvoiceHTMLRendererProps): string {
  const {
    invoiceNumber,
    issueDate,
    dueDate,
    customer,
    items,
    subtotal,
    totalTax,
    grandTotal,
    companyInfo,
    paymentInstructions,
    thankYouMessage,
  } = invoice;

  const renderItems = (items: InvoiceItem[]) => {
    return items.map(item => `
      <tr>
        <td>
          <div class="product-img-container">
            <img src="${item.imageSrc || 'https://picsum.photos/100/100?grayscale'}" 
                 alt="${item.title}" 
                 class="product-img"
                 data-ai-hint="product photo">
          </div>
        </td>
        <td>${item.title}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
        <td style="text-align: center;">${item.gstRate.toFixed(2)}%</td>
        <td style="text-align: right;">₹${item.taxAmount.toFixed(2)}</td>
        <td style="text-align: right;">₹${item.totalAmount.toFixed(2)}</td>
      </tr>
    `).join('');
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceNumber}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Inter', Arial, sans-serif; /* Using Inter from main layout */
            }
            body {
                padding: 20px; /* Reduced padding for iframe */
                color: #333;
                background-color: #fff;
                font-size: 14px;
                line-height: 1.6;
            }
            .invoice-wrapper {
                max-width: 800px; /* Adjusted for typical A4 */
                margin: 0 auto;
                background: #fff;
                padding: 20px; /* Reduced padding */
                border: 1px solid #eee;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #007bff; /* Blue accent */
            }
            .logo-container {
                 max-width: 180px; /* Max width for logo */
            }
            .logo {
                max-height: 70px; /* Reduced logo size */
                width: auto;
            }
            .company-info {
                text-align: right;
            }
            .company-info h2 {
                color: #007bff; /* Blue accent */
                margin-bottom: 5px;
                font-size: 1.5em;
            }
            .invoice-details-section { /* Renamed to avoid conflict */
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .client-info, .invoice-meta-info { /* Renamed */
                width: 48%;
            }
            .invoice-meta-info {
                text-align: right;
            }
            h3 {
                color: #555;
                margin-bottom: 8px;
                font-size: 1.1em;
                border-bottom: 1px solid #eee;
                padding-bottom: 4px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th {
                background-color: #f0f6ff; /* Light blue background */
                padding: 10px; /* Adjusted padding */
                text-align: left;
                border-bottom: 2px solid #cce0ff; /* Lighter blue border */
                font-size: 0.9em;
                text-transform: uppercase;
            }
            td {
                padding: 10px; /* Adjusted padding */
                border-bottom: 1px solid #eee;
                vertical-align: middle;
            }
            .product-img-container {
                width: 60px; /* Smaller image */
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f8f8f8;
                border-radius: 4px;
                padding: 5px;
            }
            .product-img {
                max-height: 100%;
                max-width: 100%;
                object-fit: contain;
                border-radius: 2px;
            }
            .totals-table { /* For summary totals */
                width: 50%;
                margin-left: auto;
                margin-top: 20px;
            }
            .totals-table td {
                padding: 8px;
            }
            .totals-table .label {
                text-align: right;
                font-weight: bold;
                color: #555;
            }
            .totals-table .value {
                text-align: right;
            }
            .grand-total td {
                font-weight: bold;
                font-size: 1.2em;
                color: #007bff;
                border-top: 2px solid #007bff;
            }
            .notes-section, .payment-info-section { /* Renamed */
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
            .payment-info-section {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
            }
            .footer-thankyou {
                text-align: center;
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #eee;
                font-style: italic;
                color: #777;
            }
            p { margin-bottom: 5px; }
            @media print {
                body { padding: 0; font-size: 12px; } /* Adjust font size for print */
                .invoice-wrapper { border: none; padding: 0; box-shadow: none; }
                .header { border-bottom: 2px solid #000; } /* Use black for print */
                .company-info h2 { color: #000; }
                th { background-color: #e9ecef !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } /* Ensure background prints */
                .grand-total td { color: #000; border-top: 2px solid #000;}
                .payment-info-section { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-wrapper">
            <div class="header">
                <div class="logo-container">
                    <img src="${companyInfo.logoUrl}" alt="${companyInfo.name} Logo" class="logo">
                </div>
                <div class="company-info">
                    <h2>${companyInfo.name}</h2>
                    <p>${companyInfo.address}<br>
                    ${companyInfo.cityStateZip}<br>
                    Phone: ${companyInfo.phone}<br>
                    ${companyInfo.email}</p>
                </div>
            </div>

            <div class="invoice-details-section">
                <div class="client-info">
                    <h3>Bill To:</h3>
                    <p><strong>${customer.name}</strong><br>
                    ${customer.company ? customer.company + '<br>' : ''}
                    ${customer.addressLine1}<br>
                    ${customer.addressLine2 ? customer.addressLine2 + '<br>' : ''}
                    ${customer.city}, ${customer.state} ${customer.zip}<br>
                    ${customer.email ? 'Email: ' + customer.email + '<br>' : ''}
                    ${customer.phone ? 'Phone: ' + customer.phone : ''}
                    </p>
                </div>
                <div class="invoice-meta-info">
                    <h3>Invoice #${invoiceNumber}</h3>
                    <p><strong>Date:</strong> ${issueDate}<br>
                    <strong>Due Date:</strong> ${dueDate}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: center;">GST (%)</th>
                        <th style="text-align: right;">Tax Amt</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${renderItems(items)}
                </tbody>
            </table>

            <table class="totals-table">
                <tbody>
                    <tr>
                        <td class="label">Subtotal:</td>
                        <td class="value">₹${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="label">Total Tax (GST):</td>
                        <td class="value">₹${totalTax.toFixed(2)}</td>
                    </tr>
                    <tr class="grand-total">
                        <td class="label">Grand Total:</td>
                        <td class="value">₹${grandTotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            ${paymentInstructions ? `
            <div class="payment-info-section">
                <h4>Payment Instructions</h4>
                <p>Please make payments to: <strong>${paymentInstructions.payableTo}</strong></p>
                ${paymentInstructions.bankName ? `<p>Bank: ${paymentInstructions.bankName}</p>` : ''}
                ${paymentInstructions.accountName ? `<p>Account Name: ${paymentInstructions.accountName}</p>` : ''}
                ${paymentInstructions.accountNumber ? `<p>Account Number: ${paymentInstructions.accountNumber}</p>` : ''}
                ${paymentInstructions.notes && paymentInstructions.notes.length > 0 ? paymentInstructions.notes.map(note => `<p><small>${note}</small></p>`).join('') : ''}
            </div>
            ` : ''}

            ${thankYouMessage ? `
            <div class="footer-thankyou">
                <p>${thankYouMessage}</p>
            </div>
            ` : ''}
        </div>
    </body>
    </html>
  `;
}
