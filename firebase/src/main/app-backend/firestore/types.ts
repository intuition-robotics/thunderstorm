import {
    CollectionReference,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    Query,
    QueryDocumentSnapshot,
    QuerySnapshot,
    Transaction
} from "firebase-admin/lib/firestore";

export type FirestoreType_Collection<T extends any = any> = CollectionReference<T>;
export type FirestoreType_QueryDocumentSnapshot<T extends any = any> = QueryDocumentSnapshot<T>;
export type FirestoreType_DocumentSnapshot<T extends any = any> = DocumentSnapshot<T>;
export type FirestoreType_QuerySnapshot<T> = QuerySnapshot<T>;
export type FirestoreType_Query = Query;
export type FirestoreType_DocumentReference = DocumentReference;
export type FirestoreType = Firestore;
export type FirestoreType_Transaction = Transaction;
