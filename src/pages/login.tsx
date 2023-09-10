import { useState } from "react";

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

    return (
        <>
            <form
                className="flex flex-col gap-5 items-center justify-center"
                onSubmit={function (event) {
                    event.preventDefault();
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

                <button type="submit">Submit</button>
            </form>
        </>
    );
}

export default Login;
