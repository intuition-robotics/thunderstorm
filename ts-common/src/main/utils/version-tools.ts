import {BadImplementationException} from "../core/exceptions";

/**
 *
 * @param firstVersion a version
 * @param secondVersion another version
 *
 * @return -1 if first is greater
 *          0 if versions match
 *          1 if second is greater
 */
export function compareVersions(firstVersion: string, secondVersion: string) {
	if (!firstVersion)
		throw new BadImplementationException("First version is undefined");

	if (!secondVersion)
		throw new BadImplementationException("Second version is undefined");

	const firstVersionAsArray = firstVersion.split("\.");
	const secondVersionAsArray = secondVersion.split("\.");
	for (let i = 0; i < firstVersionAsArray.length; i++) {
		const secondVal = +secondVersionAsArray[i];
		const firstVal = +firstVersionAsArray[i];
		if (secondVal > firstVal)
			return 1;

		if (secondVal === firstVal)
			continue;

		if (secondVal < firstVal)
			return -1;
	}

	return 0;
}
