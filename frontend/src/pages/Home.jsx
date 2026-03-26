import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth.js';
import { whiteboardApi } from '../api/whiteboard.api.js';
import Header from '../components/layout/Header';
import BoardList from '../components/home/BoardList';
import BoardFilters from '../components/home/BoardFilters';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [whiteboards, setWhiteboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleSubmit, register } = useForm();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await whiteboardApi.getAll();
        setWhiteboards(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const handleNewWhiteboard = async () => {
    try {
      const data = await whiteboardApi.create('Untitled');
      navigate(`/whiteboard/${data._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBoard = async (id, e) => {
    e.stopPropagation();
    try {
      await whiteboardApi.remove(id);
      setWhiteboards((prev) => prev.filter((wb) => wb._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameBoard = async (id, newName) => {
    try {
      await whiteboardApi.update(id, { name: newName });
      setWhiteboards((prev) =>
        prev.map((wb) => (wb._id === id ? { ...wb, name: newName } : wb))
      );
    } catch (err) {
      console.error('Failed to rename:', err);
    }
  };

  const onSubmitJoinCode = (data) => {
    const input = data.joiningCode?.trim() || '';
    const code = input.startsWith('http') ? input.split('/join/')[1] : input;
    if (code) navigate(`/join/${code}`);
  };

  return (
    <div className="flex flex-col min-h-screen p-3 bg-background-muted">
      <Header />
      <div className="flex flex-col items-center pt-5 font-body">
        {/* New and Join */}
        <div className="flex gap-5 w-1/2">
          <button
            className="flex flex-col gap-3 w-1/2 h-70 bg-background hover:bg-background-highlight justify-center items-center rounded-md transition-all border border-border-muted/60 hover:border-border/70 cursor-pointer hover:text-primary shadow-sm text-foreground"
            onClick={handleNewWhiteboard}
          >
            <Plus size={50} strokeWidth={2} />
            <span className="text-xl font-semibold">New Whiteboard</span>
          </button>
          <div className="flex flex-col w-1/2 h-70 bg-background hover:bg-background-highlight justify-center items-center rounded-md hover:bg-dark transition-all cursor-pointer border border-border-muted/60 hover:border-border/70 shadow-sm text-foreground">
            <form onSubmit={handleSubmit(onSubmitJoinCode)} className="flex flex-col gap-3">
              <input
                {...register('joiningCode')}
                type="text"
                required
                className="border border-border-muted/50 rounded-md p-3 bg-background focus:bg-background-highlight text-lg ring-foreground-muted focus:ring-1 focus:ring-border focus:outline-none"
                placeholder="Enter the code or Link"
              />
              <button className="bg-primary p-2 text-md rounded-md hover:bg-primary-hover text-background cursor-pointer">
                Join Board
              </button>
            </form>
          </div>
        </div>

        {/* My Whiteboards */}
        <div className="mt-8 w-3/4 flex flex-col gap-5">
          <span className="text-3xl font-heading text-foreground font-bold">
            My WhiteBoards
          </span>
          <BoardFilters />
          <BoardList
            boards={whiteboards}
            loading={loading}
            onDelete={handleDeleteBoard}
            onRename={handleRenameBoard}
          />
        </div>
      </div>
    </div>
  );
}