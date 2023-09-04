import {Database, DataSnapshot} from "firebase-admin/lib/database";

export type Firebase_DB = Database
export type Firebase_DataSnapshot = DataSnapshot

export type FirebaseListener = (snapshot: Firebase_DataSnapshot | null) => void;
