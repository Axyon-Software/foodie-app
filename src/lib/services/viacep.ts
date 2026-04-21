// src/lib/services/viacep.ts
export interface ViaCepResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro: boolean;
}

export interface AddressFromCep {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
}

export function parseViaCepResponse(data: ViaCepResponse): AddressFromCep | null {
    if (data.erro) return null;

    return {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
    };
}

export function isValidCep(cep: string): boolean {
    const digits = cep.replace(/\D/g, '');
    return digits.length === 8;
}

export async function fetchAddressByCep(
    cep: string
): Promise<{ data?: AddressFromCep; error?: string }> {
    if (!isValidCep(cep)) {
        return { error: 'CEP inválido' };
    }

    try {
        const digits = cep.replace(/\D/g, '');
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

        if (!response.ok) {
            return { error: 'Erro ao buscar CEP' };
        }

        const data: ViaCepResponse = await response.json();

        if (data.erro) {
            return { error: 'CEP não encontrado' };
        }

        const address = parseViaCepResponse(data);

        if (!address || !address.street) {
            return { error: 'CEP não encontrado' };
        }

        return { data: address };
    } catch {
        return { error: 'Erro ao buscar CEP. Verifique sua conexão.' };
    }
}