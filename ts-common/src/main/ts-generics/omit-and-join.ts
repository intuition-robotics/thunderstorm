

type A = { _id: string }
type B = A & { one: string; two: string }
type C = Omit<B, "_id">;


const valueWithoutId: C = {one: "value-1", two: "value-2"};

// This works just fine...
const valueWithId: B = {...valueWithoutId, _id: "new-id"};

console.log(valueWithId);


function thisBreaks_butWhy<T extends A, U = Omit<T, "_id">>(_valueWithoutId: U) {

	// The following line breaks... Why?
	// @ts-ignore
	const _valueWithId: T = {..._valueWithoutId, _id: "new-id"};
}

function thisBreaksTOO_butWhy<T extends A>(_valueWithoutId: Omit<T, "_id">) {

	// The following line breaks... Why?
	// @ts-ignore
	const _valueWithId: T = {..._valueWithoutId, _id: "new-id"};
}

// @ts-ignore
thisBreaks_butWhy<B>({one: "other-1", two: "other-2", three: "asdasd"})
