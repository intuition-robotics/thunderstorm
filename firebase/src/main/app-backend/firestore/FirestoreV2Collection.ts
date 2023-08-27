
import {FirestoreQuery} from "../../shared/types";
import {FirestoreInterface} from "./FirestoreInterface";
import {CollectionReference} from "firebase-admin/firestore";
import {Query} from "firebase-admin/lib/firestore";

export type FirestoreV2Collection<Type extends object> = CollectionReference<Type> & {
    buildQuery: (query?: FirestoreQuery<Type>) => Query<Type>;
};

export const enhanceCollection = <Type extends object>(collection: CollectionReference<Type>): FirestoreV2Collection<Type> => {
    const collectionRef = collection as FirestoreV2Collection<Type>;
    collectionRef.buildQuery = (ourQuery?: FirestoreQuery<Type>): Query<Type> => {
        return FirestoreInterface.buildQuery(collection, ourQuery);
    };

    return collectionRef;
};
