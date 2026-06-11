"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLES_KEY = void 0;
exports.Roles = Roles;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
function Roles(...roles) {
    return (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
}
//# sourceMappingURL=roles.decorator.js.map