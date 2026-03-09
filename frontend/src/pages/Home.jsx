import { Search, Plus, Bell, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { User } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import Card from "../components/Card";
import Logo from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";
export default function Home() {
  const { register, handleSubmit, setValue, control } = useForm();
  const navigate = useNavigate();
  const [startDate, endDate] = useWatch({
    control,
    name: ["startDate", "endDate"],
  });

  const hasDateFilter = startDate || endDate;
  const onSubmitJoiningCode = () => {};

  return (
    <div className="flex flex-col min-h-screen p-3 bg-background-muted  text-(--text)">
      {/*header*/}
      <div className="flex justify-between p-2 rounded-lg bg-background shadow-sm">
        <Logo />

        <div className="flex gap-3">
          {/* dark mode */}
          <DarkModeToggle />

          <button className=" rounded-full text-foreground cursor-pointer p-3 transition-all hover:shadow-md">
            <Bell className="hover:text-primary" />
          </button>

          <button className=" rounded-full text-foreground cursor-pointer p-3 transition-all hover:shadow-md">
            <User className="hover:text-primary" />
          </button>
        </div>
      </div>

      {/*main page*/}
      <div className="flex flex-col items-center pt-5 font-body ">
        {/*new and join */}
        <div className="flex gap-5 w-1/2">
          {/*new*/}
          <button
            className="flex flex-col gap-3 w-1/2 h-70 bg-background hover:bg-background-highlight
            justify-center items-center rounded-md transition-all border border-border-muted/60 
            hover:border-border/70 cursor-pointer hover:text-primary shadow-sm text-foreground "
            onClick={() => navigate("/project")}
          >
            <Plus size={50} strokeWidth={2} />
            <span className="text-xl font-semibold"> New Whiteboard </span>
          </button>

          {/*join*/}
          <div
            className="flex flex-col  w-1/2 h-70 bg-background hover:bg-background-highlight 
            justify-center items-center rounded-md hover:bg-dark transition-all cursor-pointer  
            border border-border-muted/60 hover:border-border/70 shadow-sm text-foreground"
          >
            <form
              onSubmit={handleSubmit(onSubmitJoiningCode)}
              className="flex flex-col gap-3 "
            >
              <input
                {...register("joiningCode")}
                type="text"
                required
                className="border border-border-muted/50 rounded-md p-3 bg-background focus:bg-background-highlight
                text-lg ring-foreground-muted focus:ring-1 focus:ring-border focus:outline-none"
                placeholder="Enter the code or Link"
              />
              <button className="bg-primary p-2 text-md rounded-md hover:bg-primary-hover text-background cursor-pointer">
                Join Board
              </button>
            </form>
          </div>
        </div>
        {/* search and recent*/}
        <div className="mt-8 w-3/4 flex flex-col gap-5">
          <span className="text-3xl font-heading text-foreground font-bold">
            My WhiteBoards
          </span>
          {/*search*/}
          <form className="flex justify-between relative bg-background w-full p-2 text-foreground rounded-lg shadow-sm">
            <div className="w-1/3">
              <Search size={20} className="absolute left-4 top-4" />
              <input
                {...register("boardName")}
                type="text"
                className="border rounded-md pl-10 p-1 w-full bg-background
                text-lg border-border-muted focus:ring-1
                focus:ring-border focus:outline-none"
                placeholder="Search WhiteBoards..."
              />
            </div>
            <div className="flex gap-5">
              {/*  <input
                {...register("date")}
                type="date"
                className="border rounded-md p-3 bg-background text-lg focus:ring-1 border-border-muted 
                focus:ring-border focus:outline-none"
              />*/}
              <div className="flex items-center bg-background border border-border-muted rounded-md px-2 focus-within:ring-1 focus-within:border-border focus-within:ring-border transition-all">
                {/* Start Date */}
                <input
                  {...register("startDate")}
                  type="date"
                  className="bg-transparent border-none p-2 text-foreground focus:outline-none cursor-pointer "
                  title="Start Date"
                />

                <span className="text-foreground-muted px-1">to</span>

                {/* End Date */}
                <input
                  {...register("endDate")}
                  type="date"
                  className="bg-transparent border-none p-2 text-foreground focus:outline-none cursor-pointer "
                  title="End Date"
                />

                {/* "All Dates" Clear Button - Only shows if a date is picked */}
                {hasDateFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue("startDate", "");
                      setValue("endDate", "");
                    }}
                    className="p-1.5 ml-1 text-foreground-muted hover:text-danger hover:bg-background-highlight rounded-md transition-colors"
                    title="Clear dates (Show All)"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <select
                {...register("filters")}
                className="border rounded-md p-2 bg-background focus:ring-1 border-border-muted 
                focus:ring-border focus:outline-none"
              >
                <option value="recent">Recents</option>
                <option value="a-z">Alphabetically (A-Z)</option>
                <option value="z-a">Alphabetically (Z-A)</option>
              </select>
            </div>
          </form>

          {/*recents*/}
          <div
            className="mt-5 grid grid-cols-4 gap-4 pb-4 w-full snap-x snap-mandatory
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <Card
              text={"Creating Nuclear Bomb"}
              time={"Last updated 2 min ago"}
            />
            <Card text={"How to bomb Iran"} time={"Last updated 5 min ago"} />
            <Card text={"How to bomb Iran"} time={"Last updated 5 min ago"} />
            <Card text={"How to bomb Iran"} time={"Last updated 5 min ago"} />
            <Card text={"How to bomb Iran"} time={"Last updated 5 min ago"} />
            <Card
              text={"Creating Nuclear Bomb"}
              time="Last updated 2 min ago"
            />
            <Card text={"How to bomb Iran"} time={"Last updated 5 min ago"} />
            <Card text={"100 ways to die"} time={"Last updated 10 min ago"} />
            <Card
              text={"Creating Nuclear Bomb"}
              time={"Last updated 2 min ago"}
            />
          </div>
        </div>
        {/*my boards and shared with me */}
        <div></div>

        <div className="flex-1 text-foreground  min-h-0">
          <Link to="/">Go to Landing page </Link>
        </div>
      </div>
    </div>
  );
}
