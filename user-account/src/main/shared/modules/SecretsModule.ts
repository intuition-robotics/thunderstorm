import {
	__stringify,
	BadImplementationException,
	currentTimeMillies,
	Day,
	Module,
	ObjectTS
} from "@intuitionrobotics/ts-common";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/backend";
import * as jws from "jws";
import {
	Algorithm,
	Signature
} from "jws";
import {
	EXPIRES_AT,
	JWTBuilder
} from "../utils/JWTBuilder";
import {CustomException} from "@intuitionrobotics/ts-common/core/exceptions";

export class TokenExpiredException
	extends CustomException {
	constructor(message: string, cause?: Error) {
		super(TokenExpiredException, message, cause)
	}
}

type Config = {
	secrets?: {
		[k: string]: any
	},
	validateKeyId: string
	issuer: string
}

type Secret = {
	kid: string
	value: string
}

export class SecretsModule_Class
	extends Module<Config> {
	private DEFAULT_ISS = "TOOLS";

	public AUTHENTICATION_PREFIX = "Bearer";
	public AUTHENTICATION_KEY = "Authorization";

	constructor(tag?: string, name?: string) {
		super(tag, name);
		this.setDefaultConfig({validateKeyId: "AUTH_SECRET"})
	}

	getSecret(k: string): Secret {
		const secret: string = this.getConfig()?.[k] || process.env?.[k];
		if (!secret)
			throw new BadImplementationException(`Missing secret with key ${k} in SecretsModule`);

		return {
			kid: k,
			value: secret
		}
	}

	public getAuthSecret = (kid: string): Secret => {
		return this.getSecret(kid);
	};

	private getConfig = () => {
		if (!this.config)
			throw new BadImplementationException(`Missing config, check SecretsModule's config`);

		if (!this.config.secrets)
			throw new BadImplementationException(`Missing 'secrets' key in config, check SecretsModule's config`);

		return this.config.secrets;
	};

	validateRequestAndCheckExpiration(request: ExpressRequest) {
		const token = this.validateRequest(request);

		if (this.isExpired(token)) {
			const cause = `The JWT passed is not valid, check. With payload: ${__stringify(token.payload)}. The JWT passed is expired`;
			throw new TokenExpiredException(cause)
		}

		return token.payload
	}

	// Specify a kid to force the usage of it
	validateRequest(request: ExpressRequest) {
		const authToken = this.extractAuthToken(request);
		const token = this.decodeJwt(authToken);
		const kid = token.header.kid || this.config.validateKeyId;
		if(!kid)
			throw new BadImplementationException("Could not deduce which key to use in order to verify the token, please specify a key ID");

		const secret = this.getAuthSecret(kid);
		const verified = jws.verify(authToken, token.header.alg, secret.value);
		let cause = `The JWT passed is not valid, check. With payload: ${__stringify(token.payload)}.`;
		if (!verified || !token)
			throw new BadImplementationException(cause)

		if (!token.payload?.[EXPIRES_AT]) {
			cause += ` The JWT is missing the expiration claim`;
			throw new BadImplementationException(cause)
		}

		return token;
	}

	public extractAuthToken(request: ExpressRequest) {
		const authHead = request.header(this.AUTHENTICATION_KEY);
		if (authHead === undefined)
			throw new BadImplementationException("Missing Authorization header");

		if (!authHead)
			throw new BadImplementationException('The Authorization header is empty');

		const parts = authHead.split(" ");
		if (parts.length !== 2 || parts[0] !== this.AUTHENTICATION_PREFIX)
			throw new BadImplementationException(
				`The Authorization header is malformed` + "\n"
				+ `Value: ${authHead}` + "\n"
				+ `Expected Value: ${this.AUTHENTICATION_PREFIX} [token]`
			);

		const authToken = parts[1].trim();
		if (!authToken)
			throw new BadImplementationException(`The token provided is empty`);

		return authToken;
	}

	public isExpired = (token: Signature) => {
		return this.getExpiration(token) < currentTimeMillies();
	};

	public getExpiration(token: Signature) {
		let exp = token.payload[EXPIRES_AT];
		if (!exp)
			return exp;

		const now = currentTimeMillies();
		const cutOff = 1000000000000;// 3-3-1973 in milliseconds
		const isInSeconds = exp < cutOff;
		if (isInSeconds)
			exp = exp * 1000;

		const year = 365 * Day;
		if (exp < now - year || exp > now + (year))
			throw new BadImplementationException(`The JWT passed is not valid. Payload: ${__stringify(token.payload)}.` +
				                                     `Malformed JWT, expiry date is not valid, check the exp format, assumed to be in ${isInSeconds ? "seconds" : "milliseconds"}`);
		return exp;
	}

	generateJwt = (payload: ObjectTS, kid: string, algorithm: Algorithm = "HS256") => {
		const secret = this.getAuthSecret(kid)
		return new JWTBuilder(algorithm)
			// This is a default that can be overwritten by the claims
			.setExpiration(currentTimeMillies() + Day)
			.addClaims(payload)
			.setIssuer(this.getIss())
			.setKeyID(secret.kid)
			.build(secret.value)
	};

	public getIss = () => {
		const issuer = this.config.issuer;
		if (!issuer)
			return this.DEFAULT_ISS;
		return issuer;
	};

	decodeJwt = (jwt: string) => {
		return jws.decode(jwt);
	}
}

export const SecretsModule = new SecretsModule_Class()
