/*
 * Firebase is a simpler Typescript wrapper to all of firebase services.
 *
 * Copyright (C) 2020 Intuition Robotics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
