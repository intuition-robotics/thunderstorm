import {
	BadImplementationException,
	ObjectTS
} from "@intuitionrobotics/ts-common";
import * as jws from "jws";
import {
	Algorithm,
	ALGORITHMS
} from "jws";
import {SecretsModule} from "../modules/SecretsModule";

export type AlgType = 'alg';

//Header
export const ALGORITHM: AlgType = "alg";
export const CONTENT_TYPE = "cty";
export const TYPE = "typ";
export const KEY_ID = "kid";

//Payload
export const ISSUER = "iss";
export const SUBJECT = "sub";
export const EXPIRES_AT = "exp";
export const NOT_BEFORE = "nbf";
export const ISSUED_AT = "iat";
export const JWT_ID = "jti";
export const AUDIENCE = "aud";

export const TYP_DEFAULT: string = "JWT";

export class JWTBuilder {
	private payload: ObjectTS = {};
	private readonly header: ObjectTS & {
		[k in AlgType]: Algorithm
	};

	constructor(alg: Algorithm) {
		this.assertAlg(alg);
		this.header = {
			[ALGORITHM]: alg
		}
	}

	// Generic

	addClaims(claims: ObjectTS) {
		Object.keys(claims).forEach(k => this.addClaim(k, claims[k]))
		return this;
	}

	addClaim(key: string, value: any) {
		this.payload[key] = value;
		return this;
	}

	addHeader(key: string, value: any) {
		this.header[key] = value;
		return this;
	}

	// End Generic

	setAlgorithm = (alg: Algorithm) => {
		this.assertAlg(alg);
		this.header[ALGORITHM] = alg;
		return this;
	};

	setContentType = (cty: string) => {
		this.header[CONTENT_TYPE] = cty;
		return this;
	};

	setType = (typ: string) => {
		this.header[TYPE] = typ;
		return this;
	};

	setKeyID = (kid: string) => {
		this.header[KEY_ID] = kid;
		return this;
	};

	// Payload

	setIssuer(iss: string) {
		this.payload[ISSUER] = iss;
		return this;
	}

	setSub(iss: string) {
		this.payload[SUBJECT] = iss;
		return this;
	}

	setExpiration(exp: number) {
		this.payload[EXPIRES_AT] = exp;
		return this;
	}

	setNotBefore(nbf: string) {
		this.payload[NOT_BEFORE] = nbf;
		return this;
	}

	setIssuedAt(iat: string) {
		this.payload[ISSUED_AT] = iat;
		return this;
	}

	setJWTID(jti: string) {
		this.payload[JWT_ID] = jti;
		return this;
	}

	setAudience(aud: string) {
		this.payload[AUDIENCE] = aud;
		return this;
	}

	// End Payload

	private getIssuer() {
		return this.payload[ISSUER];
	}

	private getAlgorithm() {
		return this.header[ALGORITHM];
	}

	private getExpiration() {
		return this.payload[EXPIRES_AT];
	}

	private getType() {
		return this.header[TYPE];
	}

	private assertAlg(alg: Algorithm) {
		const foundAlg: Algorithm | undefined = ALGORITHMS.find(a => a === alg);
		if (!foundAlg)
			throw new BadImplementationException(`Algorithm with name ${alg} is not valid`);
	}

	build(secret: string) {
		if (!this.getType())
			this.setType(TYP_DEFAULT);

		if (!this.getIssuer())
			// TODO move the config to the module which I need to create
			this.setIssuer(SecretsModule.getIss())

		if (!this.getExpiration())
			throw new BadImplementationException("Missing expiration, cannot build a valid JWT without this value")

		if (!this.getAlgorithm())
			throw new BadImplementationException("Missing algorithm, cannot build a valid JWT without this value")

		return jws.sign({secret, payload: this.payload, header: this.header});
	}
}
