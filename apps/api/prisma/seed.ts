import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import https from 'https';

const prisma = new PrismaClient();

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Helper to download image
const downloadImage = (url: string, filepath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filepath)) {
            resolve(); // Skip if exists
            return;
        }
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
};

async function main() {
    console.log('Seeding database...');

    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        console.log('Created uploads directory');
    }

    // Pre-download Avatar Pool
    console.log('Preparing avatar pool...');
    const poolSize = 30; // 30 male, 30 female
    for (let i = 0; i < poolSize; i++) {
        await downloadImage(`https://randomuser.me/api/portraits/men/${i}.jpg`, path.join(UPLOADS_DIR, `male_${i}.jpg`));
        await downloadImage(`https://randomuser.me/api/portraits/women/${i}.jpg`, path.join(UPLOADS_DIR, `female_${i}.jpg`));
    }
    console.log('Avatar pool ready.');

    // 1. Admin User
    const adminEmail = 'admin@example.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin@12345', 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN'
            }
        });
        console.log('Created Admin user');
    }

    // 2. Relation Masters
    const relations = [
        { code: 'SPOUSE', label: 'Spouse', isSpousal: true, isBidirectional: true },
        { code: 'FATHER', label: 'Father', isParental: true, inverseCode: 'CHILD' },
        { code: 'MOTHER', label: 'Mother', isParental: true, inverseCode: 'CHILD' },
        { code: 'CHILD', label: 'Child', inverseCode: 'PARENT' },
    ];

    const relMap: Record<string, number> = {};

    for (const rel of relations) {
        const r = await prisma.relationMaster.upsert({
            where: { code: rel.code },
            update: {},
            create: { ...rel }
        });
        relMap[rel.code] = r.id;
    }
    console.log('Seeded Relation Masters');

    // 3. Generate Family Tree
    const TARGET_MEMBERS = 1000;

    // Clear existing members to ensure clean state with correct images?
    // User wants to strictly fix it. Let's truncate to be safe, or just append properly.
    // Given the user's frustration, a clean slate is safer.
    await prisma.relationshipEdge.deleteMany();
    await prisma.member.deleteMany();
    console.log('Cleared existing members for fresh seed.');

    let currentMembers = 0;

    const createMember = async (gender: 'Male' | 'Female', lastName: string, generationDate: Date) => {
        const firstName = faker.person.firstName(gender.toLowerCase() as any);
        const dob = faker.date.birthdate({ min: 0, max: 80, mode: 'age' });

        // Pick random image from local pool
        const imgIndex = faker.number.int({ min: 0, max: poolSize - 1 });
        const localImageName = `${gender === 'Male' ? 'male' : 'female'}_${imgIndex}.jpg`;
        const imageUrl = `/uploads/${localImageName}`;

        return await prisma.member.create({
            data: {
                firstName,
                lastName,
                gender,
                dob,
                address: faker.location.streetAddress({ useFullAddress: true }),
                nativePlace: faker.location.city(),
                contactNumber: faker.phone.number(),
                notes: faker.lorem.sentence(),
                imageUrl: imageUrl
            }
        });
    };

    const linkMembers = async (fromId: number, toId: number, code: string) => {
        if (!relMap[code]) return;

        await prisma.relationshipEdge.create({
            data: { fromMemberId: fromId, toMemberId: toId, relationId: relMap[code] }
        });

        if (code === 'SPOUSE') {
            await prisma.relationshipEdge.create({
                data: { fromMemberId: toId, toMemberId: fromId, relationId: relMap[code] }
            });
        }
        if (code === 'FATHER' || code === 'MOTHER') {
            await prisma.relationshipEdge.create({
                data: { fromMemberId: toId, toMemberId: fromId, relationId: relMap['CHILD'] }
            });
        }
    };

    const queue: { id: number, lastName: string, depth: number }[] = [];

    // Root
    const rootHusband = await createMember('Male', faker.person.lastName(), new Date('1950-01-01'));
    const rootWife = await createMember('Female', rootHusband.lastName, new Date('1952-01-01'));
    await linkMembers(rootHusband.id, rootWife.id, 'SPOUSE');

    currentMembers += 2;
    queue.push({ id: rootHusband.id, lastName: rootHusband.lastName, depth: 0 });

    while (currentMembers < TARGET_MEMBERS && queue.length > 0) {
        const parent = queue.shift();
        if (!parent) break;

        const numChildren = faker.number.int({ min: 1, max: 4 });
        for (let i = 0; i < numChildren; i++) {
            if (currentMembers >= TARGET_MEMBERS) break;
            const childGender = faker.helpers.arrayElement(['Male', 'Female']) as 'Male' | 'Female';
            const childKey = await createMember(childGender, parent.lastName, new Date());
            currentMembers++;

            const pObj = await prisma.member.findUnique({ where: { id: parent.id } });
            if (pObj) {
                const relCode = pObj.gender === 'Male' ? 'FATHER' : 'MOTHER';
                await linkMembers(pObj.id, childKey.id, relCode);
            }

            if (parent.depth < 4 && faker.datatype.boolean(0.7)) {
                if (currentMembers >= TARGET_MEMBERS) break;
                const spouseGender = childGender === 'Male' ? 'Female' : 'Male';
                const spouse = await createMember(spouseGender, faker.person.lastName(), new Date());
                currentMembers++;
                await linkMembers(childKey.id, spouse.id, 'SPOUSE');
                queue.push({ id: childKey.id, lastName: childKey.lastName, depth: parent.depth + 1 });
            }
        }
    }

    console.log(`Seeding completed. Total members: ${currentMembers}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
