import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
        return <div>{mutateLoginJsonResponse.message}</div>;
    }

    if (
        "error" in mutateLoginJsonResponse &&
        typeof mutateLoginJsonResponse.error === "string"
    ) {
        return <div className="bg-red-300 text-white">{mutateLoginJsonResponse.error}</div>;
    }

    return <></>;
}

function Login() {
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [mutateLoginJsonResponse, setMutateLoginJsonResponse] =
        useState<unknown>();

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
                    disabled={!username || !password || hasSubmitted}
                >
                    Submit
                </button>
            </form>
        </>
    );
}

export default Login;
