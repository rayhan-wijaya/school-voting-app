import { useState } from "react";

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
