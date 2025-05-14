import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const login = useAuthStore((state) => state.login);
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login({ username, password });
			const role = useAuthStore.getState().user.role;
			navigate("/dashboard");
		} catch (err) {
			alert(err.msg || "Login gagal");
		}
	};

	return (
		<div className="relative h-screen">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{
					backgroundImage:
						"url('https://bbkhit.com/public/img/background.jpg')",
				}}>
				<div className="absolute inset-0 bg-black opacity-70 "></div>
				<div className="relative z-10 flex h-full items-center justify-center">
					<div className="relative flex flex-row w-full justify-center max-w-5xl">
						<div className="bg-white p-12 shadow-lg rounded-l-2xl">
							<form onSubmit={handleLogin}>
								<div className="mb-4">
									<img
										src="https://bbkhit.com/public/img/logo.png"
										alt="logo"
										className="w-20 mx-auto mb-3"
									/>
									<label
										className="block text-center pl-1 text-gray-700 text-lg font-bold mb-2"
										htmlFor="username">
										Login
									</label>
									<label
										className="block pl-1 text-gray-700 text-sm font-semibold mb-2"
										htmlFor="username">
										Username
									</label>
									<input
										className="text-sm shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										id="username"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										type="text"
										placeholder="Username"
									/>
								</div>
								<div className="mb-6 relative">
									<label
										className="block text-gray-700 text-sm font-semibold mb-2"
										htmlFor="password">
										Password
									</label>
									<input
										className="text-sm shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="******************"
									/>
									<button
										type="submit"
										className="absolute inset-y-0 right-0 top-7 flex items-center pr-3">
										<svg
											aria-hidden="true"
											focusable="false"
											data-prefix="fas"
											data-icon="eye-slash"
											className="svg-inline--fa fa-eye-slash text-sm"
											role="img"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 640 512">
											<path
												fill="currentColor"
												d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"></path>
										</svg>
									</button>
								</div>
								<div className="w-full items-center justify-center">
									<button
										className="bg-[#133138] w-[250px] mx-auto block hover:bg-blue-700 text-white text-sm font-semibold py-2 px-12 rounded-3xl focus:outline-none focus:shadow-outline shadow-lg"
										type="submit">
										Login
									</button>
								</div>
							</form>
						</div>
						<div className="w-[40%] bg-[#133138] relative flex flex-col justify-center items-center rounded-r-2xl shadow-xl">
							<div className="absolute inset-0 flex justify-center items-center">
								<h1 className="text-white text-[80px] font-bold opacity-10 text-center mb-20">
									Hello
								</h1>
							</div>
							<div className="relative z-10 text-center">
								<h1 className="text-white text-3xl font-bold mb-1">Hello !</h1>
								<h2 className="text-white text-base font-medium">
									Selamat datang di Sistem Pengajuan Cuti
								</h2>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
