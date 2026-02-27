import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import LiquidWarp from "@/components/ui/background/LiquidWarp";
// import { supabase } from "@/lib/supabase";

export default function Signup() {
	const { register, handleSubmit } = useForm();

	const signUp = async (fullname, email, password) => {
		const { data, error } = await supabase.auth.signUp({
			fullname,
			email,
			password,
		});

		if (error) console.log(error.message);
		else console.log(data);
	};

	const onSubmit = (data) => {
		signUp(data.name, data.email, data.password);
	};

	return (
		<div className="font-body grid grid-cols-2 h-screen">
			<div className="relative">
				<LiquidWarp
					speed={0.003}
					warpIntensity={1.5}
					warpFrequency={10}
					iterations={10}
					colorSpeed={0.1}
					colorOffsetR={0}
					colorOffsetG={2}
					colorOffsetB={4}
					brightness={0.5}
					saturation={0.5}
					zoom={1}
				/>
			</div>
			<div className="min-h-screen flex flex-col items-center justify-center oklch(98.8% 0.003 106.5)">
				{/* <div className="grid  grid-rows gap-8">
        <div className="flex  justify-center">
         <div className="text-2xl font-bold">Welcome Back</div>

        <div className="text-xl ">Enter your email to sign in to your account</div>
        </div> */}
				<div className="text-3xl  font-bold ">Create your account </div>

				<div className="text-base/loose tracking-wide font-sans font-medium pb-8 ">
					Get Started with a free account
				</div>

				<div className="bg-white p-8 rounded-xl shadow-lg border border-black/10 w-110 ">
					{/* 2 buttons */}
					<div className="grid grid-cols-2 gap-4 mb-6">
						<button className="  cursor-pointer flex gap-4  items-center justify-center border p-3 border-black/10  rounded-md">
							{/* Google */}
							<svg viewBox="0 0 32 32" className="h-5 w-5 ">
								<path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
							</svg>
							Google
						</button>
						<button className=" cursor-pointer flex gap-4 items-center justify-center border p-3 border-black/10  rounded-md">
							{/* GitHub */}
							<svg viewBox="0 0 32 32" className="h-5 w-5 ">
								<path d="M16 0.396c-8.839 0-16 7.167-16 16 0 7.073 4.584 13.068 10.937 15.183 0.803 0.151 1.093-0.344 1.093-0.772 0-0.38-0.009-1.385-0.015-2.719-4.453 0.964-5.391-2.151-5.391-2.151-0.729-1.844-1.781-2.339-1.781-2.339-1.448-0.989 0.115-0.968 0.115-0.968 1.604 0.109 2.448 1.645 2.448 1.645 1.427 2.448 3.744 1.74 4.661 1.328 0.14-1.031 0.557-1.74 1.011-2.135-3.552-0.401-7.287-1.776-7.287-7.907 0-1.751 0.62-3.177 1.645-4.297-0.177-0.401-0.719-2.031 0.141-4.235 0 0 1.339-0.427 4.4 1.641 1.281-0.355 2.641-0.532 4-0.541 1.36 0.009 2.719 0.187 4 0.541 3.043-2.068 4.381-1.641 4.381-1.641 0.859 2.204 0.317 3.833 0.161 4.235 1.015 1.12 1.635 2.547 1.635 4.297 0 6.145-3.74 7.5-7.296 7.891 0.556 0.479 1.077 1.464 1.077 2.959 0 2.14-0.020 3.864-0.020 4.385 0 0.416 0.28 0.916 1.104 0.755 6.4-2.093 10.979-8.093 10.979-15.156 0-8.833-7.161-16-16-16z" />
							</svg>
							Github
						</button>
					</div>

					<div className="my-6 flex items-center">
						{/* <!-- Left Line --> */}
						<div className="grow border-t border-gray-300"></div>

						{/* <!-- Text --> */}
						<span className="mx-2 shrink text-xs text-gray-500">
							OR CONTINUE WITH
						</span>

						{/* <!-- Right Line --> */}
						<div className="grow border-t border-gray-300"></div>
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="mb-4">
							<label className="block mb-2 text-sm font-normal">
								Full Name
							</label>
							<input
								{...register("name")}
								type="text"
								required
								className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black focus:outline-none"
								placeholder="Maxwell Pandey"
							/>
						</div>

						<div className="mb-4">
							<label className="block mb-2 text-sm font-normal">
								Email address
							</label>
							<input
								{...register("email")}
								type="email"
								required
								className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black focus:outline-none"
								placeholder="name@example.com"
							/>
						</div>

						<div className="mb-6">
							<div className="flex justify-between items-center mb-2">
								<label className=" mb-2 text-sm font-normal ">Password</label>
							</div>

							<input
								{...register("password")}
								type="password"
								required
								className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black focus:outline-none"
								placeholder="Enter your password"
							/>
						</div>

						<button
							type="submit"
							className="w-full  cursor-pointer bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700"
						>
							Sign Up
						</button>
					</form>

					<Button variant="outline" className=" cursor-pointer w-full mt-4">
						Use a Demo Account
					</Button>
				</div>
				<div className="mt-4 text-sm">
					Already have an account?{" "}
					<Link to="/login" className="text-gray-800 hover:underline">
						Sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
