import {FirestoreType_QueryDocumentSnapshot} from "./types";
import {FirestoreCollection,} from "./FirestoreCollection";
import {FirestoreQuery} from "../../shared/types";
import {FirestoreInterface} from "./FirestoreInterface";
import {Query, SetOptions} from "firebase-admin/firestore";
import {Subset} from "@intuitionrobotics/ts-common/utils/types";
import {BadImplementationException} from "@intuitionrobotics/ts-common/core/exceptions";
import {merge} from "@intuitionrobotics/ts-common/utils/merge-tools";
import {Transaction} from "firebase-admin/lib/firestore";

export class FirestoreTransaction {
    private readonly transaction: Transaction;

    constructor(transaction: Transaction) {
        this.transaction = transaction;
    }

    private async _query<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>): Promise<FirestoreType_QueryDocumentSnapshot<Type>[]> {
        const query: Query<Type> = FirestoreInterface.buildQuery(collection.collection, ourQuery);
        return (await this.transaction.get(query)).docs;
    }

    private async _queryUnique<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>): Promise<FirestoreType_QueryDocumentSnapshot<Type> | undefined> {
        const results: FirestoreType_QueryDocumentSnapshot<Type>[] = await this._query(collection, ourQuery);
        return FirestoreInterface.assertUniqueDocument(results, ourQuery, collection.name);
    }

    private async _queryItem<Type extends object>(collection: FirestoreCollection<Type>, instance: Subset<Type>): Promise<FirestoreType_QueryDocumentSnapshot | undefined> {
        const ourQuery = FirestoreInterface.buildUniqueQuery(collection, instance);
        const results: FirestoreType_QueryDocumentSnapshot[] = await this._query(collection, ourQuery);
        return FirestoreInterface.assertUniqueDocument(results, ourQuery, collection.name);
    }

    async query<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>): Promise<Type[]> {
        return (await this._query(collection, ourQuery)).map(result => result.data());
    }

    async queryItem<Type extends object>(collection: FirestoreCollection<Type>, instance: Type): Promise<Type | undefined> {
        const ourQuery = FirestoreInterface.buildUniqueQuery(collection, instance);
        return this.queryUnique(collection, ourQuery);
    }

    async queryUnique<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>): Promise<Type | undefined> {
        const doc = await this._queryUnique(collection, ourQuery);
        if (!doc)
            return;

        return doc.data();
    }

    insert<Type extends object>(collection: FirestoreCollection<Type>, instance: Type, id?: string) {
        const doc = collection.createDocumentReference(id);
        this.transaction.set(doc, instance);
        return instance;
    }

    insertAll<Type extends object>(collection: FirestoreCollection<Type>, instances: Type[]) {
        return instances.map(instance => this.insert(collection, instance))
    }

//------------------------
    async upsert<Type extends object>(collection: FirestoreCollection<Type>, instance: Type): Promise<Type> {
        return (await this.upsert_Read(collection, instance))();
    }

    async upsert_Read<Type extends object>(collection: FirestoreCollection<Type>, instance: Type): Promise<() => Type> {
        const ref = await this.getOrCreateDocument(collection, instance);

        return () => {
            this.transaction.set(ref, instance);
            return instance;
        }
    }

    private async getOrCreateDocument<Type extends object>(collection: FirestoreCollection<Type>, instance: Type) {
        let ref = (await this._queryItem(collection, instance))?.ref;
        if (!ref)
            ref = collection.createDocumentReference();
        return ref;
    }

    async upsertAll<Type extends object>(collection: FirestoreCollection<Type>, instances: Type[]): Promise<Type[]> {
        if (instances.length > 500)
            throw new BadImplementationException('Firestore transaction supports maximum 500 at a time');

        return (await this.upsertAll_Read(collection, instances))();
    }

    async upsertAll_Read<Type extends object>(collection: FirestoreCollection<Type>, instances: Type[]): Promise<() => Type[]> {
        const writes = await Promise.all(instances.map(async instance => this.upsert_Read(collection, instance)));

        return () => writes.map(_write => _write());
    }

    async patch<Type extends object>(collection: FirestoreCollection<Type>, instance: Subset<Type>) {
        return (await this.patch_Read(collection, instance))();
    }

    async patch_Read<Type extends object>(collection: FirestoreCollection<Type>, instance: Subset<Type>) {
        const doc = await this._queryItem(collection, instance);
        if (!doc)
            throw new BadImplementationException(`Patching a non existent doc for query ${FirestoreInterface.buildUniqueQuery(collection, instance)}`);

        return () => {
            const patchedInstance = merge(doc.data(), instance);
            this.transaction.set(doc.ref, patchedInstance);
            return patchedInstance;
        }
    }

    async delete<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>) {
        return (await this.delete_Read(collection, ourQuery))();
    }

    async delete_Read<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>) {
        const docs = await this._query(collection, ourQuery);

        if (docs.length > 500)
            throw new BadImplementationException(`Trying to delete ${docs.length} documents. Not allowed more then 5oo in a single transaction`);

        return () => {
            const toReturn = docs.map(doc => doc.data());
            docs.forEach((doc) => this.transaction.delete(doc.ref))
            return toReturn;
        }
    }

    async deleteItem<Type extends object>(collection: FirestoreCollection<Type>, instance: Type) {
        return this.deleteUnique(collection, FirestoreInterface.buildUniqueQuery(collection, instance))
    }

    deleteUnique<Type extends object>(collection: FirestoreCollection<Type>, id: string): Transaction
    /** @deprecated */
    deleteUnique<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>): Promise<Type | undefined>
    deleteUnique<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: any) {
        if (typeof ourQuery === 'string')
            return this.transaction.delete(collection.collection.doc(ourQuery));

        return this.deleteUniqueImpl(collection, ourQuery)
    }

    private async deleteUniqueImpl<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>): Promise<Type | undefined> {
        const write = await this.deleteUnique_Read(collection, ourQuery);
        if (!write)
            return;

        return write();
    }


    async deleteUnique_Read<Type extends object>(collection: FirestoreCollection<Type>, ourQuery: FirestoreQuery<Type>): Promise<undefined | (() => Type)> {
        const doc = (await this._queryUnique<Type>(collection, ourQuery));
        if (!doc)
            return;

        return () => {
            const result = doc.data();
            this.transaction.delete(doc.ref);
            return result;
        }
    }

    set<Type extends object>(collection: FirestoreCollection<Type>, instance: Type, id: string): Transaction
    set<Type extends object>(collection: FirestoreCollection<Type>, instance: Partial<Type>, id: string, options: SetOptions): Transaction
    set<Type extends object>(collection: FirestoreCollection<Type>, instance: any, id: string, options?: any) {
        return this.transaction.set(collection.collection.doc(id), instance, options);
    }

    create<Type extends object>(collection: FirestoreCollection<Type>, instance: Type, id: string) {
        return this.transaction.create(collection.collection.doc(id), instance);
    }

    getSdkInstance() {
        return this.transaction;
    }
}
