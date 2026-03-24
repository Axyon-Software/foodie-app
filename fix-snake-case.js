// fix-snake-case.js
const fs = require('fs');
const path = require('path');

const replacements = [
    // Prisma queries - WHERE clauses
    { from: /where:\s*\{\s*restaurantId:/g, to: 'where: { restaurant_id:' },
    { from: /where:\s*\{\s*categoryId:/g, to: 'where: { category_id:' },
    { from: /where:\s*\{\s*userId:/g, to: 'where: { user_id:' },
    { from: /where:\s*\{\s*ownerId:/g, to: 'where: { user_id:' },
    { from: /where:\s*\{\s*isAvailable:/g, to: 'where: { is_available:' },
    { from: /where:\s*\{\s*isActive:/g, to: 'where: { is_active:' },

    // Prisma queries - ORDER BY
    { from: /orderBy:\s*\{\s*displayOrder:/g, to: 'orderBy: { sort_order:' },
    { from: /orderBy:\s*\{\s*sortOrder:/g, to: 'orderBy: { sort_order:' },
    { from: /orderBy:\s*\{\s*createdAt:/g, to: 'orderBy: { created_at:' },
    { from: /orderBy:\s*\{\s*updatedAt:/g, to: 'orderBy: { updated_at:' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    replacements.forEach(({ from, to }) => {
        if (from.test(content)) {
            content = content.replace(from, to);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!['node_modules', '.next', '.git', 'dist'].includes(file)) {
                walkDir(filePath);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            processFile(filePath);
        }
    });
}

console.log('🔍 Procurando arquivos para corrigir...\n');
walkDir('./src');
console.log('\n✅ Concluído!');