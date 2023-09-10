import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { env } from "~/lib/env";

function LoginAlert({
    mutateLoginJsonResponse,
}: {
    mutateLoginJsonResponse: unknown;
}) {
    if (
        typeof mutateLoginJsonResponse !== "object" ||
        !mutateLoginJsonResponse
    ) {
        return <></>;
    }

    if (
        "message" in mutateLoginJsonResponse &&
        typeof mutateLoginJsonResponse.message === "string"
    ) {
        return (
            <div className="bg-green-500 p-3 rounded-xl m-3 text-white">
                {mutateLoginJsonResponse.message}
            </div>
        );
    }

    if (
        "error" in mutateLoginJsonResponse &&
        typeof mutateLoginJsonResponse.error === "string"
    ) {
        return (
            <div className="bg-red-500 p-3 rounded-xl m-3 text-white">
                {mutateLoginJsonResponse.error}
            </div>
        );
    }

    return <></>;
}

function Login() {
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [mutateLoginResponse, setMutateLoginResponse] = useState<Response>();
    const [mutateLoginJsonResponse, setMutateLoginJsonResponse] =
        useState<unknown>();

    useEffect(
        function () {
            if (hasSubmitted && mutateLoginResponse?.status === 200) {
                setIsSubmitDisabled(true);
            }
        },
        [mutateLoginResponse]
    );

    useEffect(() => console.log(isSubmitDisabled), [isSubmitDisabled]);

    useEffect(
        function () {
            console.log(mutateLoginJsonResponse);
        },
        [mutateLoginJsonResponse]
    );

    const { mutate: mutateLogin } = useMutation({
        mutationFn: async function ({
            username,
            password,
        }: {
            username: string;
            password: string;
        }) {
            const url = new URL("/api/login", env.NEXT_PUBLIC_BASE_URL);

            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            setMutateLoginResponse(response);
            setMutateLoginJsonResponse(await response.json());

            return response;
        },
    });

    return (
        <>
            <LoginAlert mutateLoginJsonResponse={mutateLoginJsonResponse} />

            <form
                className="flex flex-col gap-5 items-center justify-center"
                onSubmit={function (event) {
                    setHasSubmitted(true);

                    event.preventDefault();

                    if (!username || !password) {
                        return;
                    }

                    mutateLogin({ username, password });
                }}
            >
                <label className="flex flex-col gap-2">
                    Username
                    <input
                        placeholder="Your username here"
                        required={true}
                        onChange={function (event) {
                            setUsername(event.target.value);
                        }}
                    />
                </label>

                <label className="flex flex-col gap-2">
                    Password
                    <input
                        type="password"
                        placeholder="Your password here"
                        required={true}
                        onChange={function (event) {
                            setPassword(event.target.value);
                        }}
                    />
                </label>

                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="bg-sky-600 text-white font-semibold px-6 py-3 rounded-xl flex gap-3 justify-center items-center cursor-pointer disabled:bg-sky-200 disabled:text-sky-300"
                >
                    Login
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </button>
            </form>
        </>
    );
}

export default Login;
