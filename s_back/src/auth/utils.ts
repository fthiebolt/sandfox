import { ValidationResult, ObjectSchema, object, string, boolean, validate } from "joi";
import { IUser } from "../interfaces";

export function validateUser(user: IUser): ValidationResult<IUser> {
	const schema: ObjectSchema = object().keys({
		username: string().regex(/^[a-zA-Z_\\-\\.][a-zA-Z_\\-\\.\d]{3,30}$/).required().error(new Error('Nom d\'utilisateur invalide.')),
		email: string().email({ minDomainAtoms: 2 }).required().error(new Error('Adresse email invalide.')),
		phone_number: string().regex(/^(((\\+|00)33\s?)|0)(6|7)(\s?\d{2}){4}$/).error(new Error('Numéro mobile invalide.')),
		first_name: string().regex(/^[a-zéàçèê][a-zéàçèê\\-]{2,20}$/).required().error(new Error('Prénom invalide.')),
		last_name: string().regex(/^[a-zéàçèê][a-zéàçèê\\-]{2,20}$/).required().error(new Error('Nom invalide.')),
		password: string().min(7).max(64).error(new Error('Mot de passe invalide.')),
		role: string(),
		activated: boolean(),
	});
	return validate(user, schema, {allowUnknown:true})

}