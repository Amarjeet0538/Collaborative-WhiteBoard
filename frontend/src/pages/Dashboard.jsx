import { Search, Plus, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import Card from "../components/Card";
export default function Dashboard() {
  const { register, handleSubmit } = useForm();

  const onSubmit = () => {};

  return (
    <div className="flex flex-col min-h-screen p-5  bg-(--bg-dark) text-(--text)">
      {/*header*/}
      <div className="flex justify-between p-4 rounded-lg bg-(--bg) shadow-sm">
        <div className="font-heading text-4xl font-bold flex items-center">
          Colloard<span className="text-primary">.</span>
        </div>

        <div className="flex gap-3">
          {/* dark mode */}
          <DarkModeToggle />

          <button className=" rounded-full cursor-pointer p-3 hover:bg-(--bg-light) transition-all hover:shadow-md">
            <Bell className="hover:text-primary" />
          </button>

          <button className="border-none rounded-full cursor-pointer p-3  hover:bg-(--bg-light) transition-all hover:shadow-md">
            <User className="hover:text-primary" />
          </button>
        </div>
      </div>

      {/*main page*/}
      <div className="flex flex-col items-center pt-5 font-body ">
        {/*new and join */}
        <div className="flex gap-5 w-1/2">
          {/*new*/}
          <div
            className="flex flex-col gap-3 w-1/2 h-70 bg-(--bg) hover:bg-(--bg-light) justify-center items-center rounded-md
            hover:bg-dark transition-all  border border-muted hover:border-border  cursor-pointer hover:text-primary shadow-sm
          "
          >
            <Plus size={50} strokeWidth={2} />
            <span className="text-xl font-semibold"> New Whiteboard </span>
          </div>

          {/*join*/}
          <div
            className="flex flex-col  w-1/2 h-70  bg-(--bg) hover:bg-(--bg-light)  justify-center items-center rounded-md
            hover:bg-dark transition-all  border border-muted hover:border-border cursor-pointer  shadow-sm"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3 "
            >
              <input
                {...register("joiningCode")}
                type="text"
                required
                className="border rounded-md p-2 bg-(--bg-light) focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Enter the code or Link"
              />
              <button>Join Board</button>
            </form>
          </div>
        </div>
        {/* search and recent*/}
        <div className="mt-8 w-3/4 flex flex-col gap-5">
          <span className="text-3xl font-heading font-bold">
            My WhiteBoards
          </span>
          {/*search*/}
          <form className="flex justify-between relative bg-(--bg) w-full p-5 rounded-lg">
            <div className="w-1/3">
              <Search className="absolute left-7 top-9" />
              <input
                {...register("boardName")}
                type="text"
                className="border bg-(--bg) rounded-md pl-10 p-4 w-full 
                ring-(--border-muted)
                focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Search WhiteBoards..."
              />
            </div>
            <div className="flex gap-5">
              <input
                {...register("date")}
                type="date"
                className="border rounded-md p-5 bg-(--bg) focus:ring-2
                focus:ring-black focus:outline-none"
              />

              <select
                {...register("filters")}
                className="border rounded-md p-5 bg-(--bg) focus:ring-2
                focus:ring-black focus:outline-none"
              >
                <option value="recent">Recents</option>
                <option value="a-z">Alphabetically (A-Z)</option>
                <option value="z-a">Alphabetically (Z-A)</option>
              </select>
            </div>
          </form>

          {/*recents*/}
          <div className="mt-5 flex gap-2 ">
            <Card
              text={"Creating Nuclear Bomb"}
              time="Last updated 2 min ago"
            />
            <Card text={"How to bomb Iran"} time={"Last updated 5 min ago"} />
            <Card
              text={"Creating Nuclear Bomb"}
              time="Last updated 2 min ago"
            />
            <Card text={"How to bomb Iran"} time={"Last updated 5 min ago"} />
            <Card text={"100 ways to die"} time={"Last updated 10 min ago"} />
            <Card
              text={"Creating Nuclear Bomb"}
              time="Last updated 2 min ago"
            />
          </div>
        </div>
        {/*my boards and shared with me */}
        <div></div>
      </div>
    </div>
  );
}
