// src/lib/utils/receipt.utils.ts
import { ReceiptData } from '@/types/payment.types';

export function formatReceiptForPrint(receipt: ReceiptData): string {
    const itemsList = receipt.items
        .map(item => `${item.quantity}x ${item.name}\nR$ ${item.totalPrice.toFixed(2)}`)
        .join('\n');

    return `
========================================
         ${receipt.restaurantName}
========================================
CNPJ: ${receipt.restaurantCNPJ || 'XX.XXX.XXX/XXXX-XX'}

RECIBO DE PAGAMENTO
Nº: ${receipt.id}

----------------------------------------
CLIENTE
${receipt.customerName}
${receipt.customerEmail}

----------------------------------------
ENDEREÇO DE ENTREGA
${receipt.address.street}, ${receipt.address.number}
${receipt.address.complement || ''}
${receipt.address.neighborhood} - ${receipt.address.city}/${receipt.address.state}
CEP: ${receipt.address.zipCode}

----------------------------------------
ITENS
${itemsList}

----------------------------------------
SUBTOTAL:        R$ ${receipt.subtotal.toFixed(2)}
FRETE:           R$ ${receipt.deliveryFee.toFixed(2)}
${receipt.discount > 0 ? `DESCONTO:       -R$ ${receipt.discount.toFixed(2)}\n` : ''}
----------------------------------------
TOTAL:           R$ ${receipt.total.toFixed(2)}

========================================
FORMA DE PAGAMENTO
${receipt.paymentMethod}

${receipt.transactionId ? `TRANSACTION ID: ${receipt.transactionId}` : ''}

Data: ${new Date(receipt.issuedAt).toLocaleString('pt-BR')}
========================================

Obrigado pela preferência!
    `.trim();
}