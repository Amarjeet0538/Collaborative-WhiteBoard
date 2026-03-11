import { Search, Plus, Bell, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { User } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import Card from "../components/Card";
import Logo from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useEffect } from "react";

import { apiFetch } from "@/utils/api";
export default function Home() {
  const { register, handleSubmit, setValue, control } = useForm();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [startDate, endDate] = useWatch({
    control,
    name: ["startDate", "endDate"],
  });

  const hasDateFilter = startDate || endDate;
  const onSubmitJoiningCode = () => {};

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // inside component, replace useState for whiteboards
  const [whiteboards, setWhiteboards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(true);

  // fetch on mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await apiFetch("/whiteboards");
        setWhiteboards(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBoards(false);
      }
    };
    fetchBoards();
  }, []);

  // create new whiteboard
  const handleNewWhiteboard = async () => {
    try {
      const data = await apiFetch("/whiteboards", {
        method: "POST",
        body: JSON.stringify({ name: "Untitled" }),
      });
      navigate(`/whiteboard/${data._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWhiteboard = async (id, e) => {
    e.stopPropagation();
    try {
      await apiFetch(`/whiteboards/${id}`, { method: "DELETE" });
      setWhiteboards((prev) => prev.filter((wb) => wb._id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  const handleRenameWhiteboard = async (id, newName) => {
    try {
      await apiFetch(`/whiteboards/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: newName }),
      });
      setWhiteboards((prev) =>
        prev.map((wb) => (wb._id === id ? { ...wb, name: newName } : wb)),
      );
    } catch (err) {
      console.error("Failed to rename", err);
    }
  };

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

          <nav>
            {user ? (
              <div className="flex items-center gap-3 relative group cursor-pointer">
                <button
                  className=" rounded-full text-foreground cursor-pointer p-3 transition-all hover:shadow-md"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <User className="hover:text-primary" />
                </button>
                {isOpen && (
                  <div
                    className="absolute top-full right-0 z-20 w-40 text-center p-5 border border-border-muted 
                    rounded-md bg-background text-foreground mt-2 shadow-lg"
                  >
                    <p className="cursor-pointer text-sm">{user.name}</p>
                    <hr className="my-2 border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="py-2 px-1 w-full hover:bg-red-500 hover:text-white rounded-md text-sm cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="border border-border-muted py-2 px-4 rounded-md bg-primary cursor-pointer text-background hover:bg-background hover:text-primary hover:border-primary transition-all"
              >
                Login
              </button>
            )}
          </nav>
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
            onClick={handleNewWhiteboard}
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
            {loadingBoards ? (
              <p className="text-foreground-muted">Loading...</p>
            ) : whiteboards.length === 0 ? (
              <p className="text-foreground-muted">No whiteboards yet!</p>
            ) : (
              whiteboards.map((wb) => (
                <Card
                  key={wb._id}
                  text={wb.name}
                  time={`Last updated ${new Date(wb.updatedAt).toLocaleDateString()}`}
                  onClick={() => navigate(`/whiteboard/${wb._id}`)}
                  onDelete={(e) => handleDeleteWhiteboard(wb._id, e)}
                  onRename={(newName) =>
                    handleRenameWhiteboard(wb._id, newName)
                  }
                />
              ))
            )}
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
