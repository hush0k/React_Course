export function LoadMore({shown = 0, total = 0, isLoading = false, onLoadMore}) {
    return (
        <div className={"flex flex-col items-center space-y-3 py-4"}>
            {isLoading && (
                <div className={"flex flex-row space-x-1.5"}>
                    <span className={"h-2.5 w-2.5 rounded-full bg-primary-300 animate-bounce"}/>
                    <span className={"h-2.5 w-2.5 rounded-full bg-primary-500 animate-bounce [animation-delay:150ms]"}/>
                    <span className={"h-2.5 w-2.5 rounded-full bg-primary-700 animate-bounce [animation-delay:300ms]"}/>
                </div>
            )}

            <p className={"text-sm text-gray-500"}>Showing {shown} of {total} users</p>

            <button
                onClick={onLoadMore}
                disabled={isLoading || shown >= total}
                className={"bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2.5 rounded-lg cursor-pointer" +
                    " disabled:opacity-50 disabled:cursor-not-allowed"}
            >
                Load more
            </button>
        </div>
    )
}
