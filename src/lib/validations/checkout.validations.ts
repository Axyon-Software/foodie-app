// src/lib/validations/checkout.validations.ts
import { z } from 'zod';

export const addressSchema = z.object({
    street: z
        .string()
        .min(3, 'Rua deve ter pelo menos 3 caracteres')
        .max(100, 'Rua muito longa'),
    number: z
        .string()
        .min(1, 'Número é obrigatório'),
    complement: z
        .string()
        .max(50, 'Complemento muito longo')
        .optional(),
    neighborhood: z
        .string()
        .min(2, 'Bairro deve ter pelo menos 2 caracteres')
        .max(50, 'Bairro muito longo'),
    city: z
        .string()
        .min(2, 'Cidade deve ter pelo menos 2 caracteres')
        .max(50, 'Cidade muito longa'),
    state: z
        .string()
        .length(2, 'Selecione um estado'),
    zipCode: z
        .string()
        .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
});

export const paymentSchema = z.object({
    method: z
        .enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH'], {
            message: 'Selecione uma forma de pagamento',
        })
        .nullable()
        .refine((val) => val !== null, {
            message: 'Selecione uma forma de pagamento',
        }),
    changeFor: z
        .number()
        .positive('Valor deve ser positivo')
        .optional(),
});

export const checkoutSchema = z.object({
    address: addressSchema,
    payment: paymentSchema,
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const cardSchema = z.object({
    number: z
        .string()
        .min(13, 'Número do cartão inválido')
        .max(19, 'Número do cartão inválido'),
    expiry: z
        .string()
        .regex(/^\d{2}\/\d{2}$/, 'Data de validade inválida'),
    cvc: z
        .string()
        .min(3, 'CVV inválido')
        .max(4, 'CVV inválido'),
    name: z
        .string()
        .min(2, 'Nome do titular é obrigatório'),
    saveCard: z.boolean().optional(),
});

export type CardFormData = z.infer<typeof cardSchema>;