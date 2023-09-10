export async function filterSuccesses<T>(
    promiseResults: PromiseSettledResult<T>[]
) {
    return promiseResults
        .filter(function (result): result is PromiseFulfilledResult<T> {
            return result.status === "fulfilled";
        })
        .map(function (result) {
            return result.value;
        });
}
