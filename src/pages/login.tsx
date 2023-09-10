import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
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
        return (
            <div className="bg-green-500 p-4 rounded-xl m-3 text-white flex gap-3">
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

                {mutateLoginJsonResponse.message}
            </div>
        );
    }

    if (
        "error" in mutateLoginJsonResponse &&
        typeof mutateLoginJsonResponse.error === "string"
    ) {
        return (
            <div className="bg-red-500 p-4 rounded-xl m-3 text-white flex gap-3">
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
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                </svg>

                {mutateLoginJsonResponse.error}
            </div>
        );
    }

    return <></>;
}

function Login() {
    const router = useRouter();
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
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
                cache: "no-cache",
            });

            setMutateLoginJsonResponse(await response.json());

            if (response?.status === 200) {
                setIsSubmitDisabled(true);

                setTimeout(async function () {
                    await router.replace("/admin");
                }, 2000);
            }

            return response;
        },
    });

    return (
        <>
            <LoginAlert mutateLoginJsonResponse={mutateLoginJsonResponse} />

            <form
                className="flex flex-col gap-5 items-center justify-center"
                onSubmit={function (event) {
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
                    className="bg-sky-600 text-white font-semibold px-9 py-3 rounded-xl flex gap-3 justify-center items-center cursor-pointer disabled:bg-sky-200 disabled:text-sky-300"
                >
                    Login
                </button>
            </form>
        </>
    );
}

export default Login;
