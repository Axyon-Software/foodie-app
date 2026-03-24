// Arquivo: app/dashboard/menu/CategoryForm.tsx

"use client";

import { useRef } from "react";
import { createCategory } from "@/actions/categoryActions";
import { useFormStatus } from "react-dom";
import { Plus, Loader2 } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
        >
            {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Adicionar
        </button>
    );
}

export function CategoryForm() {
    const formRef = useRef<HTMLFormElement>(null);

    // Quando a action terminar, limpamos o formulário
    async function action(formData: FormData) {
        await createCategory(formData);
        formRef.current?.reset();
    }

    return (
        <form ref={formRef} action={action} className="flex gap-3">
            <input
                type="text"
                name="name"
                required
                placeholder="Ex: Lanches, Bebidas..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <SubmitButton />
        </form>
    );
}