"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Seeding database...');
        // 1. Admin User
        const adminEmail = 'admin@example.com';
        const existingAdmin = yield prisma.user.findUnique({ where: { email: adminEmail } });
        if (!existingAdmin) {
            const hashedPassword = yield bcryptjs_1.default.hash('Admin@12345', 10);
            yield prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });
            console.log('Created Admin user: admin@example.com / Admin@12345');
        }
        else {
            console.log('Admin user already exists');
        }
        // 2. Relation Masters
        const relations = [
            { code: 'SPOUSE', label: 'Spouse', isSpousal: true, isBidirectional: true },
            { code: 'FATHER', label: 'Father', isParental: true, inverseCode: 'CHILD' },
            { code: 'MOTHER', label: 'Mother', isParental: true, inverseCode: 'CHILD' },
            { code: 'CHILD', label: 'Child', inverseCode: 'PARENT' }, // Generic inverse, specific can be handled via mapping
            { code: 'BROTHER', label: 'Brother', isBidirectional: false, inverseCode: 'SIBLING' }, // Logic can be complex, simplifying for MVP
            { code: 'SISTER', label: 'Sister', isBidirectional: false, inverseCode: 'SIBLING' },
        ];
        for (const rel of relations) {
            yield prisma.relationMaster.upsert({
                where: { code: rel.code },
                update: {},
                create: {
                    code: rel.code,
                    label: rel.label,
                    isSpousal: rel.isSpousal || false,
                    isParental: rel.isParental || false,
                    isBidirectional: rel.isBidirectional || false,
                    inverseCode: rel.inverseCode
                }
            });
        }
        console.log('Seeded Relation Masters');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
