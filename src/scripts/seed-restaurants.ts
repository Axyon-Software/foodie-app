// src/scripts/seed-restaurants.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const mockRestaurants = [
    {
        id: '1',
        user_id: 'mock-owner-1',
        name: 'Burger King',
        slug: 'burger-king',
        description: 'Os melhores burgers da cidade',
        cover_image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        category: 'Burger',
        delivery_fee: 5.99,
        minimum_order: 20.0,
        estimated_delivery_time: 30,
        status: 'OPEN' as const,
        is_active: true,
    },
    {
        id: '2',
        user_id: 'mock-owner-2',
        name: 'Pizza Hut',
        slug: 'pizza-hut',
        description: 'Pizzas artesanais com ingredientes selecionados',
        cover_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
        category: 'Pizza',
        delivery_fee: 0,
        minimum_order: 30.0,
        estimated_delivery_time: 40,
        status: 'OPEN' as const,
        is_active: true,
    },
    {
        id: '3',
        user_id: 'mock-owner-3',
        name: 'Sushi Now',
        slug: 'sushi-now',
        description: 'Sushi fresco preparado na hora',
        cover_image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
        category: 'Japonesa',
        delivery_fee: 8.99,
        minimum_order: 40.0,
        estimated_delivery_time: 45,
        status: 'OPEN' as const,
        is_active: true,
    },
    {
        id: '4',
        user_id: 'mock-owner-4',
        name: 'Salad & Co',
        slug: 'salad-and-co',
        description: 'Saladas frescas e saudáveis',
        cover_image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
        category: 'Saudável',
        delivery_fee: 4.99,
        minimum_order: 25.0,
        estimated_delivery_time: 25,
        status: 'OPEN' as const,
        is_active: true,
    },
    {
        id: '5',
        user_id: 'mock-owner-5',
        name: 'Açaí da Serra',
        slug: 'acai-da-serra',
        description: 'Açaí cremoso com as melhores coberturas',
        cover_image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500',
        category: 'Açaí',
        delivery_fee: 3.99,
        minimum_order: 15.0,
        estimated_delivery_time: 20,
        status: 'OPEN' as const,
        is_active: true,
    },
    {
        id: '6',
        user_id: 'mock-owner-6',
        name: 'Cantina Italiana',
        slug: 'cantina-italiana',
        description: 'Culinária italiana autêntica',
        cover_image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500',
        category: 'Italiana',
        delivery_fee: 6.99,
        minimum_order: 35.0,
        estimated_delivery_time: 45,
        status: 'CLOSED' as const,
        is_active: true,
    },
]

async function main() {
    console.log('🌱 Populando restaurantes...')

    for (const restaurant of mockRestaurants) {
        await prisma.restaurant.upsert({
            where: { id: restaurant.id },
            update: restaurant,
            create: restaurant,
        })
        console.log(`✅ ${restaurant.name}`)
    }

    console.log('🎉 Restaurantes criados com sucesso!')
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })