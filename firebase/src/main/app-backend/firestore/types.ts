import { firestore } from "firebase-admin";

export type FirestoreType_Collection<T extends any = any> = firestore.CollectionReference<T> ;
export type FirestoreType_QueryDocumentSnapshot<T extends any = any> = firestore.QueryDocumentSnapshot<T> ;
export type FirestoreType_DocumentSnapshot<T extends any = any> = firestore.DocumentSnapshot<T> ;
export type FirestoreType_QuerySnapshot<T> = firestore.QuerySnapshot<T> ;
export type FirestoreType_Query = firestore.Query;
export type FirestoreType_DocumentReference = firestore.DocumentReference ;
export type FirestoreType = firestore.Firestore ;
export type FirestoreType_Transaction = firestore.Transaction;

// export type FirestoreType_Collection = admin.firestore.CollectionReference | firebase.firestore.CollectionReference;
// export type FirestoreType_DocumentSnapshot = admin.firestore.QueryDocumentSnapshot | firebase.firestore.QueryDocumentSnapshot;
// export type FirestoreType_Query = (admin.firestore.Query | firebase.firestore.Query) & { select?: (...field: string[]) => FirestoreType_Query };
// export type FirestoreType_DocumentReference = admin.firestore.DocumentReference | firebase.firestore.DocumentReference;
// export type FirestoreType = (admin.firestore.Firestore | firebase.firestore.Firestore) & ({ listCollections?: () => Promise<FirestoreType_Collection[]> });
// export type FirestoreType_Transaction = admin.firestore.Transaction | firebase.firestore.Transaction;
//
