import Card from '../Card';
import { useNavigate } from 'react-router-dom';

export default function BoardList({ boards, loading, onDelete, onRename }) {
  const navigate = useNavigate();

  if (loading) {
    return <p className="text-foreground-muted">Loading...</p>;
  }

  if (boards.length === 0) {
    return <p className="text-foreground-muted">No whiteboards yet!</p>;
  }

  return (
    <div
      className="mt-5 grid grid-cols-4 gap-4 pb-4 w-full snap-x snap-mandatory
      [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {boards.map((board) => (
        <Card
          key={board._id}
          text={board.name}
          time={`Last updated ${new Date(board.updatedAt).toLocaleDateString()}`}
          onClick={() => navigate(`/whiteboard/${board._id}`)}
          onDelete={(e) => onDelete(board._id, e)}
          onRename={(newName) => onRename(board._id, newName)}
        />
      ))}
    </div>
  );
}