export default function Login() {
	return (
		<div className="grid grid-cols-2 h-screen">
			<div className="flex  bg-black min-sm:"></div>
			<div className="min-h-screen flex flex-col items-center justify-center oklch(98.8% 0.003 106.5)">
				{/* <div className="grid  grid-rows gap-8">
        <div className="flex  justify-center">
         <div className="text-2xl font-bold">Welcome Back</div>

        <div className="text-xl ">Enter your email to sign in to your account</div>
        </div> */}
				<div className="text-3xl font-bold p-2">Welcome Back</div>
				<div className="text-base/loose tracking-wide font-sans font-light pb-8 ">
					Enter your email to sign in to your account
				</div>

				<div className="bg-white p-8 rounded-xl shadow-lg border border-black/10 w-110 h-105">
					{/* 2 buttons */}
					<div className="grid grid-cols-2 gap-4 mb-6">
						<button className="border p-3 border-black/10  rounded-md">
							Google
						</button>
						<button className="border p-3 border-black/10  rounded-md">
							Github
						</button>
					</div>

					<div className="my-6 flex items-center">
						{/* <!-- Left Line --> */}
						<div className="grow border-t border-gray-300"></div>

						{/* <!-- Text --> */}
						<span className="mx-2 shrink text-sm text-gray-500">
							OR CONTINUE WITH
						</span>

						{/* <!-- Right Line --> */}
						<div className="grow border-t border-gray-300"></div>
					</div>

					<div className="mb-4">
						<label className="block mb-2 text-sm font-normal">
							Email address
						</label>
						<input
							type="email"
							className="w-full border rounded-md p-2"
							placeholder="name@example.com"
						/>
					</div>

					<div className="mb-6">
						<div className="flex justify-between items-center mb-2">
							<label className=" mb-2 text-sm font-normal ">Password</label>
							<a
								href="#"
								className="text-xs mb-2 text-gray-600 hover:underline"
							>
								Forget password?
							</a>
						</div>

						<input
							type="password"
							className="w-full border rounded-md p-2"
							placeholder="Enter your password"
						/>
					</div>

					<button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700">
						Sign In
					</button>
				</div>
				<div className="mt-4 text-sm">
					Don't have an account?{" "}
					<a href="/signup" className="text-gray-800 hover:underline">
						Sign up
					</a>
				</div>
			</div>
		</div>
	);
}
