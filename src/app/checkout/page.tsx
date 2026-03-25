'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getRestaurantById } from '@/data/mock';
import { formatPrice } from '@/lib/utils/format.utils';
import {
    addressSchema,
    paymentSchema,
    cardSchema,
    AddressFormData,
} from '@/lib/validations/checkout.validations';
import { PaymentMethod } from '@/types';
import { CardDetails } from '@/types/payment.types';
import { CHECKOUT_MESSAGES } from '@/lib/constants/checkout.constants';
import { createOrder as createOrderAction, type OrderItemData } from '@/actions/orders';
import { getAddresses, type AddressData } from '@/actions/addresses';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import AddressForm from '@/components/checkout/AddressForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import CartEmpty from '@/components/cart/CartEmpty';

export default function CheckoutPage() {
    const router = useRouter();
    const {
        items,
        restaurantId,
        totalPrice,
        appliedCoupon,
        couponDiscount,
        clearCart,
    } = useCart();

    // ✅ Usa AuthContext — fonte única da verdade
    const { isAuthenticated, isLoading: isCheckingAuth } = useAuth();

    // Saved addresses
    const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Address form state
    const [addressData, setAddressData] = useState<AddressFormData>({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
    });
    const [addressErrors, setAddressErrors] = useState<
        Partial<Record<keyof AddressFormData, string>>
    >({});

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [changeFor, setChangeFor] = useState<string>('');
    const [paymentError, setPaymentError] = useState<string>('');
    const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);

    // Loading state
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const restaurant = restaurantId ? getRestaurantById(restaurantId) : null;
    const deliveryFee = restaurant?.deliveryFee || 0;
    const isFreeDeliveryCoupon = appliedCoupon?.code === 'FRETEGRATIS';
    const actualDeliveryFee = isFreeDeliveryCoupon ? 0 : deliveryFee;
    const finalTotal = totalPrice + actualDeliveryFee - couponDiscount;

    // ✅ Carrega endereços quando autenticação estiver confirmada
    useEffect(() => {
        if (!isAuthenticated || isCheckingAuth) return;

        const loadAddresses = async (): Promise<void> => {
            const result = await getAddresses();
            if (result.data && result.data.length > 0) {
                setSavedAddresses(result.data);

                const defaultAddress = result.data.find((addr) => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                    fillAddressForm(defaultAddress);
                }
            }
        };

        loadAddresses();
    }, [isAuthenticated, isCheckingAuth]);

    const fillAddressForm = (address: AddressData): void => {
        setAddressData({
            street: address.street,
            number: address.number,
            complement: address.complement || '',
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
        });
        setAddressErrors({});
    };

    const handleSelectAddress = (addressId: string): void => {
        setSelectedAddressId(addressId);
        const address = savedAddresses.find((a) => a.id === addressId);
        if (address) fillAddressForm(address);
    };

    const handleUseNewAddress = (): void => {
        setSelectedAddressId(null);
        setAddressData({
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
        });
        setAddressErrors({});
    };

    const handleAddressChange = (
        field: keyof AddressFormData,
        value: string
    ): void => {
        setAddressData((prev) => ({ ...prev, [field]: value }));
        if (addressErrors[field]) {
            setAddressErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        if (selectedAddressId) setSelectedAddressId(null);
    };

    const handlePaymentMethodChange = (method: PaymentMethod): void => {
        setPaymentMethod(method);
        setPaymentError('');
        if (method !== 'CASH') setChangeFor('');
    };

    const validateForm = (): boolean => {
        let isValid = true;

        const addressResult = addressSchema.safeParse(addressData);
        if (!addressResult.success) {
            const errors: Partial<Record<keyof AddressFormData, string>> = {};
            addressResult.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof AddressFormData;
                errors[field] = issue.message;
            });
            setAddressErrors(errors);
            isValid = false;
        }

        const paymentResult = paymentSchema.safeParse({
            method: paymentMethod,
            changeFor: changeFor ? parseFloat(changeFor) : undefined,
        });
        if (!paymentResult.success) {
            setPaymentError('Selecione uma forma de pagamento');
            isValid = false;
        }

        if (
            (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') &&
            cardDetails
        ) {
            const cardResult = cardSchema.safeParse(cardDetails);
            if (!cardResult.success) {
                setPaymentError('Dados do cartão inválidos');
                isValid = false;
            }
        }

        return isValid;
    };

    const handleSubmit = async (): Promise<void> => {
        // ✅ Se não autenticado, redireciona antes de qualquer validação
        if (!isAuthenticated) {
            toast.info('Faça login para finalizar seu pedido', { icon: '🔐' });
            router.push('/sign-in?redirectTo=/checkout');
            return;
        }

        if (!validateForm()) return;
        if (!restaurant || !paymentMethod) return;

        setIsLoading(true);

        try {
            const orderItems: OrderItemData[] = items.map((item) => ({
                menuItemId: item.menuItem.id,
                menuItemName: item.menuItem.name,
                menuItemImage: item.menuItem.image || '/placeholder.png',
                menuItemPrice: item.menuItem.price,
                quantity: item.quantity,
                observation: item.observation,
            }));

            const result = await createOrderAction({
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                items: orderItems,
                address: {
                    street: addressData.street,
                    number: addressData.number,
                    complement: addressData.complement || undefined,
                    neighborhood: addressData.neighborhood,
                    city: addressData.city,
                    state: addressData.state,
                    zipCode: addressData.zipCode.replace(/\D/g, ''),
                },
                paymentMethod,
                changeFor: changeFor ? parseFloat(changeFor) : undefined,
                subtotal: totalPrice,
                deliveryFee: actualDeliveryFee,
                discount: couponDiscount,
                total: Math.max(0, finalTotal),
                couponCode: appliedCoupon?.code,
            });

            if (result.error) {
                toast.error(result.error);
                setIsLoading(false);
                return;
            }

            clearCart();
            router.push(`/order/${result.data!.id}`);
        } catch {
            toast.error('Erro ao processar pedido. Tente novamente.');
            setIsLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div
                className="min-h-screen transition-colors"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <CheckoutHeader />
                <CartEmpty />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-32 transition-colors"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
            <CheckoutHeader />

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Saved Addresses Selector */}
                {isAuthenticated && savedAddresses.length > 0 && (
                    <div
                        className="rounded-2xl p-6 border transition-colors"
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            borderColor: 'var(--color-border)',
                        }}
                    >
                        <h2
                            className="font-bold text-lg mb-4"
                            style={{ color: 'var(--color-text)' }}
                        >
                            📍 Endereços salvos
                        </h2>

                        <div className="flex flex-col gap-2">
                            {savedAddresses.map((address) => (
                                <button
                                    key={address.id}
                                    onClick={() => handleSelectAddress(address.id)}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors"
                                    style={{
                                        backgroundColor:
                                            selectedAddressId === address.id
                                                ? 'var(--color-primary-light)'
                                                : 'var(--color-bg-secondary)',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor:
                                            selectedAddressId === address.id
                                                ? '#00A082'
                                                : 'var(--color-border)',
                                        color: 'var(--color-text)',
                                    }}
                                >
                                    <div
                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                                        style={{
                                            borderColor:
                                                selectedAddressId === address.id
                                                    ? '#00A082'
                                                    : 'var(--color-border)',
                                        }}
                                    >
                                        {selectedAddressId === address.id && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-[#00A082]" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <span className="font-medium">
                                            {address.label === 'Casa' && '🏠 '}
                                            {address.label === 'Trabalho' && '🏢 '}
                                            {address.label === 'Outro' && '📍 '}
                                            {address.label}
                                        </span>
                                        <p
                                            className="mt-0.5 text-xs"
                                            style={{
                                                color: 'var(--color-text-secondary)',
                                            }}
                                        >
                                            {address.street}, {address.number}
                                            {address.complement
                                                ? ` - ${address.complement}`
                                                : ''}
                                            {' • '}
                                            {address.neighborhood}
                                        </p>
                                    </div>

                                    {address.isDefault && (
                                        <span
                                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                            style={{
                                                backgroundColor:
                                                    'var(--color-primary-light)',
                                                color: '#00A082',
                                            }}
                                        >
                                            Padrão
                                        </span>
                                    )}
                                </button>
                            ))}

                            <button
                                onClick={handleUseNewAddress}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors"
                                style={{
                                    backgroundColor:
                                        selectedAddressId === null
                                            ? 'var(--color-primary-light)'
                                            : 'var(--color-bg-secondary)',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor:
                                        selectedAddressId === null
                                            ? '#00A082'
                                            : 'var(--color-border)',
                                    color: 'var(--color-text)',
                                }}
                            >
                                <div
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                                    style={{
                                        borderColor:
                                            selectedAddressId === null
                                                ? '#00A082'
                                                : 'var(--color-border)',
                                    }}
                                >
                                    {selectedAddressId === null && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-[#00A082]" />
                                    )}
                                </div>
                                <span className="font-medium">
                                    ✏️ Usar outro endereço
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Address Form */}
                {(!isAuthenticated ||
                    savedAddresses.length === 0 ||
                    selectedAddressId === null) && (
                    <AddressForm
                        data={addressData}
                        errors={addressErrors}
                        onChange={handleAddressChange}
                    />
                )}

                <PaymentForm
                    selectedMethod={paymentMethod}
                    changeFor={changeFor}
                    error={paymentError}
                    totalAmount={Math.max(0, finalTotal)}
                    onMethodChange={handlePaymentMethodChange}
                    onChangeForChange={setChangeFor}
                />

                <OrderSummary />
            </main>

            {/* Fixed Footer */}
            <div
                className="fixed bottom-0 left-0 right-0 border-t p-4 transition-colors"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <div className="max-w-3xl mx-auto">
                    {!isAuthenticated && !isCheckingAuth && (
                        <p
                            className="mb-2 text-center text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            🔐 Você será redirecionado para fazer login
                        </p>
                    )}
                    <button
                        onClick={handleSubmit}
                        // ✅ Só trava enquanto carrega — não trava por auth
                        disabled={isLoading || isCheckingAuth}
                        className="w-full py-4 rounded-full font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-text-inverse)',
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                                'var(--color-primary-hover)')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                                'var(--color-primary)')
                        }
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                {CHECKOUT_MESSAGES.processing}
                            </>
                        ) : (
                            <>
                                {isAuthenticated
                                    ? CHECKOUT_MESSAGES.confirmButton
                                    : 'Entrar e confirmar'}
                                {' • '}
                                {formatPrice(Math.max(0, finalTotal))}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}