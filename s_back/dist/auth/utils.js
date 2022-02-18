"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = void 0;
const joi_1 = require("joi");
function validateUser(user) {
    const schema = joi_1.object().keys({
        username: joi_1.string().regex(/^[a-zA-Z_\\-\\.][a-zA-Z_\\-\\.\d]{3,30}$/).required().error(new Error('Nom d\'utilisateur invalide.')),
        email: joi_1.string().email({ minDomainAtoms: 2 }).required().error(new Error('Adresse email invalide.')),
        phone_number: joi_1.string().regex(/^(((\\+|00)33\s?)|0)(6|7)(\s?\d{2}){4}$/).error(new Error('Numéro mobile invalide.')),
        first_name: joi_1.string().regex(/^[a-zéàçèê][a-zéàçèê\\-]{2,20}$/).required().error(new Error('Prénom invalide.')),
        last_name: joi_1.string().regex(/^[a-zéàçèê][a-zéàçèê\\-]{2,20}$/).required().error(new Error('Nom invalide.')),
        password: joi_1.string().min(7).max(64).error(new Error('Mot de passe invalide.')),
        role: joi_1.string(),
        activated: joi_1.boolean(),
    });
    return joi_1.validate(user, schema, { allowUnknown: true });
}
exports.validateUser = validateUser;
