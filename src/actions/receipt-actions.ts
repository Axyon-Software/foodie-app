// src/actions/receipt-actions.ts
'use server';

import { createClient } from '@/lib/supabase/client';
import { ReceiptData, ReceiptItem, ReceiptAddress } from '@/types/payment.types';

export async function generateReceipt(orderId: string): Promise<{ data?: ReceiptData; error?: string }> {
    try {
        const supabase = createClient();

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return { error: 'Pedido não encontrado' };
        }

        const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('name, cnpj, address')
            .eq('id', order.restaurant_id)
            .single();

        const { data: user } = await supabase.auth.getUser();

        let userName = 'Cliente';
        let userEmail = '';
        
        if (user.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', user.user.id)
                .single();
            
            if (profile) {
                userName = profile.full_name || 'Cliente';
                userEmail = profile.email || '';
            }
        }

        const items: ReceiptItem[] = order.items.map((item: any) => ({
            name: item.menuItemName,
            quantity: item.quantity,
            unitPrice: item.menuItemPrice,
            totalPrice: item.menuItemPrice * item.quantity,
            observation: item.observation,
        }));

        const address: ReceiptAddress = {
            street: order.address?.street || '',
            number: order.address?.number || '',
            complement: order.address?.complement,
            neighborhood: order.address?.neighborhood || '',
            city: order.address?.city || '',
            state: order.address?.state || '',
            zipCode: order.address?.zipCode || '',
        };

        const receipt: ReceiptData = {
            id: `RCP-${orderId.substring(0, 8).toUpperCase()}`,
            orderId: order.id,
            customerName: userName,
            customerEmail: userEmail,
            items,
            subtotal: order.subtotal,
            deliveryFee: order.delivery_fee,
            discount: order.discount || 0,
            total: order.total,
            paymentMethod: order.payment_method,
            paymentGateway: order.payment_gateway,
            transactionId: order.transaction_id,
            address,
            restaurantName: restaurant?.name || 'Restaurante',
            restaurantCNPJ: restaurant?.cnpj,
            issuedAt: new Date().toISOString(),
            status: order.status === 'DELIVERED' ? 'PAID' : 'PENDING',
        };

        return { data: receipt };
    } catch (error) {
        console.error('Error generating receipt:', error);
        return { error: 'Erro ao gerar recibo' };
    }
}

export async function getReceiptByOrder(orderId: string): Promise<{ data?: ReceiptData; error?: string }> {
    return generateReceipt(orderId);
}

export async function sendReceiptByEmail(
    receiptId: string,
    email: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from('receipts')
            .insert({
                receipt_id: receiptId,
                email_sent_to: email,
                sent_at: new Date().toISOString(),
            });

        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending receipt:', error);
        return { error: 'Erro ao enviar recibo por e-mail' };
    }
}

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
