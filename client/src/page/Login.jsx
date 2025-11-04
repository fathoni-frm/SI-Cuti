import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Swal from "sweetalert2";
import { IoEyeSharp } from "react-icons/io5";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const login = useAuthStore((state) => state.login);
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login({ username, password });
			navigate("/dashboard");
		} catch (error) {
			Swal.fire({
				icon: "error",
				title: "Terjadi Kesalahan Saat Login",
				text: "Pastikan Username Dan Password Anda Benar",
			});
			console.error("Login error:", error);
		}
	};

    const handleMouseDownPassword = () => {
        setShowPassword(true);
    };

    const handleMouseUpPassword = () => {
        setShowPassword(false);
    };

	return (
		<div className="relative min-h-screen">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{
					backgroundImage:
						"url('https://bbkhit.com/public/img/background.jpg')",
				}}>
				<div className="absolute inset-0 bg-black opacity-70"></div>
			</div>

			<div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
				<div className="relative flex flex-col-reverse lg:flex-row w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-5xl bg-white lg:bg-transparent shadow-2xl rounded-2xl lg:shadow-none overflow-hidden">
					<div className="bg-white w-full lg:w-3/5 xl:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 lg:rounded-l-2xl lg:rounded-r-none rounded-t-2xl lg:rounded-t-none">
						<form onSubmit={handleLogin}>
							<div className="mb-4">
								<img
									src="https://bbkhit.com/public/img/logo.png"
									alt="logo"
									className="w-16 sm:w-20 mx-auto mb-3"
								/>
								<label
									className="block text-center pl-1 text-gray-700 text-lg sm:text-xl font-bold mb-2"
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
									required
								/>
							</div>

							<div className="mb-6">
								<label
									className="block text-gray-700 text-sm font-semibold mb-2"
									htmlFor="password">
									Password
								</label>
								<div className="relative">
									<input
										className="text-sm shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="******************"
										required
									/>
									<button
                                        type="button"
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        onMouseLeave={handleMouseUpPassword} 
                                        className={`absolute inset-y-0 right-0 flex items-center pr-3 text-xl ${showPassword ? 'text-gray-400' : 'text-gray-900'} cursor-pointer`}>
                                        <IoEyeSharp />
                                    </button>
								</div>
							</div>

							<div className="w-full items-center justify-center">
								<button
									className="bg-[#133138] w-full sm:w-[250px] mx-auto block hover:bg-blue-700 text-white text-sm font-semibold py-2.5 sm:py-2 px-12 rounded-3xl focus:outline-none focus:shadow-outline shadow-lg cursor-pointer" 
									type="submit">
									Login
								</button>
							</div>
						</form>
					</div>
					<div className="w-full lg:w-2/5 xl:w-1/2 bg-[#133138] relative flex flex-col justify-center items-center p-8 sm:p-10 md:p-12 lg:rounded-r-2xl lg:rounded-l-none lg:rounded-b-none text-center lg:text-left">
						<div className="absolute inset-0 flex justify-center items-center">
							<h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold opacity-10 text-center mb-10 sm:mb-16 lg:mb-20">
								Hello
							</h1>
						</div>
						<div className="relative z-10 text-center">
							<h1 className="text-white text-2xl sm:text-3xl font-bold mb-1">
								Hello !
							</h1>
							<h2 className="text-white text-base sm:text-lg font-medium">
								Selamat datang di Sistem Pengajuan Cuti
							</h2>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
