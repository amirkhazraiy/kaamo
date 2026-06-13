"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcryptjs"));
const data_source_1 = require("./data-source");
const user_entity_1 = require("../users/user.entity");
async function seedAdmin() {
    await data_source_1.AppDataSource.initialize();
    const users = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const email = requireSecret('ADMIN_EMAIL').trim().toLowerCase();
    const password = requireSecret('ADMIN_PASSWORD');
    const name = requireSecret('ADMIN_NAME');
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const existingUser = await users.findOne({ where: { email } });
    await users.save({
        ...existingUser,
        email,
        passwordHash,
        name,
        role: 'admin',
        isActive: true,
    });
    await data_source_1.AppDataSource.destroy();
    console.log(`Admin user seeded: ${email}`);
}
function requireSecret(name) {
    const value = process.env[name]?.trim();
    if (!value || value.startsWith('YOUR_')) {
        throw new Error(`${name} must be set to a non-placeholder value.`);
    }
    return value;
}
seedAdmin().catch(async (error) => {
    console.error(error);
    if (data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.destroy();
    }
    process.exit(1);
});
//# sourceMappingURL=seed-admin.js.map