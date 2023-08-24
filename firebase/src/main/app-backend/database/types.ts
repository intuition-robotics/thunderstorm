import * as admin from "firebase-admin";

export type Firebase_DB = admin.database.Database
export type Firebase_DataSnapshot = admin.database.DataSnapshot

export type FirebaseListener = (snapshot: Firebase_DataSnapshot | null) => void;
