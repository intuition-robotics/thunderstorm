import {CopyResponse} from "@google-cloud/storage";
import {Storage} from "firebase-admin/storage";
export type FirebaseType_Storage =  Storage;

export type FirebaseType_Metadata = any;
export type ReturnType_Metadata = { metadata?: FirebaseType_Metadata };
export type Firebase_CopyResponse = [CopyResponse[0], CopyResponse[1] | undefined]
