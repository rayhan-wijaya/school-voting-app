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
                        onChange={function (event) {
                            setPassword(event.target.value);
                        }}
                    />
                </label>

                <button
                    type="submit"
                    disabled={!username || !password || isSubmitDisabled}
                    className="disabled:bg-gray-200 bg-sky-600 px-8 rounded-xl py-3 text-white"
                >
                    Submit
                </button>
            </form>
        </>
    );
}

export default Login;
