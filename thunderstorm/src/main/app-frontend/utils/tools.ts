import {PlatformName} from "../../shared/consts";
import {
	BadImplementationException,
	ImplementationMissingException
} from "@intuitionrobotics/ts-common/core/exceptions";
import * as React from "react";

export function browserType(): PlatformName {
	if (navigator?.vendor.includes("Google")) {
		return 'chrome';
	}

	throw new BadImplementationException("No matching browser detected");
}

export function convertBase64ToFile(fileName: string, base64: string, _mimeType?: string) {
	const arr = base64.split(',');
	const match = arr[0].match(/:(.*?);/);
	const mimeType = (match && match[1]) || (_mimeType && _mimeType);
	if (!mimeType)
		throw new ImplementationMissingException("Could not extract mime type from data...");

	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], fileName, {type: mimeType});
}


export const stopPropagation = (e: MouseEvent | React.MouseEvent | KeyboardEvent | React.KeyboardEvent) => {
	e.preventDefault();
	e.stopPropagation();
};
