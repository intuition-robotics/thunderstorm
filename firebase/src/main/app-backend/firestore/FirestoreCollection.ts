import {
    FirestoreType_Collection,
    FirestoreType_DocumentSnapshot,
    FirestoreType_QueryDocumentSnapshot,
    FirestoreType_QuerySnapshot
} from "./types";
import {Clause_Select, Clause_Where, FilterKeys, FirestoreQuery} from "../../shared/types";
import {FirestoreWrapper} from "./FirestoreWrapper";
import {FirestoreInterface} from "./FirestoreInterface";
import {FirestoreTransaction} from "./FirestoreTransaction";
import {CollectionReference, SetOptions, Transaction, WriteResult} from "firebase-admin/lib/firestore";
import {Subset} from "@intuitionrobotics/ts-common/utils/types";
import {BadImplementationException} from "@intuitionrobotics/ts-common/core/exceptions";
import {batchAction} from "@intuitionrobotics/ts-common/utils/array-tools";
import {generateHex} from "@intuitionrobotics/ts-common/utils/random-tools";

export class FirestoreCollection<Type extends object> {
    readonly name: string;
    readonly wrapper: FirestoreWrapper;
    readonly collection: FirestoreType_Collection<Type>;

    /**
     * External unique as in there must never ever be two that answer the same query
     */
    readonly externalUniqueFilter: ((object: Subset<Type>) => Clause_Where<Type>);

    constructor(name: string, wrapper: FirestoreWrapper, externalFilterKeys?: FilterKeys<Type>) {
        this.name = name;
        this.wrapper = wrapper;
        if (!/[a-z-]{3,}/.test(name))
            console.log("Please follow name pattern for collections /[a-z-]{3,}/")

        this.collection = wrapper.firestore.collection(name) as CollectionReference<Type>;
        this.externalUniqueFilter = (instance: Type) => {
            if (!externalFilterKeys)
                throw new BadImplementationException("In order to use a unique query your collection MUST have a unique filter");

            return externalFilterKeys.reduce((where, key: keyof Type) => {
                // @ts-ignore
                where[key] = instance[key];
                return where;
            }, {} as Clause_Where<Type>)
        };
    }

    private async _query(ourQuery?: FirestoreQuery<Type>): Promise<FirestoreType_QueryDocumentSnapshot[]> {
        const myQuery = FirestoreInterface.buildQuery(this.collection, ourQuery);
        return (await myQuery.get()).docs;
    }

    async getDoc(id: string): Promise<FirestoreType_DocumentSnapshot<Type>> {
        return this.collection.doc(id).get();
    }

    async get(ourQuery?: FirestoreQuery<Type>): Promise<FirestoreType_QuerySnapshot<Type>> {
        const myQuery = FirestoreInterface.buildQuery(this.collection, ourQuery);
        return myQuery.get() as Promise<FirestoreType_QuerySnapshot<Type>>;
    }

    private async _queryUnique(ourQuery: FirestoreQuery<Type>): Promise<FirestoreType_QueryDocumentSnapshot | undefined> {
        const results: FirestoreType_QueryDocumentSnapshot[] = await this._query(ourQuery);
        return FirestoreInterface.assertUniqueDocument(results, ourQuery, this.name);
    }

    async queryUnique(ourQuery: FirestoreQuery<Type>): Promise<Type | undefined> {
        const doc = await this._queryUnique(ourQuery);
        if (!doc)
            return;

        return doc.data() as Type
    }

    async insert(instance: Type, id?: string): Promise<Type> {
        const ref = this.createDocumentReference(id);
        await ref.set(instance)
        return instance;
    }

    async insertAll(instances: Type[]) {
        return Promise.all(instances.map(instance => this.insert(instance)));
    }

    async query(ourQuery: FirestoreQuery<Type>): Promise<Type[]> {
        return (await this._query(ourQuery)).map(result => result.data() as Type);
    }

    async upsert(instance: Type): Promise<Type> {
        return this.runInTransaction((transaction) => transaction.upsert(this, instance))
    }

    async upsertAll(instances: Type[]) {
        return batchAction(instances, 500, async chunked => this.runInTransaction(transaction => transaction.upsertAll(this, chunked)));
    }

    async patch(instance: Subset<Type>): Promise<Type> {
        return this.runInTransaction(transaction => transaction.patch(this, instance));
    }

    async deleteItem(instance: Type): Promise<Type | undefined> {
        return this.runInTransaction((transaction) => transaction.deleteItem(this, instance))
    }

    deleteUnique(id: string): Promise<WriteResult>
    /** @deprecated */
    deleteUnique(ourQuery: FirestoreQuery<Type>): Promise<Type | undefined>
    async deleteUnique(param: any) {
        if (typeof param === 'string')
            return this.collection.doc(param).delete();

        return this.runInTransaction<Type | undefined>(async (transaction) => transaction.deleteUnique(this, param as FirestoreQuery<Type>))
    }

    async delete(query: FirestoreQuery<Type>): Promise<Type[]> {
        const docRefs = await this._query(query);
        return this.deleteBatch(docRefs);
    }

    private async deleteBatch(docRefs: FirestoreType_QueryDocumentSnapshot[]): Promise<Type[]> {
        await batchAction(docRefs, 500, async (elements) => {
            const batch = this.collection.firestore.batch();
            elements.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        })
        return docRefs.map(d => d.data() as Type);
    }

    async deleteAll(): Promise<Type[]> {
        const docRefs = await this._query();
        return this.deleteBatch(docRefs);
    }


    async getAll(select?: Clause_Select<Type>): Promise<Type[]> {
        return this.query({select} as FirestoreQuery<Type>);
    }

    async runInTransaction<ReturnType>(processor: (transaction: FirestoreTransaction) => Promise<ReturnType>): Promise<ReturnType> {
        return this.collection.firestore.runTransaction<ReturnType>(async (transaction: Transaction) => {
            return processor(new FirestoreTransaction(transaction));
        });
    }

    createDocumentReference(id = generateHex(16)) {
        return this.collection.doc(id);
    }


    set(instance: Type, id: string): Promise<WriteResult>
    set(instance: Partial<Type>, id: string, options: SetOptions): Promise<WriteResult>
    async set(instance: any, id: string, options?: any) {
        return this.collection.doc(id).set(instance, options);
    }

    async create(instance: Type, id: string) {
        return this.collection.doc(id).create(instance);
    }

    getUniqueFilter = () => this.externalUniqueFilter;

}
