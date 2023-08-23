import {FirestoreCollection} from "./FirestoreCollection";
import {FirestoreType, FirestoreType_Collection,} from "./types";
import {FilterKeys} from "../../shared/types";
import {FirebaseSession} from "../auth/firebase-session";
import {FirebaseBaseWrapper} from "../auth/FirebaseBaseWrapper";
import {CollectionReference, getFirestore} from "firebase-admin/firestore";
import {enhanceCollection, FirestoreV2Collection} from "./FirestoreV2Collection";

export class FirestoreWrapper
    extends FirebaseBaseWrapper {

    readonly firestore: FirestoreType;
    private readonly collections: { [collectionName: string]: FirestoreCollection<any> } = {};
    private readonly collectionsV2: { [collectionName: string]: FirestoreV2Collection<any> } = {};

    constructor(firebaseSession: FirebaseSession<any, any>) {
        super(firebaseSession);
        this.firestore = getFirestore(firebaseSession.app)
    }

    public getCollection<Type extends object>(name: string, externalFilterKeys?: FilterKeys<Type>): FirestoreCollection<Type> {
        const collection = this.collections[name];
        if (collection)
            return collection;

        return this.collections[name] = new FirestoreCollection<Type>(name, this, externalFilterKeys);
    }

    public getCollectionV2<Type extends object>(name: string): FirestoreV2Collection<Type> {
        const collection = this.collectionsV2[name];
        if (collection)
            return collection;

        const enchanceCollection1 = enhanceCollection(this.firestore.collection(name) as CollectionReference<Type>) as FirestoreV2Collection<any>;
        return this.collectionsV2[name] = enchanceCollection1;
    }

    getSdkInstance() {
        return this.firestore;
    }

    public async deleteCollection(name: string) {
        return this.getCollection(name).deleteAll();
    }

    public async listCollections(): Promise<FirestoreType_Collection[]> {
        if (!this.firestore.listCollections)
            return [];

        return this.firestore.listCollections();
    }
}
