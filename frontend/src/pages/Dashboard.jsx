import { Search, Plus, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Dashboard() {
  const { register, handleSubmit } = useForm();

  const onSubmit = () => {};

  return (
    <div className="flex flex-col min-h-screen p-5  bg-(--bg-dark) text-(--text)">
      {/*header*/}
      <div className="flex justify-between p-4 rounded-xl bg-(--bg) ">
        <div className="font-heading ">
          Colloard<span className="text-green-500">.</span>
        </div>

        <div className="flex gap-5">
          {/* dark mode */}
          <DarkModeToggle />

          <button className="border-none rounded-full cursor-pointer">
            <Bell />
          </button>

          <button className="border-none rounded-full cursor-pointer">
            <User />
          </button>
        </div>
      </div>

      {/*main page*/}
      <div className="flex flex-col items-center pt-5 font-body ">
        {/*new and join */}
        <div className="flex gap-5 w-1/2">
          {/*new*/}
          <div
            className="flex flex-col gap-3 w-1/2 h-70 bg justify-center items-center rounded-md
            hover:bg-dark transition-all hover:border hover:border-gray-200 cursor-pointer"
          >
            <Plus size={50} strokeWidth={2} />
            <span className="text-xl font-semibold"> New Whiteboard </span>
          </div>

          {/*join*/}
          <div
            className="flex flex-col  w-1/2 h-70  bg justify-center items-center rounded-md
            hover:bg-dark transition-all hover:border hover:border-gray-200 cursor-pointer"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3 "
            >
              <input
                {...register("joiningCode")}
                type="text"
                required
                className="border rounded-md p-2 focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Enter the code or Link"
              />
              <Button>Join Board</Button>
            </form>
          </div>
        </div>
        {/* search and recent*/}
        <div>
          {/*search*/}
          <div>
            <Search />
            <form>
              <input
                {...register("boardName")}
                type="text"
                className="border rounded-md p-2 focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Search WhiteBoards..."
              />
              <input
                {...register("date")}
                type="date"
                className="border rounded-md p-2 focus:ring-2
                focus:ring-black focus:outline-none"
              />
              <input
                {...register("date")}
                type="date"
                className="border rounded-md p-2 focus:ring-2
                focus:ring-black focus:outline-none"
              />
            </form>
          </div>

          {/*recents*/}
          <div>
            <div>
              <span>Name</span>
              <span>Last updated</span>
              <span>Peoples</span>
            </div>
          </div>
        </div>
        {/*my boards and shared with me */}
        <div></div>
      </div>
    </div>
  );
}
